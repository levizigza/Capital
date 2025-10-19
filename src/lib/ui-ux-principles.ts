/**
 * UI/UX Principles Implementation
 * Based on Laws of UX, WCAG 2.1 AA, and Industry Best Practices
 */

// ============================================================================
// COGNITIVE PSYCHOLOGY LAWS
// ============================================================================

/**
 * Hick's Law - Limit user choices to reduce decision time
 * Formula: RT = a + b log₂(n)
 * @param itemCount Number of choices presented
 * @returns Whether the count exceeds recommended limit
 */
export function hicksLawCheck(itemCount: number): { valid: boolean; recommendation: string } {
  const MAX_CHOICES = 7
  const OPTIMAL_CHOICES = 5
  
  if (itemCount <= OPTIMAL_CHOICES) {
    return { valid: true, recommendation: 'Optimal choice count' }
  } else if (itemCount <= MAX_CHOICES) {
    return { valid: true, recommendation: 'Acceptable choice count, consider grouping' }
  } else {
    return { 
      valid: false, 
      recommendation: `Too many choices (${itemCount}). Reduce to ${MAX_CHOICES} or less, or group into categories` 
    }
  }
}

/**
 * Miller's Law - Chunk information into groups of 5-9 items
 * @param items Array of items to chunk
 * @param chunkSize Preferred chunk size (default 7)
 */
export function millerChunk<T>(items: T[], chunkSize: number = 7): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Fitts's Law - Calculate optimal button size based on distance and target width
 * MT = a + b × log₂(D/W + 1)
 * @param distance Distance to target in pixels
 * @param targetWidth Current target width in pixels
 * @returns Recommended minimum size
 */
export function fittsLawTargetSize(distance: number, targetWidth: number): number {
  const MIN_TOUCH_TARGET = 44 // WCAG minimum
  const MOBILE_MIN = 48 // Better for mobile
  
  // Simple heuristic: larger distance = larger target needed
  const recommendedSize = Math.max(
    MIN_TOUCH_TARGET,
    Math.min(MOBILE_MIN, Math.ceil(distance / 20))
  )
  
  return Math.max(recommendedSize, targetWidth)
}

/**
 * Jakob's Law - Check if UI pattern matches conventional expectations
 */
export const CONVENTIONAL_PATTERNS = {
  navigation: {
    homePosition: 'top-left',
    profilePosition: 'top-right',
    settingsIcon: 'gear',
    backButton: 'top-left or arrow',
  },
  layout: {
    primaryCTA: 'right-aligned or bottom',
    cancelButton: 'left of primary',
    closeButton: 'top-right X icon',
  },
  forms: {
    labelPosition: 'above input',
    errorPosition: 'below input',
    requiredIndicator: 'asterisk or (required)',
  },
  feedback: {
    success: 'green checkmark',
    error: 'red X or exclamation',
    warning: 'yellow triangle',
    info: 'blue i icon',
  }
} as const

// ============================================================================
// COLOR CONTRAST & ACCESSIBILITY
// ============================================================================

/**
 * Calculate relative luminance of a color (WCAG formula)
 * @param color RGB color values
 */
function getRelativeLuminance(color: { r: number; g: number; b: number }): number {
  const { r, g, b } = color
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 * @param color1 First color
 * @param color2 Second color
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const lum1 = getRelativeLuminance(color1)
  const lum2 = getRelativeLuminance(color2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if color contrast meets WCAG standards
 */
export function checkColorContrast(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number },
  options: { isLargeText?: boolean; level?: 'AA' | 'AAA' } = {}
): { passes: boolean; ratio: number; required: number } {
  const { isLargeText = false, level = 'AA' } = options
  
  const ratio = getContrastRatio(foreground, background)
  
  // WCAG requirements
  const required = level === 'AAA'
    ? (isLargeText ? 4.5 : 7)
    : (isLargeText ? 3 : 4.5)
  
  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required
  }
}

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// ============================================================================
// RESPONSIVE DESIGN UTILITIES
// ============================================================================

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Check if current viewport matches breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= BREAKPOINTS[breakpoint]
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint | 'xs' {
  if (typeof window === 'undefined') return 'xs'
  
  const width = window.innerWidth
  
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// ============================================================================
// ANIMATION & MOTION
// ============================================================================

/**
 * Check user's motion preference
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get animation duration based on user preference
 */
export function getAnimationDuration(baseMs: number): number {
  return prefersReducedMotion() ? 0 : baseMs
}

/**
 * Standard easing functions
 */
export const EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const

/**
 * Standard durations (ms)
 */
export const DURATION = {
  instant: 0,
  fast: 150,
  base: 250,
  slow: 350,
  slower: 500
} as const

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }
  
  container.addEventListener('keydown', handleTab)
  firstElement?.focus()
  
  return () => container.removeEventListener('keydown', handleTab)
}

