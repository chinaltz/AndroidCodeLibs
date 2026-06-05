const storage = require('../../utils/storage');
const pinyin = require('../../utils/pinyin');

function displayWords(words) {
  return words.map((word, index) => Object.assign({}, word, {
    colorClass: `color-${index % 4}`,
    displayPinyin: word.pinyin || pinyin.toPinyin(word.text),
    relationLabel: (word.unknownCharacterRefs || []).map((item) => item.text).join('、'),
  }));
}

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

function buildCandidates(words, queue, savedTexts) {
  const orderMap = {};
  queue.forEach((word, index) => { orderMap[word] = index + 1; });
  return words.map((word) => ({
    text: word,
    order: orderMap[word] || 0,
    saved: savedTexts.indexOf(word) >= 0,
  }));
}

function buildCharacterStates(word, unknownIndexes) {
  const unknownMap = {};
  (unknownIndexes || []).forEach((index) => { unknownMap[index] = true; });
  return Array.from(word).map((character, index) => ({
    id: `${character}_${index}`,
    character,
    index,
    status: unknownMap[index] ? 'unknown' : 'known',
  }));
}

Page({
  data: {
    theme: {},
    editId: '',
    pageTitle: '批量录入',
    batchText: '',
    candidateWords: [],
    clickQueue: [],
    savedInBatch: [],
    activeWord: '',
    characterStates: [],
    savedWords: [],
  },

  onLoad(options) {
    const editId = options && options.id ? options.id : '';
    const word = editId ? storage.findWordById(editId) : null;
    const batchText = word ? word.text : '';
    const clickQueue = batchText ? [batchText] : [];
    this.setData({
      editId: word ? word.id : '',
      pageTitle: word ? '编辑听写词' : '批量录入',
      batchText,
      clickQueue,
      candidateWords: batchText ? [{ text: batchText, order: 1, saved: false }] : [],
    });
    if (word) {
      this.startWord(word.text, (word.unknownChars || []).map((item) => item.index));
    }
  },

  onShow() {
    this.setData({
      theme: getApp().globalData.theme,
      savedWords: displayWords(storage.getWords()),
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onBatchInput(e) {
    const batchText = e.detail.value;
    const words = splitWords(batchText);
    const clickQueue = this.data.clickQueue.filter((word) => words.indexOf(word) >= 0);
    this.setData({
      batchText,
      clickQueue,
      candidateWords: buildCandidates(words, clickQueue, this.data.savedInBatch),
    });
  },

  onCandidateTap(e) {
    const word = e.currentTarget.dataset.word;
    if (!word || this.data.savedInBatch.indexOf(word) >= 0) return;
    const clickQueue = this.data.clickQueue.slice();
    if (clickQueue.indexOf(word) < 0) clickQueue.push(word);
    this.setData({
      clickQueue,
      candidateWords: buildCandidates(splitWords(this.data.batchText), clickQueue, this.data.savedInBatch),
    });
    if (!this.data.activeWord) this.startNextWord(clickQueue);
  },

  startNextWord(queue) {
    const nextQueue = (queue || this.data.clickQueue)
      .filter((word) => this.data.savedInBatch.indexOf(word) < 0);
    if (!nextQueue.length) {
      this.setData({ activeWord: '', characterStates: [] });
      return;
    }
    this.startWord(nextQueue[0], []);
  },

  startWord(word, unknownIndexes) {
    this.setData({
      activeWord: word,
      characterStates: buildCharacterStates(word, unknownIndexes),
    });
  },

  onCharacterTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({
      characterStates: this.data.characterStates.map((item) => (
        item.index === index
          ? Object.assign({}, item, { status: item.status === 'unknown' ? 'known' : 'unknown' })
          : item
      )),
    });
  },

  onSaveWord() {
    const text = this.data.activeWord;
    if (!text) return;
    const unknownChars = this.data.characterStates
      .filter((item) => item.status === 'unknown')
      .map((item) => ({ index: item.index, char: item.character }));
    const unknownCharacters = unknownChars.map((item) => item.char);
    const patch = {
      text,
      pinyin: pinyin.toPinyin(text),
      sourceId: 'manual',
      sourceType: 'manual',
      sourceLabel: '手动录入',
      unknownScope: 'chars',
      unknownChars,
      unknownCharacters,
      dictationOnly: unknownCharacters.length === 0,
      wrongCount: unknownCharacters.length ? 1 : 0,
      needsDictation: true,
      status: unknownCharacters.length ? '待复习' : '听写准备',
      meta: '手动录入',
    };
    const duplicate = storage.findWordByText(text, null, this.data.editId);
    if (this.data.editId || duplicate) storage.updateWord(this.data.editId || duplicate.id, patch);
    else storage.addWord(patch);

    const savedInBatch = this.data.savedInBatch.concat(text);
    const clickQueue = this.data.clickQueue.filter((word) => word !== text);
    this.setData({
      editId: '',
      savedInBatch,
      clickQueue,
      candidateWords: buildCandidates(splitWords(this.data.batchText), clickQueue, savedInBatch),
      savedWords: displayWords(storage.getWords()),
    });
    wx.showToast({ title: `已保存「${text}」`, icon: 'success' });
    this.startNextWord(clickQueue);
  },
});
