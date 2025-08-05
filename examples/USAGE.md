# MSW Controller 集成指南

本指南介绍如何在 React 项目中集成 MSW Controller。

## 🏗️ 架构概览

MSW Controller 基于 MSW (Mock Service Worker) 构建，提供可视化的 Mock API 管理界面：

- **@msw-controller/core**: 拦截器管理和请求记录
- **@msw-controller/sdk**: 可视化控制面板 UI
- **MSW**: 底层的 Service Worker 拦截引擎

## 🚀 分步集成指南

### 第一步：安装依赖

```bash
# 安装依赖
pnpm add msw @msw-controller/core @msw-controller/sdk

# 初始化 MSW Service Worker
npx msw init public/ --save
```

### 第二步：定义 Mock API

创建 `src/mocks/handlers.ts` 文件：

```typescript
import { http, HttpResponse } from 'msw'

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' }
]

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({ success: true, data: users })
  }),
  
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json() as { name: string; email: string }
    const user = { id: Date.now(), ...newUser, role: 'User' }
    users.push(user)
    return HttpResponse.json({ success: true, data: user }, { status: 201 })
  }),
  
  http.get('/api/error', () => {
    return HttpResponse.json(
      { success: false, message: '服务器错误' }, 
      { status: 500 }
    )
  }),
  
  http.get('/api/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return HttpResponse.json({ success: true, message: '延迟响应' })
  })
]
```

### 第三步：Core 包集成

创建 `src/mocks/browser.ts` 文件：

```typescript
import { createInterceptor } from '@msw-controller/core'
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(createInterceptor(handlers))
```

修改 `src/main.tsx` 文件：

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }
  const { worker } = await import('./mocks/browser')
  return worker.start()
}

enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
```

### 第四步：SDK 包集成

在 `src/App.tsx` 中初始化控制面板：

```typescript
import React, { useEffect } from 'react'
import { getControllerInstance } from '@msw-controller/core'
import { renderMSWController } from '@msw-controller/sdk'

function App() {
  useEffect(() => {
    const controller = getControllerInstance()
    const mswController = renderMSWController(controller, {
      initialPosition: { bottom: 80, right: 50 },
      darkMode: false,
      buttonContent: 'MSW',
      panelWidth: 360,
      panelHeight: 450,
    })
    return () => {
      mswController.destroy()
    }
  }, [])

  return (
    <div className="app">
      <h1>我的应用</h1>
    </div>
  )
}

export default App
```

## 📦 核心 API

### @msw-controller/core

- `createInterceptor(handlers)` - 创建拦截器
- `getControllerInstance()` - 获取控制器实例
- `toggleHandler(id, enabled?)` - 动态控制处理器启用/禁用

### @msw-controller/sdk

- `renderMSWController(controller, config?)` - 创建控制面板
- 配置选项: `initialPosition`, `darkMode`, `panelWidth`, `panelHeight`

## 🎯 动态控制

```typescript
import { getControllerInstance } from '@msw-controller/core'

const controller = getControllerInstance()

// 禁用特定处理器
controller.toggleHandler('GET-/api/users', false)

// 重新启用
controller.toggleHandler('GET-/api/users', true)

// 切换状态
controller.toggleHandler('GET-/api/users')
```

## ⚡ 配置选项

### 环境控制

```typescript
// 仅在开发环境启用
if (import.meta.env.DEV) {
  await enableMocking()
}

// 基于 URL 参数控制
const urlParams = new URLSearchParams(window.location.search)
if (urlParams.get('mock') === 'true') {
  await enableMocking()
}
```

### SDK 配置

```typescript
import { getControllerInstance } from '@msw-controller/core'
import { renderMSWController } from '@msw-controller/sdk'

const controller = getControllerInstance()
renderMSWController(controller, {
  darkMode: true,
  buttonContent: '🔧',
  buttonClassName: 'custom-msw-button',
  panelClassName: 'custom-msw-panel',
  panelWidth: 400,
  panelHeight: 500,
  container: document.getElementById('msw-container')
})
```

### 调试技巧

- 在开发者工具 Network 面板查看请求是否显示 "(from service worker)"
- 使用控制面板的 "Handlers" 标签查看处理器状态
- 使用 "Requests" 标签监控请求日志

## 🚨 常见问题

### Service Worker 无法启动

确保 `public/mockServiceWorker.js` 文件存在：

```bash
npx msw init public/ --save
```

### 请求未被拦截

检查路径匹配：

```typescript
http.get('/api/users', handler)     // ✅ 匹配 /api/users
http.get('/api/users/', handler)    // ❌ 不匹配 /api/users（注意尾部斜杠）
http.get('/api/users/:id', handler) // ✅ 匹配 /api/users/1
```

### 内存泄漏

确保清理资源：

```typescript
useEffect(() => {
  const controller = renderMSWController(config)
  return () => controller?.destroy()
}, [])
```

---

更多信息请参考 [MSW 官方文档](https://mswjs.io/)