const storage = require('./storage');

const KEY = 'daily_todo_state_v1';

const DEFAULT_TEMPLATE = [
  { title: '英语打卡', presetMinutes: 20 },
  { title: '音标大书', presetMinutes: 15 },
  { title: '听写', presetMinutes: 10 },
  { title: '口算', presetMinutes: 15 },
  { title: '错题', presetMinutes: 10 },
  { title: '实验班', presetMinutes: 20 },
  { title: '卷子', presetMinutes: 30 },
];

function load() {
  return wx.getStorageSync(KEY) || {};
}

function save(root) {
  wx.setStorageSync(KEY, root);
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function uid() {
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultBucket() {
  return {
    template: DEFAULT_TEMPLATE.map((item, index) => ({
      id: uid(),
      title: item.title,
      presetMinutes: item.presetMinutes,
      sortOrder: index,
    })),
    daily: { date: '', items: [] },
  };
}

function bucketFor(root) {
  const childId = storage.getCurrentChildId() || 'default';
  root.children = root.children || {};
  const raw = root.children[childId] || {};
  const bucket = Object.assign(defaultBucket(), raw);
  bucket.template = (bucket.template && bucket.template.length)
    ? bucket.template.slice().sort((a, b) => a.sortOrder - b.sortOrder)
    : defaultBucket().template;
  bucket.daily = bucket.daily || { date: '', items: [] };
  root.children[childId] = bucket;
  return bucket;
}

function cloneItemsFrom(sourceItems) {
  return sourceItems.map((item, index) => ({
    id: item.id || uid(),
    title: item.title,
    presetMinutes: item.presetMinutes || 0,
    done: false,
    sortOrder: index,
  }));
}

function ensureDaily(bucket) {
  const today = todayKey();
  if (bucket.daily.date === today && bucket.daily.items && bucket.daily.items.length) {
    return bucket.daily.items.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  }

  let source = [];
  if (bucket.daily.date === yesterdayKey() && bucket.daily.items && bucket.daily.items.length) {
    source = bucket.daily.items;
  } else if (bucket.template && bucket.template.length) {
    source = bucket.template;
  } else {
    source = defaultBucket().template;
  }

  const items = cloneItemsFrom(source);
  bucket.daily = { date: today, items };
  bucket.template = items.map((item, index) => ({
    id: item.id,
    title: item.title,
    presetMinutes: item.presetMinutes,
    sortOrder: index,
  }));
  return items;
}

function persistItems(bucket, items) {
  const sorted = items.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  sorted.forEach((item, index) => {
    item.sortOrder = index;
  });
  bucket.daily.items = sorted;
  bucket.daily.date = todayKey();
  bucket.template = sorted.map((item, index) => ({
    id: item.id,
    title: item.title,
    presetMinutes: item.presetMinutes,
    sortOrder: index,
  }));
}

function state() {
  const root = load();
  const bucket = bucketFor(root);
  ensureDaily(bucket);
  save(root);
  const items = bucket.daily.items.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const doneCount = items.filter((item) => item.done).length;
  return {
    items,
    doneCount,
    totalCount: items.length,
    today: todayKey(),
  };
}

function toggleItem(itemId) {
  const root = load();
  const bucket = bucketFor(root);
  const items = ensureDaily(bucket);
  const target = items.find((item) => item.id === itemId);
  if (target) target.done = !target.done;
  persistItems(bucket, items);
  save(root);
  return state();
}

function addItem(title, presetMinutes) {
  const root = load();
  const bucket = bucketFor(root);
  const items = ensureDaily(bucket);
  items.push({
    id: uid(),
    title: (title || '新任务').trim() || '新任务',
    presetMinutes: Math.max(0, parseInt(presetMinutes, 10) || 0),
    done: false,
    sortOrder: items.length,
  });
  persistItems(bucket, items);
  save(root);
  return state();
}

function updateItem(itemId, patch) {
  const root = load();
  const bucket = bucketFor(root);
  const items = ensureDaily(bucket);
  const target = items.find((item) => item.id === itemId);
  if (!target) return state();
  if (patch.title != null) target.title = String(patch.title).trim() || target.title;
  if (patch.presetMinutes != null) target.presetMinutes = Math.max(0, parseInt(patch.presetMinutes, 10) || 0);
  persistItems(bucket, items);
  save(root);
  return state();
}

function removeItem(itemId) {
  const root = load();
  const bucket = bucketFor(root);
  const items = ensureDaily(bucket).filter((item) => item.id !== itemId);
  persistItems(bucket, items);
  save(root);
  return state();
}

function reorderItems(fromIndex, toIndex) {
  const root = load();
  const bucket = bucketFor(root);
  const items = ensureDaily(bucket);
  if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
    return state();
  }
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
  persistItems(bucket, items);
  save(root);
  return state();
}

function resetToday() {
  const root = load();
  const bucket = bucketFor(root);
  const items = ensureDaily(bucket).map((item) => Object.assign({}, item, { done: false }));
  persistItems(bucket, items);
  save(root);
  return state();
}

module.exports = {
  KEY,
  DEFAULT_TEMPLATE,
  todayKey,
  state,
  toggleItem,
  addItem,
  updateItem,
  removeItem,
  reorderItems,
  resetToday,
};
