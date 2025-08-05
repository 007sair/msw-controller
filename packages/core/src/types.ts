import type { RequestHandler } from 'msw'

/**
 * Configuration for a single MSW handler
 */
export interface HandlerConfig {
  id: string
  name: string
  enabled: boolean
  handler: RequestHandler
  description?: string
  tags?: string[]
}

/**
 * Record of an intercepted HTTP request
 */
export interface RequestRecord {
  id: string
  url: string
  method: string
  timestamp: number
  status?: number
  responseTime?: number
  requestHeaders?: Record<string, string>
  responseHeaders?: Record<string, string>
  requestBody?: any
  responseBody?: any
  handlerId?: string
  handlerName?: string
  matched?: boolean
  intercepted?: boolean
}

export interface HandlerMeta {
  id: string
  name: string
  description?: string
  tags?: string[]
  enabled: boolean
  method?: string
  path?: string
}

export interface StorageInterface {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * Configuration options for MSWController
 */
export interface MSWControllerConfig {
  storage?: StorageInterface
  enableRequestLogging?: boolean
  maxRequestRecords?: number
}

/**
 * Events emitted by MSWController
 */
export type MSWControllerEvent =
  | 'handler-registered'
  | 'handler-unregistered'
  | 'handler-enabled'
  | 'handler-disabled'
  | 'request-intercepted'
  | 'config-changed'

export type EventListener<T = any> = (data: T) => void

export interface EventEmitter {
  on<T = any>(event: MSWControllerEvent, listener: EventListener<T>): void
  off<T = any>(event: MSWControllerEvent, listener: EventListener<T>): void
  emit<T = any>(event: MSWControllerEvent, data?: T): void
}
