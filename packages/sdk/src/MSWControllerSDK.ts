import type { HandlerConfig, MSWController } from '@msw-controller/core'
import { createControlPanel } from './components/ControlPanelJS'
import { createFloatingButton } from './components/FloatingButtonJS'
import type { MSWControllerConfig, Position } from './types'

/**
 * MSW Controller SDK - Pure JavaScript Implementation
 * Provides floating button and control panel to manage MSW handlers
 */
export class MSWControllerSDK {
  private config: Required<MSWControllerConfig>
  private controller: MSWController
  private isOpen: boolean = false
  private buttonElement: HTMLElement | null = null
  private panelElement: HTMLElement | null = null
  private buttonPosition: Position
  private container: HTMLElement
  private resizeHandler: (() => void) | null = null

  /**
   * Create MSW Controller SDK instance
   * @param controller MSW controller instance (required)
   * @param config Controller configuration options
   */
  constructor(controller: MSWController, config: MSWControllerConfig = {}) {
    const savedTheme = MSWControllerSDK.loadThemePreferenceStatic()

    this.controller = controller

    this.config = {
      initialPosition: { bottom: 50, right: 50 },
      buttonContent: 'MSW',
      buttonClassName: '',
      panelClassName: '',
      panelWidth: 360,
      panelHeight: 450,
      darkMode: savedTheme !== undefined ? savedTheme : false,
      container: document.body,
      onToggle: () => {},
      onHandlerToggle: this.handleHandlerToggle.bind(this),
      ...config,
    }

    // Wrap onHandlerToggle if provided by user
    if (config.onHandlerToggle) {
      const userCallback = config.onHandlerToggle
      this.config.onHandlerToggle = (handlerId: string, enabled: boolean) => {
        this.handleHandlerToggle(handlerId, enabled).catch(() => {})
        userCallback(handlerId, enabled)
      }
    }

    this.buttonPosition = { ...this.config.initialPosition }
    this.container = this.config.container
    this.isOpen = false

    this.init()
  }

  /**
   * Initialize MSW controller
   */
  private init(): void {
    this.createButton()
    this.setupResizeHandler()

    const savedLayout = this.loadPanelLayout()
    const shouldOpen = savedLayout.isVisible === true

    if (shouldOpen) {
      this.createPanel()
      this.isOpen = true
    }
  }

  /**
   * Create floating button
   */
  private createButton(): void {
    this.buttonElement = createFloatingButton({
      position: this.buttonPosition,
      content: this.config.buttonContent,
      className: this.config.buttonClassName,
      darkMode: this.config.darkMode,
      onClick: () => this.toggle(),
    })

    if (this.buttonElement) {
      this.container.appendChild(this.buttonElement)
    }
  }

  /**
   * Create control panel
   */
  private createPanel(): void {
    if (this.panelElement) {
      return
    }

    this.panelElement = createControlPanel({
      width: this.config.panelWidth,
      height: this.config.panelHeight,
      className: this.config.panelClassName,
      darkMode: this.config.darkMode,
      onClose: () => this.close(),
      onHandlerToggle: this.config.onHandlerToggle,
      sdkInstance: this,
      controller: this.controller,
    })

    if (this.panelElement) {
      this.container.appendChild(this.panelElement)
    }
  }

  /**
   * Setup window resize handler to adjust panel position
   */
  private setupResizeHandler(): void {
    this.resizeHandler = () => {
      if (this.panelElement && this.isOpen) {
        this.adjustPanelPosition()
      }
    }
    window.addEventListener('resize', this.resizeHandler)
  }

