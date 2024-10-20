const app = getApp()

Page({
  data: {
    meetings: [],
    t: {}, // 用于存储翻译函数
    meetingListText: '',
    addMeetingText: '',
    dateText: '',
    timeText: '',
    locationText: '',
    detailsText: ''
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
    const meetingListText = this.data.t('meetingList')
    const addMeetingText = this.data.t('addMeeting')
    const dateText = this.data.t('date')
    const timeText = this.data.t('time')
    const locationText = this.data.t('location')
    const detailsText = this.data.t('details')
    
    console.log('Translated texts:', { meetingListText, addMeetingText, dateText, timeText, locationText, detailsText })
    
    this.setData({
      meetingListText,
      addMeetingText,
      dateText,
      timeText,
      locationText,
      detailsText
    })
    
    console.log('Page texts updated:', this.data)
  },

  updateNavBarTitle: function() {
    console.log('Updating nav bar title')
    const title = this.data.t('meetingList')
    console.log('Translated nav bar title:', title)
    wx.setNavigationBarTitle({
      title: title
    })
  },

  fetchMeetings: function() {
    console.log('Fetching meetings')
    // 这里应该是从服务器获取读书会数据的逻辑
    // 暂时使用模拟数据，但在实际应用中，这里应该是一个API调用
    const meetings = [
      { id: 1, name: '《百年孤独》读书会', date: '2023-05-15', time: '19:00', location: '中央图书馆' },
      { id: 2, name: '《1984》讨论会', date: '2023-05-22', time: '19:30', location: '咖啡馆A' },
      { id: 3, name: '《三体》科幻专场', date: '2023-05-29', time: '20:00', location: '社区中心' }
    ];

    this.setData({ meetings })
    console.log('Meetings fetched:', meetings)
  },

  onMeetingDetail: function(e) {
    const meetingId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/meetingdetail/meetingdetail?id=${meetingId}`
    });
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
        // 如果导航失败，尝试使用 wx.redirectTo
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
  }
});