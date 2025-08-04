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

## 快速开始

### 安装

```bash
npm install @msw-controller/core @msw-controller/sdk
```

### 基础用法

```typescript
// 1. 设置 MSW Controller
import { setupWorker } from 'msw/browser'
import { createInterceptor } from '@msw-controller/core'
import { handlers } from './mocks/handlers'

// 创建并启动 worker（一行代码完成所有设置）
const worker = setupWorker(createInterceptor(handlers))
await worker.start()
```

```tsx
// 2. 在应用（如 React）中使用控制器 SDK
import { useEffect } from 'react';
import { initMSWController, MSWControllerSDK } from '@msw-controller/sdk';

function App() {
  useEffect(() => {
    const mswController = initMSWController();
    return () => {
      mswController.destroy();
    };
  }, []);

  return (
    <div className="App">
      {/* 你的应用内容 */}
    </div>
  );
}

export default App
```

## 开发

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/msw-controller.git
cd msw-controller

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 相关链接

- [MSW 官方文档](https://mswjs.io/)
- [问题反馈](https://github.com/007sair/msw-controller/issues)