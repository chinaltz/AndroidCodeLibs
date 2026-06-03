const nav = require('../../utils/nav');
const share = require('../../utils/share');

Page({
  data: {
    theme: {},
    title: '',
    subtitle: '',
    entryTheme: '',
    entryLanguage: '',
    themeLabel: '',
    languageLabel: '',
  },

  onShow() {
    share.enableShareMenu();
    const app = getApp();
    const themeKey = app.globalData.themeKey;
    this.setData({
      theme: app.globalData.theme,
      title: app.t('page/settings/title'),
      subtitle: app.t('page/settings/subtitle'),
      entryTheme: app.t('page/settings/entry_theme'),
      entryLanguage: app.t('page/settings/entry_language'),
      themeLabel: themeName(themeKey, app),
      languageLabel: app.t('language/' + app.globalData.language),
    });
  },

  onBack() {
    wx.navigateBack();
  },

  goTheme() {
    nav.navigateTo('/pages/settings-theme/index');
  },

  goLanguage() {
    nav.navigateTo('/pages/settings-language/index');
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
