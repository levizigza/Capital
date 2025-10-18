import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  alt?: boolean
  ctrl?: boolean
  shift?: boolean
  meta?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey
        const metaMatch = shortcut.meta === undefined || shortcut.meta === event.metaKey

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          altMatch &&
          ctrlMatch &&
          shiftMatch &&
          metaMatch
        ) {
          event.preventDefault()
          shortcut.callback()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export const GLOBAL_SHORTCUTS = {
  SWITCH_MODE: { key: 's', alt: true, description: 'Switch between Creative and Structured modes' },
  GO_HOME: { key: 'h', alt: true, description: 'Go to home / mode selection' },
  OPEN_PROFILE: { key: 'p', alt: true, description: 'Open user profile' },
  OPEN_SETTINGS: { key: ',', alt: true, description: 'Open settings' },
  TOGGLE_ACCESSIBILITY: { key: 'a', alt: true, shift: true, description: 'Toggle accessibility menu' },
  ESCAPE: { key: 'Escape', description: 'Close modal or return to previous screen' },
} as const
