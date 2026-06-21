const nav = require('../../utils/nav');
const share = require('../../utils/share');
const onboard = require('../../utils/child-onboard');

Page({
  data: {
    theme: {},
    title: '',
    subtitle: '',
    entryColor: '',
    colorLabel: '',
    tabs: [
      {
        key: 'home',
        iconSrc: '/assets/icons/nav-home.png',
        activeIconSrc: '/assets/icons/nav-home-active.png',
        label: '首页',
      },
      {
        key: 'settings',
        iconSrc: '/assets/icons/nav-settings.png',
        activeIconSrc: '/assets/icons/nav-settings-active.png',
        label: '设置',
      },
    ],
  },

  onShow() {
    share.enableShareMenu();
    const app = getApp();
    this.setData({
      theme: app.globalData.theme,
      title: app.t('page/settings/title'),
      subtitle: app.t('page/settings/subtitle'),
      entryColor: app.t('page/settings/theme'),
      colorLabel: onboard.getThemeLabel(app.globalData.themeKey),
    });
  },

  goColor() {
    nav.navigateTo('/pages/settings-theme/index');
  },

  goDataBackup() {
    nav.navigateTo('/pages/settings-data/index');
  },

  goPetTest() {
    nav.navigateTo('/packages/pet/pages/pet-test/index');
  },

  onTabChange(e) {
    if (e.detail.key === 'home') {
      wx.redirectTo({
        url: '/pages/map/index',
        fail: () => wx.showToast({ title: '首页打开失败', icon: 'none' }),
      });
    }
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
