const HOME_URL = '/pages/map/index';

let navigating = false;

function navigateTo(url) {
  if (navigating) return;
  navigating = true;
  wx.navigateTo({
    url,
    fail: () => {
      navigating = false;
      wx.showToast({ title: '页面打开失败', icon: 'none' });
    },
    complete: () => {
      setTimeout(() => {
        navigating = false;
      }, 500);
    },
  });
}

function navigateBack(options) {
  const pages = getCurrentPages();
  const delta = (options && options.delta) || 1;
  const fallbackUrl = (options && options.fallbackUrl) || HOME_URL;
  if (pages.length > delta) {
    wx.navigateBack({ delta });
    return;
  }
  wx.reLaunch({ url: fallbackUrl });
}

module.exports = {
  HOME_URL,
  navigateTo,
  navigateBack,
};
