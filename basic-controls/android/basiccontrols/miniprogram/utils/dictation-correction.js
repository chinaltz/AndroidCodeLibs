const storage = require('./storage');
const pinyin = require('./pinyin');

const SIM_SOURCE_LABEL = '模拟批改';

function buildGradeItem(item) {
  return {
    id: item.id,
    text: item.text,
    pinyin: item.pinyin || pinyin.toPinyin(item.text),
    sourceLabel: item.sourceLabel || '日常',
    chars: Array.from(item.text).map((char, index) => ({
      id: item.id + '__' + index,
      char: char,
      index: index,
      active: false,
    })),
    result: 'pending',
    showWrongDetail: false,
  };
}

function buildStats(items) {
  const total = items.length;
  const correct = items.filter((item) => item.result === 'correct').length;
  const wrong = items.filter((item) => item.result === 'wrong').length;
  const pending = items.filter((item) => item.result === 'pending').length;
  return { total, correct, wrong, pending };
}

function validateGradedItems(items) {
  if (!items.length) {
    return { ok: false, message: '没有可批改的词语' };
  }
  if (!items.every((item) => item.result !== 'pending')) {
    return { ok: false, message: '请批改所有词语' };
  }
  const missingWrongChars = items.filter((item) => (
    item.result === 'wrong' && !item.chars.some((char) => char.active)
  ));
  if (missingWrongChars.length) {
    return { ok: false, message: '错误词语请点选具体错字' };
  }
  return { ok: true };
}

function buildSessionResults(items) {
  return items.map((item) => ({
    id: item.id,
    text: item.text,
    pinyin: item.pinyin,
    sourceLabel: item.sourceLabel,
    result: item.result,
    wrongChars: item.result === 'wrong'
      ? item.chars.filter((c) => c.active).map((c) => ({ index: c.index, char: c.char }))
      : [],
  }));
}

function saveSessionResults(sessionResults, childId) {
  const targetChildId = childId || storage.getCurrentChildId();
  sessionResults.forEach((entry) => {
    if (entry.result !== 'wrong' || !entry.wrongChars.length) return;
    storage.recordWrongCharsFromDictation(entry.text, entry.wrongChars, targetChildId, {
      pinyin: entry.pinyin,
      sourceLabel: entry.sourceLabel,
    });
  });
}

function snapshotCharacters(childId) {
  const map = {};
  storage.getCharacters(childId).forEach((character) => {
    map[character.text] = {
      id: character.id,
      wrongCount: character.wrongCount || 0,
    };
  });
  return map;
}

function collectSelectedWrongChars(sessionResults) {
  const chars = [];
  sessionResults.forEach((entry) => {
    if (entry.result !== 'wrong') return;
    (entry.wrongChars || []).forEach((item) => {
      if (chars.indexOf(item.char) < 0) chars.push(item.char);
    });
  });
  return chars.sort();
}

function verifyCorrection(options) {
  const {
    beforeSnapshot,
    afterSnapshot,
    sessionResults,
    expectedChars,
  } = options;
  const selected = collectSelectedWrongChars(sessionResults);
  const expected = (expectedChars && expectedChars.length)
    ? expectedChars.slice().sort()
    : selected.slice();
  const checks = [];

  checks.push({
    id: 'selected_count',
    label: '点选错字数量',
    pass: selected.length === expected.length,
    detail: `期望 ${expected.length} 个，实际 ${selected.length} 个（${selected.join('、') || '无'}）`,
  });

  if (expectedChars && expectedChars.length) {
    const sameSet = expected.length === selected.length
      && expected.every((char) => selected.indexOf(char) >= 0);
    checks.push({
      id: 'selected_set',
      label: '点选错字集合',
      pass: sameSet,
      detail: sameSet
        ? expected.join('、')
        : `期望 ${expected.join('、')}；实际 ${selected.join('、')}`,
    });
  }

  expected.forEach((char) => {
    const before = beforeSnapshot[char];
    const after = afterSnapshot[char];
    const pass = !!after && (!before || after.wrongCount === before.wrongCount + 1);
    checks.push({
      id: 'char_' + char,
      label: '「' + char + '」错次 +1',
      pass: pass,
      detail: after
        ? ((before ? before.wrongCount : 0) + ' → ' + after.wrongCount)
        : '未写入错字库',
    });
  });

  const unexpected = [];
  Object.keys(afterSnapshot).forEach((char) => {
    if (expected.indexOf(char) >= 0) return;
    const before = beforeSnapshot[char];
    const after = afterSnapshot[char];
    if (!before && after) unexpected.push(char);
    else if (before && after.wrongCount > before.wrongCount) unexpected.push(char);
  });
  checks.push({
    id: 'no_extra',
    label: '未多记其他错字',
    pass: unexpected.length === 0,
    detail: unexpected.length ? ('多记：' + unexpected.join('、')) : '通过',
  });

  return {
    pass: checks.every((check) => check.pass),
    checks: checks,
    selected: selected,
    expected: expected,
  };
}

function ensureSimWords(queue) {
  return queue.map((item, index) => Object.assign({}, item, {
    id: item.id || `sim_${Date.now()}_${index}`,
    pinyin: item.pinyin || pinyin.toPinyin(item.text),
    sourceLabel: item.sourceLabel || SIM_SOURCE_LABEL,
  }));
}

function applyAutoGrade(items, autoGrade) {
  return items.map((item) => {
    const rule = autoGrade.find((entry) => entry.id === item.id || entry.text === item.text);
    if (!rule) return item;
    return Object.assign({}, item, {
      result: rule.result,
      showWrongDetail: rule.result === 'wrong',
      chars: item.chars.map((char) => Object.assign({}, char, {
        active: rule.result === 'wrong' && (rule.chars || []).indexOf(char.char) >= 0,
      })),
    });
  });
}

const SCENARIOS = [
  {
    id: 'manual_three_chars',
    title: '手动验：3 个错字',
    desc: '「天地」错字选「天」，「人们」错字选「人、们」。保存后应刚好 3 个错字。',
    queue: [
      { text: '天地' },
      { text: '人们' },
    ],
    expectedChars: ['天', '人', '们'],
  },
  {
    id: 'auto_three_chars',
    title: '自动验：3 个错字',
    desc: '一键填充批改：天、人、们；「喜欢」判正确，不应产生错字。',
    queue: [
      { text: '天地' },
      { text: '人们' },
      { text: '喜欢' },
    ],
    autoGrade: [
      { text: '天地', result: 'wrong', chars: ['天'] },
      { text: '人们', result: 'wrong', chars: ['人', '们'] },
      { text: '喜欢', result: 'correct', chars: [] },
    ],
    expectedChars: ['天', '人', '们'],
  },
  {
    id: 'auto_single_char',
    title: '自动验：只记 1 字',
    desc: '「游泳」只选「游」，验证不会把整词 2 字都记错。',
    queue: [
      { text: '游泳' },
      { text: '猫' },
    ],
    autoGrade: [
      { text: '游泳', result: 'wrong', chars: ['游'] },
      { text: '猫', result: 'correct', chars: [] },
    ],
    expectedChars: ['游'],
  },
];

module.exports = {
  SIM_SOURCE_LABEL,
  SCENARIOS,
  buildGradeItem,
  buildStats,
  validateGradedItems,
  buildSessionResults,
  saveSessionResults,
  snapshotCharacters,
  verifyCorrection,
  ensureSimWords,
  applyAutoGrade,
};
