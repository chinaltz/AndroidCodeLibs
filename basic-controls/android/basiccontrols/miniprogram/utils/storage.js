const KEY = 'phonics_progress';

function load() {
  return wx.getStorageSync(KEY) || {};
}

function save(data) {
  wx.setStorageSync(KEY, data);
}

function getThemeKey() {
  const child = getCurrentChild();
  if (child && child.themeKey) return child.themeKey;
  const data = load();
  if (data.nightTheme === true) return 'night';
  return data.themeKey || 'sky';
}

function setThemeKey(key) {
  const data = load();
  const childId = getCurrentChildId();
  if (childId) {
    data.children = (data.children || []).map((child) => {
      if (child.id !== childId) return child;
      return Object.assign({}, child, { themeKey: key, updatedAt: Date.now() });
    });
  } else {
    data.themeKey = key;
  }
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

function nowId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function getChildren() {
  const data = load();
  let changed = false;
  data.children = (data.children || []).map((child) => {
    if ((child.moduleConfigVersion || 1) >= 2) return child;
    changed = true;
    const modules = Array.isArray(child.modules) ? child.modules.slice() : ['phonics', 'pinyin', 'words'];
    if (modules.indexOf('vocabulary') < 0) modules.push('vocabulary');
    return Object.assign({}, child, { modules: normalizeModules(modules), moduleConfigVersion: 2 });
  });
  if (changed) save(data);
  return data.children;
}

function getCurrentChildId() {
  const data = load();
  const children = data.children || [];
  if (data.currentChildId && children.some((child) => child.id === data.currentChildId)) {
    return data.currentChildId;
  }
  return children[0] ? children[0].id : '';
}

function getCurrentChild() {
  const id = getCurrentChildId();
  return getChildren().find((child) => child.id === id) || null;
}

function createChild(input) {
  const data = load();
  const children = data.children || [];
  const time = Date.now();
  const child = {
    id: nowId('child'),
    nickname: (input.nickname || '').trim(),
    avatar: input.avatar || 'boy',
    themeKey: input.themeKey || 'sky',
    modules: normalizeModules(input.modules),
    moduleConfigVersion: 2,
    createdAt: time,
    updatedAt: time,
  };
  data.children = children.concat(child);
  data.currentChildId = child.id;
  data.childData = data.childData || {};
  data.childData[child.id] = {
    doneIds: [],
    pinyinDoneIds: [],
    pinyinLastUnitId: '',
    pinyinMistakes: {},
    pinyinPracticeLog: [],
    wordStats: {
      pendingCount: 0,
      totalCount: 0,
      maxWrongCount: 0,
    },
  };
  save(data);
  return child;
}

function switchChild(id) {
  const data = load();
  if ((data.children || []).some((child) => child.id === id)) {
    data.currentChildId = id;
    save(data);
  }
}

function updateChild(id, patch) {
  const data = load();
  data.children = (data.children || []).map((child) => {
    if (child.id !== id) return child;
    const nextPatch = Object.assign({}, patch);
    if (nextPatch.modules) nextPatch.modules = normalizeModules(nextPatch.modules);
    return Object.assign({}, child, nextPatch, { updatedAt: Date.now() });
  });
  save(data);
}

function deleteChild(id) {
  const data = load();
  const children = data.children || [];
  if (!children.some((child) => child.id === id)) return false;
  data.children = children.filter((child) => child.id !== id);
  if (data.childData) delete data.childData[id];
  if (data.currentChildId === id) {
    data.currentChildId = data.children[0] ? data.children[0].id : '';
  }
  save(data);
  return true;
}

function normalizeModules(modules) {
  const allowed = ['phonics', 'pinyin', 'words', 'vocabulary'];
  const source = Array.isArray(modules) && modules.length ? modules : allowed;
  return allowed.filter((key) => source.indexOf(key) >= 0);
}

function getChildData(childId) {
  const data = load();
  const id = childId || getCurrentChildId();
  const childData = data.childData || {};
  return childData[id] || {};
}

function getCompleted() {
  const child = getCurrentChild();
  if (!child) return load().doneIds || [];
  return getChildData(child.id).doneIds || [];
}

function setCompleted(ids) {
  const data = load();
  const childId = getCurrentChildId();
  if (!childId) {
    data.doneIds = ids;
    save(data);
    return;
  }
  data.childData = data.childData || {};
  data.childData[childId] = data.childData[childId] || {};
  data.childData[childId].doneIds = ids;
  save(data);
}

function getPinyinCompleted(childId) {
  const targetChildId = childId || getCurrentChildId();
  if (!targetChildId) return load().pinyinDoneIds || [];
  return getChildData(targetChildId).pinyinDoneIds || [];
}

function setPinyinCompleted(ids, childId) {
  const data = load();
  const targetChildId = childId || getCurrentChildId();
  if (!targetChildId) {
    data.pinyinDoneIds = ids;
  } else {
    data.childData = data.childData || {};
    data.childData[targetChildId] = data.childData[targetChildId] || {};
    data.childData[targetChildId].pinyinDoneIds = ids;
  }
  save(data);
}

function getPinyinLastUnit(childId) {
  const targetChildId = childId || getCurrentChildId();
  if (!targetChildId) return load().pinyinLastUnitId || '';
  return getChildData(targetChildId).pinyinLastUnitId || '';
}

function setPinyinLastUnit(id, childId) {
  const data = load();
  const targetChildId = childId || getCurrentChildId();
  if (!targetChildId) {
    data.pinyinLastUnitId = id;
  } else {
    data.childData = data.childData || {};
    data.childData[targetChildId] = data.childData[targetChildId] || {};
    data.childData[targetChildId].pinyinLastUnitId = id;
  }
  save(data);
}

function getPinyinMistakes(childId) {
  const targetChildId = childId || getCurrentChildId();
  if (!targetChildId) return load().pinyinMistakes || {};
  return getChildData(targetChildId).pinyinMistakes || {};
}

function recordPinyinMistake(unitId, childId) {
  const data = load();
  const targetChildId = childId || getCurrentChildId();
  const target = targetChildId
    ? ((data.childData = data.childData || {}), (data.childData[targetChildId] = data.childData[targetChildId] || {}), data.childData[targetChildId])
    : data;
  target.pinyinMistakes = target.pinyinMistakes || {};
  target.pinyinMistakes[unitId] = (target.pinyinMistakes[unitId] || 0) + 1;
  save(data);
  return target.pinyinMistakes[unitId];
}

function appendPinyinPracticeLog(result, childId) {
  const data = load();
  const targetChildId = childId || getCurrentChildId();
  const target = targetChildId
    ? ((data.childData = data.childData || {}), (data.childData[targetChildId] = data.childData[targetChildId] || {}), data.childData[targetChildId])
    : data;
  const log = target.pinyinPracticeLog || [];
  target.pinyinPracticeLog = [Object.assign({ completedAt: Date.now() }, result)].concat(log).slice(0, 100);
  save(data);
}

function getWordStats(childId) {
  const characters = getCharacters(childId);
  const pendingCharacters = characters.filter((character) => character.status !== '已掌握');
  return {
    pendingCount: pendingCharacters.length,
    totalCount: characters.length,
    maxWrongCount: characters.reduce((max, character) => Math.max(max, character.wrongCount || 0), 0),
  };
}

function getWords(childId) {
  const childData = getChildData(childId);
  return childData.words || load().words || [];
}

function getCharacters(childId) {
  const childData = getChildData(childId);
  return childData.characters || load().characters || [];
}

function findWordById(id, childId) {
  return getWords(childId).find((word) => word.id === id) || null;
}

function findWordByText(text, childId, excludeId) {
  const normalized = String(text || '').trim();
  return getWords(childId).find((word) => (
    word.id !== excludeId
    && String(word.text || '').trim() === normalized
  )) || null;
}

function findCharacterById(id, childId) {
  return getCharacters(childId).find((character) => character.id === id) || null;
}

function findCharacterByText(text, childId) {
  const normalized = String(text || '').trim();
  return getCharacters(childId).find((character) => character.text === normalized) || null;
}

function appendRelatedWordToCharacter(character, wordText, sourceLabel, time) {
  if (!wordText || !character || wordText.indexOf(character.text) < 0) return character;
  const texts = (character.relatedWordTexts || []).slice();
  if (texts.indexOf(wordText) < 0) texts.unshift(wordText);
  const meta = Object.assign({}, character.relatedWordMeta || {});
  meta[wordText] = sourceLabel || '听写';
  return Object.assign({}, character, {
    relatedWordTexts: texts.slice(0, 30),
    relatedWordMeta: meta,
    updatedAt: time,
  });
}

function linkWordToWrongChars(wordText, charTexts, childId, sourceLabel, time) {
  const normalizedText = String(wordText || '').trim();
  if (!normalizedText || !charTexts.length) return;
  const characters = getCharacters(childId).slice();
  charTexts.forEach((charText) => {
    if (normalizedText.indexOf(charText) < 0) return;
    const index = characters.findIndex((item) => item.text === charText);
    if (index < 0) return;
    characters[index] = appendRelatedWordToCharacter(
      characters[index],
      normalizedText,
      sourceLabel,
      time,
    );
  });
  writeCharacters(characters, childId);
}

function writeWords(words, childId) {
  const data = load();
  const targetChildId = childId || getCurrentChildId();
  if (!targetChildId) {
    data.words = words;
  } else {
    data.childData = data.childData || {};
    data.childData[targetChildId] = data.childData[targetChildId] || {};
    data.childData[targetChildId].words = words;
  }
  save(data);
}

function writeCharacters(characters, childId) {
  const data = load();
  const targetChildId = childId || getCurrentChildId();
  if (!targetChildId) {
    data.characters = characters;
  } else {
    data.childData = data.childData || {};
    data.childData[targetChildId] = data.childData[targetChildId] || {};
    data.childData[targetChildId].characters = characters;
  }
  save(data);
}

function updateUnknownCharacters(text, unknownCharacters, childId, time, increaseWrongCount) {
  const characters = getCharacters(childId).slice();
  const refs = [];
  Array.from(new Set(unknownCharacters || [])).forEach((character) => {
    if (!character || text.indexOf(character) < 0) return;
    const index = characters.findIndex((item) => item.text === character);
    let record;
    if (index >= 0) {
      record = Object.assign({}, characters[index], {
        wrongCount: (characters[index].wrongCount || 0) + (increaseWrongCount ? 1 : 0),
        status: '待复习',
        lastWrongAt: time,
        updatedAt: time,
      });
      characters[index] = record;
    } else {
      record = {
        id: nowId('character'),
        text: character,
        wrongCount: 1,
        status: '待复习',
        lastWrongAt: time,
        createdAt: time,
        updatedAt: time,
      };
      characters.unshift(record);
    }
    refs.push({ characterId: record.id, text: character });
  });
  writeCharacters(characters, childId);
  return refs;
}

function addWord(input, childId) {
  const time = Date.now();
  const dictationOnly = !!input.dictationOnly;
  const unknownCharacters = input.unknownCharacters || [];
  let unknownCharacterRefs = input.unknownCharacterRefs;
  if (!unknownCharacterRefs && !dictationOnly && unknownCharacters.length) {
    unknownCharacterRefs = updateUnknownCharacters(
      input.text || '',
      unknownCharacters,
      childId,
      time,
      true,
    );
  }
  unknownCharacterRefs = unknownCharacterRefs || [];
  const word = Object.assign(
    {
      id: nowId('word'),
      text: '',
      pinyin: '',
      tone: 3,
      wrongCount: dictationOnly ? 0 : (unknownCharacters.length ? 1 : 0),
      status: dictationOnly ? '听写准备' : (unknownCharacters.length ? '待复习' : '听写准备'),
      sourceType: 'daily',
      sourceLabel: '日常',
      sourceId: 'daily',
      needsDictation: true,
      dictationOnly: dictationOnly,
      unknownCharacterRefs,
      createdAt: time,
      updatedAt: time,
    },
    input,
    {
      unknownCharacterRefs,
      updatedAt: time,
    },
  );

  writeWords([word].concat(getWords(childId)), childId);
  return word;
}

function updateWord(id, patch, childId) {
  let updated = null;
  const time = Date.now();
  const relationPatch = Array.isArray(patch.unknownCharacters)
    ? {
      unknownCharacterRefs: updateUnknownCharacters(
        patch.text || '',
        patch.unknownCharacters,
        childId,
        time,
        false,
      ),
    }
    : {};
  const words = getWords(childId).map((word) => {
    if (word.id !== id) return word;
    updated = Object.assign({}, word, patch, relationPatch, {
      id: word.id,
      createdAt: word.createdAt,
      updatedAt: time,
    });
    return updated;
  });
  if (updated) writeWords(words, childId);
  return updated;
}

function markWordWrong(id, childId) {
  const word = findWordById(id, childId);
  if (!word) return null;
  const refIds = {};
  (word.unknownCharacterRefs || []).forEach((ref) => { refIds[ref.characterId] = true; });
  if (!Object.keys(refIds).length) return word;

  const time = Date.now();
  const characters = getCharacters(childId).map((character) => {
    if (!refIds[character.id]) return character;
    return Object.assign({}, character, {
      wrongCount: (character.wrongCount || 0) + 1,
      status: '待复习',
      lastWrongAt: time,
      updatedAt: time,
    });
  });
  writeCharacters(characters, childId);
  return updateWord(id, { lastWrongAt: time, status: '待复习' }, childId);
}

function markWordCorrect(id, childId) {
  const word = findWordById(id, childId);
  if (!word) return null;
  const refIds = {};
  (word.unknownCharacterRefs || []).forEach((ref) => { refIds[ref.characterId] = true; });
  const time = Date.now();
  if (Object.keys(refIds).length) {
    const characters = getCharacters(childId).map((character) => {
      if (!refIds[character.id]) return character;
      const correctCount = (character.correctCount || 0) + 1;
      const newStatus = correctCount >= 3 ? '已掌握' : character.status;
      return Object.assign({}, character, {
        correctCount: correctCount,
        status: newStatus,
        lastCorrectAt: time,
        updatedAt: time,
      });
    });
    writeCharacters(characters, childId);
  }
  return updateWord(id, { lastCorrectAt: time }, childId);
}

function markWordWrongWithChars(id, wrongChars, childId) {
  const word = findWordById(id, childId);
  if (!word) return null;
  const time = Date.now();
  const wrongCharTexts = Array.from(new Set((wrongChars || []).map((c) => c.char).filter(Boolean)));
  if (!wrongCharTexts.length) return word;
  const newRefs = updateUnknownCharacters(word.text, wrongCharTexts, childId, time, true);
  const existingRefs = word.unknownCharacterRefs || [];
  const refMap = {};
  existingRefs.forEach((ref) => { refMap[ref.text] = ref; });
  newRefs.forEach((ref) => { refMap[ref.text] = ref; });
  const mergedRefs = Object.keys(refMap).map((key) => refMap[key]);
  return updateWord(id, {
    lastWrongAt: time,
    status: word.dictationOnly ? '听写准备' : '待复习',
    unknownCharacterRefs: mergedRefs,
  }, childId);
}

function deleteWord(id, childId) {
  const targetChildId = childId || getCurrentChildId();
  const word = findWordById(id, targetChildId);
  if (!word) return false;

  const words = getWords(targetChildId).filter((item) => item.id !== id);
  writeWords(words, targetChildId);

  const referencedIds = {};
  words.forEach((item) => {
    (item.unknownCharacterRefs || []).forEach((ref) => {
      if (ref.characterId) referencedIds[ref.characterId] = true;
    });
  });
  const characters = getCharacters(targetChildId).filter((character) => referencedIds[character.id]);
  if (characters.length !== getCharacters(targetChildId).length) {
    writeCharacters(characters, targetChildId);
  }
  return true;
}

function deleteCharacter(id, childId) {
  const targetChildId = childId || getCurrentChildId();
  if (!findCharacterById(id, targetChildId)) return false;

  writeCharacters(getCharacters(targetChildId).filter((character) => character.id !== id), targetChildId);

  const words = getWords(targetChildId).map((word) => {
    const refs = (word.unknownCharacterRefs || []).filter((ref) => ref.characterId !== id);
    if (refs.length === (word.unknownCharacterRefs || []).length) return word;
    return Object.assign({}, word, {
      unknownCharacterRefs: refs,
      updatedAt: Date.now(),
    });
  });
  writeWords(words, targetChildId);
  return true;
}

function recordWrongCharsFromDictation(wordText, wrongChars, childId, meta) {
  const normalizedText = String(wordText || '').trim();
  const wrongCharTexts = Array.from(new Set((wrongChars || []).map((item) => item.char).filter(Boolean)));
  if (!normalizedText || !wrongCharTexts.length) return [];

  const time = Date.now();
  const sourceLabel = (meta && meta.sourceLabel) || '听写';
  updateUnknownCharacters(normalizedText, wrongCharTexts, childId, time, true);
  linkWordToWrongChars(normalizedText, wrongCharTexts, childId, sourceLabel, time);
  return wrongCharTexts;
}

function recordManualWrongChars(wordText, unknownChars, childId, meta) {
  const normalizedText = String(wordText || '').trim();
  const texts = Array.from(new Set((unknownChars || []).map((item) => item.char).filter(Boolean)));
  if (!normalizedText) return null;

  const time = Date.now();
  const sourceLabel = (meta && meta.sourceLabel) || '手动录入';
  const targetChildId = childId || getCurrentChildId();
  const existing = getCharacters(targetChildId);
  const prevLinked = {};
  existing.forEach((character) => {
    if ((character.relatedWordTexts || []).indexOf(normalizedText) >= 0) {
      prevLinked[character.text] = true;
    }
  });

  if (!texts.length) return [];

  const characters = existing.slice();
  texts.forEach((charText) => {
    if (normalizedText.indexOf(charText) < 0) return;
    const index = characters.findIndex((item) => item.text === charText);
    let record;
    if (index >= 0) {
      record = Object.assign({}, characters[index], {
        status: '待复习',
        updatedAt: time,
      });
      if (!prevLinked[charText]) record.lastWrongAt = time;
      characters[index] = appendRelatedWordToCharacter(record, normalizedText, sourceLabel, time);
    } else {
      record = appendRelatedWordToCharacter({
        id: nowId('character'),
        text: charText,
        wrongCount: 1,
        status: '待复习',
        lastWrongAt: time,
        createdAt: time,
        updatedAt: time,
      }, normalizedText, sourceLabel, time);
      characters.unshift(record);
    }
  });
  writeCharacters(characters, targetChildId);
  return texts;
}

function syncWordUnknownChars(id, unknownChars, childId) {
  const word = findWordById(id, childId);
  if (!word) return null;
  return recordManualWrongChars(word.text, unknownChars, childId, {
    sourceLabel: word.sourceLabel || '手动录入',
  });
}

function markCharacterWrong(id, childId) {
  const targetChildId = childId || getCurrentChildId();
  const time = Date.now();
  let updated = null;
  const characters = getCharacters(targetChildId).map((character) => {
    if (character.id !== id) return character;
    updated = Object.assign({}, character, {
      wrongCount: (character.wrongCount || 0) + 1,
      status: '待复习',
      lastWrongAt: time,
      updatedAt: time,
    });
    return updated;
  });
  if (!updated) return null;
  writeCharacters(characters, targetChildId);
  return updated;
}

function recordWrongCharsOnly(text, wrongChars, childId, meta) {
  return recordWrongCharsFromDictation(text, wrongChars, childId, meta);
}

module.exports = {
  getCompleted,
  setCompleted,
  getPinyinCompleted,
  setPinyinCompleted,
  getPinyinLastUnit,
  setPinyinLastUnit,
  getPinyinMistakes,
  recordPinyinMistake,
  appendPinyinPracticeLog,
  getThemeKey,
  setThemeKey,
  getLanguage,
  setLanguage,
  getChildren,
  getCurrentChild,
  getCurrentChildId,
  createChild,
  switchChild,
  updateChild,
  deleteChild,
  getWordStats,
  getWords,
  getCharacters,
  findWordById,
  findWordByText,
  findCharacterById,
  findCharacterByText,
  addWord,
  updateWord,
  deleteWord,
  deleteCharacter,
  markCharacterWrong,
  syncWordUnknownChars,
  recordWrongCharsFromDictation,
  recordManualWrongChars,
  markWordWrong,
  markWordCorrect,
  markWordWrongWithChars,
  recordWrongCharsOnly,
};
