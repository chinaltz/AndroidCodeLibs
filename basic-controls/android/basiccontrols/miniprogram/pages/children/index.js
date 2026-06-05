const storage = require('../../utils/storage');

Page({
  data: {
    theme: {},
    children: [],
    currentChildId: '',
    selectedAvatar: 'boy',
    nickname: '',
  },

  onShow() {
    const app = getApp();
    const currentChildId = storage.getCurrentChildId();
    this.setData({
      theme: app.globalData.theme,
      children: buildChildren(storage.getChildren(), currentChildId),
      currentChildId,
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onPickAvatar(e) {
    this.setData({ selectedAvatar: e.currentTarget.dataset.avatar });
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  onCreateChild() {
    const nickname = (this.data.nickname || '').trim();
    if (!nickname) {
      wx.showToast({ title: '请输入孩子昵称', icon: 'none' });
      return;
    }
    storage.createChild({
      nickname,
      avatar: this.data.selectedAvatar,
    });
    this.setData({
      nickname: '',
      children: buildChildren(storage.getChildren(), storage.getCurrentChildId()),
      currentChildId: storage.getCurrentChildId(),
    });
    getApp().globalData.completed = storage.getCompleted();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  onSwitchChild(e) {
    const id = e.currentTarget.dataset.id;
    storage.switchChild(id);
    this.setData({
      currentChildId: storage.getCurrentChildId(),
      children: buildChildren(storage.getChildren(), storage.getCurrentChildId()),
    });
    getApp().globalData.completed = storage.getCompleted();
    wx.showToast({ title: '已切换', icon: 'success' });
  },
});

function buildChildren(children, currentChildId) {
  return children.map((child) => Object.assign({}, child, {
    isCurrent: child.id === currentChildId,
    switchLabel: child.id === currentChildId ? '当前' : '切换',
    avatarPath: child.avatar === 'girl' ? '/assets/images/planets/kid-girl.png' : '/assets/images/planets/kid-boy.png',
  }));
}
