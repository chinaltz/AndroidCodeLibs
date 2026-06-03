let navigating = false;

function navigateTo(url) {
  if (navigating) return;
  navigating = true;
  wx.navigateTo({
    url,
    complete: () => {
      setTimeout(() => {
        navigating = false;
      }, 500);
    },
  });
}

module.exports = { navigateTo };