  /**
   * Adjust panel position to ensure it stays within viewport
   */
  private adjustPanelPosition(): void {
    if (!this.panelElement) return

    const panelRect = this.panelElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let newX = panelRect.left
    let newY = panelRect.top
    let needsAdjustment = false

    // Check if panel is outside viewport bounds
    if (panelRect.right > viewportWidth) {
      newX = viewportWidth - panelRect.width - 20
      needsAdjustment = true
    }
    if (panelRect.left < 0) {
      newX = 20
      needsAdjustment = true
    }
    if (panelRect.bottom > viewportHeight) {
      newY = viewportHeight - panelRect.height - 20
      needsAdjustment = true
    }
    if (panelRect.top < 0) {
      newY = 20
      needsAdjustment = true
    }

    // Apply position adjustment if needed
    if (needsAdjustment) {
      this.panelElement.style.left = `${Math.max(0, newX)}px`
      this.panelElement.style.top = `${Math.max(0, newY)}px`
      
      // Save the new position
      const currentSize = {
        width: parseInt(this.panelElement.style.width) || this.config.panelWidth,
        height: parseInt(this.panelElement.style.height) || this.config.panelHeight,
      }
      this.savePanelLayout({ x: newX, y: newY }, currentSize)
    }
  }

  /**
   * Toggle control panel
   */
  public toggle(): void {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  /**
   * Open control panel
   */
  public open(): void {
    if (!this.isOpen) {
      this.createPanel()
      this.isOpen = true
      this.savePanelVisibility(true)
      this.config.onToggle(true)
    }
  }

  /**
   * Close control panel
   */
  public close(): void {
    if (this.isOpen && this.panelElement) {
      this.panelElement.remove()
      this.panelElement = null
      this.isOpen = false
      this.savePanelVisibility(false)
      this.config.onToggle(false)
    }
  }

  /**
   * Show floating button
   */
  public showButton(): void {
    if (!this.buttonElement) {
      this.createButton()
    } else {
      this.buttonElement.style.display = 'block'
    }
  }

  /**
   * Hide floating button
   */
  public hideButton(): void {
    if (this.buttonElement) {
      this.buttonElement.style.display = 'none'
    }
  }

  /**
   * Update controller configuration dynamically
   *
   * @param newConfig - Partial configuration to merge with existing config
   * @example
   * ```typescript
   * controller.updateConfig({
   *   darkMode: true,
   *   panelWidth: 500
   * })
   * ```
   */
  public updateConfig(newConfig: Partial<MSWControllerConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Re-render if needed
    if (this.buttonElement && newConfig.darkMode !== undefined) {
      this.buttonElement.remove()
      this.buttonElement = null
      this.createButton()
    }

    if (this.panelElement && newConfig.darkMode !== undefined) {
      this.panelElement.remove()
      this.panelElement = null
      if (this.isOpen) {
        this.createPanel()
      }
    }
  }

  // Clean up and destroy controller
  public destroy(): void {
    if (this.buttonElement) {
      this.buttonElement.remove()
      this.buttonElement = null
    }

    if (this.panelElement) {
      this.panelElement.remove()
      this.panelElement = null
    }

    // Clean up resize handler
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    }

    this.isOpen = false
  }

  // Handle handler toggle with persistence
  private async handleHandlerToggle(handlerId: string, enabled: boolean): Promise<void> {
    try {
      if (this.controller) {
        this.controller.toggleHandler(handlerId, enabled)
      }
    } catch {}
  }

  /**
   * Load current handler states from the global MSW controller
   *
   * @returns Promise resolving to a record of handler IDs and their enabled states
   * @example
   * ```typescript
   * const states = await controller.loadHandlerStates()
   * console.log(states) // { 'get-users': true, 'post-login': false }
   * ```
   */
  public async loadHandlerStates(): Promise<Record<string, boolean>> {
    try {
      if (this.controller) {
        const handlers = this.controller.getHandlers()
        const states: Record<string, boolean> = {}
        handlers.forEach((handler) => {
          states[handler.id] = handler.enabled
        })
        return states
      }
      return {}
    } catch {
      return {}
    }
  }

  /**
   * Save panel layout (position and size) to localStorage for persistence
   *
   * @param position - Panel position coordinates
   * @param size - Panel dimensions
   * @example
   * ```typescript
   * controller.savePanelLayout(
   *   { x: 100, y: 50 },
   *   { width: 400, height: 500 }
   * )
   * ```
   */
  public savePanelLayout(
    position: { x: number; y: number },
    size: { width: number; height: number },
  ): void {
    try {
      const layoutData = {
        position: {
          x: Math.round(position.x),
          y: Math.round(position.y),
        },
        size: {
          width: Math.round(size.width),
          height: Math.round(size.height),
        },
        isVisible: this.isOpen,
        timestamp: Date.now(),
      }
      localStorage.setItem('msw-controller-sdk', JSON.stringify(layoutData))
    } catch {}
  }

