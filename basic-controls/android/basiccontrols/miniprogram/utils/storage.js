const KEY = 'phonics_progress';

function load() {
  return wx.getStorageSync(KEY) || {};
}

function save(data) {
  wx.setStorageSync(KEY, data);
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

function nowId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function getChildren() {
  return load().children || [];
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
    createdAt: time,
    updatedAt: time,
  };
  data.children = children.concat(child);
  data.currentChildId = child.id;
  data.childData = data.childData || {};
  data.childData[child.id] = {
    doneIds: [],
    wordStats: {
      pendingCount: 0,
      todayCount: 0,
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
    return Object.assign({}, child, patch, { updatedAt: Date.now() });
  });
  save(data);
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

function getWordStats(childId) {
  const childData = getChildData(childId);
  const words = childData.words || load().words || [];
  const characters = childData.characters || load().characters || [];
  const activeCharacterIds = {};
  words.forEach((word) => {
    (word.unknownCharacterRefs || []).forEach((ref) => {
      activeCharacterIds[ref.characterId] = true;
    });
  });
  const activeCharacters = characters.filter((character) => activeCharacterIds[character.id]);
  return {
    pendingCount: activeCharacters.filter((character) => character.status !== '已掌握').length,
    todayCount: words.filter((word) => word.needsDictation !== false).length,
    maxWrongCount: activeCharacters.reduce((max, character) => Math.max(max, character.wrongCount || 0), 0),
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
  const unknownCharacterRefs = updateUnknownCharacters(
    input.text || '',
    input.unknownCharacters || [],
    childId,
    time,
    true,
  );
  const word = Object.assign(
    {
      id: nowId('word'),
      text: '',
      pinyin: '',
      tone: 3,
      wrongCount: 1,
      status: '待复习',
      sourceType: 'daily',
      sourceLabel: '日常',
      sourceId: 'daily',
      needsDictation: true,
      unknownCharacterRefs,
      createdAt: time,
      updatedAt: time,
    },
    input,
    {
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

module.exports = {
  getCompleted,
  setCompleted,
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
  getWordStats,
  getWords,
  getCharacters,
  findWordById,
  findWordByText,
  addWord,
  updateWord,
  markWordWrong,
};
