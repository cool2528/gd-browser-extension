import type { Link, ExtensionSettings } from '@/shared/types';
import { browserApi } from '@/shared/utils/browserApi';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/shared/constants';
import { isBlacklisted, getDomain } from '@/shared/utils/urlParser';

/**
 * 设置缓存机制（避免在 webRequest 热路径频繁访问 storage）
 */
let cachedSettings: ExtensionSettings = DEFAULT_SETTINGS;
let settingsLastLoaded = 0;
const SETTINGS_CACHE_TTL = 5000; // 5 秒缓存

/**
 * 获取设置（带缓存）
 */
async function getSettings(): Promise<ExtensionSettings> {
  const now = Date.now();
  if (now - settingsLastLoaded < SETTINGS_CACHE_TTL) {
    return cachedSettings;
  }

  const result = await browserApi.storage.get([STORAGE_KEYS.SETTINGS]);
  cachedSettings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
  settingsLastLoaded = now;
  return cachedSettings;
}

/**
 * 监听设置变化，立即更新缓存
 */
browserApi.storage.onChanged.addListener((changes: Record<string, chrome.storage.StorageChange>, areaName?: chrome.storage.AreaName) => {
  if (areaName && areaName !== 'local') {
    return;
  }
  if (changes[STORAGE_KEYS.SETTINGS]) {
    cachedSettings = changes[STORAGE_KEYS.SETTINGS].newValue || DEFAULT_SETTINGS;
    settingsLastLoaded = Date.now();
    console.log('[NetworkSniffer] Settings updated, cache refreshed');
  }
});


/**
 * 捕获的请求信息
 * 用于聚合网络请求的上下文信息
 */
interface CapturedRequest {
  requestId: string;
  tabId: number;
  url: string;
  finalUrl: string;
  method: string;
  type: chrome.webRequest.ResourceType;
  redirectChain: string[];

  // 请求头（仅内存保留，不持久化）
  referer?: string;
  userAgent?: string;
  cookies?: string;
  authorization?: string;
  accept?: string;

  // 响应头
  contentType?: string;
  contentLength?: number;
  contentDisposition?: string;
  isAttachment: boolean;
  acceptRanges?: string;

  // 派生字段
  suggestedFilename?: string;
  extension?: string;
  timestamp: number;
}

/**
 * 请求缓存（按 requestId 索引）
 * 用于聚合 webRequest 各阶段的信息
 */
const requestCache = new Map<string, CapturedRequest>();

/**
 * 定时清理过期请求（避免内存泄漏）
 */
const CACHE_CLEANUP_INTERVAL = 60000; // 1 分钟
const CACHE_MAX_AGE = 300000; // 5 分钟

setInterval(() => {
  const now = Date.now();
  for (const [requestId, request] of requestCache.entries()) {
    if (now - request.timestamp > CACHE_MAX_AGE) {
      requestCache.delete(requestId);
    }
  }
}, CACHE_CLEANUP_INTERVAL);

/**
 * 解析 Content-Disposition 头部获取文件名
 * 支持 RFC 5987/6266 的 filename* 和 filename
 */
