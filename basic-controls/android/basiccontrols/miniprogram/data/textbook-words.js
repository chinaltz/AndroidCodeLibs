const fullCatalog = require('./textbook-characters.full.js');
const pinyin = require('../utils/pinyin');

const DAILY_SOURCE = {
  id: 'daily',
  label: '日常',
  bookTitle: '日常',
  unitTitle: '',
  lessonTitle: '',
  grade: 0,
  volume: '',
  verified: true,
  words: [],
};

const VERIFIED_LESSON_SOURCES = [
  {
    id: 'rj-yw-g1a-u1-l1',
    label: '一年级上 · 第一单元 · 第一课',
    bookTitle: '一年级上',
    unitTitle: '第一单元',
    lessonTitle: '第一课',
    grade: 1,
    volume: '上',
    unitNo: 1,
    lessonNo: 1,
    verified: false,
    words: ['天', '地', '人', '你', '我', '他'].map((text) => ({ text, pinyin: pinyin.toPinyin(text) })),
  },
];

const BOOK_SOURCES = fullCatalog.books.map((book) => ({
  id: book.id,
  label: `${book.label} · 分册生字表`,
  bookTitle: book.label,
  unitTitle: '',
  lessonTitle: '分册生字表',
  grade: book.grade,
  volume: book.volume,
  unitNo: 0,
  lessonNo: 0,
  verified: false,
  declaredCount: book.declaredCount,
  count: book.count,
  words: book.characters.map((text) => ({ text })),
}));

const TEXTBOOK_SOURCES = VERIFIED_LESSON_SOURCES.concat(BOOK_SOURCES);
const ALL_SOURCES = [DAILY_SOURCE].concat(TEXTBOOK_SOURCES);

function sourceOptions() {
  return ALL_SOURCES.map((source) => source.label);
}

function getSource(index) {
  return ALL_SOURCES[index] || DAILY_SOURCE;
}

function getSourceIndexById(sourceId) {
  return ALL_SOURCES.findIndex((source) => source.id === sourceId);
}

function toSourceMatch(source, word) {
  if (source.id === DAILY_SOURCE.id) {
    return {
      sourceId: source.id,
      sourceLabel: source.label,
      sourceType: 'daily',
      bookTitle: source.bookTitle,
      unitTitle: '',
      lessonTitle: '',
      pinyin: '',
    };
  }

  return {
    sourceId: source.id,
    sourceLabel: source.label,
    sourceType: 'textbook',
    bookTitle: source.bookTitle || `${source.grade}年级${source.volume}`,
    unitTitle: source.unitTitle || '',
    lessonTitle: source.lessonTitle || '分册生字表',
    pinyin: word && word.pinyin ? word.pinyin : '',
    verified: !!source.verified,
  };
}

function findWordSource(text) {
  const normalized = String(text || '').trim();
  if (!normalized) return Object.assign(toSourceMatch(DAILY_SOURCE), { sourceIndex: 0 });

  for (let sourceIndex = 0; sourceIndex < TEXTBOOK_SOURCES.length; sourceIndex += 1) {
    const source = TEXTBOOK_SOURCES[sourceIndex];
    const word = source.words.find((item) => item.text === normalized);
    if (word) {
      return Object.assign(toSourceMatch(source, word), {
        sourceIndex: sourceIndex + 1,
        word,
        pinyin: word.pinyin || pinyin.toPinyin(normalized),
      });
    }
  }

  return Object.assign(toSourceMatch(DAILY_SOURCE), {
    sourceIndex: 0,
    pinyin: pinyin.toPinyin(normalized),
  });
}

module.exports = {
  DAILY_SOURCE,
  TEXTBOOK_SOURCES,
  BOOK_SOURCES,
  fullCatalog,
  sourceOptions,
  getSource,
  getSourceIndexById,
  findWordSource,
};
