# MSW Controller Chrome 扩展

一个 Chrome DevTools 扩展，为 MSW (Mock Service Worker) 提供可视化的管理界面，用于管理 MSW handlers 和监控网络请求。

## 功能特性

- **DevTools 集成**：作为 "MSW Controller" 面板出现在 Chrome DevTools 中，与 Elements、Network 等面板并列
- **请求记录监控**：实时监控页面的 HTTP 请求，显示请求方法、URL、时间戳和匹配状态
- **Handler 管理**：查看、启用/禁用 MSW handlers，支持实时切换
- **智能状态检测**：自动检测 MSW Controller 实例，提供相应的提示信息
- **搜索与过滤**：支持对 handlers 和请求记录进行搜索过滤
- **实时更新**：自动刷新数据，避免用户操作时的干扰
- **交互式操作**：点击请求记录可直接切换对应 handler 的状态

## 安装方法

### 快速安装

#### 方法一：直接加载（推荐）
1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 在右上角启用 "开发者模式"
3. 点击 "加载已解压的扩展程序"，选择 `chrome-extension` 目录
4. 扩展将被加载并可以使用

#### 方法二：使用构建包
```bash
# 构建扩展包
cd chrome-extension
npm run build
```

然后直接将 `dist/msw-controller-extension.zip` 拖拽到 `chrome://extensions/` 页面，或解压后按照方法一加载

> 📖 **详细安装指南**: 查看 [INSTALL_GUIDE.md](./INSTALL_GUIDE.md) 获取完整的安装说明、功能介绍和常见问题解答。

## 使用方法

1. 打开 Chrome DevTools（F12 或右键 → 检查）
2. 在 DevTools 面板中找到 "MSW Controller" 标签页
3. 扩展会自动检测当前页面是否有可用的 MSW Controller
4. 检测成功后，你可以：
   - 在 "请求记录" 标签页查看所有 HTTP 请求
   - 在 "Handlers" 标签页管理 MSW handlers
   - 点击请求记录快速切换对应 handler 的启用状态
   - 使用搜索功能快速定位特定的 handler 或请求
   - 清空请求历史记录
   - 在 "帮助" 标签页查看使用说明

## 系统要求

- 目标网页必须安装并初始化 `@msw-controller/core` 包
- MSW Controller 实例必须暴露到 `window.mswController` 或 `window.__MSW_CONTROLLER_INSTANCE__`
- Chrome 浏览器版本 88 或更高

## 文件结构

```
chrome-extension/
├── manifest.json          # 扩展清单文件 (Manifest V3)
├── devtools.html          # DevTools 页面入口
├── devtools.js            # DevTools 面板创建逻辑
├── panel.html             # 主面板 UI
├── panel.js               # 面板功能和 MSW 集成逻辑
├── panel.css              # 面板样式
├── background.js          # 后台服务工作者
├── icons/                 # 扩展图标
│   ├── icon16.svg
│   ├── icon32.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md              # 本文件
```

## 开发说明

扩展使用原生 JavaScript 和 CSS 构建，确保最大兼容性和最小依赖。

### 主要功能模块

1. **请求记录模块**：监控和显示 HTTP 请求，支持状态可视化
2. **Handler 管理模块**：显示和管理 MSW handlers，支持实时切换
3. **连接检测模块**：智能检测 MSW Controller 实例状态
4. **搜索过滤模块**：提供实时搜索和过滤功能

## 许可证

MIT