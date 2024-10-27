// pages/profile/profile.js
const app = getApp()
const logger = require('../../utils/logger')  // 添加 logger 引用

Page({

  /**
   * Page initial data
   */
  data: {
    userInfo: null,
    isRegistering: false,
    email: '',
    password: '',
    nickname: '',
    t: {}, // 用于存储翻译函数
    booksReadText: '',
    meetingsAttendedText: '',
    editProfileText: '',
    viewHistoryText: '',
    settingsText: '',
    logoutText: ''
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function() {
    console.log('Profile page loaded')
    this.setData({ 
        t: app.t.bind(app),
        userInfo: app.globalData.userInfo
    })
    console.log('Translation function set:', this.data.t)
    this.updatePageTexts()
    this.updateNavBarTitle()
  },

  updatePageTexts: function() {
    console.log('Updating page texts')
    this.setData({
        booksReadText: this.data.t('booksRead'),
        meetingsAttendedText: this.data.t('meetingsAttended'),
        editProfileText: this.data.t('editProfile'),
        viewHistoryText: this.data.t('viewHistory'),
        settingsText: this.data.t('settings'),
        logoutText: this.data.t('logout'),
        // 添加登录相关的文本
        welcomeLoginText: this.data.t('welcomeLogin'),
        loginText: this.data.t('login'),
        registerText: this.data.t('register'),
        noAccountText: this.data.t('noAccount'),
        registerNowText: this.data.t('registerNow'),
        hasAccountText: this.data.t('hasAccount'),
        loginNowText: this.data.t('loginNow')
    })
    console.log('Page texts updated:', this.data)
  },

  updateNavBarTitle: function() {
    console.log('Updating profile nav bar title')
    const title = this.data.t('tabProfile')
    console.log('Translated profile nav bar title:', title)
    wx.setNavigationBarTitle({
      title: title
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {
    console.log('Profile page onShow')
    app.updateTabBarLanguage()
    this.updatePageTexts()
    this.updateNavBarTitle()
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  },

  checkLogin: function() {
    console.log('Checking login status');
    if (app.checkSession()) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
      console.log('Valid session found. User info set:', this.data.userInfo);
      console.log('User ID:', this.data.userInfo.id); // 新增
    } else {
      console.log('No valid session, clearing user info');
      this.setData({
        userInfo: null
      });
    }
  },

  onLogin: function() {
    const { email, password } = this.data;
    
    if (!email || !password) {
      wx.showToast({
        title: 'Please fill in all fields',
        icon: 'none'
      });
      return;
    }

    logger.info('Starting login process');
    wx.showLoading({
      title: 'Logging in...',
    });
    
    // 添加日志来检查发送的数据
    console.log('Sending login request with:', {
      emailOrNickName: email,
      password: password
    });
    
    app.login(email, password)
      .then(userInfo => {
        console.log('Login response:', userInfo); // 添加日志
        logger.info('Login successful, user info:', userInfo);
        
        // 检查返回的数据是否包含必要字段
        if (!userInfo || !userInfo.id) {
          logger.error('Missing required user data fields:', userInfo);
          throw new Error('Incomplete user data');
        }

        this.setData({
          userInfo: userInfo,
          email: '',
          password: ''
        });

        // 保存完整的用户信息到全局
        app.globalData.userInfo = userInfo;
        
        wx.hideLoading();
        wx.showToast({
          title: 'Login successful',
          icon: 'success'
        });

        logger.info('User data saved:', {
          id: userInfo.id,
          email: userInfo.email,
          nickName: userInfo.nickName
        });
      })
      .catch(error => {
        console.error('Login error:', error); // 添加详细错误日志
        logger.error('Login failed:', error);
        wx.hideLoading();
        
        let errorMessage = 'Login failed, please try again';
        if (error.message === 'Incomplete user data') {
          errorMessage = 'Server data error, please contact support';
        } else if (error.message.includes('用户不存在')) {
          errorMessage = 'User does not exist or incorrect password';
        }
        
        wx.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        });
      });
  },

  onEditProfile: function() {
    console.log('Edit profile button clicked')
    wx.navigateTo({
      url: '/pages/editprofile/editprofile'
    });
  },

  onViewHistory: function() {
    console.log('View history button clicked')
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  onSettings: function() {
    console.log('Settings button clicked')
    wx.redirectTo({
      url: '/pages/settings/settings',
      success: function() {
        console.log('Redirection to settings page successful')
      },
      fail: function(error) {
        console.error('Redirection to settings page failed:', error)
        wx.showToast({
          title: '无法打开设置页面',
          icon: 'none'
        })
      }
    });
  },

  onLogout: function() {
    console.log('Logout button clicked');
    wx.showModal({
      title: this.data.t('logout'),
      content: this.data.t('logoutConfirmation'),
      success: (res) => {
        if (res.confirm) {
          console.log('User confirmed logout');
          app.logout().then(() => {
            console.log('Logout successful, updating UI');
            this.setData({
              userInfo: null
            });
            wx.showToast({
              title: this.data.t('logoutSuccess'),
              icon: 'success',
              duration: 2000
            });
            console.log('Navigating to index page');
            wx.switchTab({
              url: '/pages/index/index'
            });
          }).catch((error) => {
            console.error('Logout failed:', error);
            wx.showToast({
              title: this.data.t('logoutFailed'),
              icon: 'none',
              duration: 2000
            });
          });
        } else {
          console.log('User canceled logout');
        }
      }
    });
  },

  onLanguageChange: function() {
    console.log('Profile page onLanguageChange called')
    this.setData({ t: app.t.bind(app) })
    console.log('Translation function updated')
    this.updatePageTexts()
    this.updateNavBarTitle()
  },

  fetchUserInfo: function() {
    console.log('Fetching user info');
    if (app.globalData.userInfo) {
      console.log('User info found in global data:', app.globalData.userInfo);
      this.setData({
        userInfo: app.globalData.userInfo
      });
    } else {
      console.log('No user info found, attempting to login');
      this.onLogin();
    }
  },

  // 切换到注册界面
  switchToRegister: function() {
    this.setData({ isRegistering: true });
  },

  // 切换登录界面
  switchToLogin: function() {
    this.setData({ isRegistering: false });
  },

  // 处理输入
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  // 注册
  onRegister: async function() {
    const { email, password, nickname } = this.data;
    
    if (!email || !password || !nickname) {
      wx.showToast({
        title: 'Please fill in all fields',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: 'Registering...' });

    // 打印请求数据
    console.log('Register request data:', {
      email,
      nickName: nickname,
      password
    });

    try {
      const response = await app.request({
        url: '/register',
        method: 'POST',
        data: { 
          email, 
          nickName: nickname,
          password
        }
      });

      console.log('Register response:', response);

      wx.hideLoading();
      wx.showToast({
        title: 'Registration successful',
        icon: 'success'
      });

      // 注册成功后自动登录
      this.setData({ 
        isRegistering: false,
        password: '',
        nickname: ''
      });
      
      // 使用注册时的凭据直接登录
      await this.onLogin();

    } catch (error) {
      console.error('Register error:', error);
      wx.hideLoading();
      
      let errorMessage = 'Registration failed';
      if (error.message.includes('用户已存在')) {
        errorMessage = 'Email or nickname already exists';
      } else if (error.statusCode === 500) {
        errorMessage = 'Server error, please try again';
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
    }
  }
})
