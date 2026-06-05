const TinyPinyin = require('../vendor/tiny-pinyin/core');

function toPinyin(text) {
  const value = String(text || '').trim();
  if (!value || !TinyPinyin.isSupported()) return '';
  return TinyPinyin.convertToPinyin(value, ' ', true).toLowerCase();
}

module.exports = { toPinyin };
