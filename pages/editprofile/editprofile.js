const app = getApp()

Page({
  data: {
    userInfo: null,
    errors: {}
  },

  onLoad: function() {
    // 从全局获取用户信息
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      wx.showToast({
        title: 'Please login first',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }
    
    this.setData({ userInfo })
  },

  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    // 清除对应字段的错误
    this.setData({
      [`userInfo.${field}`]: value,
      [`errors.${field}`]: ''
    })
  },

  validateForm: function() {
    const errors = {}
    const { nickName, email } = this.data.userInfo

    if (!nickName || nickName.trim() === '') {
      errors.nickName = 'Please enter your nickname'
    }

    if (!email || email.trim() === '') {
      errors.email = 'Please enter your email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email'
    }

    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  onChooseAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        })
      }
    })
  },

  onSaveProfile: async function() {
    if (!this.validateForm()) {
      return;
    }

    wx.showLoading({ title: 'Saving...' });

    try {
      // 从 storage 获取 sessionId
      const sessionId = wx.getStorageSync('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      // 准备请求数据
      const { nickName, email, avatarUrl } = this.data.userInfo;
      
      const response = await app.request({
        url: '/update-user',
        method: 'POST',
        data: {
          id: sessionId, // 添加用户ID
          nickName,
          email,
          avatarUrl: avatarUrl || ''
        }
      });

      console.log('Profile update response:', response);

      // 更新全局用户信息
      app.updateUserInfo({
        ...app.globalData.userInfo,
        nickName,
        email,
        avatarUrl
      });
      
      wx.hideLoading();
      wx.showToast({
        title: 'Save successful',
        icon: 'success'
      });

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('Save profile error:', error);
      wx.hideLoading();
      
      let errorMessage = 'Save failed';
      if (error.message === 'No session ID found') {
        errorMessage = 'Please login again';
        // 清除会话并返回登录页
        app.clearSession();
        wx.navigateTo({
          url: '/pages/profile/profile'
        });
      } else if (error.statusCode === 401) {
        errorMessage = 'Please login again';
        app.clearSession();
        wx.navigateTo({
          url: '/pages/profile/profile'
        });
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      });
    }
  }
})
