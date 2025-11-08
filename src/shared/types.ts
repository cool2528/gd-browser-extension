/**
 * 下载链接信息
 */
export interface Link {
  id: string;
  url: string;
  filename: string;
  size: number | null;
  fileType: string;
  selected: boolean;
  capturedAt: number;
  source: 'page' | 'contextMenu' | 'manual';

  // 网络层采集的上下文信息（仅运行时内存，不持久化）
  contentType?: string;
  referer?: string;
  userAgent?: string;
  cookies?: string;
  authorization?: string;
  acceptRanges?: string;
}

/**
 * aria2 配置
 */
export interface Aria2Config {
  url: string;
  secret: string;
  autoConnect: boolean;
  reconnectInterval: number;
  requestTimeout: number;
}

/**
 * 扩展设置
 */
export interface ExtensionSettings {
  // General
  autoCapture: boolean;
  showNotifications: boolean;
  autoSend: boolean;
  minimizeAfterSend: boolean;

  // Link Capture
  minFileSize: number;
  fileTypes: string[];
  urlBlacklist: string[];
  domainWhitelist: string[];

  // Connection
  aria2Config: Aria2Config;

  // Appearance
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'zh-CN';

  // Advanced
  enableAnalytics: boolean;
  debugMode: boolean;

  // Privacy & Security
  sendUserAgent: boolean;
  sendReferer: boolean;
  sendCookies: boolean;
  sendAuthorization: boolean;
}

/**
 * aria2 RPC 请求
 */
export interface Aria2RpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params: any[];
}

/**
 * aria2 RPC 响应
 */
export interface Aria2RpcResponse<T = any> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * aria2 下载任务状态
 */
export interface Aria2DownloadStatus {
  gid: string;
  status: 'active' | 'waiting' | 'paused' | 'error' | 'complete' | 'removed';
  totalLength: string;
  completedLength: string;
  downloadSpeed: string;
  uploadSpeed: string;
  connections: string;
  files: Aria2File[];
}

export interface Aria2File {
  index: string;
  path: string;
  length: string;
  completedLength: string;
  selected: string;
  uris: Aria2Uri[];
}

export interface Aria2Uri {
  uri: string;
  status: 'used' | 'waiting';
}

/**
 * 发送下载任务的结果
 */
export interface SendResult {
  link: Link;
  success: boolean;
  gid?: string;
  error?: string;
}

/**
 * 消息类型（Background <-> Content Script）
 */
export type Message =
  | { action: 'captureAllLinks' }
  | { action: 'captureLink'; url: string; filename: string }
  | { action: 'sendToGDownload'; links: Link[] }
  | { action: 'testConnection' }
  | { action: 'getConnectionStatus' };

/**
 * 消息响应
 */
export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
