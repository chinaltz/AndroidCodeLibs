const { CATEGORY_GROUPS, UNITS, firstUnfinished } = require('../../../data/pinyin-units');
const audio = require('../../../utils/audio');
const nav = require('../../../utils/nav');
const storage = require('../../../utils/storage');

function decorateUnits(items, completed, currentId) {
  const completedMap = {};
  completed.forEach((id) => { completedMap[id] = true; });
  return items.map((item) => Object.assign({}, item, {
    done: !!completedMap[item.id],
    active: item.id === currentId,
    missingAudio: !item.audioId,
  }));
}

function decorateGroups(completed, currentId) {
  return CATEGORY_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    count: group.items.length,
    items: decorateUnits(group.items, completed, currentId),
  }));
}

Page({
  data: {
    theme: {},
    completed: [],
    currentId: '',
    currentSymbol: '',
    progressText: '0 / 63',
    progressRatio: 0,
    percentText: '0%',
    groups: [],
  },

  onShow() {
    const theme = getApp().globalData.theme;
    const completed = storage.getPinyinCompleted();
    const lastId = storage.getPinyinLastUnit();
    const current = lastId ? UNITS.find((item) => item.id === lastId) || firstUnfinished(completed) : firstUnfinished(completed);
    const ratio = completed.length / UNITS.length;
    this.setData({
      theme,
      completed,
      currentId: current.id,
      currentSymbol: current.symbol,
      progressText: `${completed.length} / ${UNITS.length}`,
      progressRatio: ratio,
      percentText: `${Math.round(ratio * 100)}%`,
      groups: decorateGroups(completed, current.id),
    });
    wx.setNavigationBarColor({
      frontColor: theme.dark ? '#ffffff' : '#000000',
      backgroundColor: theme.pageStart,
    });
  },

  onBack() {
    nav.navigateBack();
  },

  onUnitTap(e) {
    const id = e.currentTarget.dataset.id;
    const unit = UNITS.find((item) => item.id === id);
    if (!unit) return;
    storage.setPinyinLastUnit(id);
    this.setData({
      currentId: id,
      currentSymbol: unit.symbol,
      groups: decorateGroups(this.data.completed, id),
    });
    if (!unit.audioId) {
      wx.showToast({ title: `${unit.symbol} 的标准音待补录`, icon: 'none' });
      return;
    }
    audio.play(audio.pinyinTeachingPath(unit.audioId), unit.symbol).catch(() => {
      wx.showToast({ title: `${unit.symbol} 播放失败`, icon: 'none' });
    });
  },

  onStartLearn() {
    nav.navigateTo(`/packages/pinyin/pages/pinyin-learn/index?id=${this.data.currentId}`);
  },

});
