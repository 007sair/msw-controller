import { createControlPanel } from './components/ControlPanelJS'
import { createFloatingButton } from './components/FloatingButtonJS'
import { getController } from '@msw-controller/core'
import type { MSWControllerConfig, Position } from './types'

/**
 * MSW 控制器 SDK - 纯 JavaScript 实现
 * 提供浮动按钮和控制面板来管理 MSW 处理器
 */
export class MSWControllerSDK {
  private config: Required<MSWControllerConfig>
  private isOpen: boolean = false
  private buttonElement: HTMLElement | null = null
  private panelElement: HTMLElement | null = null
  private buttonPosition: Position
  private container: HTMLElement

  /**
   * 创建 MSW 控制器 SDK 实例
   * @param config 控制器配置选项
   */
  constructor(config: MSWControllerConfig = {}) {
    // 从 localStorage 加载保存的主题偏好
    const savedTheme = MSWControllerSDK.loadThemePreferenceStatic()

    // 合并用户配置和默认值
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

    // 如果用户提供了 onHandlerToggle，包装处理逻辑
    if (config.onHandlerToggle) {
      const userCallback = config.onHandlerToggle
      this.config.onHandlerToggle = (handlerId: string, enabled: boolean) => {
        // 处理异步操作而不阻塞 UI
        this.handleHandlerToggle(handlerId, enabled).catch(() => {
          // 静默处理错误以避免生产环境控制台噪音
        })
        userCallback(handlerId, enabled)
      }
    }

    this.buttonPosition = { ...this.config.initialPosition }
    this.container = this.config.container
    this.isOpen = false

    this.init()
  }

  /**
   * 初始化 MSW 控制器
   */
  private init(): void {
    // 默认显示悬浮按钮
    this.createButton()

    // 加载保存的面板可见性状态
    const savedLayout = this.loadPanelLayout()
    const shouldOpen = savedLayout.isVisible === true

    if (shouldOpen) {
      this.createPanel()
      this.isOpen = true
    }
  }

  /**
   * 创建浮动按钮
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
   * 创建控制面板
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
    })

    if (this.panelElement) {
      this.container.appendChild(this.panelElement)
    }
  }

  /**
   * 切换控制面板
   */
  public toggle(): void {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  /**
   * 打开控制面板
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
   * 关闭控制面板
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
   * 显示浮动按钮
   */
  public showButton(): void {
    if (!this.buttonElement) {
      this.createButton()
    } else {
      this.buttonElement.style.display = 'block'
    }
  }

  /**
   * 隐藏浮动按钮
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

  /**
   * Destroy the controller and clean up
   */
  public destroy(): void {
    if (this.buttonElement) {
      this.buttonElement.remove()
      this.buttonElement = null
    }

    if (this.panelElement) {
      this.panelElement.remove()
      this.panelElement = null
    }

    this.isOpen = false
  }

  /**
   * Handle handler toggle with msw-controller-config persistence
   */
  private async handleHandlerToggle(handlerId: string, enabled: boolean): Promise<void> {
    try {
      const controller = getController()

      if (controller) {
        // Use the global controller to toggle handler state
        // This will automatically save to msw-controller-config
        controller.toggleHandler(handlerId, enabled)
      }
    } catch {
      // Silently handle errors - handler state management is non-critical for UI
    }
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
      const controller = getController()

      if (controller) {
        const handlers = controller.getHandlers()
        const states: Record<string, boolean> = {}
        handlers.forEach((handler) => {
          states[handler.id] = handler.enabled
        })
        return states
      }
      return {}
    } catch {
      // Return empty states if loading fails
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
    } catch {
      // Silently handle localStorage errors
    }
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
    } catch {
      // Silently handle localStorage errors
    }
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
      // Return undefined if loading fails
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

      // Remove position and size, keep other settings
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
}
