const { getTheme } = require('../../basic-controls/theme/theme');
const share = require('../../utils/share');

Page({
  data: {
    theme: getTheme('sky'),
    tabs: [
      { key: 'learn', label: '学习', icon: '⌂' },
      { key: 'settings', label: '设置', icon: '⚙' },
    ],
  },
  onLoad() {
    share.enableShareMenu();
  },
  onTap() {
    wx.showToast({ title: 'Basic Controls', icon: 'none' });
  },
  onBack() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
