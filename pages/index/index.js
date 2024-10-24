const app = getApp()

Page({
  data: {
    t: {}, // 用于存储翻译函数
    welcomeText: '',
    recentActivitiesText: '',
    popularBooksText: '',
    recentActivities: [],
    popularBooks: []
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
    console.log('Fetching books from API')
    wx.request({
      url: `${app.globalData.apiBaseUrl}/books`,
      method: 'GET',
      success: (res) => {
        console.log('Books fetched successfully:', res.data)
        if (res.statusCode === 200 && res.data.results) {
          // 获取前10本书作为热门书目
          const popularBooks = res.data.results.slice(0, 10).map(book => ({
            id: book.id,
            name: book.name,
            author: book.author
          }))
          this.setData({ popularBooks })
        } else {
          console.error('Failed to fetch books:', res)
          wx.showToast({
            title: this.data.t('fetchBooksFailed'),
            icon: 'none'
          })
        }
      },
      fail: (error) => {
        console.error('Error fetching books:', error)
        wx.showToast({
          title: this.data.t('networkError'),
          icon: 'none'
        })
      }
    })
  },

  fetchMeetings: function() {
    console.log('Fetching meetings from API')
    wx.request({
      url: `${app.globalData.apiBaseUrl}/meetings`,
      method: 'GET',
      success: (res) => {
        console.log('Meetings fetched successfully:', res.data)
        if (res.statusCode === 200 && res.data.results) {
          const currentDate = new Date().toISOString().split('T')[0]; // 获取当前日期
          // 过滤并排序未来的会议
          const futureMeetings = res.data.results
            .filter(meeting => meeting.date >= currentDate)
            .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
          
          // 获取前5个未来会议作为最近活动
          const recentActivities = futureMeetings.slice(0, 5).map(meeting => ({
            id: meeting.id,
            name: meeting.name,
            time: meeting.date + ' ' + meeting.time,
            location: meeting.location
          }))
          this.setData({ recentActivities })
        } else {
          console.error('Failed to fetch meetings:', res)
          wx.showToast({
            title: this.data.t('fetchMeetingsFailed'),
            icon: 'none'
          })
        }
      },
      fail: (error) => {
        console.error('Error fetching meetings:', error)
        wx.showToast({
          title: this.data.t('networkError'),
          icon: 'none'
        })
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
