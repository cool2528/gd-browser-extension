import { Aria2RpcClient } from './aria2RpcClient';
import { initNetworkSniffer } from './networkSniffer';
import { browserApi } from '@/shared/utils/browserApi';
import { DEFAULT_ARIA2_CONFIG, STORAGE_KEYS, DEFAULT_SETTINGS } from '@/shared/constants';
import { sanitizeFilename } from '@/shared/utils/urlParser';
import type { Message, MessageResponse, Link, SendResult } from '@/shared/types';

/**
 * 全局 aria2 客户端实例
 */
let aria2Client: Aria2RpcClient | null = null;

/**
 * 初始化 aria2 客户端
 */
async function initAria2Client() {
  try {
    const settings = await browserApi.storage.get([STORAGE_KEYS.SETTINGS]);
    const config = settings[STORAGE_KEYS.SETTINGS]?.aria2Config || DEFAULT_ARIA2_CONFIG;
    
    aria2Client = new Aria2RpcClient(config);
    
    if (config.autoConnect) {
      await aria2Client.connect();
      console.log('aria2 client connected');
    }
  } catch (error) {
    console.error('Failed to initialize aria2 client:', error);
  }
}

/**
 * 创建右键菜单
 */
function createContextMenus() {
  chrome.contextMenus.create({
    id: 'download-with-gdownload',
    title: chrome.i18n.getMessage('contextMenuDownload'),
    contexts: ['link', 'image', 'video', 'audio']
  });

  chrome.contextMenus.create({
    id: 'download-all-links',
    title: chrome.i18n.getMessage('contextMenuDownloadAll'),
    contexts: ['page']
  });
}

/**
 * 处理右键菜单点击
 */
async function handleContextMenuClick(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
) {
  if (info.menuItemId === 'download-with-gdownload') {
    const url = info.linkUrl || info.srcUrl;
    if (url && tab?.id) {
      await sendToGDownload([{
        id: Date.now().toString(),
        url,
        filename: url.split('/').pop() || 'download',
        size: null,
        fileType: '',
        selected: true,
        capturedAt: Date.now(),
        source: 'contextMenu'
      }]);
    }
  } else if (info.menuItemId === 'download-all-links' && tab?.id) {
    // 发送消息到 Content Script 捕获所有链接
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'captureAllLinks' },
      () => {
        if (chrome.runtime.lastError) {
          console.debug('[ContextMenu] captureAllLinks message failed:', chrome.runtime.lastError.message);
        }
      }
    );
  }
}

/**
 * 发送链接到 GDownload
 * 返回每个链接的发送结果，一个失败不影响其他链接
 */
async function sendToGDownload(links: Link[]): Promise<SendResult[]> {
  if (!aria2Client) {
    throw new Error('aria2 client not initialized');
  }

  // 获取用户设置
  const result = await browserApi.storage.get([STORAGE_KEYS.SETTINGS]);
  const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;

  const results: SendResult[] = [];
  const seenFilenames = new Set<string>();

  for (const link of links) {
    if (!link.selected) {
      continue;
    }

    try {
      // 1. 清理并去重文件名
      let filename = sanitizeFilename(link.filename);

      // 处理文件名重复
      let counter = 1;
      const originalFilename = filename;
      const lastDotIndex = filename.lastIndexOf('.');
      const baseName = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
      const ext = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

      while (seenFilenames.has(filename)) {
        filename = `${baseName}_${counter}${ext}`;
        counter++;
      }
      seenFilenames.add(filename);

      // 2. 构建 aria2 选项
      const options: Record<string, any> = {
        out: filename
      };

      // 3. 构建请求头数组（根据用户设置决定是否发送）
      const headers: string[] = [];

      // User-Agent (通常安全，默认发送)
      if (link.userAgent && settings.sendUserAgent) {
        headers.push(`User-Agent: ${link.userAgent}`);
      }

      // Referer (对于受保护资源很重要，默认发送)
      if (link.referer && settings.sendReferer) {
        headers.push(`Referer: ${link.referer}`);
      }

      // Cookie (敏感信息，需要用户明确授权，默认关闭)
      if (link.cookies && settings.sendCookies) {
        headers.push(`Cookie: ${link.cookies}`);
      }

      // Authorization (敏感信息，需要用户明确授权，默认关闭)
      if (link.authorization && settings.sendAuthorization) {
        headers.push(`Authorization: ${link.authorization}`);
      }

      // 如果有请求头，添加到选项中
      if (headers.length > 0) {
        options.header = headers;
      }

      // 4. 调用 aria2 添加下载
      // 注意：aria2.addUri 的第一个参数是 URL 数组 [url]，不是嵌套数组
      const gid = await aria2Client.call('aria2.addUri', [link.url], options);

      console.log(`[SendToGDownload] ✓ Added: ${filename} (GID: ${gid})`);
      results.push({ link, success: true, gid });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SendToGDownload] ✗ Failed: ${link.filename}`, errorMessage);
      results.push({
        link,
        success: false,
        error: errorMessage
      });
    }
  }

  // 输出汇总统计
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  console.log(`[SendToGDownload] Summary: ${successCount} succeeded, ${failCount} failed`);

  return results;
}

/**
 * 处理来自其他组件的消息
 */
async function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender
): Promise<MessageResponse> {
  try {
    switch (message.action) {
      case 'sendToGDownload': {
        const results = await sendToGDownload(message.links);
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        const errors = results.filter(r => !r.success).map(r => ({
          filename: r.link.filename,
          error: r.error
        }));

        // 只有全部成功时才返回 success: true
        // 部分失败或全部失败都返回 success: false
        return {
          success: failCount === 0,
          error: failCount > 0 ? `${failCount} link(s) failed to send` : undefined,
          data: {
            total: results.length,
            succeeded: successCount,
            failed: failCount,
            errors: errors.length > 0 ? errors : undefined,
            results // 完整的结果列表，供 UI 展示详细信息
          }
        };
      }

      case 'testConnection':
        if (!aria2Client) {
          await initAria2Client();
        }
        const stats = await aria2Client!.call('aria2.getGlobalStat');
        return { success: true, data: stats };

      case 'getConnectionStatus':
        return {
          success: true,
          data: {
            connected: aria2Client?.isConnected() || false,
            readyState: aria2Client?.getReadyState() || WebSocket.CLOSED
          }
        };

      default:
        return { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    console.error('Message handler error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 扩展安装/更新时的处理
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('GDownload Extension installed');
  createContextMenus();
  initAria2Client();
  initNetworkSniffer(); // 初始化网络嗅探
});

/**
 * 扩展启动时的处理
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('GDownload Extension started');
  initAria2Client();
  initNetworkSniffer(); // 初始化网络嗅探
});

/**
 * 右键菜单点击监听
 */
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

/**
 * 消息监听
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch(error => {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    });
  
  // 返回 true 表示异步响应
  return true;
});