/**
 * Return focus to previously focused element
 */
export function createFocusRestorer(): () => void {
  const previouslyFocused = document.activeElement as HTMLElement
  return () => previouslyFocused?.focus()
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export interface KeyboardShortcut {
  key: string
  altKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
}

/**
 * Register keyboard shortcuts
 */
export function registerKeyboardShortcuts(shortcuts: KeyboardShortcut[]): () => void {
  const handler = (e: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const matches = 
        e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (shortcut.altKey === undefined || e.altKey === shortcut.altKey) &&
        (shortcut.ctrlKey === undefined || e.ctrlKey === shortcut.ctrlKey) &&
        (shortcut.shiftKey === undefined || e.shiftKey === shortcut.shiftKey) &&
        (shortcut.metaKey === undefined || e.metaKey === shortcut.metaKey)
      
      if (matches) {
        e.preventDefault()
        shortcut.action()
        break
      }
    }
  }
  
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}

// ============================================================================
// EMPTY STATES & LOADING
// ============================================================================

/**
 * Generate helpful empty state message
 */
export function getEmptyStateMessage(context: string): {
  title: string
  description: string
  actionLabel?: string
} {
  const messages: Record<string, { title: string; description: string; actionLabel?: string }> = {
    'no-games': {
      title: 'No games played yet',
      description: 'Start playing to see your progress here',
      actionLabel: 'Play Your First Game'
    },
    'no-achievements': {
      title: 'No achievements unlocked yet',
      description: 'Complete challenges to earn badges',
      actionLabel: 'View Challenges'
    },
    'no-goals': {
      title: 'No goals set',
      description: 'Create your first financial goal to start tracking progress',
      actionLabel: 'Create Goal'
    },
    'no-data': {
      title: 'No data available',
      description: 'Data will appear here once you start using the app'
    },
    'error': {
      title: 'Something went wrong',
      description: 'Please try again or contact support if the problem persists',
      actionLabel: 'Retry'
    }
  }
  
  const result = messages[context] || messages['no-data']
  return result
}

// ============================================================================
// MICRO-COPY & TONE
// ============================================================================

/**
 * Get empowering, instructional micro-copy
 */
export const MICRO_COPY = {
  loading: {
    default: 'Loading...',
    saving: 'Saving your progress...',
    processing: 'Processing...',
    thinking: 'Calculating...'
  },
  success: {
    saved: 'Successfully saved!',
    completed: 'Great job! You completed this challenge.',
    achieved: 'Achievement unlocked!',
    levelUp: 'Level up! You\'re making great progress.'
  },
  encouragement: {
    keepGoing: 'You\'re doing great! Keep it up.',
    almostThere: 'Almost there! Just a bit more.',
    goodProgress: 'Excellent progress today!',
    consistent: 'Your consistency is paying off!'
  },
  instructions: {
    clickToStart: 'Click to start',
    tapToPlay: 'Tap to play',
    swipeToExplore: 'Swipe to explore',
    holdToDrag: 'Hold and drag to rearrange'
  }
} as const

/**
 * Format positive feedback message
 */
export function getPositiveFeedback(score: number): string {
  if (score >= 90) return '🎉 Outstanding work! You\'re mastering this!'
  if (score >= 80) return '⭐ Great job! You\'re doing really well!'
  if (score >= 70) return '👍 Good effort! You\'re making progress!'
  if (score >= 60) return '💪 Nice try! Keep practicing!'
  return '🌱 Every attempt makes you better! Try again!'
}

// ============================================================================
// VALIDATION & ERROR MESSAGES
// ============================================================================

/**
 * Generate user-friendly validation messages
 */
export function getValidationMessage(field: string, error: string): string {
  const messages: Record<string, string> = {
    required: `${field} is required`,
    email: 'Please enter a valid email address',
    minLength: `${field} is too short`,
    maxLength: `${field} is too long`,
    pattern: `${field} format is invalid`,
    min: 'Value is too low',
    max: 'Value is too high',
    number: 'Please enter a valid number',
    url: 'Please enter a valid URL'
  }
  
  return messages[error] || `${field} is invalid`
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Psychology
  hicksLawCheck,
  millerChunk,
  fittsLawTargetSize,
  CONVENTIONAL_PATTERNS,
  
  // Accessibility
  getContrastRatio,
  checkColorContrast,
  hexToRgb,
  
  // Responsive
  useBreakpoint,
  getCurrentBreakpoint,
  isTouchDevice,
  BREAKPOINTS,
  
  // Animation
  prefersReducedMotion,
  getAnimationDuration,
  EASING,
  DURATION,
  
  // Focus
  trapFocus,
  createFocusRestorer,
  registerKeyboardShortcuts,
  
  // Content
  getEmptyStateMessage,
  MICRO_COPY,
  getPositiveFeedback,
  getValidationMessage,
  
  // Performance
  debounce,
  throttle
}
