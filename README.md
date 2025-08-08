# MSW Controller

一个基于 MSW (Mock Service Worker) 的轻量级前端开发工具，用于在开发过程中动态控制接口 Mock 状态。

## 特性

- 🎯 **动态控制** - 通过悬浮按钮实时切换接口 Mock 状态
- 📊 **请求监控** - 实时查看页面所有请求记录
- 🎨 **现代 UI** - 简洁美观的控制面板
- 🔧 **轻量级** - 最小化外部依赖
- 📦 **Monorepo** - 支持多框架扩展
- 🚀 **TypeScript** - 完整的类型支持

## 包结构

- `@msw-controller/core` - 核心拦截器和存储管理
- `@msw-controller/sdk` - 通用 JavaScript/TypeScript SDK，支持所有框架
- `@msw-controller/chrome-extension` - Chrome DevTools 扩展，提供开发者工具面板

## 快速开始

### 前提条件

使用 MSW Controller 前，请确保：

1. **熟悉 MSW 基础用法** - 建议先阅读 [MSW 官方文档](https://mswjs.io/docs/integrations/browser)
2. **项目已安装 MSW** - 确保项目中已正确配置 Mock Service Worker

### 核心集成

只需要在现有的 MSW 配置中添加一行代码：

```bash
npm install @msw-controller/core
```

```diff
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
+ import { createInterceptor } from '@msw-controller/core'
 
- export const worker = setupWorker(...handlers)
+ export const worker = setupWorker(createInterceptor(...handlers))
```

就这么简单！现在你可以选择以下两种方式来控制 MSW handlers：

### 方式一：Chrome 扩展（推荐）

**零代码侵入**，直接在浏览器中控制：

1. 安装 Chrome 扩展：`@msw-controller/chrome-extension`
2. 打开 Chrome DevTools → MSW Controller 面板
3. 实时控制 handlers 的启用/禁用状态

详细安装指南：[Chrome 扩展安装指南](packages/chrome-extension/INSTALL_GUIDE.md)

### 方式二：SDK 集成

**代码级控制**，适合需要程序化管理的场景：

```bash
npm install @msw-controller/sdk
```

```javascript
// 在你的应用中 (例如 App.tsx)
import { getControllerInstance } from '@msw-controller/core'
import { renderMSWController } from '@msw-controller/sdk'
import { useEffect } from 'react'

function App() {
  // 初始化 MSW Controller SDK - 提供悬浮按钮和控制面板UI
  useEffect(() => {
    const controller = getControllerInstance()
    const mswController = renderMSWController(controller, {
       // 配置选项详见：packages/sdk/README.md
     })

    // 清理函数：组件卸载时销毁SDK实例
    return () => {
      mswController?.destroy()
    }
  }, [])

  return (
    <div className="App">
      {/* 你的应用内容 */}
    </div>
  )
}
```

完整示例请参考：[examples/src/App.tsx](examples/src/App.tsx)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

## 相关链接

- [MSW 官方文档](https://mswjs.io/)
- [问题反馈](https://github.com/007sair/msw-controller/issues)