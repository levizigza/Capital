/**
 * Animation Utility Functions
 * Programmatic animation triggers and helpers
 */

// ============================================================================
// CONFETTI EFFECT
// ============================================================================

export interface ConfettiOptions {
  particleCount?: number
  duration?: number
  colors?: string[]
  spread?: number
}

/**
 * Trigger confetti particle effect
 */
export function triggerConfetti(options: ConfettiOptions = {}) {
  const {
    particleCount = 100,
    duration = 3000,
    colors = [
      'oklch(0.65 0.20 30)',  // Orange
      'oklch(0.60 0.22 290)', // Purple
      'oklch(0.60 0.18 145)', // Green
      'oklch(0.60 0.16 240)', // Blue
      'oklch(0.70 0.22 40)',  // Yellow
    ],
    spread = 360
  } = options

  // Create container if it doesn't exist
  let container = document.querySelector('.confetti-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'confetti-container'
    document.body.appendChild(container)
  }

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.className = 'confetti'
    
    // Random shape
    const shapes = ['square', 'circle', 'triangle']
    const shape = shapes[Math.floor(Math.random() * shapes.length)]
    if (shape !== 'square') {
      particle.classList.add(shape)
    }
    
    // Random color
    const color = colors[Math.floor(Math.random() * colors.length)]
    particle.style.background = color
    
    // Random position
    const angle = (spread / particleCount) * i + (Math.random() * 20 - 10)
    const distance = Math.random() * 100
    particle.style.left = `${50 + Math.cos(angle * Math.PI / 180) * distance}%`
    
    // Random delay and duration
    particle.style.animationDelay = `${Math.random() * 200}ms`
    particle.style.animationDuration = `${duration + Math.random() * 1000}ms`
    
    container.appendChild(particle)
    
    // Remove after animation
    setTimeout(() => {
      particle.remove()
    }, duration + 1000)
  }
  
  // Remove container if empty
  setTimeout(() => {
    if (container && container.children.length === 0) {
      container.remove()
    }
  }, duration + 2000)
}

// ============================================================================
// MODE TRANSITION
// ============================================================================

export type Mode = 'structured' | 'creative'

/**
 * Animate mode transition
 */
export async function animateModeTransition(
  fromMode: Mode,
  toMode: Mode,
  container: HTMLElement
): Promise<void> {
  return new Promise((resolve) => {
    // Exit animation
    container.classList.add('mode-exit')
    
    setTimeout(() => {
      container.classList.remove('mode-exit')
      container.classList.add('mode-enter', 'mode-color-transition')
      
      setTimeout(() => {
        container.classList.remove('mode-enter', 'mode-color-transition')
        resolve()
      }, 400)
    }, 400)
  })
}

// ============================================================================
// PROGRESS BAR ANIMATION
// ============================================================================

/**
 * Animate progress bar to new value
 */
export function animateProgressBar(
  element: HTMLElement,
  targetPercent: number,
  duration: number = 800
): Promise<void> {
  return new Promise((resolve) => {
    const currentPercent = parseFloat(element.style.width || '0')
    
    // Use CSS transition
    element.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    element.style.width = `${targetPercent}%`
    
    setTimeout(resolve, duration)
  })
}

/**
 * Animate circular progress
 */
export function animateCircularProgress(
  svgPath: SVGPathElement,
  targetPercent: number,
  radius: number = 45
): void {
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - targetPercent / 100)
  
  svgPath.style.strokeDasharray = `${circumference}`
  svgPath.style.strokeDashoffset = `${offset}`
}

// ============================================================================
// NUMBER COUNTER ANIMATION
// ============================================================================

/**
 * Animate number count up/down
 */
export function animateNumber(
  element: HTMLElement,
  target: number,
  duration: number = 1000,
  decimals: number = 0
): Promise<void> {
  return new Promise((resolve) => {
    const start = parseFloat(element.textContent || '0')
    const startTime = Date.now()
    
    function update() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (target - start) * eased
      
      element.textContent = current.toFixed(decimals)
      element.classList.add('number-change')
      
      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        setTimeout(() => {
          element.classList.remove('number-change')
          resolve()
        }, 100)
      }
    }
    
    requestAnimationFrame(update)
  })
}

// ============================================================================
// QUEST COMPLETION POPUP
// ============================================================================

export interface QuestCompletionData {
  title: string
  xpGained: number
  rewards?: string[]
}

/**
 * Show quest completion popup
 */
export function showQuestCompletion(data: QuestCompletionData): Promise<void> {
  return new Promise((resolve) => {
    const popup = document.createElement('div')
    popup.className = 'quest-completion-popup'
    popup.innerHTML = `
      <div style="text-align: center;">
        <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">
          🎉 Quest Complete!
        </h2>
        <p style="font-size: 1.125rem; margin-bottom: 1rem;">
          ${data.title}
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1rem;">
          <div style="padding: 0.5rem 1rem; background: oklch(0.60 0.18 145); color: white; border-radius: 0.5rem;">
            +${data.xpGained} XP
          </div>
        </div>
        ${data.rewards && data.rewards.length > 0 ? `
          <div style="font-size: 0.875rem; color: oklch(0.40 0 0);">
            Rewards: ${data.rewards.join(', ')}
          </div>
        ` : ''}
      </div>
    `
    
    document.body.appendChild(popup)
    
    // Auto-close after 4 seconds
    setTimeout(() => {
      popup.classList.add('closing')
      setTimeout(() => {
        popup.remove()
        resolve()
      }, 400)
    }, 4000)
    
    // Click to close
    popup.addEventListener('click', () => {
      popup.classList.add('closing')
      setTimeout(() => {
        popup.remove()
        resolve()
      }, 400)
    })
  })
}

