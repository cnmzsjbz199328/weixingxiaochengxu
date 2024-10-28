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

  onChooseAvatar: async function() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      const tempFilePath = res.tempFilePaths[0];
      console.log('Selected new image:', tempFilePath);
      
      wx.showLoading({ title: 'Uploading...' });

      // 获取旧头像的文件名（如果存在）
      const oldAvatarUrl = this.data.userInfo.avatarUrl;
      console.log('Old avatar URL:', oldAvatarUrl);
      
      let oldFileKey = null;
      if (oldAvatarUrl && oldAvatarUrl.includes(app.globalData.r2BaseUrl)) {
        // 从URL中提取文件名，需要包含完整的路径
        oldFileKey = 'picture/' + oldAvatarUrl.split('picture/')[1];
        console.log('Extracted old file key:', oldFileKey);
      } else {
        console.log('No old avatar from R2 storage found');
      }

      // 上传新头像
      console.log('Starting upload of new avatar...');
      const uploadRes = await new Promise((resolve, reject) => {
        const uploadTask = wx.uploadFile({
          url: `${app.globalData.r2WorkerUrl}/api/upload`,
          filePath: tempFilePath,
          name: 'file',
          header: {
            'content-type': 'multipart/form-data'
          },
          success: resolve,
          fail: reject
        });

        uploadTask.onProgressUpdate((res) => {
          console.log('Upload progress:', res.progress + '%');
        });
      });

      console.log('Upload response:', uploadRes);

      if (uploadRes.statusCode === 200) {
        let result;
        try {
          result = JSON.parse(uploadRes.data);
          console.log('Parsed upload result:', result);
        } catch (parseError) {
          console.error('Parse response error:', parseError, 'Raw response:', uploadRes.data);
          throw new Error('Invalid server response');
        }

        if (result && result.url) {
          // 如果存在旧头像，删除它
          if (oldFileKey) {
            console.log('Attempting to delete old avatar with key:', oldFileKey);
            try {
              const deleteUrl = `${app.globalData.r2WorkerUrl}/api/files/${encodeURIComponent(oldFileKey)}`;
              console.log('Delete URL:', deleteUrl);
              
              const deleteRes = await wx.request({
                url: deleteUrl,
                method: 'DELETE',
                success: (res) => {
                  console.log('Delete success response:', res);
                },
                fail: (error) => {
                  console.error('Delete request failed:', error);
                }
              });
              
              console.log('Delete old avatar full response:', deleteRes);
              
              if (deleteRes.statusCode === 200) {
                console.log('Old avatar deleted successfully');
              } else {
                console.warn('Delete request failed with status:', deleteRes.statusCode, 'Response:', deleteRes.data);
              }
            } catch (deleteError) {
              console.error('Failed to delete old avatar. Error:', deleteError);
            }
          }

          // 更新头像URL
          console.log('Updating avatar URL to:', result.url);
          this.setData({
            'userInfo.avatarUrl': result.url
          });
          
          wx.hideLoading();
          wx.showToast({
            title: 'Avatar uploaded',
            icon: 'success'
          });
        } else {
          throw new Error('No URL in response');
        }
      } else {
        throw new Error(`Upload failed with status ${uploadRes.statusCode}`);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || 'Upload failed',
        icon: 'none',
        duration: 2000
      });
    }
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
