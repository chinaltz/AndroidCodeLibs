const nav = require('../../utils/nav');
const vocabulary = require('../../utils/vocabulary-store');

Page({
  data: { theme: {}, wordCount: 0, planCount: 0 },

  onShow() {
    this.setData({
      theme: getApp().globalData.theme,
      wordCount: vocabulary.getWords().length,
      planCount: vocabulary.getPlanWords().length,
    });
  },

  onBack() { nav.navigateBack(); },
  goBook() { nav.navigateTo('/pages/vocabulary-book/index'); },
  goPlan() { nav.navigateTo('/pages/vocabulary-plan/index'); },
  startDictation() {
    if (!vocabulary.getPlanWords().length) {
      wx.showModal({
        title: '今天还没有单词计划',
        content: '请先选择今天要听写的单词。',
        confirmText: '设置计划',
        success: (res) => { if (res.confirm) this.goPlan(); },
      });
      return;
    }
    nav.navigateTo('/pages/vocabulary-player/index');
  },
});
