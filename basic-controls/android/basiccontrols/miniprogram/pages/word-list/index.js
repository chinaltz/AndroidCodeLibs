const storage = require('../../utils/storage');
const nav = require('../../utils/nav');
const dictationQueue = require('../../utils/dictation-queue');

const DAY = 24 * 60 * 60 * 1000;
const SORT_TIME = 'time';
const SORT_WRONG_COUNT = 'wrongCount';

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
  if (target === current - 7 * DAY) return '上周';
  const key = weekKey(time).split('-W');
  return `${key[0]} 第 ${Number(key[1])} 周`;
}

function enrichCharacters(characters, childId) {
  const legacyWords = childId ? storage.getWords(childId) : storage.getWords();
  return characters.map((character, index) => {
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
      relatedWordTexts: relatedWordTexts,
      relatedWords: relatedWordTexts.join('、') || '暂无关联词',
      sortTime,
      statusLabel: character.status === '已掌握' ? '已掌握' : '',
    });
  });
}

function filterCharacters(characters, keyword) {
  const query = String(keyword || '').trim().toLowerCase();
  if (!query) return characters.slice();
  return characters.filter((character) => (
    [character.text, character.relatedWords, character.statusLabel].join(' ').toLowerCase().includes(query)
  ));
}

function withSelection(characters, selectedIds) {
  const selectedMap = {};
  selectedIds.forEach((id) => { selectedMap[id] = true; });
  return characters.map((character) => Object.assign({}, character, {
    selected: !!selectedMap[character.id],
  }));
}

function countPending(characters) {
  return characters.filter((character) => character.status !== '已掌握').length;
}

function buildTimeGroups(characters, selectedIds) {
  const groups = [];
  characters
    .slice()
    .sort((a, b) => b.sortTime - a.sortTime)
    .forEach((character) => {
      const key = weekKey(character.sortTime);
      let group = groups.find((item) => item.key === key);
      if (!group) {
        group = {
          key,
          label: weekLabel(character.sortTime),
          count: 0,
          pendingCount: 0,
          characters: [],
          showGroupHead: true,
          selectAction: 'week',
        };
        groups.push(group);
      }
      group.characters.push(character);
      group.count += 1;
      if (character.status !== '已掌握') group.pendingCount += 1;
    });
  return groups.map((group) => Object.assign({}, group, {
    characters: withSelection(group.characters, selectedIds),
  }));
}

function buildWrongCountList(characters, selectedIds) {
  const sorted = characters
    .slice()
    .sort((a, b) => {
      const diff = (b.wrongCount || 0) - (a.wrongCount || 0);
      if (diff !== 0) return diff;
      return b.sortTime - a.sortTime;
    });
  if (!sorted.length) return [];
  return [{
    key: 'wrong-count',
    label: '错次排行',
    count: sorted.length,
    pendingCount: countPending(sorted),
    characters: withSelection(sorted, selectedIds),
    showGroupHead: true,
    selectAction: 'all',
  }];
}

function buildCharacterView(characters, keyword, selectedIds, sortMode) {
  const filtered = filterCharacters(characters, keyword);
  if (sortMode === SORT_WRONG_COUNT) {
    return buildWrongCountList(filtered, selectedIds);
  }
  return buildTimeGroups(filtered, selectedIds);
}

function buildDictationQueue(selectedIds, characters) {
  const selectedMap = {};
  selectedIds.forEach((id) => { selectedMap[id] = true; });
  const queue = [];
  const seen = {};
  characters.forEach((character) => {
    if (!selectedMap[character.id]) return;
    (character.relatedWordTexts || []).forEach((wordText) => {
      if (!wordText || seen[wordText]) return;
      seen[wordText] = true;
      queue.push(dictationQueue.createQueueItem({
        text: wordText,
        sourceLabel: '错字复习',
      }));
    });
  });
  return queue.filter(Boolean);
}

