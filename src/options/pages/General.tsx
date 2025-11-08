import React, { useEffect, useState } from 'react';
import { browserApi } from '@/shared/utils/browserApi';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '@/shared/constants';
import type { ExtensionSettings } from '@/shared/types';
import { t } from '@/shared/utils/i18n';

function General() {
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
        {t('generalTitle')}
      </h1>

      <div className="options-section">
        <h2 className="options-section-title">{t('captureBehavior')}</h2>

        <div className="form-item">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={settings.autoCapture}
              onChange={(e) => setSettings({ ...settings, autoCapture: e.target.checked })}
            />
            <span>{t('autoCapture')}</span>
          </label>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
            {t('autoCaptureDesc')}
          </div>
        </div>

        <div className="form-item">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={settings.showNotifications}
              onChange={(e) => setSettings({ ...settings, showNotifications: e.target.checked })}
            />
            <span>{t('showNotifications')}</span>
          </label>
        </div>

        <div className="form-item">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={settings.autoSend}
              onChange={(e) => setSettings({ ...settings, autoSend: e.target.checked })}
            />
            <span>{t('autoSend')}</span>
          </label>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
            {t('autoSendDesc')}
          </div>
        </div>
      </div>

      <div className="options-section">
        <h2 className="options-section-title">{t('linkFiltering')}</h2>

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
        </div>
      </div>

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

export default General;
