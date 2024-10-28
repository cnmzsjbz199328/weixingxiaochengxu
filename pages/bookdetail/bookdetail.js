const app = getApp()

Page({
  data: {
    book: null,
    comments: [],
    newComment: '',
    isLoading: false,
    hasError: false,
    errorMessage: '',
    isLoadingComments: false,
    commentError: '',
    canSubmit: false  // 添加新的状态控制变量
  },

  onLoad: function(options) {
    if (!options.id) {
      console.error('No book ID provided');
      this.setData({
        hasError: true,
        errorMessage: 'Invalid book ID'
      });
      return;
    }
    console.log('Loading book details for ID:', options.id);
    this.fetchBookDetail(options.id);
    this.fetchComments(options.id);
  },

  fetchBookDetail: async function(bookId) {
    this.setData({ isLoading: true, hasError: false });
    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          // 修改 API 路径，移除 'user' 部分
          url: `${app.globalData.apiBaseUrl}/books/${bookId}`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json'
          },
          success: resolve,
          fail: reject
        });
      });

      console.log('Book detail response:', response);

      if (response.statusCode === 200 && response.data) {
        this.setData({ 
          book: response.data,
          isLoading: false
        });
        // 设置导航栏标题
        wx.setNavigationBarTitle({
          title: response.data.name || 'Book Detail'
        });
      } else {
        throw new Error(`Server returned ${response.statusCode}`);
      }
    } catch (error) {
      console.error('Fetch book detail error:', error);
      this.setData({
        hasError: true,
        errorMessage: '获取书籍详情失败，请稍后重试',
        isLoading: false
      });
      
      // 显示错误提示
      wx.showToast({
        title: '获取书籍详情失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  fetchComments: async function(bookId) {
    try {
      this.setData({ isLoadingComments: true });
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/books/${bookId}/comments`,
          method: 'GET',
          header: {
            'Content-Type': 'application/json'
          },
          success: resolve,
          fail: reject
        });
      });

      console.log('Comments response:', response);

      if (response.statusCode === 200) {
        // 确保 comments 是一个数组
        const comments = Array.isArray(response.data) ? response.data : 
                        (response.data.comments || []);
        
        // 格式化评论时间
        const formattedComments = comments.map(comment => ({
          ...comment,
          formattedTime: this.formatCommentTime(comment.createdAt)
        }));
        
        this.setData({ 
          comments: formattedComments,
          isLoadingComments: false
        });
      } else {
        throw new Error('获取评论失败');
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
      this.setData({
        isLoadingComments: false,
        commentError: '获取评论失败，请稍后重试'
      });
    }
  },

  onCommentInput: function(e) {
    const value = e.detail.value;
    this.setData({
      newComment: value,
      canSubmit: value.trim().length > 0  // 根据输入内容更新按钮状态
    });
  },

  submitComment: async function() {
    // 添加输入验证
    if (!this.data.newComment.trim()) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }

    const userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/books/comment`,
          method: 'POST',
          data: {
            userId: userInfo.id,
            bookId: this.data.book.id,
            content: this.data.newComment
          },
          header: {
            'Content-Type': 'application/json'
          },
          success: resolve,
          fail: reject
        });
      });

      if (response.statusCode === 200 || response.statusCode === 201) {
        // 清空输入框并更新按钮状态
        this.setData({ 
          newComment: '',
          canSubmit: false
        });
        
        // 重新获取评论列表
        await this.fetchComments(this.data.book.id);
        
        wx.showToast({
          title: '评论发表成功',
          icon: 'success'
        });
      } else {
        throw new Error('评论发表失败');
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      wx.showToast({
        title: '评论发表失败，请重试',
        icon: 'none'
      });
    }
  },

  formatCommentTime: function(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
});
