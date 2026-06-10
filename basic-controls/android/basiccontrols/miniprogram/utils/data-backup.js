const PROGRESS_KEY = 'phonics_progress';
const SESSION_KEYS = [
  'dictation_queue',
  'dictation_session_results',
  'dictation_session_summary',
  'pet_reward_state_v1',
  'daily_todo_state_v1',
  'pomodoro_state_v1',
];
const BACKUP_VERSION = 1;
const APP_ID = 'basiccontrols-miniprogram';

function readSessionData() {
  const session = {};
  SESSION_KEYS.forEach((key) => {
    try {
      const value = wx.getStorageSync(key);
      if (value !== '' && value != null) session[key] = value;
    } catch (err) {
      // ignore missing keys
    }
  });
  return session;
}

function writeSessionData(session) {
  SESSION_KEYS.forEach((key) => {
    if (session && Object.prototype.hasOwnProperty.call(session, key)) {
      wx.setStorageSync(key, session[key]);
    }
  });
}

function buildBackup() {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: APP_ID,
    data: {
      phonics_progress: wx.getStorageSync(PROGRESS_KEY) || {},
      session: readSessionData(),
    },
  };
}

function summarizeBackup(backup) {
  const progress = (backup && backup.data && backup.data.phonics_progress) || {};
  const children = progress.children || [];
  let characterCount = 0;
  let wordCount = 0;
  const childData = progress.childData || {};
  Object.keys(childData).forEach((childId) => {
    const bucket = childData[childId] || {};
    characterCount += (bucket.characters || []).length;
    wordCount += (bucket.words || []).length;
  });
  characterCount += (progress.characters || []).length;
  wordCount += (progress.words || []).length;
  return {
    childCount: children.length,
    characterCount: characterCount,
    wordCount: wordCount,
    exportedAt: backup && backup.exportedAt,
    version: backup && backup.version,
  };
}

function validateBackup(backup) {
  if (!backup || typeof backup !== 'object') {
    return { ok: false, message: '备份内容无效' };
  }
  if (!backup.data || typeof backup.data !== 'object') {
    return { ok: false, message: '备份缺少 data 字段' };
  }
  if (!backup.data.phonics_progress || typeof backup.data.phonics_progress !== 'object') {
    return { ok: false, message: '备份缺少学习进度数据' };
  }
  if (backup.app && backup.app !== APP_ID) {
    return { ok: false, message: '备份来源不是当前小程序' };
  }
  if (backup.version && backup.version > BACKUP_VERSION) {
    return { ok: false, message: '备份版本过新，请先升级小程序' };
  }
  return { ok: true };
}

function importBackup(backup) {
  const validation = validateBackup(backup);
  if (!validation.ok) return validation;

  wx.setStorageSync(PROGRESS_KEY, backup.data.phonics_progress);
  if (backup.data.session) writeSessionData(backup.data.session);
  return { ok: true, summary: summarizeBackup(backup) };
}

function serializeBackup(backup) {
  return JSON.stringify(backup);
}

function parseBackupText(text) {
  const raw = String(text || '').trim();
  if (!raw) return { ok: false, message: '请先粘贴备份内容' };
  try {
    return { ok: true, backup: JSON.parse(raw) };
  } catch (err) {
    return { ok: false, message: '备份文本不是有效 JSON' };
  }
}

function copyBackupToClipboard() {
  const backup = buildBackup();
  const text = serializeBackup(backup);
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => resolve({ backup: backup, summary: summarizeBackup(backup) }),
      fail: (err) => reject(err || new Error('复制失败')),
    });
  });
}

module.exports = {
  BACKUP_VERSION,
  buildBackup,
  summarizeBackup,
  validateBackup,
  importBackup,
  serializeBackup,
  parseBackupText,
  copyBackupToClipboard,
};
