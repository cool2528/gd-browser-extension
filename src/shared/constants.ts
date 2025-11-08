import type { Aria2Config, ExtensionSettings } from './types';

/**
 * 默认 aria2 配置
 */
export const DEFAULT_ARIA2_CONFIG: Aria2Config = {
  url: 'ws://127.0.0.1:16888/jsonrpc',
  secret: 'GDownload_secret',
  autoConnect: true,
  reconnectInterval: 5000,
  requestTimeout: 30000
};

/**
 * 默认扩展设置
 */
export const DEFAULT_SETTINGS: ExtensionSettings = {
  // General
  autoCapture: true,
  showNotifications: true,
  autoSend: false,
  minimizeAfterSend: false,

  // Link Capture
  minFileSize: 0, // 0 表示不限制大小，捕获所有符合条件的下载
  fileTypes: [], // 空数组表示捕获所有类型
  urlBlacklist: [],
  domainWhitelist: [],

  // Connection
  aria2Config: DEFAULT_ARIA2_CONFIG,

  // Appearance
  theme: 'auto',
  language: 'en',

  // Advanced
  enableAnalytics: false,
  debugMode: false,

  // Privacy & Security
  sendUserAgent: true,  // User-Agent 通常安全
  sendReferer: true,    // Referer 通常需要
  sendCookies: false,   // Cookies 敏感，默认关闭
  sendAuthorization: false  // Authorization 敏感，默认关闭
};

/**
 * 支持的文件类型分类
 */
export const FILE_TYPE_CATEGORIES = {
  video: ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'],
  audio: ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a'],
  archive: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'],
  document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
  executable: ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.apk']
};

/**
 * 文件类型对应的图标名称
 */
export const FILE_TYPE_ICONS: Record<string, string> = {
  video: 'video',
  audio: 'music',
  archive: 'archive',
  document: 'file-text',
  image: 'image',
  executable: 'package',
  default: 'file'
};

/**
 * Element Plus 主题颜色
 */
export const THEME_COLORS = {
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
  info: '#909399'
};

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  SETTINGS: 'gdownload_settings',
  LINKS: 'gdownload_links',
  CONNECTION_STATUS: 'gdownload_connection_status'
};
