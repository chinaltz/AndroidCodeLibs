const { THEMES } = require('../../basic-controls/theme/theme');
const share = require('../../utils/share');

Page({
  data: { theme: {}, title: '', hint: '', options: [] },

  onShow() {
    share.enableShareMenu();
    const app = getApp();
    const current = app.globalData.themeKey;
    this.setData({
      theme: app.globalData.theme,
      title: app.t('page/settings/theme_page_title'),
      hint: app.t('page/settings/theme_page_hint'),
      options: Object.keys(THEMES).map((key) => ({
        key,
        label: themeName(key, app),
        selected: current === key,
      })),
    });
  },

  onBack() { wx.navigateBack(); },

  onPick(e) {
    const key = e.currentTarget.dataset.key;
    const app = getApp();
    if (key === app.globalData.themeKey) return;
    app.applyTheme(key);
    wx.navigateBack();
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});

function themeName(key, app) {
  const map = {
    sky: 'page/settings/theme_day',
    night: 'page/settings/theme_dark',
    mint: 'page/settings/theme_mint',
    sunrise: 'page/settings/theme_sunrise',
  };
  return app.t(map[key] || map.sky);
}
