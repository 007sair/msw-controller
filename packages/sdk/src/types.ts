import type { MSWController } from '@msw-controller/core'
import type { ReactNode } from 'react'

// 存储接口定义
export interface StorageInterface {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * UI 元素位置配置
 */
export interface Position {
  top?: number
  bottom?: number
  left?: number
  right?: number
}

/**
 * MSW 控制器 SDK 配置选项
 */
export interface MSWControllerConfig {
  controller?: MSWController
  initialPosition?: Position
  buttonContent?: string | HTMLElement
  buttonClassName?: string
  panelClassName?: string
  panelWidth?: number
  panelHeight?: number
  darkMode?: boolean
  onToggle?: (isOpen: boolean) => void
  onHandlerToggle?: (handlerId: string, enabled: boolean) => void
  container?: HTMLElement
}

export interface MSWControllerProps extends Omit<MSWControllerConfig, 'buttonContent'> {
  buttonContent?: ReactNode
}

export type TabType = 'handlers' | 'requests' | 'settings'

export interface FloatingButtonProps {
  onClick: () => void
  position: { x: number; y: number }
  onPositionChange: (position: { x: number; y: number }) => void
  children?: ReactNode
  className?: string
  darkMode?: boolean
}

export interface ControlPanelProps {
  isOpen: boolean
  onClose: () => void
  width?: number
  height?: number
  className?: string
  darkMode?: boolean
  onHandlerToggle?: (handlerId: string, enabled: boolean) => void
}

export interface HandlerListProps {
  darkMode?: boolean
  onHandlerToggle?: (handlerId: string, enabled: boolean) => void
}

export interface RequestListProps {
  darkMode?: boolean
}

export interface SettingsProps {
  darkMode?: boolean
}

export interface DragState {
  isDragging: boolean
  startPosition: Position
  offset: Position
}
