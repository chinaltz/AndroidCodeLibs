const storage = require('./storage');

const KEY = 'pomodoro_state_v1';
const LEGACY_TODO_KEY = 'daily_todo_state_v1';

function load() {
  return wx.getStorageSync(KEY) || {};
}

function save(root) {
  wx.setStorageSync(KEY, root);
}

function defaultTimer() {
  return {
    mode: 'countdown',
    presetSeconds: 25 * 60,
    accumulatedSeconds: 0,
    running: false,
    alarmMuted: false,
    alarmActive: false,
    runStartedAt: 0,
  };
}

function defaultBucket() {
  return { timer: defaultTimer() };
}

function normalizeTimer(timer) {
  if (timer.elapsedSeconds != null && timer.accumulatedSeconds == null) {
    timer.accumulatedSeconds = timer.elapsedSeconds;
    delete timer.elapsedSeconds;
  }
  if (timer.startedAt && !timer.runStartedAt) {
    timer.runStartedAt = timer.startedAt;
    delete timer.startedAt;
  }
  timer.accumulatedSeconds = timer.accumulatedSeconds || 0;
  return timer;
}

function migrateLegacyTimer(childId, bucket) {
  if (bucket._migratedFromTodo) return bucket;
  try {
    const legacy = wx.getStorageSync(LEGACY_TODO_KEY) || {};
    const legacyBucket = legacy.children && legacy.children[childId];
    if (legacyBucket && legacyBucket.timer) {
      bucket.timer = Object.assign(defaultTimer(), legacyBucket.timer);
      normalizeTimer(bucket.timer);
    }
  } catch (err) {
    // ignore migration errors
  }
  bucket._migratedFromTodo = true;
  return bucket;
}

function bucketFor(root) {
  const childId = storage.getCurrentChildId() || 'default';
  root.children = root.children || {};
  const raw = root.children[childId] || {};
  const bucket = Object.assign(defaultBucket(), raw);
  bucket.timer = Object.assign(defaultTimer(), bucket.timer || {});
  normalizeTimer(bucket.timer);
  migrateLegacyTimer(childId, bucket);
  root.children[childId] = bucket;
  return bucket;
}

function formatClock(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function elapsedSeconds(timer) {
  let total = timer.accumulatedSeconds || 0;
  if (timer.running && timer.runStartedAt) {
    total += Math.floor((Date.now() - timer.runStartedAt) / 1000);
  }
  return Math.max(0, total);
}

function timerDisplaySeconds(timer) {
  if (timer.mode === 'countdown') {
    return Math.max(0, timer.presetSeconds - elapsedSeconds(timer));
  }
  return elapsedSeconds(timer);
}

function timerProgress(timer) {
  const elapsed = elapsedSeconds(timer);
  if (timer.mode === 'countdown') {
    if (!timer.presetSeconds) return 0;
    return Math.min(1, elapsed / timer.presetSeconds);
  }
  const cap = Math.max(timer.presetSeconds, elapsed, 1);
  return Math.min(1, elapsed / cap);
}

function syncRunningTimer(timer) {
  if (!timer.running || !timer.runStartedAt) return;
  const now = Date.now();
  timer.accumulatedSeconds = (timer.accumulatedSeconds || 0) + Math.floor((now - timer.runStartedAt) / 1000);
  timer.runStartedAt = now;
}

function finishTimerIfNeeded(timer) {
  const elapsed = elapsedSeconds(timer);
  if (timer.mode === 'countdown' && elapsed >= timer.presetSeconds) {
    timer.accumulatedSeconds = timer.presetSeconds;
    timer.running = false;
    timer.alarmActive = true;
    timer.runStartedAt = 0;
    return true;
  }
  if (timer.mode === 'countup' && timer.presetSeconds > 0 && elapsed >= timer.presetSeconds) {
    timer.running = false;
    timer.alarmActive = true;
    timer.runStartedAt = 0;
    return true;
  }
  return false;
}

function buildState(timer) {
  return {
    timer,
    timerDisplay: formatClock(timerDisplaySeconds(timer)),
    timerProgress: timerProgress(timer),
  };
}

function state() {
  const root = load();
  const bucket = bucketFor(root);
  save(root);
  return buildState(bucket.timer);
}

function setTimerPreset(minutes) {
  const root = load();
  const bucket = bucketFor(root);
  normalizeTimer(bucket.timer);
  bucket.timer.presetSeconds = Math.max(0, parseInt(minutes, 10) || 0) * 60;
  bucket.timer.accumulatedSeconds = 0;
  bucket.timer.running = false;
  bucket.timer.alarmActive = false;
  bucket.timer.runStartedAt = 0;
  save(root);
  return buildState(bucket.timer);
}

function setTimerMode(mode) {
  const root = load();
  const bucket = bucketFor(root);
  normalizeTimer(bucket.timer);
  bucket.timer.mode = mode === 'countup' ? 'countup' : 'countdown';
  bucket.timer.accumulatedSeconds = 0;
  bucket.timer.running = false;
  bucket.timer.alarmActive = false;
  bucket.timer.runStartedAt = 0;
  save(root);
  return buildState(bucket.timer);
}

function toggleTimerRunning() {
  const root = load();
  const bucket = bucketFor(root);
  const timer = normalizeTimer(bucket.timer);
  if (timer.running) {
    syncRunningTimer(timer);
    timer.running = false;
    timer.runStartedAt = 0;
  } else {
    timer.running = true;
    timer.alarmActive = false;
    timer.runStartedAt = Date.now();
  }
  save(root);
  return buildState(timer);
}

function resetTimer() {
  const root = load();
  const bucket = bucketFor(root);
  normalizeTimer(bucket.timer);
  bucket.timer.accumulatedSeconds = 0;
  bucket.timer.running = false;
  bucket.timer.alarmActive = false;
  bucket.timer.runStartedAt = 0;
  save(root);
  return buildState(bucket.timer);
}

function toggleAlarmMuted() {
  const root = load();
  const bucket = bucketFor(root);
  bucket.timer.alarmMuted = !bucket.timer.alarmMuted;
  save(root);
  return buildState(bucket.timer);
}

function dismissAlarm() {
  const root = load();
  const bucket = bucketFor(root);
  normalizeTimer(bucket.timer);
  bucket.timer.alarmActive = false;
  bucket.timer.running = false;
  bucket.timer.runStartedAt = 0;
  save(root);
  return buildState(bucket.timer);
}

function pauseTimer() {
  const root = load();
  const bucket = bucketFor(root);
  const timer = normalizeTimer(bucket.timer);
  if (timer.running) {
    syncRunningTimer(timer);
    timer.running = false;
    timer.runStartedAt = 0;
    finishTimerIfNeeded(timer);
    save(root);
  }
  return buildState(timer);
}

function tickTimer() {
  const root = load();
  const bucket = bucketFor(root);
  const timer = normalizeTimer(bucket.timer);
  if (!timer.running) return buildState(timer);
  finishTimerIfNeeded(timer);
  save(root);
  return buildState(timer);
}

module.exports = {
  KEY,
  formatClock,
  state,
  setTimerPreset,
  setTimerMode,
  toggleTimerRunning,
  resetTimer,
  toggleAlarmMuted,
  dismissAlarm,
  pauseTimer,
  tickTimer,
};
