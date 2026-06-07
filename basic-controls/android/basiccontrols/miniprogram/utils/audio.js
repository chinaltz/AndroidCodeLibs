let outputConfigured = false;
let outputConfigurePromise = null;

const PLAY_CANCELLED = 'PLAY_CANCELLED';

/** 音标/拼音/录音 — 单通道，新播必停旧播 */
let localPlayer = null;
let localSession = null;
let localPlayGeneration = 0;

/** 听写 TTS — 独立通道 */
let dictationPlayer = null;
let dictationSession = null;
let dictationPlayGeneration = 0;

function isAndroid() {
  try {
    const info = wx.getSystemInfoSync();
    return String(info.platform || '').toLowerCase() === 'android';
  } catch (err) {
    return false;
  }
}

function isPlayCancelled(err) {
  if (!err) return false;
  return err.code === PLAY_CANCELLED || err.message === PLAY_CANCELLED;
}

function configureOutput() {
  if (outputConfigured || typeof wx.setInnerAudioOption !== 'function') {
    return Promise.resolve();
  }
  if (outputConfigurePromise) {
    return outputConfigurePromise;
  }

  outputConfigurePromise = new Promise((resolve) => {
    wx.setInnerAudioOption({
      speakerOn: true,
      obeyMuteSwitch: false,
      mixWithOther: true,
      success: () => {
        outputConfigured = true;
        resolve();
      },
      fail: () => {
        wx.setInnerAudioOption({
          obeyMuteSwitch: false,
          mixWithOther: true,
          complete: () => {
            outputConfigured = true;
            resolve();
          },
        });
      },
    });
  });
  return outputConfigurePromise;
}

function createPlayer() {
  const ctx = wx.createInnerAudioContext();
  ctx.obeyMuteSwitch = false;
  if (typeof ctx.volume === 'number') ctx.volume = 1;
  return ctx;
}

function normalizePlayPath(path) {
  return String(path || '').trim();
}

function offHandler(ctx, event, handler) {
  if (!ctx || !handler) return;
  const off = ctx[`off${event}`];
  if (typeof off === 'function') {
    try { off.call(ctx, handler); } catch (e) { /* noop */ }
  }
}

function clearSessionTimers(session) {
  if (!session || !session.timers) return;
  while (session.timers.length) clearTimeout(session.timers.pop());
}

function unbindSession(ctx, session) {
  if (!ctx || !session || !session.handlers) return;
  offHandler(ctx, 'Canplay', session.handlers.onCanplay);
  offHandler(ctx, 'Ended', session.handlers.onEnded);
  offHandler(ctx, 'Error', session.handlers.onError);
  offHandler(ctx, 'Stop', session.handlers.onStop);
}

function settleSession(session, ok, err) {
  if (!session || session.settled) return;
  session.settled = true;
  clearSessionTimers(session);
  const onDone = session.onDone;
  session.onDone = null;
  if (typeof onDone === 'function') {
    onDone(ok, err);
  }
}

function destroyPlayer(ctx) {
  if (!ctx) return;
  try { ctx.stop(); } catch (e) { /* noop */ }
  try { ctx.destroy(); } catch (e) { /* noop */ }
}

function stopLocalPlayback(silent) {
  localPlayGeneration += 1;
  if (localSession) {
    const session = localSession;
    localSession = null;
    unbindSession(localPlayer, session);
    clearSessionTimers(session);
    if (silent && session.onDone) {
      session.onDone(true, { code: PLAY_CANCELLED, message: PLAY_CANCELLED });
    } else {
      settleSession(session, false, { code: PLAY_CANCELLED, message: PLAY_CANCELLED });
    }
  }
  if (localPlayer) {
    destroyPlayer(localPlayer);
    localPlayer = null;
  }
}

function stopDictationPlayback(silent) {
  dictationPlayGeneration += 1;
  if (dictationSession) {
    const session = dictationSession;
    dictationSession = null;
    unbindSession(dictationPlayer, session);
    clearSessionTimers(session);
    if (silent && session.onDone) {
      session.onDone(true, { code: PLAY_CANCELLED, message: PLAY_CANCELLED });
    } else {
      settleSession(session, false, { code: PLAY_CANCELLED, message: PLAY_CANCELLED });
    }
  }
  if (dictationPlayer) {
    destroyPlayer(dictationPlayer);
    dictationPlayer = null;
  }
}

