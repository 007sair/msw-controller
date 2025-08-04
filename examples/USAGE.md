# MSW Controller 集成指南

本指南详细介绍如何在你的 React 项目中从零开始集成 MSW Controller，包含最佳实践和性能优化建议。

## 🏗️ 架构概览

### 三层架构设计

```
应用层 (App.tsx)
├── SDK UI 初始化          # @msw-controller/sdk
└── 用户交互界面

核心层 (main.tsx + mocks/)
├── MSW Controller 启动     # @msw-controller/core  
├── 拦截器管理
└── Mock API 定义           # MSW 原生

基础层
├── Service Worker         # MSW 运行时
└── 浏览器 API 拦截
```

## 🚀 分步集成指南

### 第一步：环境准备

#### 1.1 安装必要依赖

```bash
# 基础依赖
npm install msw @msw-controller/core @msw-controller/sdk

# 或使用 pnpm（推荐）
pnpm add msw @msw-controller/core @msw-controller/sdk
```

#### 1.2 初始化 MSW Service Worker

```bash
# 生成 Service Worker 文件到 public 目录
npx msw init public/ --save
```

> ⚠️ **重要**：确保 `public/mockServiceWorker.js` 文件存在，这是 MSW 正常工作的前提。

### 第二步：定义 Mock API

#### 2.1 创建 Mock 处理器 (`src/mocks/handlers.ts`)

> 使用 **MSW 原生语法**定义 API 响应逻辑

```typescript
import { http, HttpResponse } from 'msw'

// 模拟数据
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' }
]

export const handlers = [
  // RESTful API 示例
  http.get('/api/users', () => {
    return HttpResponse.json({ success: true, data: users })
  }),
  
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json() as { name: string; email: string }
    const user = { id: Date.now(), ...newUser, role: 'User' }
    users.push(user)
    return HttpResponse.json({ success: true, data: user }, { status: 201 })
  }),
  
  // 错误处理示例
  http.get('/api/error', () => {
    return HttpResponse.json(
      { success: false, message: '服务器错误' }, 
      { status: 500 }
    )
  }),
  
  // 延迟响应示例
  http.get('/api/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return HttpResponse.json({ success: true, message: '延迟响应' })
  })
]
```

### 第三步：Core 包集成 - 拦截器管理

#### 3.1 配置启动逻辑 (`src/mocks/browser.ts`)

> 使用 **@msw-controller/core** 的简化 API

```typescript
import { createInterceptor } from '@msw-controller/core'
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 按照 MSW 官方推荐的方式创建 worker
// 使用 MSW Controller 的 createInterceptor 来增强 handlers
export const worker = setupWorker(createInterceptor(handlers))
```

#### 3.2 应用入口集成 (`src/main.tsx`)

> 按照 **MSW 官方推荐**的方式集成

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * 按照 MSW 官方推荐的方式启用 mocking
 * 只在开发环境下启用，避免影响生产环境
 */
async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }
  const { worker } = await import('./mocks/browser')
  return worker.start()
}

// 启用 mocking 后再渲染应用
enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
```

### 第四步：SDK 包集成 - UI 控制面板

#### 4.1 集成 UI 控制面板 (`src/App.tsx`)

> 使用 **@msw-controller/sdk** 提供可视化管理界面

```typescript
import React, { useEffect } from 'react'
import { initMSWController } from '@msw-controller/sdk'

function App() {
  // SDK 初始化：创建悬浮控制面板
  useEffect(() => {
    let mswController: any = null
    
    try {
      mswController = initMSWController({
        // 位置配置
        initialPosition: { 
          bottom: 80,  // 距离底部
          right: 50    // 距离右侧
        },
        
        // 外观配置
        darkMode: false,           // 主题模式
        buttonContent: 'MSW',      // 按钮文字
        enableDragging: true,      // 启用拖拽
        
        // 高级配置
        autoHide: false,           // 自动隐藏
        showOnHover: true,         // 悬停显示
      })
      
      console.log('✅ MSW Controller SDK 就绪')
    } catch (error) {
      console.error('❌ SDK 初始化失败:', error)
      console.warn('⚠️ 控制面板不可用，但不影响 Mock 功能')
    }

    // 重要：清理资源，避免内存泄漏
    return () => {
      if (mswController?.destroy) {
        mswController.destroy()
        console.log('🧹 SDK 资源已清理')
      }
    }
  }, [])

  return (
    <div className="app">
      {/* 你的应用内容 */}
      <h1>我的应用</h1>
      {/* MSW Controller 悬浮面板会自动显示在右下角 */}
    </div>
  )
}

export default App
```

## 📦 技术栈分层

### 🔧 MSW (Mock Service Worker)
- **角色**: 基础拦截引擎
- **职责**: HTTP 请求拦截、Service Worker 管理
- **核心 API**: `http.get()`, `http.post()`, `HttpResponse.json()`
- **文件位置**: `src/mocks/handlers.ts`, `public/mockServiceWorker.js`

### ⚙️ @msw-controller/core
- **角色**: 业务逻辑层
- **职责**: 拦截器生命周期、处理器动态管理、请求日志记录
- **核心 API**: 
  - `createInterceptor()` - 创建拦截器
  - `getControllerInstance()` - 获取控制器实例
  - `enableHandler()` / `disableHandler()` - 动态控制
- **集成位置**: `src/mocks/browser.ts`, `src/main.tsx`

### 🎨 @msw-controller/sdk
- **角色**: 用户界面层
- **职责**: 可视化控制面板、用户交互、主题管理
- **核心 API**:
  - `initMSWController()` - 创建悬浮控制面板
  - 配置选项: `initialPosition`, `darkMode`, `enableDragging`
- **集成位置**: `src/App.tsx` 或其他 React 组件

## 🎯 核心能力

### 🔄 动态 Mock 管理
```typescript
// 运行时启用/禁用特定处理器
import { getControllerInstance } from '@msw-controller/core'

