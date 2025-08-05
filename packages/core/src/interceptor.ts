import type { RequestHandler } from 'msw'
import { http, passthrough } from 'msw'
import { type ConfigStorage, createStorage } from './storage'
import type {
  EventEmitter,
  EventListener,
  HandlerConfig,
  MSWControllerConfig,
  MSWControllerEvent,
  RequestRecord,
} from './types'

// Custom path matcher supporting static paths, parameters (:id) and wildcards (*)
function createPathMatcher(path: string): {
  test: (pathname: string) => boolean
} {
  const escapedPath = path
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\*/g, '.*')
    .replace(/:([^/]+)/g, '([^/]+)')

  const regex = new RegExp(`^${escapedPath}$`)

  return {
    test: (pathname: string) => regex.test(pathname),
  }
}

/**
 * Simple event emitter implementation for MSW controller events
 */
class SimpleEventEmitter implements EventEmitter {
  private listeners = new Map<MSWControllerEvent, Set<EventListener>>()

  on<T = any>(event: MSWControllerEvent, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  off<T = any>(event: MSWControllerEvent, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener)
    }
  }

  emit<T = any>(event: MSWControllerEvent, data?: T): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data)
        } catch (error) {
          // Prevent listener errors from breaking the emission process
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }
}

/**
 * Core controller for managing MSW handlers and request interception
 */
export class MSWController {
  private handlers = new Map<string, HandlerConfig>()
  private requestRecords: RequestRecord[] = []
  private storage: ConfigStorage
  private eventEmitter = new SimpleEventEmitter()
  private config: MSWControllerConfig

  constructor(config: MSWControllerConfig = {}) {
    this.config = {
      enableRequestLogging: true,
      maxRequestRecords: 100,
      ...config,
    }
    this.storage = createStorage(config.storage)
    this.loadConfiguration()
  }

  registerHandler(config: HandlerConfig): void {
    this.handlers.set(config.id, config)
    this.loadHandlerConfiguration(config.id)
    this.eventEmitter.emit('handler-registered', config)
  }

  unregisterHandler(id: string): void {
    const config = this.handlers.get(id)
    if (config) {
      this.handlers.delete(id)
      this.saveConfiguration()
      this.eventEmitter.emit('handler-unregistered', config)
    }
  }

  toggleHandler(id: string, enabled?: boolean): void {
    const config = this.handlers.get(id)
    if (config) {
      config.enabled = enabled !== undefined ? enabled : !config.enabled
      this.saveConfiguration()
      this.eventEmitter.emit(config.enabled ? 'handler-enabled' : 'handler-disabled', config)
    }
  }

  getHandlers(): HandlerConfig[] {
    return Array.from(this.handlers.values())
  }

  getHandler(id: string): HandlerConfig | undefined {
    return this.handlers.get(id)
  }

  getRequestRecords(): RequestRecord[] {
    return [...this.requestRecords]
  }

  clearRequestRecords(): void {
    this.requestRecords = []
  }

  on<T = any>(event: MSWControllerEvent, listener: EventListener<T>): void {
    this.eventEmitter.on(event, listener)
  }

  off<T = any>(event: MSWControllerEvent, listener: EventListener<T>): void {
    this.eventEmitter.off(event, listener)
  }

  private saveConfiguration(): void {
    const configs = Array.from(this.handlers.values())
    this.storage.saveHandlerConfigs(configs)
    this.eventEmitter.emit('config-changed', configs)
  }

  private loadConfiguration(): void {
    const savedConfigs = this.storage.loadHandlerConfigs()
    savedConfigs.forEach((savedConfig) => {
      const existingConfig = this.handlers.get(savedConfig.id!)
      if (existingConfig) {
        existingConfig.enabled = savedConfig.enabled ?? existingConfig.enabled
        existingConfig.name = savedConfig.name ?? existingConfig.name
        existingConfig.description = savedConfig.description ?? existingConfig.description
        existingConfig.tags = savedConfig.tags ?? existingConfig.tags
      }
    })
  }

  private loadHandlerConfiguration(handlerId: string): void {
    const savedConfigs = this.storage.loadHandlerConfigs()
    const savedConfig = savedConfigs.find((config) => config.id === handlerId)
    if (savedConfig) {
      const existingConfig = this.handlers.get(handlerId)
      if (existingConfig) {
        // Restore saved configuration while preserving defaults
        existingConfig.enabled = savedConfig.enabled ?? existingConfig.enabled
        existingConfig.name = savedConfig.name ?? existingConfig.name
        existingConfig.description = savedConfig.description ?? existingConfig.description
        existingConfig.tags = savedConfig.tags ?? existingConfig.tags
      }
    }
  }

