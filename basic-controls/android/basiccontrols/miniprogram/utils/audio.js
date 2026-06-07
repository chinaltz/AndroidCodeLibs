let player = null;
let outputConfigured = false;
let outputConfigurePromise = null;

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
      success: () => {
        outputConfigured = true;
        resolve();
      },
      fail: () => {
        wx.setInnerAudioOption({
          obeyMuteSwitch: false,
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

function primeFromUserGesture() {
  configureOutput();
}

function play(path, label) {
  return new Promise((resolve, reject) => {
    configureOutput().then(() => {
      if (player) {
        try { player.stop(); } catch (e) { /* noop */ }
        try { player.destroy(); } catch (e) { /* noop */ }
        player = null;
      }

      const ctx = wx.createInnerAudioContext();
      player = ctx;
      let settled = false;
      let started = false;
      let fallbackTimer = null;

      const cleanup = () => {
        clearTimeout(fallbackTimer);
        if (ctx === player) player = null;
        try { ctx.destroy(); } catch (e) { /* noop */ }
      };

      const finish = (ok, err) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (ok) resolve();
        else reject(err || new Error(label || 'play failed'));
      };

      const tryStart = () => {
        if (started || settled) return;
        started = true;
        clearTimeout(fallbackTimer);
        try {
          ctx.play();
        } catch (err) {
          finish(false, err);
        }
      };

      ctx.onCanplay(tryStart);
      ctx.onEnded(() => finish(true));
      ctx.onError((err) => finish(false, err));
      ctx.src = path;

      // iOS 上偶发不触发 onCanplay，超时后兜底尝试 play
      fallbackTimer = setTimeout(tryStart, 2000);
    });
  });
}

function phonemePath(id) {
  return `/assets/audio/phonemes/${id}.mp3`;
}

function wordPath(text) {
  return `/assets/audio/words/${String(text).toLowerCase()}.mp3`;
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
  play,
  phonemePath,
  wordPath,
  pinyinTeachingPath,
  pinyinSyllablePath,
};
