import { LinkCaptureService } from './linkCapture';
import { browserApi } from '@/shared/utils/browserApi';
import { STORAGE_KEYS } from '@/shared/constants';
import type { Link, Message } from '@/shared/types';

/**
 * 链接捕获服务实例
 */
const linkCapture = new LinkCaptureService();

/**
 * 存储捕获的链接
 */
let capturedLinks: Link[] = [];

/**
 * 保存链接到存储
 * 自动去重：相同 URL 的链接只保留最新的一个
 */
async function saveLinks(links: Link[]) {
  // 使用 Map 进行去重，key 为 URL，value 为 Link 对象
  const urlMap = new Map<string, Link>();

  // 先添加现有链接
  capturedLinks.forEach(link => {
    urlMap.set(link.url, link);
  });

  // 添加新链接（如果 URL 相同，新链接会覆盖旧链接，保留最新信息）
  links.forEach(link => {
    urlMap.set(link.url, link);
  });

  // 转换回数组并更新
  capturedLinks = Array.from(urlMap.values());

  await browserApi.storage.set({
    [STORAGE_KEYS.LINKS]: capturedLinks
  });

  console.log(`Captured ${links.length} new links, total: ${capturedLinks.length} (deduplicated)`);
}

/**
 * 处理来自 Background 的消息
 */
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.action === 'captureAllLinks') {
    // 停止现有监听
    linkCapture.stopCapture();
    linkCapture.clear();
    capturedLinks = [];
    
    // 重新捕获
    linkCapture.startCapture((links) => {
      saveLinks(links);
    });
    
    sendResponse({ success: true });
  }
  
  return true;
});

/**
 * 页面加载完成后自动开始捕获
 */
async function init() {
  const settings = await browserApi.storage.get([STORAGE_KEYS.SETTINGS]);
  const autoCapture = settings[STORAGE_KEYS.SETTINGS]?.autoCapture ?? true;
  
  if (autoCapture) {
    linkCapture.startCapture((links) => {
      saveLinks(links);
    });
  }
}

// 页面加载完成时初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
