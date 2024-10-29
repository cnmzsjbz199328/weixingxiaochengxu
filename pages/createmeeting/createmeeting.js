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
    this.updateNavBarTitle()
    this.fetchBooks()
  },

  updateNavBarTitle: function() {
    wx.setNavigationBarTitle({
      title: this.data.t('createMeeting')
    })
  },

  updatePageTexts: function() {
    this.setData({
      meetingNameText: this.data.t('meetingName'),
      dateText: this.data.t('date'),
      timeText: this.data.t('time'),
      locationText: this.data.t('location'),
      selectBooksText: this.data.t('selectBooks'),
      submitText: this.data.t('submit')
    })
  },

  fetchBooks: async function() {
    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/books`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json'
          },
          success: (res) => {
            console.log('Fetch books response:', res);
            if (res.statusCode === 200) {
              resolve(res);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          },
          fail: (error) => {
            console.error('Request failed:', error);
            reject(error);
          }
        });
      });

      console.log('Books data:', response.data);
      
      if (response.statusCode === 200) {
        const books = Array.isArray(response.data) ? response.data : [];
        // 确保book的id是数字类型
        const processedBooks = books.map(book => ({
          ...book,
          id: parseInt(book.id, 10)
        }));
        console.log('Processed books:', processedBooks);
        this.setData({ 
          books: processedBooks
        });
      } else {
        throw new Error('Failed to fetch books');
      }
    } catch (error) {
      console.error('Fetch books error:', error);
      wx.showToast({
        title: this.data.t('fetchBooksFailed'),
        icon: 'none'
      });
    }
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  onBookSelect(e) {
    console.log('Selected books:', e.detail.value);
    // 将字符串ID转换为数字数组
    const selectedBooks = e.detail.value.map(id => parseInt(id, 10));
    console.log('Converting to numbers:', selectedBooks);
    this.setData({
      selectedBooks: selectedBooks
    });
    console.log('Updated selectedBooks:', this.data.selectedBooks);
  },

  // 添加一个辅助函数来检查书籍是否被选中
  isBookSelected(bookId) {
    return this.data.selectedBooks.includes(parseInt(bookId, 10));
  },

  async createMeeting() {
    const { meetingName, date, time, location, selectedBooks, books } = this.data;
    
    // 验证必填字段
    if (!meetingName || !date || !time || !location) {
      wx.showToast({
        title: this.data.t('fillAllFields'),
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

      // 获取选中书籍的名称
      const selectedBookNames = books
        .filter(book => selectedBooks.includes(book.id))
        .map(book => book.name);

      // 构建完整的会议名称
      const fullMeetingName = selectedBookNames.length > 0 
        ? `${meetingName}(${selectedBookNames.join(', ')})` 
        : meetingName;

      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/meetings`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'X-User-ID': userInfo.id.toString()
          },
          data: {
            name: fullMeetingName, // 使用包含书籍名称的完整会议名称
            date: date,
            time: time,
            location: location,
            books: selectedBooks,
            createdBy: userInfo.id
          },
          success: (res) => {
            console.log('Create meeting response:', res);
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
      console.error('Create meeting error:', error);
      wx.hideLoading();
      wx.showToast({
        title: this.data.t('createFailedRetry'),
        icon: 'none'
      });
    }
  },

  onShow: function() {
    this.updatePageTexts()
    this.updateNavBarTitle()
  },

  onLanguageChange: function() {
    this.setData({ t: app.t.bind(app) })
    this.updatePageTexts()
    this.updateNavBarTitle()
  }
});
