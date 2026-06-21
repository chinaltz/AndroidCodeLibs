const nav = require('../../../../utils/nav');
const petRoutes = require('../../../../utils/pet-routes');
const petService = require('../../../../utils/pet-service');
const catalog = require('../../../../config/pet-catalog');

const IDLE_CAPTION = '今天也一起学一小关吧。';

const RANDOM_BEHAVIORS = [
  { image: catalog.PET_BLUE_IDLE, className: 'is-look', caption: '这里好像有新的声音。', duration: 1800 },
  { image: catalog.PET_BLUE_HAPPY, className: 'is-bounce', caption: '今天也很开心！', duration: 2100 },
  { image: catalog.PET_BLUE_SLEEPY, className: 'is-breathe', caption: '让我慢慢休息一下。', duration: 2500 },
  { image: catalog.PET_BLUE_IDLE, className: 'is-sway', caption: '我在等下一次学习冒险。', duration: 2200 },
  { image: catalog.PET_BLUE_IDLE, className: 'is-blink', caption: '眨眨眼，继续陪着你。', duration: 1500 },
  { image: catalog.PET_BLUE_HAPPY, className: 'is-wiggle', caption: '星星在闪，我也想动一动。', duration: 1900 },
];

const TAP_BEHAVIORS = [
  { image: catalog.PET_BLUE_HAPPY, className: 'is-bounce', caption: '嘿嘿，被你点到啦！', duration: 1700 },
  { image: catalog.PET_BLUE_HAPPY, className: 'is-wiggle', caption: '我们一起加油学！', duration: 1800 },
  { image: catalog.PET_BLUE_IDLE, className: 'is-sway', caption: '摸摸头，心情 +1。', duration: 1600 },
  { image: catalog.PET_BLUE_HAPPY, className: 'is-bounce', caption: '今天又见面啦！', duration: 1700 },
];

const FLOATER_KINDS = [
  { kind: 'heart', emoji: '♥' },
  { kind: 'star', emoji: '★' },
  { kind: 'spark', emoji: '✨' },
];

function decorate(state) {
  const next = state.nextLevel;
  const playCost = petService.playEnergyCost(catalog.findItem('toy_bouncy_ball') || { energy: -10 });
  const equippedImages = Object.keys(state.equipped)
    .map((slot) => catalog.findItem(state.equipped[slot]))
    .filter(Boolean)
    .map((item) => ({ id: item.id, image: item.image, slot: item.slot, style: catalog.accessoryStyle(item, 1) }));
  return {
    profile: state.profile,
    points: state.points,
    xp: state.xp,
    level: state.level,
    stageTitle: state.stageTitle,
    levelProgress: state.levelProgress,
    status: state.status,
    nextText: next ? `再获得 ${next.totalXp - state.xp} XP 升到 ${next.level} 级` : '已达到当前最高等级',
    progressStyle: `width:${state.levelProgress}%;`,
    petImage: state.petImage,
    equippedImages,
    canFeed: state.status.hunger < 90,
    canPlay: state.status.energy >= playCost,
    canSleep: state.status.energy <= petService.SLEEP_ENERGY_THRESHOLD,
  };
}

