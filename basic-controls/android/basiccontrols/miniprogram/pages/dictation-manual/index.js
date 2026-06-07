const nav = require('../../utils/nav');
const pinyin = require('../../utils/pinyin');
const dictationQueue = require('../../utils/dictation-queue');

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

function buildCharPool(words, selectedItems, savedWords) {
  const selectedIds = selectedItems.map((item) => item.id);
  const items = [];
  words.forEach((word) => {
    Array.from(word).forEach((char, index) => {
      const id = `${word}__${index}`;
      items.push({
        id,
        char,
        word,
        selected: selectedIds.indexOf(id) >= 0,
        saved: savedWords.indexOf(word) >= 0,
      });
    });
  });
  return items;
}

function selectedWordsComplete(words, selectedItems) {
  const selectedWords = {};
  selectedItems.forEach((item) => { selectedWords[item.word] = true; });
  return Object.keys(selectedWords).every((word) => (
    words.indexOf(word) >= 0 &&
    selectedItems.filter((item) => item.word === word).length === Array.from(word).length
  ));
}

function buildSelectedSequence(selectedItems) {
  return selectedItems.map((item, index) => Object.assign({}, item, {
    order: index + 1,
  }));
}

function displayQueue() {
  return dictationQueue.getQueue().map((item) => Object.assign({}, item, {
    displayPinyin: item.pinyin || pinyin.toPinyin(item.text),
  }));
}

Page({
  data: {
    theme: {},
    batchText: '',
    charPool: [],
    selectedSequence: [],
    selectedCount: 0,
    selectionComplete: false,
    queue: [],
  },

  _words: [],
  _selectedItems: [],
  _savedWords: [],

  onShow() {
    this.setData({
      theme: getApp().globalData.theme,
      queue: displayQueue(),
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
    this._words = splitWords(batchText);
    this._selectedItems = this._selectedItems.filter((item) => (
      this._words.indexOf(item.word) >= 0
    ));
    this._render(batchText);
  },

  onCharTap(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.charPool.find((entry) => entry.id === id);
    if (!item || item.saved || item.selected) return;
    this._selectedItems.push({
      id: item.id,
      char: item.char,
      word: item.word,
    });
    this._render(this.data.batchText);
  },

  onSelectedCharTap(e) {
    const id = e.currentTarget.dataset.id;
    const index = this._selectedItems.findIndex((item) => item.id === id);
    if (index < 0) return;
    this._selectedItems.splice(index, 1);
    this._render(this.data.batchText);
  },

  onSave() {
    const selectedWords = [];
    this._selectedItems.forEach((item) => {
      if (selectedWords.indexOf(item.word) < 0) selectedWords.push(item.word);
    });
    if (!selectedWords.length || !selectedWordsComplete(this._words, this._selectedItems)) {
      wx.showToast({ title: '请选完整词语的所有字', icon: 'none' });
      return;
    }
    dictationQueue.appendQueue(selectedWords.map((word) => ({
      text: word,
      pinyin: pinyin.toPinyin(word),
      sourceLabel: '手动录入',
      sourceType: 'manual',
    })));
    selectedWords.forEach((word) => {
      if (this._savedWords.indexOf(word) < 0) this._savedWords.push(word);
    });
    this._selectedItems = [];
    this.setData({ queue: displayQueue() });
    this._render(this.data.batchText);
    wx.showToast({ title: `已加入 ${selectedWords.length} 个词`, icon: 'success' });
  },

  goDictationList() {
    nav.navigateBack();
  },

  _render(batchText) {
    const selectionComplete = selectedWordsComplete(this._words, this._selectedItems);
    this.setData({
      batchText,
      charPool: buildCharPool(this._words, this._selectedItems, this._savedWords),
      selectedSequence: buildSelectedSequence(this._selectedItems),
      selectedCount: this._selectedItems.length,
      selectionComplete,
    });
  },
});