function parseContentDisposition(header: string): string | undefined {
  if (!header) return undefined;

  // 优先解析 filename* (RFC 5987)
  // 格式: filename*=UTF-8''filename.ext 或 filename*=ISO-8859-1''filename.ext
  const filenameStarMatch = header.match(/filename\*\s*=\s*([^']*)'([^']*)'(.+)/i);
  if (filenameStarMatch) {
    try {
      const charset = filenameStarMatch[1] || 'UTF-8';
      const filename = filenameStarMatch[3];
      // 解码 URL 编码的文件名
      return decodeURIComponent(filename);
    } catch (e) {
      console.warn('Failed to parse filename*:', e);
    }
  }

  // 回退到 filename (RFC 2616)
  // 格式: filename="filename.ext" 或 filename=filename.ext
  const filenameMatch = header.match(/filename\s*=\s*"?([^";\n]+)"?/i);
  if (filenameMatch) {
    try {
      return decodeURIComponent(filenameMatch[1].trim());
    } catch (e) {
      return filenameMatch[1].trim();
    }
  }

  return undefined;
}

/**
 * 从 URL 查询参数中提取文件名
 * 支持常见的查询参数键
 */
function extractFilenameFromQueryParams(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // 常见的文件名参数键
    const filenameKeys = [
      'filename',
      'attname',
      'response-content-disposition',
      'download',
      'dl',
      'file',
      'name'
    ];

    for (const key of filenameKeys) {
      const value = params.get(key);
      if (value) {
        // 如果是 response-content-disposition，需要再解析
        if (key === 'response-content-disposition') {
          const parsed = parseContentDisposition(value);
          if (parsed) return parsed;
        }
        // dl=1 这种布尔参数跳过
        if (value === '1' || value === '0' || value === 'true' || value === 'false') {
          continue;
        }
        return decodeURIComponent(value);
      }
    }
  } catch (e) {
    console.warn('Failed to extract filename from query params:', e);
  }

  return undefined;
}

/**
 * 根据 Content-Type 推断文件扩展名
 */
function getExtensionFromMimeType(mimeType: string): string | undefined {
  const mimeMap: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
    'application/x-tar': '.tar',
    'application/gzip': '.gz',
    'application/x-bzip2': '.bz2',
    'video/mp4': '.mp4',
    'video/x-matroska': '.mkv',
    'video/x-msvideo': '.avi',
    'video/quicktime': '.mov',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/flac': '.flac',
    'audio/wav': '.wav',
    'audio/aac': '.aac',
    'audio/ogg': '.ogg',
    'audio/x-m4a': '.m4a',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/svg+xml': '.svg',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx'
  };

  return mimeMap[mimeType.toLowerCase()];
}

/**
 * 判断是否为下载候选
 * 使用多层启发式规则，并应用用户设置过滤
 */
async function isDownloadCandidate(request: CapturedRequest): Promise<boolean> {
  // 1. 强指示：Content-Disposition: attachment
  if (request.isAttachment) {
    return await applyUserFilters(request);
  }

  // 2. 有明确的文件名建议
  if (request.suggestedFilename) {
    return await applyUserFilters(request);
  }

  // 3. 排除页面导航
  if (request.type === 'main_frame' || request.type === 'sub_frame') {
    return false;
  }

  // 4. 获取用户设置（使用缓存）
  const settings = await getSettings();

  // 5. MIME 类型下载白名单（明确的下载类型，不受体积限制）
  if (request.contentType) {
    const downloadMimeTypes = [
      'application/octet-stream',
      'application/zip',
      'application/x-rar',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-bzip2',
      'application/pdf',
      'video/',
      'audio/',
      'application/vnd.ms-',
      'application/vnd.openxmlformats-',
      'application/x-executable',
      'application/x-msi',
      'application/x-iso9660-image'
    ];

    const type = request.contentType.toLowerCase();
    if (downloadMimeTypes.some(mime => type.includes(mime))) {
      return await applyUserFilters(request);
    }
  }

  // 6. 排除图片类型的资源（除非明确是大文件或有附件指示）
  // 注意：必须在 MIME 类型排除之前检查，否则所有图片都会被提前过滤
  if (request.type === 'image') {
    // 只有大于 10MB 的图片才考虑为下载（例如高清壁纸、RAW 照片等）
    const imageThreshold = 10 * 1024 * 1024; // 10 MB
    if (!request.contentLength || request.contentLength < imageThreshold) {
      return false;
    }
    // 大图片通过检查，继续后续过滤流程
  }

  // 7. 排除明显的非下载类型（API 响应、网页资源等）
  if (request.contentType) {
    const excludedMimeTypes = [
      'text/html',
      'text/plain',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'application/xml',
      'text/xml',
      'image/x-icon' // favicon（小图标总是排除）
      // 注意：其他图片类型已在步骤 6 中基于大小过滤，这里不再重复排除
    ];

    const type = request.contentType.toLowerCase();
    if (excludedMimeTypes.some(mime => type.includes(mime))) {
      return false;
    }
  }

  // 7. 体量阈值（对于不在白名单中的类型，使用体积判断）
  // 设置一个合理的最小阈值，避免误捕获小资源
  const reasonableMinSize = 100 * 1024; // 100 KB
  const effectiveMinSize = Math.max(settings.minFileSize, reasonableMinSize);

  if (request.contentLength !== undefined && request.contentLength >= effectiveMinSize) {
    return await applyUserFilters(request);
  }

  // 8. 有明确的文件扩展名（排除版本号模式）
  if (request.extension && !/^\.\d+$/.test(request.extension)) {
    // 检查是否是常见的下载文件扩展名
    const downloadExtensions = [
      '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
      '.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.apk',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm',
      '.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a',
      '.iso', '.img', '.torrent'
    ];

    if (downloadExtensions.includes(request.extension.toLowerCase())) {
      return await applyUserFilters(request);
    }
  }

  return false;
}

/**
 * 应用用户设置的过滤规则
 */
async function applyUserFilters(request: CapturedRequest): Promise<boolean> {
  const settings = await getSettings();

  // 1. URL 黑名单检查
  if (settings.urlBlacklist.length > 0) {
    if (isBlacklisted(request.finalUrl, settings.urlBlacklist)) {
      console.log('[NetworkSniffer] URL blacklisted:', request.finalUrl);
      return false;
    }
  }

  // 2. 域名白名单检查
  if (settings.domainWhitelist.length > 0) {
    const domain = getDomain(request.finalUrl);
    const inWhitelist = settings.domainWhitelist.some(d => domain.includes(d));
    if (!inWhitelist) {
      console.log('[NetworkSniffer] Domain not in whitelist:', domain);
      return false;
    }
  }

  // 3. 文件类型过滤（如果用户设置了类型）
  if (settings.fileTypes.length > 0 && request.extension) {
    const typeMatch = settings.fileTypes.some(type =>
      request.extension?.toLowerCase() === type.toLowerCase()
    );
    if (!typeMatch) {
      console.log('[NetworkSniffer] File type not allowed:', request.extension);
      return false;
    }
  }

  // 4. 最小文件大小检查（如果设置了）
  if (settings.minFileSize > 0 && request.contentLength !== undefined) {
    if (request.contentLength < settings.minFileSize) {
      console.log('[NetworkSniffer] File too small:', request.contentLength, '<', settings.minFileSize);
      return false;
    }
  }

  return true;
}

/**
 * 推导最终文件名
 */
function deriveFilename(request: CapturedRequest): string {
  // 1. Content-Disposition
  if (request.suggestedFilename) {
    return request.suggestedFilename;
  }

  // 2. 查询参数
  const queryFilename = extractFilenameFromQueryParams(request.finalUrl);
  if (queryFilename) {
    return queryFilename;
  }

  // 3. 路径末段
  try {
    const urlObj = new URL(request.finalUrl);
    const pathname = urlObj.pathname;
    const lastSegment = pathname.split('/').pop();

    if (lastSegment && lastSegment.includes('.')) {
      // 过滤版本号模式（如 v1.0.3）
      const ext = lastSegment.match(/\.[^.]+$/)?.[0];
      if (ext && !/^\.\d+$/.test(ext)) {
        return decodeURIComponent(lastSegment);
      }
    }
  } catch (e) {
    console.warn('Failed to extract filename from URL:', e);
  }

  // 4. 根据 Content-Type 生成文件名 + 扩展名
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const ext = request.extension || getExtensionFromMimeType(request.contentType || '') || '';

  return `download_${timestamp}${ext}`;
}

/**
 * 将 CapturedRequest 转换为 Link
 */
function capturedRequestToLink(request: CapturedRequest): Link {
  const filename = deriveFilename(request);
  const extension = filename.match(/\.[^.]+$/)?.[0] || '';

  return {
    id: `network_${request.requestId}_${Date.now()}`,
    url: request.finalUrl,
    filename,
    size: request.contentLength ?? null,
    fileType: extension,
    selected: true,
    capturedAt: request.timestamp,
    source: 'page',

    // 新增字段（仅内存）
    contentType: request.contentType,
    referer: request.referer,
    userAgent: request.userAgent,
    cookies: request.cookies,
    authorization: request.authorization,
    acceptRanges: request.acceptRanges
  };
}

/**
 * webRequest.onBeforeRequest 监听器
 * 记录请求基本信息
 */
function onBeforeRequest(
  details: chrome.webRequest.WebRequestBodyDetails
): chrome.webRequest.BlockingResponse | void {
  const { requestId, tabId, url, method, type, frameId } = details;

  // 过滤掉非活动标签的请求（可选优化）
  if (tabId < 0) return;

  // 识别特殊 scheme
  if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('magnet:')) {
    // blob/data URL 需要特殊处理（暂时记录）
    // magnet 链接直接标记
    console.log('[NetworkSniffer] Special scheme detected:', url.substring(0, 50));
  }

  // 初始化请求记录
  requestCache.set(requestId, {
    requestId,
    tabId,
    url,
    finalUrl: url,
    method,
    type,
    redirectChain: [],
    isAttachment: false,
    timestamp: Date.now()
  });
}

