const app = getApp()

Page({
  data: {
    books: [],
    filteredBooks: [],
    searchKeyword: '',
    t: {}, // 用于存储翻译函数
    bookListText: '',
    addBookText: '',
    authorText: '',
    detailsText: '',
    searchPlaceholder: ''
  },

  onLoad: function() {
    console.log('Booklist page loaded')
    this.setData({ t: app.t.bind(app) })
    console.log('Translation function set:', this.data.t)
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.fetchBooks()
  },

  updatePageTexts: function() {
    console.log('Updating page texts')
    const bookListText = this.data.t('myBookList')
    const addBookText = this.data.t('addBook')
    const authorText = this.data.t('author')
    const detailsText = this.data.t('details')
    const searchPlaceholder = this.data.t('searchBooks')
    
    console.log('Translated texts:', { bookListText, addBookText, authorText, detailsText, searchPlaceholder })
    
    this.setData({
      bookListText,
      addBookText,
      authorText,
      detailsText,
      searchPlaceholder
    })
    
    console.log('Page texts updated:', this.data)
  },

  updateNavBarTitle: function() {
    console.log('Updating nav bar title')
    const title = this.data.t('myBookList') // 修改这里
    console.log('Translated nav bar title:', title)
    wx.setNavigationBarTitle({
      title: title
    })
  },

  fetchBooks: async function() {
    console.log('Fetching books')
    
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
      const url = `${app.globalData.apiBaseUrl}/user/books?userId=${userInfo.id}`;
      console.log('Making request to:', url);
      
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: url,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'X-User-ID': userInfo.id.toString()
          },
          success: (res) => {
            console.log('Raw response:', res);
            if (res.statusCode === 200) {
              resolve(res);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          },
          fail: (error) => {
            console.error('Request failed:', error);
            reject(error);
          }
        });
      });

      console.log('API Response data:', response.data);

      if (response.statusCode === 200) {
        const books = Array.isArray(response.data) ? response.data : [];
        console.log('Processed books:', books);
        this.setData({ 
          books,
          filteredBooks: books
        });
      } else {
        throw new Error(`Server returned ${response.statusCode}`);
      }
    } catch (error) {
      console.error('Fetch books error:', error);
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

  onBookDetail: function(e) {
    const bookId = e.currentTarget.dataset.id;
    console.log('Book detail clicked for book id:', bookId);
    // 找到对应的书籍
    const book = this.data.books.find(b => b.id === bookId);
    if (book) {
      // 使用 wx.showModal 显示书籍详情
      wx.showModal({
        title: book.name,
        content: `${this.data.authorText}: ${book.author}\n\n${this.data.t('abstract')}: ${book.abstract || this.data.t('noAbstract')}`,
        showCancel: false,
        confirmText: this.data.t('ok'),
        confirmColor: '#007AFF'
      });
    } else {
      console.error('Book not found for id:', bookId);
    }
  },

  onAddBook: function() {
    console.log('Add book button clicked');
    wx.navigateTo({
      url: '/pages/createbook/createbook',
      success: (res) => {
        console.log('Navigation to create book page successful', res);
      },
      fail: (err) => {
        console.error('Navigation to create book page failed:', err);
        // 如果导航失败，尝试使用 wx.redirectTo
        wx.redirectTo({
          url: '/pages/createbook/createbook',
          success: (res) => {
            console.log('Redirection to create book page successful', res);
          },
          fail: (redirectErr) => {
            console.error('Redirection to create book page also failed:', redirectErr);
            wx.showToast({
              title: '无法打开创建书目页面',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  onShow: function() {
    console.log('Booklist page onShow')
    app.updateTabBarLanguage()
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.fetchBooks()
  },

  onLanguageChange: function() {
    console.log('Booklist page onLanguageChange called')
    this.setData({ t: app.t.bind(app) })
    console.log('Translation function updated:', this.data.t)
    this.updatePageTexts()
    this.updateNavBarTitle()
    this.fetchBooks()
  },

  onSearchInput: function(e) {
    const searchKeyword = e.detail.value.toLowerCase()
    const filteredBooks = this.data.books.filter(book => 
      book.name.toLowerCase().includes(searchKeyword) || 
      book.author.toLowerCase().includes(searchKeyword)
    )
    this.setData({
      searchKeyword,
      filteredBooks
    })
  },

  onDeleteBook: async function(e) {
    const bookId = e.currentTarget.dataset.id;
    const books = this.data.books;
    const book = books.find(b => b.id === bookId);
    
    if (book.confirmDelete) {
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
            url: `${app.globalData.apiBaseUrl}/user/books/${bookId}?userId=${userInfo.id}`,
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

        // 从列表中移除该书籍
        const updatedBooks = books.filter(b => b.id !== bookId);
        this.setData({
          books: updatedBooks,
          filteredBooks: this.filterBooks(updatedBooks, this.data.searchKeyword)
        });
        
        wx.showToast({
          title: 'Delete Success',
          icon: 'success'
        });
      } catch (error) {
        console.error('Delete book error:', error);
        wx.showToast({
          title: 'Delete Failed',
          icon: 'none'
        });
      }
    } else {
      // 设置确认状态
      const updatedBooks = books.map(b => ({
        ...b,
        confirmDelete: b.id === bookId
      }));
      this.setData({
        books: updatedBooks,
        filteredBooks: this.filterBooks(updatedBooks, this.data.searchKeyword)
      });

      // 3秒后重置确认状态
      setTimeout(() => {
        const resetBooks = this.data.books.map(b => ({
          ...b,
          confirmDelete: false
        }));
        this.setData({
          books: resetBooks,
          filteredBooks: this.filterBooks(resetBooks, this.data.searchKeyword)
        });
      }, 3000);
    }
  },

  filterBooks: function(books, searchKeyword) {
    if (!searchKeyword) {
      return books;
    }
    searchKeyword = searchKeyword.toLowerCase();
    return books.filter(book => 
      book.name.toLowerCase().includes(searchKeyword) || 
      book.author.toLowerCase().includes(searchKeyword)
    );
  }
});
