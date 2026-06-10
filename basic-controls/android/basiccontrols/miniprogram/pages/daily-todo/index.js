const nav = require('../../utils/nav');
const dailyTodo = require('../../utils/daily-todo-service');

const PRESET_MINUTES = [5, 10, 15, 20, 25, 30, 45, 59, 60, 90];

function buildStars(total, done) {
  const count = Math.max(total, 1);
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({ filled: i < done });
  }
  return stars;
}

Page({
  data: {
    theme: {},
    items: [],
    doneCount: 0,
    totalCount: 0,
    today: '',
    stars: [],
    showAddSheet: false,
    newTitle: '',
    newMinutes: 15,
    presetMinutes: PRESET_MINUTES,
    editingId: '',
    editTitle: '',
    editMinutes: 15,
    dragIndex: -1,
    dragOverIndex: -1,
  },

  onShow() {
    const app = getApp();
    this.setData({ theme: app.globalData.theme });
    this.refresh();
    wx.setNavigationBarColor({
      frontColor: app.globalData.theme.dark ? '#ffffff' : '#000000',
      backgroundColor: app.globalData.theme.pageStart,
    });
  },

  refresh() {
    const snapshot = dailyTodo.state();
    this.setData({
      items: snapshot.items.map((item, index) => Object.assign({}, item, {
        indexLabel: index + 1,
      })),
      doneCount: snapshot.doneCount,
      totalCount: snapshot.totalCount,
      today: snapshot.today,
      stars: buildStars(snapshot.totalCount, snapshot.doneCount),
    });
  },

  refreshFrom(snapshot) {
    this.setData({
      items: snapshot.items.map((item, index) => Object.assign({}, item, {
        indexLabel: index + 1,
      })),
      doneCount: snapshot.doneCount,
      totalCount: snapshot.totalCount,
      today: snapshot.today,
      stars: buildStars(snapshot.totalCount, snapshot.doneCount),
    });
  },

  onBack() {
    nav.navigateBack();
  },

  onToggleTask(e) {
    const id = e.currentTarget.dataset.id;
    this.refreshFrom(dailyTodo.toggleItem(id));
  },

  onResetTasks() {
    wx.showModal({
      title: '全部重来？',
      content: '任务还在，只是滑块回到「还没做」哦。',
      confirmText: '好的',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) this.refreshFrom(dailyTodo.resetToday());
      },
    });
  },

  openAddSheet() {
    this.setData({ showAddSheet: true, newTitle: '', newMinutes: 15 });
  },

  closeAddSheet() {
    this.setData({ showAddSheet: false });
  },

  onNewTitleInput(e) {
    this.setData({ newTitle: e.detail.value });
  },

  onNewMinutesChange(e) {
    this.setData({ newMinutes: PRESET_MINUTES[e.detail.value] || 15 });
  },

  confirmAdd() {
    this.refreshFrom(dailyTodo.addItem(this.data.newTitle, this.data.newMinutes));
    this.closeAddSheet();
  },

  openEdit(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.items.find((row) => row.id === id);
    if (!item) return;
    this.setData({
      editingId: id,
      editTitle: item.title,
      editMinutes: item.presetMinutes || 15,
    });
  },

  closeEdit() {
    this.setData({ editingId: '' });
  },

  onEditTitleInput(e) {
    this.setData({ editTitle: e.detail.value });
  },

  onEditMinutesChange(e) {
    this.setData({ editMinutes: PRESET_MINUTES[e.detail.value] || 15 });
  },

  confirmEdit() {
    this.refreshFrom(dailyTodo.updateItem(this.data.editingId, {
      title: this.data.editTitle,
      presetMinutes: this.data.editMinutes,
    }));
    this.closeEdit();
  },

  onDeleteItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '要删掉这个任务吗？',
      content: '删掉后，明天也不会再出现了。',
      confirmText: '删掉',
      confirmColor: '#FF6B7A',
      cancelText: '留着',
      success: (res) => {
        if (res.confirm) this.refreshFrom(dailyTodo.removeItem(id));
      },
    });
  },

  onDragStart(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ dragIndex: index, dragOverIndex: index });
  },

  onDragMove(e) {
    if (this.data.dragIndex < 0) return;
    const now = Date.now();
    if (this._lastDragAt && now - this._lastDragAt < 80) return;
    this._lastDragAt = now;
    const touch = e.touches[0];
    if (!touch) return;
    const query = wx.createSelectorQuery().in(this);
    query.selectAll('.todo-card').boundingClientRect();
    query.exec((res) => {
      const rects = res && res[0];
      if (!rects || !rects.length) return;
      let over = this.data.dragIndex;
      rects.forEach((rect, index) => {
        if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) over = index;
      });
      if (over !== this.data.dragOverIndex) {
        this.setData({ dragOverIndex: over });
      }
    });
  },

  onDragEnd() {
    const { dragIndex, dragOverIndex } = this.data;
    this.setData({ dragIndex: -1, dragOverIndex: -1 });
    if (dragIndex >= 0 && dragOverIndex >= 0 && dragIndex !== dragOverIndex) {
      this.refreshFrom(dailyTodo.reorderItems(dragIndex, dragOverIndex));
    }
  },
});
