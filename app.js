import zhLang from './lang/zh'
import enLang from './lang/en'
const LoginCheck = require('./utils/loginCheck')
const logger = require('./utils/logger')  // 添加 logger 引用

App({
  onLaunch: async function () {
    console.log('=== App Launch Start ===');
    
    // 首先初始化默认游客会话
    console.log('Initializing default guest session');
    const defaultUserInfo = {
      id: 1,
      nickName: 'Guest',
      email: 'guest@example.com',
      avatarUrl: '/images/default-avatar.png',
      booksRead: 0,
      meetingsAttended: 0
    };

    // 保存默认会话数据
    const sessionData = {
      userId: 1,
      timestamp: new Date().getTime()
    };

    try {
      wx.setStorageSync('sessionData', sessionData);
      wx.setStorageSync('sessionId', '1');
      wx.setStorageSync('userInfo', defaultUserInfo);
      this.globalData.userInfo = defaultUserInfo;
      console.log('Default guest session initialized:', {
        sessionData,
        userInfo: defaultUserInfo
      });
    } catch (error) {
      console.error('Failed to initialize guest session:', error);
    }

    // 初始化语言设置
    const storedLang = wx.getStorageSync('language') || 'zh';
    console.log('Initial language setting:', storedLang);
    this.globalData.language = storedLang;

    // 获取系统语言或存储的语言设置
    const storedLanguage = wx.getStorageSync('language');
    if (!storedLanguage) {
      console.log('No stored language found, setting default to en');
      wx.setStorageSync('language', 'en');
      this.globalData.language = 'en';
    } else {
      console.log('Using stored language:', storedLanguage);
      this.globalData.language = storedLanguage;
    }

    // 初始化语言设置
    this.updateTabBarLanguage()

    // 添加 API 基础 URL 作为环境变量
    this.globalData.apiBaseUrl = 'https://adelaide-reading-api.tj15982183241.workers.dev/api'
    console.log('API Base URL:', this.globalData.apiBaseUrl);

    console.log('=== App Launch Complete ===');
    console.log('Final globalData state:', this.globalData);
  },

  globalData: {
    userInfo: null,
    language: 'en',
    langData: {
      zh: zhLang,
      en: enLang
    },
    tabBarPages: ['pages/index/index', 'pages/booklist/booklist', 'pages/meetinglist/meetinglist', 'pages/profile/profile'],
    apiBaseUrl: 'https://adelaide-reading-api.tj15982183241.workers.dev/api',
    r2WorkerUrl: 'https://r2-worker.tj15982183241.workers.dev',  // 添加这一行
    r2BaseUrl: 'pub-ecb3f89848ab43e9994824d78aadd3c2.r2.dev',   // 添加这一行
    isLoggedIn: false
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
    
    // 定义 tabBar 项目及其对应的翻译 key
    const tabBarItems = [
      { index: 0, text: 'tabHome' },
      { index: 1, text: 'tabBookList' },
      { index: 2, text: 'tabMeetings' },
      { index: 3, text: 'tabProfile' }
    ]

    // 获取当前页面
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentPagePath = currentPage ? currentPage.route : ''
    
    // 检查是否需要更新 TabBar
    if (this.globalData.tabBarPages.includes(currentPagePath)) {
      console.log('Updating TabBar items')
      tabBarItems.forEach(item => {
        const translatedText = t(item.text)
        wx.setTabBarItem({
          index: item.index,
          text: translatedText,
          complete: (res) => {
            if (res.errMsg !== 'setTabBarItem:ok') {
              console.error(`Failed to update tab bar item ${item.index}:`, res.errMsg)
            }
          }
        })
      })
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
    return translation
  },

  login: function(email, password) {
    return new Promise((resolve, reject) => {
      logger.info("Starting login process");
      
      // 添加请求参数日志
      console.log('Login request URL:', `${this.globalData.apiBaseUrl}/login`);
      console.log('Login request data:', {
        emailOrNickName: email,
        password: password
      });

      wx.request({
        url: `${this.globalData.apiBaseUrl}/login`,
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          emailOrNickName: email,
          password: password
        },
        success: (loginRes) => {
          console.log('Raw login response:', loginRes); // 添加原始响应日志
          logger.debug("Login response:", loginRes);
          
          if (loginRes.statusCode === 200 && loginRes.data) {
            const userData = loginRes.data;
            
            // 验证返回的用户数据
            console.log('Received user data:', userData);
            
            if (!userData.id) {
              logger.error("Missing user ID in response:", userData);
              reject(new Error('Missing user ID in response'));
              return;
            }

            // 保存用户ID到session
            const sessionSaved = this.saveSession(userData);
            if (!sessionSaved) {
              reject(new Error('Failed to save session'));
              return;
            }

            logger.info("Login successful, session saved:", {
              userId: userData.id,
              email: userData.email,
              nickName: userData.nickName
            });

            this.setUserInfo(userData);
            resolve(userData);
          } else {
            const errorMsg = `Login failed: ${loginRes.data?.error || 'Unknown error'}`;
            console.error('Login response error:', loginRes); // 添加错误响应日志
            logger.error(errorMsg, loginRes);
            reject(new Error(errorMsg));
          }
        },
        fail: (error) => {
          console.error('Network error:', error); // 添加网络错误日志
          logger.error("Login request failed:", error);
          reject(error);
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
  },

  // 获取 session 数据
  getSession: function() {
    console.log('Getting session data');
    try {
      const sessionData = wx.getStorageSync('sessionData');
      console.log('Session data from storage:', sessionData);
      return sessionData;
    } catch (error) {
      console.error('Failed to get session data:', error);
      return null;
    }
  },

  // 检查 session 是否有效
  checkSession: function() {
    try {
      const sessionData = wx.getStorageSync('sessionData');
      const sessionId = wx.getStorageSync('sessionId');
      const userInfo = wx.getStorageSync('userInfo');

      logger.debug("Session check:", {
        sessionData,
        sessionId,
        userInfo
      });

      if (!sessionData || !sessionId || !userInfo) {
        logger.info("Incomplete session data found");
        this.clearSession();
        return false;
      }

      if (sessionData.userId.toString() !== sessionId) {
        logger.error("Session ID mismatch:", {
          sessionDataId: sessionData.userId,
          sessionId: sessionId
        });
        this.clearSession();
        return false;
      }

      // 检查session是否过期（例如24小时）
      const now = new Date().getTime();
      const sessionAge = now - sessionData.timestamp;
      if (sessionAge > 24 * 60 * 60 * 1000) {
        logger.info("Session expired");
        this.clearSession();
        return false;
      }

      this.globalData.userInfo = userInfo;
      logger.info("Valid session found for user:", userInfo.id);
      return true;
    } catch (error) {
      logger.error("Error checking session:", error);
      return false;
    }
  },

  // 清除 session
  clearSession: function() {
    console.log('Clearing session data');
    try {
      wx.removeStorageSync('sessionData');
      wx.removeStorageSync('userInfo');
      this.globalData.userInfo = null;
      console.log('Session data cleared successfully');
    } catch (error) {
      console.error('Failed to clear session data:', error);
    }
  },

  saveSession: function(userData) {
    if (!userData.id) {
        logger.error("Cannot save session: missing user ID", userData);
        return false;
    }

    const sessionData = {
        userId: userData.id,
        timestamp: new Date().getTime()
    };

    try {
        wx.setStorageSync('sessionData', sessionData);
        wx.setStorageSync('sessionId', userData.id.toString());
        logger.info("Session saved successfully:", sessionData);
        return true;
    } catch (error) {
        logger.error("Failed to save session:", error);
        return false;
    }
  },

  setUserInfo: function(userData) {
    console.log("Setting user info. User ID:", userData.id); // 新增
    this.globalData.userInfo = userData;
    wx.setStorageSync('userInfo', userData);
    wx.setStorageSync('sessionId', userData.id.toString());
    console.log("Session ID set:", userData.id.toString()); // 新增
  },

  // 统一的API调用函
  request: function(options) {
    const sessionId = wx.getStorageSync('sessionId');
    const header = {
        'content-type': 'application/json',
        ...options.header
    };
    
    if (sessionId) {
        header['X-User-ID'] = sessionId;
        logger.debug("Adding session ID to request:", sessionId);
    }

    console.log(`Making ${options.method} request to ${options.url}:`, {
        data: options.data,
        headers: header
    });

    return new Promise((resolve, reject) => {
        wx.request({
            ...options,
            url: `${this.globalData.apiBaseUrl}${options.url}`,
            header: header,
            success: (res) => {
                console.log(`Response from ${options.url}:`, res);
                
                if (res.statusCode === 200) {
                    resolve(res.data);
                } else if (res.statusCode === 401) {
                    logger.warn("Unauthorized request, clearing session");
                    this.clearSession();
                    reject(new Error('Unauthorized'));
                } else {
                    const error = new Error(res.data?.error || `Request failed with status ${res.statusCode}`);
                    error.statusCode = res.statusCode;
                    error.response = res;
                    reject(error);
                }
            },
            fail: (error) => {
                console.error("Request failed:", error);
                logger.error("Request failed:", {
                    url: options.url,
                    error: error
                });
                reject(error);
            }
        });
    });
  },

  async checkLoginStatus() {
    const checkResult = await LoginCheck.checkLoginStatus()
    if (checkResult.success) {
      this.globalData.userInfo = checkResult.userInfo
      this.globalData.isLoggedIn = true
      return true
    }
    this.globalData.isLoggedIn = false
    return false
  },

  // 更新用户信息的方法
  updateUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  // 在 App 对象中添加自动登录函数
  autoGuestLogin: async function() {
    console.log('Attempting auto guest login');
    try {
      const guestCredentials = {
        email: 'guest',
        password: '1'
      };
      
      const userInfo = await this.login(guestCredentials.email, guestCredentials.password);
      console.log('Auto guest login successful:', userInfo);
      
      // 更新全局用户信息
      this.globalData.userInfo = userInfo;
      
      return userInfo;
    } catch (error) {
      console.error('Auto guest login failed:', error);
      return null;
    }
  },
})

