Page({
  data: {
    date: '',
    time: '',
    location: '',
    bookId: ''
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  async createMeeting() {
    const { date, time, location, bookId } = this.data;
    if (!date || !time || !location || !bookId) {
      wx.showToast({
        title: '请填写所有必填信息',
        icon: 'none'
      });
      return;
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'createMeeting',
        data: { date, time, location, bookId }
      });

      wx.showToast({
        title: '创建成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('创建会议失败', error);
      wx.showToast({
        title: '创建失败，请重试',
        icon: 'none'
      });
    }
  }
});
