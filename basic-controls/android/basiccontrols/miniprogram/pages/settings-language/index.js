const i18n = require('../../basic-controls/i18n/i18n');
const nav = require('../../utils/nav');
const share = require('../../utils/share');

Page({
  data: { theme: {}, title: '', hint: '', options: [] },

  onShow() {
    share.enableShareMenu();
    const app = getApp();
    const current = app.globalData.language;
    this.setData({
      theme: app.globalData.theme,
      title: app.t('page/settings/language_page_title'),
      hint: app.t('page/settings/language_hint'),
      options: i18n.languages().map((code) => ({
        code,
        label: app.t('language/' + code),
        selected: code === current,
      })),
    });
  },

  onBack() { nav.navigateBack(); },

  onPick(e) {
    const code = e.currentTarget.dataset.code;
    const app = getApp();
    if (code === app.globalData.language) return;
    app.setLanguage(code);
    nav.navigateBack();
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
