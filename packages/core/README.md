# @msw-controller/core

MSW Controller 的核心包 - 为 Mock Service Worker 提供拦截器功能。

## 安装

```bash
npm install @msw-controller/core
# 或者
pnpm add @msw-controller/core
# 或者
yarn add @msw-controller/core
```

## 快速开始

### 简单用法（推荐）

使用 MSW Controller 最简单的方式是通过 `createInterceptor` 函数：

```typescript
import { setupWorker } from 'msw/browser'
import { http, HttpResponse } from 'msw'
import { createInterceptor } from '@msw-controller/core'

// 定义你的处理器
const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: 1, name: 'John' }])
  }),
  http.post('/api/users', () => {
    return HttpResponse.json({ id: 2, name: 'Jane' })
  })
]

// 使用全局拦截器创建 worker
const worker = setupWorker(createInterceptor(handlers))

// 启动 worker
await worker.start()
```

就是这样！MSW Controller 将自动：
- 注册所有你的处理器
- 启用请求日志记录
- 提供处理器管理功能
- 允许运行时切换处理器状态

### 高级用法

对于高级操作，你可以获取控制器实例：

```typescript
import { getControllerInstance } from '@msw-controller/core'

// 获取控制器实例进行高级操作
const controller = getControllerInstance()

// 访问高级功能
controller.toggleHandler('GET-/api/users', false) // 禁用特定处理器
const records = controller.getRequestRecords() // 获取请求日志
controller.on('request-intercepted', (record) => {
  console.log('请求被拦截:', record.url)
})
```

## API 参考

### `createInterceptor(handlers, config?)`

创建一个可以直接用于 `setupWorker` 的全局拦截器。

**参数：**
- `handlers: RequestHandler[]` - MSW 请求处理器数组
- `config?: MSWControllerConfig` - 可选配置

**返回值：** `RequestHandler` - 可传递给 `setupWorker` 的拦截器

### `getControllerInstance(config?)`

获取或创建全局 MSW Controller 实例。

**参数：**
- `config?: MSWControllerConfig` - 可选配置

**返回值：** `MSWController` - 全局控制器实例



## 配置

```typescript
interface MSWControllerConfig {
  storage?: StorageInterface           // 自定义存储实现
  enableRequestLogging?: boolean       // 启用请求日志记录（默认：true）
  maxRequestRecords?: number          // 最大请求记录数量（默认：100）
}
```

## 功能特性

- **简单集成**：与现有 MSW 设置无缝协作
- **请求日志**：自动记录所有被拦截的请求
- **处理器管理**：运行时启用/禁用特定处理器
- **持久化配置**：处理器状态保存到 localStorage
- **事件系统**：监听处理器和请求事件
- **TypeScript 支持**：完整的 TypeScript 支持和类型定义

## 许可证

MIT