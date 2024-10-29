const app = getApp()

Page({
  data: {
    currentTab: 'comments', // 或 'meetings'
    comments: [],
    meetings: [],
    isLoading: false,
    hasError: false,
    errorMessage: ''
  },

  onLoad: function(options) {
    const tab = options.tab || 'comments';
    this.setData({ currentTab: tab });
    
    if (tab === 'comments') {
      this.fetchUserComments();
    } else {
      this.fetchUserMeetings();
    }
  },

  fetchUserComments: async function() {
    this.setData({ isLoading: true, hasError: false });
    try {
      const userInfo = app.globalData.userInfo;
      if (!userInfo || !userInfo.id) {
        throw new Error('User not logged in');
      }

      const response = await app.request({
        url: `/user/comments?userId=${userInfo.id}`,
        method: 'GET'
      });

      this.setData({
        comments: response.map(comment => ({
          ...comment,
          formattedTime: this.formatTime(comment.createdAt)
        })),
        isLoading: false
      });
    } catch (error) {
      console.error('Fetch comments error:', error);
      this.setData({
        hasError: true,
        errorMessage: '获取评论失败，请稍后重试',
        isLoading: false
      });
    }
  },

  fetchUserMeetings: async function() {
    this.setData({ isLoading: true, hasError: false });
    try {
      const userInfo = app.globalData.userInfo;
      if (!userInfo || !userInfo.id) {
        throw new Error('User not logged in');
      }

      const response = await app.request({
        url: `/user/meeting-names?userId=${userInfo.id}`,
        method: 'GET'
      });

      this.setData({
        meetings: response,
        isLoading: false
      });
    } catch (error) {
      console.error('Fetch meetings error:', error);
      this.setData({
        hasError: true,
        errorMessage: '获取会议记录失败，请稍后重试',
        isLoading: false
      });
    }
  },

  formatTime: function(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}) 