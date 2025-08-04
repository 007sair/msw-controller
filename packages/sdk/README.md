# MSW Controller SDK

一个通用的 JavaScript/TypeScript SDK，用于通过可视化界面管理 Mock Service Worker (MSW) 处理器。

## 特性

- 🎯 **框架无关**: 适用于任何 JavaScript 框架或原生 JS
- 🎨 **可视化界面**: 浮动按钮和控制面板，轻松管理 MSW
- 🌙 **深色模式支持**: 内置深色/浅色主题切换
- 📱 **响应式设计**: 支持桌面和移动设备
- 🔧 **可定制**: 灵活的配置选项
- 🔌 **控制器注入**: 支持自定义 MSW 控制器实例
- 🌐 **CDN 就绪**: 即使使用 CDN 也有完整的 TypeScript 支持
- 📦 **轻量级**: 最少的依赖
- 💾 **持久化状态**: 记住面板位置、大小和主题偏好

## 安装

```bash
npm install @msw-controller/sdk
# 或者
yarn add @msw-controller/sdk
# 或者
pnpm add @msw-controller/sdk
```

## 快速开始

### 基础用法

```javascript
import { initMSWController } from '@msw-controller/sdk';

// 使用默认设置初始化
const mswController = initMSWController();
```

### CDN 方式

```html
<!DOCTYPE html>
<html>
<head>
  <title>MSW Controller 示例</title>
</head>
<body>
  <script src="https://unpkg.com/@msw-controller/sdk@latest/dist/index.umd.js"></script>
</body>
</html>
```

```javascript
import { initMSWController } from '@msw-controller/sdk';
import { getController } from '@msw-controller/core';

// 使用自定义控制器初始化 SDK
const mswController = initMSWController({
  controller: getController(); // 需要从 core 中拿到实例，否则无法同步数据到 UI 中
});
```

### 高级配置

```javascript
import { MSWControllerSDK } from '@msw-controller/sdk';

const mswController = new MSWControllerSDK({
  controller: myController, // 自定义 MSW 控制器实例
  initialPosition: { bottom: 50, right: 50 }, // 初始按钮位置
  buttonContent: 'MSW', // 自定义按钮文本或 HTML 元素
  buttonClassName: 'my-button-class', // 按钮的自定义 CSS 类
  panelClassName: 'my-panel-class', // 面板的自定义 CSS 类
  panelWidth: 360, // 面板宽度（像素）
  panelHeight: 450, // 面板高度（像素）
  darkMode: false, // 初始主题
  container: document.body, // 容器元素
  onToggle: (isOpen) => console.log('面板切换:', isOpen),
  onHandlerToggle: (handlerId, enabled) => {
    console.log(`处理器 ${handlerId} ${enabled ? '已启用' : '已禁用'}`);
  }
});
```

## API 参考

### `initMSWController(config?)`

一个便捷函数，用于创建和初始化 MSWControllerSDK 实例。

**参数：**
- `config`（可选）：类型为 `MSWControllerConfig` 的配置对象

**返回值：** MSWControllerSDK 实例

### `MSWControllerSDK`

用于管理 MSW 控制器的主要 SDK 类。

#### 构造函数

```typescript
new MSWControllerSDK(config?: MSWControllerConfig)
```

#### 配置选项

```typescript
interface MSWControllerConfig {
  controller?: MSWController; // 自定义 MSW 控制器实例
  initialPosition?: Position; // 初始按钮位置
  buttonContent?: string | HTMLElement; // 按钮文本/内容
  buttonClassName?: string; // 按钮的自定义 CSS 类
  panelClassName?: string; // 面板的自定义 CSS 类
  panelWidth?: number; // 面板宽度（像素，默认：360）
  panelHeight?: number; // 面板高度（像素，默认：450）
  darkMode?: boolean; // 初始深色模式状态
  container?: HTMLElement; // 容器元素（默认：document.body）
  onToggle?: (isOpen: boolean) => void; // 面板切换回调
  onHandlerToggle?: (handlerId: string, enabled: boolean) => void; // 处理器切换回调
}

interface Position {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}
```

### Window 全局对象 (CDN)

使用 CDN 时，SDK 通过 `window.MSWControllerSDK` 可用：

```typescript
interface Window {
  MSWControllerSDK: {
    initMSWController: (config?: MSWControllerConfig) => MSWControllerSDK;
  };
}
```

## 示例

### React 集成

```jsx
import React, { useEffect } from 'react';
import { initMSWController } from '@msw-controller/sdk';
import { getController } from '@msw-controller/core';

function App() {
  useEffect(() => {
    // 获取 MSW 控制器实例
    const controller = getController();
    
    // 初始化 MSW 控制器 SDK
    const mswController = initMSWController({
      controller: controller,
      initialPosition: { bottom: 50, right: 50 },
      darkMode: true,
      onToggle: (isOpen) => {
        console.log('MSW 面板切换:', isOpen);
      },
      onHandlerToggle: (handlerId, enabled) => {
        console.log(`处理器 ${handlerId} ${enabled ? '已启用' : '已禁用'}`);
      }
    });

    return () => {
      mswController.destroy();
    };
  }, []);

  return (
    <div>
      <h1>我的应用</h1>
      {/* 你的应用内容 */}
    </div>
  );
}

export default App;
```

## 贡献

欢迎贡献！请阅读我们的贡献指南并向我们的 GitHub 仓库提交拉取请求。

## 许可证

MIT