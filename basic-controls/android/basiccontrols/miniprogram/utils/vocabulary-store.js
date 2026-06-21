const storage = require('./storage');

const KEY = 'vocabulary_state_v1';

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function loadAll() {
  return wx.getStorageSync(KEY) || {};
}

function childId() {
  return storage.getCurrentChildId() || 'default';
}

function getState() {
  const all = loadAll();
  const state = all[childId()] || { words: [], planIds: [], planDate: todayKey() };
  if (state.planDate !== todayKey()) {
    state.planDate = todayKey();
    state.planIds = [];
    all[childId()] = state;
    wx.setStorageSync(KEY, all);
  }
  return state;
}

function saveState(state) {
  const all = loadAll();
  all[childId()] = state;
  wx.setStorageSync(KEY, all);
  return state;
}

function getWords() {
  return (getState().words || []).slice();
}

function addWord(word, meaning) {
  const text = String(word || '').trim().toLowerCase();
  if (!text) return { ok: false, reason: 'empty' };
  if (!/^[a-z][a-z '\-]*$/i.test(text)) return { ok: false, reason: 'invalid' };
  const state = getState();
  if ((state.words || []).some((item) => item.word.toLowerCase() === text)) {
    return { ok: false, reason: 'duplicate' };
  }
  state.words = (state.words || []).concat({
    id: `vw_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    word: text,
    meaning: String(meaning || '').trim(),
    createdAt: Date.now(),
  });
  saveState(state);
  return { ok: true };
}

function updateWord(id, word, meaning) {
  const text = String(word || '').trim().toLowerCase();
  if (!text) return { ok: false, reason: 'empty' };
  if (!/^[a-z][a-z '\-]*$/i.test(text)) return { ok: false, reason: 'invalid' };
  const state = getState();
  if ((state.words || []).some((item) => item.id !== id && item.word.toLowerCase() === text)) {
    return { ok: false, reason: 'duplicate' };
  }
  let found = false;
  state.words = (state.words || []).map((item) => {
    if (item.id !== id) return item;
    found = true;
    return Object.assign({}, item, { word: text, meaning: String(meaning || '').trim(), updatedAt: Date.now() });
  });
  if (!found) return { ok: false, reason: 'missing' };
  saveState(state);
  return { ok: true };
}

function deleteWord(id) {
  const state = getState();
  state.words = (state.words || []).filter((item) => item.id !== id);
  state.planIds = (state.planIds || []).filter((itemId) => itemId !== id);
  saveState(state);
}

function getPlanIds() {
  return (getState().planIds || []).slice();
}

function setPlanIds(ids) {
  const state = getState();
  const available = new Set((state.words || []).map((item) => item.id));
  state.planIds = (ids || []).filter((id, index, list) => available.has(id) && list.indexOf(id) === index);
  state.planDate = todayKey();
  saveState(state);
  return state.planIds.slice();
}

function getPlanWords() {
  const state = getState();
  const selected = new Set(state.planIds || []);
  return (state.words || []).filter((item) => selected.has(item.id));
}

function normalizePlanConfig(config) {
  const input = config || {};
  return {
    repeatCount: Math.max(1, Math.min(5, Math.round(Number(input.repeatCount) || 2))),
    intervalSeconds: Math.max(1, Math.min(10, Math.round(Number(input.intervalSeconds) || 8))),
  };
}

function getPlanConfig() {
  return normalizePlanConfig(getState().planConfig);
}

function setPlanConfig(config) {
  const state = getState();
  state.planConfig = normalizePlanConfig(config);
  saveState(state);
  return Object.assign({}, state.planConfig);
}

module.exports = { getWords, addWord, updateWord, deleteWord, getPlanIds, setPlanIds, getPlanWords, getPlanConfig, setPlanConfig };
