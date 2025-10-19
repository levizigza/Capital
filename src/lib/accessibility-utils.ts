/**
 * Accessibility Utility Functions
 * WCAG 2.1 Level AA/AAA helpers
 */

// ============================================================================
// HIGH CONTRAST MODE
// ============================================================================

/**
 * Toggle high contrast mode
 */
export function toggleHighContrast(enabled?: boolean): boolean {
  const body = document.body
  const isEnabled = enabled ?? !body.classList.contains('high-contrast')
  
  if (isEnabled) {
    body.classList.add('high-contrast')
    localStorage.setItem('high-contrast', 'true')
  } else {
    body.classList.remove('high-contrast')
    localStorage.removeItem('high-contrast')
  }
  
  // Announce to screen readers
  announce(`High contrast mode ${isEnabled ? 'enabled' : 'disabled'}`)
  
  return isEnabled
}

/**
 * Check if high contrast mode is enabled
 */
export function isHighContrastEnabled(): boolean {
  return (
    document.body.classList.contains('high-contrast') ||
    window.matchMedia('(prefers-contrast: high)').matches
  )
}

/**
 * Initialize high contrast from saved preference
 */
export function initHighContrast(): void {
  const saved = localStorage.getItem('high-contrast')
  if (saved === 'true') {
    document.body.classList.add('high-contrast')
  }
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Set focus to element by ID or ref
 */
export function setFocus(elementOrId: HTMLElement | string, delay: number = 0): void {
  const element = typeof elementOrId === 'string'
    ? document.getElementById(elementOrId)
    : elementOrId
  
  if (element) {
    setTimeout(() => {
      element.focus()
      element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, delay)
  }
}

/**
 * Trap focus within a container (for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleKeyDown = (e: KeyboardEvent) => {
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
  
  container.addEventListener('keydown', handleKeyDown)
  firstElement?.focus()
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

// ============================================================================
// ARIA LIVE REGIONS
// ============================================================================

let liveRegion: HTMLElement | null = null

/**
 * Create or get ARIA live region
 */
function getLiveRegion(priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.className = `aria-live-${priority}`
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('role', 'status')
    document.body.appendChild(liveRegion)
  }
  return liveRegion
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const region = getLiveRegion(priority)
  
  // Clear and set message
  region.textContent = ''
  setTimeout(() => {
    region.textContent = message
  }, 100)
  
  // Clear after announcement
  setTimeout(() => {
    region.textContent = ''
  }, 3000)
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Handle keyboard shortcuts
 */
export class KeyboardShortcuts {
  private shortcuts: Map<string, () => void>
  
  constructor() {
    this.shortcuts = new Map()
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }
  
  /**
   * Register a keyboard shortcut
   * @param key - Key combination (e.g., 'ctrl+s', 'alt+h')
   * @param handler - Function to call when shortcut is pressed
   */
  register(key: string, handler: () => void): void {
    this.shortcuts.set(key.toLowerCase(), handler)
  }
  
  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string): void {
    this.shortcuts.delete(key.toLowerCase())
  }
  
  private handleKeyDown(e: KeyboardEvent): void {
    // Don't trigger shortcuts when typing in form elements
    const target = e.target as HTMLElement
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      return
    }
    
    const modifiers: string[] = []
    if (e.ctrlKey) modifiers.push('ctrl')
    if (e.altKey) modifiers.push('alt')
    if (e.shiftKey) modifiers.push('shift')
    if (e.metaKey) modifiers.push('meta')
    
    const key = [...modifiers, e.key.toLowerCase()].join('+')
    const handler = this.shortcuts.get(key)
    
    if (handler) {
      e.preventDefault()
      handler()
    }
  }
  
  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    this.shortcuts.clear()
  }
}

// ============================================================================
// COLOR CONTRAST
// ============================================================================

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Parse hex colors
  const hex1 = color1.replace('#', '')
  const hex2 = color2.replace('#', '')
  
  const r1 = parseInt(hex1.substr(0, 2), 16)
  const g1 = parseInt(hex1.substr(2, 2), 16)
  const b1 = parseInt(hex1.substr(4, 2), 16)
  
  const r2 = parseInt(hex2.substr(0, 2), 16)
  const g2 = parseInt(hex2.substr(2, 2), 16)
  const b2 = parseInt(hex2.substr(4, 2), 16)
  
  const lum1 = getLuminance(r1, g1, b1)
  const lum2 = getLuminance(r2, g2, b2)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsContrastStandard(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7
  }
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Add accessible error message to form field
 */
export function addFieldError(
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  message: string
): void {
  // Add aria-invalid
  input.setAttribute('aria-invalid', 'true')
  
  // Create or update error message
  let errorEl = document.getElementById(`${input.id}-error`)
  
  if (!errorEl) {
    errorEl = document.createElement('div')
    errorEl.id = `${input.id}-error`
    errorEl.className = 'form-error'
    errorEl.setAttribute('role', 'alert')
    input.parentElement?.appendChild(errorEl)
  }
  
  errorEl.textContent = message
  input.setAttribute('aria-describedby', errorEl.id)
  
  // Announce error
  announce(`Error: ${message}`, 'assertive')
}

