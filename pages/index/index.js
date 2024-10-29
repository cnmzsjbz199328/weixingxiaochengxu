const app = getApp()

Page({
  data: {
    t: {}, // 用于存储翻译函数
    welcomeText: '',
    recentActivitiesText: '',
    popularBooksText: '',
    recentActivities: [],
    popularBooks: [],
    isLoading: false,
    hasError: false,
    errorMessage: ''
  },

  onLoad: function() {
    this.setData({ t: app.t.bind(app) })
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.fetchBooks()
    this.fetchMeetings()
  },

  updatePageTexts: function() {
    const welcomeText = this.data.t('welcome')
    const recentActivitiesText = this.data.t('recentActivities')
    const popularBooksText = this.data.t('popularBooks')
    
    this.setData({
      welcomeText,
      recentActivitiesText,
      popularBooksText
    })
  },

  updateNavBarTitle: function() {
    const title = this.data.t('navBarTitle')
    wx.setNavigationBarTitle({
      title: title
    })
  },

  fetchBooks: function() {
    this.setData({ isLoading: true, hasError: false });
    wx.request({
      url: `${app.globalData.apiBaseUrl}/books`,
      method: 'GET',
      success: (res) => {
        // 直接使用 res.data，因为它已经是数组了
        if (res.data && Array.isArray(res.data)) {
          const popularBooks = res.data.map(book => ({
            id: book.id,
            name: book.name || '未知书名',
            author: book.author || '未知作者'
          }));
          this.setData({ 
            popularBooks,
            isLoading: false
          });
        } else {
          console.error('Invalid books data format:', res.data)
          this.setData({ 
            hasError: true,
            errorMessage: this.data.t('fetchBooksFailed'),
            isLoading: false
          });
        }
      },
      fail: (error) => {
        console.error('Error fetching books:', error)
        this.setData({ 
          hasError: true,
          errorMessage: this.data.t('networkError'),
          isLoading: false
        });
      }
    })
  },

  fetchMeetings: function() {
    this.setData({ isLoading: true, hasError: false });
    console.log('Fetching meetings from API')
    
    // 获取用户ID
    const userInfo = app.globalData.userInfo;
    const userId = userInfo ? userInfo.id : null;
    
    // 构建URL字符串
    let url = `${app.globalData.apiBaseUrl}/meetings`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        ...(userId && { 'X-User-ID': userId.toString() })
      },
      success: (res) => {  
        if (res.data && Array.isArray(res.data)) {
          const currentDate = new Date().toISOString().split('T')[0];
          
          const recentActivities = res.data
            .filter(meeting => meeting.date >= currentDate)
            .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
            .slice(0, 5)
            .map(meeting => {
              return {
                id: meeting.id,
                name: meeting.name || '未知会议',
                time: `${meeting.date} ${meeting.time}`,
                location: meeting.location || '地点待定',
                signupCount: meeting.signupCount || 0,
                isParticipating: meeting.userStatus === '已报名'
              };
            });

          this.setData({ 
            recentActivities,
            isLoading: false
          });
        } else {
          console.error('Invalid meetings data format:', res.data)
          this.setData({ 
            hasError: true,
            errorMessage: this.data.t('fetchMeetingsFailed'),
            isLoading: false
          });
        }
      },
      fail: (error) => {
        console.error('Error fetching meetings:', error)
        this.setData({ 
          hasError: true,
          errorMessage: this.data.t('networkError'),
          isLoading: false
        });
      }
    })
  },

  onShow: function() {
    console.log('Index page onShow')
    app.updateTabBarLanguage()
    this.updatePageTexts()
    this.updateNavBarTitle()
  },

  onLanguageChange: function() {
    console.log('Index page onLanguageChange called')
    this.setData({ t: app.t.bind(app) })
    console.log('Translation function updated:', this.data.t)
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.fetchBooks()
    this.fetchMeetings()
  },

  toggleParticipation: async function(e) {
    const meetingId = e.currentTarget.dataset.id;
    const userInfo = app.globalData.userInfo;
    
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: this.data.t('pleaseLogin'),
        icon: 'none'
      });
      return;
    }

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/user/meetings/${meetingId}/toggle?userId=${userInfo.id}`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'X-User-ID': userInfo.id.toString()
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(res);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          },
          fail: reject
        });
      });

      // 切换成功后重新获取会议列表以更新状态和人数
      this.fetchMeetings();

    } catch (error) {
      console.error('Toggle participation error:', error);
      wx.showToast({
        title: this.data.t('operationFailed'),
        icon: 'none'
      });
    }
  },

  onBookDetail: function(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/bookdetail/bookdetail?id=${bookId}`
    });
  }
})
