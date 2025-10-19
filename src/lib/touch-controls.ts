/**
 * Touch Control Utilities for Mobile Games
 * Handles touch input for games on mobile devices
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TouchPoint {
  id: number
  x: number
  y: number
  startX: number
  startY: number
  deltaX: number
  deltaY: number
  timestamp: number
}

export interface TouchJoystickState {
  active: boolean
  x: number // -1 to 1
  y: number // -1 to 1
  angle: number // 0 to 360
  distance: number // 0 to 1
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down'
  velocity: number
  distance: number
}

export type TouchEventHandler = (touch: TouchPoint) => void
export type SwipeEventHandler = (swipe: SwipeGesture) => void
export type JoystickEventHandler = (state: TouchJoystickState) => void

// ============================================================================
// TOUCH MANAGER
// ============================================================================

export class TouchManager {
  private element: HTMLElement
  private touches: Map<number, TouchPoint>
  private handlers: Map<string, Set<Function>>
  
  constructor(element: HTMLElement) {
    this.element = element
    this.touches = new Map()
    this.handlers = new Map()
    
    this.setupListeners()
  }
  
  private setupListeners() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false })
  }
  
  private handleTouchStart(e: TouchEvent) {
    e.preventDefault()
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const rect = this.element.getBoundingClientRect()
      
      const touchPoint: TouchPoint = {
        id: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        startX: touch.clientX - rect.left,
        startY: touch.clientY - rect.top,
        deltaX: 0,
        deltaY: 0,
        timestamp: Date.now()
      }
      
      this.touches.set(touch.identifier, touchPoint)
      this.emit('touchstart', touchPoint)
    }
  }
  
  private handleTouchMove(e: TouchEvent) {
    e.preventDefault()
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const existing = this.touches.get(touch.identifier)
      
      if (existing) {
        const rect = this.element.getBoundingClientRect()
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        
        existing.deltaX = x - existing.startX
        existing.deltaY = y - existing.startY
        existing.x = x
        existing.y = y
        
        this.emit('touchmove', existing)
      }
    }
  }
  
  private handleTouchEnd(e: TouchEvent) {
    e.preventDefault()
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const existing = this.touches.get(touch.identifier)
      
      if (existing) {
        this.emit('touchend', existing)
        this.touches.delete(touch.identifier)
      }
    }
  }
  
  public on(event: string, handler: Function) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }
  
  public off(event: string, handler: Function) {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }
  
  private emit(event: string, data: any) {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }
  
  public destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchcancel', this.handleTouchEnd.bind(this))
    this.touches.clear()
    this.handlers.clear()
  }
}

// ============================================================================
// VIRTUAL JOYSTICK
// ============================================================================

export class VirtualJoystick {
  private container: HTMLElement
  private handle: HTMLElement
  private state: TouchJoystickState
  private active: boolean
  private touchId: number | null
  private maxDistance: number
  private onChange: JoystickEventHandler | null
  
  constructor(container: HTMLElement, options: {
    maxDistance?: number
    onChange?: JoystickEventHandler
  } = {}) {
    this.container = container
    this.maxDistance = options.maxDistance || 60
    this.onChange = options.onChange || null
    this.touchId = null
    this.active = false
    
    this.state = {
      active: false,
      x: 0,
      y: 0,
      angle: 0,
      distance: 0
    }
    
    // Create handle if it doesn't exist
    this.handle = container.querySelector('.touch-joystick-handle') as HTMLElement
    if (!this.handle) {
      this.handle = document.createElement('div')
      this.handle.className = 'touch-joystick-handle'
      container.appendChild(this.handle)
    }
    
    this.setupListeners()
  }
  
  private setupListeners() {
    this.container.addEventListener('touchstart', this.handleStart.bind(this), { passive: false })
    this.container.addEventListener('touchmove', this.handleMove.bind(this), { passive: false })
    this.container.addEventListener('touchend', this.handleEnd.bind(this), { passive: false })
    this.container.addEventListener('touchcancel', this.handleEnd.bind(this), { passive: false })
  }
  
  private handleStart(e: TouchEvent) {
    e.preventDefault()
    
    if (this.touchId === null) {
      const touch = e.touches[0]
      this.touchId = touch.identifier
      this.active = true
      this.updatePosition(touch.clientX, touch.clientY)
    }
  }
  
  private handleMove(e: TouchEvent) {
    e.preventDefault()
    
    if (this.touchId !== null) {
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.touchId) {
          this.updatePosition(e.touches[i].clientX, e.touches[i].clientY)
          break
        }
      }
    }
  }
  
  private handleEnd(e: TouchEvent) {
    e.preventDefault()
    
    if (this.touchId !== null) {
      let found = false
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.touchId) {
          found = true
          break
        }
      }
      
      if (!found) {
        this.reset()
      }
    }
  }
  
  private updatePosition(clientX: number, clientY: number) {
    const rect = this.container.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    let deltaX = clientX - centerX
    let deltaY = clientY - centerY
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const angle = Math.atan2(deltaY, deltaX)
    
    // Clamp to max distance
    if (distance > this.maxDistance) {
      deltaX = Math.cos(angle) * this.maxDistance
      deltaY = Math.sin(angle) * this.maxDistance
    }
    
    // Update handle position
    this.handle.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    
    // Update state
    this.state = {
      active: true,
      x: deltaX / this.maxDistance,
      y: deltaY / this.maxDistance,
      angle: (angle * 180 / Math.PI + 360) % 360,
      distance: Math.min(distance / this.maxDistance, 1)
    }
    
    if (this.onChange) {
      this.onChange(this.state)
    }
  }
  
  private reset() {
    this.touchId = null
    this.active = false
    this.handle.style.transform = 'translate(0, 0)'
    
    this.state = {
      active: false,
      x: 0,
      y: 0,
      angle: 0,
      distance: 0
    }
    
    if (this.onChange) {
      this.onChange(this.state)
    }
  }
  
  public getState(): TouchJoystickState {
    return { ...this.state }
  }
  
  public destroy() {
    this.container.removeEventListener('touchstart', this.handleStart.bind(this))
    this.container.removeEventListener('touchmove', this.handleMove.bind(this))
    this.container.removeEventListener('touchend', this.handleEnd.bind(this))
    this.container.removeEventListener('touchcancel', this.handleEnd.bind(this))
  }
}

// ============================================================================
// SWIPE DETECTOR
// ============================================================================

export class SwipeDetector {
  private element: HTMLElement
  private minDistance: number
  private maxTime: number
  private startTouch: TouchPoint | null
  private onSwipe: SwipeEventHandler | null
  
  constructor(element: HTMLElement, options: {
    minDistance?: number
    maxTime?: number
    onSwipe?: SwipeEventHandler
  } = {}) {
    this.element = element
    this.minDistance = options.minDistance || 50
    this.maxTime = options.maxTime || 300
    this.onSwipe = options.onSwipe || null
    this.startTouch = null
    
    this.setupListeners()
  }
  
  private setupListeners() {
    this.element.addEventListener('touchstart', this.handleStart.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleEnd.bind(this), { passive: false })
  }
  
  private handleStart(e: TouchEvent) {
    const touch = e.touches[0]
    const rect = this.element.getBoundingClientRect()
    
    this.startTouch = {
      id: touch.identifier,
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      startX: touch.clientX - rect.left,
      startY: touch.clientY - rect.top,
      deltaX: 0,
      deltaY: 0,
      timestamp: Date.now()
    }
  }
  
  private handleEnd(e: TouchEvent) {
    if (!this.startTouch) return
    
    const touch = e.changedTouches[0]
    const rect = this.element.getBoundingClientRect()
    
    const endX = touch.clientX - rect.left
    const endY = touch.clientY - rect.top
    const deltaX = endX - this.startTouch.startX
    const deltaY = endY - this.startTouch.startY
    const timeDelta = Date.now() - this.startTouch.timestamp
    
    // Check if it's a valid swipe
    if (timeDelta <= this.maxTime) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      if (distance >= this.minDistance) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)
        
        let direction: 'left' | 'right' | 'up' | 'down'
        
        if (absX > absY) {
          direction = deltaX > 0 ? 'right' : 'left'
        } else {
          direction = deltaY > 0 ? 'down' : 'up'
        }
        
        const velocity = distance / timeDelta
        
        const swipe: SwipeGesture = {
          direction,
          velocity,
          distance
        }
        
        if (this.onSwipe) {
          this.onSwipe(swipe)
        }
      }
    }
    
    this.startTouch = null
  }
  
  public destroy() {
    this.element.removeEventListener('touchstart', this.handleStart.bind(this))
    this.element.removeEventListener('touchend', this.handleEnd.bind(this))
  }
}

// ============================================================================
// TAP DETECTOR
// ============================================================================

export class TapDetector {
  private element: HTMLElement
  private maxDistance: number
  private maxTime: number
  private onTap: TouchEventHandler | null
  private onDoubleTap: TouchEventHandler | null
  private startTouch: TouchPoint | null
  private lastTapTime: number
  
  constructor(element: HTMLElement, options: {
    maxDistance?: number
    maxTime?: number
    onTap?: TouchEventHandler
    onDoubleTap?: TouchEventHandler
  } = {}) {
    this.element = element
    this.maxDistance = options.maxDistance || 10
    this.maxTime = options.maxTime || 300
    this.onTap = options.onTap || null
    this.onDoubleTap = options.onDoubleTap || null
    this.startTouch = null
    this.lastTapTime = 0
    
    this.setupListeners()
  }
  
  private setupListeners() {
    this.element.addEventListener('touchstart', this.handleStart.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleEnd.bind(this), { passive: false })
  }
  
  private handleStart(e: TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = this.element.getBoundingClientRect()
    
    this.startTouch = {
      id: touch.identifier,
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      startX: touch.clientX - rect.left,
      startY: touch.clientY - rect.top,
      deltaX: 0,
      deltaY: 0,
      timestamp: Date.now()
    }
  }
  
  private handleEnd(e: TouchEvent) {
    if (!this.startTouch) return
    
    e.preventDefault()
    const touch = e.changedTouches[0]
    const rect = this.element.getBoundingClientRect()
    
    const endX = touch.clientX - rect.left
    const endY = touch.clientY - rect.top
    const deltaX = endX - this.startTouch.startX
    const deltaY = endY - this.startTouch.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const timeDelta = Date.now() - this.startTouch.timestamp
    
    // Check if it's a tap
    if (distance <= this.maxDistance && timeDelta <= this.maxTime) {
      const now = Date.now()
      const timeSinceLastTap = now - this.lastTapTime
      
      // Check for double tap
      if (timeSinceLastTap < 300 && this.onDoubleTap) {
        this.onDoubleTap(this.startTouch)
        this.lastTapTime = 0
      } else {
        if (this.onTap) {
          this.onTap(this.startTouch)
        }
        this.lastTapTime = now
      }
    }
    
    this.startTouch = null
  }
  
  public destroy() {
    this.element.removeEventListener('touchstart', this.handleStart.bind(this))
    this.element.removeEventListener('touchend', this.handleEnd.bind(this))
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Prevent default touch behaviors
 */
export function preventDefaultTouch(element: HTMLElement) {
  element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false })
  element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false })
}

/**
 * Get touch position relative to element
 */
export function getTouchPosition(touch: Touch, element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect()
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  }
}

/**
 * Vibrate device (if supported)
 */
export function vibrate(duration: number | number[] = 50) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration)
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  TouchManager,
  VirtualJoystick,
  SwipeDetector,
  TapDetector,
  isTouchDevice,
  preventDefaultTouch,
  getTouchPosition,
  vibrate
}
