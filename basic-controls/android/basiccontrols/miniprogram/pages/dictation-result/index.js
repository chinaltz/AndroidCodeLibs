const storage = require('../../utils/storage');
const nav = require('../../utils/nav');
const pinyin = require('../../utils/pinyin');
const dictationQueue = require('../../utils/dictation-queue');

Page({
  data: {
    theme: {},
    correctCount: 0,
    wrongCount: 0,
    changes: [],
    wrongItems: [],
  },

  onLoad() {
    const summary = wx.getStorageSync('dictation_session_summary') || {};
    const results = summary.results || wx.getStorageSync('dictation_session_results') || [];
    const beforeSnapshot = summary.beforeSnapshot || {};
    const correctCount = results.filter((r) => r.result === 'correct').length;
    const wrongCount = results.reduce((sum, entry) => (
      sum + ((entry.wrongChars && entry.wrongChars.length) || 0)
    ), 0);

    const changes = [];
    results.forEach((entry) => {
      if (entry.result === 'wrong') {
        (entry.wrongChars || []).forEach((wc) => {
          const before = beforeSnapshot[wc.char];
          const after = storage.findCharacterByText(wc.char);
          const existing = !!before;
          changes.push({
            id: entry.id + '_' + wc.char,
            char: wc.char,
            label: existing ? '已有错字，错误次数 +1' : '新增错字，首次加入错字库',
            tag: existing ? '错误 +1' : '新加入',
            tagClass: existing ? 'tag-wrong' : 'tag-new',
            detail: after ? ((before ? before.wrongCount : 0) + ' → ' + after.wrongCount) : '',
          });
        });
      }
    });

    const wrongItems = results
      .filter((r) => r.result === 'wrong')
      .map((r) => ({
        id: r.id,
        text: r.text,
        pinyin: r.pinyin || pinyin.toPinyin(r.text),
        sourceLabel: r.sourceLabel || '听写',
      }));

    this.setData({ correctCount, wrongCount, changes, wrongItems });
  },

  onShow() {
    this.setData({ theme: getApp().globalData.theme });
  },

  onBack() {
    nav.navigateBack();
  },

  retryWrong() {
    if (!this.data.wrongItems.length) return;
    dictationQueue.setQueue(this.data.wrongItems);
    nav.navigateTo('/pages/dictation-list/index');
  },

  goWordPlanet() {
    nav.navigateTo('/pages/word-planet/index');
  },
});
