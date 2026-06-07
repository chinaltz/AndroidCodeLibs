const storage = require('../../utils/storage');
const nav = require('../../utils/nav');

function splitWords(text) {
  const result = [];
  String(text || '')
    .split(/[\s,，、。；;！!？?\n]+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .forEach((word) => {
      if (result.indexOf(word) < 0) result.push(word);
    });
  return result.slice(0, 30);
}

function buildCharPool(wordList, queuedIds, processedWordTexts) {
  const items = [];
  wordList.forEach((word) => {
    const wordProcessed = processedWordTexts.indexOf(word) >= 0;
    Array.from(word).forEach((char, idx) => {
      const id = word + '__' + idx;
      const inQueue = queuedIds.indexOf(id) >= 0;
      items.push({
        id: id,
        char: char,
        index: idx,
        word: word,
        inQueue: inQueue,
        saved: wordProcessed,
      });
    });
  });
  return items;
}

function buildJudgeList(queuedItems) {
  return queuedItems.map((item) => ({
    id: item.id,
    char: item.char,
    index: item.index,
    word: item.word,
    status: item.status,
  }));
}

function selectedWordsComplete(wordList, queuedItems) {
  const selectedWords = {};
  queuedItems.forEach((item) => { selectedWords[item.word] = true; });
  return Object.keys(selectedWords).every((word) => {
    const expectedCount = Array.from(word).length;
    const selectedCount = queuedItems.filter((item) => item.word === word).length;
    return selectedCount === expectedCount && wordList.indexOf(word) >= 0;
  });
}

Page({
  data: {
    theme: {},
    batchText: '',
    charPool: [],
    judgeList: [],
    allDecided: false,
    selectionComplete: false,
    savedEntries: [],
  },

  _wordList: [],
  _queuedItems: [],
  _processedWordTexts: [],

  onShow() {
    this.setData({
      theme: getApp().globalData.theme,
    });
  },

  onBack() {
    nav.navigateBack();
  },

  openBatchEditor() {
    wx.showModal({
      title: '批量输入听写词',
      content: this.data.batchText || '',
      editable: true,
      placeholderText: '用逗号、顿号或空格分隔词语',
      confirmText: '确定',
      success: (result) => {
        if (!result.confirm) return;
        this._applyBatchText((result.content || '').slice(0, 200));
      },
    });
  },

  _applyBatchText(batchText) {
    this._wordList = splitWords(batchText);
    this._queuedItems = this._queuedItems.filter((q) => (
      this._wordList.some((w) => q.id.indexOf(w + '__') === 0)
    ));
    this._render(batchText);
  },

  onCharTap(e) {
    const id = e.currentTarget.dataset.id;
    const pool = this.data.charPool;
    const poolItem = pool.find((p) => p.id === id);
    if (!poolItem || poolItem.saved || poolItem.inQueue) return;
    this._queuedItems.push({
      id: id,
      char: poolItem.char,
      index: poolItem.index,
      word: poolItem.word,
      status: 'pending',
    });
    this._render(this.data.batchText);
  },

  onJudgeTap(e) {
    const id = e.currentTarget.dataset.id;
    const judge = e.currentTarget.dataset.judge;
    const item = this._queuedItems.find((q) => q.id === id);
    if (!item) return;
    item.status = judge;
    this._render(this.data.batchText);
  },

  onSave() {
    const selectionComplete = selectedWordsComplete(this._wordList, this._queuedItems);
    const allDecided = this._queuedItems.length > 0 &&
      this._queuedItems.every((item) => item.status !== 'pending');
    if (!selectionComplete || !allDecided) return;

    const wordMap = {};
    this._queuedItems.forEach((item) => {
      if (!wordMap[item.word]) wordMap[item.word] = [];
      wordMap[item.word].push(item);
    });

    const savedEntries = [];
    Object.keys(wordMap).forEach((word) => {
      const chars = wordMap[word];
      const unknownChars = [];
      chars.forEach((item) => {
        if (item.status === 'unknown') {
          unknownChars.push({ index: item.index, char: item.char });
        }
      });

      if (unknownChars.length) {
        storage.recordManualWrongChars(word, unknownChars, null, {
          sourceLabel: '手动录入错字',
        });
        savedEntries.push({
          id: `manual_${Date.now()}_${word}`,
          word,
          chars: unknownChars.map((item) => item.char).join('、'),
        });
      }
      this._processedWordTexts.push(word);
    });

    this._queuedItems = [];
    this.setData({
      savedEntries: savedEntries.concat(this.data.savedEntries),
    });
    this._render(this.data.batchText);
    wx.showToast({
      title: savedEntries.length ? '错字已保存' : '没有标记不会的字',
      icon: savedEntries.length ? 'success' : 'none',
    });
  },

  _render(batchText) {
    const queuedIds = this._queuedItems.map((q) => q.id);
    const allDecided = this._queuedItems.length > 0 &&
      this._queuedItems.every((q) => q.status !== 'pending');
    const selectionComplete = selectedWordsComplete(this._wordList, this._queuedItems);
    this.setData({
      batchText: batchText,
      charPool: buildCharPool(this._wordList, queuedIds, this._processedWordTexts),
      judgeList: buildJudgeList(this._queuedItems),
      allDecided: allDecided && selectionComplete,
      selectionComplete: selectionComplete,
    });
  },
});
