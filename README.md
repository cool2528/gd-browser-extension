# GDownload Extension

> **Capture download links and send them to GDownload - a powerful multi-protocol download manager**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/cool2528/gd-browser-extension)

English | [简体中文](README.zh-CN.md)

## 🚀 Features

- 🔗 **One-Click Capture** - Quickly capture download links from web pages
- ⚡ **Batch Download** - Select multiple links and send them all at once
- 🎨 **Unified UI** - Perfectly matches GDownload's Element Plus design system
- 🔒 **Secure Communication** - Direct WebSocket connection to aria2c via JSON-RPC
- 🌐 **Cross-Browser** - Compatible with Chrome, Firefox, and Edge
- 🎯 **Smart Filtering** - Filter links by file size, type, and custom rules
- 🌙 **Dark Mode** - Support for light/dark theme switching

## 📋 Requirements

- **Browser**: Chrome 110+, Firefox 115+, or Edge 110+
- **GDownload**: Version 1.0.0+ with aria2c running
- **aria2c**: Version 1.36.0+ (bundled with GDownload)

## 📦 Installation

### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store page](https://chrome.google.com/webstore)
2. Click "Add to Chrome"
3. Follow the installation prompts

### From Source (Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/cool2528/gd-browser-extension.git
   cd gd-browser-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   # For Chrome/Edge
   npm run build:chrome

   # For Firefox
   npm run build:firefox
   ```

4. **Load in browser**:

   **Chrome/Edge**:
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

   **Firefox**:
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select any file in the `dist` folder

## 🔧 Configuration

### First-Time Setup

1. **Ensure GDownload is running** with aria2c enabled
2. **Open Extension Options** (right-click extension icon → Options)
3. **Configure Connection**:
   - WebSocket URL: `ws://127.0.0.1:16888/jsonrpc` (default)
   - RPC Secret: `GDownload_secret` (default)
   - Click "Test Connection" to verify

### Connection Settings

The extension connects directly to aria2c via WebSocket:

- **Default URL**: `ws://127.0.0.1:16888/jsonrpc`
- **Default Secret**: `GDownload_secret`
- **Auto Reconnect**: Enabled by default

> ⚠️ **Note**: These settings must match your GDownload aria2c configuration.

### Link Capture Settings (Optional)

In the **"Link Capture"** settings page, you can customize filtering rules:

**File Size Filter:**
- **Minimum File Size**: Set minimum file size in MB (0 = no limit)

**File Type Filter:**
- Select preset categories (Video, Audio, Archive, Document, Image, Executable)
- Or add custom file extensions (e.g., `.iso`, `.dmg`)
- Leave empty to capture all types

**URL Blacklist:**
- Supports regular expressions
- Example: `^https?://ads\.example\.com/` (exclude ad domains)

**Domain Whitelist:**
- Only capture links from specified domains
- Example: `github.com`, `sourceforge.net`
- Leave empty to capture from all domains

### Privacy & Security Settings (Optional)

In the **"Privacy & Security"** settings page, control which HTTP headers are sent with downloads:

**Basic Headers (Generally Safe):**
- ✅ **Send User-Agent**: Browser identifier, enabled by default
- ✅ **Send Referer**: Referring page, enabled by default (required for some downloads)

**Sensitive Headers (Enable with Caution):**
- ⚠️ **Send Cookie**: Login credentials, disabled by default (may be needed for cloud storage)
- ⚠️ **Send Authorization**: Auth tokens, disabled by default (may be needed for private APIs)

> **Security Tip**: Only enable sensitive headers for trusted websites, and use URL blacklist to prevent leaking credentials.

## 📖 Usage

### Capture Links from Web Pages

**Method 1: Right-Click Menu**
1. Right-click on any download link
2. Select "Download with GDownload"
3. The file will be added to GDownload automatically

**Method 2: Popup Interface**
1. Click the extension icon in the toolbar
2. All downloadable links on the current page will be captured
3. Select the files you want to download
4. Click "Send to GDownload"

**Method 3: Batch Capture**
1. Right-click anywhere on the page
2. Select "Download All Links on Page"
3. All captured links will appear in the popup

### Filter and Manage Links

**In the Popup**:
- Use the search box to filter links by name
- Toggle file selection with checkboxes
- Click the "X" button to remove unwanted links
- Click "Clear" to remove all links

**In Options → Link Capture**:
- Set minimum file size filter
- Choose file type filters (Video, Archive, Document, etc.)
- Add URL blacklist patterns
- Configure domain whitelist

## 🛠️ Development

### Project Structure

```
browser-extension/
├── src/
│   ├── background/         # Service Worker (aria2 RPC client, message handling)
│   ├── content/            # Content Script (link capture, page interaction)
│   ├── popup/              # Popup UI (link list, batch operations)
│   ├── options/            # Options UI (settings pages)
│   └── shared/             # Shared utilities and types
├── public/
│   └── icons/              # Extension icons
├── manifest.json           # Extension manifest (Manifest V3)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Development Commands

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Build for specific browser
npm run build:chrome
npm run build:firefox
npm run build:edge

# Run linting
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Package for distribution
npm run package:chrome
npm run package:firefox
npm run package:edge
```

### Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5 + CRXJS
- **State Management**: Zustand
- **Icons**: Lucide React
- **WebSocket**: Native WebSocket API
- **Manifest**: V3 (Chrome/Firefox/Edge compatible)

## 🔌 Architecture

### Communication Flow

```
┌─────────────────┐
│  Browser Tab    │
│  (Web Page)     │
└────────┬────────┘
         │
         │ Content Script captures links
         │
         ▼
┌─────────────────┐
│ Background SW   │
│ (Service Worker)│
└────────┬────────┘
         │
         │ WebSocket (JSON-RPC)
         │ ws://127.0.0.1:16888/jsonrpc
         │
         ▼
┌─────────────────┐
│    aria2c       │
│  (JSON-RPC)     │
└────────┬────────┘
         │
         │ Shared instance
         │
         ▼
┌─────────────────┐
│   GDownload     │
│   Main App      │
└─────────────────┘
```

### Key Features

- **Direct aria2c Connection**: No need to modify GDownload main app
- **Standard Protocol**: Uses aria2's official JSON-RPC 2.0 protocol
- **Real-time Communication**: WebSocket for bidirectional messaging
- **Auto Reconnection**: Exponential backoff strategy
- **Cross-browser Compatible**: Abstraction layer for browser APIs

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (ESLint + Prettier)
- Add tests for new features
- Update documentation as needed
- Ensure cross-browser compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

- **Bug Reports**: [GitHub Issues](https://github.com/cool2528/gd-browser-extension/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/cool2528/gd-browser-extension/discussions)

## 📞 Support

- **Documentation**: [User Guide](docs/USER_GUIDE.md)
- **FAQ**: [Frequently Asked Questions](docs/FAQ.md)
- **Troubleshooting**: [Common Issues](docs/TROUBLESHOOTING.md)

## 🙏 Acknowledgments

- [GDownload](https://github.com/cool2528/GDownload) - The main download manager application
- [aria2](https://github.com/aria2/aria2) - The download engine
- [Element Plus](https://element-plus.org/) - Design system inspiration
- [CRXJS](https://crxjs.dev/) - Vite plugin for browser extensions

---

**© 2025 GDownload Team. All rights reserved.**
