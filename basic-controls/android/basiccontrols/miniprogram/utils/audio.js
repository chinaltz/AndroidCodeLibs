let player = null;

function play(path, label) {
  return new Promise((resolve, reject) => {
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
}

function phonemePath(id) {
  return `/assets/audio/phonemes/${id}.mp3`;
}

function wordPath(text) {
  return `/assets/audio/words/${String(text).toLowerCase()}.mp3`;
}

module.exports = { play, phonemePath, wordPath };
