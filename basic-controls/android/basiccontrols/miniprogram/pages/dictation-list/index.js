const nav = require('../../utils/nav');
const pinyin = require('../../utils/pinyin');
const dictationQueue = require('../../utils/dictation-queue');
const REPEAT_OPTIONS = [1, 2, 3, 4, 5];
const INTERVAL_OPTIONS = [1, 2, 3, 5, 8, 10];

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
    repeatOptions: REPEAT_OPTIONS,
    intervalOptions: INTERVAL_OPTIONS,
    repeatCount: 2,
    intervalSeconds: 8,
  },

  onLoad() {
    this.refreshQueue();
  },

  onShow() {
    const config = dictationQueue.getPlanConfig();
    this.setData({
      theme: getApp().globalData.theme,
      repeatCount: config.repeatCount,
      intervalSeconds: config.intervalSeconds,
    });
    this.refreshQueue();
  },

  refreshQueue() {
    const deduped = dictationQueue.getQueue();
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
      title: '清空今日计划',
      content: '确定清空今天安排的听写内容？错字记录不会删除。',
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

  onRepeatChange(e) {
    this.setData({ repeatCount: REPEAT_OPTIONS[Number(e.detail.value)] });
  },

  onIntervalChange(e) {
    this.setData({ intervalSeconds: INTERVAL_OPTIONS[Number(e.detail.value)] });
  },

  finishPlan() {
    dictationQueue.setQueue(this.data.queue);
    dictationQueue.setPlanConfig({
      repeatCount: this.data.repeatCount,
      intervalSeconds: this.data.intervalSeconds,
    });
    wx.showToast({ title: this.data.queue.length ? '今日计划已保存' : '今日暂未安排', icon: 'none' });
    setTimeout(() => nav.navigateBack(), 350);
  },
});
