const petService = require('../../../../utils/pet-service');
const petRoutes = require('../../../../utils/pet-routes');
const nav = require('../../../../utils/nav');

Page({
  data: { loading: true, error: '' },

  onLoad() {
    if (this._entered) return;
    this._entered = true;
    try {
      const next = petService.state().adopted ? petRoutes.home : petRoutes.adopt;
      wx.redirectTo({
        url: next,
        fail: () => {
          this._entered = false;
          this.setData({
            loading: false,
            error: '宠物页面打开失败，请返回首页重试',
          });
        },
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: '宠物模块加载失败，请重新编译或更新小程序',
      });
    }
  },

  onBack() {
    nav.navigateBack({ fallbackUrl: '/pages/map/index' });
  },
});
