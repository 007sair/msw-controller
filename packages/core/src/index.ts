/**
 * MSW Controller Core - Main exports
 * Provides core functionality for managing MSW handlers and request interception
 */
export {
  createInterceptor,
  getControllerInstance,
  MSWController,
} from './interceptor'

export type {
  HandlerConfig,
  MSWControllerConfig,
  RequestRecord,
} from './types'
