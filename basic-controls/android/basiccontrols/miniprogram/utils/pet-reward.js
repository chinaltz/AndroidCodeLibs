const storage = require('./storage');
const catalog = require('../config/pet-catalog');
const petRoutes = require('./pet-routes');

const KEY = 'pet_reward_state_v1';
const TASK_POINTS = {
  phonics: 8,
  pinyin: 8,
  dictation: 10,
};
const TASK_XP = {
  phonics: 12,
  pinyin: 12,
  dictation: 15,
};
const SHARE_POINTS = 5;
const DAILY_SHARE_LIMIT = 3;
const MAX_LEDGER_SIZE = 200;

function load() {
  return wx.getStorageSync(KEY) || {};
}

function save(data) {
  wx.setStorageSync(KEY, data);
}

function childKey() {
  return storage.getCurrentChildId() || 'default';
}

function defaultBucket() {
  return {
    points: 0,
    xp: 0,
    ledger: [],
    shareClaims: {},
  };
}

function getBucket(root, key) {
  root.children = root.children || {};
  root.children[key] = Object.assign(defaultBucket(), root.children[key] || {});
  root.children[key].ledger = root.children[key].ledger || [];
  root.children[key].shareClaims = root.children[key].shareClaims || {};
  return root.children[key];
}

function dayKey(time) {
  const date = new Date(time || Date.now());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function createEventId(moduleId, subjectId) {
  const suffix = Math.floor(Math.random() * 100000);
  return `${moduleId}:${subjectId || 'task'}:${Date.now()}:${suffix}`;
}

function findLedgerEvent(bucket, eventId) {
  return bucket.ledger.find((item) => item.eventId === eventId);
}

function grantTaskReward(input) {
  const root = load();
  const key = childKey();
  const bucket = getBucket(root, key);
  const existing = findLedgerEvent(bucket, input.eventId);
  if (existing) {
    return {
      awarded: false,
      points: existing.points,
      xp: existing.xp,
      balance: bucket.points,
      event: existing,
    };
  }

  const moduleId = input.moduleId || 'task';
  const points = Number(input.points == null ? TASK_POINTS[moduleId] || 5 : input.points);
  const xp = Number(input.xp == null ? TASK_XP[moduleId] || 8 : input.xp);
  const event = {
    eventId: input.eventId,
    type: 'task',
    moduleId,
    title: input.title || '完成学习任务',
    points,
    xp,
    createdAt: Date.now(),
  };
  bucket.points += points;
  bucket.xp += xp;
  bucket.ledger = [event].concat(bucket.ledger).slice(0, MAX_LEDGER_SIZE);
  save(root);
  return { awarded: true, points, xp, balance: bucket.points, event };
}

function getDailyShareCount(bucket, dateKey) {
  return bucket.ledger.filter((item) => (
    item.type === 'share' && dayKey(item.createdAt) === dateKey
  )).length;
}

function claimShareReward(eventId) {
  const root = load();
  const key = childKey();
  const bucket = getBucket(root, key);
  const taskEvent = findLedgerEvent(bucket, eventId);
  if (!taskEvent || taskEvent.type !== 'task') {
    return { awarded: false, reason: 'task_not_found', balance: bucket.points };
  }
  if (bucket.shareClaims[eventId]) {
    return { awarded: false, reason: 'already_claimed', balance: bucket.points };
  }

  const today = dayKey();
  if (getDailyShareCount(bucket, today) >= DAILY_SHARE_LIMIT) {
    return { awarded: false, reason: 'daily_limit', balance: bucket.points };
  }

  const shareEvent = {
    eventId: `share:${eventId}`,
    sourceEventId: eventId,
    type: 'share',
    moduleId: taskEvent.moduleId,
    title: `分享：${taskEvent.title}`,
    points: SHARE_POINTS,
    xp: 0,
    createdAt: Date.now(),
  };
  bucket.shareClaims[eventId] = shareEvent.createdAt;
  bucket.points += SHARE_POINTS;
  bucket.ledger = [shareEvent].concat(bucket.ledger).slice(0, MAX_LEDGER_SIZE);
  save(root);
  return {
    awarded: true,
    points: SHARE_POINTS,
    balance: bucket.points,
    dailyRemaining: Math.max(0, DAILY_SHARE_LIMIT - getDailyShareCount(bucket, today)),
  };
}

function getPetState() {
  const root = load();
  const bucket = getBucket(root, childKey());
  const today = dayKey();
  const shareCount = getDailyShareCount(bucket, today);
  const taskEvents = bucket.ledger.filter((item) => item.type === 'task');
  const levelInfo = catalog.levelForXp(bucket.xp);
  const next = catalog.nextLevel(bucket.xp);
  return {
    points: bucket.points,
    xp: bucket.xp,
    level: levelInfo.level,
    levelProgress: next
      ? Math.round(((bucket.xp - levelInfo.totalXp) / (next.totalXp - levelInfo.totalXp)) * 100)
      : 100,
    ledger: bucket.ledger.slice(0, 20),
    pendingShares: taskEvents
      .filter((item) => !bucket.shareClaims[item.eventId])
      .slice(0, 10),
    dailyShareCount: shareCount,
    dailyShareLimit: DAILY_SHARE_LIMIT,
  };
}

function shareMessage(eventId) {
  const state = getPetState();
  const event = state.ledger.find((item) => item.eventId === eventId && item.type === 'task');
  const taskTitle = event ? event.title : '学习任务';
  return {
    title: `我完成了${taskTitle}，快来看看我的电子宠物！`,
    path: `${petRoutes.entry}?sharedEventId=${encodeURIComponent(eventId || '')}`,
  };
}

module.exports = {
  SHARE_POINTS,
  DAILY_SHARE_LIMIT,
  createEventId,
  grantTaskReward,
  claimShareReward,
  getPetState,
  shareMessage,
};
