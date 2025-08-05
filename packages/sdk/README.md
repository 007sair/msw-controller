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
import { renderMSWController } from '@msw-controller/sdk';
import { getControllerInstance } from '@msw-controller/core';

// 获取或创建 MSW 控制器实例
const controller = getControllerInstance();

// 使用默认设置初始化 SDK
const mswController = renderMSWController(controller);
```

### 高级配置

```javascript
import { MSWControllerSDK } from '@msw-controller/sdk';
import { getControllerInstance } from '@msw-controller/core';

// 获取 MSW 控制器实例
const controller = getControllerInstance();

// 创建 SDK 实例
const mswController = new MSWControllerSDK(controller, {
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

### `renderMSWController(controller, config?)`

一个便捷函数，用于创建和初始化 MSWControllerSDK 实例。

**参数：**
- `controller`（必需）：类型为 `MSWController` 的控制器实例
- `config`（可选）：类型为 `MSWControllerConfig` 的配置对象

**返回值：** MSWControllerSDK 实例

### `MSWControllerSDK`

用于管理 MSW 控制器的主要 SDK 类。

#### 构造函数

```typescript
new MSWControllerSDK(controller: MSWController, config?: MSWControllerConfig)
```

#### 公共方法

##### 面板控制

- `toggle(): void` - 切换控制面板的显示/隐藏状态
- `open(): void` - 打开控制面板
- `close(): void` - 关闭控制面板

##### 按钮控制

- `showButton(): void` - 显示浮动按钮
- `hideButton(): void` - 隐藏浮动按钮

##### 配置管理

- `updateConfig(newConfig: Partial<MSWControllerConfig>): void` - 动态更新配置
- `getState(): object` - 获取当前状态（包括面板开关状态、按钮位置、配置等）

##### 数据管理

- `loadHandlerStates(): Promise<Record<string, boolean>>` - 加载所有 Handler 的启用状态

##### 持久化存储

- `savePanelLayout(position: {x: number, y: number}, size: {width: number, height: number}): void` - 保存面板布局
- `loadPanelLayout(): object` - 加载面板布局
- `savePanelVisibility(isVisible: boolean): void` - 保存面板可见性状态
- `saveThemePreference(isDarkMode: boolean): void` - 保存主题偏好
- `loadThemePreference(): boolean | undefined` - 加载主题偏好
- `resetPanelLayout(): void` - 重置面板布局到默认状态

##### 生命周期

- `destroy(): void` - 销毁 SDK 实例，清理所有 DOM 元素和事件监听器

#### 配置选项

```typescript
interface MSWControllerConfig {
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
    renderMSWController: (controller: MSWController, config?: MSWControllerConfig) => MSWControllerSDK;
    MSWControllerSDK: typeof MSWControllerSDK;
  };
}
```

## 使用示例

### 基本操作示例

```javascript
import { renderMSWController } from '@msw-controller/sdk';
import { getControllerInstance } from '@msw-controller/core';

// 创建 SDK 实例
const controller = getControllerInstance();
const sdk = renderMSWController(controller, {
  darkMode: true,
  onHandlerToggle: (handlerId, enabled) => {
    console.log(`Handler ${handlerId} is now ${enabled ? 'enabled' : 'disabled'}`);
  }
});

// 控制面板操作
sdk.open();           // 打开面板
sdk.close();          // 关闭面板
sdk.toggle();         // 切换面板状态

// 按钮控制
sdk.hideButton();     // 隐藏浮动按钮
sdk.showButton();     // 显示浮动按钮

// 动态更新配置
sdk.updateConfig({
  darkMode: false,
  panelWidth: 500
});

// 获取当前状态
const state = sdk.getState();
console.log('当前状态:', state);

// 清理资源
sdk.destroy();
```

### React 集成

```jsx
import React, { useEffect } from 'react';
import { renderMSWController } from '@msw-controller/sdk';
import { getControllerInstance } from '@msw-controller/core';

function App() {
  useEffect(() => {
    // 获取 MSW 控制器实例
    const controller = getControllerInstance();
    
    // 初始化 MSW 控制器 SDK
    const mswController = renderMSWController(controller, {
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

### 完整使用流程

```javascript
import { http, HttpResponse } from 'msw';
import { createInterceptor, getControllerInstance } from '@msw-controller/core';
import { renderMSWController } from '@msw-controller/sdk';

// 1. 定义 MSW handlers
const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ]);
  }),
  
  http.post('/api/users', () => {
    return HttpResponse.json({ id: 3, name: 'New User' }, { status: 201 });
  }),
  
  http.get('/api/posts/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Sample Post',
      content: 'This is a sample post content.'
    });
  })
];

// 2. 创建拦截器（这会自动注册 handlers 到 controller）
const interceptor = createInterceptor(handlers, {
  enableRequestLogging: true,
  maxRequestRecords: 50
});

// 3. 获取 controller 实例
const controller = getControllerInstance();

// 4. 创建并配置 SDK
const sdk = renderMSWController(controller, {
  initialPosition: { bottom: 20, right: 20 },
  darkMode: true,
  panelWidth: 400,
  panelHeight: 500,
  onToggle: (isOpen) => {
    console.log(`面板${isOpen ? '已打开' : '已关闭'}`);
  },
  onHandlerToggle: (handlerId, enabled) => {
    console.log(`${handlerId} ${enabled ? '已启用' : '已禁用'}`);
  }
});

// 5. 现在你可以在应用中发起请求，这些请求会被拦截并显示在控制面板中
fetch('/api/users')
  .then(response => response.json())
  .then(data => console.log('用户数据:', data));

// 6. 在应用卸载时清理资源
window.addEventListener('beforeunload', () => {
  sdk.destroy();
});
```

## 贡献

欢迎贡献！请阅读我们的贡献指南并向我们的 GitHub 仓库提交拉取请求。

## 许可证

MIT