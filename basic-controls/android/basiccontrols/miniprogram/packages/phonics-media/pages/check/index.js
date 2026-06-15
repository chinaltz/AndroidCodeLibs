const { findById } = require('../../../../data/phonemes');
const petRoutes = require('../../../../utils/pet-routes');
const nav = require('../../../../utils/nav');
const audio = require('../../../../utils/audio');
const quiz = require('../../../../utils/quiz');
const share = require('../../../../utils/share');
const petReward = require('../../../../utils/pet-reward');

Page({
  data: {
    theme: {},
    phoneme: {},
    step: 0,
    pageTitle: '',
    listenOptions: [],
    wordOptions: [],
    selectedListen: -1,
    selectedWord: -1,
    listenCorrectIndex: 0,
    wordCorrectIndex: 0,
    isRecording: false,
    hasRecording: false,
    playText: '',
    actionText: '',
    q1Label: '', q1Title: '', q2Label: '', q2Title: '', q3Label: '', q3Title: '', q3Hint: '',
    recordText: '', playMineText: '', playCorrectText: '',
    rewardResult: null,
    shareRewardText: `分享学习成果 +${petReward.SHARE_POINTS} 宠物积分`,
  },

  onLoad(query) {
    share.enableShareMenu();
    const app = getApp();
    const phoneme = findById(query.id);
    this.phonemeId = phoneme.id;
    this.phoneme = phoneme;
    this.seed = phoneme.id.length * 97;
    this.recorder = wx.getRecorderManager();
    this.recordPath = '';
    this.recorder.onStart(() => {
      this.setData({
        isRecording: true,
        recordText: app.t('btn/stop_record'),
      });
    });
    this.recorder.onStop((res) => {
      this.recordPath = res.tempFilePath || '';
      this.setData({
        isRecording: false,
        hasRecording: !!this.recordPath,
        recordText: app.t('btn/start_record'),
      });
      if (!this.recordPath) {
        wx.showToast({ title: app.t('toast/record_failed'), icon: 'none' });
        return;
      }
      wx.showToast({ title: app.t('toast/record_done'), icon: 'success' });
    });
    this.recorder.onError((err) => {
      console.error('record failed', err);
      this.setData({
        isRecording: false,
        recordText: app.t('btn/start_record'),
      });
      wx.showToast({ title: app.t('toast/record_failed'), icon: 'none' });
    });
    this.prepareStep(0);
    this.setData({
      theme: app.globalData.theme,
      phoneme,
      pageTitle: app.t('page/check/title'),
      playText: app.t('btn/play'),
      q1Label: app.t('check/q1_label'),
      q1Title: app.t('check/q1_title'),
      q2Label: app.t('check/q2_label'),
      q2Title: app.tf('check/q2_title', phoneme.symbol),
      q3Label: app.t('check/q3_label'),
      q3Title: app.tf('check/q3_title', phoneme.symbol, phoneme.words[0].text),
      q3Hint: app.t('check/q3_hint'),
      playMineText: app.t('btn/play_mine'),
      playCorrectText: app.t('btn/play_correct'),
    });
  },

  prepareStep(step) {
    const app = getApp();
    if (step === 0) {
      const listenOptions = quiz.buildListenOptions(this.phoneme, this.seed);
      this.setData({
        step: 0,
        listenOptions,
        listenCorrectIndex: listenOptions.indexOf(this.phoneme.symbol),
        selectedListen: -1,
        actionText: app.t('btn/next'),
      });
    } else if (step === 1) {
      const built = quiz.buildWordOptions(this.phoneme, this.seed + 7);
      this.setData({
        step: 1,
        wordOptions: built.options,
        wordCorrectIndex: built.correctIndex,
        selectedWord: -1,
        actionText: app.t('btn/next'),
      });
    } else {
      this.setData({
        step: 2,
        actionText: app.tf('btn/finish', this.phoneme.symbol),
        recordText: this.data.isRecording ? app.t('btn/stop_record') : app.t('btn/start_record'),
      });
    }
  },

  onBack() {
    if (this.data.step > 0) {
      this.prepareStep(this.data.step - 1);
    } else {
      nav.navigateBack();
    }
  },

  onPlaySymbol() {
    const path = audio.phonemePath(this.phonemeId);
    audio.play(path, this.phoneme.symbol).catch((err) => {
      console.error('phonics check audio failed', {
        phonemeId: this.phonemeId,
        path,
        error: err,
      });
      wx.showToast({ title: getApp().tf('toast/play_failed', this.phoneme.symbol), icon: 'none' });
    });
  },

  onListenPick(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ selectedListen: index });
    const app = getApp();
    if (index === this.data.listenCorrectIndex) {
      wx.showToast({ title: app.t('toast/correct'), icon: 'success' });
      setTimeout(() => this.prepareStep(1), 650);
    } else {
      wx.showToast({ title: app.t('toast/try_again'), icon: 'none' });
    }
  },

  onWordPick(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ selectedWord: index });
    const app = getApp();
    if (index === this.data.wordCorrectIndex) {
      wx.showToast({ title: app.t('toast/correct'), icon: 'success' });
      setTimeout(() => this.prepareStep(2), 650);
    } else {
      wx.showToast({ title: app.t('toast/try_again'), icon: 'none' });
    }
  },

  onToggleRecord() {
    const app = getApp();
    if (this.data.isRecording) {
      this.recorder.stop();
      return;
    }
    wx.getSetting({
      success: (res) => {
        const auth = res.authSetting || {};
        if (auth['scope.record']) {
          this.startRecord();
          return;
        }
        if (auth['scope.record'] === false) {
          wx.openSetting({
            success: (settingRes) => {
              if (settingRes.authSetting && settingRes.authSetting['scope.record']) {
                this.startRecord();
              } else {
                wx.showToast({ title: app.t('toast/record_permission'), icon: 'none' });
              }
            },
          });
          return;
        }
        wx.authorize({
          scope: 'scope.record',
          success: () => this.startRecord(),
          fail: () => wx.showToast({ title: app.t('toast/record_permission'), icon: 'none' }),
        });
      },
      fail: () => wx.showToast({ title: app.t('toast/record_permission'), icon: 'none' }),
    });
  },

  startRecord() {
    try {
      this.recordPath = '';
      this.setData({ hasRecording: false });
      this.recorder.start({
        duration: 10000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
        format: 'aac',
      });
    } catch (err) {
      console.error('record start failed', err);
      this.setData({
        isRecording: false,
        recordText: getApp().t('btn/start_record'),
      });
      wx.showToast({ title: getApp().t('toast/record_failed'), icon: 'none' });
    }
  },

  onPlayMine() {
    if (!this.data.hasRecording) {
      wx.showToast({ title: getApp().t('toast/no_record'), icon: 'none' });
      return;
    }
    audio.play(this.recordPath).catch(() => {
      wx.showToast({ title: getApp().tf('toast/play_failed', getApp().t('btn/play_mine')), icon: 'none' });
    });
  },

  onPrimary() {
    const app = getApp();
    if (this.data.step === 0) {
      if (this.data.selectedListen !== this.data.listenCorrectIndex) {
        wx.showToast({ title: app.t('toast/answer_first'), icon: 'none' });
        return;
      }
      this.prepareStep(1);
    } else if (this.data.step === 1) {
      if (this.data.selectedWord !== this.data.wordCorrectIndex) {
        wx.showToast({ title: app.t('toast/answer_first'), icon: 'none' });
        return;
      }
      this.prepareStep(2);
    } else {
      if (!this.data.hasRecording) {
        wx.showToast({ title: app.t('toast/answer_first'), icon: 'none' });
        return;
      }
      if (this.completing) return;
      this.completing = true;
      const completed = app.globalData.completed.slice();
      if (completed.indexOf(this.phonemeId) < 0) completed.push(this.phonemeId);
      app.setCompleted(completed);
      this.taskEventId = petReward.createEventId('phonics', this.phonemeId);
      const rewardResult = petReward.grantTaskReward({
        eventId: this.taskEventId,
        moduleId: 'phonics',
        title: `音标 ${this.phoneme.symbol} 过关`,
      });
      this.setData({ rewardResult });
    }
  },

  goPet() {
    nav.navigateTo(petRoutes.entry);
  },

  finishAndBack() {
    nav.navigateBack({ delta: 2 });
  },

  onHide() {
    audio.stopTeaching();
    if (this.data.isRecording && this.recorder) {
      this.recorder.stop();
    }
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
