const nav = require('../../utils/nav');
const vocabulary = require('../../utils/vocabulary-store');
const REPEAT_OPTIONS = [1, 2, 3, 4, 5];
const INTERVAL_OPTIONS = [1, 2, 3, 5, 8, 10];

Page({
  data: { theme: {}, words: [], selectedIds: [], selectedCount: 0, repeatOptions: REPEAT_OPTIONS, intervalOptions: INTERVAL_OPTIONS, repeatCount: 2, intervalSeconds: 8 },
  onShow() {
    const selectedIds = vocabulary.getPlanIds();
    const config = vocabulary.getPlanConfig();
    this.setData({
      theme: getApp().globalData.theme,
      words: vocabulary.getWords().map((item) => Object.assign({}, item, { selected: selectedIds.indexOf(item.id) >= 0 })),
      selectedIds,
      selectedCount: selectedIds.length,
      repeatCount: config.repeatCount,
      intervalSeconds: config.intervalSeconds,
    });
  },
  onBack() { nav.navigateBack(); },
  toggleWord(e) {
    const id = e.currentTarget.dataset.id;
    const selectedIds = this.data.selectedIds.indexOf(id) >= 0
      ? this.data.selectedIds.filter((item) => item !== id)
      : this.data.selectedIds.concat(id);
    this.setData({
      selectedIds,
      selectedCount: selectedIds.length,
      words: this.data.words.map((item) => Object.assign({}, item, { selected: selectedIds.indexOf(item.id) >= 0 })),
    });
  },
  savePlan() {
    vocabulary.setPlanIds(this.data.selectedIds);
    vocabulary.setPlanConfig({ repeatCount: this.data.repeatCount, intervalSeconds: this.data.intervalSeconds });
    wx.showToast({ title: this.data.selectedIds.length ? '今日计划已保存' : '今日暂未安排', icon: 'none' });
    setTimeout(() => nav.navigateBack(), 350);
  },
  onRepeatChange(e) { this.setData({ repeatCount: REPEAT_OPTIONS[Number(e.detail.value)] }); },
  onIntervalChange(e) { this.setData({ intervalSeconds: INTERVAL_OPTIONS[Number(e.detail.value)] }); },
  goBook() { nav.navigateTo('/pages/vocabulary-book/index'); },
});
