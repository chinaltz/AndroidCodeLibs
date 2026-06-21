const nav = require('../../utils/nav');
const pomodoro = require('../../utils/pomodoro-service');
const compass = require('../../utils/pomodoro-compass');

const PRESET_OPTIONS = [
  { minutes: 5, label: '短休', hint: '5分' },
  { minutes: 15, label: '中等', hint: '15分' },
  { minutes: 25, label: '番茄', hint: '25分' },
  { minutes: 30, label: '长一点', hint: '30分' },
];

const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];

function touchPoint(touch) {
  return {
    x: touch.clientX != null ? touch.clientX : touch.pageX,
    y: touch.clientY != null ? touch.clientY : touch.pageY,
  };
}

Page({
  data: {
    theme: {},
    timerDisplay: '25:00',
    timerProgress: 0,
    timerProgressDeg: 0,
    timerMode: 'countdown',
    timerRunning: false,
    timerMuted: false,
    alarmActive: false,
    activePreset: 25,
    customMinutes: 25,
    ringRotate: compass.minutesToRotate(25),
    compassEnabled: true,
    presetOptions: PRESET_OPTIONS,
    weekLetters: WEEK_CN,
    weekActive: 0,
    dateText: '',
    compassHint: '旋转外圈设定时间',
    compassDragging: false,
  },

  timerHandle: null,
  vibrateHandle: null,
  _compassCenter: null,
  _compassRadius: 0,
  _dragging: false,
  _lastSnapMinutes: 25,

  onLoad() {
    this.syncDateMeta();
  },

  onReady() {
    this.measureCompass();
  },

  onShow() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
    this.refresh();
    this.startTimerLoop();
    wx.setNavigationBarColor({
      frontColor: app.globalData.theme.dark ? '#ffffff' : '#000000',
      backgroundColor: app.globalData.theme.pageStart,
    });
    setTimeout(() => this.measureCompass(), 120);
  },

  onHide() {
    this.refreshFrom(pomodoro.pauseTimer());
    this.stopTimerLoop();
    this.stopVibrate();
    this._dragging = false;
    this.setData({ compassDragging: false });
  },

  onUnload() {
    this.refreshFrom(pomodoro.pauseTimer());
    this.stopTimerLoop();
    this.stopVibrate();
  },

  measureCompass() {
    wx.createSelectorQuery()
      .in(this)
      .select('.compass')
      .boundingClientRect((rect) => {
        if (!rect) return;
        this._compassCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        this._compassRadius = Math.min(rect.width, rect.height) / 2;
      })
      .exec();
  },

  syncDateMeta() {
    const date = new Date();
    this.setData({
      weekActive: date.getDay(),
      dateText: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
    });
  },

  refresh() {
    const snapshot = pomodoro.state();
    this.applySnapshot(snapshot);
    if (snapshot.timer.alarmActive) this.startAlarmFeedback();
    else this.stopVibrate();
  },

  applySnapshot(snapshot) {
    const presetMinutes = Math.max(1, Math.round((snapshot.timer.presetSeconds || 0) / 60));
    const customMinutes = compass.clampMinutes(presetMinutes);
    const matchedPreset = PRESET_OPTIONS.some((item) => item.minutes === customMinutes)
      ? customMinutes
      : -1;
    const progressDeg = Math.round(snapshot.timerProgress * 360);
    const payload = {
      timerProgress: snapshot.timerProgress,
      timerProgressDeg: progressDeg,
      timerProgressStyle: `background: conic-gradient(from -90deg, #31A8FF 0deg, #43CFC7 ${progressDeg}deg, rgba(228,245,255,0.35) ${progressDeg}deg);`,
      timerMode: snapshot.timer.mode,
      timerRunning: snapshot.timer.running,
      timerMuted: snapshot.timer.alarmMuted,
      alarmActive: snapshot.timer.alarmActive,
    };

    if (!this._dragging) {
      payload.timerDisplay = snapshot.timerDisplay;
      payload.activePreset = matchedPreset;
      payload.customMinutes = customMinutes;
      payload.ringRotate = compass.minutesToRotate(customMinutes);
      payload.compassEnabled = !snapshot.timer.running;
      payload.compassHint = snapshot.timer.running ? '专注中，表盘已锁定' : '旋转外圈设定时间';
      this._lastSnapMinutes = customMinutes;
    }

    this.setData(payload);
  },

  startTimerLoop() {
    this.stopTimerLoop();
    this.timerHandle = setInterval(() => {
      const snapshot = pomodoro.tickTimer();
      this.applySnapshot(snapshot);
      if (snapshot.timer.alarmActive) this.startAlarmFeedback();
    }, 1000);
  },

  stopTimerLoop() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  },

  startAlarmFeedback() {
    if (this.data.timerMuted) return;
    if (this.vibrateHandle) return;
    wx.vibrateShort({ type: 'heavy' });
    this.vibrateHandle = setInterval(() => {
      wx.vibrateShort({ type: 'heavy' });
    }, 1200);
  },

  stopVibrate() {
    if (this.vibrateHandle) {
      clearInterval(this.vibrateHandle);
      this.vibrateHandle = null;
    }
  },

  refreshFrom(snapshot) {
    this.applySnapshot(snapshot);
  },

  onBack() {
    nav.navigateBack();
  },

  onToggleTimerMode() {
    const next = this.data.timerMode === 'countdown' ? 'countup' : 'countdown';
    this.refreshFrom(pomodoro.setTimerMode(next));
  },

  onToggleTimerRun() {
    this.refreshFrom(pomodoro.toggleTimerRunning());
  },

  onResetTimer() {
    this.refreshFrom(pomodoro.resetTimer());
  },

  onToggleMute() {
    this.refreshFrom(pomodoro.toggleAlarmMuted());
    if (this.data.timerMuted) this.stopVibrate();
  },

  onPresetTap(e) {
    const minutes = Number(e.currentTarget.dataset.minutes);
    if (!minutes) return;
    const next = compass.clampMinutes(minutes);
    this._dragging = false;
    this.setData({
      activePreset: next,
      customMinutes: next,
      ringRotate: compass.minutesToRotate(next),
      timerDisplay: pomodoro.formatClock(next * 60),
      timerProgress: 0,
      timerProgressDeg: 0,
      timerProgressStyle: 'background: conic-gradient(from -90deg, #31A8FF 0deg, #43CFC7 0deg, rgba(228,245,255,0.35) 0deg);',
      timerRunning: false,
      alarmActive: false,
      compassEnabled: true,
      compassHint: `已设定 ${next} 分钟`,
    });
    this.refreshFrom(pomodoro.setTimerPreset(next));
  },

  onDismissAlarm() {
    this.stopVibrate();
    this.refreshFrom(pomodoro.dismissAlarm());
  },

  onCompassStart(e) {
    if (!this.data.compassEnabled || this.data.timerRunning) return;
    if (!this._compassCenter) this.measureCompass();
    const touch = e.touches[0];
    if (!touch || !this._compassCenter) return;
    const point = touchPoint(touch);
    const distance = Math.hypot(
      point.x - this._compassCenter.x,
      point.y - this._compassCenter.y,
    );
    if (!this._compassRadius
      || distance < this._compassRadius * 0.58
      || distance > this._compassRadius * 1.08) return;
    this._dragging = true;
    this.setData({ compassDragging: true });
  },

  onCompassMove(e) {
    if (!this._dragging || !this._compassCenter || this.data.timerRunning) return;
    const touch = e.touches[0];
    if (!touch) return;
    const point = touchPoint(touch);
    const distance = Math.hypot(
      point.x - this._compassCenter.x,
      point.y - this._compassCenter.y,
    );
    if (distance < this._compassRadius * 0.42) return;
    const angle = compass.touchAngle(point.x, point.y, this._compassCenter.x, this._compassCenter.y);
    const customMinutes = compass.rotateToMinutes(angle);
    const ringRotate = ((angle % 360) + 360) % 360;
    const matchedPreset = PRESET_OPTIONS.some((item) => item.minutes === customMinutes)
      ? customMinutes
      : -1;
    this.setData({
      ringRotate,
      customMinutes,
      activePreset: matchedPreset,
      timerDisplay: pomodoro.formatClock(customMinutes * 60),
      compassHint: `设定 ${customMinutes} 分钟`,
    });
    if (customMinutes !== this._lastSnapMinutes && typeof wx.vibrateShort === 'function') {
      wx.vibrateShort({ type: 'light' });
      this._lastSnapMinutes = customMinutes;
    }
  },

  onCompassEnd() {
    if (!this._dragging) return;
    this._dragging = false;
    const minutes = this.data.customMinutes;
    const snapRotate = compass.minutesToRotate(minutes);
    this.setData({
      compassDragging: false,
      ringRotate: snapRotate,
      customMinutes: minutes,
      compassHint: `已设定 ${minutes} 分钟`,
    });
    this.refreshFrom(pomodoro.setTimerPreset(minutes));
  },
});