Page({
  data: {
    theme: {},
    state: {},
    petImage: catalog.PET_BLUE_IDLE,
    reaction: IDLE_CAPTION,
    reactionClass: '',
    bodyAnimClass: 'is-idle-live',
    captionPop: false,
    floaters: [],
    canFeed: true,
    canPlay: true,
    canSleep: true,
    guideFeed: false,
  },
  onLoad(options) {
    if (options && options.guide === 'feed') {
      this.setData({ guideFeed: true });
    }
    const snapshot = petService.state();
    if (!snapshot.adopted) {
      this._navPending = true;
      wx.redirectTo({
        url: petRoutes.adopt,
        fail: () => {
          this._navPending = false;
        },
      });
    }
  },
  onShow() {
    if (this._navPending) return;
    this._pageHidden = false;
    this.clearAllTimers();
    const snapshot = petService.state();
    if (!snapshot.adopted) {
      this._navPending = true;
      wx.redirectTo({
        url: petRoutes.adopt,
        fail: () => {
          this._navPending = false;
        },
      });
      return;
    }
    const decorated = decorate(snapshot);
    const patch = {
      theme: getApp().globalData.theme,
      state: decorated,
      petImage: decorated.petImage,
      canFeed: decorated.canFeed,
      canPlay: decorated.canPlay,
      canSleep: decorated.canSleep,
    };
    if (!this.data.reactionClass) {
      patch.reaction = IDLE_CAPTION;
      patch.reactionClass = '';
      patch.bodyAnimClass = 'is-idle-live';
    }
    this.setData(patch);
    if (this.data.guideFeed) {
      this.setData({ guideFeed: false, reaction: '先喂一次星星饼干，看看芽芽的反应吧！' });
      this.popCaption();
    }
    this.scheduleBehavior();
    this.scheduleAmbient();
  },
  onBack() { nav.navigateBack({ fallbackUrl: '/pages/map/index' }); },
  react() {
    if (this._lastTapAt && Date.now() - this._lastTapAt < 450) return;
    this._lastTapAt = Date.now();
    if (typeof wx.vibrateShort === 'function') {
      wx.vibrateShort({ type: 'light' });
    }
    const petResult = petService.pet();
    if (petResult.ok) this.refreshState();
    const preset = TAP_BEHAVIORS[Math.floor(Math.random() * TAP_BEHAVIORS.length)];
    const behavior = Object.assign({}, preset, { caption: petResult.message || preset.caption });
    this.spawnFloaters(3);
    this.runBehavior(behavior);
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
      this.spawnFloaters(2, 'star');
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
      this.spawnFloaters(4, 'spark');
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
  popCaption() {
    this.setData({ captionPop: true });
    if (this._captionPopTimer) clearTimeout(this._captionPopTimer);
    this._captionPopTimer = setTimeout(() => {
      this.setData({ captionPop: false });
    }, 420);
  },
  spawnFloaters(count, kind) {
    const floaters = [];
    const base = Date.now();
    for (let i = 0; i < count; i += 1) {
      const preset = kind
        ? FLOATER_KINDS.find((item) => item.kind === kind) || FLOATER_KINDS[1]
        : FLOATER_KINDS[Math.floor(Math.random() * FLOATER_KINDS.length)];
      floaters.push({
        id: `${base}_${i}`,
        kind: preset.kind,
        emoji: preset.emoji,
        left: 34 + Math.floor(Math.random() * 32),
        delay: i * 90,
      });
    }
    this.setData({ floaters });
    if (this._floaterTimer) clearTimeout(this._floaterTimer);
    this._floaterTimer = setTimeout(() => {
      this.setData({ floaters: [] });
    }, 1400);
  },
  runBehavior(behavior) {
    this.clearBehaviorTimers();
    let emotion = 'idle';
    if (behavior.image === catalog.PET_BLUE_HAPPY) emotion = 'happy';
    else if (behavior.image === catalog.PET_BLUE_EAT) emotion = 'eat';
    else if (behavior.image === catalog.PET_BLUE_PLAY) emotion = 'play';
    else if (behavior.image === catalog.PET_BLUE_SLEEPY) emotion = 'sleepy';
    this.setData({
      petImage: catalog.petImageForLevel(this.data.state.level || 1, emotion),
      reaction: behavior.caption,
      reactionClass: behavior.className,
      bodyAnimClass: behavior.className,
    });
    this.popCaption();
    this._behaviorResetTimer = setTimeout(() => {
      if (this._pageHidden || this._navPending) return;
      this.setData({
        petImage: catalog.petImageForLevel(this.data.state.level || 1, 'idle'),
        reaction: IDLE_CAPTION,
        reactionClass: '',
        bodyAnimClass: 'is-idle-live',
      });
      this.popCaption();
      this.scheduleBehavior();
    }, behavior.duration);
  },
  scheduleBehavior() {
    if (this._pageHidden || this._navPending) return;
    if (this._behaviorTimer) clearTimeout(this._behaviorTimer);
    const delay = 5000 + Math.floor(Math.random() * 7000);
    this._behaviorTimer = setTimeout(() => {
      if (this._pageHidden || this._navPending || this.data.reactionClass) return;
      const behavior = RANDOM_BEHAVIORS[Math.floor(Math.random() * RANDOM_BEHAVIORS.length)];
      this.runBehavior(behavior);
    }, delay);
  },
  scheduleAmbient() {
    if (this._pageHidden || this._navPending) return;
    if (this._ambientTimer) clearTimeout(this._ambientTimer);
    const delay = 8000 + Math.floor(Math.random() * 10000);
    this._ambientTimer = setTimeout(() => {
      if (this._pageHidden || this._navPending) return;
      if (!this.data.reactionClass && Math.random() > 0.35) {
        this.spawnFloaters(1);
      }
      if (!this.data.reactionClass && Math.random() > 0.55) {
        this.setData({ bodyAnimClass: 'is-idle-nudge' });
        if (this._nudgeTimer) clearTimeout(this._nudgeTimer);
        this._nudgeTimer = setTimeout(() => {
          if (!this.data.reactionClass) {
            this.setData({ bodyAnimClass: 'is-idle-live' });
          }
        }, 1200);
      }
      this.scheduleAmbient();
    }, delay);
  },
  clearBehaviorTimers() {
    if (this._behaviorTimer) clearTimeout(this._behaviorTimer);
    if (this._behaviorResetTimer) clearTimeout(this._behaviorResetTimer);
    this._behaviorTimer = null;
    this._behaviorResetTimer = null;
  },
  clearAllTimers() {
    this.clearBehaviorTimers();
    if (this._ambientTimer) clearTimeout(this._ambientTimer);
    if (this._floaterTimer) clearTimeout(this._floaterTimer);
    if (this._captionPopTimer) clearTimeout(this._captionPopTimer);
    if (this._nudgeTimer) clearTimeout(this._nudgeTimer);
    this._ambientTimer = null;
    this._floaterTimer = null;
    this._captionPopTimer = null;
    this._nudgeTimer = null;
  },
  onHide() {
    this._pageHidden = true;
    this.clearAllTimers();
  },
  onUnload() {
    this._pageHidden = true;
    this.clearAllTimers();
  },
});