// 获取控制器实例
const controller = getControllerInstance()

// 禁用用户相关 API
controller.disableHandler('/api/users')

// 重新启用
controller.enableHandler('/api/users')
```

### 📊 请求监控与调试
- **实时日志**: 查看所有被拦截的 HTTP 请求
- **响应详情**: 检查请求参数、响应数据、状态码
- **性能分析**: 监控请求耗时和频率
- **错误追踪**: 快速定位 Mock 配置问题

### 🎨 可视化控制界面
- **悬浮面板**: 不侵入应用 UI 的控制入口
- **拖拽定位**: 自由调整面板位置
- **主题适配**: 支持明暗主题切换
- **响应式设计**: 适配不同屏幕尺寸

## ⚡ 高级配置

### 环境隔离配置

```typescript
// 仅在开发环境启用
if (import.meta.env.DEV) {
  await setupMSW()
}

// 或基于环境变量
if (process.env.NODE_ENV === 'development') {
  await setupMSW()
}
```

### 条件性 Mock 启用

```typescript
// 基于 URL 参数控制
const urlParams = new URLSearchParams(window.location.search)
const enableMock = urlParams.get('mock') === 'true'

if (enableMock) {
  await setupMSW()
}
```

### 自定义 SDK 主题

```typescript
initMSWController({
  // 自定义主题色彩
  theme: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#ffffff',
    text: '#333333'
  },
  
  // 自定义按钮样式
  buttonStyle: {
    borderRadius: '50%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  }
})
```

## 💡 最佳实践指南

### 🚀 性能优化策略

#### 1. 非阻塞初始化
```typescript
// ✅ 推荐：MSW 启动后再渲染
enableMocking().then(() => {
  root.render(<App />)
})

// ❌ 避免：阻塞式初始化
async function startApp() {
  await enableMocking()  // 可能阻塞渲染
  root.render(<App />)
}
```

#### 2. 动态导入优化
```typescript
// ✅ 推荐：动态导入，减少主包体积
const { worker } = await import('./mocks/browser')

// ❌ 避免：静态导入，增加主包体积
import { worker } from './mocks/browser'
```

#### 3. 环境隔离
```typescript
// ✅ 推荐：仅开发环境启用
if (import.meta.env.DEV) {
  await setupMSW()
}

// ✅ 也可以：基于特定条件
if (window.location.hostname === 'localhost') {
  await setupMSW()
}
```

### 🛡️ 错误处理策略

#### 1. 优雅降级
```typescript
try {
  await enableMocking()
  console.log('✅ Mock 功能已启用')
} catch (error) {
  console.warn('⚠️ Mock 功能不可用，使用真实 API')
  // 应用继续正常运行
}
```

#### 2. 资源清理
```typescript
useEffect(() => {
  const controller = initMSWController(config)
  
  // 重要：清理资源
  return () => {
    controller?.destroy()
  }
}, [])
```

### 🔧 开发调试技巧

#### 1. 日志监控
```typescript
// 启用详细日志
import { getGlobalControllerInstance } from '@msw-controller/core'

const controller = getGlobalControllerInstance()
console.log('🔍 MSW Controller 状态:', {
  handlersCount: controller.getHandlers().length,
  isActive: controller.isActive,
  requestsLogged: controller.getRequestHistory().length
})
```

#### 2. 网络面板检查
- 打开开发者工具 → Network 面板
- 查看请求是否显示 "(from service worker)"
- 确认响应数据符合 Mock 定义

#### 3. 控制面板使用
- 点击悬浮按钮打开控制面板
- 在 "Handlers" 标签查看所有处理器状态
- 在 "Requests" 标签监控实时请求日志
- 使用搜索和过滤功能快速定位问题

## 🚨 常见问题解决

### Service Worker 相关

**问题**: MSW 无法启动，控制台报错 "Service Worker registration failed"

**解决方案**:
1. 确保 `public/mockServiceWorker.js` 文件存在
2. 检查服务器是否正确提供静态文件
3. 确认浏览器支持 Service Worker

```bash
# 重新生成 Service Worker 文件
npx msw init public/ --save
```

### 请求未被拦截

**问题**: API 请求没有被 Mock 处理

**解决方案**:
1. 检查 handler 路径是否与实际请求路径匹配
2. 确认 MSW Controller 已成功启动
3. 查看控制面板中 handler 是否被禁用

```typescript
// 检查路径匹配
http.get('/api/users', handler)     // ✅ 匹配 /api/users
http.get('/api/users/', handler)    // ❌ 不匹配 /api/users
http.get('/api/users/*', handler)   // ✅ 匹配 /api/users/1
```

### 内存泄漏

**问题**: 长时间使用后页面性能下降

**解决方案**:
1. 确保在组件卸载时调用 `destroy()`
2. 避免重复初始化 SDK
3. 定期清理请求历史记录

```typescript
// 正确的清理方式
useEffect(() => {
  const controller = initMSWController(config)
  return () => controller?.destroy()  // 关键！
}, [])
```

## 📚 进阶学习

- [MSW 官方文档](https://mswjs.io/) - 深入了解 Mock Service Worker
- [React 性能优化](https://react.dev/learn/render-and-commit) - 优化应用性能
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) - 理解底层原理