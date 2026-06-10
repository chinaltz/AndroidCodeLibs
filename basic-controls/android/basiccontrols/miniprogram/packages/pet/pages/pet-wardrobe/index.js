const nav = require('../../../../utils/nav');
const petRoutes = require('../../../../utils/pet-routes');
const petService = require('../../../../utils/pet-service');
const catalog = require('../../../../config/pet-catalog');

Page({
  data: { theme: {}, petImage: catalog.PET_BLUE, slot: 'head', items: [], equippedImages: [] },
  onShow() { this.refresh(); },
  refresh() {
    const state = petService.state();
    const items = catalog.ACCESSORIES
      .filter((item) => item.slot === this.data.slot)
      .map((item) => Object.assign({}, item, {
        owned: state.inventory.ownedItemIds.indexOf(item.id) >= 0,
        equipped: state.equipped[item.slot] === item.id,
        locked: state.level < item.minLevel,
      }));
    const equippedImages = Object.keys(state.equipped)
      .map((slot) => catalog.findItem(state.equipped[slot]))
      .filter(Boolean)
      .map((item) => ({ id: item.id, image: item.image, slot: item.slot }));
    this.setData({ theme: getApp().globalData.theme, items, equippedImages, level: state.level });
  },
  onBack() { nav.navigateBack({ fallbackUrl: petRoutes.home }); },
  setSlot(e) { this.setData({ slot: e.currentTarget.dataset.slot }, () => this.refresh()); },
  equip(e) {
    const result = petService.equip(e.currentTarget.dataset.id);
    wx.showToast({ title: result.message, icon: 'none' });
    if (result.ok) this.refresh();
  },
  unequip() { petService.unequip(this.data.slot); this.refresh(); },
  goShop() { nav.navigateTo(petRoutes.shop); },
});
