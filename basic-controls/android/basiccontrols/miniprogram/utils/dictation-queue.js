const pinyin = require('./pinyin');

const PLAN_DATE_KEY = 'dictation_plan_date';
const PLAN_CONFIG_KEY = 'dictation_plan_config';
const DEFAULT_PLAN_CONFIG = { repeatCount: 2, intervalSeconds: 8 };

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function markToday() {
  wx.setStorageSync(PLAN_DATE_KEY, todayKey());
}

function createQueueItem(input, index) {
  const text = String((input && input.text) || '').trim();
  if (!text) return null;
  return {
    id: (input && input.id) || `dq_${Date.now()}_${index || 0}_${Math.floor(Math.random() * 1000)}`,
    text: text,
    pinyin: (input && input.pinyin) || pinyin.toPinyin(text),
    sourceLabel: (input && input.sourceLabel) || '听写',
    sourceType: (input && input.sourceType) || 'session',
    sourceId: (input && input.sourceId) || 'session',
    ephemeral: true,
  };
}

function normalizeQueueItems(items) {
  return (items || []).map((item, index) => createQueueItem(item, index)).filter(Boolean);
}

function dedupeQueueItems(items) {
  const seen = {};
  const queue = [];
  (items || []).forEach((item) => {
    const text = String((item && item.text) || '').trim();
    if (!text || seen[text]) return;
    seen[text] = true;
    queue.push(Object.assign({}, item, { text: text }));
  });
  return queue;
}

function getQueue() {
  const planDate = wx.getStorageSync(PLAN_DATE_KEY);
  const today = todayKey();
  if (planDate && planDate !== today) {
    wx.setStorageSync('dictation_queue', []);
    wx.setStorageSync(PLAN_DATE_KEY, today);
    return [];
  }
  if (!planDate) wx.setStorageSync(PLAN_DATE_KEY, today);
  return dedupeQueueItems(wx.getStorageSync('dictation_queue') || []);
}

function setQueue(items) {
  const queue = dedupeQueueItems(normalizeQueueItems(items));
  wx.setStorageSync('dictation_queue', queue);
  markToday();
  return queue;
}

function appendQueue(items) {
  const queue = dedupeQueueItems(getQueue().concat(normalizeQueueItems(items)));
  wx.setStorageSync('dictation_queue', queue);
  markToday();
  return queue;
}

function normalizePlanConfig(config) {
  const input = config || {};
  return {
    repeatCount: Math.max(1, Math.min(5, Math.round(Number(input.repeatCount) || DEFAULT_PLAN_CONFIG.repeatCount))),
    intervalSeconds: Math.max(1, Math.min(10, Math.round(Number(input.intervalSeconds) || DEFAULT_PLAN_CONFIG.intervalSeconds))),
  };
}

function getPlanConfig() {
  return normalizePlanConfig(wx.getStorageSync(PLAN_CONFIG_KEY));
}

function setPlanConfig(config) {
  const next = normalizePlanConfig(config);
  wx.setStorageSync(PLAN_CONFIG_KEY, next);
  markToday();
  return next;
}

module.exports = {
  createQueueItem,
  normalizeQueueItems,
  dedupeQueueItems,
  getQueue,
  setQueue,
  appendQueue,
  getPlanConfig,
  setPlanConfig,
};
