const nav = require('../../../../utils/nav');
const petRoutes = require('../../../../utils/pet-routes');
const catalog = require('../../../../config/pet-catalog');

const SLOT_LABELS = { head: '头部', back: '背部', hand: '手持' };

function decorate(item, index) {
  return Object.assign({}, item, {
    index,
    slotLabel: SLOT_LABELS[item.slot] || item.slot,
    previewStyle: catalog.accessoryStyle(item, 1),
    miniStyle: catalog.accessoryStyle(item, 180 / 430),
  });
}

Page({
  data: {
    theme: {},
    petImage: catalog.PET_BLUE_IDLE,
    items: [],
    visibleItems: [],
    activeSlot: 'all',
    selectedIndex: 0,
    selectedItem: {},
    previewImages: [],
    comboMode: false,
    combo: {},
    slotTabs: [
      { key: 'all', label: '全部' }, { key: 'head', label: '头部' },
      { key: 'back', label: '背部' }, { key: 'hand', label: '手持' },
    ],
  },
  onLoad() {
    const items = catalog.ACCESSORIES.map(decorate);
    const combo = {};
    items.forEach((item) => { if (!combo[item.slot]) combo[item.slot] = item; });
    this._items = items;
    this._combo = combo;
    this.setData({ theme: getApp().globalData.theme, items, visibleItems: items, combo });
    this.selectByIndex(0);
  },
  onBack() { nav.navigateBack({ fallbackUrl: petRoutes.test }); },
  setSlot(e) {
    const activeSlot = e.currentTarget.dataset.slot;
    const visibleItems = activeSlot === 'all' ? this._items : this._items.filter((item) => item.slot === activeSlot);
    this.setData({ activeSlot, visibleItems });
    if (!this.data.comboMode && visibleItems.length) this.selectItemById(visibleItems[0].id);
  },
  selectItem(e) { this.selectItemById(e.currentTarget.dataset.id); },
  selectItemById(id) {
    const index = this._items.findIndex((item) => item.id === id);
    if (index >= 0) this.selectByIndex(index);
  },
  selectByIndex(index) {
    const total = this._items.length;
    const safeIndex = (index + total) % total;
    const selectedItem = this._items[safeIndex];
    this.setData({ selectedIndex: safeIndex, selectedItem, previewImages: this.data.comboMode ? this.comboImages() : [selectedItem] });
  },
  changeItem(e) { this.selectByIndex(this.data.selectedIndex + Number(e.currentTarget.dataset.delta)); },
  setMode(e) {
    const comboMode = e.currentTarget.dataset.mode === 'combo';
    this.setData({ comboMode }, () => this.setData({ previewImages: comboMode ? this.comboImages() : [this.data.selectedItem] }));
  },
  addToCombo() {
    const item = this.data.selectedItem;
    this._combo[item.slot] = item;
    this.setData({ combo: Object.assign({}, this._combo), comboMode: true, previewImages: this.comboImages() });
  },
  comboImages() { return ['back', 'head', 'hand'].map((slot) => this._combo[slot]).filter(Boolean); },
});
