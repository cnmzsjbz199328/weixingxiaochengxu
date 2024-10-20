Page({
  data: {
    meeting: null,
    isParticipating: false,
    comments: [],
    newComment: ''
  },

  onLoad(options) {
    this.fetchMeetingDetails(options.id);
    this.checkParticipationStatus(options.id);
    this.fetchComments(options.id);
  },

  async fetchMeetingDetails(meetingId) {
    // 从云数据库获取会议详情
    // 实现此功能
  },

  async checkParticipationStatus(meetingId) {
    // 检查用户是否已参与该会议
    // 实现此功能
  },

  async toggleParticipation() {
    const { meeting, isParticipating } = this.data;
    try {
      await wx.cloud.callFunction({
        name: 'toggleParticipation',
        data: { meetingId: meeting._id, participate: !isParticipating }
      });

      this.setData({
        isParticipating: !isParticipating
      });

      wx.showToast({
        title: isParticipating ? '已取消参与' : '已确认参与',
        icon: 'success'
      });
    } catch (error) {
      console.error('更新参与状态失败', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  async fetchComments(meetingId) {
    // 从云数据库获取评论列表
    // 实现此功能
  },

  onCommentInput(e) {
    this.setData({
      newComment: e.detail.value
    });
  },

  async submitComment() {
    const { meeting, newComment } = this.data;
    if (!newComment.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    try {
      await wx.cloud.callFunction({
        name: 'addComment',
        data: { meetingId: meeting._id, content: newComment }
      });

      wx.showToast({
        title: '评论成功',
        icon: 'success'
      });

      this.setData({
        newComment: ''
      });

      this.fetchComments(meeting._id);
    } catch (error) {
      console.error('提交评论失败', error);
      wx.showToast({
        title: '评论失败，请重试',
        icon: 'none'
      });
    }
  }
});
