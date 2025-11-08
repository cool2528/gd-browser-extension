import { create } from 'zustand';
import type { Link } from '@/shared/types';
import { browserApi } from '@/shared/utils/browserApi';
import { STORAGE_KEYS } from '@/shared/constants';
import { sanitizeLinksForStorage } from '@/shared/utils/urlParser';

interface LinkStore {
  links: Link[];
  searchQuery: string;
  selectedCount: number;
  isConnected: boolean;
  
  // Actions
  loadLinks: () => Promise<void>;
  addLink: (link: Link) => void;
  removeLink: (id: string) => void;
  toggleLink: (id: string) => void;
  toggleAll: (selected: boolean) => void;
  setSearchQuery: (query: string) => void;
  clearAll: () => void;
  sendToGDownload: () => Promise<void>;
  checkConnection: () => Promise<void>;
}

export const useLinkStore = create<LinkStore>((set, get) => ({
  links: [],
  searchQuery: '',
  selectedCount: 0,
  isConnected: false,

  loadLinks: async () => {
    // 1. 从持久化存储加载链接
    const result = await browserApi.storage.get([STORAGE_KEYS.LINKS]);
    let links: Link[] = result[STORAGE_KEYS.LINKS] || [];

    // 2. 从 session storage 加载网络嗅探的链接（如果支持）
    if (chrome.storage.session) {
      try {
        const sessionData = await chrome.storage.session.get('networkLinks');
        const networkLinks: Link[] = sessionData.networkLinks || [];

        // 合并网络嗅探的链接（去重）
        const existingUrls = new Set(links.map(l => l.url));
        const newLinks = networkLinks.filter(l => !existingUrls.has(l.url));
        links = [...links, ...newLinks];

        // 清空 session storage（已合并）
        await chrome.storage.session.set({ networkLinks: [] });
      } catch (e) {
        console.warn('Failed to load network links from session storage:', e);
      }
    }

    set({
      links,
      selectedCount: links.filter(l => l.selected).length
    });
  },

  addLink: (link) => {
    set(state => {
      // URL 去重：如果已存在相同 URL，更新而非新增
      const existingIndex = state.links.findIndex(l => l.url === link.url);

      let newLinks: Link[];
      if (existingIndex >= 0) {
        // 更新已存在的链接（保留最新信息）
        newLinks = [...state.links];
        newLinks[existingIndex] = { ...link, selected: newLinks[existingIndex].selected };
      } else {
        // 添加新链接
        newLinks = [...state.links, link];
      }

      // 持久化时剥离敏感信息
      browserApi.storage.set({ [STORAGE_KEYS.LINKS]: sanitizeLinksForStorage(newLinks) });

      return {
        links: newLinks,
        selectedCount: newLinks.filter(l => l.selected).length
      };
    });
  },

  removeLink: (id) => {
    set(state => {
      const newLinks = state.links.filter(l => l.id !== id);
      // 持久化时剥离敏感信息
      browserApi.storage.set({ [STORAGE_KEYS.LINKS]: sanitizeLinksForStorage(newLinks) });

      return {
        links: newLinks,
        selectedCount: newLinks.filter(l => l.selected).length
      };
    });
  },

  toggleLink: (id) => {
    set(state => {
      const newLinks = state.links.map(l =>
        l.id === id ? { ...l, selected: !l.selected } : l
      );
      // 持久化时剥离敏感信息
      browserApi.storage.set({ [STORAGE_KEYS.LINKS]: sanitizeLinksForStorage(newLinks) });

      return {
        links: newLinks,
        selectedCount: newLinks.filter(l => l.selected).length
      };
    });
  },

  toggleAll: (selected) => {
    set(state => {
      const newLinks = state.links.map(l => ({ ...l, selected }));
      // 持久化时剥离敏感信息
      browserApi.storage.set({ [STORAGE_KEYS.LINKS]: sanitizeLinksForStorage(newLinks) });

      return {
        links: newLinks,
        selectedCount: selected ? newLinks.length : 0
      };
    });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  clearAll: () => {
    set({ links: [], selectedCount: 0, searchQuery: '' });
    browserApi.storage.set({ [STORAGE_KEYS.LINKS]: [] });
  },

  sendToGDownload: async () => {
    const { links } = get();
    const selectedLinks = links.filter(l => l.selected);

    if (selectedLinks.length === 0) {
      throw new Error('No links selected');
    }

    const response = await browserApi.runtime.sendMessage({
      action: 'sendToGDownload',
      links: selectedLinks
    });

    // 处理发送结果
    if (response.success) {
      // 全部成功：清空所有选中的链接
      set(state => {
        const newLinks = state.links.filter(l => !l.selected);
        browserApi.storage.set({ [STORAGE_KEYS.LINKS]: sanitizeLinksForStorage(newLinks) });

        return {
          links: newLinks,
          selectedCount: 0
        };
      });
    } else if (response.data?.results) {
      // 部分成功或全部失败：只清空成功的链接
      const successfulGids = new Set(
        response.data.results
          .filter((r: any) => r.success)
          .map((r: any) => r.link.id)
      );

      set(state => {
        const newLinks = state.links.filter(l => !successfulGids.has(l.id));
        browserApi.storage.set({ [STORAGE_KEYS.LINKS]: sanitizeLinksForStorage(newLinks) });

        return {
          links: newLinks,
          selectedCount: newLinks.filter(l => l.selected).length
        };
      });

      // 抛出错误，但附带详细信息
      const errorMessage = response.data.errors
        ? `Failed to send ${response.data.failed} link(s): ${response.data.errors.map((e: any) => e.filename).join(', ')}`
        : response.error || 'Some links failed to send';

      throw new Error(errorMessage);
    } else {
      // 完全失败：不清空任何链接
      throw new Error(response.error || 'Failed to send to GDownload');
    }
  },

  checkConnection: async () => {
    try {
      const response = await browserApi.runtime.sendMessage({
        action: 'getConnectionStatus'
      });
      
      set({ isConnected: response.success && response.data?.connected });
    } catch {
      set({ isConnected: false });
    }
  }
}));
