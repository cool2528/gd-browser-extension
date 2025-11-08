import React, { useState, useEffect } from 'react';
import { Info, Github, Mail, ExternalLink, FileText } from 'lucide-react';
import { browserApi } from '../../shared/utils/browserApi';
import { t } from '@/shared/utils/i18n';

/**
 * About 页面组件
 * 显示扩展版本信息、兼容性、仓库链接等
 */
export function About() {
	const [extensionVersion, setExtensionVersion] = useState('');
	const [manifestData, setManifestData] = useState<{
		name: string;
		version: string;
		description: string;
		author: string;
	} | null>(null);

	useEffect(() => {
		// 获取扩展版本信息
		const manifest = chrome.runtime.getManifest();
		setExtensionVersion(manifest.version);
		setManifestData({
			name: manifest.name,
			version: manifest.version,
			description: manifest.description || '',
			author: manifest.author || 'GDownload Team'
		});
	}, []);

	const openExternalLink = (url: string) => {
		chrome.tabs.create({ url });
	};

	return (
		<div style={{ padding: '20px' }}>
			{/* 页面标题 */}
			<div style={{
				display: 'flex',
				alignItems: 'center',
				marginBottom: '24px',
				gap: '8px'
			}}>
				<Info size={24} color="var(--color-primary)" />
				<h1 style={{
					margin: 0,
					fontSize: '24px',
					fontWeight: 600,
					color: 'var(--text-primary)'
				}}>
					{t('aboutTitle')}
				</h1>
			</div>

			{/* 扩展信息卡片 */}
			<div style={{
				background: 'var(--bg-white)',
				border: '1px solid var(--border-base)',
				borderRadius: '8px',
				padding: '24px',
				marginBottom: '20px'
			}}>
				<h2 style={{
					margin: '0 0 16px 0',
					fontSize: '18px',
					fontWeight: 600,
					color: 'var(--text-primary)'
				}}>
					{t('aboutExtensionInfo')}
				</h2>

				{manifestData && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
								{t('aboutName')}
							</span>
							<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
								{manifestData.name}
							</span>
						</div>

						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
								{t('aboutVersion')}
							</span>
							<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
								v{manifestData.version}
							</span>
						</div>

						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
								{t('aboutAuthor')}
							</span>
							<span style={{ color: 'var(--text-primary)' }}>
								{manifestData.author}
							</span>
						</div>

						<div style={{
							marginTop: '8px',
							paddingTop: '12px',
							borderTop: '1px solid var(--border-light)'
						}}>
							<p style={{
								margin: 0,
								fontSize: '14px',
								color: 'var(--text-secondary)',
								lineHeight: '1.6'
							}}>
								{manifestData.description}
							</p>
						</div>
					</div>
				)}
			</div>

			{/* 兼容性信息卡片 */}
			<div style={{
				background: 'var(--bg-white)',
				border: '1px solid var(--border-base)',
				borderRadius: '8px',
				padding: '24px',
				marginBottom: '20px'
			}}>
				<h2 style={{
					margin: '0 0 16px 0',
					fontSize: '18px',
					fontWeight: 600,
					color: 'var(--text-primary)'
				}}>
					{t('aboutCompatibility')}
				</h2>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
							{t('aboutGDownloadVersion')}
						</span>
						<span style={{ color: 'var(--text-primary)' }}>
							v1.0.0+
						</span>
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
							{t('aboutAria2Version')}
						</span>
						<span style={{ color: 'var(--text-primary)' }}>
							v1.36.0+
						</span>
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
							{t('aboutBrowsers')}
						</span>
						<span style={{ color: 'var(--text-primary)' }}>
							Chrome 110+, Firefox 115+, Edge 110+
						</span>
					</div>
				</div>
			</div>

			{/* 链接卡片 */}
			<div style={{
				background: 'var(--bg-white)',
				border: '1px solid var(--border-base)',
				borderRadius: '8px',
				padding: '24px',
				marginBottom: '20px'
			}}>
				<h2 style={{
					margin: '0 0 16px 0',
					fontSize: '18px',
					fontWeight: 600,
					color: 'var(--text-primary)'
				}}>
					{t('aboutResources')}
				</h2>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					{/* GitHub Repository */}
					<button
						onClick={() => openExternalLink('https://github.com/cool2528/GDownload')}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							width: '100%',
							padding: '12px 16px',
							background: 'var(--fill-light)',
							border: '1px solid var(--border-base)',
							borderRadius: '6px',
							cursor: 'pointer',
							transition: 'all 0.2s'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = 'var(--fill-base)';
							e.currentTarget.style.borderColor = 'var(--color-primary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'var(--fill-light)';
							e.currentTarget.style.borderColor = 'var(--border-base)';
						}}
					>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
							<Github size={20} color="var(--text-primary)" />
							<div style={{ textAlign: 'left' }}>
								<div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
									{t('aboutGitHub')}
								</div>
								<div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
									{t('aboutGitHubDesc')}
								</div>
							</div>
						</div>
						<ExternalLink size={16} color="var(--text-secondary)" />
					</button>

					{/* Report Issue */}
					<button
						onClick={() => openExternalLink('https://github.com/cool2528/GDownload/issues')}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							width: '100%',
							padding: '12px 16px',
							background: 'var(--fill-light)',
							border: '1px solid var(--border-base)',
							borderRadius: '6px',
							cursor: 'pointer',
							transition: 'all 0.2s'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = 'var(--fill-base)';
							e.currentTarget.style.borderColor = 'var(--color-primary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'var(--fill-light)';
							e.currentTarget.style.borderColor = 'var(--border-base)';
						}}
					>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
							<Mail size={20} color="var(--text-primary)" />
							<div style={{ textAlign: 'left' }}>
								<div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
									{t('aboutReportIssue')}
								</div>
								<div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
									{t('aboutReportIssueDesc')}
								</div>
							</div>
						</div>
						<ExternalLink size={16} color="var(--text-secondary)" />
					</button>

					{/* Documentation */}
					<button
						onClick={() => openExternalLink('https://github.com/cool2528/GDownload#readme')}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							width: '100%',
							padding: '12px 16px',
							background: 'var(--fill-light)',
							border: '1px solid var(--border-base)',
							borderRadius: '6px',
							cursor: 'pointer',
							transition: 'all 0.2s'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = 'var(--fill-base)';
							e.currentTarget.style.borderColor = 'var(--color-primary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'var(--fill-light)';
							e.currentTarget.style.borderColor = 'var(--border-base)';
						}}
					>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
							<FileText size={20} color="var(--text-primary)" />
							<div style={{ textAlign: 'left' }}>
								<div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
									{t('aboutDocumentation')}
								</div>
								<div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
									{t('aboutDocumentationDesc')}
								</div>
							</div>
						</div>
						<ExternalLink size={16} color="var(--text-secondary)" />
					</button>
				</div>
			</div>

			{/* License 信息 */}
			<div style={{
				background: 'var(--bg-white)',
				border: '1px solid var(--border-base)',
				borderRadius: '8px',
				padding: '24px'
			}}>
				<h2 style={{
					margin: '0 0 16px 0',
					fontSize: '18px',
					fontWeight: 600,
					color: 'var(--text-primary)'
				}}>
					{t('aboutLicense')}
				</h2>

				<p style={{
					margin: 0,
					fontSize: '14px',
					color: 'var(--text-secondary)',
					lineHeight: '1.6'
				}}>
					{t('aboutLicenseText')}
				</p>

				<div style={{
					marginTop: '16px',
					padding: '12px',
					background: 'var(--fill-lighter)',
					borderRadius: '6px'
				}}>
					<p style={{
						margin: 0,
						fontSize: '12px',
						color: 'var(--text-secondary)',
						lineHeight: '1.5'
					}}>
						{t('aboutCopyright')}
					</p>
				</div>
			</div>
		</div>
	);
}
