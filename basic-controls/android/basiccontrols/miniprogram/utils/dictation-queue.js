const pinyin = require('./pinyin');

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
  return dedupeQueueItems(wx.getStorageSync('dictation_queue') || []);
}

function setQueue(items) {
  const queue = dedupeQueueItems(normalizeQueueItems(items));
  wx.setStorageSync('dictation_queue', queue);
  return queue;
}

function appendQueue(items) {
  const queue = dedupeQueueItems(getQueue().concat(normalizeQueueItems(items)));
  wx.setStorageSync('dictation_queue', queue);
  return queue;
}

module.exports = {
  createQueueItem,
  normalizeQueueItems,
  dedupeQueueItems,
  getQueue,
  setQueue,
  appendQueue,
};
