const { INITIALS, FINALS } = require('../../../../data/pinyin-units');
const nav = require('../../../../utils/nav');
const { availableBundledFinals, displaySpelling, audioIdFor } = require('../../../../data/pinyin-combinations');
const audio = require('../../../../utils/audio');

function buildFinalOptions(initial, selectedFinal) {
  const available = availableBundledFinals(initial);
  return FINALS
    .filter((item) => available.indexOf(item.symbol) >= 0)
    .map((item) => Object.assign({}, item, { active: item.symbol === selectedFinal }));
}

function toneOptions(initial, final, selectedTone) {
  return [1, 2, 3, 4].map((tone) => ({
    tone,
    label: displaySpelling(initial, final, tone),
    active: tone === selectedTone,
  }));
}

Page({
  data: {
    theme: {},
    initials: INITIALS.map((item) => ({ symbol: item.symbol, active: item.symbol === 'm' })),
    finals: [],
    selectedInitial: 'm',
    selectedFinal: 'a',
    selectedTone: 1,
    result: 'mā',
    tones: [],
    ruleNote: '拼读时，声母读得轻短，韵母读得响亮。',
  },

  onLoad(query) {
    const selectedInitial = query.initial && availableBundledFinals(query.initial).length ? query.initial : 'm';
    const available = availableBundledFinals(selectedInitial);
    const selectedFinal = query.final && available.indexOf(query.final) >= 0 ? query.final : available[0];
    this.setData({
      theme: getApp().globalData.theme,
      selectedInitial,
      selectedFinal,
      initials: INITIALS.map((item) => ({ symbol: item.symbol, active: item.symbol === selectedInitial })),
      finals: buildFinalOptions(selectedInitial, selectedFinal),
    });
    this.refreshResult(1);
  },

  onBack() {
    nav.navigateBack();
  },

  selectInitial(e) {
    const selectedInitial = e.currentTarget.dataset.symbol;
    const available = availableBundledFinals(selectedInitial);
    const selectedFinal = available.indexOf(this.data.selectedFinal) >= 0 ? this.data.selectedFinal : available[0];
    this.setData({
      selectedInitial,
      selectedFinal,
      initials: INITIALS.map((item) => ({ symbol: item.symbol, active: item.symbol === selectedInitial })),
      finals: buildFinalOptions(selectedInitial, selectedFinal),
    });
    this.refreshResult(this.data.selectedTone);
  },

  selectFinal(e) {
    const selectedFinal = e.currentTarget.dataset.symbol;
    this.setData({
      selectedFinal,
      finals: buildFinalOptions(this.data.selectedInitial, selectedFinal),
    });
    this.refreshResult(this.data.selectedTone);
  },

  selectTone(e) {
    this.refreshResult(Number(e.currentTarget.dataset.tone));
  },

  refreshResult(selectedTone) {
    const initial = this.data.selectedInitial;
    const final = this.data.selectedFinal;
    const special = ['j', 'q', 'x'].indexOf(initial) >= 0 && final.indexOf('ü') === 0;
    this.setData({
      selectedTone,
      result: displaySpelling(initial, final, selectedTone),
      tones: toneOptions(initial, final, selectedTone),
      ruleNote: special
        ? '见到 j、q、x，ü 去掉两点，但仍然读 ü。'
        : '拼读时，声母读得轻短，韵母读得响亮。',
    });
  },

  playBlend() {
    const audioId = audioIdFor(this.data.selectedInitial, this.data.selectedFinal, this.data.selectedTone);
    audio.play(audio.pinyinSyllablePath(audioId), this.data.result).catch(() => {
      wx.showToast({ title: `${this.data.result} 音频待补充`, icon: 'none' });
    });
  },
});