function startPlayback(ctx, src, gen, getGeneration, onDone, options) {
  const session = {
    gen,
    settled: false,
    timers: [],
    handlers: {},
    onDone,
  };

  const finish = (ok, err) => {
    if (session.settled) return;
    const superseded = gen !== getGeneration();
    session.settled = true;
    clearSessionTimers(session);
    unbindSession(ctx, session);
    if (options && options.destroyOnFinish) {
      destroyPlayer(ctx);
    } else {
      try { ctx.stop(); } catch (e) { /* noop */ }
    }
    if (!superseded && typeof onDone === 'function') {
      onDone(ok, err);
    }
  };

  let started = false;
  const tryStart = () => {
    if (started || session.settled || gen !== getGeneration()) return;
    started = true;
    clearSessionTimers(session);
    try {
      ctx.play();
    } catch (err) {
      finish(false, err);
    }
  };

  session.handlers.onCanplay = () => tryStart();
  session.handlers.onEnded = () => finish(true);
  session.handlers.onError = (err) => finish(false, err);
  session.handlers.onStop = () => {
    if (!session.settled && gen !== getGeneration()) {
      finish(true);
    }
  };

  ctx.onCanplay(session.handlers.onCanplay);
  ctx.onEnded(session.handlers.onEnded);
  ctx.onError(session.handlers.onError);
  ctx.onStop(session.handlers.onStop);

  try { ctx.stop(); } catch (e) { /* noop */ }
  ctx.src = src;

  const android = isAndroid();
  session.timers.push(setTimeout(tryStart, android ? 100 : 300));
  if (android) session.timers.push(setTimeout(tryStart, 700));

  return session;
}

function playOnChannel(channel, path, label) {
  const src = normalizePlayPath(path);
  if (!src) {
    return Promise.reject(new Error(label ? `${label} 路径无效` : '播放路径无效'));
  }

  if (channel === 'local') {
    stopLocalPlayback(true);
    const gen = localPlayGeneration;
    localPlayer = createPlayer();

    return configureOutput().then(() => new Promise((resolve, reject) => {
      if (gen !== localPlayGeneration) {
        resolve();
        return;
      }

      localSession = startPlayback(
        localPlayer,
        src,
        gen,
        () => localPlayGeneration,
        (ok, err) => {
          localSession = null;
          if (gen !== localPlayGeneration) {
            resolve();
            return;
          }
          if (ok || isPlayCancelled(err)) {
            resolve();
            return;
          }
          const errMsg = err && (err.errMsg || err.message);
          reject(new Error(errMsg || (label ? `${label} 播放失败` : '播放失败')));
        },
        { destroyOnFinish: true },
      );
    }));
  }

  stopDictationPlayback(true);
  const gen = dictationPlayGeneration;
  dictationPlayer = createPlayer();

  return configureOutput().then(() => new Promise((resolve, reject) => {
    if (gen !== dictationPlayGeneration) {
      resolve();
      return;
    }

    dictationSession = startPlayback(
      dictationPlayer,
      src,
      gen,
      () => dictationPlayGeneration,
      (ok, err) => {
        dictationSession = null;
        if (gen !== dictationPlayGeneration) {
          resolve();
          return;
        }
        if (ok || isPlayCancelled(err)) {
          resolve();
          return;
        }
        const errMsg = err && (err.errMsg || err.message);
        reject(new Error(errMsg || (label ? `${label} 播放失败` : '播放失败')));
      },
      { destroyOnFinish: true },
    );
  }));
}

function playLocal(path, label) {
  return playOnChannel('local', path, label);
}

function primeFromUserGesture() {
  configureOutput();
  stopDictationPlayback(true);
  dictationPlayer = createPlayer();
}

function resetPlayer() {
  stopDictationPlayback(true);
}

function playDictation(path, label) {
  return playOnChannel('dictation', path, label);
}

/** 停止教学类本地音频（音标/拼音/录音回放） */
function stopTeaching() {
  stopLocalPlayback(true);
}

/** 本地 MP3（音标/拼音） */
function play(path, label) {
  return playLocal(path, label);
}

const PHONICS_AUDIO_ROOT = '/packages/phonics-media/assets';

function phonemePath(id) {
  return `${PHONICS_AUDIO_ROOT}/phonemes/${id}.mp3`;
}

function wordPath(text) {
  return `${PHONICS_AUDIO_ROOT}/words/${String(text).toLowerCase()}.mp3`;
}

function pinyinTeachingPath(audioId) {
  return `/packages/pinyin/assets/audio/teaching/${audioId}.mp3`;
}

function pinyinSyllablePath(audioId) {
  return `/packages/pinyin/assets/audio/syllables/${audioId}.mp3`;
}

module.exports = {
  configureOutput,
  primeFromUserGesture,
  resetPlayer,
  stopTeaching,
  isPlayCancelled,
  play,
  playDictation,
  phonemePath,
  wordPath,
  pinyinTeachingPath,
  pinyinSyllablePath,
};
