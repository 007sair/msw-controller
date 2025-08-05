import type { ReactNode } from 'react'

// Storage interface for persistence
export interface StorageInterface {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

// UI element position configuration
export interface Position {
  top?: number
  bottom?: number
  left?: number
  right?: number
}

// MSW Controller SDK configuration options
export interface MSWControllerConfig {
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
