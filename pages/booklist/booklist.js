const app = getApp()

Page({
  data: {
    books: [],
    t: {}, // 用于存储翻译函数
    bookListText: '',
    addBookText: '',
    authorText: '',
    detailsText: ''
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
    const bookListText = this.data.t('bookList')
    const addBookText = this.data.t('addBook')
    const authorText = this.data.t('author')
    const detailsText = this.data.t('details')
    
    console.log('Translated texts:', { bookListText, addBookText, authorText, detailsText })
    
    this.setData({
      bookListText,
      addBookText,
      authorText,
      detailsText
    })
    
    console.log('Page texts updated:', this.data)
  },

  updateNavBarTitle: function() {
    console.log('Updating nav bar title')
    const title = this.data.t('bookList')
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
      { id: 1, name: '百年孤独', author: '加西亚·马尔克斯', isbn: '9787544253994' },
      { id: 2, name: '1984', author: '乔治·奥威尔', isbn: '9787532751631' },
      { id: 3, name: '三体', author: '刘慈欣', isbn: '9787229030933' }
    ];

    this.setData({ books })
    console.log('Books fetched:', books)
  },

  onBookDetail: function(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/bookdetail/bookdetail?id=${bookId}`
    });
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
  }
});
