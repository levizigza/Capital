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

  const toggleHighContrast = () => {
    setSettings(prev => ({
      ...prev!,
      highContrastMode: !prev!.highContrastMode,
    }))
  }

  const toggleReducedMotion = () => {
    setSettings(prev => ({
      ...prev!,
      reducedMotion: !prev!.reducedMotion,
    }))
  }

  const toggleKeyboardNavigation = () => {
    setSettings(prev => ({
      ...prev!,
      keyboardNavigationEnabled: !prev!.keyboardNavigationEnabled,
    }))
  }

  const toggleScreenReaderOptimization = () => {
    setSettings(prev => ({
      ...prev!,
      screenReaderOptimized: !prev!.screenReaderOptimized,
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
