const nav = require('../../../../utils/nav');
const petRoutes = require('../../../../utils/pet-routes');
const petService = require('../../../../utils/pet-service');
const catalog = require('../../../../config/pet-catalog');

Page({
  data: { theme: {}, state: {}, milestones: [] },
  onShow() {
    const state = petService.state();
    const featureMilestones = [
      { level: 1, title: '领养晴空蓝星芽兽', desc: '获得新手礼包和第一位学习伙伴。' },
      { level: 2, title: '解锁玩耍', desc: '获得默认弹弹球和更多互动反馈。' },
      { level: 3, title: '解锁装扮间', desc: '可以穿戴已拥有的配饰。' },
      { level: 4, title: '解锁星星发卡', desc: '获得第一件等级限定配饰的购买资格。' },
      { level: 12, title: '解锁月芽冠', desc: '商店开放第一件进阶头饰。' },
      { level: 18, title: '解锁星辉羽翼', desc: '获得更醒目的展开式背饰。' },
      { level: 30, title: '解锁探索领巾', desc: '进入长期成长装扮区间。' },
      { level: 40, title: '解锁观星镜', desc: '完成当前商店最高级装备目标。' },
    ];
    const stageMilestones = catalog.GROWTH_STAGES.slice(1).map((stage) => ({
      level: stage.minLevel,
      title: `进化为${stage.title}`,
      desc: stage.desc,
    }));
    const milestones = featureMilestones.concat(stageMilestones)
      .sort((a, b) => a.level - b.level)
      .map((item) => Object.assign({}, item, { unlocked: state.level >= item.level }));
    const next = catalog.nextLevel(state.xp);
    const nextStage = catalog.GROWTH_STAGES.find((stage) => stage.minLevel > state.level);
    this.setData({
      theme: getApp().globalData.theme,
      state: Object.assign({}, state, {
        progressStyle: `width:${state.levelProgress}%;`,
        nextText: `距离 ${next.level} 级还差 ${next.totalXp - state.xp} XP`,
        stageDesc: state.growthStage.desc,
        nextStageText: nextStage ? `${nextStage.minLevel} 级进化为${nextStage.title}` : `每 25 级继续提升${state.growthStage.title}星阶`,
        adoptedDate: state.profile.adoptedAt ? new Date(state.profile.adoptedAt).toLocaleDateString() : '',
      }),
      milestones,
    });
  },
  onBack() { nav.navigateBack({ fallbackUrl: petRoutes.home }); },
});
