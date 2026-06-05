const storage = require('../../utils/storage');
const nav = require('../../utils/nav');

function viewWords(words) {
  return words.map((word) => Object.assign({}, word, {
    sourceLabel: word.sourceLabel || '日常',
    meta: word.meta || word.sourceLabel || '日常',
    relationLabel: (word.unknownCharacterRefs || []).map((item) => item.text).join('、'),
  }));
}

function buildCharacterViews(characters, words) {
  return characters.map((character) => {
    const relatedWords = words
      .filter((word) => (word.unknownCharacterRefs || [])
        .some((ref) => ref.characterId === character.id || ref.text === character.text))
      .map((word) => word.text);
    return Object.assign({}, character, {
      relatedWords: Array.from(new Set(relatedWords)).join('、'),
    });
  }).filter((character) => character.relatedWords);
}

function matchesSearch(word, keyword) {
  if (!keyword) return true;
  return [word.text, word.pinyin, word.sourceLabel, word.weekLabel]
    .join(' ')
    .toLowerCase()
    .indexOf(keyword.toLowerCase()) >= 0;
}

function startOfWeek(time) {
  const date = new Date(time);
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day + 1);
  return date.getTime();
}

function matchesFilter(word, filter) {
  if (filter === '高频错字') return (word.relationWrongCount || 0) >= 3 && word.status !== '已掌握';
  if (filter === '已掌握') return word.status === '已掌握';
  if (filter === '本周新增') return (word.createdAt || 0) >= startOfWeek(Date.now());
  return word.status !== '已掌握' && !word.dictationOnly;
}

function applyVisibleState(words, keyword, selectedWords, filter) {
  const selectedMap = {};
  selectedWords.forEach((id) => { selectedMap[id] = true; });
  return viewWords(words)
    .filter((word) => matchesSearch(word, keyword))
    .filter((word) => matchesFilter(word, filter))
    .map((word) => Object.assign({}, word, { selected: !!selectedMap[word.id] }));
}

Page({
  data: {
    theme: {},
    stats: {
      pendingCount: 0,
      todayCount: 0,
      maxWrongCount: 0,
    },
    filters: ['待复习', '高频错字', '已掌握', '本周新增'],
    activeFilter: '待复习',
    words: [],
    allWords: [],
    wordSearch: '',
    selectedWords: [],
    selectedCount: 0,
    characters: [],
  },

  onShow() {
    const app = getApp();
    const child = storage.getCurrentChild();
    const words = storage.getWords(child && child.id);
    const storedCharacters = storage.getCharacters(child && child.id);
    const characterMap = {};
    storedCharacters.forEach((character) => { characterMap[character.id] = character; });
    const allWords = viewWords(words).map((word) => Object.assign({}, word, {
      relationWrongCount: (word.unknownCharacterRefs || []).reduce((max, ref) => (
        Math.max(max, (characterMap[ref.characterId] || {}).wrongCount || 0)
      ), 0),
    }));
    const characters = buildCharacterViews(storedCharacters, allWords);
    const selectedWords = this.data.selectedWords.filter((id) => allWords.some((word) => word.id === id));
    this.setData({
      theme: app.globalData.theme,
      stats: storage.getWordStats(child && child.id),
      allWords,
      selectedWords,
      selectedCount: selectedWords.length,
      words: applyVisibleState(allWords, this.data.wordSearch, selectedWords, this.data.activeFilter),
      characters,
    });
  },

  onBack() {
    wx.navigateBack();
  },

  goAddWord() {
    nav.navigateTo('/pages/word-edit/index');
  },

  goAllWords() {
    nav.navigateTo('/pages/word-list/index');
  },

  onFilterTap(e) {
    const activeFilter = e.currentTarget.dataset.filter;
    this.setData({
      activeFilter,
      words: applyVisibleState(this.data.allWords, this.data.wordSearch, this.data.selectedWords, activeFilter),
    });
  },

  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      wordSearch: keyword,
      words: applyVisibleState(this.data.allWords, keyword, this.data.selectedWords, this.data.activeFilter),
    });
  },

  toggleWord(e) {
    const id = e.currentTarget.dataset.id;
    const selected = this.data.selectedWords.slice();
    const index = selected.indexOf(id);
    if (index >= 0) selected.splice(index, 1);
    else selected.push(id);
    this.setData({
      selectedWords: selected,
      selectedCount: selected.length,
      words: applyVisibleState(this.data.allWords, this.data.wordSearch, selected, this.data.activeFilter),
    });
  },

  clearSelection() {
    this.setData({
      selectedWords: [],
      selectedCount: 0,
      words: applyVisibleState(this.data.allWords, this.data.wordSearch, [], this.data.activeFilter),
    });
  },

  editWord(e) {
    nav.navigateTo(`/pages/word-edit/index?id=${e.currentTarget.dataset.id}`);
  },

  markWordWrong(e) {
    storage.markWordWrong(e.currentTarget.dataset.id);
    wx.showToast({ title: '不会字错误次数 +1', icon: 'none' });
    this.onShow();
  },

  startSelectedDictation() {
    const queue = this.data.allWords.filter((word) => this.data.selectedWords.indexOf(word.id) >= 0);
    if (!queue.length) {
      wx.showToast({ title: '先选择字词', icon: 'none' });
      return;
    }
    wx.setStorageSync('dictation_queue', queue);
    nav.navigateTo('/pages/dictation-player/index');
  },

  coming(e) {
    wx.showToast({ title: `${e.currentTarget.dataset.name}开发中`, icon: 'none' });
  },
});
