# MSW Controller React Example

这个示例展示了如何在 React 应用中集成和使用 MSW Controller。该示例使用了 `@msw-controller/core` 和 `@msw-controller/sdk` 两个包，演示了完整的 Mock API 管理功能。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 在项目根目录运行
pnpm install

# 进入示例目录并安装依赖
cd examples
pnpm install
```

### 2. 启动开发服务器

```bash
# 在 examples 目录下启动开发服务器
pnpm dev
```

### 3. 打开浏览器

访问 [http://localhost:5173](http://localhost:5173) 查看示例。

## 📋 功能特性

### 🎛️ MSW Controller 集成

- **Core 包集成**：使用 `@msw-controller/core` 进行 MSW 拦截器管理
- **SDK 包集成**：使用 `@msw-controller/sdk` 提供浮动控制面板 UI
- **浮动控制面板**：右下角的可拖拽控制按钮
- **处理器管理**：查看、启用/禁用 API 处理器
- **请求监控**：实时查看 API 请求历史
- **异步初始化**：不阻塞应用启动的初始化策略
- **错误容错**：MSW 初始化失败不影响应用正常运行

### 🔧 API 测试功能

- **用户管理**：获取用户列表、创建新用户、获取单个用户
- **内容管理**：获取文章列表
- **错误处理**：测试错误响应和异常情况
- **性能测试**：测试延迟响应（2秒延迟）

## 📁 项目结构

```
src/
├── mocks/
│   ├── browser.ts      # MSW Controller 启动配置
│   └── handlers.ts     # API 处理器定义
├── App.tsx            # 主应用组件（包含 SDK 初始化）
├── main.tsx           # 应用入口（包含 Core 初始化）
└── index.css          # 样式文件
public/
└── mockServiceWorker.js # MSW Service Worker 文件
package.json           # 项目配置和依赖
```

## 🎯 核心代码示例

### 1. MSW Controller Core 初始化（main.tsx）

```tsx
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

  // worker.start() 返回一个 Promise，在 Service Worker 准备好拦截请求时解析
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

### 2. MSW Controller SDK 集成（App.tsx）

```tsx
import { initMSWController } from '@msw-controller/sdk'
import React, { useEffect } from 'react'

function App() {
  useEffect(() => {
    let mswController: any = null
    
    try {
      // 初始化 SDK，创建悬浮按钮和控制面板
      mswController = initMSWController({
        initialPosition: { 
          bottom: 80,  // 距离底部80px
          right: 50    // 距离右侧50px
        },
        // 其他配置使用默认值：
        // - darkMode: false (浅色主题)
        // - buttonContent: 'MSW' (按钮文字)
        // - enableDragging: true (可拖拽)
      })
      console.log('✅ MSW Controller SDK 初始化成功')
    } catch (error) {
      console.error('❌ MSW Controller SDK 初始化失败:', error)
    }

    // 清理函数：组件卸载时销毁SDK实例
    return () => {
      if (mswController && typeof mswController.destroy === 'function') {
        mswController.destroy()
      }
    }
  }, [])

  return (
    <div>
      {/* 你的应用内容 */}
    </div>
  )
}
```

### 3. MSW Controller 启动配置（mocks/browser.ts）

```tsx
import { createInterceptor } from '@msw-controller/core'
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 按照 MSW 官方推荐的方式创建 worker
// 使用 MSW Controller 的 createInterceptor 来增强 handlers
export const worker = setupWorker(createInterceptor(handlers))

// 导出 handlers 以供其他地方使用
export { handlers }
```

### 4. MSW 处理器定义（mocks/handlers.ts）

```tsx

import { HttpResponse, http } from 'msw'

// 模拟数据
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User' }
]

export const handlers = [
  // 获取用户列表
  http.get('/api/users', () => {
    return HttpResponse.json({
      success: true,
      data: users,
      message: '用户列表获取成功'
    })
  }),

  // 创建新用户
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json() as { name: string; email: string; role: string }
    const user = { id: users.length + 1, ...newUser }
    users.push(user)
    
    return HttpResponse.json({
      success: true,
      data: user,
      message: '用户创建成功'
    }, { status: 201 })
  }),

  // 获取单个用户
  http.get('/api/users/:id', ({ params }) => {
    const user = users.find(u => u.id === Number(params.id))
    
    if (!user) {
      return HttpResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 })
    }
    
    return HttpResponse.json({
      success: true,
      data: user,
      message: '用户信息获取成功'
    })
  }),

  // 模拟延迟响应
  http.get('/api/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return HttpResponse.json({
      success: true,
      data: { message: '这是一个延迟2秒的响应' },
      message: '延迟响应成功'
    })
  })
]
```

## 🎨 自定义配置

### SDK 初始化配置

```tsx

import { initMSWController } from '@msw-controller/sdk'

const mswController = initMSWController({
  // 初始位置配置
  initialPosition: {
    bottom: 80,    // 距离底部距离
    right: 50,     // 距离右侧距离
    // 或者使用 top 和 left
    // top: 20,
    // left: 20
  },
  
  // 主题配置
  darkMode: false,           // 是否使用暗色主题
  
  // 按钮配置
  buttonContent: 'MSW',      // 按钮显示文字
  
  // 交互配置
  enableDragging: true       // 是否允许拖拽
})
```

### 项目配置（package.json）

```json
{
  "dependencies": 
    "@msw-controller/core": "workspace:*",
    "@msw-controller/sdk": "workspace:*",
    "msw": "^2.0.0",
  "msw": {
    "workrDirectory": ["public"]
  }
```

## 🔍 使用技巧

### 基本操作

1. **查看处理器状态**：点击右下角的 MSW 浮动按钮打开控制面板，查看所有已注册的 API 处理器

2. **切换处理器**：通过开关按钮启用或禁用特定的处理器

3. **监控请求**：在控制面板中查看实时的 API 请求记录和响应数据

4. **拖拽定位**：可以拖拽浮动按钮到屏幕的任意位置

### 测试功能

1. **API 测试**：使用页面上的按钮测试不同的 API 端点
   - 获取用户列表：`GET /api/users`
   - 创建新用户：`POST /api/users`
   - 获取单个用户：`GET /api/users/1`
   - 获取文章列表：`GET /api/posts`
   - 测试错误响应：`GET /api/error`
   - 测试延迟响应：`GET /api/slow`（2秒延迟）

2. **错误处理**：观察应用如何处理 404、500 等错误状态

3. **性能测试**：使用延迟响应测试应用的加载状态处理

### 开发调试

1. **控制台日志**：查看浏览器控制台了解 MSW Controller 的初始化和运行状态

2. **网络面板**：在开发者工具的网络面板中可以看到被 MSW 拦截的请求

3. **错误容错**：即使 MSW 初始化失败，应用也能正常运行

## 📚 相关文档

- [MSW 官方文档](https://mswjs.io/) - Mock Service Worker 核心库
- [React 官方文档](https://react.dev/) - React 框架
- [Vite 官方文档](https://vitejs.dev/) - 构建工具
- [TypeScript 官方文档](https://www.typescriptlang.org/) - 类型系统

## 🚨 注意事项

1. **Service Worker 文件**：确保 `public/mockServiceWorker.js` 文件存在，这是 MSW 正常工作的必要文件

2. **异步初始化**：MSW Controller 采用异步初始化策略，不会阻塞应用启动

3. **错误容错**：即使 MSW 初始化失败，应用也能正常运行，只是无法使用 Mock 功能

4. **开发环境**：此示例主要用于开发环境，生产环境请根据需要调整配置

5. **内存管理**：记得在组件卸载时调用 `destroy()` 方法清理 SDK 实例