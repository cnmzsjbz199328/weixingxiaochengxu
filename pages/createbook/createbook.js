const app = getApp()

Page({
  data: {
    bookName: '',
    author: '',
    abstract: '',
    t: {} // 用于存储翻译函数
  },

  onLoad: function() {
    console.log('Create book page loaded');
    this.setData({ t: app.t.bind(app) }) // 设置翻译函数
    this.updatePageTexts()
  },

  onShow: function() {
    console.log('Create book page shown');
    this.updatePageTexts()
  },

  updatePageTexts: function() {
    this.setData({
      bookNameText: this.data.t('bookName'),
      authorText: this.data.t('author'),
      abstractText: this.data.t('abstract'),
      submitText: this.data.t('submit')
    })
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  async createBook() {
    const { bookName, author, abstract } = this.data;
    if (!bookName || !author) {
      wx.showToast({
        title: this.data.t('fillNameAuthor'),
        icon: 'none'
      });
      return;
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'createBook',
        data: { bookName, author, abstract }
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
