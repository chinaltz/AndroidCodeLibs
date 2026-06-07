const nav = require('../../utils/nav');
const petService = require('../../utils/pet-service');
const catalog = require('../../config/pet-catalog');

const RANDOM_BEHAVIORS = [
  { image: catalog.PET_BLUE_IDLE, className: 'is-look', caption: '这里好像有新的声音。', duration: 1800 },
  { image: catalog.PET_BLUE_HAPPY, className: 'is-bounce', caption: '今天也很开心！', duration: 2100 },
  { image: catalog.PET_BLUE_SLEEPY, className: 'is-breathe', caption: '让我慢慢休息一下。', duration: 2500 },
  { image: catalog.PET_BLUE_IDLE, className: 'is-sway', caption: '我在等下一次学习冒险。', duration: 2200 },
  { image: catalog.PET_BLUE_IDLE, className: 'is-blink', caption: '眨眨眼，继续陪着你。', duration: 1500 },
];

function decorate(state) {
  const next = state.nextLevel;
  const playCost = petService.playEnergyCost(catalog.findItem('toy_bouncy_ball') || { energy: -10 });
  const equippedImages = Object.keys(state.equipped)
    .map((slot) => catalog.findItem(state.equipped[slot]))
    .filter(Boolean)
    .map((item) => ({ id: item.id, image: item.image, slot: item.slot }));
  return Object.assign({}, state, {
    nextText: next ? `再获得 ${next.totalXp - state.xp} XP 升到 ${next.level} 级` : '已达到当前最高等级',
    progressStyle: `width:${state.levelProgress}%;`,
    equippedImages,
    canFeed: state.status.hunger < 90,
    canPlay: state.status.energy >= playCost,
    canSleep: state.status.energy <= petService.SLEEP_ENERGY_THRESHOLD,
  });
}

Page({
  data: {
    theme: {},
    state: {},
    petImage: catalog.PET_BLUE_IDLE,
    reaction: '今天也一起学一小关吧。',
    reactionClass: '',
    canFeed: true,
    canPlay: true,
    canSleep: true,
    guideFeed: false,
  },
  onLoad(options) {
    if (options && options.guide === 'feed') {
      this.setData({ guideFeed: true });
    }
  },
  onShow() {
    const state = petService.state();
    if (!state.adopted) return wx.redirectTo({ url: '/pages/pet-adopt/index' });
    const decorated = decorate(state);
    this.setData({
      theme: getApp().globalData.theme,
      state: decorated,
      petImage: catalog.PET_BLUE_IDLE,
      canFeed: decorated.canFeed,
      canPlay: decorated.canPlay,
      canSleep: decorated.canSleep,
    });
    if (this.data.guideFeed) {
      this.setData({ guideFeed: false, reaction: '先喂一次星星饼干，看看芽芽的反应吧！' });
    }
    this.scheduleBehavior();
  },
  onBack() { nav.navigateBack({ fallbackUrl: '/pages/map/index' }); },
  react() {
    this.runBehavior({
      image: catalog.PET_BLUE_HAPPY,
      className: 'is-bounce',
      caption: '我们又一起成长了一点！',
      duration: 1900,
    });
  },
  feed() {
    if (!this.data.canFeed) {
      wx.showToast({ title: '已经吃得很饱啦', icon: 'none' });
      return;
    }
    const result = petService.feed();
    wx.showToast({ title: result.message, icon: 'none' });
    if (result.ok) {
      this.refreshState();
      this.runBehavior({ image: catalog.PET_BLUE_EAT, className: 'is-nibble', caption: '星星饼干真好吃！', duration: 2400 });
    }
  },
  play() {
    if (!this.data.canPlay) {
      wx.showToast({ title: '活力不足，让小宠先睡一会儿吧', icon: 'none' });
      return;
    }
    const result = petService.play('toy_bouncy_ball');
    wx.showToast({ title: result.message, icon: 'none' });
    if (result.ok) {
      this.refreshState();
      this.runBehavior({ image: catalog.PET_BLUE_PLAY, className: 'is-wiggle', caption: '弹弹球时间！', duration: 2800 });
    }
  },
  sleep() {
    if (!this.data.canSleep) {
      wx.showToast({ title: '现在精神很好，暂时不需要睡觉', icon: 'none' });
      return;
    }
    const result = petService.sleep();
    wx.showToast({ title: result.message, icon: 'none' });
    if (result.ok) {
      this.refreshState();
      this.runBehavior({ image: catalog.PET_BLUE_SLEEPY, className: 'is-breathe', caption: '呼呼…睡得好香。', duration: 3200 });
    }
  },
  refreshState() {
    const decorated = decorate(petService.state());
    this.setData({
      state: decorated,
      canFeed: decorated.canFeed,
      canPlay: decorated.canPlay,
      canSleep: decorated.canSleep,
    });
  },
  go(e) { nav.navigateTo(e.currentTarget.dataset.path); },
  runBehavior(behavior) {
    this.clearBehaviorTimers();
    this.setData({
      petImage: behavior.image,
      reaction: behavior.caption,
      reactionClass: behavior.className,
    });
    this._behaviorResetTimer = setTimeout(() => {
      this.setData({
        petImage: catalog.PET_BLUE_IDLE,
        reaction: '今天也一起学一小关吧。',
        reactionClass: '',
      });
      this.scheduleBehavior();
    }, behavior.duration);
  },
  scheduleBehavior() {
    this.clearBehaviorTimers();
    const delay = 6000 + Math.floor(Math.random() * 8000);
    this._behaviorTimer = setTimeout(() => {
      const behavior = RANDOM_BEHAVIORS[Math.floor(Math.random() * RANDOM_BEHAVIORS.length)];
      this.runBehavior(behavior);
    }, delay);
  },
  clearBehaviorTimers() {
    if (this._behaviorTimer) clearTimeout(this._behaviorTimer);
    if (this._behaviorResetTimer) clearTimeout(this._behaviorResetTimer);
    this._behaviorTimer = null;
    this._behaviorResetTimer = null;
  },
  onHide() { this.clearBehaviorTimers(); },
  onUnload() { this.clearBehaviorTimers(); },
});
