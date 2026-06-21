const nav = require('../../../../utils/nav');
const petRoutes = require('../../../../utils/pet-routes');
const petService = require('../../../../utils/pet-service');
const petReward = require('../../../../utils/pet-reward');
const petTest = require('../../../../utils/pet-test-service');
const catalog = require('../../../../config/pet-catalog');

Page({
  data: { theme: {}, state: {}, results: [], passedCount: 0, failedCount: 0, routes: petRoutes },
  onShow() { this.refresh(); },
  onBack() { nav.navigateBack({ fallbackUrl: '/pages/parent-center/index' }); },
  refresh() { this.setData({ theme: getApp().globalData.theme, state: petService.state() }); },
  runAll() {
    const results = petTest.runAll();
    this.setData({ results, passedCount: results.filter((item) => item.passed).length, failedCount: results.filter((item) => !item.passed).length });
    this.refresh();
  },
  feed() { this.showResult(petService.feed('food_star_cookie')); },
  play() { this.showResult(petService.play('toy_bouncy_ball')); },
  sleep() { this.showResult(petService.sleep()); },
  pet() { this.showResult(petService.pet()); },
  setLowEnergy() { petService.debugPatch({ energy: 20, hunger: 50, mood: 50 }); this.refresh(); },
  setLevel(e) {
    const level = Number(e.currentTarget.dataset.level) || 1;
    petService.debugPatch({ xp: catalog.totalXpForLevel(level), highestClaimedLevel: level });
    this.refresh();
  },
  grantReward() {
    const result = petReward.grantTaskReward({ eventId: `manual-pet-test:${Date.now()}`, moduleId: 'test', title: '手动测试奖励', points: 20, xp: 20 });
    wx.showToast({ title: result.awarded ? '已增加测试奖励' : '奖励未增加', icon: 'none' });
    this.refresh();
  },
  showResult(result) { wx.showToast({ title: result.message || (result.ok ? '操作成功' : '操作失败'), icon: 'none' }); this.refresh(); },
  go(e) { nav.navigateTo(e.currentTarget.dataset.path); },
});
