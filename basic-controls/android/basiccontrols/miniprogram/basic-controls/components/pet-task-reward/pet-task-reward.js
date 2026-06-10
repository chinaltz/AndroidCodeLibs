Component({
  properties: {
    title: String,
    result: Object,
    shareText: String,
    eventId: String,
    finishText: {
      type: String,
      value: '继续学习',
    },
    petPath: {
      type: String,
      value: '/packages/pet/pages/pet/index',
    },
    finishPath: String,
  },

  methods: {
    onPet() {
      wx.navigateTo({ url: this.data.petPath });
    },
    onFinish() {
      if (this.data.finishPath) {
        wx.reLaunch({ url: this.data.finishPath });
        return;
      }
      wx.navigateBack();
    },
  },
});