/**
 * Remove error message from form field
 */
export function removeFieldError(
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
): void {
  input.removeAttribute('aria-invalid')
  input.removeAttribute('aria-describedby')
  
  const errorEl = document.getElementById(`${input.id}-error`)
  if (errorEl) {
    errorEl.remove()
  }
}

// ============================================================================
// MODAL/DIALOG HELPERS
// ============================================================================

/**
 * Open accessible modal
 */
export function openModal(modal: HTMLElement): () => void {
  // Store last focused element
  const lastFocused = document.activeElement as HTMLElement
  
  // Show modal
  modal.style.display = 'block'
  modal.setAttribute('aria-modal', 'true')
  
  // Trap focus
  const releaseFocus = trapFocus(modal)
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden'
  
  // Handle escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  // Return close function
  const closeModal = () => {
    modal.style.display = 'none'
    modal.removeAttribute('aria-modal')
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEscape)
    releaseFocus()
    lastFocused?.focus()
  }
  
  return closeModal
}

// ============================================================================
// IMAGE ALT TEXT HELPERS
// ============================================================================

/**
 * Validate image has appropriate alt text
 */
export function validateImageAlt(img: HTMLImageElement): boolean {
  const alt = img.getAttribute('alt')
  
  // Decorative images should have empty alt
  if (img.classList.contains('decorative')) {
    return alt === ''
  }
  
  // Informative images must have descriptive alt
  return alt !== null && alt.trim().length > 0
}

/**
 * Add missing alt attributes to images
 */
export function ensureImageAlts(container: HTMLElement = document.body): void {
  const images = container.querySelectorAll('img:not([alt])')
  
  images.forEach(img => {
    console.warn('Image missing alt attribute:', img)
    img.setAttribute('alt', '')
  })
}

// ============================================================================
// SCREEN READER DETECTION
// ============================================================================

/**
 * Check if user might be using a screen reader
 * Note: This is not 100% reliable
 */
export function likelyUsingScreenReader(): boolean {
  return (
    // Check if reduced motion is preferred (common with screen readers)
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    // Check if high contrast is preferred
    window.matchMedia('(prefers-contrast: high)').matches ||
    // Check user agent for screen reader indicators
    /JAWS|NVDA|VoiceOver|TalkBack/.test(navigator.userAgent)
  )
}

// ============================================================================
// HEADING HIERARCHY
// ============================================================================

/**
 * Validate heading hierarchy (h1, h2, h3, etc. in order)
 */
export function validateHeadingHierarchy(container: HTMLElement = document.body): boolean {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  
  let previousLevel = 0
  let isValid = true
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1))
    
    if (index === 0 && level !== 1) {
      console.warn('Page should start with h1')
      isValid = false
    }
    
    if (level > previousLevel + 1) {
      console.warn(`Heading level skipped: ${heading.tagName} after h${previousLevel}`)
      isValid = false
    }
    
    previousLevel = level
  })
  
  return isValid
}

// ============================================================================
// ACCESSIBILITY AUDIT
// ============================================================================

export interface AccessibilityIssue {
  type: string
  severity: 'error' | 'warning' | 'info'
  element?: HTMLElement
  message: string
}

/**
 * Run basic accessibility audit
 */
export function auditAccessibility(container: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []
  
  // Check images
  container.querySelectorAll('img:not([alt])').forEach(img => {
    issues.push({
      type: 'missing-alt',
      severity: 'error',
      element: img as HTMLElement,
      message: 'Image missing alt attribute'
    })
  })
  
  // Check form labels
  container.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
    const id = input.getAttribute('id')
    if (!id || !container.querySelector(`label[for="${id}"]`)) {
      issues.push({
        type: 'missing-label',
        severity: 'error',
        element: input as HTMLElement,
        message: 'Form field missing associated label'
      })
    }
  })
  
  // Check buttons
  container.querySelectorAll('button:empty:not([aria-label])').forEach(button => {
    issues.push({
      type: 'empty-button',
      severity: 'error',
      element: button as HTMLElement,
      message: 'Button has no text or aria-label'
    })
  })
  
  // Check links
  container.querySelectorAll('a:not([href])').forEach(link => {
    issues.push({
      type: 'invalid-link',
      severity: 'warning',
      element: link as HTMLElement,
      message: 'Link missing href attribute'
    })
  })
  
  // Check heading hierarchy
  if (!validateHeadingHierarchy(container)) {
    issues.push({
      type: 'heading-hierarchy',
      severity: 'warning',
      message: 'Heading hierarchy is not properly structured'
    })
  }
  
  return issues
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  toggleHighContrast,
  isHighContrastEnabled,
  initHighContrast,
  setFocus,
  trapFocus,
  getFocusableElements,
  announce,
  KeyboardShortcuts,
  getContrastRatio,
  meetsContrastStandard,
  addFieldError,
  removeFieldError,
  openModal,
  validateImageAlt,
  ensureImageAlts,
  likelyUsingScreenReader,
  validateHeadingHierarchy,
  auditAccessibility
}
