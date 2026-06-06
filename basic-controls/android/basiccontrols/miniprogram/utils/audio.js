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

function play(path, label) {
  return new Promise((resolve, reject) => {
    configureOutput().then(() => {
      if (player) {
        try { player.stop(); } catch (e) { /* noop */ }
        player.destroy();
        player = null;
      }
      player = wx.createInnerAudioContext();
      player.src = path;
      player.onEnded(() => {
        player.destroy();
        player = null;
        resolve();
      });
      player.onError((err) => {
        player.destroy();
        player = null;
        reject(err || new Error(label || 'play failed'));
      });
      player.play();
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
  play,
  phonemePath,
  wordPath,
  pinyinTeachingPath,
  pinyinSyllablePath,
};