// ============================================================================
// TIER UNLOCK BANNER
// ============================================================================

export interface TierUnlockData {
  tier: number
  title: string
  rewards?: string[]
}

/**
 * Show tier unlock celebration
 */
export function showTierUnlock(data: TierUnlockData): Promise<void> {
  return new Promise((resolve) => {
    // Trigger confetti
    triggerConfetti({ particleCount: 150, duration: 4000 })
    
    // Show banner
    const banner = document.createElement('div')
    banner.className = 'tier-unlock-banner'
    banner.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">
          🏆
        </div>
        <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">
          Tier ${data.tier} Unlocked!
        </h2>
        <p style="font-size: 1.25rem; opacity: 0.9;">
          ${data.title}
        </p>
        ${data.rewards && data.rewards.length > 0 ? `
          <div style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.8;">
            New features: ${data.rewards.join(', ')}
          </div>
        ` : ''}
      </div>
    `
    
    document.body.appendChild(banner)
    
    // Remove after animation
    setTimeout(() => {
      banner.remove()
      resolve()
    }, 4000)
  })
}

// ============================================================================
// BADGE UNLOCK ANIMATION
// ============================================================================

/**
 * Animate badge unlock
 */
export function animateBadgeUnlock(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    element.classList.add('badge-unlock', 'badge-shine')
    
    setTimeout(() => {
      element.classList.remove('badge-unlock')
      resolve()
    }, 600)
  })
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}

/**
 * Show toast notification
 */
export function showToast(options: ToastOptions): Promise<void> {
  const { message, type = 'info', duration = 3000 } = options
  
  return new Promise((resolve) => {
    const toast = document.createElement('div')
    toast.className = 'toast-enter'
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${getToastColor(type)};
      color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      max-width: 400px;
    `
    toast.textContent = message
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.classList.remove('toast-enter')
      toast.classList.add('toast-exit')
      
      setTimeout(() => {
        toast.remove()
        resolve()
      }, 300)
    }, duration)
  })
}

function getToastColor(type: ToastType): string {
  const colors: Record<ToastType, string> = {
    success: 'oklch(0.60 0.18 145)',
    error: 'oklch(0.60 0.22 25)',
    warning: 'oklch(0.70 0.18 80)',
    info: 'oklch(0.60 0.16 240)'
  }
  return colors[type]
}

// ============================================================================
// SKELETON LOADING
// ============================================================================

/**
 * Create skeleton loader element
 */
export function createSkeleton(
  type: 'text' | 'circle' | 'rect',
  width?: string,
  height?: string
): HTMLElement {
  const skeleton = document.createElement('div')
  skeleton.className = 'skeleton'
  
  if (type === 'text') {
    skeleton.style.cssText = `
      width: ${width || '100%'};
      height: ${height || '1rem'};
      border-radius: 0.25rem;
    `
  } else if (type === 'circle') {
    const size = width || '3rem'
    skeleton.style.cssText = `
      width: ${size};
      height: ${size};
      border-radius: 50%;
    `
  } else {
    skeleton.style.cssText = `
      width: ${width || '100%'};
      height: ${height || '8rem'};
      border-radius: 0.5rem;
    `
  }
  
  return skeleton
}

// ============================================================================
// PAGE TRANSITION
// ============================================================================

/**
 * Animate page transition
 */
export function animatePageTransition(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    container.classList.add('page-enter')
    
    setTimeout(() => {
      container.classList.remove('page-enter')
      resolve()
    }, 400)
  })
}

/**
 * Stagger children animation
 */
export function staggerChildren(container: HTMLElement): void {
  container.classList.add('stagger-children')
}

// ============================================================================
// UTILITY ANIMATIONS
// ============================================================================

/**
 * Shake element (for errors)
 */
export function shakeElement(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    element.classList.add('shake')
    
    setTimeout(() => {
      element.classList.remove('shake')
      resolve()
    }, 500)
  })
}

/**
 * Bounce element (for attention)
 */
export function bounceElement(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    element.classList.add('bounce')
    
    setTimeout(() => {
      element.classList.remove('bounce')
      resolve()
    }, 500)
  })
}

/**
 * Check if animations should be reduced
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get safe animation duration (respects reduced motion preference)
 */
export function getSafeDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  triggerConfetti,
  animateModeTransition,
  animateProgressBar,
  animateCircularProgress,
  animateNumber,
  showQuestCompletion,
  showTierUnlock,
  animateBadgeUnlock,
  showToast,
  createSkeleton,
  animatePageTransition,
  staggerChildren,
  shakeElement,
  bounceElement,
  prefersReducedMotion,
  getSafeDuration
}