/**
 * webRequest.onBeforeSendHeaders 监听器
 * 采集请求头
 */
function onBeforeSendHeaders(
  details: chrome.webRequest.WebRequestHeadersDetails
): chrome.webRequest.BlockingResponse | void {
  const request = requestCache.get(details.requestId);
  if (!request) return;

  const headers = details.requestHeaders;
  if (!headers) return;

  for (const header of headers) {
    const name = header.name.toLowerCase();
    const value = header.value || '';

    switch (name) {
      case 'referer':
        request.referer = value;
        break;
      case 'user-agent':
        request.userAgent = value;
        break;
      case 'cookie':
        request.cookies = value;
        break;
      case 'authorization':
        request.authorization = value;
        break;
      case 'accept':
        request.accept = value;
        break;
    }
  }
}

/**
 * webRequest.onHeadersReceived 监听器
 * 解析响应头
 */
function onHeadersReceived(
  details: chrome.webRequest.WebResponseHeadersDetails
): chrome.webRequest.BlockingResponse | void {
  const request = requestCache.get(details.requestId);
  if (!request) return;

  // 更新最终 URL（处理重定向）
  request.finalUrl = details.url;

  const headers = details.responseHeaders;
  if (!headers) return;

  for (const header of headers) {
    const name = header.name.toLowerCase();
    const value = header.value || '';

    switch (name) {
      case 'content-type':
        request.contentType = value.split(';')[0].trim();
        break;
      case 'content-length':
        request.contentLength = parseInt(value, 10);
        break;
      case 'content-disposition':
        request.contentDisposition = value;
        // 判断是否为 attachment
        if (value.toLowerCase().includes('attachment')) {
          request.isAttachment = true;
        }
        // 解析文件名
        const filename = parseContentDisposition(value);
        if (filename) {
          request.suggestedFilename = filename;
          request.extension = filename.match(/\.[^.]+$/)?.[0];
        }
        break;
      case 'accept-ranges':
        request.acceptRanges = value;
        break;
    }
  }

  // 尝试从 Content-Type 推断扩展名
  if (!request.extension && request.contentType) {
    request.extension = getExtensionFromMimeType(request.contentType);
  }
}

