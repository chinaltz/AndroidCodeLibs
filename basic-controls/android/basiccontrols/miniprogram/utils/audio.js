let outputConfigured = false;
let outputConfigurePromise = null;

/** 本地资源（音标/拼音）每次独立播放，避免跨页面串音 */
let localPlayGeneration = 0;

/** 听写 TTS 在用户点击时预热，单独持有上下文 */
let dictationPlayer = null;
let dictationPlayGeneration = 0;

function isAndroid() {
  try {
    const info = wx.getSystemInfoSync();
    return String(info.platform || '').toLowerCase() === 'android';
  } catch (err) {
    return false;
  }
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

function bindPlayHandlers(ctx, gen, getGeneration, onDone, options) {
  const destroyOnFinish = !(options && options.keepAlive);
  let settled = false;
  let started = false;
  const timers = [];

  const clearTimers = () => {
    while (timers.length) clearTimeout(timers.pop());
  };

  const cleanup = () => {
    clearTimers();
    try { ctx.stop(); } catch (e) { /* noop */ }
    if (destroyOnFinish) {
      try { ctx.destroy(); } catch (e) { /* noop */ }
    }
  };

  const finish = (ok, err) => {
    if (settled || gen !== getGeneration()) return;
    settled = true;
    cleanup();
    onDone(ok, err);
  };

  const tryStart = () => {
    if (started || settled || gen !== getGeneration()) return;
    started = true;
    clearTimers();
    try {
      ctx.play();
    } catch (err) {
      finish(false, err);
    }
  };

  ctx.onCanplay(tryStart);
  ctx.onEnded(() => finish(true));
  ctx.onError((err) => finish(false, err));

  const delay = isAndroid() ? 300 : 800;
  timers.push(setTimeout(tryStart, delay));
  if (isAndroid()) timers.push(setTimeout(tryStart, 1000));

  return { finish, cleanup, tryStart, clearTimers };
}

function playLocal(path, label) {
  localPlayGeneration += 1;
  const gen = localPlayGeneration;
  const src = normalizePlayPath(path);

  return configureOutput().then(() => new Promise((resolve, reject) => {
    const ctx = createPlayer();
    bindPlayHandlers(ctx, gen, () => localPlayGeneration, (ok, err) => {
      if (ok) resolve();
      else {
        const errMsg = err && (err.errMsg || err.message);
        reject(new Error(errMsg || (label ? `${label} 播放失败` : '播放失败')));
      }
    });
    ctx.src = src;
  }));
}

function primeFromUserGesture() {
  configureOutput();
  if (dictationPlayer) {
    try { dictationPlayer.stop(); } catch (e) { /* noop */ }
    try { dictationPlayer.destroy(); } catch (e) { /* noop */ }
    dictationPlayer = null;
  }
  dictationPlayer = createPlayer();
  dictationPlayGeneration += 1;
}

function resetPlayer() {
  dictationPlayGeneration += 1;
  if (dictationPlayer) {
    try { dictationPlayer.stop(); } catch (e) { /* noop */ }
    try { dictationPlayer.destroy(); } catch (e) { /* noop */ }
    dictationPlayer = null;
  }
}

function playDictation(path, label) {
  dictationPlayGeneration += 1;
  const gen = dictationPlayGeneration;
  const src = normalizePlayPath(path);

  return configureOutput().then(() => new Promise((resolve, reject) => {
    if (!dictationPlayer) dictationPlayer = createPlayer();
    const ctx = dictationPlayer;
    bindPlayHandlers(ctx, gen, () => dictationPlayGeneration, (ok, err) => {
      if (ok) resolve();
      else {
        const errMsg = err && (err.errMsg || err.message);
        reject(new Error(errMsg || (label ? `${label} 播放失败` : '播放失败')));
      }
    }, { keepAlive: true });
    try { ctx.stop(); } catch (e) { /* noop */ }
    ctx.src = src;
  }));
}

/** 本地 MP3（音标/拼音） */
function play(path, label) {
  return playLocal(path, label);
}

const PHONICS_AUDIO_ROOT = '/packages/phonics-media/assets/audio';

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
  play,
  playDictation,
  phonemePath,
  wordPath,
  pinyinTeachingPath,
  pinyinSyllablePath,
};
