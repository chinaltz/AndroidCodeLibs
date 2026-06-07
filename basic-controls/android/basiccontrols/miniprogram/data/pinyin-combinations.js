const { applyToneMark } = require('./pinyin-tones');

const COMBINATIONS = {
  b: ['a', 'o', 'i', 'u', 'ai', 'ei', 'ao', 'an', 'en', 'ang', 'eng'],
  p: ['a', 'o', 'i', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ing'],
  m: ['a', 'o', 'e', 'i', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ing'],
  f: ['a', 'o', 'u', 'ei', 'ou', 'an', 'en', 'ang', 'eng'],
  d: ['a', 'e', 'i', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'ang', 'eng', 'ing', 'ong'],
  t: ['a', 'e', 'i', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'ang', 'eng', 'ing', 'ong'],
  n: ['a', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ao', 'an', 'en', 'ang', 'eng', 'ing'],
  l: ['a', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ao', 'ou', 'an', 'ang', 'eng', 'ing'],
  g: ['a', 'e', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  k: ['a', 'e', 'u', 'ai', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  h: ['a', 'e', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  j: ['i', 'ü', 'ie', 'üe', 'in', 'ün', 'ing'],
  q: ['i', 'ü', 'ie', 'üe', 'in', 'ün', 'ing'],
  x: ['i', 'ü', 'ie', 'üe', 'in', 'ün', 'ing'],
  zh: ['a', 'e', 'i', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  ch: ['a', 'e', 'i', 'u', 'ai', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  sh: ['a', 'e', 'i', 'u', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng'],
  r: ['e', 'i', 'u', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  z: ['a', 'e', 'i', 'u', 'ai', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  c: ['a', 'e', 'i', 'u', 'ai', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  s: ['a', 'e', 'i', 'u', 'ai', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong'],
  y: ['a', 'e', 'i', 'u', 'ü', 'ao', 'ou', 'an', 'in', 'ing'],
  w: ['a', 'o', 'u', 'ai', 'ei', 'an', 'en', 'ang', 'eng'],
};

const BUNDLED_COMBINATIONS = {
  b: ['o'],
  p: ['o'],
  m: ['o'],
  f: ['o'],
  d: ['e'],
  t: ['e'],
  n: ['e'],
  l: ['e'],
  g: ['e'],
  k: ['e'],
  h: ['e'],
  j: ['i'],
  q: ['i'],
  x: ['i'],
  zh: ['i'],
  ch: ['i'],
  sh: ['i'],
  r: ['i'],
  z: ['i'],
  c: ['i'],
  s: ['i'],
  y: ['i'],
  w: ['u'],
};

function availableFinals(initial) {
  return COMBINATIONS[initial] || [];
}

function availableBundledFinals(initial) {
  return BUNDLED_COMBINATIONS[initial] || [];
}

function isValidCombination(initial, final) {
  return availableFinals(initial).indexOf(final) >= 0;
}

function spellingFor(initial, final) {
  if (['j', 'q', 'x'].indexOf(initial) >= 0 && final.indexOf('ü') === 0) {
    return `${initial}u${final.slice(1)}`;
  }
  if (initial === 'y') {
    if (final === 'i') return 'yi';
    if (final === 'ü') return 'yu';
    if (final === 'üe') return 'yue';
    if (final === 'ün') return 'yun';
  }
  if (initial === 'w' && final === 'u') return 'wu';
  return `${initial}${final}`.replace(/ü/g, 'v');
}

function displaySpelling(initial, final, tone) {
  return applyToneMark(spellingFor(initial, final).replace(/v/g, 'ü'), tone);
}

function audioIdFor(initial, final, tone) {
  return `${spellingFor(initial, final)}${tone}`;
}

module.exports = {
  COMBINATIONS,
  BUNDLED_COMBINATIONS,
  availableFinals,
  availableBundledFinals,
  isValidCombination,
  spellingFor,
  displaySpelling,
  audioIdFor,
};
