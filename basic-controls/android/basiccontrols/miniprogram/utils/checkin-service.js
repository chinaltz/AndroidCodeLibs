const storage = require('./storage');
const petReward = require('./pet-reward');
const petService = require('./pet-service');

const KEY = 'holiday_checkin_v1';

function dateKey(date) {
  const value = date || new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function load() { return wx.getStorageSync(KEY) || {}; }
function save(root) { wx.setStorageSync(KEY, root); }
function childId() { return storage.getCurrentChildId() || 'default'; }

function bucketFor(root) {
  root.children = root.children || {};
  root.children[childId()] = root.children[childId()] || { days: {} };
  root.children[childId()].days = root.children[childId()].days || {};
  return root.children[childId()];
}

function recordDailyCompletion(taskCount) {
  const root = load();
  const bucket = bucketFor(root);
  const today = dateKey();
  const existed = !!(bucket.days[today] && bucket.days[today].completed);
  bucket.days[today] = Object.assign({}, bucket.days[today] || {}, {
    date: today,
    completed: true,
    completedAt: (bucket.days[today] && bucket.days[today].completedAt) || Date.now(),
    taskCount: Number(taskCount) || 0,
  });
  save(root);
  const reward = petReward.grantTaskReward({
    eventId: `daily-checkin:${childId()}:${today}`,
    moduleId: 'daily_checkin',
    title: `完成 ${taskCount} 项每日任务`,
    points: 12,
    xp: 20,
  });
  const boost = petService.applyDailyCheckin(today);
  return { recorded: !existed, reward, boost, day: bucket.days[today] };
}

function saveLog(targetDate, note) {
  const root = load();
  const bucket = bucketFor(root);
  const key = targetDate || dateKey();
  bucket.days[key] = Object.assign({}, bucket.days[key] || { date: key, completed: false }, {
    note: String(note || '').trim().slice(0, 500),
    updatedAt: Date.now(),
  });
  save(root);
  return bucket.days[key];
}

function getDay(targetDate) {
  return Object.assign({ date: targetDate, completed: false, note: '' }, bucketFor(load()).days[targetDate] || {});
}

function getDays() {
  const days = bucketFor(load()).days;
  return Object.keys(days).reduce((result, key) => {
    result[key] = Object.assign({}, days[key]);
    return result;
  }, {});
}

function getStats() {
  const days = getDays();
  const completed = Object.keys(days).filter((key) => days[key].completed).sort();
  let streak = 0;
  const cursor = new Date();
  while (completed.indexOf(dateKey(cursor)) >= 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { total: completed.length, streak, todayCompleted: completed.indexOf(dateKey()) >= 0 };
}

module.exports = { KEY, dateKey, recordDailyCompletion, saveLog, getDay, getDays, getStats };
