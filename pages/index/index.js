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
    console.log('Index page loaded')
    this.setData({ t: app.t.bind(app) })
    console.log('Translation function set:', this.data.t)
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.fetchBooks()
    this.fetchMeetings()
  },

  updatePageTexts: function() {
    console.log('Updating page texts')
    const welcomeText = this.data.t('welcome')
    const recentActivitiesText = this.data.t('recentActivities')
    const popularBooksText = this.data.t('popularBooks')
    
    console.log('Translated texts:', { welcomeText, recentActivitiesText, popularBooksText })
    
    this.setData({
      welcomeText,
      recentActivitiesText,
      popularBooksText
    })
    
    console.log('Page texts updated:', this.data)
  },

  updateNavBarTitle: function() {
    console.log('Updating nav bar title')
    const title = this.data.t('navBarTitle')
    console.log('Translated nav bar title:', title)
    wx.setNavigationBarTitle({
      title: title
    })
  },

  fetchBooks: function() {
    this.setData({ isLoading: true, hasError: false });
    console.log('Fetching books from API')
    wx.request({
      url: `${app.globalData.apiBaseUrl}/books`,
      method: 'GET',
      success: (res) => {
        console.log('Books fetched successfully:', res.data)
        // 直接使用 res.data，因为它已经是数组了
        if (res.data && Array.isArray(res.data)) {
          const popularBooks = res.data.map(book => ({
            id: book.id,
            name: book.name || '未知书名',
            author: book.author || '未知作者'
          }));
          console.log('Processed books:', popularBooks);
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
    wx.request({
      url: `${app.globalData.apiBaseUrl}/meetings`,
      method: 'GET',
      success: (res) => {
        console.log('Meetings fetched successfully:', res.data)
        // 直接使用 res.data，因为它已经是数组了
        if (res.data && Array.isArray(res.data)) {
          const currentDate = new Date().toISOString().split('T')[0];
          const recentActivities = res.data
            .filter(meeting => meeting.date >= currentDate)
            .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
            .slice(0, 5)
            .map(meeting => ({
              id: meeting.id,
              name: meeting.name || '未知会议',
              time: `${meeting.date} ${meeting.time}`,
              location: meeting.location || '地点待定'
            }));
          console.log('Processed meetings:', recentActivities);
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
  }
})
