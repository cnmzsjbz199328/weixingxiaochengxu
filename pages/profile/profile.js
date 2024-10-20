// pages/profile/profile.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      userId: '',
      joinDate: '',
      meetingsCount: 0,
      booksCount: 0
    },
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
    this.fetchUserInfo()
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

  fetchUserInfo: function() {
    console.log('Fetching user info')
    // 这里应该是从服务器或本地存储获取用户信息的逻辑
    // 暂时使用模拟数据
    this.setData({
      userInfo: {
        avatarUrl: '/images/default-avatar.png',
        nickName: '示例用户',
        userId: 'user123',
        joinDate: '2023年1月1日',
        meetingsCount: 5,
        booksCount: 10
      }
    });
    console.log('User info fetched:', this.data.userInfo)
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
    console.log('Logout button clicked')
    wx.showModal({
      title: this.data.t('logout'),
      content: this.data.t('logoutConfirmation'),
      success: (res) => {
        if (res.confirm) {
          console.log('User confirmed logout')
          // 执行退出登录操作
          wx.clearStorage();
          wx.reLaunch({
            url: '/pages/index/index'
          });
        } else {
          console.log('User canceled logout')
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
  }
})
