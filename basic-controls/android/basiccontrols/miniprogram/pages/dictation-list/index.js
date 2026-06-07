const nav = require('../../utils/nav');
const pinyin = require('../../utils/pinyin');
const dictationQueue = require('../../utils/dictation-queue');

function buildQueueItem(word) {
  return {
    id: word.id,
    text: word.text,
    pinyin: word.pinyin || pinyin.toPinyin(word.text),
    sourceLabel: word.sourceLabel || '听写',
    isEdited: false,
  };
}

Page({
  data: {
    theme: {},
    queue: [],
    count: 0,
  },

  onLoad() {
    this.refreshQueue();
  },

  onShow() {
    this.setData({ theme: getApp().globalData.theme });
    this.refreshQueue();
  },

  refreshQueue() {
    const stored = wx.getStorageSync('dictation_queue') || [];
    const deduped = dictationQueue.dedupeQueueItems(stored);
    if (deduped.length !== stored.length) {
      wx.setStorageSync('dictation_queue', deduped);
    }
    const queue = deduped.map(buildQueueItem);
    this.setData({ queue, count: queue.length });
  },

  onBack() {
    nav.navigateBack();
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    const queue = this.data.queue.filter((item) => item.id !== id);
    dictationQueue.setQueue(queue);
    this.setData({ queue, count: queue.length });
  },

  onClear() {
    wx.showModal({
      title: '清空列表',
      content: '确定清空本次听写列表？错字记录不会删除。',
      success: (res) => {
        if (!res.confirm) return;
        dictationQueue.setQueue([]);
        this.setData({ queue: [], count: 0 });
      },
    });
  },

  goAddFromTextbook() {
    nav.navigateTo('/pages/textbook-dictation/index');
  },

  goAddFromWrongChars() {
    nav.navigateTo('/pages/word-list/index');
  },

  goAddManual() {
    nav.navigateTo('/pages/dictation-manual/index');
  },

  startDictation() {
    if (!this.data.queue.length) {
      wx.showToast({ title: '列表为空，先添加词语', icon: 'none' });
      return;
    }
    dictationQueue.setQueue(this.data.queue);
    nav.navigateTo('/pages/dictation-player/index');
  },
});
