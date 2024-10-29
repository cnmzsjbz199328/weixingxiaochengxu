const app = getApp()

Page({
  data: {
    email: '',
    password: '',
    t: {},
    emailPlaceholder: '',
    passwordPlaceholder: '',
    loginButtonText: '',
    isRegistering: false,
    nickname: '',
    registerText: '',
    noAccountText: '',
    registerNowText: '',
    hasAccountText: '',
    loginNowText: ''
  },

  onLoad: function() {
    this.setData({ t: app.t.bind(app) })
    this.updatePageTexts()
    
    // 检查是否已经以游客身份登录
    const userInfo = app.globalData.userInfo;
    if (userInfo && userInfo.email === 'guest') {
      console.log('Already logged in as guest');
      // 可以选择显示一些提示信息
      wx.showToast({
        title: '您当前以游客身份浏览',
        icon: 'none',
        duration: 2000
      });
    }
  },

  updatePageTexts: function() {
    const t = this.data.t
    this.setData({
      emailPlaceholder: t('emailPlaceholder'),
      passwordPlaceholder: t('passwordPlaceholder'),
      loginButtonText: t('login'),
      registerText: t('register'),
      noAccountText: t('noAccountText'),
      registerNowText: t('registerNowText'),
      hasAccountText: t('hasAccountText'),
      loginNowText: t('loginNowText'),
      nicknamePlaceholder: t('nicknamePlaceholder')
    })
  },

  onShow: function() {
    this.updatePageTexts()
  },

  onLanguageChange: function() {
    this.setData({ t: app.t.bind(app) })
    this.updatePageTexts()
  },

  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value
    })
  },

  switchToRegister: function() {
    this.setData({ isRegistering: true })
  },

  switchToLogin: function() {
    this.setData({ isRegistering: false })
  },

  onLogin: function() {
    const { email, password } = this.data;
    
    // 如果当前是游客且尝试用相同的凭据登录，直接返回
    const currentUser = app.globalData.userInfo;
    if (currentUser && currentUser.email === 'guest' && 
        email === 'guest' && password === '1') {
      wx.showToast({
        title: '您已经以游客身份登录',
        icon: 'none'
      });
      return;
    }

    if (!email || !password) {
      wx.showToast({
        title: this.data.t('fillAllFields'),
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: this.data.t('loggingIn'),
    })

    app.login(email, password)
      .then(userInfo => {
        wx.hideLoading()
        wx.showToast({
          title: this.data.t('loginSuccess'),
          icon: 'success'
        })
        wx.switchTab({
          url: '/pages/profile/profile'
        })
      })
      .catch(error => {
        wx.hideLoading()
        wx.showToast({
          title: error.message,
          icon: 'none'
        })
      })
  }
})

