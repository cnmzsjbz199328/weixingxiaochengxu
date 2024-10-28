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
    this.updateNavBarTitle()
  },

  updateNavBarTitle: function() {
    wx.setNavigationBarTitle({
      title: this.data.t('createBook')
    })
  },

  onShow: function() {
    console.log('Create book page shown');
    this.updatePageTexts()
    this.updateNavBarTitle()
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
    
    // 验证必填字段
    if (!bookName || !author) {
      wx.showToast({
        title: this.data.t('fillNameAuthor'),
        icon: 'none'
      });
      return;
    }

    // 获取用户ID
    const userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: this.data.t('pleaseLogin'),
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '...' });

      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/books`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'X-User-ID': userInfo.id.toString()
          },
          data: {
            name: bookName,
            author: author,
            abstract: abstract,
            createdBy: userInfo.id
          },
          success: (res) => {
            console.log('Create book response:', res);
            if (res.statusCode === 200 || res.statusCode === 201) {
              resolve(res);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          },
          fail: reject
        });
      });

      wx.hideLoading();
      wx.showToast({
        title: this.data.t('createSuccess'),
        icon: 'success'
      });

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('Create book error:', error);
      wx.hideLoading();
      wx.showToast({
        title: this.data.t('createFailedRetry'),
        icon: 'none'
      });
    }
  },

  onLanguageChange: function() {
    this.setData({ t: app.t.bind(app) })
    this.updatePageTexts()
    this.updateNavBarTitle()
  }
});
