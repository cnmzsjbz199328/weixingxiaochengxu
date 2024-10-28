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
    const meetingListText = this.data.t('myMeetingList')
    const addMeetingText = this.data.t('addMeeting')
    const dateText = this.data.t('date')
    const timeText = this.data.t('time')
    const locationText = this.data.t('location')
    const searchPlaceholder = this.data.t('searchMeetings')
    
    console.log('Translated texts:', { meetingListText, addMeetingText, dateText, timeText, locationText, searchPlaceholder })
    
    this.setData({
      meetingListText,
      addMeetingText,
      dateText,
      timeText,
      locationText,
      searchPlaceholder
    })
    
    console.log('Page texts updated:', this.data)
  },

  updateNavBarTitle: function() {
    console.log('Updating nav bar title')
    const title = this.data.t('myMeetingList')
    console.log('Translated nav bar title:', title)
    wx.setNavigationBarTitle({
      title: title
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
        // 添加参与状态标记
        const meetingsWithParticipation = meetings.map(meeting => ({
          ...meeting,
          isParticipating: false // 默认未参与
        }));
        
        // 获取用户参与的会议列表
        const participatingResponse = await wx.request({
          url: `${app.globalData.apiBaseUrl}/user/meetings/participating?userId=${userInfo.id}`,
          method: 'GET',
          header: {
            'X-User-ID': userInfo.id.toString()
          }
        });

        if (participatingResponse.statusCode === 200) {
          const participatingMeetings = new Set(participatingResponse.data.map(m => m.id));
          meetingsWithParticipation.forEach(meeting => {
            meeting.isParticipating = participatingMeetings.has(meeting.id);
          });
        }

        this.setData({ 
          meetings: meetingsWithParticipation,
          filteredMeetings: meetingsWithParticipation
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
    app.updateTabBarLanguage()
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.fetchMeetings()
  },

  onLanguageChange: function() {
    console.log('Meetinglist page onLanguageChange called')
    this.setData({ t: app.t.bind(app) })
    console.log('Translation function updated:', this.data.t)
    this.updatePageTexts()
    this.updateNavBarTitle()
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
  },

  toggleParticipation: async function(e) {
    const meetingId = e.currentTarget.dataset.id;
    const userInfo = app.globalData.userInfo;
    
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: 'Please login first',
        icon: 'none'
      });
      return;
    }

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/user/meetings/${meetingId}/toggle?userId=${userInfo.id}`,
          method: 'POST',
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

      // 更新本地状态
      const updatedMeetings = this.data.meetings.map(meeting => {
        if (meeting.id === meetingId) {
          return {
            ...meeting,
            isParticipating: !meeting.isParticipating
          };
        }
        return meeting;
      });

      this.setData({
        meetings: updatedMeetings,
        filteredMeetings: this.filterMeetings(updatedMeetings, this.data.searchKeyword)
      });

      wx.showToast({
        title: response.data.action === 'join' ? 'Joined' : 'Left',
        icon: 'success'
      });
    } catch (error) {
      console.error('Toggle participation error:', error);
      wx.showToast({
        title: 'Operation failed',
        icon: 'none'
      });
    }
  }
});
