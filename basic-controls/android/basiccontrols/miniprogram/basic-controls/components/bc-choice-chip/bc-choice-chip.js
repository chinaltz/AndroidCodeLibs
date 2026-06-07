Component({
  properties: {
    text: { type: String, value: '' },
    count: { type: null, value: '' },
    optionKey: { type: String, value: '' },
    selected: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
    danger: { type: Boolean, value: false },
    large: { type: Boolean, value: false },
    theme: { type: Object, value: {} },
  },
  methods: {
    onTap() {
      if (!this.data.disabled) {
        this.triggerEvent('tap', { key: this.data.optionKey });
      }
    },
  },
});
