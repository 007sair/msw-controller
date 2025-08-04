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
# 使用 npm
npm install @msw-controller/core @msw-controller/sdk

# 使用 yarn
yarn add @msw-controller/core @msw-controller/sdk

# 使用 pnpm
pnpm add @msw-controller/core @msw-controller/sdk
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

```javascript
// 2. 在应用中使用控制器 SDK
import { initMSWController } from '@msw-controller/sdk'

// 初始化控制器
const controller = initMSWController({
  position: { x: 20, y: 20 },
  isDarkMode: false
})

// 控制器会自动显示悬浮按钮和控制面板
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

### 项目结构

```
msw-controller/
├── packages/
│   ├── core/           # 核心包
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── react/          # React 组件包
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
├── reference/          # 参考资料
├── package.json        # 根配置
├── pnpm-workspace.yaml # workspace 配置
└── README.md
```

## 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 相关链接

- [MSW 官方文档](https://mswjs.io/)
- [问题反馈](https://github.com/your-username/msw-controller/issues)
- [更新日志](CHANGELOG.md)