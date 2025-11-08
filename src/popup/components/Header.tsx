import React from 'react';
import { Settings } from 'lucide-react';

function Header() {
  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: 'var(--space-lg)',
      borderBottom: '1px solid var(--border-base)',
      backgroundColor: 'var(--bg-white)',
      height: '60px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        flex: 1
      }}>
        <img 
          src="/icons/icon-32.png" 
          alt="GDownload" 
          style={{ width: '32px', height: '32px' }}
        />
        <span style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)'
        }}>
          GDownload
        </span>
      </div>
      
      <button
        onClick={openOptions}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-base)',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--fill-light)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Settings size={20} color="var(--text-regular)" />
      </button>
    </div>
  );
}

export default Header;
