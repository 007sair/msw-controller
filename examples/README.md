# MSW Controller React Example

这个示例展示了 MSW Controller 在 React 应用中的实际使用效果。

## 🚀 快速启动

```bash
# 安装依赖
pnpm install

# 启动示例
pnpm dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看示例。

## 📋 示例功能

- **浮动控制面板**：右下角可拖拽的 MSW 控制按钮
- **处理器管理**：实时查看和切换 API 处理器状态
- **请求监控**：查看 API 请求历史和响应数据
- **API 测试**：用户管理、错误处理、延迟响应等测试场景

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

## 🎯 使用方法

1. **查看控制面板**：点击右下角的 MSW 按钮打开控制面板
2. **测试 API**：使用页面上的按钮测试不同的 API 端点
3. **切换处理器**：在控制面板中启用/禁用特定的 API 处理器
4. **监控请求**：查看实时的 API 请求记录和响应数据

> 详细的集成指南请参考 [USAGE.md](./USAGE.md)

## 📚 相关文档

- [集成指南](./USAGE.md) - 详细的集成和配置说明
- [MSW 官方文档](https://mswjs.io/) - Mock Service Worker 核心库