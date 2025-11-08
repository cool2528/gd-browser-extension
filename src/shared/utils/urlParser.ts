import type { Link } from '@/shared/types';

/**
 * 从 URL 中提取文件名
 * 优先级：查询参数 > 路径末段 > 生成默认名称
 */
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // 1. 尝试从查询参数提取文件名
    const queryFilename = extractFilenameFromQueryParams(urlObj);
    if (queryFilename) {
      return queryFilename;
    }

    // 2. 从路径末段提取
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || '';

    if (filename && filename.includes('.')) {
      return decodeURIComponent(filename);
    }

    // 3. 如果没有文件名，生成一个
    return `download_${Date.now()}`;
  } catch {
    return `download_${Date.now()}`;
  }
}

/**
 * 从 URL 查询参数中提取文件名
 * 支持常见的查询参数键
 */
function extractFilenameFromQueryParams(urlObj: URL): string | undefined {
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
      // 跳过布尔值参数（如 dl=1）
      if (value === '1' || value === '0' || value === 'true' || value === 'false') {
        continue;
      }
      return decodeURIComponent(value);
    }
  }

  return undefined;
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : '';
}

/**
 * 判断是否为媒体 URL
 */
export function isMediaUrl(url: string): boolean {
  const mediaExtensions = [
    '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm',
    '.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'
  ];
  
  const ext = getFileExtension(url);
  return mediaExtensions.includes(ext);
}

/**
 * 清理文件名中的非法字符
 */
export function sanitizeFilename(filename: string): string {
  // Windows 不允许的字符: < > : " / \ | ? *
  const sanitized = filename.replace(/[<>:"/\\|?*]/g, '_');

  // 如果清理后为空，提供兜底值
  if (!sanitized || sanitized.trim() === '') {
    return `download_${Date.now()}`;
  }

  return sanitized;
}

/**
 * 验证 URL 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 判断 URL 是否匹配黑名单
 */
export function isBlacklisted(url: string, blacklist: string[]): boolean {
  return blacklist.some(pattern => {
    try {
      const regex = new RegExp(pattern);
      return regex.test(url);
    } catch {
      return url.includes(pattern);
    }
  });
}

/**
 * 从 URL 中提取域名
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * 判断 URL 是否看起来像下载链接
 * 用于过滤掉页面导航、登录等非下载链接
 */
export function isDownloadLink(url: string, element?: HTMLAnchorElement): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();

    // 1. 识别特殊 scheme
    const scheme = urlObj.protocol;

    // magnet: 链接直接认为是下载链接（BT 磁力）
    if (scheme === 'magnet:') {
      return true;
    }

    // blob: 和 data: 需要特殊处理，暂时不作为下载链接
    if (scheme === 'blob:' || scheme === 'data:') {
      return false;
    }

    // 2. 如果 <a> 标签有 download 属性，直接认为是下载链接
    if (element?.hasAttribute('download')) {
      return true;
    }

    // 3. 查询参数中有下载意图指示
    const hasDownloadIntent = hasDownloadIntentInQuery(urlObj);
    if (hasDownloadIntent) {
      return true;
    }

    // 4. 常见的下载文件扩展名
    const downloadExtensions = [
      // 压缩包
      '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.tgz', '.tar.gz',
      // 可执行文件
      '.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.appimage',
      // 文档
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      // 媒体文件
      '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm',
      '.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a',
      // 图片（大文件）
      '.iso', '.img',
      // 代码和数据
      '.apk', '.ipa', '.jar', '.war',
      // 其他
      '.torrent'
    ];

    // 检查文件扩展名
    const hasDownloadExt = downloadExtensions.some(ext => pathname.endsWith(ext));
    if (hasDownloadExt) {
      return true;
    }

    // 5. 包含下载路径关键词
    const downloadPaths = [
      '/download/',
      '/downloads/',
      '/releases/download/',
      '/attachments/',
      '/files/',
      '/assets/'
    ];

    const hasDownloadPath = downloadPaths.some(path => pathname.includes(path));
    if (hasDownloadPath && pathname.includes('.')) {
      return true;
    }

    // 6. GitHub Releases 特殊处理：路径中有文件名且在 releases 相关路径下
    if (urlObj.hostname.includes('github.com') || urlObj.hostname.includes('githubusercontent.com')) {
      // 排除版本标签页面、编辑页面、代码浏览等非下载链接
      if (pathname.includes('/releases/tag/') ||
          pathname.includes('/releases/edit/') ||
          pathname.includes('/tree/') ||
          pathname.includes('/blob/')) {
        return false;
      }

      // GitHub releases 的直接下载链接
      if (pathname.includes('/releases/download/') || pathname.includes('/archive/refs/')) {
        return true;
      }
    }

    // 7. 其他情况：如果 URL 看起来像文件（有扩展名）且不是网页
    const filename = pathname.split('/').pop() || '';
    if (filename.includes('.')) {
      const ext = getFileExtension(filename);

      // 排除明确的非文件模式
      const invalidPatterns = [
        // 单纯的数字扩展名（版本号的特征，如 v1.0.3 的扩展名是 .3）
        /^\.\d+$/,
        // 空扩展名或只有点号
        /^\.?$/,
      ];

      const isInvalidPattern = invalidPatterns.some(pattern => pattern.test(ext));
      if (isInvalidPattern) {
        return false;
      }

      // 排除网页文件
      const webExtensions = ['.html', '.htm', '.php', '.asp', '.aspx', '.jsp'];
      if (!webExtensions.includes(ext)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * 检查 URL 查询参数中是否有下载意图指示
 */
function hasDownloadIntentInQuery(urlObj: URL): boolean {
  const params = urlObj.searchParams;

  // 常见的下载意图参数
  const downloadIntentKeys = [
    'download',
    'dl',
    'export',
    'action',
    'response-content-disposition'
  ];

  for (const key of downloadIntentKeys) {
    const value = params.get(key);
    if (value) {
      // 如果是 download=1, dl=1, export=download 等
      if (value === '1' || value === 'true' || value.toLowerCase() === 'download') {
        return true;
      }
    }
  }

  return false;
}

/**
 * 剥离 Link 中的敏感信息，用于持久化到 storage
 * 敏感信息（cookies, authorization）仅在发送下载时临时使用，不应持久化
 */
export function sanitizeLinkForStorage(link: Link): Link {
  const { cookies, authorization, ...safeLink } = link;
  return safeLink as Link;
}

/**
 * 批量剥离 Link 数组中的敏感信息
 */
export function sanitizeLinksForStorage(links: Link[]): Link[] {
  return links.map(sanitizeLinkForStorage);
}
