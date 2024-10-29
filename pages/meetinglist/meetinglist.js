const app = getApp()

Page({
  data: {
    meetings: [],
    filteredMeetings: [],
    searchKeyword: '',
    t: {}, // 用于存储翻译函数
    meetingListText: '',
    addMeetingText: '',
    dateText: '',
    timeText: '',
    locationText: '',
    searchPlaceholder: ''
  },

  onLoad: function() {
    console.log('Meetinglist page loaded')
    this.setData({ t: app.t.bind(app) })
    console.log('Translation function set:', this.data.t)
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.fetchMeetings()
  },

  updatePageTexts: function() {
    console.log('Updating page texts')
    const t = this.data.t
    this.setData({
      meetingListText: t('myMeetingList'),
      addMeetingText: t('addMeeting'),
      dateText: t('date'),
      timeText: t('time'),
      locationText: t('location'),
      searchPlaceholder: t('searchMeetings')
    })

    // 更新导航栏标题
    wx.setNavigationBarTitle({
      title: t('myMeetingList')
    })
  },

  updateNavBarTitle: function() {
    console.log('Updating nav bar title')
    wx.setNavigationBarTitle({
      title: this.data.t('myMeetingList')
    })
  },

  fetchMeetings: async function() {
    console.log('Fetching meetings')
    
    // 获取用户ID
    const userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.id) {
      console.error('No user info found');
      wx.showToast({
        title: this.data.t('pleaseLogin'),
        icon: 'none'
      });
      return;
    }

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/user/meetings?userId=${userInfo.id}`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'X-User-ID': userInfo.id.toString()
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(res);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          },
          fail: reject
        });
      });

      if (response.statusCode === 200) {
        const meetings = Array.isArray(response.data) ? response.data : [];
        this.setData({ 
          meetings,
          filteredMeetings: meetings
        });
      } else {
        throw new Error(`Server returned ${response.statusCode}`);
      }
    } catch (error) {
      console.error('Fetch meetings error:', error);
      let errorMessage = this.data.t('fetchFailed');
      if (error.message === 'Unauthorized') {
        errorMessage = this.data.t('pleaseLogin');
        app.clearSession();
      }
      wx.showToast({
        title: errorMessage,
        icon: 'none'
      });
    }
  },

  onSearchInput: function(e) {
    const searchKeyword = e.detail.value.toLowerCase()
    const filteredMeetings = this.data.meetings.filter(meeting => 
      meeting.name.toLowerCase().includes(searchKeyword) || 
      meeting.location.toLowerCase().includes(searchKeyword)
    )
    this.setData({
      searchKeyword,
      filteredMeetings
    })
  },

  onAddMeeting: function() {
    console.log('Add meeting button clicked');
    wx.navigateTo({
      url: '/pages/createmeeting/createmeeting',
      success: (res) => {
        console.log('Navigation to create meeting page successful', res);
      },
      fail: (err) => {
        console.error('Navigation to create meeting page failed:', err);
        wx.redirectTo({
          url: '/pages/createmeeting/createmeeting',
          success: (res) => {
            console.log('Redirection to create meeting page successful', res);
          },
          fail: (redirectErr) => {
            console.error('Redirection to create meeting page also failed:', redirectErr);
            wx.showToast({
              title: '无法打开创建会议页面',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  onShow: function() {
    console.log('Meetinglist page onShow')
    this.updatePageTexts()
    app.updateTabBarLanguage()
    this.fetchMeetings()
  },

  onLanguageChange: function() {
    console.log('Meetinglist page onLanguageChange called')
    this.setData({ t: app.t.bind(app) })
    this.updatePageTexts()
    this.fetchMeetings()
  },

  onDeleteMeeting: async function(e) {
    const meetingId = e.currentTarget.dataset.id;
    const meetings = this.data.meetings;
    const meeting = meetings.find(m => m.id === meetingId);
    
    if (meeting.confirmDelete) {
      try {
        const userInfo = app.globalData.userInfo;
        if (!userInfo || !userInfo.id) {
          wx.showToast({
            title: 'Please login first',
            icon: 'none'
          });
          return;
        }

        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: `${app.globalData.apiBaseUrl}/user/meetings/${meetingId}?userId=${userInfo.id}`,
            method: 'DELETE',
            header: {
              'Content-Type': 'application/json',
              'X-User-ID': userInfo.id.toString()
            },
            success: (res) => {
              if (res.statusCode === 200 || res.statusCode === 204) {
                resolve(res);
              } else {
                reject(new Error(`HTTP ${res.statusCode}`));
              }
            },
            fail: reject
          });
        });

        // 从列表中移除该会议
        const updatedMeetings = meetings.filter(m => m.id !== meetingId);
        this.setData({
          meetings: updatedMeetings,
          filteredMeetings: this.filterMeetings(updatedMeetings, this.data.searchKeyword)
        });
        
        wx.showToast({
          title: 'Delete Success',
          icon: 'success'
        });
      } catch (error) {
        console.error('Delete meeting error:', error);
        wx.showToast({
          title: 'Delete Failed',
          icon: 'none'
        });
      }
    } else {
      // 设置确认状态
      const updatedMeetings = meetings.map(m => ({
        ...m,
        confirmDelete: m.id === meetingId
      }));
      this.setData({
        meetings: updatedMeetings,
        filteredMeetings: this.filterMeetings(updatedMeetings, this.data.searchKeyword)
      });

      // 3秒后重置确认状态
      setTimeout(() => {
        const resetMeetings = this.data.meetings.map(m => ({
          ...m,
          confirmDelete: false
        }));
        this.setData({
          meetings: resetMeetings,
          filteredMeetings: this.filterMeetings(resetMeetings, this.data.searchKeyword)
        });
      }, 3000);
    }
  },

  filterMeetings: function(meetings, searchKeyword) {
    if (!searchKeyword) {
      return meetings;
    }
    searchKeyword = searchKeyword.toLowerCase();
    return meetings.filter(meeting => 
      meeting.name.toLowerCase().includes(searchKeyword) || 
      meeting.location.toLowerCase().includes(searchKeyword)
    );
  }
})