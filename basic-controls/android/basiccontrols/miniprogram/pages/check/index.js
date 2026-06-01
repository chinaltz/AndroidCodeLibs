const { findById } = require('../../data/phonemes');
const audio = require('../../utils/audio');
const quiz = require('../../utils/quiz');

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
  },

  onLoad(query) {
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
      wx.navigateBack();
    }
  },

  onPlaySymbol() {
    audio.play(audio.phonemePath(this.phonemeId)).catch(() => {
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
      const completed = app.globalData.completed.slice();
      if (completed.indexOf(this.phonemeId) < 0) completed.push(this.phonemeId);
      app.setCompleted(completed);
      wx.showToast({ title: app.tf('toast/completed', this.phoneme.symbol), icon: 'success' });
      setTimeout(() => wx.navigateBack({ delta: 2 }), 800);
    }
  },

  onHide() {
    if (this.data.isRecording && this.recorder) {
      this.recorder.stop();
    }
  },
});
