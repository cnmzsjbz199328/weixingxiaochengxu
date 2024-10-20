Component({
  methods: {
    switchLanguage() {
      const app = getApp()
      const newLang = app.globalData.language === 'zh' ? 'en' : 'zh'
      app.switchLanguage(newLang)
      
      // 触发一个自定义事件，通知父组件语言已更改
      this.triggerEvent('languageChanged', { language: newLang })
    }
  }
})
