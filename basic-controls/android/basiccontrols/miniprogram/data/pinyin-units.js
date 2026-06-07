const TWO_LETTER_INITIALS = ['zh', 'ch', 'sh'];
const ONE_LETTER_INITIALS = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];

function exampleDisplay(syllable) {
  const twoLetter = TWO_LETTER_INITIALS.find((initial) => syllable.indexOf(initial) === 0);
  if (twoLetter) return `${twoLetter} + ${syllable.slice(twoLetter.length)}`;
  if (ONE_LETTER_INITIALS.indexOf(syllable[0]) >= 0) return `${syllable[0]} + ${syllable.slice(1)}`;
  return syllable;
}

function examples(first, second) {
  return [
    { display: exampleDisplay(first), syllableId: `${first}1` },
    { display: exampleDisplay(second), syllableId: `${second}1` },
  ];
}

const INITIAL_META = {
  b: ['b', '双唇先闭紧，再突然放开，气流较弱。', ['p'], ['bo', 'po']],
  p: ['p', '双唇突然放开，送气明显，可以用纸条感受气流。', ['b'], ['po', 'bo']],
  m: ['m', '双唇闭紧，让声音从鼻子里出来。', ['n'], ['mo', 'bo']],
  f: ['f', '上牙轻碰下唇，气流从缝隙中出来。', ['h'], ['fo', 'bo']],
  d: ['d', '舌尖顶住上齿龈，突然放开，气流较弱。', ['t'], ['de', 'te']],
  t: ['t', '舌尖顶住上齿龈后放开，送气明显。', ['d'], ['te', 'de']],
  n: ['n', '舌尖顶住上齿龈，让声音从鼻子里出来。', ['l'], ['ne', 'le']],
  l: ['l', '舌尖顶住上齿龈，声音从舌头两边出来。', ['n'], ['le', 'ne']],
  g: ['g', '舌根抬起抵住软腭，突然放开，气流较弱。', ['k'], ['ge', 'ke']],
  k: ['k', '舌根抬起后突然放开，送气明显。', ['g'], ['ke', 'ge']],
  h: ['h', '舌根靠近软腭，让气流摩擦出来。', ['f'], ['he', 'ge']],
  j: ['j', '舌面前部抬起，嘴角微微展开，气流较弱。', ['q', 'x'], ['ji', 'qi']],
  q: ['q', '发音位置和 j 相近，但送气明显。', ['j', 'x'], ['qi', 'ji']],
  x: ['x', '舌面靠近硬腭，让气流从中间摩擦出来。', ['j', 'q'], ['xi', 'ji']],
  zh: ['zh', '舌尖翘起靠近硬腭前部，气流较弱。', ['z', 'ch'], ['zhi', 'chi']],
  ch: ['ch', '发音位置和 zh 相同，但送气明显。', ['c', 'zh'], ['chi', 'zhi']],
  sh: ['sh', '舌尖翘起，让气流从窄缝中摩擦出来。', ['s'], ['shi', 'xi']],
  r: ['r', '舌尖翘起，声带振动，气流轻轻摩擦。', ['sh'], ['ri', 'le']],
  z: ['z', '舌尖平放靠近上齿背，气流较弱。', ['zh', 'c'], ['zi', 'ci']],
  c: ['c', '发音位置和 z 相同，但送气明显。', ['ch', 'z'], ['ci', 'zi']],
  s: ['s', '舌尖靠近上齿背，让气流摩擦出来。', ['sh'], ['si', 'xi']],
  y: ['y', '发音轻短，常帮助 i、ü 开头的音节规范书写。', ['w'], ['yi', 'ye']],
  w: ['w', '双唇先收圆，常帮助 u 开头的音节规范书写。', ['y'], ['wu', 'bo']],
};

const FINAL_META = {
  a: ['a', '嘴巴张大，声音响亮。', ['o'], ['bo', 'mo']],
  o: ['o', '嘴唇拢圆，舌头向后缩，保持声音响亮。', ['e'], ['bo', 'po']],
  e: ['e', '嘴巴半开，嘴角向两边，舌位靠后。', ['o'], ['de', 'ge']],
  i: ['i', '嘴角向两边展开，声音细长。', ['ü'], ['ji', 'xi']],
  u: ['u', '双唇收得又小又圆，声音响亮。', ['ü'], ['wu', 'bo']],
  ü: ['v', '嘴唇像 u 一样圆，舌位像 i 一样靠前。', ['u'], ['yu', 'qi']],
  ai: ['ai', '从 a 快速滑向 i，口型由大变小。', ['ei'], ['ai', 'ei']],
  ei: ['ei', '从 e 快速滑向 i，嘴角逐渐展开。', ['ai'], ['ei', 'ai']],
  ui: ['ui', '从 u 滑向 i，注意标调写在后一个字母。', ['iu'], ['ui', 'iu']],
  ao: ['ao', '从 a 滑向 o，嘴巴由大变圆。', ['ou'], ['ao', 'ou']],
  ou: ['ou', '从 o 滑向 u，嘴唇逐渐收拢。', ['ao'], ['ou', 'ao']],
  iu: ['iu', '从 i 滑向 u，注意标调写在后一个字母。', ['ui'], ['iu', 'ui']],
  ie: ['ie', '从 i 滑向 e，声音连贯。', ['üe'], ['ie', 'ye']],
  üe: ['ve', '从 ü 滑向 e，嘴唇先圆后放松。', ['ie'], ['ve', 'ye']],
  er: ['er', '舌尖微微卷起，是一个特殊韵母。', [], ['er', 'er']],
  an: ['an', '先发 a，再让舌尖抵住上齿龈收尾。', ['ang'], ['an', 'en']],
  en: ['en', '先发 e，再让舌尖抵住上齿龈收尾。', ['eng'], ['en', 'an']],
  in: ['in', '先发 i，再用前鼻音 n 收尾。', ['ing'], ['in', 'yin']],
  un: ['un', '先发 u，再用前鼻音 n 收尾。', ['ün'], ['un', 'in']],
  ün: ['vn', '先发 ü，再用前鼻音 n 收尾。', ['un'], ['vn', 'yun']],
  ang: ['ang', '先发 a，再用后鼻音 ng 收尾。', ['an'], ['ang', 'eng']],
  eng: ['eng', '先发 e，再用后鼻音 ng 收尾。', ['en'], ['eng', 'ing']],
  ing: ['ing', '先发 i，再用后鼻音 ng 收尾。', ['in'], ['ing', 'ying']],
  ong: ['ong', '嘴唇拢圆，用后鼻音 ng 收尾。', ['eng'], ['ong', 'eng']],
};

