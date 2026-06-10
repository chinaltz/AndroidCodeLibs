const nav = require('../../../../utils/nav');
const petRoutes = require('../../../../utils/pet-routes');
const share = require('../../../../utils/share');
const petReward = require('../../../../utils/pet-reward');
const catalog = require('../../../../config/pet-catalog');

function format(time) {
  const date = new Date(time);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

Page({
  data: { theme: {}, petImage: catalog.PET_BLUE_HAPPY, points: 0, pendingShares: [], ledger: [], dailyText: '' },
  onLoad() { share.enableShareMenu(); },
  onShow() {
    const state = petReward.getPetState();
    this.setData({
      theme: getApp().globalData.theme,
      points: state.points,
      dailyText: `${state.dailyShareCount}/${state.dailyShareLimit}`,
      pendingShares: state.pendingShares.map((item) => Object.assign({}, item, { buttonText: `分享 +${petReward.SHARE_POINTS} ★` })),
      ledger: state.ledger.map((item) => Object.assign({}, item, { timeText: format(item.createdAt), deltaText: `${item.points >= 0 ? '+' : ''}${item.points} ★` })),
    });
  },
  onBack() { nav.navigateBack({ fallbackUrl: petRoutes.home }); },
  onShareAppMessage(options) {
    const eventId = options && options.target && options.target.dataset.eventId;
    if (eventId) {
      const result = petReward.claimShareReward(eventId);
      if (result.reason === 'daily_limit') wx.showToast({ title: '今日分享奖励已达上限', icon: 'none' });
      this.onShow();
      return petReward.shareMessage(eventId);
    }
    return share.appMessage({ title: '我的蓝色星芽兽正在成长', path: petRoutes.entry });
  },
});