  /**
   * Load panel position, size and visibility from localStorage
   */
  public loadPanelLayout(): {
    position?: { x: number; y: number }
    size?: { width: number; height: number }
    isVisible?: boolean
  } {
    try {
      const data = localStorage.getItem('msw-controller-sdk')
      if (!data) return {}

      const layoutData = JSON.parse(data)
      return {
        position: layoutData.position,
        size: layoutData.size,
        isVisible: layoutData.isVisible,
      }
    } catch {
      return {}
    }
  }

  /**
   * Save panel visibility state to localStorage
   */
  public savePanelVisibility(isVisible: boolean): void {
    try {
      const data = localStorage.getItem('msw-controller-sdk')
      const layoutData = data ? JSON.parse(data) : {}

      layoutData.isVisible = isVisible
      layoutData.timestamp = Date.now()

      localStorage.setItem('msw-controller-sdk', JSON.stringify(layoutData))
    } catch {}
  }

  /**
   * Save theme preference to localStorage
   */
  public saveThemePreference(isDarkMode: boolean): void {
    try {
      const data = localStorage.getItem('msw-controller-sdk')
      const layoutData = data ? JSON.parse(data) : {}

      layoutData.darkMode = isDarkMode
      layoutData.timestamp = Date.now()

      localStorage.setItem('msw-controller-sdk', JSON.stringify(layoutData))
    } catch {
      // Silently handle localStorage errors
    }
  }

  /**
   * Load theme preference from localStorage
   */
  public loadThemePreference(): boolean | undefined {
    try {
      const data = localStorage.getItem('msw-controller-sdk')
      if (!data) return undefined

      const layoutData = JSON.parse(data)
      return layoutData.darkMode
    } catch {
      return undefined
    }
  }

  /**
   * Reset panel to default position and size
   */
  public resetPanelLayout(): void {
    try {
      const data = localStorage.getItem('msw-controller-sdk')
      const layoutData = data ? JSON.parse(data) : {}

      delete layoutData.position
      delete layoutData.size
      layoutData.timestamp = Date.now()

      localStorage.setItem('msw-controller-sdk', JSON.stringify(layoutData))
    } catch {
      // Silently handle localStorage errors
    }
  }

  /**
   * Static method to load theme preference (for use in constructor)
   */
  public static loadThemePreferenceStatic(): boolean | undefined {
    try {
      const data = localStorage.getItem('msw-controller-sdk')
      if (!data) return undefined

      const layoutData = JSON.parse(data)
      return layoutData.darkMode
    } catch {
      // Return undefined if loading fails
      return undefined
    }
  }

  /**
   * Get current state
   */
  public getState() {
    return {
      isOpen: this.isOpen,
      buttonPosition: this.buttonPosition,
      config: this.config,
    }
  }

  /**
   * Get all registered handlers from the controller
   * @returns Array of handler configurations
   */
  public getHandlers(): HandlerConfig[] {
    return this.controller.getHandlers()
  }

  /**
   * Get request records from the controller
   * @returns Array of request records
   */
  public getRequestHistory() {
    return this.controller.getRequestRecords()
  }

  /**
   * Clear request records in the controller
   */
  public clearRequestHistory() {
    this.controller.clearRequestRecords()
  }

  /**
   * Toggle a specific handler
   * @param id Handler ID
   * @param enabled Whether to enable or disable the handler
   */
  public toggleHandler(id: string, enabled?: boolean) {
    this.controller.toggleHandler(id, enabled)
  }

  /**
   * Enable a specific handler
   * @param id Handler ID
   */
  public async enableHandler(id: string): Promise<void> {
    return this.controller.enableHandler(id)
  }

  /**
   * Disable a specific handler
   * @param id Handler ID
   */
  public async disableHandler(id: string): Promise<void> {
    return this.controller.disableHandler(id)
  }
}
