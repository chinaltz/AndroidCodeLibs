const TONE_MARKS = {
  a: ['a', 'ā', 'á', 'ǎ', 'à'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
  e: ['e', 'ē', 'é', 'ě', 'è'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
  ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

function toneIndex(base) {
  if (base.indexOf('a') >= 0) return base.indexOf('a');
  if (base.indexOf('o') >= 0) return base.indexOf('o');
  if (base.indexOf('e') >= 0) return base.indexOf('e');
  const iuIndex = base.indexOf('iu');
  if (iuIndex >= 0) return iuIndex + 1;
  const uiIndex = base.indexOf('ui');
  if (uiIndex >= 0) return uiIndex + 1;
  const üIndex = base.indexOf('ü');
  if (üIndex >= 0) return üIndex;
  const iIndex = base.indexOf('i');
  if (iIndex >= 0) return iIndex;
  return base.indexOf('u');
}

function applyToneMark(base, tone) {
  const normalized = String(base || '').toLowerCase().replace(/v/g, 'ü');
  const toneNumber = Number(tone);
  if (!normalized || toneNumber < 1 || toneNumber > 4) return normalized;
  const index = toneIndex(normalized);
  if (index < 0) return normalized;
  const vowel = normalized[index];
  const mark = TONE_MARKS[vowel] && TONE_MARKS[vowel][toneNumber];
  if (!mark) return normalized;
  return `${normalized.slice(0, index)}${mark}${normalized.slice(index + 1)}`;
}

module.exports = { TONE_MARKS, applyToneMark };
