# @msw-controller/core

## 1.0.3

### Patch Changes

- improve code documentation and type definitions

## 1.0.2

### Patch Changes

- **支持 Controller 实例注入**

  ## 新功能

  - SDK 现在支持通过配置参数传入自定义 MSWController 实例
  - 保持向后兼容，未提供时自动使用全局 controller
  - 完整的 TypeScript 类型支持

  ## 使用方式

  ```typescript
  import { getController, initMSWController } from "@msw-controller/sdk";

  const sdk = initMSWController({
    controller: getController(), // 仅 CDN 方式下需要引入
    darkMode: true,
  });
  ```

  ## 解决的问题

  - 修复了 SDK 与 core 数据联动问题
  - 支持多个独立的 controller 实例

## 1.0.0

### Major Changes

- release
