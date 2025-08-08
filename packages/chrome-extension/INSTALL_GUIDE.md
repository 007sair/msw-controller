# MSW Controller Chrome 扩展安装指南

## 快速开始

### 1. 构建扩展包

```bash
cd chrome-extension
npm run build
```

这将在 `dist` 文件夹中创建 `msw-controller-extension.zip` 文件。

### 2. 安装扩展

#### 方法一：直接加载目录（推荐）
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `chrome-extension` 目录（当前目录）

#### 方法二：使用zip包
1. 直接将 `dist/msw-controller-extension.zip` 拖拽到 `chrome://extensions/` 页面
2. 或者解压后按照方法一的步骤加载文件夹

### 3. 使用扩展
1. 打开有 MSW 的网页
2. 按 F12 打开开发者工具
3. 在顶部标签栏找到「MSW Controller」
4. 开始管理你的 MSW handlers

## 功能特性

- 🔍 **实时查看**: 查看所有 MSW handlers 的状态
- 🎛️ **批量操作**: 支持全选/取消全选功能
- 🔄 **动态控制**: 实时启用/禁用 handlers
- 📊 **请求监控**: 监控被拦截的请求和响应
- 🔍 **搜索过滤**: 快速查找特定的 handlers
- 💾 **配置管理**: 导出/导入 handler 配置

## 文件说明

- `build.sh` - 构建脚本，创建发布包
- `dist/` - 构建输出目录
- `dist/msw-controller-extension.zip` - 构建后的压缩包
- `manifest.json` - 扩展配置文件
- `panel.html/js/css` - 主界面文件
- 当前目录 - 可直接被Chrome加载的扩展目录

## 常见问题

### Q: 扩展安装后找不到？
A: 确保在有 MSW 的页面中打开开发者工具，扩展只在检测到 MSW 时显示。

### Q: 如何更新扩展？
A: 重新运行 `npm run build`，然后在 `chrome://extensions/` 中点击扩展的「重新加载」按钮。

### Q: 扩展不工作？
A: 检查页面是否正确配置了 MSW，确保 Service Worker 已注册。

---

**需要帮助？** 查看项目 [README.md](./README.md) 或提交 Issue