const WHOLE = ['zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si', 'yi', 'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying'];
const WHOLE_AUDIO = {
  zhi: 'zhi1', chi: 'chi1', shi: 'shi1', ri: 'ri4',
  zi: 'zi1', ci: 'ci1', si: 'si1', yi: 'yi1',
  wu: 'wu1', yu: 'yu1', ye: 'ye1', yue: 'yue1',
  yuan: 'yuan1', yin: 'yin1', yun: 'yun1', ying: 'ying1',
};

function buildUnits(kind, meta) {
  return Object.keys(meta).map((symbol, index) => {
    const item = meta[symbol];
    return {
      id: `${kind}_${symbol.replace(/ü/g, 'v')}`,
      kind,
      symbol,
      order: index + 1,
      audioId: item[0],
      audioMode: item[0] ? 'teaching_name' : 'self_record_required',
      mouthTip: item[1],
      compareIds: item[2].map((value) => `${kind}_${value.replace(/ü/g, 'v')}`),
      compareSymbols: item[2],
      examples: examples(item[3][0], item[3][1]),
    };
  });
}

const INITIALS = buildUnits('initial', INITIAL_META);
const FINALS = buildUnits('final', FINAL_META);
const WHOLE_SYLLABLES = WHOLE.map((symbol, index) => ({
  id: `whole_${symbol}`,
  kind: 'whole',
  symbol,
  order: index + 1,
  audioId: WHOLE_AUDIO[symbol],
  audioMode: 'syllable',
  mouthTip: '整体认读音节不拆开拼，看到后直接读出完整音节。',
  compareIds: [],
  compareSymbols: [],
  examples: [{ display: symbol, syllableId: WHOLE_AUDIO[symbol] }],
}));

const UNITS = INITIALS.concat(FINALS, WHOLE_SYLLABLES);

const CATEGORY_GROUPS = [
  { id: 'initial', title: '声母', description: '23 个声母', items: INITIALS },
  { id: 'final', title: '韵母', description: '24 个韵母', items: FINALS },
  { id: 'whole', title: '整体认读', description: '16 个整体认读音节', items: WHOLE_SYLLABLES },
];

const ZONES = [
  { id: 'tones', title: '声调花园', description: '四声和 a o e', symbols: ['a', 'o', 'e'] },
  { id: 'lips', title: '嘴唇小队', description: 'i u ü 和 b p m f', symbols: ['i', 'u', 'ü', 'b', 'p', 'm', 'f'] },
  { id: 'tip', title: '舌尖车站', description: 'd t n l', symbols: ['d', 't', 'n', 'l'] },
  { id: 'root', title: '舌根山谷', description: 'g k h', symbols: ['g', 'k', 'h'] },
  { id: 'smile', title: '微笑海湾', description: 'j q x 遇到 ü', symbols: ['j', 'q', 'x', 'ü'] },
  { id: 'retroflex', title: '翘舌森林', description: 'zh ch sh r', symbols: ['zh', 'ch', 'sh', 'r'] },
  { id: 'flat', title: '平舌沙地', description: 'z c s', symbols: ['z', 'c', 's'] },
  { id: 'castle', title: '拼读城堡', description: '复韵母、鼻韵母、整体认读', symbols: ['ai', 'an', 'ang', 'zhi', 'ying'] },
];

function findById(id) {
  return UNITS.find((item) => item.id === id) || UNITS[0];
}

function firstUnfinished(completedIds) {
  const done = new Set(completedIds || []);
  return UNITS.find((item) => !done.has(item.id)) || UNITS[0];
}

function unitsByKind(kind) {
  const group = CATEGORY_GROUPS.find((item) => item.id === kind);
  return group ? group.items : INITIALS;
}

module.exports = {
  INITIALS,
  FINALS,
  WHOLE_SYLLABLES,
  UNITS,
  CATEGORY_GROUPS,
  ZONES,
  findById,
  firstUnfinished,
  unitsByKind,
};
