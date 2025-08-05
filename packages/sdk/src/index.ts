import type { MSWController } from '@msw-controller/core'
import { MSWControllerSDK } from './MSWControllerSDK'
import type { MSWControllerConfig } from './types'

/**
 * Render MSW controller to the page
 *
 * @param controller - MSW controller instance
 * @param config - Optional configuration options
 * @returns MSWControllerSDK instance
 */
export function renderMSWController(
  controller: MSWController,
  config: MSWControllerConfig = {},
): MSWControllerSDK {
  return new MSWControllerSDK(controller, config)
}

export type { MSWControllerConfig, Position } from './types'
export { MSWControllerSDK }
export type { MSWController } from '@msw-controller/core'

export default renderMSWController
