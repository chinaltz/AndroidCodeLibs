const storage = require('../../utils/storage');
const nav = require('../../utils/nav');

const DAY = 24 * 60 * 60 * 1000;

function weekStart(time) {
  const date = new Date(time);
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day + 1);
  return date.getTime();
}

function weekKey(time) {
  const start = new Date(weekStart(time));
  const firstThursday = new Date(start.getFullYear(), 0, 4);
  const firstWeekStart = weekStart(firstThursday.getTime());
  const weekNo = Math.floor((start.getTime() - firstWeekStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return `${start.getFullYear()}-W${String(Math.max(1, weekNo)).padStart(2, '0')}`;
}

function weekLabel(time) {
  const current = weekStart(Date.now());
  const target = weekStart(time);
  if (target === current) return '本周';
  if (target === current - 7 * 24 * 60 * 60 * 1000) return '上周';
  const key = weekKey(time).split('-W');
  return `${key[0]} 第 ${Number(key[1])} 周`;
}

function normalizeWords(words) {
  return words.map((word, index) => ({
    ...word,
    sourceLabel: word.sourceLabel || '日常',
    createdAt: word.createdAt || Date.now() - (index % 3) * DAY,
  }));
}

function groupWords(words, keyword, selectedIds) {
  const query = String(keyword || '').trim().toLowerCase();
  const selectedMap = {};
  selectedIds.forEach((id) => { selectedMap[id] = true; });
  const groups = [];
  normalizeWords(words)
    .filter((word) => !query || [word.text, word.pinyin, word.sourceLabel].join(' ').toLowerCase().includes(query))
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((word) => {
      const key = weekKey(word.createdAt);
      let group = groups.find((item) => item.key === key);
      if (!group) {
        group = { key, label: weekLabel(word.createdAt), count: 0, pendingCount: 0, words: [] };
        groups.push(group);
      }
      group.words.push({ ...word, selected: !!selectedMap[word.id] });
      group.count += 1;
      if (word.status !== '已掌握' && !word.dictationOnly) group.pendingCount += 1;
    });
  return groups;
}

Page({
  data: {
    theme: {},
    allWords: [],
    groups: [],
    keyword: '',
    selectedIds: [],
    selectedCount: 0,
  },

  onShow() {
    const child = storage.getCurrentChild();
    const words = storage.getWords(child && child.id);
    this.setData({
      theme: getApp().globalData.theme,
      allWords: words,
      groups: groupWords(words, this.data.keyword, this.data.selectedIds),
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword,
      groups: groupWords(this.data.allWords, keyword, this.data.selectedIds),
    });
  },

  toggleWord(e) {
    const id = e.currentTarget.dataset.id;
    const selectedIds = this.data.selectedIds.slice();
    const index = selectedIds.indexOf(id);
    if (index >= 0) selectedIds.splice(index, 1);
    else selectedIds.push(id);
    this.setData({
      selectedIds,
      selectedCount: selectedIds.length,
      groups: groupWords(this.data.allWords, this.data.keyword, selectedIds),
    });
  },

  selectWeek(e) {
    const key = e.currentTarget.dataset.key;
    const group = this.data.groups.find((item) => item.key === key);
    if (!group) return;
    const selectedIds = this.data.selectedIds.slice();
    group.words.forEach((word) => {
      if (selectedIds.indexOf(word.id) < 0) selectedIds.push(word.id);
    });
    this.setData({
      selectedIds,
      selectedCount: selectedIds.length,
      groups: groupWords(this.data.allWords, this.data.keyword, selectedIds),
    });
  },

  clearSelection() {
    this.setData({
      selectedIds: [],
      selectedCount: 0,
      groups: groupWords(this.data.allWords, this.data.keyword, []),
    });
  },

  startDictation() {
    const queue = this.data.allWords.filter((word) => this.data.selectedIds.indexOf(word.id) >= 0);
    if (!queue.length) {
      wx.showToast({ title: '先选择字词', icon: 'none' });
      return;
    }
    wx.setStorageSync('dictation_queue', queue);
    nav.navigateTo('/pages/dictation-player/index');
  },
});
