const nav = require('../../utils/nav');
const vocabulary = require('../../utils/vocabulary-store');

Page({
  data: { theme: {}, words: [], word: '', meaning: '', editingId: '' },
  onShow() { this.setData({ theme: getApp().globalData.theme, words: vocabulary.getWords() }); },
  onBack() { nav.navigateBack(); },
  onWordInput(e) { this.setData({ word: e.detail.value }); },
  onMeaningInput(e) { this.setData({ meaning: e.detail.value }); },
  addWord() {
    const wasEditing = !!this.data.editingId;
    const result = wasEditing
      ? vocabulary.updateWord(this.data.editingId, this.data.word, this.data.meaning)
      : vocabulary.addWord(this.data.word, this.data.meaning);
    if (!result.ok) {
      const title = result.reason === 'duplicate'
        ? '这个单词已经有了'
        : (result.reason === 'invalid' ? '请输入英文单词或短语' : '请输入英语单词');
      wx.showToast({ title, icon: 'none' });
      return;
    }
    this.setData({ word: '', meaning: '', editingId: '', words: vocabulary.getWords() });
    wx.showToast({ title: wasEditing ? '修改已保存' : '已加入单词本', icon: 'success' });
  },
  editWord(e) {
    const item = this.data.words.find((word) => word.id === e.currentTarget.dataset.id);
    if (item) this.setData({ editingId: item.id, word: item.word, meaning: item.meaning || '' });
  },
  cancelEdit() { this.setData({ editingId: '', word: '', meaning: '' }); },
  deleteWord(e) {
    vocabulary.deleteWord(e.currentTarget.dataset.id);
    this.setData({ words: vocabulary.getWords(), editingId: '', word: '', meaning: '' });
  },
});
