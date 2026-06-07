const textbookLessons = require('../../data/textbook-lessons');
const pinyin = require('../../utils/pinyin');
const nav = require('../../utils/nav');
const dictationQueue = require('../../utils/dictation-queue');

const GRADES = [1, 2, 3, 4, 5, 6];
const VOLUMES = ['上', '下'];
const ALL_OPTION = '__all__';

const GRADE_LABELS = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };

function gradeLabel(grade) {
  return (GRADE_LABELS[grade] || grade) + '年级';
}

function buildUnits(grade, volume) {
  return [{ unitNo: null, optionKey: ALL_OPTION, title: '全部单元' }].concat(
    textbookLessons.getUnits(grade, volume).map(function(unit) {
      return Object.assign({}, unit, { optionKey: String(unit.unitNo) });
    })
  );
}

function buildLessons(grade, volume, unitNo) {
  return [{ lessonNo: null, optionKey: ALL_OPTION, title: '全部课文' }].concat(
    textbookLessons.getLessons(grade, volume, unitNo).map(function(lesson) {
      return Object.assign({}, lesson, { optionKey: String(lesson.lessonNo) });
    })
  );
}

function resolveChars(grade, volume, unitNo, lessonNo) {
  return textbookLessons.getCharacters(
    grade, volume, unitNo, lessonNo == null ? null : [lessonNo]
  );
}

function resolveWords(grade, volume, unitNo, lessonNo, selectedChars) {
  return textbookLessons.getWordsByChars(
    grade, volume, unitNo, lessonNo == null ? null : [lessonNo], selectedChars
  );
}

function buildSourceLabel(grade, volume, unitNo, lessonNo, unitTitle, lessonTitle) {
  const book = gradeLabel(grade) + volume + '册';
  if (unitNo == null) return book + ' · 全部单元';
  if (lessonNo == null) return book + ' · ' + unitTitle + ' · 全部课文';
  return book + ' · ' + unitTitle + ' · ' + lessonTitle;
}

function charViews(chars, selectedSet) {
  return chars.map(function(c) { return { text: c, selected: !!selectedSet[c] }; });
}

