/**
 * 清除扩展存储数据的脚本
 * 在浏览器开发者工具的 Console 中运行此脚本
 * 
 * 使用方法：
 * 1. 打开扩展的 Popup 页面
 * 2. 右键点击 Popup，选择"检查"（Inspect）
 * 3. 在 Console 标签中粘贴并运行此脚本
 */

(async function clearExtensionStorage() {
  console.log('🧹 开始清除扩展存储数据...');
  
  try {
    // 清除所有存储的链接
    await chrome.storage.local.remove('gdownload_links');
    console.log('✅ 已清除链接数据');
    
    // 可选：清除所有存储数据
    // await chrome.storage.local.clear();
    // console.log('✅ 已清除所有存储数据');
    
    // 刷新页面以反映变化
    window.location.reload();
    
    console.log('✅ 存储数据已清除，页面已刷新');
  } catch (error) {
    console.error('❌ 清除存储数据时出错:', error);
  }
})();
