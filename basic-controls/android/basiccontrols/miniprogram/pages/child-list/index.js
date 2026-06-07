const nav = require('../../utils/nav');
const storage = require('../../utils/storage');
const onboard = require('../../utils/child-onboard');

Page({
  data: {
    theme: {},
    children: [],
  },

  onShow() {
    const currentChildId = storage.getCurrentChildId();
    this.setData({
      theme: getApp().globalData.theme,
      children: storage.getChildren().map((child) => {
        const modules = child.modules && child.modules.length
          ? child.modules
          : ['phonics', 'pinyin', 'words'];
        return Object.assign({}, child, {
        modules,
        moduleLabel: onboard.buildModuleList(modules)
          .filter((item) => item.selected)
          .map((item) => item.label.replace('星球', ''))
          .join('、'),
        isCurrent: child.id === currentChildId,
        avatarPath: child.avatar === 'girl'
          ? '/assets/images/planets/kid-girl.png'
          : '/assets/images/planets/kid-boy.png',
        });
      }),
    });
  },

  onBack() {
    nav.navigateBack();
  },

  addChild() {
    nav.navigateTo('/pages/children/index?mode=add');
  },

  switchChild(e) {
    storage.switchChild(e.currentTarget.dataset.id);
    getApp().syncThemeAfterChildChange();
    getApp().globalData.completed = storage.getCompleted();
    wx.showToast({ title: '已切换', icon: 'success' });
    this.onShow();
  },

  editChild(e) {
    nav.navigateTo(`/pages/children/index?mode=edit&id=${e.currentTarget.dataset.id}`);
  },

  deleteChild(e) {
    const id = e.currentTarget.dataset.id;
    const child = this.data.children.find((item) => item.id === id);
    if (!child) return;
    wx.showModal({
      title: '删除孩子档案',
      content: `将删除“${child.nickname}”及其本地学习数据，且无法恢复。`,
      confirmText: '删除',
      confirmColor: '#E15353',
      success: (result) => {
        if (!result.confirm) return;
        storage.deleteChild(id);
        getApp().syncThemeAfterChildChange();
        getApp().globalData.completed = storage.getCompleted();
        this.onShow();
        wx.showToast({ title: '已删除', icon: 'success' });
      },
    });
  },
});
