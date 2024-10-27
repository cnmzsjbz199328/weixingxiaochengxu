const logger = {
  error: function(message, data = null) {
    console.error(`[ERROR] ${message}`, data ? data : '');
    // 这里可以添加上报错误到服务器的逻辑
  },
  
  warn: function(message, data = null) {
    console.warn(`[WARN] ${message}`, data ? data : '');
  },
  
  info: function(message, data = null) {
    console.info(`[INFO] ${message}`, data ? data : '');
  },
  
  debug: function(message, data = null) {
    console.log(`[DEBUG] ${message}`, data ? data : '');
  }
};

module.exports = logger;
