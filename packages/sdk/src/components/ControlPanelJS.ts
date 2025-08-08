import type { MSWController } from '@msw-controller/core'
import type { MSWControllerSDK } from '..'

// MSW Handler info interface
interface MSWHandlerInfo {
  method?: string
  path?: string
}

// Extended MSW Handler interface
interface ExtendedMSWHandler {
  info?: MSWHandlerInfo
}

// Extended HTMLElement with cleanup methods
interface ExtendedHTMLElement extends HTMLElement {
  cleanup?: () => void
  updateInterval?: number
}

export interface ControlPanelConfig {
  width: number
  height: number
  className?: string
  darkMode?: boolean
  onClose: () => void
  onHandlerToggle: (handlerId: string, enabled: boolean) => void
  sdkInstance?: MSWControllerSDK
  controller: MSWController
}

interface RequestRecord {
  id: string
  url: string
  method: string
  timestamp: number
  status?: number
  responseTime?: number
  handlerId?: string
  handlerName?: string
}

// Create draggable control panel element
export function createControlPanel(config: ControlPanelConfig): ExtendedHTMLElement {
  const isDark = config.darkMode

  let activeTab: 'requests' | 'config' | 'help' = 'requests'
  let searchKeyword = ''
  let requests: RequestRecord[] = []
  let panelPosition = { x: 0, y: 0 }
  let isDragging = false
  let dragOffset = { x: 0, y: 0 }

  const controller = config.controller

  const getHandlerEnabledByHandlerId = (handlerId: string): boolean => {
    try {
      const handler = controller.getHandler(handlerId)
      return handler ? handler.enabled : false
    } catch {
      return false
    }
  }

  const calculateInitialPosition = () => {
    if (config?.sdkInstance?.loadPanelLayout) {
      const savedLayout = config.sdkInstance.loadPanelLayout()
      if (savedLayout.position) {
        if (savedLayout.size) {
          config.width = savedLayout.size.width
          config.height = savedLayout.size.height
        }
        const x = Math.max(
          20,
          Math.min(savedLayout.position.x, window.innerWidth - config.width - 20),
        )
        const y = Math.max(
          20,
          Math.min(savedLayout.position.y, window.innerHeight - config.height - 20),
        )
        return { x, y }
      }
    }

    const buttonElement = document.querySelector('.msw-float-button') as HTMLElement

    let buttonRect = { left: 20, top: 20, width: 60, height: 32 }

    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect()
      buttonRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }
    }

    const panelWidth = config.width
    const panelHeight = config.height

    let x = buttonRect.left - panelWidth
    let y = buttonRect.top - panelHeight
    x = Math.max(20, Math.min(x, window.innerWidth - panelWidth - 20))
    y = Math.max(20, Math.min(y, window.innerHeight - panelHeight - 20))

    return { x, y }
  }

  panelPosition = calculateInitialPosition()

  // Create main panel container with clean design
  const panel = document.createElement('div')
  Object.assign(panel.style, {
    position: 'fixed',
    left: `${panelPosition.x}px`,
    top: `${panelPosition.y}px`,
    width: `${config.width}px`,
    height: `${config.height}px`,
    background: isDark ? '#2d3748' : '#ffffff',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${isDark ? '#4a5568' : '#e2e8f0'}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: '1000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  })

  if (config.className) {
    panel.className = config.className
  }

  // Create header with drag functionality
  const header = document.createElement('div')
  Object.assign(header.style, {
    padding: '0 16px',
    borderBottom: `1px solid ${isDark ? '#4a5568' : '#e2e8f0'}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: isDark ? '#374151' : '#f8f9fa',
    cursor: 'move',
    userSelect: 'none',
    borderRadius: '6px 6px 0 0',
    height: '40px',
  })

  const title = document.createElement('h3')
  title.textContent = 'MSW控制面板'
  Object.assign(title.style, {
    margin: '0',
    fontSize: '16px',
    fontWeight: '600',
    color: isDark ? '#f9fafb' : '#333333',
  })

  const closeButton = document.createElement('button')
  closeButton.textContent = '×'
  Object.assign(closeButton.style, {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    color: isDark ? '#f9fafb' : '#333333',
    width: '28px',
    height: '28px',
    lineHeight: 1,
    marginRight: '-6px',
  })

  closeButton.addEventListener('click', config.onClose)
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.backgroundColor = isDark ? '#374151' : '#f0f0f0'
  })
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.backgroundColor = 'transparent'
  })

  // Add drag functionality to header
  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true
    dragOffset = {
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y,
    }
  }

  header.addEventListener('mousedown', handleMouseDown)

  header.appendChild(title)
  header.appendChild(closeButton)

  const content = document.createElement('div')
  Object.assign(content.style, {
    flex: '1',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  })

  const tabContainer = document.createElement('div')
  Object.assign(tabContainer.style, {
    padding: '0 16px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
  })

  if (isDark) {
    tabContainer.style.borderBottom = '1px solid #374151'
  }

  const tabs = ['请求记录', 'Handlers', '帮助']
  const tabKeys: ('requests' | 'config' | 'help')[] = ['requests', 'config', 'help']

  // Function to get tab title with count
  const getTabTitle = (tabName: string, tabKey: string): string => {
    if (tabKey === 'config') {
      const handlers = controller.getHandlers()
      const enabledCount = handlers.filter((handler) => handler.enabled).length
      return `${tabName}(${enabledCount})`
    }
    return tabName
  }

  tabs.forEach((tabName, index) => {
    const tab = document.createElement('button')
    const tabKey = tabKeys[index]
    tab.textContent = getTabTitle(tabName, tabKey)
    Object.assign(tab.style, {
      padding: '8px 16px',
      border: 'none',
      background: 'none',
      color: activeTab === tabKey ? '#1890ff' : '#666',
      cursor: 'pointer',
      borderBottom: activeTab === tabKey ? '2px solid #1890ff' : '2px solid transparent',
      fontWeight: activeTab === tabKey ? '600' : '400',
      transition: 'all 0.2s',
      fontSize: '14px',
      marginBottom: '-1px',
    })

    tab.addEventListener('click', () => {
      activeTab = tabKey
      updateTabStyles()
      updateTabContent()
    })

    tab.addEventListener('mouseenter', () => {
      if (activeTab !== tabKey) {
        tab.style.color = '#1890ff'
      }
    })

    tab.addEventListener('mouseleave', () => {
      if (activeTab !== tabKey) {
        tab.style.color = '#666'
      }
    })

    tabContainer.appendChild(tab)
  })

  // Update tab styles function
  const updateTabStyles = () => {
    tabs.forEach((tabName, i) => {
      const tabElement = tabContainer.children[i] as HTMLElement
      if (tabElement) {
        const isActive = tabKeys[i] === activeTab
        const tabKey = tabKeys[i]
        // Update tab title with current count
        tabElement.textContent = getTabTitle(tabName, tabKey)
        tabElement.style.color = isActive ? '#1890ff' : '#666'
        tabElement.style.borderBottom = isActive ? '2px solid #1890ff' : '2px solid transparent'
        tabElement.style.fontWeight = isActive ? '600' : '400'
      }
    })
  }

  const searchContainer = document.createElement('div')
  Object.assign(searchContainer.style, {
    padding: '12px 16px 0',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  })

  const searchInput = document.createElement('input')
  Object.assign(searchInput.style, {
    flex: '1',
    padding: '6px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
  })

  if (isDark) {
    searchInput.style.border = '1px solid #374151'
    searchInput.style.background = '#111827'
    searchInput.style.color = '#f9fafb'
  }

  searchInput.placeholder = '搜索...'
  searchInput.addEventListener('input', (e) => {
    searchKeyword = (e.target as HTMLInputElement).value
    updateTabContent()
  })

  const selectAllContainer = document.createElement('div')
  Object.assign(selectAllContainer.style, {
    display: 'none', // Initially hidden
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: isDark ? '#9ca3af' : '#666',
    whiteSpace: 'nowrap',
  })

  const selectAllCheckbox = document.createElement('input')
  selectAllCheckbox.type = 'checkbox'
  Object.assign(selectAllCheckbox.style, {
    transform: 'scale(1.2)',
  })

  const selectAllLabel = document.createElement('span')
  selectAllLabel.textContent = '全选'

  selectAllContainer.appendChild(selectAllCheckbox)
  selectAllContainer.appendChild(selectAllLabel)

  searchContainer.appendChild(searchInput)
  searchContainer.appendChild(selectAllContainer)

  const tabContent = document.createElement('div')
  Object.assign(tabContent.style, {
    padding: '12px 16px',
    overflowY: 'auto',
    flex: '1',
  })

  // Update tab content function
  const updateTabContent = () => {
    tabContent.innerHTML = ''

    if (activeTab === 'requests') {
      selectAllContainer.style.display = 'none'
      searchContainer.style.display = 'flex'
      renderRequestsTab()
    } else if (activeTab === 'config') {
      selectAllContainer.style.display = 'flex'
      searchContainer.style.display = 'flex'
      renderConfigTab()
    } else if (activeTab === 'help') {
      selectAllContainer.style.display = 'none'
      searchContainer.style.display = 'none'
      renderHelpTab()
    }
  }

  // Render requests tab
  const renderRequestsTab = () => {
    requests = controller.getRequestRecords()

    if (requests.length === 0) {
      const emptyDiv = document.createElement('div')
      emptyDiv.textContent = '暂无请求记录'
      Object.assign(emptyDiv.style, {
        color: '#666',
        fontSize: '14px',
        textAlign: 'center',
        padding: '40px 0',
      })
      tabContent.appendChild(emptyDiv)
      return
    }

    const filteredRequests = requests.filter(
      (request) =>
        searchKeyword === '' ||
        request.url.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        request.method.toLowerCase().includes(searchKeyword.toLowerCase()),
    )

    filteredRequests.forEach((request) => {
      const requestItem = document.createElement('div')
      // Check enabled state using handlerId
      const isEnabled = request.handlerId ? getHandlerEnabledByHandlerId(request.handlerId) : false

      Object.assign(requestItem.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        border: `1px solid ${isEnabled ? '#52c41a' : '#f0f0f0'}`,
        borderRadius: '8px',
        marginBottom: '8px',
        padding: '12px',
        background: isEnabled ? 'rgba(82, 196, 26, 0.05)' : '#fff',
        transition: 'all 0.2s',
        cursor: 'pointer',
      })

      if (isDark) {
        requestItem.style.border = `1px solid ${isEnabled ? '#52c41a' : '#374151'}`
        requestItem.style.background = isEnabled ? 'rgba(82, 196, 26, 0.1)' : '#111827'
      }

      requestItem.addEventListener('mouseenter', () => {
        requestItem.style.borderColor = isEnabled ? '#52c41a' : '#d9d9d9'
        requestItem.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
      })

      requestItem.addEventListener('mouseleave', () => {
        requestItem.style.borderColor = isEnabled ? '#52c41a' : '#f0f0f0'
        requestItem.style.boxShadow = 'none'
      })

      if (request.handlerId) {
        const handlerId = request.handlerId // Store in const to satisfy TypeScript
        requestItem.addEventListener('click', () => {
          const newEnabled = !isEnabled

          controller.toggleHandler(handlerId, newEnabled)
          config.onHandlerToggle(handlerId, newEnabled)
          updateTabContent()
          updateTabStyles()
        })
      } else {
        // Disable cursor pointer for non-clickable items
        requestItem.style.cursor = 'default'
      }

      let enableIcon = null
      if (request.handlerId) {
        enableIcon = document.createElement('div')
        enableIcon.textContent = isEnabled ? '✓' : ''
        Object.assign(enableIcon.style, {
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isEnabled ? '#52c41a' : '#d9d9d9',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          transition: 'all 0.2s',
        })
      }

      // Method badge
      const methodBadge = document.createElement('span')
      methodBadge.textContent = request.method
      Object.assign(methodBadge.style, {
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        minWidth: '40px',
        textAlign: 'center',
        color: 'white',
        background: getMethodColor(request.method),
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })

      // Time text
      const timeText = document.createElement('div')
      timeText.textContent = new Date(request.timestamp).toLocaleTimeString()
      Object.assign(timeText.style, {
        fontSize: '11px',
        color: '#999',
      })

      // Matched badge
      const matchedBadge = document.createElement('span')
      if (request.handlerId && isEnabled) {
        matchedBadge.textContent = '已匹配'
        Object.assign(matchedBadge.style, {
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500',
          background: '#1890ff',
          color: 'white',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })
      }

      // Top row: enable icon + method + matched badge + time
      const topRow = document.createElement('div')
      Object.assign(topRow.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: '8px',
      })

      // Left side: enable icon + method + matched badge
      const leftSide = document.createElement('div')
      Object.assign(leftSide.style, {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      })

      if (enableIcon) {
        leftSide.appendChild(enableIcon)
      }
      leftSide.appendChild(methodBadge)
      if (request.handlerId) {
        leftSide.appendChild(matchedBadge)
      }

      topRow.appendChild(leftSide)
      topRow.appendChild(timeText)

      // URL text (second row)
      const urlText = document.createElement('div')
      urlText.textContent = request.url
      Object.assign(urlText.style, {
        fontSize: '13px',
        fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
        color: isDark ? '#f9fafb' : '#333',
        wordBreak: 'break-all',
        whiteSpace: 'normal',
        lineHeight: '1.4',
        marginLeft: request.handlerId ? '28px' : '0px', // Align with method when handlerId exists
      })

      requestItem.appendChild(topRow)
      requestItem.appendChild(urlText)
      tabContent.appendChild(requestItem)
    })
  }

  // Render config tab
  const renderConfigTab = () => {
    const handlers = controller.getHandlers()

    if (handlers.length === 0) {
      const emptyDiv = document.createElement('div')
      emptyDiv.textContent = '暂无已注册的接口配置'
      Object.assign(emptyDiv.style, {
        color: '#666',
        fontSize: '14px',
        textAlign: 'center',
        padding: '40px 0',
      })
      tabContent.appendChild(emptyDiv)
      return
    }

    const filteredHandlers = handlers.filter((handler) => {
      if (searchKeyword === '') return true

      let method = 'GET'
      let url = handler.id

      if (handler.handler) {
        const mswHandler = handler.handler as ExtendedMSWHandler
        if (mswHandler.info) {
          if (mswHandler.info.method) {
            method = mswHandler.info.method.toUpperCase()
          }
          if (mswHandler.info.path) {
            url = mswHandler.info.path
          }
        }
      }

      const searchText = `${method} ${url}`.toLowerCase()
      return searchText.includes(searchKeyword.toLowerCase())
    })

    const selectedCount = filteredHandlers.filter((handler) => handler.enabled).length
    const totalCount = filteredHandlers.length
    selectAllCheckbox.checked = selectedCount === totalCount && totalCount > 0
    selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCount

    // Update select all label with count
    selectAllLabel.textContent = `全选 (${selectedCount}/${totalCount})`

    // Remove existing event listeners and add new one
    selectAllCheckbox.replaceWith(selectAllCheckbox.cloneNode(true))
    const newSelectAllCheckbox = selectAllContainer.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement
    newSelectAllCheckbox.checked = selectedCount === totalCount && totalCount > 0
    newSelectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCount

    newSelectAllCheckbox.addEventListener('change', () => {
      const newValue = newSelectAllCheckbox.checked
      filteredHandlers.forEach((handler) => {
        config.onHandlerToggle(handler.id, newValue)
        controller.toggleHandler(handler.id, newValue)
      })
      updateTabStyles()
      updateTabContent()
    })

    filteredHandlers.forEach((handler) => {
      const enabled = handler.enabled

      let method = 'GET'
      let url = handler.id

      if (handler.handler) {
        const mswHandler = handler.handler as ExtendedMSWHandler
        if (mswHandler.info) {
          if (mswHandler.info.method) {
            method = mswHandler.info.method.toUpperCase()
          }
          if (mswHandler.info.path) {
            url = mswHandler.info.path
          }
        }
      }

      const handlerItem = document.createElement('div')
      Object.assign(handlerItem.style, {
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        marginBottom: '4px',
        background: 'white',
        cursor: 'pointer',
      })

      if (isDark) {
        handlerItem.style.border = '1px solid #374151'
        handlerItem.style.background = '#111827'
      }

      handlerItem.addEventListener('click', () => {
        const newEnabled = !enabled
        config.onHandlerToggle(handler.id, newEnabled)
        config.controller.toggleHandler(handler.id, newEnabled)
        updateTabContent()
        updateTabStyles()
      })

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = enabled
      Object.assign(checkbox.style, {
        marginRight: '8px',
        cursor: 'pointer',
      })

      const keyText = document.createElement('span')
      keyText.textContent = `${method} ${url}`
      Object.assign(keyText.style, {
        flex: '1',
        fontSize: '14px',
        color: isDark ? '#f9fafb' : '#333',
        fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
      })

      handlerItem.appendChild(checkbox)
      handlerItem.appendChild(keyText)
      tabContent.appendChild(handlerItem)
    })
  }

  const renderHelpTab = () => {
    const helpContainer = document.createElement('div')
    Object.assign(helpContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontSize: '14px',
      lineHeight: '1.6',
    })

    // 交互功能部分
    const interactionSection = document.createElement('div')
    Object.assign(interactionSection.style, {
      padding: '16px',
      background: isDark ? '#374151' : '#f8f9fa',
      borderRadius: '8px',
      border: `1px solid ${isDark ? '#4a5568' : '#e2e8f0'}`,
    })

    const interactionTitle = document.createElement('h4')
    interactionTitle.textContent = '🎯 交互说明'
    Object.assign(interactionTitle.style, {
      margin: '0 0 12px 0',
      fontSize: '16px',
      fontWeight: '600',
      color: isDark ? '#f9fafb' : '#333333',
    })

    const interactionList = document.createElement('ul')
    Object.assign(interactionList.style, {
      margin: '0',
      paddingLeft: '0',
      color: isDark ? '#f9fafb' : '#333333',
      listStyleType: 'none',
    })

    const dragFeature = document.createElement('li')
    dragFeature.innerHTML = '1.点击并拖拽面板标题栏可移动面板位置'
    Object.assign(dragFeature.style, {
      marginBottom: '8px',
    })

    const resizeFeature = document.createElement('li')
    resizeFeature.innerHTML = '2.拖拽面板右下角的调整手柄可改变面板尺寸'
    Object.assign(resizeFeature.style, {
      marginBottom: '8px',
    })

    const autoAdjustFeature = document.createElement('li')
    autoAdjustFeature.innerHTML =
      '3.窗口大小改变时，面板会自动调整位置保持可见'
    Object.assign(autoAdjustFeature.style, {
      marginBottom: '8px',
    })

    const persistenceFeature = document.createElement('li')
    persistenceFeature.innerHTML =
      '4.面板的位置、大小和显示状态会自动保存到本地存储'
    Object.assign(persistenceFeature.style, {
      marginBottom: '8px',
    })

    const githubFeature = document.createElement('li')
    githubFeature.innerHTML = '<strong>Github ：</strong>'
    const githubLink = document.createElement('a')
    githubLink.href = 'https://github.com/007sair/msw-controller'
    githubLink.target = '_blank'
    githubLink.rel = 'noopener noreferrer'
    githubLink.textContent = 'msw-controller'
    Object.assign(githubLink.style, {
      color: '#1890ff',
      textDecoration: 'none',
    })
    githubLink.addEventListener('mouseenter', () => {
      githubLink.style.textDecoration = 'underline'
    })
    githubLink.addEventListener('mouseleave', () => {
      githubLink.style.textDecoration = 'none'
    })
    githubFeature.appendChild(githubLink)

    interactionList.appendChild(dragFeature)
    interactionList.appendChild(resizeFeature)
    interactionList.appendChild(autoAdjustFeature)
    interactionList.appendChild(persistenceFeature)
    interactionList.appendChild(githubFeature)
    interactionSection.appendChild(interactionTitle)
    interactionSection.appendChild(interactionList)

    // 全局配置部分
    const configSection = document.createElement('div')
    Object.assign(configSection.style, {
      padding: '16px',
      background: isDark ? '#374151' : '#f8f9fa',
      borderRadius: '8px',
      border: `1px solid ${isDark ? '#4a5568' : '#e2e8f0'}`,
    })

    const configTitle = document.createElement('h4')
    configTitle.textContent = '⚙️ 全局配置'
    Object.assign(configTitle.style, {
      margin: '0 0 16px 0',
      fontSize: '16px',
      fontWeight: '600',
      color: isDark ? '#f9fafb' : '#333333',
    })

    // 暗色主题配置
    const themeToggle = document.createElement('div')
    Object.assign(themeToggle.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: `1px solid ${isDark ? '#4a5568' : '#e2e8f0'}`,
    })

    const themeLabel = document.createElement('span')
    themeLabel.textContent = '暗色主题'
    Object.assign(themeLabel.style, {
      fontSize: '14px',
      color: isDark ? '#f9fafb' : '#333333',
    })

    const themeCheckbox = document.createElement('input')
    themeCheckbox.type = 'checkbox'
    const savedTheme = config.sdkInstance?.loadThemePreference()
    themeCheckbox.checked = savedTheme !== undefined ? savedTheme : isDark || false
    Object.assign(themeCheckbox.style, {
      transform: 'scale(1.2)',
    })

    themeCheckbox.addEventListener('change', () => {
      if (config.sdkInstance?.saveThemePreference) {
        config.sdkInstance.saveThemePreference(themeCheckbox.checked)
        alert('主题设置已保存，请刷新页面以应用新主题')
      } else {
        alert('无法保存主题设置：SDK实例不可用')
      }
    })

    themeToggle.appendChild(themeLabel)
    themeToggle.appendChild(themeCheckbox)

    // 清除存储配置
    const storageSection = document.createElement('div')
    Object.assign(storageSection.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
    })

    const storageLabel = document.createElement('span')
    storageLabel.textContent = '清除本地存储'
    Object.assign(storageLabel.style, {
      fontSize: '14px',
      color: isDark ? '#f9fafb' : '#333333',
    })

    const clearButton = document.createElement('button')
    clearButton.textContent = '清除'
    Object.assign(clearButton.style, {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      background: '#ff4d4f',
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
    })

    clearButton.addEventListener('click', () => {
      if (confirm('确定要清除所有MSW Controller相关的本地存储吗？这将重置所有设置和配置。')) {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('msw-') || key.includes('MSW'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key))
        alert('本地存储已清除，请刷新页面以重置所有设置')
      }
    })

    clearButton.addEventListener('mouseenter', () => {
      clearButton.style.background = '#ff7875'
    })

    clearButton.addEventListener('mouseleave', () => {
      clearButton.style.background = '#ff4d4f'
    })

    storageSection.appendChild(storageLabel)
    storageSection.appendChild(clearButton)

    configSection.appendChild(configTitle)
    configSection.appendChild(themeToggle)
    configSection.appendChild(storageSection)

    // 组装所有部分
    helpContainer.appendChild(interactionSection)
    helpContainer.appendChild(configSection)

    tabContent.appendChild(helpContainer)
  }

  // Helper function to get method color
  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET':
        return '#52c41a'
      case 'POST':
        return '#1890ff'
      case 'PUT':
        return '#fa8c16'
      case 'DELETE':
        return '#ff4d4f'
      case 'PATCH':
        return '#722ed1'
      default:
        return '#666'
    }
  }

  // Add mouse move and mouse up event listeners for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      const maxX = window.innerWidth - config.width
      const maxY = window.innerHeight - config.height

      panelPosition = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      }

      panel.style.left = `${panelPosition.x}px`
      panel.style.top = `${panelPosition.y}px`
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false
      // Save panel position when dragging ends
      if (config?.sdkInstance?.savePanelLayout) {
        const currentSize = {
          width: parseInt(panel.style.width) || config.width,
          height: parseInt(panel.style.height) || config.height,
        }
        config.sdkInstance.savePanelLayout(panelPosition, currentSize)
      }
    }
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // Cleanup function
  const cleanup = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  // Store cleanup function on panel for later use
  ;(panel as ExtendedHTMLElement).cleanup = cleanup

  // Periodic update for requests and tab styles
  const updateInterval = setInterval(() => {
    if (activeTab === 'requests') {
      updateTabContent()
    }

    updateTabStyles()
  }, 1000)

  // Store interval for cleanup
  ;(panel as ExtendedHTMLElement).updateInterval = updateInterval

  // Assemble the panel
  content.appendChild(tabContainer)
  content.appendChild(searchContainer)
  content.appendChild(tabContent)
  panel.appendChild(header)
  panel.appendChild(content)

  const resizeHandle = document.createElement('div')
  Object.assign(resizeHandle.style, {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '16px',
    height: '16px',
    cursor: 'nw-resize',
    background: `linear-gradient(-45deg, transparent 30%, ${isDark ? '#4a5568' : '#d1d5db'} 30%, ${isDark ? '#4a5568' : '#d1d5db'} 40%, transparent 40%, transparent 60%, ${isDark ? '#4a5568' : '#d1d5db'} 60%, ${isDark ? '#4a5568' : '#d1d5db'} 70%, transparent 70%)`,
    borderRadius: '0 0 6px 0',
    zIndex: '10',
  })

  // Add resize functionality
  let isResizing = false
  let resizeStartX = 0
  let resizeStartY = 0
  let startWidth = 0
  let startHeight = 0

  const handleResizeStart = (e: MouseEvent) => {
    isResizing = true
    resizeStartX = e.clientX
    resizeStartY = e.clientY
    startWidth = parseInt(panel.style.width)
    startHeight = parseInt(panel.style.height)
    document.body.style.cursor = 'nw-resize'
    e.preventDefault()
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaX = e.clientX - resizeStartX
    const deltaY = e.clientY - resizeStartY

    const newWidth = Math.max(280, startWidth + deltaX)
    const newHeight = Math.max(200, startHeight + deltaY)

    panel.style.width = `${newWidth}px`
    panel.style.height = `${newHeight}px`

    // Update config for future reference
    config.width = newWidth
    config.height = newHeight
  }

  const handleResizeEnd = () => {
    if (isResizing) {
      isResizing = false
      document.body.style.cursor = ''
      // Save panel size when resizing ends
      if (config?.sdkInstance?.savePanelLayout) {
        const currentSize = {
          width: config.width,
          height: config.height,
        }
        config.sdkInstance.savePanelLayout(panelPosition, currentSize)
      }
    }
  }

  resizeHandle.addEventListener('mousedown', handleResizeStart)
  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)

  panel.appendChild(resizeHandle)

  // Initialize with first tab
  updateTabContent()

  // Add cleanup to panel
  ;(panel as ExtendedHTMLElement).cleanup = () => {
    cleanup()
    clearInterval(updateInterval)
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  return panel
}
