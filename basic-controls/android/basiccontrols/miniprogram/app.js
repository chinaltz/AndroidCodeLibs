const { getTheme } = require('./basic-controls/theme/theme');
const i18n = require('./basic-controls/i18n/i18n');
const audio = require('./utils/audio');
const storage = require('./utils/storage');

App({
  globalData: {
    themeKey: 'sky',
    theme: getTheme('sky'),
    language: 'zh-CN',
    completed: [],
  },

  onLaunch() {
    this.checkForUpdates();
    const themeKey = storage.getThemeKey();
    const language = storage.getLanguage();
    i18n.setLanguage(language);
    this.globalData.themeKey = themeKey;
    this.globalData.language = language;
    this.globalData.completed = storage.getCompleted();
    this.applyCurrentChildTheme();
    audio.configureOutput();
  },

  checkForUpdates() {
    if (typeof wx.getUpdateManager !== 'function') return;
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(() => {});
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，重启后即可使用最新音频。',
        showCancel: false,
        success: () => {
          updateManager.applyUpdate();
        },
      });
    });
    updateManager.onUpdateFailed(() => {
      wx.showToast({
        title: '更新失败，请重新进入小程序',
        icon: 'none',
      });
    });
  },

  applyTheme(themeKey) {
    this.globalData.themeKey = themeKey;
    this.globalData.theme = getTheme(themeKey);
    storage.setThemeKey(themeKey);
  },

  applyCurrentChildTheme() {
    const themeKey = storage.getThemeKey();
    this.globalData.themeKey = themeKey;
    this.globalData.theme = getTheme(themeKey);
  },

  syncThemeAfterChildChange() {
    this.applyCurrentChildTheme();
  },

  setLanguage(code) {
    i18n.setLanguage(code);
    this.globalData.language = code;
    storage.setLanguage(code);
  },

  setCompleted(ids) {
    this.globalData.completed = ids;
    storage.setCompleted(ids);
  },

  t(key) {
    return i18n.text(key);
  },

  tf(key, ...args) {
    return i18n.format(key, ...args);
  },
});
