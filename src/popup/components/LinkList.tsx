import React from 'react';
import type { Link } from '@/shared/types';
import LinkItem from './LinkItem';
import { Search, CheckSquare, Square } from 'lucide-react';
import { useLinkStore } from '../stores/linkStore';
import { t } from '@/shared/utils/i18n';

interface LinkListProps {
  links: Link[];
}

function LinkList({ links }: LinkListProps) {
  const { searchQuery, setSearchQuery, toggleAll } = useLinkStore();
  const allSelected = links.length > 0 && links.every(l => l.selected);

  if (links.length === 0 && !searchQuery) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        gap: 'var(--space-md)'
      }}>
        <div style={{ fontSize: '48px', opacity: 0.5 }}>📥</div>
        <div style={{ fontSize: '14px' }}>{t('popupNoLinks')}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-placeholder)' }}>
          Browse web pages to capture download links
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Filter Bar */}
      <div style={{
        padding: 'var(--space-md)',
        borderBottom: '1px solid var(--border-lighter)',
        display: 'flex',
        gap: 'var(--space-sm)',
        alignItems: 'center'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: '6px 12px',
          backgroundColor: 'var(--fill-light)',
          borderRadius: 'var(--radius-base)',
          border: '1px solid var(--border-lighter)'
        }}>
          <Search size={16} color="var(--text-placeholder)" />
          <input
            type="text"
            placeholder={t('popupSearch')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <button
          onClick={() => toggleAll(!allSelected)}
          style={{
            width: '28px',
            height: '28px',
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
          title={allSelected ? 'Deselect All' : 'Select All'}
        >
          {allSelected ? (
            <CheckSquare size={18} color="var(--color-primary)" />
          ) : (
            <Square size={18} color="var(--text-secondary)" />
          )}
        </button>
      </div>

      {/* Link List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-sm)'
      }}>
        {links.length === 0 ? (
          <div style={{
            padding: 'var(--space-xl)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}>
            No links match your search
          </div>
        ) : (
          links.map(link => (
            <LinkItem key={link.id} link={link} />
          ))
        )}
      </div>
    </div>
  );
}

export default LinkList;
