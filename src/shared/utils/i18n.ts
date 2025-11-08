/**
 * i18n 工具函数
 * 封装 Chrome Extension i18n API
 */

/**
 * 获取本地化消息
 * @param key 消息键名
 * @param substitutions 替换参数（可选）
 * @returns 本地化后的消息字符串
 */
export function t(key: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

/**
 * 获取本地化消息并替换占位符（命名参数）
 * @param key 消息键名
 * @param params 命名参数对象
 * @returns 本地化后的消息字符串
 *
 * 示例：
 * messages.json: "greeting": { "message": "Hello {name}!" }
 * 使用：t('greeting', { name: 'World' }) => "Hello World!"
 */
export function tn(key: string, params: Record<string, string | number>): string {
  let message = chrome.i18n.getMessage(key) || key;

  // 替换命名占位符 {name}
  Object.keys(params).forEach(paramKey => {
    const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
    message = message.replace(regex, String(params[paramKey]));
  });

  return message;
}

/**
 * 获取当前语言环境
 * @returns 语言代码，如 'en', 'zh-CN'
 */
export function getCurrentLocale(): string {
  return chrome.i18n.getUILanguage();
}

/**
 * 获取消息对象（用于调试）
 * @param key 消息键名
 * @returns 完整的消息对象
 */
export function getMessageObject(key: string): chrome.i18n.LanguageCode | undefined {
  // Chrome 不提供直接获取消息对象的 API
  // 这个函数主要用于开发调试
  return undefined;
}
