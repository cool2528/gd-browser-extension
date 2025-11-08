import React from 'react';
import { useLinkStore } from '../stores/linkStore';
import { ArrowRight } from 'lucide-react';
import { t } from '@/shared/utils/i18n';

function Footer() {
  const { selectedCount, isConnected, clearAll, sendToGDownload } = useLinkStore();
  const [isSending, setIsSending] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleSend = async () => {
    if (selectedCount === 0) return;

    setIsSending(true);
    setMessage('');

    try {
      await sendToGDownload();
      setMessage(t('popupSent'));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('popupError'));
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{
      borderTop: '1px solid var(--border-base)',
      padding: 'var(--space-lg)',
      backgroundColor: 'var(--bg-white)',
      height: '70px',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)'
    }}>
      {message && (
        <div style={{
          fontSize: '12px',
          color: message.includes('Failed') ? 'var(--color-danger)' : 'var(--color-success)',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          fontSize: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-danger)'
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            {isConnected ? t('popupConnected') : t('popupDisconnected')}
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={clearAll}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-base)',
            borderRadius: 'var(--radius-base)',
            color: 'var(--text-regular)',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-base)';
            e.currentTarget.style.color = 'var(--text-regular)';
          }}
        >
          {t('popupClear')}
        </button>

        <button
          onClick={handleSend}
          disabled={selectedCount === 0 || isSending}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedCount > 0 ? 'var(--color-primary)' : 'var(--fill-base)',
            color: selectedCount > 0 ? '#fff' : 'var(--text-disabled)',
            border: 'none',
            borderRadius: 'var(--radius-base)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (selectedCount > 0) {
              e.currentTarget.style.backgroundColor = '#66b1ff';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCount > 0) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }
          }}
        >
          {isSending ? t('popupSending') : `${t('popupSendToGDownload')} (${selectedCount})`}
          {!isSending && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}

export default Footer;
