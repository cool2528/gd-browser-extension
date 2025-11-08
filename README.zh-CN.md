# GDownload 浏览器扩展

> **捕获网页下载链接并发送至 GDownload - 强大的多协议下载管理器**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/cool2528/gd-browser-extension)

[English](README.md) | 简体中文

## 📖 目录

- [功能特性](#-功能特性)
- [系统要求](#-系统要求)
- [安装教程](#-安装教程)
  - [方式一：从源码安装（推荐）](#方式一从源码安装推荐)
  - [方式二：从浏览器商店安装](#方式二从浏览器商店安装)
- [配置与使用](#-配置与使用)
  - [第一步：启动 GDownload 主程序](#第一步启动-gdownload-主程序)
  - [第二步：配置浏览器扩展](#第二步配置浏览器扩展)
  - [第三步：开始使用](#第三步开始使用)
- [使用场景](#-使用场景)
- [常见问题](#-常见问题)
- [开发文档](#-开发文档)

## ✨ 功能特性

### 核心功能
- 🔗 **一键捕获** - 快速捕获网页中的所有下载链接
- 🕸️ **智能嗅探** - 自动拦截网络请求，捕获动态加载的资源
- ⚡ **批量下载** - 选择多个链接一次性发送到 GDownload
- 🎯 **智能过滤** - 按文件大小、类型、域名等条件过滤链接
- 📋 **右键菜单** - 右键任意链接快速发送到 GDownload

### 链接捕获方式
1. **DOM 层捕获** - 自动捕获页面中的 `<a>` 标签、`<video>`、`<audio>` 等元素
2. **网络层嗅探** - 拦截 HTTP 请求，捕获 XHR/Fetch 动态加载的资源
3. **属性监听** - 实时监听 DOM 属性变化，捕获延迟赋值的链接

### 智能识别
- ✅ 标准下载链接（`.zip`、`.exe`、`.iso` 等）
- ✅ 查询参数文件名（`?filename=xxx.pdf`）
- ✅ Magnet 磁力链接
- ✅ 视频音频媒体文件
- ✅ GitHub Releases 资源
- ✅ 带 `download` 属性的链接
- ✅ Content-Disposition 响应头

### 界面与体验
- 🎨 **统一设计** - 完美匹配 GDownload 的 Element Plus 设计风格
- 🌙 **深色模式** - 支持浅色/深色主题切换
- 🔒 **安全通信** - 通过 WebSocket 直连 aria2c JSON-RPC 接口
- 🌐 **跨浏览器** - 兼容 Chrome、Firefox、Edge

## 📋 系统要求

| 组件 | 版本要求 |
|------|---------|
| **浏览器** | Chrome 110+ / Firefox 115+ / Edge 110+ |
| **GDownload** | 1.0.0+ (需启用 aria2c) |
| **aria2c** | 1.36.0+ (GDownload 自带) |
| **Node.js** | 18.0+ (仅开发需要) |

## 📦 安装教程

### 方式一：从源码安装（推荐）

#### 步骤 1：编译扩展

1. **打开终端**，进入 GDownload 项目根目录：
   ```bash
   cd D:\workspace\GDownload
   ```

2. **进入扩展目录**：
   ```bash
   cd browser-extension
   ```

3. **安装依赖**（首次安装需要）：
   ```bash
   npm install
   ```

4. **编译扩展**：
   ```bash
   npm run build
   ```

   编译成功后，会在 `dist` 目录生成扩展文件。

#### 步骤 2：加载到浏览器

**对于 Chrome / Edge 浏览器：**

1. 打开浏览器扩展管理页面：
   - Chrome: 在地址栏输入 `chrome://extensions/`
   - Edge: 在地址栏输入 `edge://extensions/`

2. **开启"开发者模式"**（页面右上角的开关）

3. 点击**"加载已解压的扩展程序"**按钮

4. 选择编译生成的 `dist` 文件夹：
   ```
   D:\workspace\GDownload\browser-extension\dist
   ```

5. 确认后，扩展会出现在扩展列表中

**对于 Firefox 浏览器：**

1. 打开临时扩展调试页面：
   - 在地址栏输入 `about:debugging#/runtime/this-firefox`

2. 点击**"临时载入附加组件"**按钮

3. 选择 `dist` 目录下的 `manifest.json` 文件

4. 确认后，扩展会自动加载

> **⚠️ 注意**：Firefox 的临时加载在浏览器重启后会失效，需要重新加载。

#### 步骤 3：固定扩展图标（可选）

为了方便使用，建议将扩展图标固定到工具栏：

1. 点击浏览器工具栏的**扩展图标**（拼图图标）
2. 找到 **GDownload Extension**
3. 点击**固定图标**（📌 图标）

### 方式二：从浏览器商店安装

> 🚧 **开发中** - 暂未发布到商店，请使用方式一安装

计划上架平台：
- Chrome Web Store
- Microsoft Edge Add-ons
- Firefox Add-ons

## 🔧 配置与使用

### 第一步：启动 GDownload 主程序

扩展需要通过 aria2c 与 GDownload 主程序通信，因此需要先启动主程序。

#### 1.1 启动 GDownload

双击运行 GDownload 主程序：
```bash
gdownload.exe
```

#### 1.2 确认 aria2c 运行状态

GDownload 启动后会自动启动 aria2c 服务。在 GDownload 主界面可以看到连接状态。

**默认配置：**
- WebSocket 地址：`ws://127.0.0.1:16888/jsonrpc`
- RPC 密钥：`GDownload_secret`

> **💡 提示**：这些参数可以在 GDownload 设置中修改。

### 第二步：配置浏览器扩展

#### 2.1 打开扩展设置页面

**方式一：右键菜单**
1. 右键点击扩展图标
2. 选择**"选项"**或**"Options"**

**方式二：扩展管理页面**
1. 打开 `chrome://extensions/`
2. 找到 **GDownload Extension**
3. 点击**"详细信息"**
4. 点击**"扩展程序选项"**

#### 2.2 配置连接参数

在 **"Connection"**（连接）设置页面：

1. **WebSocket URL**（WebSocket 地址）
   - 默认值：`ws://127.0.0.1:16888/jsonrpc`
   - 如果 GDownload 使用了不同的端口，需要修改此处

2. **RPC Secret**（RPC 密钥）
   - 默认值：`GDownload_secret`
   - 必须与 GDownload 设置中的密钥一致

3. **Auto Connect**（自动连接）
   - 建议保持启用，扩展会在启动时自动连接 aria2c

4. **点击"Test Connection"**（测试连接）按钮
   - 如果显示 ✅ **Connected**，说明配置正确
   - 如果显示 ❌ 错误信息，请检查：
     - GDownload 是否正在运行
     - WebSocket URL 和 RPC Secret 是否正确
     - 防火墙是否阻止了连接

#### 2.3 配置捕获规则（可选）

在 **"Link Capture"**（链接捕获）设置页面，可以自定义过滤条件：

**文件大小过滤：**
- **Minimum File Size**：最小文件大小（MB），设为 0 表示不限制

**文件类型过滤：**
- 可选择预设分类（Video、Audio、Archive、Document、Image、Executable）
- 或添加自定义文件扩展名（如 `.iso`、`.dmg`）
- 留空表示捕获所有类型

**URL 黑名单：**
- 支持正则表达式
- 示例：`^https?://ads\.example\.com/` （排除广告域名）

**域名白名单：**
- 只捕获指定域名的链接
- 示例：`github.com`、`sourceforge.net`
- 留空表示捕获所有域名

#### 2.4 配置隐私与安全（可选）

在 **"Privacy & Security"**（隐私与安全）设置页面，控制发送到 GDownload 的 HTTP 请求头：

**基础请求头（通常安全）：**
- ✅ **Send User-Agent**：浏览器标识，默认启用
- ✅ **Send Referer**：来源页面，默认启用（某些下载需要）

**敏感请求头（需谨慎启用）：**
- ⚠️ **Send Cookie**：登录凭据，默认关闭（网盘下载可能需要）
- ⚠️ **Send Authorization**：授权令牌，默认关闭（私有 API 可能需要）

> **安全提示**：只在信任的网站启用敏感请求头，建议配合 URL 黑名单使用

### 第三步：开始使用

#### 使用方式 1：弹出窗口批量捕获

1. **打开任意包含下载链接的网页**
   - 例如：GitHub Releases、软件下载站、资源分享页面等

2. **点击扩展图标**
   - 扩展会自动捕获页面中的所有下载链接

3. **选择要下载的文件**
   - 勾选需要下载的文件（默认全选）
   - 可以使用搜索框过滤文件名
   - 点击 ❌ 图标移除不需要的链接

4. **发送到 GDownload**
   - 点击**"Send to GDownload"**按钮
   - 文件会自动添加到 GDownload 下载列表

#### 使用方式 2：右键菜单快速下载

1. **右键点击任意链接**
   - 可以是 `<a>` 标签、图片、视频等

2. **选择"Download with GDownload"**
   - 文件会立即发送到 GDownload

#### 使用方式 3：捕获页面所有链接

1. **在网页空白处右键**
2. **选择"Download All Links on Page"**
3. **在弹出窗口中选择需要的文件**

#### 使用方式 4：触发动态加载资源

某些网站的下载链接是通过 JavaScript 动态生成的，这时可以：

1. **点击网页上的"下载"按钮**
   - 网络层嗅探器会自动捕获 XHR/Fetch 请求

2. **打开扩展弹出窗口**
   - 动态加载的资源会出现在列表中

3. **发送到 GDownload**

## 🎯 使用场景

### 场景 1：批量下载 GitHub Releases

1. 打开 GitHub 项目的 Releases 页面
   ```
   例如：https://github.com/microsoft/vscode/releases
   ```

2. 点击扩展图标，会看到所有下载资源：
   - ✅ VSCode-win32-x64-1.85.0.zip
   - ✅ VSCode-darwin-arm64-1.85.0.zip
   - ✅ VSCode-linux-x64-1.85.0.tar.gz
   - ...

3. 选择需要的文件，点击"Send to GDownload"

### 场景 2：下载在线视频课程

1. 打开包含视频列表的网页

2. 扩展会自动捕获：
   - 页面中的视频链接
   - 通过 XHR 加载的 M3U8/MP4 资源

3. 批量发送到 GDownload 进行下载

### 场景 3：下载软件安装包

1. 访问软件下载页面

2. 扩展会识别：
   - ✅ `.exe` 安装程序
   - ✅ `.msi` 安装包
   - ✅ `.dmg` macOS 镜像
   - ✅ `.deb` / `.rpm` Linux 包
   - ✅ `.zip` / `.tar.gz` 压缩包

3. 选择对应系统的安装包下载

### 场景 4：下载网盘分享的资源

> **⚠️ 注意**：网盘链接通常需要登录和授权，扩展会自动携带浏览器的 Cookie 和 Referer。

1. 登录网盘（如百度网盘、阿里云盘等）

2. 打开分享链接

3. 点击"下载"按钮触发下载请求

4. 扩展会捕获真实下载地址并发送到 GDownload

## ❓ 常见问题

### Q1: 扩展图标显示"Disconnected"（未连接）

**可能原因：**
- GDownload 主程序未启动
- aria2c 服务未运行
- WebSocket URL 或 RPC Secret 配置错误
- 防火墙阻止了连接

**解决方法：**
1. 确认 GDownload 正在运行
2. 打开扩展设置，点击"Test Connection"测试
3. 检查配置是否与 GDownload 一致
4. 检查 Windows 防火墙设置

### Q2: 为什么有些链接没有被捕获？

**可能原因：**
- 文件大小小于设置的最小值
- 文件类型不在白名单中
- 链接被 URL 黑名单过滤
- 域名不在白名单中（如果设置了白名单）

**解决方法：**
1. 打开扩展设置 → Link Capture
2. 检查过滤条件：
   - 将 Minimum File Size 设置为 0
   - 清空 File Types（捕获所有类型）
   - 检查黑名单和白名单规则

### Q3: 下载的文件名是 `download_xxx` 这种格式

**原因：**
- 服务器没有提供文件名信息
- 扩展无法从 URL 或响应头中解析出文件名

**解决方法：**
- 这是正常现象，GDownload 会尝试重命名文件
- 如果文件很多，建议在发送前手动筛选

### Q4: 某些网站的动态资源捕获不到

**可能原因：**
- 网站使用了 Blob URL 或 Data URL
- 资源是通过 WebSocket 传输的
- 资源类型被过滤（如小图片、JSON API）

**解决方法：**
1. 尝试直接右键点击资源，选择"Download with GDownload"
2. 在扩展设置中调整过滤规则
3. 某些特殊资源可能需要使用 GDownload 主程序的浏览器功能

### Q5: Firefox 重启后扩展消失了

**原因：**
- Firefox 的"临时加载"功能在浏览器重启后会清除扩展

**解决方法：**
1. 重新打开 `about:debugging#/runtime/this-firefox`
2. 重新加载扩展
3. 或者等待扩展发布到 Firefox Add-ons 商店

### Q6: 如何更新扩展？

**从源码更新：**
1. 进入扩展目录：
   ```bash
   cd D:\workspace\GDownload\browser-extension
   ```
2. 拉取最新代码：
   ```bash
   git pull
   ```
3. 重新编译：
   ```bash
   npm run build
   ```
4. 打开浏览器扩展页面，点击刷新图标 🔄

**从商店更新：**
- 扩展商店会自动更新

### Q7: 扩展会不会泄露隐私？

**答案：否**

- ✅ 扩展**仅在本地**运行，不会上传任何数据到服务器
- ✅ WebSocket 连接是**本地回环**（127.0.0.1），不会访问外网
- ✅ Cookie 和请求头**仅用于**发送到 GDownload，不会被记录或上传
- ✅ 扩展**开源透明**，所有代码可审查

**最佳实践：**
- 仅在需要时启用扩展
- 在扩展设置中配置 URL 黑名单，避免捕获敏感网站的资源

## 🛠️ 开发文档

### 项目结构

```
browser-extension/
├── src/
│   ├── background/              # Service Worker（后台脚本）
│   │   ├── index.ts            # 主入口：消息处理、右键菜单
│   │   ├── aria2RpcClient.ts   # aria2c JSON-RPC 客户端
│   │   └── networkSniffer.ts   # 网络层嗅探器（webRequest API）
│   ├── content/                 # Content Script（内容脚本）
│   │   ├── index.ts            # 主入口：初始化、消息监听
│   │   └── linkCapture.ts      # DOM 层链接捕获服务
│   ├── popup/                   # 弹出窗口 UI
│   │   ├── index.html
│   │   ├── index.tsx           # React 入口
│   │   └── components/         # UI 组件
│   ├── options/                 # 设置页面 UI
│   │   ├── index.html
│   │   └── index.tsx
│   └── shared/                  # 共享代码
│       ├── types.ts            # TypeScript 类型定义
│       ├── constants.ts        # 常量配置
│       └── utils/              # 工具函数
│           ├── urlParser.ts    # URL 解析、文件名提取
│           └── browserApi.ts   # 浏览器 API 抽象层
├── public/
│   └── icons/                   # 扩展图标
├── dist/                        # 编译输出目录
├── manifest.json                # 扩展清单（Manifest V3）
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 技术栈

| 技术 | 用途 |
|------|------|
| **React 18** | UI 框架 |
| **TypeScript** | 类型安全 |
| **Vite 5** | 构建工具 |
| **CRXJS** | Vite 扩展插件 |
| **Zustand** | 状态管理 |
| **Lucide React** | 图标库 |
| **WebSocket API** | aria2c 通信 |

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 编译生产版本
npm run build

# 针对特定浏览器编译
npm run build:chrome
npm run build:firefox
npm run build:edge

# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm run test

# 打包发布
npm run package:chrome
npm run package:firefox
```

### 架构说明

#### 通信流程

```
┌─────────────────┐
│  网页（Tab）    │
│  用户浏览的页面 │
└────────┬────────┘
         │
         │ Content Script 捕获链接
         │ chrome.runtime.sendMessage()
         │
         ▼
┌─────────────────┐
│ Background SW   │ ← chrome.storage（配置、状态）
│  Service Worker │
└────────┬────────┘
         │
         │ WebSocket (JSON-RPC 2.0)
         │ ws://127.0.0.1:16888/jsonrpc
         │ {method: "aria2.addUri", params: [...]}
         │
         ▼
┌─────────────────┐
│     aria2c      │
│  下载引擎服务   │
└────────┬────────┘
         │
         │ 共享实例（同一端口）
         │
         ▼
┌─────────────────┐
│   GDownload     │
│    主程序 UI    │
└─────────────────┘
```

#### 链接捕获策略

| 捕获层 | 方法 | 优势 | 局限 |
|-------|------|------|------|
| **DOM 层** | `document.querySelectorAll()` | 快速、轻量 | 只能捕获静态链接 |
| **属性监听** | `MutationObserver` | 捕获延迟赋值 | 性能开销较大 |
| **网络层** | `chrome.webRequest` | 捕获所有请求 | 需要额外权限 |

### 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork 仓库**
2. **创建功能分支**：
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **提交更改**：
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **推送到分支**：
   ```bash
   git push origin feature/amazing-feature
   ```
5. **创建 Pull Request**

**代码规范：**
- 遵循 ESLint + Prettier 配置
- 为新功能添加测试
- 更新相关文档
- 确保跨浏览器兼容性

## 📄 开源协议

本项目采用 MIT 协议开源 - 详见 [LICENSE](LICENSE) 文件

## 🐛 问题反馈

- **Bug 报告**：[GitHub Issues](https://github.com/cool2528/gd-browser-extension/issues)
- **功能建议**：[GitHub Discussions](https://github.com/cool2528/gd-browser-extension/discussions)

## 📚 相关链接

- [GDownload 主程序](https://github.com/cool2528/GDownload)
- [aria2 官方文档](https://aria2.github.io/)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [Firefox 扩展开发文档](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions)

## 🙏 致谢

- [GDownload](https://github.com/cool2528/GDownload) - 主程序
- [aria2](https://github.com/aria2/aria2) - 下载引擎
- [Element Plus](https://element-plus.org/) - 设计灵感
- [CRXJS](https://crxjs.dev/) - Vite 扩展插件
- [React](https://react.dev/) - UI 框架

---

**© 2025 GDownload Team. 保留所有权利。**
