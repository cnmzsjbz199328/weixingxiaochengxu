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

  fetchBooks: function() {
    console.log('Fetching books')
    // 这里应该是从服务器获取书目数据的逻辑
    // 暂时使用模拟数据，但在实际应用中，这里应该是一个API调用
    const books = [
      { id: 1, name: '百年孤独', author: '加西亚·马尔克斯', abstract: '讲述了布恩迪亚家族七代人的传奇故事...' },
      { id: 2, name: '1984', author: '乔治·奥威尔', abstract: '描绘了一个极权主义社会的黑暗图景...' },
      { id: 3, name: '三体', author: '刘慈欣', abstract: '描述了地球人类文明和三体文明的首次接触...' }
    ];

    this.setData({ 
      books,
      filteredBooks: books
    })
    console.log('Books fetched:', books)
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
  }
});
