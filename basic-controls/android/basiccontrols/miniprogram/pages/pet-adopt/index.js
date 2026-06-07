const nav = require('../../utils/nav');
const petService = require('../../utils/pet-service');
const catalog = require('../../config/pet-catalog');

Page({
  data: { theme: {}, name: '芽芽', petImage: catalog.PET_BLUE },
  onLoad() {
    if (petService.state().adopted) {
      wx.redirectTo({ url: '/pages/pet-home/index' });
      return;
    }
    this.setData({ theme: getApp().globalData.theme });
  },
  onNameInput(e) { this.setData({ name: e.detail.value.slice(0, 8) }); },
  onBack() { nav.navigateBack({ fallbackUrl: '/pages/map/index' }); },
  confirmAdopt() {
    const result = petService.adopt(this.data.name);
    if (!result.ok) return;
    wx.showToast({ title: '领养成功，获得 30 积分', icon: 'none' });
    setTimeout(() => wx.redirectTo({ url: '/pages/pet-home/index?guide=feed' }), 500);
  },
});
