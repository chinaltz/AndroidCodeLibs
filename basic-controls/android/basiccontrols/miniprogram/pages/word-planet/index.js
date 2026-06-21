const storage = require('../../utils/storage');
const nav = require('../../utils/nav');
const dictationQueue = require('../../utils/dictation-queue');

const DAY = 24 * 60 * 60 * 1000;
const HIGH_FREQ_THRESHOLD = 3;
const RECENT_DAYS = 7;

const FILTERS = [
  { id: '全部', desc: '当前积累的全部错字。' },
  { id: '高频错字', desc: '错次较多，建议重点听写。' },
  { id: '本周新增', desc: '本周首次加入错字库的字。' },
  { id: '最近错字', desc: '近 7 天内又写错过的字。' },
  { id: '已掌握', desc: '连续写对后暂时不再提醒。' },
];

function startOfWeek(time) {
  const date = new Date(time);
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day + 1);
  return date.getTime();
}

function enrichCharacter(character, index, childId) {
  const legacyWords = storage.getWords(childId);
  let relatedWordTexts = (character.relatedWordTexts || []).slice();
  if (!relatedWordTexts.length) {
    legacyWords.forEach((word) => {
      const linked = (word.unknownCharacterRefs || []).some((ref) => (
        ref.characterId === character.id || ref.text === character.text
      ));
      if (linked && relatedWordTexts.indexOf(word.text) < 0) relatedWordTexts.push(word.text);
    });
  }
  const sortTime = character.lastWrongAt || character.createdAt || Date.now() - (index % 3) * DAY;
  return Object.assign({}, character, {
    relatedWords: relatedWordTexts.join('、') || '暂无关联词',
    relatedWordTexts: relatedWordTexts,
    sortTime,
  });
}

function matchesFilter(character, filter) {
  if (filter === '全部') return character.status !== '已掌握';
  if (filter === '高频错字') {
    return (character.wrongCount || 0) >= HIGH_FREQ_THRESHOLD && character.status !== '已掌握';
  }
  if (filter === '本周新增') return (character.createdAt || 0) >= startOfWeek(Date.now());
  if (filter === '最近错字') {
    const recentStart = Date.now() - RECENT_DAYS * DAY;
    return (character.lastWrongAt || 0) >= recentStart && character.status !== '已掌握';
  }
  if (filter === '已掌握') return character.status === '已掌握';
  return true;
}

function sortCharacters(characters, filter) {
  return characters.slice().sort((a, b) => {
    if (filter === '高频错字') {
      const diff = (b.wrongCount || 0) - (a.wrongCount || 0);
      if (diff !== 0) return diff;
    }
    if (filter === '本周新增') {
      const diff = (b.createdAt || 0) - (a.createdAt || 0);
      if (diff !== 0) return diff;
    }
    const timeDiff = (b.lastWrongAt || b.createdAt || 0) - (a.lastWrongAt || a.createdAt || 0);
    if (timeDiff !== 0) return timeDiff;
    return (b.wrongCount || 0) - (a.wrongCount || 0);
  });
}

function buildFilterCounts(characters) {
  const counts = {};
  FILTERS.forEach((filter) => {
    counts[filter.id] = characters.filter((character) => matchesFilter(character, filter.id)).length;
  });
  return counts;
}

function buildFilterTabs(characters) {
  const counts = buildFilterCounts(characters);
  return FILTERS.map((filter) => ({
    id: filter.id,
    label: filter.id,
    count: counts[filter.id] || 0,
  }));
}

function applyFilter(characters, filter) {
  return sortCharacters(
    characters.filter((character) => matchesFilter(character, filter)),
    filter,
  );
}

function getFilterDesc(filter) {
  const item = FILTERS.find((entry) => entry.id === filter);
  return item ? item.desc : '';
}

Page({
  data: {
    theme: {},
    stats: {
      pendingCount: 0,
      totalCount: 0,
      maxWrongCount: 0,
    },
    filterTabs: [],
    activeFilter: '全部',
    filterDesc: getFilterDesc('全部'),
    allCharacters: [],
    characters: [],
    dictationPlanCount: 0,
  },

  onShow() {
    const app = getApp();
    const child = storage.getCurrentChild();
    const childId = child && child.id;
    const allCharacters = storage.getCharacters(childId)
      .map((character, index) => enrichCharacter(character, index, childId));
    let activeFilter = this.data.activeFilter || '全部';
    if (!FILTERS.some((filter) => filter.id === activeFilter)) activeFilter = '全部';
    this.setData({
      theme: app.globalData.theme,
      stats: storage.getWordStats(childId),
      allCharacters,
      filterTabs: buildFilterTabs(allCharacters),
      characters: applyFilter(allCharacters, activeFilter),
      filterDesc: getFilterDesc(activeFilter),
      dictationPlanCount: dictationQueue.getQueue().length,
    });
  },

  onBack() {
    nav.navigateBack();
  },

  onFilterTap(e) {
    const activeFilter = e.currentTarget.dataset.filter;
    if (!activeFilter || activeFilter === this.data.activeFilter) return;
    this.setData({
      activeFilter,
      filterDesc: getFilterDesc(activeFilter),
      characters: applyFilter(this.data.allCharacters, activeFilter),
    });
  },

  goTextbookDictation() {
    nav.navigateTo('/pages/textbook-dictation/index');
  },

  goDictationList() {
    nav.navigateTo('/pages/dictation-list/index');
  },

  goStartDictation() {
    if (!dictationQueue.getQueue().length) {
      wx.showModal({
        title: '今天还没有听写计划',
        content: '请先让家长设置今天要听写的内容。',
        confirmText: '设置计划',
        success: (res) => {
          if (res.confirm) this.goDictationList();
        },
      });
      return;
    }
    nav.navigateTo('/pages/dictation-player/index');
  },

  goAllWords() {
    nav.navigateTo('/pages/word-list/index');
  },

  goManualWrongEntry() {
    nav.navigateTo('/pages/word-edit/index');
  },
});
