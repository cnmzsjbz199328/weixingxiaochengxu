import zhLang from './lang/zh'
import enLang from './lang/en'

App({
  onLaunch: function () {
    console.log('App onLaunch')
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-env-id',
        traceUser: true,
      })
    }

    // 初始化语言设置
    this.updateTabBarLanguage()
  },

  globalData: {
    userInfo: null,
    language: 'zh',
    langData: {
      zh: zhLang,
      en: enLang
    },
    tabBarPages: ['pages/index/index', 'pages/booklist/booklist', 'pages/meetinglist/meetinglist', 'pages/profile/profile']
  },
  
  switchLanguage(lang) {
    console.log('App switchLanguage called with lang:', lang)
    this.globalData.language = lang
    console.log('Global language updated to:', this.globalData.language)
    this.updateTabBarLanguage()
    this.updateAllPages()
  },

  updateTabBarLanguage() {
    console.log('updateTabBarLanguage called')
    const t = this.t.bind(this)
    const tabBarItems = [
      { index: 0, text: 'tabHome' },
      { index: 1, text: 'tabBookList' },
      { index: 2, text: 'tabMeetings' },
      { index: 3, text: 'tabProfile' }
    ]

    const currentPage = getCurrentPages().pop()
    const currentPagePath = currentPage ? currentPage.route : ''
    console.log('Current page path:', currentPagePath)
    
    if (this.globalData.tabBarPages.includes(currentPagePath)) {
      console.log('Updating TabBar items')
      tabBarItems.forEach(item => {
        const translatedText = t(item.text)
        console.log(`Updating tab ${item.index} to "${translatedText}"`)
        wx.setTabBarItem({
          index: item.index,
          text: translatedText,
          complete: (res) => {
            console.log(`setTabBarItem result for index ${item.index}:`, res)
            if (res.errMsg !== 'setTabBarItem:ok') {
              console.error(`Failed to update tab bar item ${item.index}:`, res.errMsg)
            }
          }
        })
      })
    } else {
      console.log('Not updating TabBar: current page is not a TabBar page')
    }
  },

  updateAllPages() {
    console.log('updateAllPages called')
    const pages = getCurrentPages()
    console.log('Current pages:', pages.map(p => p.route))
    pages.forEach((page) => {
      if (page.onLanguageChange) {
        console.log('Calling onLanguageChange for page:', page.route)
        page.onLanguageChange()
      }
      if (page.fetchData) {
        console.log('Calling fetchData for page:', page.route)
        page.fetchData()
      }
    })
  },

  t(key) {
    const translation = this.globalData.langData[this.globalData.language][key]
    console.log(`Translating key "${key}" to "${translation}"`)
    return translation
  }
})
