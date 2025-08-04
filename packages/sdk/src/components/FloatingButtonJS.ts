import type { Position } from '../types'

export interface FloatingButtonConfig {
  position: Position
  content: string | HTMLElement
  className?: string
  darkMode?: boolean
  onClick: () => void
}

/**
 * 创建浮动按钮元素
 */
export function createFloatingButton(config: FloatingButtonConfig): HTMLElement {
  const button = document.createElement('div')

  // 设置基础内联样式
  Object.assign(button.style, {
    position: 'fixed',
    width: '60px',
    height: '32px',
    borderRadius: '6px',
    cursor: 'pointer',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '500',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    outline: 'none',
    backgroundColor: config.darkMode ? '#2d3748' : '#f7fafc',
    color: config.darkMode ? '#e2e8f0' : '#4a5568',
    borderColor: config.darkMode ? '#4a5568' : '#e2e8f0',
  })

  button.classList.add('msw-float-button')

  if (config.className) {
    button.classList.add(config.className)
  }
  if (config.position.top !== undefined) {
    button.style.top = `${config.position.top}px`
  }
  if (config.position.bottom !== undefined) {
    button.style.bottom = `${config.position.bottom}px`
  }
  if (config.position.left !== undefined) {
    button.style.left = `${config.position.left}px`
  }
  if (config.position.right !== undefined) {
    button.style.right = `${config.position.right}px`
  }

  if (typeof config.content === 'string') {
    button.textContent = config.content
  } else {
    button.appendChild(config.content)
  }
  button.addEventListener('mouseenter', () => {
    button.style.opacity = '0.8'
  })

  button.addEventListener('mouseleave', () => {
    button.style.opacity = '1'
  })

  button.addEventListener('click', config.onClick)

  return button
}
