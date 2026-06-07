Component({
  properties: {
    value: { type: String, value: '' },
    placeholder: { type: String, value: '' },
    type: { type: String, value: 'text' },
    maxlength: { type: Number, value: 140 },
    multiline: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
    adjustPosition: { type: Boolean, value: false },
    theme: { type: Object, value: {} },
  },
  methods: {
    onInput(e) {
      this.triggerEvent('input', { value: e.detail.value });
    },
    onBlur(e) {
      this.triggerEvent('blur', { value: e.detail.value });
    },
  },
});
