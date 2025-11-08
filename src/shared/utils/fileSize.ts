/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * 解析文件大小字符串为字节数
 */
export function parseFileSize(sizeStr: string): number {
  const match = sizeStr.match(/^([\d.]+)\s*([KMGT]?B)$/i);
  
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  const multipliers: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  };
  
  return value * (multipliers[unit] || 1);
}

/**
 * 通过 HEAD 请求获取文件大小
 */
export async function getFileSize(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
  } catch (error) {
    console.warn('Failed to get file size:', error);
  }
  
  return null;
}
