import React, { useEffect, useState } from 'react';
import { browserApi } from '@/shared/utils/browserApi';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '@/shared/constants';
import type { ExtensionSettings } from '@/shared/types';
import { t } from '@/shared/utils/i18n';

function Privacy() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

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

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: 'var(--space-xl)' }}>
        {t('privacyTitle')}
      </h1>

      {/* 请求头设置说明 */}
      <div style={{
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
        background: 'var(--fill-extra-light)',
        borderRadius: 'var(--radius-base)',
        border: '1px solid var(--border-base)',
        fontSize: '14px',
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
          ℹ️ {t('aboutHeadersTitle')}
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          {t('aboutHeadersDesc')}
        </div>
      </div>

      {/* 基础请求头 */}
      <div className="options-section">
        <h2 className="options-section-title">{t('basicHeaders')}</h2>

        <div className="form-item">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={settings.sendUserAgent}
              onChange={(e) => setSettings({ ...settings, sendUserAgent: e.target.checked })}
            />
            <span>{t('sendUserAgent')}</span>
          </label>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
            {t('sendUserAgentDesc')}
          </div>
        </div>

        <div className="form-item">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={settings.sendReferer}
              onChange={(e) => setSettings({ ...settings, sendReferer: e.target.checked })}
            />
            <span>{t('sendReferer')}</span>
          </label>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
            {t('sendRefererDesc')}
          </div>
        </div>
      </div>

      {/* 敏感请求头 */}
      <div className="options-section">
        <h2 className="options-section-title" style={{ color: 'var(--color-warning)' }}>
          ⚠️ {t('sensitiveHeaders')}
        </h2>

        <div style={{
          padding: 'var(--space-sm)',
          marginBottom: 'var(--space-md)',
          background: '#fef0f0',
          borderRadius: 'var(--radius-base)',
          border: '1px solid var(--color-danger)',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          <strong style={{ color: 'var(--color-danger)' }}>{t('securityNoticeTitle')}</strong> {t('securityNoticeDesc')}
        </div>

        <div className="form-item">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={settings.sendCookies}
              onChange={(e) => setSettings({ ...settings, sendCookies: e.target.checked })}
            />
            <span style={{ fontWeight: 600 }}>{t('sendCookie')}</span>
          </label>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
            {t('sendCookieDesc')}
          </div>
        </div>

        <div className="form-item">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={settings.sendAuthorization}
              onChange={(e) => setSettings({ ...settings, sendAuthorization: e.target.checked })}
            />
            <span style={{ fontWeight: 600 }}>{t('sendAuthorization')}</span>
          </label>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
            {t('sendAuthorizationDesc')}
          </div>
        </div>
      </div>

      {/* 使用建议 */}
      <div className="options-section">
        <h2 className="options-section-title">{t('recommendations')}</h2>

        <div style={{
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'var(--text-secondary)'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text-primary)' }}>✅ {t('safeToEnable')}</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '24px' }}>
              <li>{t('safeUserAgent')}</li>
              <li>{t('safeReferer')}</li>
            </ul>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: 'var(--color-warning)' }}>⚠️ {t('enableWithCaution')}</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '24px' }}>
              <li>{t('cautionCookies')}</li>
              <li>{t('cautionAuthorization')}</li>
            </ul>
          </div>

          <div>
            <strong style={{ color: 'var(--text-primary)' }}>💡 {t('bestPractice')}</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '24px' }}>
              <li>{t('bestPractice1')}</li>
              <li>{t('bestPractice2')}</li>
              <li>{t('bestPractice3')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 当前配置摘要 */}
      <div className="options-section">
        <h2 className="options-section-title">{t('currentConfiguration')}</h2>

        <div style={{
          padding: 'var(--space-md)',
          background: 'var(--fill-extra-light)',
          borderRadius: 'var(--radius-base)',
          border: '1px solid var(--border-base)',
          fontFamily: 'monospace',
          fontSize: '13px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('headerUserAgent')}</span>{' '}
            <span style={{ color: settings.sendUserAgent ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {settings.sendUserAgent ? t('statusEnabledSafe') : t('statusDisabledSafe')}
            </span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('headerReferer')}</span>{' '}
            <span style={{ color: settings.sendReferer ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {settings.sendReferer ? t('statusEnabledSafe') : t('statusDisabledSafe')}
            </span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('headerCookie')}</span>{' '}
            <span style={{ color: settings.sendCookies ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {settings.sendCookies ? t('statusEnabledSensitive') : t('statusDisabledSecure')}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>{t('headerAuthorization')}</span>{' '}
            <span style={{ color: settings.sendAuthorization ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {settings.sendAuthorization ? t('statusEnabledSensitive') : t('statusDisabledSecure')}
            </span>
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

export default Privacy;
