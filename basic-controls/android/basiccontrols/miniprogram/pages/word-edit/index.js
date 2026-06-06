const storage = require('../../utils/storage');
const pinyin = require('../../utils/pinyin');

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

function buildCharPool(wordList, queuedIds, savedWordTexts) {
  const items = [];
  wordList.forEach((word) => {
    const wordSaved = savedWordTexts.indexOf(word) >= 0;
    Array.from(word).forEach((char, idx) => {
      const id = word + '__' + idx;
      const inQueue = queuedIds.indexOf(id) >= 0;
      items.push({
        id: id,
        char: char,
        index: idx,
        word: word,
        inQueue: inQueue,
        saved: wordSaved,
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

function displaySavedWords(words) {
  return words.map((word, index) => Object.assign({}, word, {
    colorClass: 'color-' + (index % 4),
    displayPinyin: word.pinyin || pinyin.toPinyin(word.text),
    relationLabel: (word.unknownCharacterRefs || []).map((ref) => ref.text).join('、'),
  }));
}

Page({
  data: {
    theme: {},
    batchText: '',
    charPool: [],
    judgeList: [],
    allDecided: false,
    selectionComplete: false,
    savedWords: [],
  },

  _wordList: [],
  _queuedItems: [],
  _savedWordTexts: [],
  _editingWord: null,

  onLoad(options) {
    const editId = options && options.id ? options.id : '';
    const word = editId ? storage.findWordById(editId) : null;
    if (!word) return;

    const unknownIndexes = {};
    (word.unknownChars || []).forEach((item) => { unknownIndexes[item.index] = true; });
    this._editingWord = word;
    this._wordList = [word.text];
    this._queuedItems = Array.from(word.text).map((char, index) => ({
      id: word.text + '__' + index,
      char: char,
      index: index,
      word: word.text,
      status: unknownIndexes[index] ? 'unknown' : 'known',
    }));
    this._render(word.text);
  },

  onShow() {
    this.setData({
      theme: getApp().globalData.theme,
      savedWords: displaySavedWords(storage.getWords()),
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onBatchInput(e) {
    const batchText = e.detail.value;
    this._wordList = splitWords(batchText);
    this._queuedItems = this._queuedItems.filter((q) => {
      return this._wordList.some((w) => q.id.indexOf(w + '__') === 0);
    });
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

    Object.keys(wordMap).forEach((word) => {
      const chars = wordMap[word];
      const editingWord = this._editingWord && this._editingWord.text === word
        ? this._editingWord
        : null;
      const unknownChars = [];
      const unknownCharacters = [];
      chars.forEach((item) => {
        if (item.status === 'unknown') {
          unknownChars.push({ index: item.index, char: item.char });
          if (unknownCharacters.indexOf(item.char) < 0) {
            unknownCharacters.push(item.char);
          }
        }
      });

      const patch = {
        text: word,
        pinyin: pinyin.toPinyin(word),
        sourceId: editingWord ? editingWord.sourceId : 'manual',
        sourceType: editingWord ? editingWord.sourceType : 'manual',
        sourceLabel: editingWord ? editingWord.sourceLabel : '手动录入',
        unknownScope: 'chars',
        unknownChars: unknownChars,
        unknownCharacters: unknownCharacters,
        dictationOnly: unknownCharacters.length === 0,
        wrongCount: unknownCharacters.length ? 1 : 0,
        needsDictation: true,
        status: unknownCharacters.length ? '待复习' : '听写准备',
        meta: editingWord ? editingWord.meta : '手动录入',
      };

      const duplicate = storage.findWordByText(word, null, null);
      if (duplicate) storage.updateWord(duplicate.id, patch);
      else storage.addWord(patch);

      this._savedWordTexts.push(word);
    });

    this._queuedItems = [];
    this._editingWord = null;
    this.setData({
      savedWords: displaySavedWords(storage.getWords()),
    });
    this._render(this.data.batchText);
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  _render(batchText) {
    const queuedIds = this._queuedItems.map((q) => q.id);
    const allDecided = this._queuedItems.length > 0 &&
      this._queuedItems.every((q) => q.status !== 'pending');
    const selectionComplete = selectedWordsComplete(this._wordList, this._queuedItems);
    this.setData({
      batchText: batchText,
      charPool: buildCharPool(this._wordList, queuedIds, this._savedWordTexts),
      judgeList: buildJudgeList(this._queuedItems),
      allDecided: allDecided && selectionComplete,
      selectionComplete: selectionComplete,
    });
  },
});
