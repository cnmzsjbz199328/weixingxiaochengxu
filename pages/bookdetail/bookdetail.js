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
    canSubmit: false,
    t: {},
    bookAuthorText: '',
    bookIntroText: '',
    readerCommentsText: '',
    writeCommentText: '',
    submitCommentText: '',
    noCommentsText: '',
    anonymousUserText: '',
    charactersText: ''
  },

  onLoad: function(options) {
    const t = app.t.bind(app)
    this.setData({ t: t })
    this.updatePageTexts()
    
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

  updatePageTexts: function() {
    const t = this.data.t
    this.setData({
      bookAuthorText: t('bookAuthor'),
      bookIntroText: t('bookIntro'),
      readerCommentsText: t('readerComments'),
      writeCommentText: t('writeComment'),
      submitCommentText: t('submitComment'),
      noCommentsText: t('noComments'),
      anonymousUserText: t('anonymousUser'),
      charactersText: t('characters')
    })
  },

  onLanguageChange: function() {
    const t = app.t.bind(app)
    this.setData({ t: t })
    this.updatePageTexts()
    if (this.data.book) {
      wx.setNavigationBarTitle({
        title: this.data.book.name || 'Book Detail'
      });
    }
  },

  onShow: function() {
    this.onLanguageChange();
  },

  fetchBookDetail: async function(bookId) {
    this.setData({ isLoading: true, hasError: false });
    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
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
        const comments = Array.isArray(response.data) ? response.data : 
                        (response.data.comments || []);
        
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
      canSubmit: value.trim().length > 0
    });
  },

  submitComment: async function() {
    const t = this.data.t;
    if (!this.data.newComment.trim()) {
      wx.showToast({
        title: t('commentEmpty'),
        icon: 'none'
      });
      return;
    }

    const userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: t('pleaseLogin'),
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
        this.setData({ 
          newComment: '',
          canSubmit: false
        });
        
        await this.fetchComments(this.data.book.id);
        
        wx.showToast({
          title: t('commentSuccess'),
          icon: 'success'
        });
      } else {
        throw new Error(t('commentFailed'));
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      wx.showToast({
        title: t('commentFailed'),
        icon: 'none'
      });
    }
  },

  formatCommentTime: function(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
});
