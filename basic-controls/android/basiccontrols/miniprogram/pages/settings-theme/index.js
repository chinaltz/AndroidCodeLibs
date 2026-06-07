const onboard = require('../../utils/child-onboard');
const nav = require('../../utils/nav');
const share = require('../../utils/share');
const storage = require('../../utils/storage');

Page({
  data: {
    theme: {},
    title: '',
    hint: '',
    childHint: '',
    colorThemes: [],
  },

  onShow() {
    share.enableShareMenu();
    const app = getApp();
    const current = app.globalData.themeKey;
    const child = storage.getCurrentChild();
    this.setData({
      theme: app.globalData.theme,
      title: app.t('page/settings/theme_page_title'),
      hint: app.t('page/settings/theme_page_hint'),
      childHint: child
        ? app.tf('page/settings/color_page_child_hint', child.nickname)
        : app.t('page/settings/color_page_no_child_hint'),
      colorThemes: onboard.buildColorThemes(current),
    });
  },

  onBack() {
    nav.navigateBack();
  },

  onPick(e) {
    const key = e.currentTarget.dataset.key;
    const app = getApp();
    if (key === app.globalData.themeKey) return;
    app.applyTheme(key);
    wx.setNavigationBarColor({
      frontColor: app.globalData.theme.dark ? '#ffffff' : '#000000',
      backgroundColor: app.globalData.theme.pageStart,
    });
    nav.navigateBack();
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
