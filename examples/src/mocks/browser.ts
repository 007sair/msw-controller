import { createInterceptor } from '@msw-controller/core'
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 按照 MSW 官方推荐的方式创建 worker
// 使用 MSW Controller 的 createInterceptor 来增强 handlers
export const worker = setupWorker(createInterceptor(handlers))
