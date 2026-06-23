Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: false },
    actionText: { type: String, value: '' },
    bgColor: { type: String, value: '#DDF4FF' },
    theme: { type: Object, value: {} },
  },
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    capsulePaddingRight: 0,
  },
  lifetimes: {
    attached() {
      const info = wx.getSystemInfoSync();
      const windowWidth = info.windowWidth || 375;
      let navBarHeight = 44;
      let capsulePaddingRight = 0;
      if (wx.getMenuButtonBoundingClientRect) {
        const rect = wx.getMenuButtonBoundingClientRect();
        if (rect && rect.height && rect.top) {
          navBarHeight = rect.height + Math.max(0, rect.top - (info.statusBarHeight || 0)) * 2;
        }
        if (rect && rect.left > 0) {
          capsulePaddingRight = Math.max(0, windowWidth - rect.left + 8);
        }
      }
      if (capsulePaddingRight <= 0) {
        capsulePaddingRight = 100;
      }
      this.setData({
        statusBarHeight: info.statusBarHeight || 20,
        navBarHeight,
        capsulePaddingRight,
      });
    },
  },
  methods: {
    onBack() {
      this.triggerEvent('back');
    },
    onAction() {
      if (this.data.actionText) this.triggerEvent('action');
    },
  },
});