/**
 * webRequest.onCompleted 监听器
 * 请求完成，判断是否为下载候选并通知
 */
async function onCompleted(
  details: chrome.webRequest.WebResponseCacheDetails
): Promise<void> {
  const request = requestCache.get(details.requestId);
  if (!request) return;

  try {
    // 判断是否为下载候选
    if (await isDownloadCandidate(request)) {
      const link = capturedRequestToLink(request);

      // 通知 popup 或存储到 session storage
      // 方式1: 发送消息到 popup（如果打开）
      chrome.runtime.sendMessage(
        {
          action: 'networkCapturedLink',
          link
        },
        () => {
          // 如果没有接收方（例如 popup 未打开），Chrome 会抛出错误，忽略即可
          if (chrome.runtime.lastError) {
            console.debug('[NetworkSniffer] No receiver for networkCapturedLink:', chrome.runtime.lastError.message);
          }
        }
      );

      // 方式2: 存储到 session storage（popup 打开时读取）
      // 注意：session storage 在服务 worker 中需要使用 chrome.storage.session
      if (chrome.storage.session) {
        const { networkLinks = [] } = await chrome.storage.session.get('networkLinks');
        networkLinks.push(link);
        // 限制存储数量，避免过多
        if (networkLinks.length > 100) {
          networkLinks.shift();
        }
        await chrome.storage.session.set({ networkLinks });
      }

      console.log('[NetworkSniffer] Captured download candidate:', link.filename);
    }
  } catch (e) {
    console.error('[NetworkSniffer] Error processing completed request:', e);
  } finally {
    // 清理缓存
    requestCache.delete(details.requestId);
  }
}

