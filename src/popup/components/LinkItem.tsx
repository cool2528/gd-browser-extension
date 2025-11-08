import React from 'react';
import type { Link } from '@/shared/types';
import { useLinkStore } from '../stores/linkStore';
import { Trash2, File, FileArchive, Video, Music, FileText, Image, Package } from 'lucide-react';
import { formatFileSize } from '@/shared/utils/fileSize';
import { getFileExtension } from '@/shared/utils/urlParser';

interface LinkItemProps {
  link: Link;
}

function LinkItem({ link }: LinkItemProps) {
  const { toggleLink, removeLink } = useLinkStore();

  const getFileIcon = () => {
    const ext = getFileExtension(link.filename).toLowerCase();
    
    if (['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(ext)) {
      return <Video size={20} color="var(--color-primary)" />;
    }
    if (['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a'].includes(ext)) {
      return <Music size={20} color="var(--color-success)" />;
    }
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) {
      return <FileArchive size={20} color="var(--color-warning)" />;
    }
    if (['.pdf', '.doc', '.docx', '.xls', '.xlsx'].includes(ext)) {
      return <FileText size={20} color="var(--color-danger)" />;
    }
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      return <Image size={20} color="var(--color-info)" />;
    }
    if (['.exe', '.msi', '.dmg', '.apk'].includes(ext)) {
      return <Package size={20} color="var(--text-secondary)" />;
    }
    
    return <File size={20} color="var(--text-secondary)" />;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-md)',
      padding: 'var(--space-md)',
      marginBottom: 'var(--space-xs)',
      backgroundColor: link.selected ? 'var(--fill-extra-light)' : 'transparent',
      border: '1px solid',
      borderColor: link.selected ? 'var(--color-primary)' : 'var(--border-lighter)',
      borderRadius: 'var(--radius-base)',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
    onClick={() => toggleLink(link.id)}
    onMouseEnter={(e) => {
      if (!link.selected) {
        e.currentTarget.style.backgroundColor = 'var(--fill-lighter)';
      }
    }}
    onMouseLeave={(e) => {
      if (!link.selected) {
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }}
    >
      {/* Checkbox */}
      <div style={{
        width: '18px',
        height: '18px',
        border: '2px solid',
        borderColor: link.selected ? 'var(--color-primary)' : 'var(--border-base)',
        borderRadius: 'var(--radius-small)',
        backgroundColor: link.selected ? 'var(--color-primary)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {link.selected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* File Icon */}
      <div style={{ flexShrink: 0 }}>
        {getFileIcon()}
      </div>

      {/* File Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {link.filename}
        </div>
        {link.size !== null && (
          <div style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginTop: '2px'
          }}>
            {formatFileSize(link.size)}
          </div>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeLink(link.id);
        }}
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-base)',
          cursor: 'pointer',
          flexShrink: 0,
          opacity: 0.6,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.backgroundColor = 'var(--fill-light)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Trash2 size={14} color="var(--color-danger)" />
      </button>
    </div>
  );
}

export default LinkItem;
