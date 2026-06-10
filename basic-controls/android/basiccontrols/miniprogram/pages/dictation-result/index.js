const storage = require('../../utils/storage');
const nav = require('../../utils/nav');
const pinyin = require('../../utils/pinyin');
const dictationQueue = require('../../utils/dictation-queue');
const share = require('../../utils/share');
const petReward = require('../../utils/pet-reward');
const petRoutes = require('../../utils/pet-routes');

Page({
  data: {
    theme: {},
    correctCount: 0,
    wrongCount: 0,
    changes: [],
    wrongItems: [],
    rewardResult: null,
    shareRewardText: `分享听写成果 +${petReward.SHARE_POINTS} 宠物积分`,
  },

  onLoad() {
    share.enableShareMenu();
    const summary = wx.getStorageSync('dictation_session_summary') || {};
    const results = summary.results || wx.getStorageSync('dictation_session_results') || [];
    this.taskEventId = summary.taskEventId || petReward.createEventId('dictation', `${results.length}words`);
    if (!summary.taskEventId) {
      wx.setStorageSync('dictation_session_summary', Object.assign({}, summary, {
        results,
        taskEventId: this.taskEventId,
      }));
    }
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

    const rewardResult = results.length ? petReward.grantTaskReward({
      eventId: this.taskEventId,
      moduleId: 'dictation',
      title: `完成 ${results.length} 词听写`,
      points: Math.min(20, Math.max(6, results.length * 2)),
      xp: Math.min(30, Math.max(10, results.length * 3)),
    }) : null;

    this.setData({ correctCount, wrongCount, changes, wrongItems, rewardResult });
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

  goPet() {
    nav.navigateTo(petRoutes.entry);
  },

  onShareAppMessage(options) {
    if (options && options.from === 'button' && this.taskEventId) {
      const result = petReward.claimShareReward(this.taskEventId);
      if (result.awarded) {
        this.setData({
          'rewardResult.balance': result.balance,
          shareRewardText: `已获得 ${result.points} 宠物积分`,
        });
      } else if (result.reason === 'already_claimed') {
        this.setData({ shareRewardText: '本次分享奖励已领取' });
      } else if (result.reason === 'daily_limit') {
        this.setData({ shareRewardText: '今日分享奖励已达上限' });
      }
      return petReward.shareMessage(this.taskEventId);
    }
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
