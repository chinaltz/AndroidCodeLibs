const { GROUPS, PHONEMES, firstUnfinished } = require('../../data/phonemes');
const nav = require('../../utils/nav');
const audio = require('../../utils/audio');
const share = require('../../utils/share');

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
    tabs: [],
    i18n: {},
    statusBarHeight: 20,
    headerHeight: 108,
    tabHeight: 100,
  },

  onShow() {
    const app = getApp();
    const completed = app.globalData.completed || [];
    const current = firstUnfinished(completed);
    const theme = app.globalData.theme;
    const cellStyleMap = buildCellStyleMap(completed, current.id, theme);
    const ratio = completed.length / PHONEMES.length;
    this.setData({
      theme,
      completed,
      currentId: current.id,
      cellStyleMap,
      progressRatio: ratio,
      progressText: app.tf('page/map/progress', completed.length, PHONEMES.length),
      percentText: Math.round(ratio * 100) + '%',
      startText: app.tf('btn/start_learn', current.symbol),
      tabs: [
        { key: 'learn', icon: '⌂', label: app.t('tab/learn') },
        { key: 'settings', icon: '⚙', label: app.t('tab/settings') },
      ],
      i18n: {
        appName: app.t('app/name'),
        appSlogan: app.t('app/slogan'),
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
    const info = wx.getSystemInfoSync();
    let navBarHeight = 44;
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect();
      if (rect && rect.height && rect.top) {
        navBarHeight = rect.height + Math.max(0, rect.top - (info.statusBarHeight || 0)) * 2;
      }
    }
    this.setData({
      statusBarHeight: info.statusBarHeight || 20,
      headerHeight: (info.statusBarHeight || 20) + navBarHeight,
    });
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

  onTabChange(e) {
    if (e.detail.key === 'settings') {
      nav.navigateTo('/pages/settings/index');
    }
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
