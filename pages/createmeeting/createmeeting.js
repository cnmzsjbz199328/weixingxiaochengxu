const app = getApp()

Page({
  data: {
    meetingName: '',
    date: '',
    time: '',
    location: '',
    selectedBooks: [],
    books: [],
    t: {} // 用于存储翻译函数
  },

  onLoad: function() {
    this.setData({ t: app.t.bind(app) })
    this.updatePageTexts()
    this.fetchBooks()
  },

  updatePageTexts: function() {
    this.setData({
      createMeetingText: this.data.t('createMeeting'),
      meetingNameText: this.data.t('meetingName'),
      dateText: this.data.t('date'),
      timeText: this.data.t('time'),
      locationText: this.data.t('location'),
      selectBooksText: this.data.t('selectBooks'),
      submitText: this.data.t('submit')
    })
  },

  fetchBooks: function() {
    // 这里应该是从服务器获取书目数据的逻辑
    // 暂时使用模拟数据
    const books = [
      { id: 1, name: '百年孤独' },
      { id: 2, name: '1984' },
      { id: 3, name: '三体' }
    ];
    this.setData({ books })
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  onBookSelect(e) {
    this.setData({
      selectedBooks: e.detail.value
    });
  },

  async createMeeting() {
    const { meetingName, date, time, location, selectedBooks } = this.data;
    if (!meetingName || !date || !time || !location || selectedBooks.length === 0) {
      wx.showToast({
        title: this.data.t('fillAllFields'),
        icon: 'none'
      });
      return;
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'createMeeting',
        data: { meetingName, date, time, location, selectedBooks }
      });

      wx.showToast({
        title: this.data.t('createSuccess'),
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error(this.data.t('createFailed'), error);
      wx.showToast({
        title: this.data.t('createFailedRetry'),
        icon: 'none'
      });
    }
  },

  onLanguageChange: function() {
    this.setData({ t: app.t.bind(app) })
    this.updatePageTexts()
  }
});
