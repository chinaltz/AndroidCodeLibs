const nav = require('../../../../utils/nav');
const petRoutes = require('../../../../utils/pet-routes');
const petService = require('../../../../utils/pet-service');
const catalog = require('../../../../config/pet-catalog');

Page({
  data: { theme: {}, name: '芽芽', petImage: catalog.PET_BLUE },
  onLoad() {
    if (petService.state().adopted) {
      this._navPending = true;
      wx.redirectTo({
        url: petRoutes.home,
        fail: () => {
          this._navPending = false;
        },
      });
      return;
    }
    this.setData({ theme: getApp().globalData.theme });
  },
  onShow() {
    if (this._navPending) return;
  },
  onNameInput(e) { this.setData({ name: e.detail.value.slice(0, 8) }); },
  onBack() { nav.navigateBack({ fallbackUrl: '/pages/map/index' }); },
  confirmAdopt() {
    const result = petService.adopt(this.data.name);
    if (!result.ok) return;
    wx.showToast({ title: '领养成功，获得 30 积分', icon: 'none' });
    setTimeout(() => wx.redirectTo({ url: `${petRoutes.home}?guide=feed` }), 500);
  },
});
