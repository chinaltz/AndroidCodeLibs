const { findById, unitsByKind } = require('../../../../data/pinyin-units');
const nav = require('../../../../utils/nav');
const audio = require('../../../../utils/audio');
const storage = require('../../../../utils/storage');
const petIntegration = require('../../../../utils/pinyin-pet-integration');

function buildOptions(unit) {
  const pool = unitsByKind(unit.kind).filter((item) => item.id !== unit.id);
  const compare = unit.compareIds
    .map((id) => pool.find((item) => item.id === id))
    .filter(Boolean);
  const extras = pool.filter((item) => unit.compareIds.indexOf(item.id) < 0).slice(0, 3 - compare.length);
  const values = [unit].concat(compare, extras).slice(0, 4);
  if (values.length > 1) {
    const first = values.shift();
    values.splice(Math.min(1, values.length), 0, first);
  }
  return values;
}

Page({
  data: {
    theme: {},
    unit: {},
    step: 0,
    options: [],
    selectedId: '',
    selectedExample: '',
    correctExample: '',
    questionExampleAudioId: '',
    exampleOptions: [],
    hasRecording: false,
    isRecording: false,
    actionText: '下一题',
    feedback: '',
  },

  onLoad(query) {
    const unit = findById(query.id);
    this.unit = unit;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.recordPath = '';
    this.recorder = wx.getRecorderManager();
    this.recorder.onStart(() => this.setData({ isRecording: true, feedback: '正在录音…' }));
    this.recorder.onStop((res) => {
      this.recordPath = res.tempFilePath || '';
      this.setData({
        isRecording: false,
        hasRecording: !!this.recordPath,
        feedback: this.recordPath ? '录音完成，可以回放对比。' : '录音失败，请重试。',
      });
    });
    this.recorder.onError(() => {
      this.setData({ isRecording: false, feedback: '录音失败，请检查麦克风权限。' });
    });
    const correctExample = unit.examples[0];
    const alternatives = unitsByKind(unit.kind)
      .filter((item) => item.id !== unit.id && item.examples.length)
      .slice(0, 3)
      .map((item) => item.examples[0]);
    this.setData({
      theme: getApp().globalData.theme,
      unit,
      options: buildOptions(unit),
      correctExample: correctExample.display,
      questionExampleAudioId: correctExample.syllableId,
      exampleOptions: [alternatives[0], correctExample, alternatives[1]].filter(Boolean),
    });
  },

  onBack() {
    if (this.data.step > 0) {
      this.setData({ step: this.data.step - 1, feedback: '', actionText: '下一题' });
      return;
    }
    nav.navigateBack();
  },

  playCorrect() {
    if (!this.unit.audioId) {
      wx.showToast({ title: `${this.unit.symbol} 标准音待补录`, icon: 'none' });
      return;
    }
    const path = audio.pinyinTeachingPath(this.unit.audioId);
    audio.play(path, this.unit.symbol).catch((err) => {
      console.error('pinyin check teaching audio failed', {
        unitId: this.unit.id,
        audioId: this.unit.audioId,
        path,
        error: err,
      });
      wx.showToast({ title: '标准音播放失败', icon: 'none' });
    });
  },

  pickListen(e) {
    const id = e.currentTarget.dataset.id;
    const correct = id === this.unit.id;
    this.setData({
      selectedId: id,
      feedback: correct ? '答对了，继续下一题。' : '再听一次，注意口型和送气。',
    });
    if (correct) this.correctCount += 1;
    else {
      this.wrongCount += 1;
      storage.recordPinyinMistake(this.unit.id);
    }
  },

  pickExample(e) {
    const value = e.currentTarget.dataset.value;
    const correct = value === this.data.correctExample;
    this.setData({
      selectedExample: value,
      feedback: correct ? '拼读正确，下一步跟读。' : '这个组合不是本关示例，再试一次。',
    });
    if (correct) this.correctCount += 1;
    else {
      this.wrongCount += 1;
      storage.recordPinyinMistake(this.unit.id);
    }
  },

  playQuestionExample() {
    const audioId = this.data.questionExampleAudioId;
    const path = audio.pinyinSyllablePath(audioId);
    audio.play(path, audioId).catch((err) => {
      console.error('pinyin check syllable audio failed', {
        unitId: this.unit.id,
        audioId,
        path,
        error: err,
      });
      wx.showToast({ title: '拼读音频播放失败', icon: 'none' });
    });
  },

  toggleRecord() {
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
              if (settingRes.authSetting && settingRes.authSetting['scope.record']) this.startRecord();
              else wx.showToast({ title: '请在设置中允许录音权限', icon: 'none' });
            },
          });
          return;
        }
        wx.authorize({
          scope: 'scope.record',
          success: () => this.startRecord(),
          fail: () => wx.showToast({ title: '请允许录音权限', icon: 'none' }),
        });
      },
      fail: () => wx.showToast({ title: '无法读取录音权限', icon: 'none' }),
    });
  },

  startRecord() {
    this.recordPath = '';
    this.setData({ hasRecording: false });
    this.recorder.start({
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'aac',
    });
  },

  playMine() {
    if (!this.recordPath) {
      wx.showToast({ title: '请先录制自己的读音', icon: 'none' });
      return;
    }
    audio.play(this.recordPath, '我的录音').catch(() => {
      wx.showToast({ title: '录音播放失败', icon: 'none' });
    });
  },

  onPrimary() {
    if (this.data.step === 0) {
      if (this.data.selectedId !== this.unit.id) {
        wx.showToast({ title: '请先选对本关拼音', icon: 'none' });
        return;
      }
      this.setData({ step: 1, feedback: '', actionText: '下一题' });
      return;
    }
    if (this.data.step === 1) {
      if (this.data.selectedExample !== this.data.correctExample) {
        wx.showToast({ title: '请先完成拼读题', icon: 'none' });
        return;
      }
      this.setData({ step: 2, feedback: '', actionText: `完成 ${this.unit.symbol}` });
      return;
    }
    if (!this.data.hasRecording) {
      wx.showToast({ title: '请先录制一次跟读', icon: 'none' });
      return;
    }
    if (this.completing) return;
    this.completing = true;
    const completed = storage.getPinyinCompleted().slice();
    if (completed.indexOf(this.unit.id) < 0) completed.push(this.unit.id);
    storage.setPinyinCompleted(completed);
    storage.setPinyinLastUnit(this.unit.id);
    storage.appendPinyinPracticeLog({
      unitId: this.unit.id,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
    });
    petIntegration.complete(this, this.unit);
  },

  onHide() {
    audio.stopTeaching();
    if (this.data.isRecording && this.recorder) this.recorder.stop();
  },

  onShareAppMessage(options) {
    return petIntegration.onShare(this, options);
  },
});
