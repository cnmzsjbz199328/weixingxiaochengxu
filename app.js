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

    // 添加 API 基础 URL 作为环境变量
    this.globalData.apiBaseUrl = 'https://adelaide-reading-api.tj15982183241.workers.dev/api'
  },

  globalData: {
    userInfo: null,
    language: 'zh',
    langData: {
      zh: zhLang,
      en: enLang
    },
    tabBarPages: ['pages/index/index', 'pages/booklist/booklist', 'pages/meetinglist/meetinglist', 'pages/profile/profile'],
    apiBaseUrl: '' // 将在 onLaunch 中设置
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
  },

  login: function() {
    console.log('Login function called');
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (res.code) {
            console.log("wx.login 成功，code:", res.code);
            console.log('Sending login request to server');
            wx.request({
              url: `${this.globalData.apiBaseUrl}/login`,
              method: 'POST',
              data: {
                code: res.code
              },
              success: (res) => {
                console.log('Server response:', res);
                if (res.statusCode === 200 && res.data) {
                  console.log('Login successful, user data:', res.data);
                  this.globalData.userInfo = res.data;
                  wx.setStorageSync('userInfo', res.data);
                  resolve(res.data);
                } else {
                  console.error('Login failed, server response:', res);
                  reject('登录失败');
                }
              },
              fail: (error) => {
                console.error('Network request failed:', error);
                reject('网络请求失败');
              }
            });
          } else {
            console.error("wx.login 成功但未获取到 code，错误信息:", res.errMsg);
            reject('获取用户登录凭证失败：' + res.errMsg);
          }
        },
        fail: (error) => {
          console.error("wx.login 调用失败，错误信息:", error);
          reject('微信登录失败');
        }
      });
    });
  },

  logout: function() {
    console.log('Logout function called');
    return new Promise((resolve, reject) => {
      console.log('Clearing user info and storage');
      this.globalData.userInfo = null;
      wx.removeStorageSync('userInfo');
      console.log('User logged out successfully');
      resolve();
    });
  }
})
