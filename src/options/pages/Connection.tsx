import React, { useEffect, useState } from 'react';
import { browserApi } from '@/shared/utils/browserApi';
import { DEFAULT_ARIA2_CONFIG, STORAGE_KEYS } from '@/shared/constants';
import type { Aria2Config } from '@/shared/types';
import { t } from '@/shared/utils/i18n';

function Connection() {
  const [config, setConfig] = useState<Aria2Config>(DEFAULT_ARIA2_CONFIG);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const result = await browserApi.storage.get([STORAGE_KEYS.SETTINGS]);
    const settings = result[STORAGE_KEYS.SETTINGS];
    
    if (settings?.aria2Config) {
      setConfig(settings.aria2Config);
    }
  };

  const saveConfig = async () => {
    const result = await browserApi.storage.get([STORAGE_KEYS.SETTINGS]);
    const settings = result[STORAGE_KEYS.SETTINGS] || {};
    
    await browserApi.storage.set({
      [STORAGE_KEYS.SETTINGS]: {
        ...settings,
        aria2Config: config
      }
    });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await browserApi.runtime.sendMessage({
        action: 'testConnection'
      });

      if (response.success) {
        setTestResult({
          success: true,
          message: 'Connection successful! aria2c is running.'
        });
      } else {
        setTestResult({
          success: false,
          message: response.error || 'Connection failed'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: 'var(--space-xl)' }}>
        {t('connectionTitle')}
      </h1>

      <div className="options-section">
        <h2 className="options-section-title">{t('aria2Config')}</h2>

        <div className="form-item">
          <label className="form-label">{t('websocketUrl')}</label>
          <input
            type="text"
            className="form-input"
            value={config.url}
            onChange={(e) => setConfig({ ...config, url: e.target.value })}
            placeholder="ws://127.0.0.1:16888/jsonrpc"
          />
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('websocketUrlDesc')}
          </div>
        </div>

        <div className="form-item">
          <label className="form-label">{t('rpcSecret')}</label>
          <input
            type="password"
            className="form-input"
            value={config.secret}
            onChange={(e) => setConfig({ ...config, secret: e.target.value })}
            placeholder="GDownload_secret"
          />
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t('rpcSecretDesc')}
          </div>
        </div>

        <div className="form-item">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={config.autoConnect}
              onChange={(e) => setConfig({ ...config, autoConnect: e.target.checked })}
            />
            <span>{t('autoConnect')}</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <button className="form-button" onClick={testConnection} disabled={testing}>
            {testing ? t('testing') : t('testConnection')}
          </button>

          {testResult && (
            <div style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-base)',
              fontSize: '14px',
              backgroundColor: testResult.success ? 'var(--fill-extra-light)' : '#fef0f0',
              color: testResult.success ? 'var(--color-success)' : 'var(--color-danger)',
              border: '1px solid',
              borderColor: testResult.success ? 'var(--color-success)' : 'var(--color-danger)'
            }}>
              {testResult.success ? t('connectionSuccessful') : t('connectionFailed')}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
        <button className="form-button" onClick={saveConfig}>
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

export default Connection;
