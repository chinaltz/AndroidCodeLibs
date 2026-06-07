const nav = require('../../utils/nav');
const correction = require('../../utils/dictation-correction');

Page({
  data: {
    theme: {},
    items: [],
    stats: { total: 0, correct: 0, wrong: 0, pending: 0 },
    allGraded: false,
  },

  onLoad() {
    const queue = wx.getStorageSync('dictation_queue') || [];
    const items = queue.map(correction.buildGradeItem);
    this.setData({
      items,
      stats: correction.buildStats(items),
      allGraded: items.length > 0 && items.every((item) => item.result !== 'pending'),
    });
  },

  onShow() {
    this.setData({ theme: getApp().globalData.theme });
  },

  onBack() {
    nav.navigateBack({ fallbackUrl: '/pages/dictation-list/index' });
  },

  onGrade(e) {
    const { id, result } = e.currentTarget.dataset;
    const items = this.data.items.map((item) => {
      if (item.id !== id) return item;
      return Object.assign({}, item, {
        result: result,
        showWrongDetail: result === 'wrong',
        chars: item.chars.map((c) => Object.assign({}, c, { active: false })),
      });
    });
    const allGraded = items.every((item) => item.result !== 'pending');
    this.setData({ items, stats: correction.buildStats(items), allGraded });
  },

  onWrongCharTap(e) {
    const { itemId, charId } = e.currentTarget.dataset;
    const items = this.data.items.map((item) => {
      if (item.id !== itemId) return item;
      return Object.assign({}, item, {
        chars: item.chars.map((c) => (
          c.id === charId ? Object.assign({}, c, { active: !c.active }) : c
        )),
      });
    });
    this.setData({ items });
  },

  onSave() {
    const validation = correction.validateGradedItems(this.data.items);
    if (!validation.ok) {
      wx.showToast({ title: validation.message, icon: 'none' });
      return;
    }

    const sessionResults = correction.buildSessionResults(this.data.items);
    const beforeSnapshot = correction.snapshotCharacters();
    correction.saveSessionResults(sessionResults);
    wx.setStorageSync('dictation_session_results', sessionResults);
    wx.setStorageSync('dictation_session_summary', {
      results: sessionResults,
      beforeSnapshot: beforeSnapshot,
    });
    nav.navigateTo('/pages/dictation-result/index');
  },
});
