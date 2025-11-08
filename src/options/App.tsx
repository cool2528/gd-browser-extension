import React, { useState } from 'react';
import General from './pages/General';
import Connection from './pages/Connection';
import LinkCapture from './pages/LinkCapture';
import Privacy from './pages/Privacy';
import { About } from './pages/About';
import { t } from '@/shared/utils/i18n';

type Page = 'general' | 'connection' | 'linkCapture' | 'privacy' | 'about';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('general');

  const renderPage = () => {
    switch (currentPage) {
      case 'general':
        return <General />;
      case 'connection':
        return <Connection />;
      case 'linkCapture':
        return <LinkCapture />;
      case 'privacy':
        return <Privacy />;
      case 'about':
        return <About />;
      default:
        return <General />;
    }
  };

  return (
    <div className="options-container">
      {/* Sidebar */}
      <div className="options-sidebar">
        <div style={{
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: 'var(--space-xl)',
          color: 'var(--text-primary)'
        }}>
          {t('navSettings')}
        </div>

        <div
          className={`options-nav-item ${currentPage === 'general' ? 'active' : ''}`}
          onClick={() => setCurrentPage('general')}
        >
          {t('navGeneral')}
        </div>

        <div
          className={`options-nav-item ${currentPage === 'connection' ? 'active' : ''}`}
          onClick={() => setCurrentPage('connection')}
        >
          {t('navConnection')}
        </div>

        <div
          className={`options-nav-item ${currentPage === 'linkCapture' ? 'active' : ''}`}
          onClick={() => setCurrentPage('linkCapture')}
        >
          {t('navLinkCapture')}
        </div>

        <div
          className={`options-nav-item ${currentPage === 'privacy' ? 'active' : ''}`}
          onClick={() => setCurrentPage('privacy')}
        >
          {t('navPrivacy')}
        </div>

        <div
          className={`options-nav-item ${currentPage === 'about' ? 'active' : ''}`}
          onClick={() => setCurrentPage('about')}
        >
          {t('navAbout')}
        </div>
      </div>

      {/* Content */}
      <div className="options-content">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
