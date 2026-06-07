const storage = require('../../utils/storage');
const nav = require('../../utils/nav');
const correction = require('../../utils/dictation-correction');

Page({
  data: {
    theme: {},
    scenarios: correction.SCENARIOS.map((item) => ({ id: item.id, title: item.title })),
    scenarioId: correction.SCENARIOS[0].id,
    scenarioTitle: correction.SCENARIOS[0].title,
    scenarioDesc: correction.SCENARIOS[0].desc,
    expectedLabel: (correction.SCENARIOS[0].expectedChars || []).join('、') || '按你点选的字',
    items: [],
    stats: { total: 0, correct: 0, wrong: 0, pending: 0 },
    allGraded: false,
    report: null,
  },

  _scenario: correction.SCENARIOS[0],
  _expectedChars: correction.SCENARIOS[0].expectedChars,

  onLoad(options) {
    const scenarioId = options && options.scenario ? options.scenario : correction.SCENARIOS[0].id;
    this.loadScenario(scenarioId);
  },

  onShow() {
    this.setData({ theme: getApp().globalData.theme });
  },

  onBack() {
    nav.navigateBack({ fallbackUrl: '/pages/basic-samples/index' });
  },

  loadScenario(scenarioId) {
    const scenario = correction.SCENARIOS.find((item) => item.id === scenarioId) || correction.SCENARIOS[0];
    const queue = correction.ensureSimWords(scenario.queue);
    let items = queue.map(correction.buildGradeItem);
    if (scenario.autoGrade) {
      items = correction.applyAutoGrade(items, scenario.autoGrade);
    }
    this._scenario = scenario;
    this._expectedChars = scenario.expectedChars || [];
    this.setData({
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      scenarioDesc: scenario.desc,
      expectedLabel: (scenario.expectedChars || []).join('、') || '按你点选的字',
      items: items,
      stats: correction.buildStats(items),
      allGraded: items.length > 0 && items.every((item) => item.result !== 'pending'),
      report: null,
    });
  },

  onScenarioTap(e) {
    this.loadScenario(e.currentTarget.dataset.id);
  },

  onGrade(e) {
    const { id, result } = e.currentTarget.dataset;
    const items = this.data.items.map((item) => {
      if (item.id !== id) return item;
      return Object.assign({}, item, {
        result: result,
        showWrongDetail: result === 'wrong',
        chars: item.chars.map((c) => Object.assign({}, c, { active: false })),
      });
    });
    this.setData({
      items: items,
      stats: correction.buildStats(items),
      allGraded: items.every((item) => item.result !== 'pending'),
      report: null,
    });
  },

  onWrongCharTap(e) {
    const { itemId, charId } = e.currentTarget.dataset;
    const items = this.data.items.map((item) => {
      if (item.id !== itemId) return item;
      return Object.assign({}, item, {
        chars: item.chars.map((c) => (
          c.id === charId ? Object.assign({}, c, { active: !c.active }) : c
        )),
      });
    });
    this.setData({ items: items, report: null });
  },

  onAutoFill() {
    if (!this._scenario.autoGrade) {
      wx.showToast({ title: '当前场景请手动批改', icon: 'none' });
      return;
    }
    const items = correction.applyAutoGrade(this.data.items, this._scenario.autoGrade);
    this.setData({
      items: items,
      stats: correction.buildStats(items),
      allGraded: true,
      report: null,
    });
  },

  onReset() {
    this.loadScenario(this.data.scenarioId);
  },

  onSaveAndVerify() {
    const validation = correction.validateGradedItems(this.data.items);
    if (!validation.ok) {
      wx.showToast({ title: validation.message, icon: 'none' });
      return;
    }

    const childId = storage.getCurrentChildId();
    const beforeSnapshot = correction.snapshotCharacters(childId);
    const sessionResults = correction.buildSessionResults(this.data.items);
    correction.saveSessionResults(sessionResults, childId);
    const afterSnapshot = correction.snapshotCharacters(childId);
    const report = correction.verifyCorrection({
      beforeSnapshot: beforeSnapshot,
      afterSnapshot: afterSnapshot,
      sessionResults: sessionResults,
      expectedChars: this._expectedChars,
    });

    this.setData({
      report: Object.assign({}, report, {
        title: report.pass ? '验证通过' : '验证失败',
        statusClass: report.pass ? 'is-pass' : 'is-fail',
        selectedCount: report.selected.length,
        selectedLabel: report.selected.length ? report.selected.join('、') : '无',
      }),
    });

    wx.showToast({
      title: report.pass ? '错字记录正确' : '错字记录异常',
      icon: report.pass ? 'success' : 'none',
    });
  },
});
