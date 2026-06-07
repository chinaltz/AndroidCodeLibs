const petService = require('../../utils/pet-service');

Page({
  onLoad() {
    const next = petService.state().adopted ? '/pages/pet-home/index' : '/pages/pet-adopt/index';
    wx.redirectTo({ url: next });
  },
});
