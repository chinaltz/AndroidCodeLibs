function rpxToPx(rpx, windowWidth) {
  return (rpx / 750) * (windowWidth || 375);
}

function getSafeBottom(info) {
  if (info.safeAreaInsets && info.safeAreaInsets.bottom) {
    return info.safeAreaInsets.bottom;
  }
  if (info.safeArea && info.screenHeight) {
    return Math.max(0, info.screenHeight - info.safeArea.bottom);
  }
  return 0;
}

let layoutBase = null;

function resetLayoutBase() {
  layoutBase = null;
}

function measureScrollLayout(options) {
  const hasBottomTab = !!(options && options.hasBottomTab);
  const force = !!(options && options.force);
  const info = wx.getSystemInfoSync();
  const windowWidth = info.windowWidth || 375;
  const windowHeight = info.windowHeight || info.screenHeight || 667;

  if (!layoutBase || force) {
    layoutBase = { windowWidth, windowHeight };
  } else if (windowWidth !== layoutBase.windowWidth) {
    // Rotation / split view: width changed, remeasure once.
    layoutBase = { windowWidth, windowHeight };
  }
  // Ignore height-only changes (keyboard) to avoid scroll/input relayout loops on iOS.

  const baseWidth = layoutBase.windowWidth;
  const baseHeight = layoutBase.windowHeight;
  const statusBarHeight = info.statusBarHeight || 20;
  let navBarHeight = 44;

  try {
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect();
      if (rect && rect.height > 0) {
        const topGap = rect.top > 0 ? Math.max(0, rect.top - statusBarHeight) : 0;
        navBarHeight = rect.height + topGap * 2;
      }
    }
  } catch (err) {
    // iPad / devtools may fail on menu button metrics.
  }

  const headerHeight = statusBarHeight + navBarHeight;
  const bodyPaddingY = rpxToPx(48, baseWidth);
  const tabBarHeight = hasBottomTab
    ? rpxToPx(100, baseWidth) + getSafeBottom(info)
    : getSafeBottom(info);
  const scrollBodyHeight = Math.floor(baseHeight - headerHeight - bodyPaddingY - tabBarHeight);

  return {
    statusBarHeight,
    headerHeight,
    scrollBodyHeight: Math.max(280, scrollBodyHeight),
  };
}

module.exports = {
  measureScrollLayout,
  resetLayoutBase,
};
