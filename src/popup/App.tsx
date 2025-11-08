import React, { useEffect } from 'react';
import { useLinkStore } from './stores/linkStore';
import Header from './components/Header';
import LinkList from './components/LinkList';
import Footer from './components/Footer';

function App() {
  const { loadLinks, checkConnection, addLink, links, searchQuery } = useLinkStore();

  useEffect(() => {
    loadLinks();
    checkConnection();

    // 每 5 秒检查一次连接状态
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [loadLinks, checkConnection]);

  // 监听网络嗅探捕获的链接
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === 'networkCapturedLink' && message.link) {
        // 检查是否已存在（避免重复）
        const exists = links.some(l => l.url === message.link.url);
        if (!exists) {
          addLink(message.link);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [links, addLink]);

  // 过滤链接
  const filteredLinks = links.filter(link => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      link.filename.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: 'var(--bg-white)'
    }}>
      <Header />
      <LinkList links={filteredLinks} />
      <Footer />
    </div>
  );
}

export default App;
