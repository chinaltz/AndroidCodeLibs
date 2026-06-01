const { PHONEMES } = require('../data/phonemes');

function shuffle(list, seed) {
  const arr = list.slice();
  let s = seed || Date.now();
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function buildListenOptions(current, seed) {
  const seen = new Set([current.symbol]);
  const options = [current.symbol];
  const same = [];
  const other = [];
  PHONEMES.forEach((p) => {
    if (p.id === current.id) return;
    (p.groupTitle === current.groupTitle ? same : other).push(p);
  });
  [same, other].forEach((pool) => {
    shuffle(pool, seed).forEach((p) => {
      if (options.length >= 4) return;
      if (!seen.has(p.symbol)) {
        seen.add(p.symbol);
        options.push(p.symbol);
      }
    });
  });
  return shuffle(options, seed + 1);
}

function buildWordOptions(current, seed) {
  const correct = current.words[0].text;
  const forbidden = new Set(current.words.map((w) => w.text.toLowerCase()));
  const fallback = [];
  const preferred = [];
  PHONEMES.forEach((other) => {
    if (other.id === current.id) return;
    other.words.forEach((w) => {
      const lower = w.text.toLowerCase();
      if (forbidden.has(lower)) return;
      (other.groupTitle === current.groupTitle ? preferred : fallback).push(w.text);
    });
  });
  const wrongs = [];
  const picked = new Set(forbidden);
  [fallback, preferred].forEach((pool) => {
    shuffle(pool, seed).forEach((word) => {
      if (wrongs.length >= 2) return;
      const lower = word.toLowerCase();
      if (!picked.has(lower)) {
        picked.add(lower);
        wrongs.push(word);
      }
    });
  });
  const options = shuffle([correct].concat(wrongs), seed + 2);
  return { options, correctIndex: options.indexOf(correct) };
}

module.exports = { buildListenOptions, buildWordOptions };
