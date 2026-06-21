const nav = require('../../utils/nav');
const storage = require('../../utils/storage');
const dictationQueue = require('../../utils/dictation-queue');
const vocabulary = require('../../utils/vocabulary-store');

Page({
  data: {
    theme: {},
    childName: '',
    dictationCount: 0,
    vocabularyPlanCount: 0,
    vocabularyWordCount: 0,
    wrongPendingCount: 0,
    wrongTotalCount: 0,
    phonicsDone: 0,
    pinyinDone: 0,
  },

  onShow() {
    const child = storage.getCurrentChild();
    const stats = storage.getWordStats(child && child.id);
    this.setData({
      theme: getApp().globalData.theme,
      childName: child ? child.nickname : '',
      dictationCount: dictationQueue.getQueue().length,
      vocabularyPlanCount: vocabulary.getPlanWords().length,
      vocabularyWordCount: vocabulary.getWords().length,
      wrongPendingCount: stats.pendingCount,
      wrongTotalCount: stats.totalCount,
      phonicsDone: storage.getCompleted().length,
      pinyinDone: storage.getPinyinCompleted().length,
    });
  },

  onBack() { nav.navigateBack(); },
  goChinesePlan() { nav.navigateTo('/pages/dictation-list/index'); },
  goVocabularyPlan() { nav.navigateTo('/pages/vocabulary-plan/index'); },
  goWrongWords() { nav.navigateTo('/pages/word-list/index'); },
  goVocabularyBook() { nav.navigateTo('/pages/vocabulary-book/index'); },
  goCalendar() { nav.navigateTo('/pages/checkin-calendar/index'); },
  goPetTest() { nav.navigateTo('/packages/pet/pages/pet-test/index'); },
});