Page({
  data: {
    theme: {},
    grades: GRADES,
    volumes: VOLUMES,
    grade: 1,
    volume: '上',
    units: [],
    lessons: [],
    selectedUnitNo: null,
    selectedLessonNo: null,
    selectedUnitLabel: '全部单元',
    selectedLessonLabel: '全部课文',
    showPicker: false,
    pickerType: '',
    pickerTitle: '',
    pickerOptions: [],
    sourceLabel: '',
    characters: [],
    selectedCharacters: [],
    selectedCount: 0,
    wordQueue: [],
    wordCount: 0,
  },

  onLoad() {
    this._loadBook(1, '上');
  },

  onShow() {
    this.setData({ theme: getApp().globalData.theme });
  },

  onBack() {
    nav.navigateBack();
  },

  selectGrade(e) {
    const raw = e.detail && Object.prototype.hasOwnProperty.call(e.detail, 'key')
      ? e.detail.key
      : e.currentTarget.dataset.grade;
    if (raw === undefined || raw === null || raw === '') return;
    this._loadBook(Number(raw), this.data.volume);
  },

  selectVolume(e) {
    const volume = e.detail && Object.prototype.hasOwnProperty.call(e.detail, 'key')
      ? e.detail.key
      : e.currentTarget.dataset.volume;
    if (!volume) return;
    this._loadBook(this.data.grade, volume);
  },

  selectUnit(e) {
    const raw = e.detail && Object.prototype.hasOwnProperty.call(e.detail, 'key')
      ? e.detail.key
      : e.currentTarget.dataset.unitno;
    if (raw === undefined || raw === null) return;
    const unitNo = raw === ALL_OPTION || raw === '' ? null : Number(raw);
    if (unitNo !== null && !Number.isFinite(unitNo)) return;
    const { grade, volume } = this.data;
    const unitEntry = buildUnits(grade, volume).find(function(u) { return u.unitNo === unitNo; }) || { unitNo: null, title: '全部单元' };
    const lessons = buildLessons(grade, volume, unitNo);
    const chars = resolveChars(grade, volume, unitNo, null);
    this.setData({
      selectedUnitNo: unitNo,
      selectedLessonNo: null,
      selectedUnitLabel: unitEntry.title,
      selectedLessonLabel: '全部课文',
      lessons: lessons,
      showPicker: false,
      sourceLabel: buildSourceLabel(grade, volume, unitNo, null, unitEntry.title, ''),
      characters: charViews(chars, {}),
      selectedCharacters: [],
      selectedCount: 0,
      wordQueue: [],
      wordCount: 0,
    });
  },

  selectLesson(e) {
    const raw = e.detail && Object.prototype.hasOwnProperty.call(e.detail, 'key')
      ? e.detail.key
      : e.currentTarget.dataset.lessonno;
    if (raw === undefined || raw === null) return;
    const lessonNo = raw === ALL_OPTION || raw === '' ? null : Number(raw);
    if (lessonNo !== null && !Number.isFinite(lessonNo)) return;
    const { grade, volume, selectedUnitNo } = this.data;
    const unitEntry = buildUnits(grade, volume).find(function(u) { return u.unitNo === selectedUnitNo; }) || { unitNo: null, title: '全部单元' };
    const lessonEntry = buildLessons(grade, volume, selectedUnitNo).find(function(l) { return l.lessonNo === lessonNo; }) || { lessonNo: null, title: '全部课文' };
    const chars = resolveChars(grade, volume, selectedUnitNo, lessonNo);
    this.setData({
      selectedLessonNo: lessonNo,
      selectedLessonLabel: lessonEntry.title,
      showPicker: false,
      sourceLabel: buildSourceLabel(grade, volume, selectedUnitNo, lessonNo, unitEntry.title, lessonEntry.title),
      characters: charViews(chars, {}),
      selectedCharacters: [],
      selectedCount: 0,
      wordQueue: [],
      wordCount: 0,
    });
  },

  _loadBook(grade, volume) {
    const units = buildUnits(grade, volume);
    const lessons = buildLessons(grade, volume, null);
    const chars = resolveChars(grade, volume, null, null);
    this.setData({
      grade: grade,
      volume: volume,
      units: units,
      lessons: lessons,
      selectedUnitNo: null,
      selectedLessonNo: null,
      selectedUnitLabel: '全部单元',
      selectedLessonLabel: '全部课文',
      sourceLabel: buildSourceLabel(grade, volume, null, null, '', ''),
      characters: charViews(chars, {}),
      selectedCharacters: [],
      selectedCount: 0,
      wordQueue: [],
      wordCount: 0,
    });
  },

  openUnitPicker() {
    this.setData({
      showPicker: true,
      pickerType: 'unit',
      pickerTitle: '选择单元',
      pickerOptions: this.data.units,
    });
  },

  openLessonPicker() {
    this.setData({
      showPicker: true,
      pickerType: 'lesson',
      pickerTitle: '选择课文',
      pickerOptions: this.data.lessons,
    });
  },

  closePicker() {
    this.setData({ showPicker: false });
  },

  stopPickerTap() {},

  _refreshWordQueue(selectedCharacters) {
    const { grade, volume, selectedUnitNo, selectedLessonNo } = this.data;
    const wq = resolveWords(grade, volume, selectedUnitNo, selectedLessonNo, selectedCharacters);
    this.setData({ wordQueue: wq, wordCount: wq.length });
  },

  toggleCharacter(e) {
    const character = e.currentTarget.dataset.character;
    const selectedCharacters = this.data.selectedCharacters.slice();
    const idx = selectedCharacters.indexOf(character);
    if (idx >= 0) selectedCharacters.splice(idx, 1);
    else selectedCharacters.push(character);
    const selectedSet = {};
    selectedCharacters.forEach(function(c) { selectedSet[c] = true; });
    this.setData({
      selectedCharacters: selectedCharacters,
      selectedCount: selectedCharacters.length,
      characters: this.data.characters.map(function(item) {
        return { text: item.text, selected: !!selectedSet[item.text] };
      }),
    });
    this._refreshWordQueue(selectedCharacters);
  },

  selectAll() {
    const selectedCharacters = this.data.characters.map(function(item) { return item.text; });
    this.setData({
      selectedCharacters: selectedCharacters,
      selectedCount: selectedCharacters.length,
      characters: this.data.characters.map(function(item) { return { text: item.text, selected: true }; }),
    });
    this._refreshWordQueue(selectedCharacters);
  },

  clearSelection() {
    this.setData({
      selectedCharacters: [],
      selectedCount: 0,
      wordQueue: [],
      wordCount: 0,
      characters: this.data.characters.map(function(item) { return { text: item.text, selected: false }; }),
    });
  },

  _buildQueueItems() {
    const { sourceLabel, wordQueue } = this.data;
    return wordQueue.map(function(entry) {
      return {
        text: entry.word,
        pinyin: pinyin.toPinyin(entry.word),
        sourceType: 'textbook',
        sourceLabel: sourceLabel,
      };
    });
  },

  startDictation() {
    if (!this.data.wordCount) {
      wx.showToast({ title: '请先选择生字', icon: 'none' });
      return;
    }
    const beforeCount = dictationQueue.getQueue().length;
    dictationQueue.appendQueue(this._buildQueueItems());
    const addedCount = dictationQueue.getQueue().length - beforeCount;
    wx.showToast({
      title: addedCount ? ('已加入 ' + addedCount + ' 个词') : '这些词已在听写列表中',
      icon: addedCount ? 'success' : 'none',
    });
    nav.navigateTo('/pages/dictation-list/index');
  },
});
