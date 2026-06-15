const { findById } = require('../../../../data/phonemes');
const audio = require('../../../../utils/audio');
const nav = require('../../../../utils/nav');
const share = require('../../../../utils/share');

Page({
  data: {
    theme: {},
    phoneme: {},
    title: '',
    playText: '',
    goCheckText: '',
    mouthTitle: '',
    wordsTitle: '',
  },

  onLoad(query) {
    share.enableShareMenu();
    const app = getApp();
    const phoneme = findById(query.id);
    this.phonemeId = phoneme.id;
    this.setData({
      theme: app.globalData.theme,
      phoneme,
      title: app.tf('page/learn/title', phoneme.symbol),
      playText: app.t('btn/play'),
      goCheckText: app.t('btn/go_check'),
      mouthTitle: app.t('page/learn/mouth_title'),
      wordsTitle: app.t('page/learn/words_title'),
    });
    wx.setNavigationBarColor({
      frontColor: app.globalData.theme.dark ? '#ffffff' : '#000000',
      backgroundColor: app.globalData.theme.pageStart,
    });
  },

  onBack() {
    nav.navigateBack();
  },

  onHide() {
    audio.stopTeaching();
  },

  onPlaySymbol() {
    const path = audio.phonemePath(this.phonemeId);
    audio.play(path, this.data.phoneme.symbol).catch((err) => {
      console.error('phonics learn audio failed', {
        phonemeId: this.phonemeId,
        path,
        error: err,
      });
      wx.showToast({ title: getApp().tf('toast/play_failed', this.data.phoneme.symbol), icon: 'none' });
    });
  },

  onPlayWord(e) {
    const text = e.currentTarget.dataset.text;
    audio.play(audio.wordPath(text)).catch(() => {
      wx.showToast({ title: getApp().tf('toast/play_failed', text), icon: 'none' });
    });
  },

  onGoCheck() {
    nav.navigateTo(`/packages/phonics-media/pages/check/index?id=${this.phonemeId}`);
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
