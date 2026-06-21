const nav = require('../../utils/nav');
const dailyTodo = require('../../utils/daily-todo-service');

const PRESET_MINUTES = [5, 10, 15, 20, 25, 30, 45, 59, 60, 90];

function measureHeader() {
  const info = wx.getSystemInfoSync();
  const statusBarHeight = info.statusBarHeight || 20;
  const windowWidth = info.windowWidth || 375;
  let navBarHeight = 44;
  let capsulePaddingRight = 0;

  try {
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect();
      if (rect && rect.height && rect.top) {
        navBarHeight = rect.height + Math.max(0, rect.top - statusBarHeight) * 2;
      }
      if (rect && rect.left > 0) {
        capsulePaddingRight = Math.max(0, windowWidth - rect.left + 8);
      }
    }
  } catch (err) {
    // DevTools and iPad can return incomplete capsule metrics.
  }

  return { statusBarHeight, navBarHeight, capsulePaddingRight };
}

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
    editMode: false,
    statusBarHeight: 20,
    navBarHeight: 44,
    capsulePaddingRight: 0,
  },

  onLoad() {
    this.setData(measureHeader());
  },

  onShow() {
    const app = getApp();
    this.setData(Object.assign({ theme: app.globalData.theme }, measureHeader()));
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
    const snapshot = dailyTodo.toggleItem(id);
    this.refreshFrom(snapshot);
    if (snapshot.checkinResult && snapshot.checkinResult.recorded) {
      wx.showToast({ title: '今日打卡成功，宠物获得奖励', icon: 'success' });
    }
  },

  onResetTasks() {
    wx.showModal({
      title: '全部重置？',
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

  toggleEditMode() {
    const next = !this.data.editMode;
    this.setData({
      editMode: next,
      editingId: '',
      showAddSheet: false,
    });
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
    if (!this.data.editMode) return;
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

  onMoveItem(e) {
    const index = Number(e.currentTarget.dataset.index);
    const dir = Number(e.currentTarget.dataset.dir);
    const toIndex = index + dir;
    if (toIndex < 0 || toIndex >= this.data.items.length) return;
    this.refreshFrom(dailyTodo.reorderItems(index, toIndex));
  },
});
