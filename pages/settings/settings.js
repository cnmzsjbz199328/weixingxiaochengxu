const app = getApp()

Page({
  data: {
    t: {}, // 用于存储翻译函数
    currentLanguage: 'zh' // 默认语言
  },

  onLoad: function() {
    console.log('Settings page loaded')
    this.setData({ 
      t: app.t.bind(app),
      currentLanguage: app.globalData.language
    })
    console.log('Current language:', this.data.currentLanguage)
  },

  switchLanguage: function() {
    console.log('Language switch triggered')
    const newLang = this.data.currentLanguage === 'zh' ? 'en' : 'zh'
    console.log('New language:', newLang)
    app.switchLanguage(newLang)
    this.setData({ 
      t: app.t.bind(app),
      currentLanguage: newLang
    })
    console.log('Language switched to:', newLang)
    console.log('Current page data:', this.data)
  },

  onLanguageChange: function() {
    console.log('Settings page onLanguageChange called')
    this.setData({ 
      t: app.t.bind(app),
      currentLanguage: app.globalData.language
    })
    console.log('Updated language:', this.data.currentLanguage)
    console.log('Current page data:', this.data)
  },

  onShow: function() {
    console.log('Settings page onShow')
  }
})