  recordRequest(record: RequestRecord): void {
    if (!this.config.enableRequestLogging) return

    // Add new record to the beginning of the array
    this.requestRecords.unshift(record)

    // Maintain max records limit
    if (this.requestRecords.length > this.config.maxRequestRecords!) {
      this.requestRecords = this.requestRecords.slice(0, this.config.maxRequestRecords!)
    }

    this.eventEmitter.emit('request-intercepted', record)
  }

  updateRequestRecord(id: string, updates: Partial<RequestRecord>): void {
    if (!this.config.enableRequestLogging) return

    const recordIndex = this.requestRecords.findIndex((record) => record.id === id)
    if (recordIndex !== -1) {
      this.requestRecords[recordIndex] = {
        ...this.requestRecords[recordIndex],
        ...updates,
      }
      this.eventEmitter.emit('request-intercepted', this.requestRecords[recordIndex])
    }
  }
}

let globalController: MSWController | null = null

/**
 * Creates a global interceptor that can be used directly with setupWorker
 * @param handlers Array of MSW request handlers
 * @param config Optional configuration
 * @returns Interceptor that can be passed to setupWorker
 *
 * @example
 * ```typescript
 * import { setupWorker } from 'msw/browser'
 * import { createInterceptor } from '@msw-controller/core'
 *
 * const worker = setupWorker(createInterceptor(handlers))
 * await worker.start()
 * ```
 */
export function createInterceptor(
  handlers: RequestHandler[],
  config?: MSWControllerConfig,
): RequestHandler {
  // Ensure global controller exists
  if (!globalController) {
    globalController = new MSWController(config)
  }

  // Register all handlers
  const handlerConfigs = handlers.map((handler, index) => {
    let id = `handler-${index}`
    let name = `Handler ${index + 1}`
    let description = `Mock handler for API endpoint`

    try {
      const info = (handler as any).info as { method: string; path: string }
      if (info?.method && info?.path) {
        const method = info.method.toUpperCase()
        const path = info.path
        id = `${method}-${path}`.replace(/[^a-zA-Z0-9-_]/g, '-')
        name = `${method} ${path}`
        description = `Mock handler for ${method} ${path}`
      }
    } catch (error) {
      console.warn(`Failed to extract info from handler ${index}:`, error)
    }

    return {
      id,
      name,
      description,
      enabled: true,
      handler,
    }
  })

  handlerConfigs.forEach((config) => {
    globalController!.registerHandler(config)
  })

  // Return global interceptor
  return http.all('*', async ({ request }) => {
    const requestRecord: RequestRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: request.url,
      method: request.method,
      timestamp: Date.now(),
      requestHeaders: Object.fromEntries(request.headers.entries()),
    }

    globalController!.recordRequest(requestRecord)

    const allConfigs = globalController!.getHandlers()
    let matchedConfig: HandlerConfig | null = null

    // Iterate through all handlers for path matching
    for (const config of allConfigs) {
      const handler = config.handler
      const info = (handler as any).info as {
        method: string
        path: string
      }

      if (info && request.method === info.method.toUpperCase()) {
        const path = info.path

        try {
          const matcher = createPathMatcher(path)
          const url = new URL(request.url)
          const pathname = url.pathname

          if (matcher.test(pathname)) {
            globalController!.updateRequestRecord(requestRecord.id, {
              matched: true,
              handlerId: config.id,
            })

            if (config.enabled && !matchedConfig) {
              matchedConfig = config
            }
          }
        } catch (error) {
          console.warn('Path matching error for', path, error)
        }
      }
    }

    // Execute matched enabled handler
    if (matchedConfig) {
      const handler = matchedConfig.handler

      globalController!.updateRequestRecord(requestRecord.id, {
        intercepted: true,
      })

      try {
        const parsedResult = await handler.parse({ request })

        if (handler.predicate({ request, parsedResult })) {
          const params = parsedResult.match.params
          const { cookies } = parsedResult

          return (handler as any).resolver({
            request,
            params,
            cookies,
          })
        }
      } catch (error) {
        console.warn('Handler execution error:', error)
      }
    }

    return passthrough()
  })
}

/**
 * Gets or creates the global controller instance
 * @param config Optional configuration
 * @returns MSWController instance
 */
export function getControllerInstance(config?: MSWControllerConfig): MSWController {
  if (!globalController) {
    globalController = new MSWController(config)
  }
  return globalController
}
