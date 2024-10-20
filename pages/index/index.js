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
    this.loadTempData()
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

  onLanguageChange: function() {
    console.log('Index page onLanguageChange called')
    this.setData({ t: app.t.bind(app) })
    console.log('Translation function updated:', this.data.t)
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.loadTempData()
  },

  onShow: function() {
    console.log('Index page onShow')
    app.updateTabBarLanguage()
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.loadTempData()
  },

  loadTempData: function() {
    console.log('Loading temp data')
    // 临时数据：最近活动
    const recentActivities = [
      { id: 1, name: '《百年孤独》读书会', time: '2023-05-15 19:00', location: '中央图书馆' },
      { id: 2, name: '《1984》讨论会', time: '2023-05-22 19:30', location: '咖啡馆A' },
      { id: 3, name: '《三体》科幻专场', time: '2023-05-29 20:00', location: '社区中心' }
    ]

    // 临时数据：热门书目
    const popularBooks = [
      { id: 1, name: '百年孤独', author: '加西亚·马尔克斯' },
      { id: 2, name: '1984', author: '乔治·奥威尔' },
      { id: 3, name: '三体', author: '刘慈欣' }
    ]

    this.setData({ recentActivities, popularBooks })
    console.log('Temp data loaded:', { recentActivities, popularBooks })
  }
})
