// pages/profile/profile.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    userInfo: null,
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
  onLoad(options) {
    console.log('Profile page loaded')
    this.setData({ t: app.t.bind(app) })
    console.log('Translation function set:', this.data.t)
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.checkLogin()
  },

  updatePageTexts: function() {
    console.log('Updating profile page texts')
    const booksReadText = this.data.t('booksRead')
    const meetingsAttendedText = this.data.t('meetingsAttended')
    const editProfileText = this.data.t('editProfile')
    const viewHistoryText = this.data.t('viewHistory')
    const settingsText = this.data.t('settings')
    const logoutText = this.data.t('logout')
    
    console.log('Translated texts:', { booksReadText, meetingsAttendedText, editProfileText, viewHistoryText, settingsText, logoutText })
    
    this.setData({
      booksReadText,
      meetingsAttendedText,
      editProfileText,
      viewHistoryText,
      settingsText,
      logoutText
    })
    console.log('Profile page texts updated:', this.data)
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
    // 清除之前的登录信息
    wx.removeStorageSync('userInfo');
    this.setData({
      userInfo: null
    });
  },

  onLogin: function() {
    console.log('Login button clicked');
    wx.showLoading({
      title: '登录中...',
    });
    
    app.login().then(userInfo => {
      console.log('Login successful, updating UI with user info:', userInfo);
      this.setData({
        userInfo: userInfo
      });
      wx.hideLoading();
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    }).catch(error => {
      console.error('Login failed:', error);
      wx.hideLoading();
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
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
  }
})
