const { GROUPS, PHONEMES, firstUnfinished } = require('../../data/phonemes');
const nav = require('../../utils/nav');
const audio = require('../../utils/audio');
const share = require('../../utils/share');
const storage = require('../../utils/storage');

function buildCellStyleMap(completed, currentId, theme) {
  const cellStyleMap = {};
  PHONEMES.forEach((p) => {
    const done = completed.indexOf(p.id) >= 0;
    const active = p.id === currentId;
    cellStyleMap[p.id] = {
      bg: done ? theme.selectedFill : (active ? theme.activeFill : theme.surfaceRaised),
      border: done ? theme.success : (active ? theme.warning : theme.borderDefault),
    };
  });
  return cellStyleMap;
}

Page({
  data: {
    theme: {},
    groups: GROUPS,
    currentId: '',
    completed: [],
    cellStyleMap: {},
    progressText: '',
    progressRatio: 0,
    percentText: '0%',
    startText: '',
    i18n: {},
  },

  onShow() {
    const app = getApp();
    const completed = storage.getCompleted();
    app.globalData.completed = completed;
    const current = firstUnfinished(completed);
    const theme = app.globalData.theme;
    const ratio = completed.length / PHONEMES.length;
    this.setData({
      theme,
      completed,
      currentId: current.id,
      cellStyleMap: buildCellStyleMap(completed, current.id, theme),
      progressRatio: ratio,
      progressText: app.tf('page/map/progress', completed.length, PHONEMES.length),
      percentText: Math.round(ratio * 100) + '%',
      startText: app.tf('btn/start_learn', current.symbol),
      i18n: {
        title: '音标星球',
        subtitle: '48 个音标',
        hint: app.t('page/map/hint'),
      },
    });
    wx.setNavigationBarColor({
      frontColor: theme.dark ? '#ffffff' : '#000000',
      backgroundColor: theme.pageStart,
    });
  },

  onLoad() {
    share.enableShareMenu();
  },

  onHide() {
    audio.stopTeaching();
  },

  onBack() {
    nav.navigateBack();
  },

  onPhonemeTap(e) {
    const id = e.currentTarget.dataset.id;
    const phoneme = PHONEMES.find((item) => item.id === id) || PHONEMES[0];
    const app = getApp();
    this.setData({
      currentId: id,
      cellStyleMap: buildCellStyleMap(this.data.completed, id, this.data.theme),
      startText: app.tf('btn/start_learn', phoneme.symbol),
    });
    audio.play(audio.phonemePath(id)).catch(() => {
      wx.showToast({ title: app.tf('toast/play_failed', phoneme.symbol), icon: 'none' });
    });
  },

  onStartLearn() {
    nav.navigateTo(`/pages/learn/index?id=${this.data.currentId}`);
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