/**
 * webRequest.onErrorOccurred 监听器
 * 请求失败，清理缓存
 */
function onErrorOccurred(
  details: chrome.webRequest.WebResponseErrorDetails
): void {
  requestCache.delete(details.requestId);
}

/**
 * 初始化网络嗅探
 */
export function initNetworkSniffer() {
  // 定义监听的 URL 和资源类型
  const filter: chrome.webRequest.RequestFilter = {
    urls: ['<all_urls>'],
    types: [
      'xmlhttprequest',
      'media',
      'other',
      'image',
      'font',
      'object'
    ]
  };

  // 定义 extraInfoSpec
  // Chrome 需要 'extraHeaders' 才能读取敏感请求头（Cookie/Authorization）
  const requestExtraInfoSpec: string[] = [
    'requestHeaders'
  ];

  const responseExtraInfoSpec: string[] = [
    'responseHeaders'
  ];

  // 尝试添加 'extraHeaders'（Chrome 支持，Firefox 部分支持）
  try {
    requestExtraInfoSpec.push('extraHeaders' as any);
    responseExtraInfoSpec.push('extraHeaders' as any);
  } catch (e) {
    console.warn('[NetworkSniffer] extraHeaders not supported, some headers may not be captured');
  }

  // 注册监听器
  chrome.webRequest.onBeforeRequest.addListener(
    onBeforeRequest,
    filter
  );

  chrome.webRequest.onBeforeSendHeaders.addListener(
    onBeforeSendHeaders,
    filter,
    requestExtraInfoSpec
  );

  chrome.webRequest.onHeadersReceived.addListener(
    onHeadersReceived,
    filter,
    responseExtraInfoSpec
  );

  chrome.webRequest.onCompleted.addListener(
    onCompleted,
    filter
  );

  chrome.webRequest.onErrorOccurred.addListener(
    onErrorOccurred,
    filter
  );

  console.log('[NetworkSniffer] Network sniffer initialized');
}

/**
 * 停止网络嗅探（如果需要）
 */
export function stopNetworkSniffer() {
  chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);
  chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
  chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceived);
  chrome.webRequest.onCompleted.removeListener(onCompleted);
  chrome.webRequest.onErrorOccurred.removeListener(onErrorOccurred);

  requestCache.clear();
  console.log('[NetworkSniffer] Network sniffer stopped');
}
