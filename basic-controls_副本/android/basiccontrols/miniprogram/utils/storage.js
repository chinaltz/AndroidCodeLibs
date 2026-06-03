const KEY = 'phonics_progress';

function load() {
  return wx.getStorageSync(KEY) || {};
}

function save(data) {
  wx.setStorageSync(KEY, data);
}

function getCompleted() {
  return load().doneIds || [];
}

function setCompleted(ids) {
  const data = load();
  data.doneIds = ids;
  save(data);
}

function getThemeKey() {
  const data = load();
  if (data.nightTheme === true) return 'night';
  return data.themeKey || 'sky';
}

function setThemeKey(key) {
  const data = load();
  data.themeKey = key;
  delete data.nightTheme;
  save(data);
}

function getLanguage() {
  return load().language || 'zh-CN';
}

function setLanguage(code) {
  const data = load();
  data.language = code;
  save(data);
}

module.exports = {
  getCompleted, setCompleted, getThemeKey, setThemeKey, getLanguage, setLanguage,
};
