import type { Link, ExtensionSettings } from '@/shared/types';
import { getFilenameFromUrl, getFileExtension, sanitizeFilename, isDownloadLink, isBlacklisted, getDomain } from '@/shared/utils/urlParser';
import { browserApi } from '@/shared/utils/browserApi';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/shared/constants';

/**
 * 链接捕获服务
 * 负责从页面中提取下载链接
 */
export class LinkCaptureService {
  private capturedLinks = new Set<string>();
  private observer: MutationObserver | null = null;
  private settings: ExtensionSettings = DEFAULT_SETTINGS;

  constructor() {
    // 初始化时加载设置
    this.loadSettings();
    // 监听设置变化
    this.setupStorageListener();
  }

  /**
   * 加载用户设置
   */
  private async loadSettings() {
    try {
      const result = await browserApi.storage.get([STORAGE_KEYS.SETTINGS]);
      if (result[STORAGE_KEYS.SETTINGS]) {
        this.settings = { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  /**
   * 监听 storage 变化，实时更新设置
   */
  private setupStorageListener() {
    // 直接使用原生 chrome.storage.onChanged API
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[STORAGE_KEYS.SETTINGS]) {
        const newSettings = changes[STORAGE_KEYS.SETTINGS].newValue;
        if (newSettings) {
          this.settings = { ...DEFAULT_SETTINGS, ...newSettings };
          console.log('[LinkCapture] Settings updated:', this.settings);
        }
      }
    });
  }

  /**
   * 根据设置过滤链接
   * @returns true 表示应该捕获该链接，false 表示应该过滤掉
   */
  private shouldCaptureLink(url: string, fileType: string): boolean {
    // 1. URL 黑名单检查
    if (this.settings.urlBlacklist.length > 0) {
      if (isBlacklisted(url, this.settings.urlBlacklist)) {
        return false;
      }
    }

    // 2. 域名白名单检查（如果启用）
    if (this.settings.domainWhitelist.length > 0) {
      const domain = getDomain(url);
      const isWhitelisted = this.settings.domainWhitelist.some(whitelist => {
        try {
          const regex = new RegExp(whitelist);
          return regex.test(domain);
        } catch {
          return domain.includes(whitelist);
        }
      });

      if (!isWhitelisted) {
        return false;
      }
    }

    // 3. 文件类型过滤（如果指定了类型）
    if (this.settings.fileTypes.length > 0) {
      // 如果设置了文件类型，只捕获这些类型
      const hasMatchingType = this.settings.fileTypes.some(type => {
        return fileType.toLowerCase() === type.toLowerCase();
      });

      if (!hasMatchingType) {
        return false;
      }
    }

    // 注意：minFileSize 的过滤在网络层（networkSniffer）中进行，
    // 因为 DOM 捕获无法获取文件大小

    return true;
  }

  /**
   * 捕获页面现有链接
   */
  captureExistingLinks(): Link[] {
    const links: Link[] = [];

    // 捕获 <a> 标签
    document.querySelectorAll('a[href]').forEach(element => {
      const link = this.processLinkElement(element as HTMLAnchorElement);
      if (link) links.push(link);
    });

    // 捕获 <video> 标签
    document.querySelectorAll('video[src]').forEach(element => {
      const link = this.processMediaElement(element as HTMLVideoElement, 'video');
      if (link) links.push(link);
    });

    // 捕获 <audio> 标签
    document.querySelectorAll('audio[src]').forEach(element => {
      const link = this.processMediaElement(element as HTMLAudioElement, 'audio');
      if (link) links.push(link);
    });

    // 捕获 <source> 标签
    document.querySelectorAll('video source, audio source').forEach(element => {
      const link = this.processSourceElement(element as HTMLSourceElement);
      if (link) links.push(link);
    });

    return links;
  }

  /**
   * 处理 <a> 标签
   */
  private processLinkElement(element: HTMLAnchorElement): Link | null {
    const url = element.href;
    if (!url || this.capturedLinks.has(url)) return null;

    // 过滤掉页面内锚点和 javascript: 链接
    if (url.startsWith('#') || url.startsWith('javascript:')) return null;

    // 只捕获看起来像下载链接的 URL
    if (!isDownloadLink(url, element)) return null;

    const filename = sanitizeFilename(getFilenameFromUrl(url));
    const fileType = getFileExtension(filename);

    // 应用设置过滤
    if (!this.shouldCaptureLink(url, fileType)) {
      return null;
    }

    this.capturedLinks.add(url);

    return {
      id: `link_${Date.now()}_${Math.random()}`,
      url,
      filename,
      size: null,
      fileType,
      selected: true,
      capturedAt: Date.now(),
      source: 'page'
    };
  }

  /**
   * 处理 <video> 或 <audio> 标签
   */
  private processMediaElement(
    element: HTMLVideoElement | HTMLAudioElement,
    type: 'video' | 'audio'
  ): Link | null {
    const url = element.src;
    if (!url || this.capturedLinks.has(url)) return null;

    const filename = sanitizeFilename(getFilenameFromUrl(url));
    const fileType = getFileExtension(filename);

    // 应用设置过滤
    if (!this.shouldCaptureLink(url, fileType)) {
      return null;
    }

    this.capturedLinks.add(url);

    return {
      id: `${type}_${Date.now()}_${Math.random()}`,
      url,
      filename,
      size: null,
      fileType,
      selected: true,
      capturedAt: Date.now(),
      source: 'page'
    };
  }

  /**
   * 处理 <source> 标签
   */
  private processSourceElement(element: HTMLSourceElement): Link | null {
    const url = element.src;
    if (!url || this.capturedLinks.has(url)) return null;

    const filename = sanitizeFilename(getFilenameFromUrl(url));
    const fileType = getFileExtension(filename);

    // 应用设置过滤
    if (!this.shouldCaptureLink(url, fileType)) {
      return null;
    }

    this.capturedLinks.add(url);

    return {
      id: `source_${Date.now()}_${Math.random()}`,
      url,
      filename,
      size: null,
      fileType,
      selected: true,
      capturedAt: Date.now(),
      source: 'page'
    };
  }

  /**
   * 开始监听页面变化
   */
  startCapture(callback: (links: Link[]) => void) {
    // 立即捕获现有链接
    const existingLinks = this.captureExistingLinks();
    if (existingLinks.length > 0) {
      callback(existingLinks);
    }

    // 监听 DOM 变化
    this.observer = new MutationObserver((mutations) => {
      const newLinks: Link[] = [];

      for (const mutation of mutations) {
        // 监听子节点添加
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const links = this.captureLinksInElement(node as Element);
              newLinks.push(...links);
            }
          });
        }

        // 监听属性变化（href/src 延迟赋值）
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          const attributeName = mutation.attributeName;

          if (attributeName === 'href' && target.tagName === 'A') {
            const link = this.processLinkElement(target as HTMLAnchorElement);
            if (link) newLinks.push(link);
          } else if (attributeName === 'src') {
            if (target.tagName === 'VIDEO') {
              const link = this.processMediaElement(target as HTMLVideoElement, 'video');
              if (link) newLinks.push(link);
            } else if (target.tagName === 'AUDIO') {
              const link = this.processMediaElement(target as HTMLAudioElement, 'audio');
              if (link) newLinks.push(link);
            } else if (target.tagName === 'SOURCE') {
              const link = this.processSourceElement(target as HTMLSourceElement);
              if (link) newLinks.push(link);
            }
          }
        }
      }

      if (newLinks.length > 0) {
        callback(newLinks);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      // 添加属性变更监听
      attributes: true,
      attributeFilter: ['href', 'src']
    });
  }

  /**
   * 在指定元素中捕获链接
   */
  private captureLinksInElement(element: Element): Link[] {
    const links: Link[] = [];

    // 检查元素本身是否是链接
    if (element.tagName === 'A') {
      const link = this.processLinkElement(element as HTMLAnchorElement);
      if (link) links.push(link);
    } else if (element.tagName === 'VIDEO') {
      const link = this.processMediaElement(element as HTMLVideoElement, 'video');
      if (link) links.push(link);
    } else if (element.tagName === 'AUDIO') {
      const link = this.processMediaElement(element as HTMLAudioElement, 'audio');
      if (link) links.push(link);
    }

    // 递归查找子元素
    element.querySelectorAll('a[href]').forEach(el => {
      const link = this.processLinkElement(el as HTMLAnchorElement);
      if (link) links.push(link);
    });

    element.querySelectorAll('video[src]').forEach(el => {
      const link = this.processMediaElement(el as HTMLVideoElement, 'video');
      if (link) links.push(link);
    });

    element.querySelectorAll('audio[src]').forEach(el => {
      const link = this.processMediaElement(el as HTMLAudioElement, 'audio');
      if (link) links.push(link);
    });

    return links;
  }

  /**
   * 停止监听
   */
  stopCapture() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * 清空已捕获的链接记录
   */
  clear() {
    this.capturedLinks.clear();
  }

  /**
   * 获取所有已捕获的链接 URL
   */
  getCapturedUrls(): string[] {
    return Array.from(this.capturedLinks);
  }
}
