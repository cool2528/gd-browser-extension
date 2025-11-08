/**
 * 浏览器 API 抽象层
 * 提供跨浏览器兼容的 API 包装
 */

// 获取浏览器 API 对象
export const browser = (() => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return chrome;
  }
  if (typeof (globalThis as any).browser !== 'undefined' && (globalThis as any).browser.runtime) {
    return (globalThis as any).browser;
  }
  // 在某些情况下（如扩展刚加载时），API 可能尚未完全初始化
  // 返回一个延迟加载的代理对象
  console.warn('[BrowserApi] Chrome/Browser API not fully initialized, using delayed proxy');

  // 等待 chrome 对象可用时再访问
  const handler: ProxyHandler<typeof chrome> = {
    get(target, prop) {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        return (chrome as any)[prop];
      }
      throw new Error(`Browser API not available yet. Tried to access: ${String(prop)}`);
    }
  };

  return new Proxy({} as typeof chrome, handler);
})();

/**
 * 统一的浏览器 API
 */
export const browserApi = {
  storage: {
    get: (keys: string[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        browser.storage.local.get(keys, (result: any) => {
          if (browser.runtime.lastError) {
            reject(browser.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });
    },

    set: (items: Record<string, any>): Promise<void> => {
      return new Promise((resolve, reject) => {
        browser.storage.local.set(items, () => {
          if (browser.runtime.lastError) {
            reject(browser.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    },

    remove: (keys: string | string[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        browser.storage.local.remove(keys, () => {
          if (browser.runtime.lastError) {
            reject(browser.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    },

    // 暴露 onChanged 事件监听器
    get onChanged(): chrome.storage.StorageChangedEvent {
      // 确保 storage.onChanged 存在，避免在某些上下文中 undefined
      if (!browser.storage?.onChanged) {
        console.warn('[BrowserApi] storage.onChanged not available, returning dummy listener');
        const dummy = {
          addListener: () => {},
          removeListener: () => {},
          hasListener: () => false
        };
        return dummy as unknown as chrome.storage.StorageChangedEvent;
      }
      return browser.storage.onChanged;
    }
  },

  tabs: {
    sendMessage: (tabId: number, message: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        browser.tabs.sendMessage(tabId, message, (response: any) => {
          if (browser.runtime.lastError) {
            reject(browser.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
    },

    query: (queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> => {
      return new Promise((resolve, reject) => {
        browser.tabs.query(queryInfo, (tabs: chrome.tabs.Tab[]) => {
          if (browser.runtime.lastError) {
            reject(browser.runtime.lastError);
          } else {
            resolve(tabs);
          }
        });
      });
    }
  },

  runtime: {
    sendMessage: (message: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        browser.runtime.sendMessage(message, (response: any) => {
          if (browser.runtime.lastError) {
            reject(browser.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
    }
  }
};
