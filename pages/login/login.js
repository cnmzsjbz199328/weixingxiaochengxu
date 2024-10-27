const app = getApp()

Page({
  data: {
    email: '',
    password: '',
    t: {}
  },

  onLoad: function() {
    this.setData({ t: app.t.bind(app) })
    this.updatePageTexts()
  },

  updatePageTexts: function() {
    this.setData({
      emailPlaceholder: this.data.t('emailPlaceholder'),
      passwordPlaceholder: this.data.t('passwordPlaceholder'),
      loginButtonText: this.data.t('login')
    })
  },

  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value
    })
  },

  onLogin: function() {
    const { email, password } = this.data
    if (!email || !password) {
      wx.showToast({
        title: this.data.t('fillAllFields'),
        icon: 'none'
      })
      return
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