Page({
  data: {
    theme: {},
    allCharacters: [],
    groups: [],
    keyword: '',
    selectedIds: [],
    selectedCount: 0,
    sortMode: SORT_TIME,
    sortModes: [
      { id: SORT_TIME, label: '按时间' },
      { id: SORT_WRONG_COUNT, label: '按错次' },
    ],
  },

  rebuildGroups(keyword, selectedIds, sortMode) {
    return buildCharacterView(
      this.data.allCharacters,
      keyword != null ? keyword : this.data.keyword,
      selectedIds || this.data.selectedIds,
      sortMode != null ? sortMode : this.data.sortMode,
    );
  },

  refreshList(keyword, selectedIds, sortMode) {
    const child = storage.getCurrentChild();
    const childId = child && child.id;
    const characters = enrichCharacters(storage.getCharacters(childId), childId);
    const nextSortMode = sortMode != null ? sortMode : this.data.sortMode;
    this.setData({
      theme: getApp().globalData.theme,
      allCharacters: characters,
      sortMode: nextSortMode,
      groups: buildCharacterView(
        characters,
        keyword != null ? keyword : this.data.keyword,
        selectedIds || this.data.selectedIds,
        nextSortMode,
      ),
    });
  },

  onShow() {
    this.refreshList();
  },

  onBack() {
    nav.navigateBack();
  },

  goManualWrongEntry() {
    nav.navigateTo('/pages/word-edit/index');
  },

  onSortTap(e) {
    const sortMode = e.currentTarget.dataset.mode;
    if (!sortMode || sortMode === this.data.sortMode) return;
    this.setData({
      sortMode,
      groups: this.rebuildGroups(this.data.keyword, this.data.selectedIds, sortMode),
    });
  },

  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword,
      groups: this.rebuildGroups(keyword, this.data.selectedIds, this.data.sortMode),
    });
  },

  toggleCharacter(e) {
    const id = e.currentTarget.dataset.id;
    const selectedIds = this.data.selectedIds.slice();
    const index = selectedIds.indexOf(id);
    if (index >= 0) selectedIds.splice(index, 1);
    else selectedIds.push(id);
    this.setData({
      selectedIds,
      selectedCount: selectedIds.length,
      groups: this.rebuildGroups(this.data.keyword, selectedIds, this.data.sortMode),
    });
  },

  selectGroup(e) {
    const key = e.currentTarget.dataset.key;
    const group = this.data.groups.find((item) => item.key === key);
    if (!group) return;
    const selectedIds = this.data.selectedIds.slice();
    group.characters.forEach((character) => {
      if (selectedIds.indexOf(character.id) < 0) selectedIds.push(character.id);
    });
    this.setData({
      selectedIds,
      selectedCount: selectedIds.length,
      groups: this.rebuildGroups(this.data.keyword, selectedIds, this.data.sortMode),
    });
  },

  clearSelection() {
    this.setData({
      selectedIds: [],
      selectedCount: 0,
      groups: this.rebuildGroups(this.data.keyword, [], this.data.sortMode),
    });
  },

  onDeleteSelected() {
    const selectedIds = this.data.selectedIds.slice();
    if (!selectedIds.length) return;
    const labels = selectedIds
      .map((id) => {
        const item = this.data.allCharacters.find((character) => character.id === id);
        return item ? item.text : '';
      })
      .filter(Boolean)
      .slice(0, 8)
      .join('、');
    const suffix = selectedIds.length > 8 ? ' 等' : '';
    wx.showModal({
      title: '删除错字',
      content: `确定删除已选的 ${selectedIds.length} 个错字（${labels}${suffix}）？`,
      confirmColor: '#A92F3A',
      success: (res) => {
        if (!res.confirm) return;
        const childId = storage.getCurrentChildId();
        let deleted = 0;
        selectedIds.forEach((id) => {
          if (storage.deleteCharacter(id, childId)) deleted += 1;
        });
        if (!deleted) {
          wx.showToast({ title: '删除失败', icon: 'none' });
          return;
        }
        this.refreshList(this.data.keyword, [], this.data.sortMode);
        this.setData({ selectedIds: [], selectedCount: 0 });
        wx.showToast({ title: `已删除 ${deleted} 个字`, icon: 'success' });
      },
    });
  },

  startDictation() {
    const queue = buildDictationQueue(
      this.data.selectedIds,
      this.data.allCharacters,
    );
    if (!queue.length) {
      wx.showToast({ title: '所选错字暂无关联听写词', icon: 'none' });
      return;
    }
    dictationQueue.setQueue(queue);
    nav.navigateTo('/pages/dictation-player/index');
  },
});
