const audio = require('../../utils/audio');
const tts = require('../../utils/tencent-tts');
const nav = require('../../utils/nav');

const DEFAULT_QUEUE = [
  { id: 'demo_1', text: '时候', sourceLabel: '一年级上 · 第二单元 · 第三课' },
  { id: 'demo_2', text: '慢慢', sourceLabel: '日常' },
  { id: 'demo_3', text: '游泳', sourceLabel: '日常' },
];

function normalizeQueue(queue) {
  const list = Array.isArray(queue) && queue.length ? queue : DEFAULT_QUEUE;
  return list.map((item, index) => ({
    id: item.id || `queue_${index}`,
    text: item.text || '',
    sourceLabel: item.sourceLabel || '日常',
  })).filter((item) => item.text);
}

function normalizeIntervalSeconds(value) {
  return Math.max(3, Math.min(30, Number(value) || 8));
}

function normalizeRepeatCount(value) {
  return Math.max(1, Math.min(5, Number(value) || 2));
}

Page({
  data: {
    theme: {},
    queue: DEFAULT_QUEUE,
    currentIndex: 0,
    currentText: '时候',
    intervalSeconds: 8,
    repeatCount: 2,
    playing: false,
    finished: false,
    hasConfig: false,
    configHint: '',
    statusText: '准备听写',
  },

  onLoad() {
    const storedQueue = wx.getStorageSync('dictation_queue') || [];
    const queue = normalizeQueue(storedQueue);
    this.setData({
      queue,
      currentText: queue[0] ? queue[0].text : '',
    });
  },

  onShow() {
    const app = getApp();
    const config = tts.getConfig();
    const hasConfig = !!(config.secretId && config.secretKey);
    this.setData({
      theme: app.globalData.theme,
      hasConfig,
      configHint: hasConfig
        ? ''
        : '听写播报需腾讯云 TTS：复制 config/tts.local.example.js 为 tts.local.js 并填入密钥；真机还需在小程序后台添加 request 域名 https://tts.tencentcloudapi.com',
      statusText: hasConfig ? this.data.statusText : 'TTS 未配置，无法播报',
    });
  },

  onBack() {
    nav.navigateBack();
  },

  onIntervalInput(e) {
    this.setData({ intervalSeconds: e.detail.value });
  },

  onIntervalBlur(e) {
    this.setData({ intervalSeconds: normalizeIntervalSeconds(e.detail.value) });
  },

  onRepeatInput(e) {
    this.setData({ repeatCount: e.detail.value });
  },

  onRepeatBlur(e) {
    this.setData({ repeatCount: normalizeRepeatCount(e.detail.value) });
  },

  playOne(e) {
    if (!this.data.hasConfig) {
      wx.showToast({ title: '请先配置 TTS 密钥', icon: 'none' });
      return;
    }
    audio.primeFromUserGesture();
    const index = Number(e.currentTarget.dataset.index || 0);
    this.playTextAt(index);
  },

  playTextAt(index) {
    if (!this.data.hasConfig) {
      wx.showToast({ title: '请先配置 TTS 密钥', icon: 'none' });
      return Promise.resolve();
    }
    audio.primeFromUserGesture();
    const item = this.data.queue[index];
    if (!item) return Promise.resolve();
    this.setData({
      currentIndex: index,
      currentText: item.text,
      statusText: `正在合成：${item.text}`,
    });
    return tts.synthesizeToTempFile(item.text).then((filePath) => {
      this.setData({ statusText: `正在播报：${item.text}` });
      return audio.playDictation(filePath, item.text);
    }).catch((err) => {
      wx.showToast({ title: err.message || '播报失败', icon: 'none' });
      this.setData({ statusText: 'TTS 失败，可先手动听写' });
    });
  },

  prepareAudioAt(index) {
    const item = this.data.queue[index];
    if (!item) return Promise.reject(new Error('听写词不存在'));
    this._audioCache = this._audioCache || {};
    if (this._audioCache[item.id]) return Promise.resolve(this._audioCache[item.id]);
    this.setData({
      currentIndex: index,
      currentText: item.text,
      statusText: `正在准备：${item.text}`,
    });
    return tts.synthesizeToTempFile(item.text).then((filePath) => {
      this._audioCache[item.id] = filePath;
      return filePath;
    });
  },

  playPreparedAt(index, filePath, playNo, repeatCount) {
    const item = this.data.queue[index];
    if (!item) return Promise.resolve();
    this.setData({
      currentIndex: index,
      currentText: item.text,
      statusText: `正在播报：${item.text}（${playNo}/${repeatCount}）`,
    });
    audio.primeFromUserGesture();
    return audio.playDictation(filePath, item.text);
  },

  cancelIntervalWait() {
    if (this._intervalTimer) {
      clearTimeout(this._intervalTimer);
      this._intervalTimer = null;
    }
    if (this._intervalResolve) {
      const resolve = this._intervalResolve;
      this._intervalResolve = null;
      resolve(false);
    }
  },

  waitInterval(seconds, runId) {
    return new Promise((resolve) => {
      if (!this.data.playing || this._dictationRunId !== runId) {
        resolve(false);
        return;
      }
      this._intervalResolve = resolve;
      this._intervalTimer = setTimeout(() => {
        this._intervalTimer = null;
        this._intervalResolve = null;
        resolve(this.data.playing && this._dictationRunId === runId);
      }, seconds * 1000);
    });
  },

  startQueue() {
    if (this.data.playing) return;
    if (!this.data.hasConfig) {
      wx.showToast({ title: 'TTS 未配置，无法开始听写', icon: 'none' });
      return;
    }
    audio.primeFromUserGesture();
    this.cancelIntervalWait();
    const runId = (this._dictationRunId || 0) + 1;
    const intervalSeconds = normalizeIntervalSeconds(this.data.intervalSeconds);
    const repeatCount = normalizeRepeatCount(this.data.repeatCount);
    this._dictationRunId = runId;
    this.setData({
      intervalSeconds,
      repeatCount,
      playing: true,
      finished: false,
      statusText: '听写开始',
    });
    this.runQueue({ runId, intervalSeconds, repeatCount }).then((completed) => {
      if (!completed || this._dictationRunId !== runId) return;
      this.setData({ playing: false, finished: true, statusText: '听写完成，可以开始批改' });
    });
  },

  goCorrection() {
    nav.navigateTo('/pages/dictation-correction/index');
  },

  stopQueue() {
    this._dictationRunId = (this._dictationRunId || 0) + 1;
    this.cancelIntervalWait();
    this.setData({ playing: false, statusText: '已暂停' });
  },

  onUnload() {
    this._dictationRunId = (this._dictationRunId || 0) + 1;
    this.cancelIntervalWait();
    this._audioCache = {};
    audio.resetPlayer();
  },

  runQueue(options) {
    const { runId, intervalSeconds, repeatCount } = options;
    const queueLength = this.data.queue.length;

    const step = (wordIndex, playNo) => {
      if (!this.data.playing || this._dictationRunId !== runId) {
        return Promise.resolve(false);
      }
      if (wordIndex >= queueLength) {
        return Promise.resolve(true);
      }

      return this.prepareAudioAt(wordIndex)
        .then((filePath) => this.playPreparedAt(wordIndex, filePath, playNo, repeatCount))
        .catch((err) => {
          wx.showToast({ title: err.message || '播报失败', icon: 'none' });
          return false;
        })
        .then((played) => {
          if (played === false || !this.data.playing || this._dictationRunId !== runId) {
            return false;
          }

          const isLastPlay = wordIndex >= queueLength - 1 && playNo >= repeatCount;
          const statusText = isLastPlay
            ? `${intervalSeconds} 秒后可以开始批改`
            : (playNo >= repeatCount
              ? `${intervalSeconds} 秒后播报下一个词`
              : `${intervalSeconds} 秒后再次播报`);
          this.setData({ statusText });

          return this.waitInterval(intervalSeconds, runId).then((shouldContinue) => {
            if (!shouldContinue) return false;
            if (isLastPlay) return true;
            const nextWordIndex = playNo >= repeatCount ? wordIndex + 1 : wordIndex;
            const nextPlayNo = playNo >= repeatCount ? 1 : playNo + 1;
            return step(nextWordIndex, nextPlayNo);
          });
        });
    };

    return step(0, 1);
  },
});
