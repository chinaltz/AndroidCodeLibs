const audio = require('../../utils/audio');
const tts = require('../../utils/tencent-tts');
const nav = require('../../utils/nav');
const dictationQueue = require('../../utils/dictation-queue');

function normalizeQueue(queue) {
  const list = Array.isArray(queue) ? queue : [];
  return list.map((item, index) => ({
    id: item.id || `queue_${index}`,
    text: item.text || '',
  })).filter((item) => item.text);
}

Page({
  data: {
    theme: {},
    queue: [],
    currentIndex: 0,
    playing: false,
    finished: false,
    sessionStarted: false,
    hasConfig: false,
    configHint: '',
    statusText: '准备好就开始吧',
    progressText: '0 / 0',
    progressPercent: 0,
    repeatCount: 2,
    intervalSeconds: 8,
  },

  onLoad() {
    const queue = normalizeQueue(dictationQueue.getQueue());
    const planConfig = dictationQueue.getPlanConfig();
    this.setData({
      queue,
      repeatCount: planConfig.repeatCount,
      intervalSeconds: planConfig.intervalSeconds,
      progressText: queue.length ? `第 1 / ${queue.length} 个` : '0 / 0',
      progressPercent: queue.length ? Math.round(100 / queue.length) : 0,
    });
    if (!queue.length) {
      wx.showToast({ title: '请先选择听写内容', icon: 'none' });
      setTimeout(() => nav.navigateBack(), 500);
    }
  },

  onShow() {
    const app = getApp();
    const config = tts.getConfig();
    const hasConfig = !!(config.secretId && config.secretKey);
    this.setData({
      theme: app.globalData.theme,
      hasConfig,
      configHint: hasConfig ? '' : '声音暂时不可用，请让家长检查设置',
      statusText: hasConfig ? this.data.statusText : '声音暂时不可用',
    });
  },

  onBack() {
    nav.navigateBack();
  },

  cancelPlayback() {
    this._playId = (this._playId || 0) + 1;
    if (this._repeatTimer) {
      clearTimeout(this._repeatTimer);
      this._repeatTimer = null;
    }
    audio.resetPlayer();
  },

  playRepeated(filePath, item, playId, playNumber, totalPlays) {
    if (this._playId !== playId) return;
    this.setData({
      playing: true,
      statusText: totalPlays > 1 ? `正在播放第 ${playNumber} / ${totalPlays} 次` : '正在播放，请仔细听',
    });
    audio.playDictation(filePath, item.text)
      .then(() => {
        if (this._playId !== playId) return;
        if (playNumber >= totalPlays) {
          this.setData({ playing: false, statusText: '播放结束，请写下来' });
          return;
        }
        this.setData({ playing: false, statusText: `${this.data.intervalSeconds} 秒后自动重复` });
        this._repeatTimer = setTimeout(() => {
          this._repeatTimer = null;
          this.playRepeated(filePath, item, playId, playNumber + 1, totalPlays);
        }, this.data.intervalSeconds * 1000);
      })
      .catch(() => {
        if (this._playId !== playId) return;
        wx.showToast({ title: '声音播放失败', icon: 'none' });
        this.setData({ playing: false, statusText: '声音暂时不可用' });
      });
  },

  playAt(index, options) {
    if (!this.data.hasConfig || index < 0 || index >= this.data.queue.length) return;
    const item = this.data.queue[index];
    this.cancelPlayback();
    audio.primeFromUserGesture();
    const playId = this._playId;
    const totalPlays = options && options.once ? 1 : this.data.repeatCount;
    this.setData({
      currentIndex: index,
      playing: true,
      finished: false,
      progressText: `第 ${index + 1} / ${this.data.queue.length} 个`,
      progressPercent: Math.round(((index + 1) / this.data.queue.length) * 100),
      statusText: '正在准备声音…',
    });
    tts.synthesizeToTempFile(item.text)
      .then((filePath) => {
        if (this._playId !== playId) return false;
        this.playRepeated(filePath, item, playId, 1, totalPlays);
        return true;
      })
      .catch(() => {
        if (this._playId !== playId) return;
        wx.showToast({ title: '声音播放失败', icon: 'none' });
        this.setData({ playing: false, statusText: '声音暂时不可用' });
      });
  },

  startQueue() {
    if (!this.data.hasConfig) {
      wx.showToast({ title: '声音暂时不可用', icon: 'none' });
      return;
    }
    if (!this.data.queue.length) return;
    this.setData({ sessionStarted: true });
    this.playAt(0);
  },

  replayCurrent() {
    this.playAt(this.data.currentIndex, { once: true });
  },

  previousItem() {
    if (this.data.currentIndex <= 0) return;
    this.playAt(this.data.currentIndex - 1);
  },

  nextItem() {
    if (this.data.currentIndex >= this.data.queue.length - 1) {
      this.cancelPlayback();
      this.setData({ playing: false, finished: true, statusText: '全部听完了' });
      return;
    }
    this.playAt(this.data.currentIndex + 1);
  },

  finishSession() {
    wx.showModal({
      title: '都写完了吗？',
      content: '确认后就进入批改。',
      confirmText: '写完了',
      cancelText: '再检查',
      success: (res) => {
        if (res.confirm) nav.navigateTo('/pages/dictation-correction/index');
      },
    });
  },

  onUnload() {
    this.cancelPlayback();
  },
});
