const audio = require('../../utils/audio');
const tts = require('../../utils/tencent-tts');
const nav = require('../../utils/nav');
const vocabulary = require('../../utils/vocabulary-store');

Page({
  data: {
    theme: {}, queue: [], currentIndex: 0, playing: false, finished: false,
    sessionStarted: false, hasConfig: false, configHint: '', statusText: '准备好就开始吧',
    progressText: '0 / 0', progressPercent: 0, repeatCount: 2, intervalSeconds: 8,
  },
  onLoad() {
    const queue = vocabulary.getPlanWords();
    const planConfig = vocabulary.getPlanConfig();
    this.setData({ queue, repeatCount: planConfig.repeatCount, intervalSeconds: planConfig.intervalSeconds, progressText: queue.length ? `第 1 / ${queue.length} 个` : '0 / 0', progressPercent: queue.length ? Math.round(100 / queue.length) : 0 });
    if (!queue.length) {
      wx.showToast({ title: '请先设置今日单词计划', icon: 'none' });
      setTimeout(() => nav.navigateBack(), 500);
    }
  },
  onShow() {
    const config = tts.getConfig();
    const hasConfig = !!(config.secretId && config.secretKey);
    this.setData({ theme: getApp().globalData.theme, hasConfig, configHint: hasConfig ? '' : '声音暂时不可用，请让家长检查设置', statusText: hasConfig ? this.data.statusText : '声音暂时不可用' });
  },
  onBack() { nav.navigateBack(); },
  cancelPlayback() {
    this._playId = (this._playId || 0) + 1;
    if (this._repeatTimer) { clearTimeout(this._repeatTimer); this._repeatTimer = null; }
    audio.resetPlayer();
  },
  playRepeated(filePath, item, playId, playNumber, totalPlays) {
    if (this._playId !== playId) return;
    this.setData({ playing: true, statusText: totalPlays > 1 ? `正在播放第 ${playNumber} / ${totalPlays} 次` : '正在播放，请仔细听' });
    audio.playDictation(filePath, item.word).then(() => {
      if (this._playId !== playId) return;
      if (playNumber >= totalPlays) { this.setData({ playing: false, statusText: '播放结束，请写下来' }); return; }
      this.setData({ playing: false, statusText: `${this.data.intervalSeconds} 秒后自动重复` });
      this._repeatTimer = setTimeout(() => { this._repeatTimer = null; this.playRepeated(filePath, item, playId, playNumber + 1, totalPlays); }, this.data.intervalSeconds * 1000);
    }).catch(() => {
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
    this.setData({ currentIndex: index, playing: true, finished: false, progressText: `第 ${index + 1} / ${this.data.queue.length} 个`, progressPercent: Math.round(((index + 1) / this.data.queue.length) * 100), statusText: '正在准备声音…' });
    tts.synthesizeToTempFile(item.word).then((filePath) => {
      if (this._playId !== playId) return false;
      this.playRepeated(filePath, item, playId, 1, totalPlays);
      return true;
    }).catch(() => {
      if (this._playId !== playId) return;
      wx.showToast({ title: '声音播放失败', icon: 'none' });
      this.setData({ playing: false, statusText: '声音暂时不可用' });
    });
  },
  startQueue() {
    if (!this.data.hasConfig) { wx.showToast({ title: '声音暂时不可用', icon: 'none' }); return; }
    if (this.data.queue.length) { this.setData({ sessionStarted: true }); this.playAt(0); }
  },
  replayCurrent() { this.playAt(this.data.currentIndex, { once: true }); },
  previousItem() { if (this.data.currentIndex > 0) this.playAt(this.data.currentIndex - 1); },
  nextItem() {
    if (this.data.currentIndex >= this.data.queue.length - 1) {
      this.cancelPlayback(); this.setData({ playing: false, finished: true, statusText: '全部听完了' }); return;
    }
    this.playAt(this.data.currentIndex + 1);
  },
  finishSession() { audio.resetPlayer(); wx.showToast({ title: '单词听写完成', icon: 'success' }); setTimeout(() => nav.navigateBack(), 500); },
  onUnload() { this.cancelPlayback(); },
});
