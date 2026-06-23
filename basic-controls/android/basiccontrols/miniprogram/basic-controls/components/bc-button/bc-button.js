Component({
  properties: {
    text: { type: String, value: '' },
    variant: { type: String, value: 'default' },
    size: { type: String, value: 'default' },
    disabled: { type: Boolean, value: false },
    theme: { type: Object, value: {} },
  },
  data: { pressed: false },
  methods: {
    onTouchStart() {
      if (!this.data.disabled) this.setData({ pressed: true });
    },
    onTouchEnd() {
      this.setData({ pressed: false });
    },
    onTap() {
      if (this.data.disabled) return;
      const now = Date.now();
      if (this._lastTap && now - this._lastTap < 300) return;
      this._lastTap = now;
      this.triggerEvent('tap');
    },
  },
});
