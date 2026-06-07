const nav = require('../../utils/nav');
const petService = require('../../utils/pet-service');
const catalog = require('../../config/pet-catalog');

Page({
  data: { theme: {}, points: 0, category: 'all', items: [] },
  onShow() { this.refresh(); },
  refresh() {
    const state = petService.state();
    const items = catalog.ALL_ITEMS
      .filter((item) => this.data.category === 'all' || item.type === this.data.category)
      .map((item) => Object.assign({}, item, {
        owned: item.type !== 'food' && state.inventory.ownedItemIds.indexOf(item.id) >= 0,
        count: state.inventory.consumables[item.id] || 0,
        locked: !!item.minLevel && state.level < item.minLevel,
        actionText: item.type === 'food' ? `购买 ${item.price} ★` : (state.inventory.ownedItemIds.indexOf(item.id) >= 0 ? '已拥有' : (item.minLevel && state.level < item.minLevel ? `${item.minLevel}级解锁` : `购买 ${item.price} ★`)),
      }));
    this.setData({ theme: getApp().globalData.theme, points: state.points, items });
  },
  onBack() { nav.navigateBack({ fallbackUrl: '/pages/pet-home/index' }); },
  setCategory(e) { this.setData({ category: e.currentTarget.dataset.category }, () => this.refresh()); },
  buy(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.items.find((entry) => entry.id === id);
    if (!item || item.owned || item.locked) return;
    const result = petService.purchase(id);
    wx.showToast({ title: result.message, icon: 'none' });
    if (result.ok) this.refresh();
  },
});
