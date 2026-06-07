Component({
  properties: {
    value: { type: String, value: '' },
    optionKey: { type: String, value: '' },
    selected: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
    theme: { type: Object, value: {} },
  },
  methods: {
    onTap() {
      if (!this.data.disabled) {
        this.triggerEvent('tap', { key: this.data.optionKey || this.data.value });
      }
    },
  },
});
