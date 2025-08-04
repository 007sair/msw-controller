import { MSWControllerSDK } from './MSWControllerSDK'
import type { MSWControllerConfig } from './types'

/**
 * 初始化 MSW 控制器 SDK
 * @param config 可选配置对象
 * @returns MSW 控制器实例
 */
export function initMSWController(config: MSWControllerConfig = {}): MSWControllerSDK {
  return new MSWControllerSDK(config)
}

export type { MSWControllerConfig, Position } from './types'
export { MSWControllerSDK }
export type { MSWController } from '@msw-controller/core'



export default initMSWController
