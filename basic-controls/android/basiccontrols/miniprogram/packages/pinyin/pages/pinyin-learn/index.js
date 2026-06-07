const { findById } = require('../../../../data/pinyin-units');
const audio = require('../../../../utils/audio');
const nav = require('../../../../utils/nav');
const storage = require('../../../../utils/storage');

Page({
  data: {
    theme: {},
    unit: {},
    kindLabel: '',
    audioReady: false,
    compareUnits: [],
  },

  onLoad(query) {
    const theme = getApp().globalData.theme;
    const unit = findById(query.id);
    const compareUnits = [unit].concat(unit.compareIds.map((id) => findById(id))).map((item) => ({
      id: item.id,
      symbol: item.symbol,
      audioId: item.audioId,
      current: item.id === unit.id,
      audioReady: !!item.audioId,
    }));
    storage.setPinyinLastUnit(unit.id);
    this.setData({
      theme,
      unit,
      kindLabel: unit.kind === 'initial' ? '声母' : unit.kind === 'final' ? '韵母' : '整体认读音节',
      audioReady: !!unit.audioId,
      compareUnits,
    });
    wx.setNavigationBarColor({
      frontColor: theme.dark ? '#ffffff' : '#000000',
      backgroundColor: theme.pageStart,
    });
  },

  onBack() {
    nav.navigateBack();
  },

  onHide() {
    audio.stopTeaching();
  },

  playTeaching() {
    this.playTeachingAudio(this.data.unit.audioId, this.data.unit.symbol);
  },

  playCompare(e) {
    this.playTeachingAudio(e.currentTarget.dataset.audio, e.currentTarget.dataset.symbol);
  },

  playTeachingAudio(audioId, symbol) {
    if (!audioId) {
      wx.showToast({ title: `${symbol} 的标准音待补录`, icon: 'none' });
      return;
    }
    audio.play(audio.pinyinTeachingPath(audioId), symbol).catch(() => {
      wx.showToast({ title: `${symbol} 播放失败`, icon: 'none' });
    });
  },

  playExample(e) {
    const audioId = e.currentTarget.dataset.audio;
    audio.play(audio.pinyinSyllablePath(audioId), audioId).catch(() => {
      wx.showToast({ title: '示例音节播放失败', icon: 'none' });
    });
  },

  goCheck() {
    nav.navigateTo(`/packages/pinyin/pages/pinyin-check/index?id=${this.data.unit.id}`);
  },
});
