import React, { useEffect, useState } from 'react';
import { browserApi } from '@/shared/utils/browserApi';
import { DEFAULT_SETTINGS, STORAGE_KEYS, FILE_TYPE_CATEGORIES } from '@/shared/constants';
import type { ExtensionSettings } from '@/shared/types';
import { t, tn } from '@/shared/utils/i18n';

function LinkCapture() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  // 临时输入状态
  const [newFileType, setNewFileType] = useState('');
  const [newBlacklistPattern, setNewBlacklistPattern] = useState('');
  const [newWhitelistDomain, setNewWhitelistDomain] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await browserApi.storage.get([STORAGE_KEYS.SETTINGS]);
    const storedSettings = result[STORAGE_KEYS.SETTINGS];

    if (storedSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
    }
  };

  const saveSettings = async () => {
    await browserApi.storage.set({ [STORAGE_KEYS.SETTINGS]: settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 快速添加文件类型分类
  const addFileTypeCategory = (category: keyof typeof FILE_TYPE_CATEGORIES) => {
    const extensions = FILE_TYPE_CATEGORIES[category];
    const newTypes = [...new Set([...settings.fileTypes, ...extensions])];
    setSettings({ ...settings, fileTypes: newTypes });
  };

  // 添加自定义文件类型
  const addCustomFileType = () => {
    if (!newFileType.trim()) return;

    let ext = newFileType.trim();
    if (!ext.startsWith('.')) {
      ext = '.' + ext;
    }

    if (!settings.fileTypes.includes(ext)) {
      setSettings({ ...settings, fileTypes: [...settings.fileTypes, ext] });
    }
    setNewFileType('');
  };

  // 移除文件类型
  const removeFileType = (type: string) => {
    setSettings({
      ...settings,
      fileTypes: settings.fileTypes.filter(t => t !== type)
    });
  };

  // 添加黑名单模式
  const addBlacklistPattern = () => {
    if (!newBlacklistPattern.trim()) return;

    const pattern = newBlacklistPattern.trim();
    if (!settings.urlBlacklist.includes(pattern)) {
      setSettings({ ...settings, urlBlacklist: [...settings.urlBlacklist, pattern] });
    }
    setNewBlacklistPattern('');
  };

  // 移除黑名单模式
  const removeBlacklistPattern = (pattern: string) => {
    setSettings({
      ...settings,
      urlBlacklist: settings.urlBlacklist.filter(p => p !== pattern)
    });
  };

  // 添加白名单域名
  const addWhitelistDomain = () => {
    if (!newWhitelistDomain.trim()) return;

    const domain = newWhitelistDomain.trim();
    if (!settings.domainWhitelist.includes(domain)) {
      setSettings({ ...settings, domainWhitelist: [...settings.domainWhitelist, domain] });
    }
    setNewWhitelistDomain('');
  };

  // 移除白名单域名
  const removeWhitelistDomain = (domain: string) => {
    setSettings({
      ...settings,
      domainWhitelist: settings.domainWhitelist.filter(d => d !== domain)
    });
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: 'var(--space-xl)' }}>
        {t('linkCaptureTitle')}
      </h1>

      {/* 文件大小过滤 */}
      <div className="options-section">
        <h2 className="options-section-title">{t('fileSizeFilter')}</h2>

        <div className="form-item">
          <label className="form-label">{t('minFileSize')}</label>
          <input
            type="number"
            className="form-input"
            value={Math.round(settings.minFileSize / (1024 * 1024))}
            onChange={(e) => setSettings({
              ...settings,
              minFileSize: parseInt(e.target.value) * 1024 * 1024
            })}
            min="0"
            step="1"
          />
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('minFileSizeDesc')}
          </div>
        </div>
      </div>

      {/* 文件类型过滤 */}
      <div className="options-section">
        <h2 className="options-section-title">{t('fileTypeFilter')}</h2>

        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          {t('fileTypeFilterDesc')}
        </div>

        {/* 快速添加分类按钮 */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>{t('quickAdd')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(FILE_TYPE_CATEGORIES).map(category => (
              <button
                key={category}
                onClick={() => addFileTypeCategory(category as keyof typeof FILE_TYPE_CATEGORIES)}
                style={{
                  padding: '4px 12px',
                  fontSize: '13px',
                  border: '1px solid var(--border-base)',
                  borderRadius: 'var(--radius-base)',
                  background: 'var(--fill-blank)',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 已选择的文件类型列表 */}
        {settings.fileTypes.length > 0 && (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              {tn('selectedTypes', { count: settings.fileTypes.length })}
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              padding: 'var(--space-md)',
              background: 'var(--fill-extra-light)',
              borderRadius: 'var(--radius-base)',
              border: '1px solid var(--border-base)'
            }}>
              {settings.fileTypes.map(type => (
                <div
                  key={type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-small)',
                    fontSize: '13px'
                  }}
                >
                  <span>{type}</span>
                  <button
                    onClick={() => removeFileType(type)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '16px',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSettings({ ...settings, fileTypes: [] })}
                style={{
                  padding: '4px 8px',
                  fontSize: '13px',
                  border: '1px solid var(--border-base)',
                  borderRadius: 'var(--radius-small)',
                  background: 'var(--fill-blank)',
                  cursor: 'pointer'
                }}
              >
                {t('clearAll')}
              </button>
            </div>
          </div>
        )}

        {/* 添加自定义文件类型 */}
        <div className="form-item">
          <label className="form-label">{t('addCustomFileType')}</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              type="text"
              className="form-input"
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomFileType()}
              placeholder={t('fileTypeInputPlaceholder')}
            />
            <button className="form-button" onClick={addCustomFileType}>
              {t('add')}
            </button>
          </div>
        </div>
      </div>

      {/* URL 黑名单 */}
      <div className="options-section">
        <h2 className="options-section-title">{t('urlBlacklist')}</h2>

        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          {t('urlBlacklistDesc')}
        </div>

        {/* 已有黑名单 */}
        {settings.urlBlacklist.length > 0 && (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              {tn('blacklistPatterns', { count: settings.urlBlacklist.length })}
            </div>
            <div style={{
              padding: 'var(--space-md)',
              background: 'var(--fill-extra-light)',
              borderRadius: 'var(--radius-base)',
              border: '1px solid var(--border-base)'
            }}>
              {settings.urlBlacklist.map((pattern, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    marginBottom: index < settings.urlBlacklist.length - 1 ? '8px' : 0,
                    background: 'var(--fill-blank)',
                    borderRadius: 'var(--radius-small)',
                    fontSize: '13px',
                    fontFamily: 'monospace'
                  }}
                >
                  <span>{pattern}</span>
                  <button
                    onClick={() => removeBlacklistPattern(pattern)}
                    style={{
                      background: 'var(--color-danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {t('remove')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 添加黑名单模式 */}
        <div className="form-item">
          <label className="form-label">{t('addBlacklistPattern')}</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              type="text"
              className="form-input"
              value={newBlacklistPattern}
              onChange={(e) => setNewBlacklistPattern(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBlacklistPattern()}
              placeholder={t('blacklistPatternPlaceholder')}
              style={{ fontFamily: 'monospace' }}
            />
            <button className="form-button" onClick={addBlacklistPattern}>
              {t('add')}
            </button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('blacklistPatternExample')}
          </div>
        </div>
      </div>

      {/* 域名白名单 */}
      <div className="options-section">
        <h2 className="options-section-title">{t('domainWhitelist')}</h2>

        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          {t('domainWhitelistDesc')}
        </div>

        {/* 已有白名单 */}
        {settings.domainWhitelist.length > 0 && (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              {tn('whitelistedDomains', { count: settings.domainWhitelist.length })}
            </div>
            <div style={{
              padding: 'var(--space-md)',
              background: 'var(--fill-extra-light)',
              borderRadius: 'var(--radius-base)',
              border: '1px solid var(--border-base)'
            }}>
              {settings.domainWhitelist.map((domain, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    marginBottom: index < settings.domainWhitelist.length - 1 ? '8px' : 0,
                    background: 'var(--fill-blank)',
                    borderRadius: 'var(--radius-small)',
                    fontSize: '13px'
                  }}
                >
                  <span>{domain}</span>
                  <button
                    onClick={() => removeWhitelistDomain(domain)}
                    style={{
                      background: 'var(--color-danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {t('remove')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 添加白名单域名 */}
        <div className="form-item">
          <label className="form-label">{t('addWhitelistDomain')}</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              type="text"
              className="form-input"
              value={newWhitelistDomain}
              onChange={(e) => setNewWhitelistDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addWhitelistDomain()}
              placeholder={t('domainPlaceholder')}
            />
            <button className="form-button" onClick={addWhitelistDomain}>
              {t('add')}
            </button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('domainExample')}
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
        <button className="form-button" onClick={saveSettings}>
          {t('save')}
        </button>

        {saved && (
          <div style={{
            padding: '8px 16px',
            color: 'var(--color-success)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center'
          }}>
            ✓ {t('saved')}
          </div>
        )}
      </div>
    </div>
  );
}

export default LinkCapture;
