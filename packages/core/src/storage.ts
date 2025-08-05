import type { HandlerConfig, StorageInterface } from './types'

export const MSW_LOCAL_STORAGE_KEY = 'msw-controller-config'

/**
 * Default storage implementation using browser localStorage
 */
class DefaultStorage implements StorageInterface {
  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key)
    }
    return null
  }

  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value)
    }
  }

  removeItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key)
    }
  }
}

/**
 * Mock storage implementation for testing environments
 */
class MockStorage implements StorageInterface {
  private storage = new Map<string, string>()

  getItem(key: string): string | null {
    return this.storage.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }
}

/**
 * Configuration storage manager for MSW controller settings
 */
export class ConfigStorage {
  private storage: StorageInterface

  constructor(storage?: StorageInterface) {
    this.storage = storage || new DefaultStorage()
  }

  saveHandlerConfigs(configs: HandlerConfig[]): void {
    try {
      const configData = {
        // Only save serializable configuration data
        handlers: configs.map((config) => ({
          id: config.id,
          name: config.name,
          enabled: config.enabled,
          description: config.description,
          tags: config.tags,
        })),
        timestamp: Date.now(),
      }
      this.storage.setItem(MSW_LOCAL_STORAGE_KEY, JSON.stringify(configData))
    } catch (error) {
      console.warn('Failed to save MSW Controller configuration:', error)
    }
  }

  loadHandlerConfigs(): Partial<HandlerConfig>[] {
    try {
      const data = this.storage.getItem(MSW_LOCAL_STORAGE_KEY)
      if (!data) return []

      const configData = JSON.parse(data)
      return configData.handlers || []
    } catch (error) {
      console.warn('Failed to load MSW Controller configuration:', error)
      return []
    }
  }

  clearConfigs(): void {
    try {
      this.storage.removeItem(MSW_LOCAL_STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear MSW Controller configuration:', error)
    }
  }

  saveConfig(key: string, value: any): void {
    try {
      const existingData = this.storage.getItem(MSW_LOCAL_STORAGE_KEY)
      const configData = existingData ? JSON.parse(existingData) : {}
      configData[key] = value
      configData.timestamp = Date.now()
      this.storage.setItem(MSW_LOCAL_STORAGE_KEY, JSON.stringify(configData))
    } catch (error) {
      console.warn(`Failed to save configuration for key ${key}:`, error)
    }
  }

  loadConfig(key: string, defaultValue?: any): any {
    try {
      const data = this.storage.getItem(MSW_LOCAL_STORAGE_KEY)
      if (!data) return defaultValue

      const configData = JSON.parse(data)
      return configData[key] !== undefined ? configData[key] : defaultValue
    } catch (error) {
      console.warn(`Failed to load configuration for key ${key}:`, error)
      return defaultValue
    }
  }
}

export const mockStorage = new MockStorage()

export function createStorage(storage?: StorageInterface): ConfigStorage {
  return new ConfigStorage(storage)
}
