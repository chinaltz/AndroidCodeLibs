const nav = require('../../utils/nav');
const storage = require('../../utils/storage');
const onboard = require('../../utils/child-onboard');

Page({
  data: Object.assign({
    theme: onboard.getTheme('sky'),
    pageTitle: '添加孩子',
    saveText: '保存孩子',
    editingId: '',
    isFirstChild: false,
    saving: false,
    nickname: '',
  }, onboard.createOnboardState()),

  onLoad(options) {
    if (options && options.mode === 'first') {
      this.setData({
        isFirstChild: true,
        pageTitle: '添加第一个孩子',
        saveText: '保存并开始',
      });
      return;
    }
    if (options && options.mode === 'add') {
      this.setData({
        editingId: '',
        pageTitle: '添加孩子',
        saveText: '保存孩子',
      });
      return;
    }
    const editingId = options && options.id ? options.id : '';
    if (!editingId) return;
    const child = storage.getChildren().find((item) => item.id === editingId);
    if (!child) return;
    const modules = child.modules && child.modules.length
      ? child.modules
      : ['phonics', 'pinyin', 'words'];
    this.setData({
      editingId,
      pageTitle: '编辑孩子',
      saveText: '保存修改',
      selectedAvatar: child.avatar || 'boy',
      selectedThemeKey: child.themeKey || 'sky',
      selectedModules: modules,
      nickname: child.nickname || '',
      colorThemes: onboard.buildColorThemes(child.themeKey || 'sky'),
      moduleList: onboard.buildModuleList(modules),
    });
  },

  onShow() {
    const selectedThemeKey = this.data.selectedThemeKey || 'sky';
    this.setData({
      theme: onboard.getTheme(selectedThemeKey),
    });
  },

  onBack() {
    nav.navigateBack();
  },

  goChildList() {
    nav.navigateTo('/pages/child-list/index');
  },

  onPickAvatar(e) {
    const avatar = (e.currentTarget.dataset && e.currentTarget.dataset.avatar)
      || (e.detail && e.detail.key);
    if (!avatar || avatar === this.data.selectedAvatar) return;

    this.setData({ selectedAvatar: avatar });
  },

  openNicknameEditor() {
    wx.showModal({
      title: '孩子昵称',
      content: this.data.nickname || '',
      editable: true,
      placeholderText: '输入孩子昵称，例如：小宝',
      confirmText: '确定',
      success: (result) => {
        if (!result.confirm) return;
        const nickname = (result.content || '').trim().slice(0, 12);
        this.setData({ nickname });
      },
    });
  },

  onToggleModule(e) {
    const key = (e.detail && e.detail.key) || e.currentTarget.dataset.key;
    const selectedModules = this.data.selectedModules.slice();
    const idx = selectedModules.indexOf(key);
    if (idx >= 0) {
      if (selectedModules.length === 1) {
        wx.showToast({ title: '至少保留一个学习模块', icon: 'none' });
        return;
      }
      selectedModules.splice(idx, 1);
    } else {
      selectedModules.push(key);
    }
    this.setData({
      selectedModules,
      moduleList: onboard.buildModuleList(selectedModules),
    });
  },

  onPickColor(e) {
    const themeKey = (e.detail && e.detail.key) || e.currentTarget.dataset.key;
    if (!themeKey) return;
    this.setData({
      selectedThemeKey: themeKey,
      colorThemes: onboard.buildColorThemes(themeKey),
      theme: onboard.getTheme(themeKey),
    });
  },

  onSave() {
    if (this._saving || this.data.saving) return;
    const nickname = (this.data.nickname || '').trim();
    if (!nickname) {
      wx.showToast({ title: '请输入孩子昵称', icon: 'none' });
      return;
    }
    if (!this.data.selectedThemeKey) {
      wx.showToast({ title: '请选择主题颜色', icon: 'none' });
      return;
    }
    if (!this.data.selectedModules.length) {
      wx.showToast({ title: '至少选择一个学习模块', icon: 'none' });
      return;
    }
    this._saving = true;
    this.setData({ saving: true });
    const input = {
      nickname,
      avatar: this.data.selectedAvatar,
      themeKey: this.data.selectedThemeKey,
      modules: this.data.selectedModules,
    };
    if (this.data.editingId) storage.updateChild(this.data.editingId, input);
    else storage.createChild(input);
    getApp().syncThemeAfterChildChange();
    getApp().globalData.completed = storage.getCompleted();
    wx.showToast({ title: this.data.editingId ? '已保存' : '已添加', icon: 'success' });
    setTimeout(() => {
      this._saving = false;
      if (this.data.isFirstChild) {
        wx.reLaunch({ url: '/pages/map/index' });
        return;
      }
      nav.navigateBack();
    }, 500);
  },
});
