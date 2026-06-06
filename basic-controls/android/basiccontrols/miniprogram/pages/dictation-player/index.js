const audio = require('../../utils/audio');
const tts = require('../../utils/tencent-tts');

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
  return Math.max(1, Math.min(3, Number(value) || 2));
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
    hasConfig: false,
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
    this.setData({
      theme: app.globalData.theme,
      hasConfig: !!(config.secretId && config.secretKey),
    });
  },

  onBack() {
    wx.navigateBack();
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
    const index = Number(e.currentTarget.dataset.index || 0);
    this.playTextAt(index);
  },

  playTextAt(index) {
    const item = this.data.queue[index];
    if (!item) return Promise.resolve();
    this.setData({
      currentIndex: index,
      currentText: item.text,
      statusText: `正在合成：${item.text}`,
    });
    return tts.synthesizeToTempFile(item.text).then((filePath) => {
      this.setData({ statusText: `正在播报：${item.text}` });
      return audio.play(filePath, item.text);
    }).catch((err) => {
      wx.showToast({ title: err.message || '播报失败', icon: 'none' });
      this.setData({ statusText: 'TTS 失败，可先手动听写' });
    });
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
      wx.showToast({ title: 'TTS 内置配置未填写', icon: 'none' });
      return;
    }
    this.cancelIntervalWait();
    const runId = (this._dictationRunId || 0) + 1;
    const intervalSeconds = normalizeIntervalSeconds(this.data.intervalSeconds);
    const repeatCount = normalizeRepeatCount(this.data.repeatCount);
    this._dictationRunId = runId;
    this.setData({
      intervalSeconds,
      repeatCount,
      playing: true,
      statusText: '听写开始',
    });
    this.runQueue({ runId, intervalSeconds, repeatCount }).then((completed) => {
      if (!completed || this._dictationRunId !== runId) return;
      this.setData({ playing: false, statusText: '听写完成' });
    });
  },

  stopQueue() {
    this._dictationRunId = (this._dictationRunId || 0) + 1;
    this.cancelIntervalWait();
    this.setData({ playing: false, statusText: '已暂停' });
  },

  onUnload() {
    this._dictationRunId = (this._dictationRunId || 0) + 1;
    this.cancelIntervalWait();
  },

  runQueue(options) {
    const { runId, intervalSeconds, repeatCount } = options;
    const next = (index) => {
      if (!this.data.playing || this._dictationRunId !== runId) return Promise.resolve(false);
      if (index >= this.data.queue.length) return Promise.resolve(true);
      let chain = Promise.resolve();
      for (let i = 0; i < repeatCount; i += 1) {
        chain = chain.then(() => {
          if (!this.data.playing || this._dictationRunId !== runId) return null;
          return this.playTextAt(index);
        });
      }
      return chain.then(() => {
        if (!this.data.playing || this._dictationRunId !== runId) return false;
        if (index >= this.data.queue.length - 1) return true;
        this.setData({ statusText: `${intervalSeconds} 秒后播报下一词` });
        return this.waitInterval(intervalSeconds, runId);
      }).then((shouldContinue) => {
        if (!shouldContinue) return false;
        if (index >= this.data.queue.length - 1) return true;
        return next(index + 1);
      });
    };
    return next(0);
  },
});
