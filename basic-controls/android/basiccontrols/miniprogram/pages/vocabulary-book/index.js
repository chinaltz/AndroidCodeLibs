const nav = require('../../utils/nav');
const vocabulary = require('../../utils/vocabulary-store');

Page({
  data: { theme: {}, words: [], word: '', meaning: '', editingId: '' },
  _word: '',
  _meaning: '',
  onShow() { this.setData({ theme: getApp().globalData.theme, words: vocabulary.getWords() }); },
  onBack() { nav.navigateBack(); },
  onWordInput(e) { this._word = e.detail.value; },
  onMeaningInput(e) { this._meaning = e.detail.value; },
  addWord() {
    const wasEditing = !!this.data.editingId;
    const result = wasEditing
      ? vocabulary.updateWord(this.data.editingId, this._word, this._meaning)
      : vocabulary.addWord(this._word, this._meaning);
    if (!result.ok) {
      const title = result.reason === 'duplicate'
        ? '这个单词已经有了'
        : (result.reason === 'invalid' ? '请输入英文单词或短语' : '请输入英语单词');
      wx.showToast({ title, icon: 'none' });
      return;
    }
    this._word = '';
    this._meaning = '';
    this.setData({ word: '', meaning: '', editingId: '', words: vocabulary.getWords() });
    wx.showToast({ title: wasEditing ? '修改已保存' : '已加入单词本', icon: 'success' });
  },
  editWord(e) {
    const item = this.data.words.find((word) => word.id === e.currentTarget.dataset.id);
    if (item) {
      this._word = item.word;
      this._meaning = item.meaning || '';
      this.setData({ editingId: item.id, word: item.word, meaning: item.meaning || '' });
    }
  },
  cancelEdit() {
    this._word = '';
    this._meaning = '';
    this.setData({ editingId: '', word: '', meaning: '' });
  },
  deleteWord(e) {
    vocabulary.deleteWord(e.currentTarget.dataset.id);
    this._word = '';
    this._meaning = '';
    this.setData({ words: vocabulary.getWords(), editingId: '', word: '', meaning: '' });
  },
});
