import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'

export interface AccessibilitySettings {
  highContrastMode: boolean
  reducedMotion: boolean
  keyboardNavigationEnabled: boolean
  screenReaderOptimized: boolean
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrastMode: false,
  reducedMotion: false,
  keyboardNavigationEnabled: true,
  screenReaderOptimized: true,
}

export function useAccessibility() {
  const [settings, setSettings] = useKV<AccessibilitySettings>(
    'accessibility-settings',
    DEFAULT_SETTINGS
  )

  useEffect(() => {
    if (!settings) return

    if (settings.highContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }

    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }, [settings])

  const toggleHighContrast = (): void => {
    setSettings((prev): AccessibilitySettings => ({
      ...(prev || DEFAULT_SETTINGS),
      highContrastMode: !(prev || DEFAULT_SETTINGS).highContrastMode,
    }))
  }

  const toggleReducedMotion = (): void => {
    setSettings((prev): AccessibilitySettings => ({
      ...(prev || DEFAULT_SETTINGS),
      reducedMotion: !(prev || DEFAULT_SETTINGS).reducedMotion,
    }))
  }

  const toggleKeyboardNavigation = (): void => {
    setSettings((prev): AccessibilitySettings => ({
      ...(prev || DEFAULT_SETTINGS),
      keyboardNavigationEnabled: !(prev || DEFAULT_SETTINGS).keyboardNavigationEnabled,
    }))
  }

  const toggleScreenReaderOptimization = (): void => {
    setSettings((prev): AccessibilitySettings => ({
      ...(prev || DEFAULT_SETTINGS),
      screenReaderOptimized: !(prev || DEFAULT_SETTINGS).screenReaderOptimized,
    }))
  }

  return {
    settings: settings || DEFAULT_SETTINGS,
    toggleHighContrast,
    toggleReducedMotion,
    toggleKeyboardNavigation,
    toggleScreenReaderOptimization,
    setSettings,
  }
}
