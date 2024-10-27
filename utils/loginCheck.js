const logger = require('./logger')

class LoginCheck {
  static async checkLoginStatus() {
    try {
      logger.info('开始检查登录状态');
      
      // 1. 检查本地存储的登录态
      const sessionData = wx.getStorageSync('sessionData');
      const userInfo = wx.getStorageSync('userInfo');
      
      if (!sessionData || !userInfo) {
        logger.warn('本地未找到登录信息');
        return { success: false, error: 'NO_LOCAL_SESSION' };
      }
      
      // 2. 检查登录态是否过期
      try {
        const checkResult = await wx.checkSession();
        logger.debug('登录态检查结果:', checkResult);
      } catch (error) {
        logger.warn('登录态已过期');
        return { success: false, error: 'SESSION_EXPIRED' };
      }
      
      // 暂时跳过服务端会话验证
      logger.info('登录状态检查通过');
      return { success: true, userInfo };
      
    } catch (error) {
      logger.error('登录检查过程出错:', error);
      return { success: false, error: 'CHECK_PROCESS_ERROR' };
    }
  }
}

module.exports = LoginCheck;
