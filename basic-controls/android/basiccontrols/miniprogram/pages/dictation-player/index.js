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

Page({
  data: {
    theme: {},
    queue: DEFAULT_QUEUE,
    currentIndex: 0,
    currentText: '时候',
    intervalSeconds: 8,
    repeatCount: 2,
    playing: false,
    configOpen: false,
    secretId: '',
    secretKey: '',
    maskedSecretId: '未填写',
    maskedSecretKey: '未填写',
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
      maskedSecretId: tts.maskSecret(config.secretId),
      maskedSecretKey: tts.maskSecret(config.secretKey),
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onIntervalInput(e) {
    const value = Math.max(3, Math.min(30, Number(e.detail.value) || 8));
    this.setData({ intervalSeconds: value });
  },

  onRepeatInput(e) {
    const value = Math.max(1, Math.min(3, Number(e.detail.value) || 2));
    this.setData({ repeatCount: value });
  },

  openConfig() {
    const config = tts.getConfig();
    this.setData({
      configOpen: true,
      secretId: config.secretId || '',
      secretKey: config.secretKey || '',
    });
  },

  closeConfig() {
    this.setData({ configOpen: false, secretId: '', secretKey: '' });
  },

  onSecretIdInput(e) {
    this.setData({ secretId: e.detail.value });
  },

  onSecretKeyInput(e) {
    this.setData({ secretKey: e.detail.value });
  },

  saveConfig() {
    const secretId = (this.data.secretId || '').trim();
    const secretKey = (this.data.secretKey || '').trim();
    if (!secretId || !secretKey) {
      wx.showToast({ title: '请填写 SecretId 和 SecretKey', icon: 'none' });
      return;
    }
    const config = tts.saveConfig({ secretId, secretKey });
    this.setData({
      configOpen: false,
      secretId: '',
      secretKey: '',
      hasConfig: true,
      maskedSecretId: tts.maskSecret(config.secretId),
      maskedSecretKey: tts.maskSecret(config.secretKey),
    });
    wx.showToast({ title: '已保存到本机', icon: 'success' });
  },

  noop() {},

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

  waitInterval() {
    return new Promise((resolve) => {
      setTimeout(resolve, this.data.intervalSeconds * 1000);
    });
  },

  startQueue() {
    if (this.data.playing) return;
    if (!this.data.hasConfig) {
      this.openConfig();
      wx.showToast({ title: '先配置 TTS Key', icon: 'none' });
      return;
    }
    this.setData({ playing: true, statusText: '听写开始' });
    this.runQueue().then(() => {
      this.setData({ playing: false, statusText: '听写完成' });
    });
  },

  stopQueue() {
    this.setData({ playing: false, statusText: '已暂停' });
  },

  runQueue() {
    const next = (index) => {
      if (!this.data.playing || index >= this.data.queue.length) return Promise.resolve();
      let chain = Promise.resolve();
      for (let i = 0; i < this.data.repeatCount; i += 1) {
        chain = chain.then(() => this.playTextAt(index));
      }
      return chain.then(() => {
        if (!this.data.playing || index >= this.data.queue.length - 1) return null;
        this.setData({ statusText: `${this.data.intervalSeconds} 秒后播报下一词` });
        return this.waitInterval();
      }).then(() => next(index + 1));
    };
    return next(0);
  },
});
