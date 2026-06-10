const nav = require('../../../../utils/nav');
const petRoutes = require('../../../../utils/pet-routes');
const petService = require('../../../../utils/pet-service');
const catalog = require('../../../../config/pet-catalog');

Page({
  data: { theme: {}, state: {}, milestones: [] },
  onShow() {
    const state = petService.state();
    const milestones = [
      { level: 1, title: '领养晴空蓝星芽兽', desc: '获得新手礼包和第一位学习伙伴。' },
      { level: 2, title: '解锁玩耍', desc: '获得默认弹弹球和更多互动反馈。' },
      { level: 3, title: '解锁装扮间', desc: '可以穿戴已拥有的配饰。' },
      { level: 4, title: '解锁星星发卡', desc: '获得第一件等级限定配饰的购买资格。' },
      { level: 5, title: '成长为小星苗', desc: '进入新的成长阶段。' },
      { level: 8, title: '解锁快乐待机动作', desc: '宠物会展示新的日常反应。' },
      { level: 10, title: '解锁成长纪念背景', desc: '记录长期学习成果。' },
    ].map((item) => Object.assign({}, item, { unlocked: state.level >= item.level, current: state.level < item.level }));
    const next = catalog.nextLevel(state.xp);
    this.setData({
      theme: getApp().globalData.theme,
      state: Object.assign({}, state, {
        progressStyle: `width:${state.levelProgress}%;`,
        nextText: next ? `下一级 ${next.totalXp} XP` : '当前已满级',
        adoptedDate: state.profile.adoptedAt ? new Date(state.profile.adoptedAt).toLocaleDateString() : '',
      }),
      milestones,
    });
  },
  onBack() { nav.navigateBack({ fallbackUrl: petRoutes.home }); },
});
