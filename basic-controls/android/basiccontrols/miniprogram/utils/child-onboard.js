const { getTheme, getColorThemeOptions } = require('../basic-controls/theme/theme');

const DEFAULT_NICKNAMES = {
  boy: '小宝',
  girl: '姐姐',
};

const DEFAULT_THEME_BY_AVATAR = {
  boy: 'sky',
  girl: 'rose',
};

const MODULES = [
  { key: 'phonics', label: '音标星球', desc: '48 音标闯关', icon: '/assets/icons/module-phonics.png' },
  { key: 'pinyin', label: '拼音星球', desc: '拼音认读拼读', icon: '/assets/icons/module-pinyin.png' },
  { key: 'words', label: '字词星球', desc: '听写错字管理', icon: '/assets/icons/module-words.png' },
];

function createOnboardState() {
  return {
    selectedAvatar: 'boy',
    selectedThemeKey: 'sky',
    selectedModules: ['phonics', 'pinyin', 'words'],
    nickname: DEFAULT_NICKNAMES.boy,
    colorThemes: buildColorThemes('sky'),
    moduleList: MODULES.map((m) => Object.assign({}, m, { selected: true })),
  };
}

function buildColorThemes(selectedThemeKey) {
  return getColorThemeOptions().map((item) => Object.assign({}, item, {
    selected: item.key === selectedThemeKey,
  }));
}

function getThemeLabel(themeKey) {
  const item = getColorThemeOptions().find((option) => option.key === (themeKey || 'sky'));
  return item ? item.label : '天空蓝';
}

function buildModuleList(selectedModules) {
  return MODULES.map((m) => Object.assign({}, m, {
    selected: (selectedModules || []).indexOf(m.key) >= 0,
  }));
}

module.exports = {
  DEFAULT_NICKNAMES,
  DEFAULT_THEME_BY_AVATAR,
  MODULES,
  createOnboardState,
  buildColorThemes,
  buildModuleList,
  getThemeLabel,
  getTheme,
};
