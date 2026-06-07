const nav = require('../../utils/nav');
const storage = require('../../utils/storage');
const dataBackup = require('../../utils/data-backup');
const { getTheme } = require('../../basic-controls/theme/theme');

Page({
  data: {
    theme: {},
    importText: '',
    summary: { childCount: 0, characterCount: 0, wordCount: 0 },
  },

  onShow() {
    const backup = dataBackup.buildBackup();
    this.setData({
      theme: getApp().globalData.theme,
      summary: dataBackup.summarizeBackup(backup),
    });
  },

  onBack() {
    nav.navigateBack();
  },

  onImportInput(e) {
    this.setData({ importText: e.detail.value });
  },

  onExport() {
    dataBackup.copyBackupToClipboard()
      .then((result) => {
        const summary = result.summary;
        wx.showModal({
          title: '已复制到剪贴板',
          content: `孩子 ${summary.childCount} 个，错字 ${summary.characterCount} 个。请粘贴到备忘录或聊天工具保存。`,
          showCancel: false,
        });
      })
      .catch(() => {
        wx.showToast({ title: '导出失败', icon: 'none' });
      });
  },

  onImport() {
    const parsed = dataBackup.parseBackupText(this.data.importText);
    if (!parsed.ok) {
      wx.showToast({ title: parsed.message, icon: 'none' });
      return;
    }
    const summary = dataBackup.summarizeBackup(parsed.backup);
    wx.showModal({
      title: '确认导入',
      content: `将覆盖本地数据：孩子 ${summary.childCount} 个，错字 ${summary.characterCount} 个。导入后当前页面数据会被替换。`,
      confirmColor: '#A92F3A',
      success: (res) => {
        if (!res.confirm) return;
        const result = dataBackup.importBackup(parsed.backup);
        if (!result.ok) {
          wx.showToast({ title: result.message, icon: 'none' });
          return;
        }
        this.setData({
          importText: '',
          summary: result.summary,
        });
        const app = getApp();
        const themeKey = storage.getThemeKey();
        app.globalData.themeKey = themeKey;
        app.globalData.theme = getTheme(themeKey);
        app.globalData.language = storage.getLanguage();
        app.globalData.completed = storage.getCompleted();
        wx.showToast({ title: '导入成功', icon: 'success' });
      },
    });
  },
});
