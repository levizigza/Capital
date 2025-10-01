/**
 * Motion Control System - Handles device motion, gesture recognition, and kinesthetic input
 * Supports phone accelerometer/gyroscope, BLE controllers, and console motion tracking
 */

export interface MotionVector {
  x: number
  y: number
  z: number
  timestamp: number
}

export interface GestureEvent {
  type: 'tilt' | 'shake' | 'throw' | 'pour' | 'tap' | 'swipe' | 'hold'
  intensity: number // 0-1
  direction?: 'up' | 'down' | 'left' | 'right' | 'forward' | 'back'
  duration?: number
  data?: any
}

export interface MotionConfig {
  sensitivity: number // 0.1-2.0
  deadZone: number // 0.01-0.1
  calibrationRequired: boolean
  supportedGestures: GestureEvent['type'][]
}

export class MotionControlSystem {
  private isActive = false
  private deviceMotion: DeviceMotionEvent | null = null
  private deviceOrientation: DeviceOrientationEvent | null = null
  private calibrationData: MotionVector | null = null
  private gestureCallbacks: Map<GestureEvent['type'], Function[]> = new Map()
  private lastMotion: MotionVector = { x: 0, y: 0, z: 0, timestamp: 0 }
  private gestureBuffer: MotionVector[] = []
  private config: MotionConfig

  constructor(config: Partial<MotionConfig> = {}) {
    this.config = {
      sensitivity: 1.0,
      deadZone: 0.05,
      calibrationRequired: true,
      supportedGestures: ['tilt', 'shake', 'pour', 'tap'],
      ...config
    }

    this.initializeGestureCallbacks()
  }

  private initializeGestureCallbacks() {
    this.config.supportedGestures.forEach(gesture => {
      this.gestureCallbacks.set(gesture, [])
    })
  }

  async initialize(): Promise<boolean> {
    try {
      // Request motion permissions for iOS 13+
      if (typeof DeviceMotionEvent !== 'undefined' && 'requestPermission' in DeviceMotionEvent) {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        if (permission !== 'granted') {
          console.warn('Motion permission denied')
          return false
        }
      }

      // Set up motion event listeners
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', this.handleDeviceMotion.bind(this))
      }

      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this))
      }

      this.isActive = true
      return true
    } catch (error) {
      console.error('Failed to initialize motion controls:', error)
      return false
    }
  }

  private handleDeviceMotion(event: DeviceMotionEvent) {
    if (!this.isActive) return

    this.deviceMotion = event
    const acceleration = event.accelerationIncludingGravity

    if (acceleration) {
      const motion: MotionVector = {
        x: acceleration.x || 0,
        y: acceleration.y || 0,
        z: acceleration.z || 0,
        timestamp: Date.now()
      }

      this.processMotion(motion)
    }
  }

  private handleDeviceOrientation(event: DeviceOrientationEvent) {
    if (!this.isActive) return

    this.deviceOrientation = event
    
    // Process tilt gestures based on orientation
    if (event.beta !== null && event.gamma !== null) {
      this.processTilt(event.beta, event.gamma)
    }
  }

  private processMotion(motion: MotionVector) {
    // Apply calibration offset if available
    if (this.calibrationData) {
      motion.x -= this.calibrationData.x
      motion.y -= this.calibrationData.y
      motion.z -= this.calibrationData.z
    }

    // Apply sensitivity scaling
    motion.x *= this.config.sensitivity
    motion.y *= this.config.sensitivity
    motion.z *= this.config.sensitivity

    // Apply dead zone
    if (Math.abs(motion.x) < this.config.deadZone) motion.x = 0
    if (Math.abs(motion.y) < this.config.deadZone) motion.y = 0
    if (Math.abs(motion.z) < this.config.deadZone) motion.z = 0

    // Add to gesture buffer for pattern recognition
    this.gestureBuffer.push(motion)
    if (this.gestureBuffer.length > 10) {
      this.gestureBuffer.shift()
    }

    // Detect shake gesture
    this.detectShake(motion)
    
    // Update last motion
    this.lastMotion = motion
  }

  private processTilt(beta: number, gamma: number) {
    // Beta: front-to-back tilt (-180 to 180)
    // Gamma: left-to-right tilt (-90 to 90)
    
    const tiltThreshold = 15 // degrees
    
    let direction: GestureEvent['direction'] | undefined
    let intensity = 0

    if (Math.abs(beta) > tiltThreshold) {
      direction = beta > 0 ? 'forward' : 'back'
      intensity = Math.min(Math.abs(beta) / 90, 1)
    } else if (Math.abs(gamma) > tiltThreshold) {
      direction = gamma > 0 ? 'right' : 'left'
      intensity = Math.min(Math.abs(gamma) / 90, 1)
    }

    if (direction && intensity > 0) {
      this.emitGesture({
        type: 'tilt',
        intensity,
        direction,
        data: { beta, gamma }
      })
    }
  }

  private detectShake(motion: MotionVector) {
    const shakeThreshold = 15 // m/s²
    const totalAcceleration = Math.sqrt(
      motion.x * motion.x + motion.y * motion.y + motion.z * motion.z
    )

    if (totalAcceleration > shakeThreshold) {
      this.emitGesture({
        type: 'shake',
        intensity: Math.min(totalAcceleration / 30, 1),
        data: { acceleration: totalAcceleration }
      })
    }
  }

  private emitGesture(gesture: GestureEvent) {
    const callbacks = this.gestureCallbacks.get(gesture.type)
    if (callbacks) {
      callbacks.forEach(callback => callback(gesture))
    }
  }

  onGesture(gestureType: GestureEvent['type'], callback: (gesture: GestureEvent) => void) {
    const callbacks = this.gestureCallbacks.get(gestureType)
    if (callbacks) {
      callbacks.push(callback)
    }
  }

  offGesture(gestureType: GestureEvent['type'], callback: Function) {
    const callbacks = this.gestureCallbacks.get(gestureType)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  calibrate() {
    if (this.lastMotion) {
      this.calibrationData = { ...this.lastMotion }
    }
  }

  getCurrentMotion(): MotionVector {
    return this.lastMotion
  }

  getOrientation(): { beta: number | null, gamma: number | null, alpha: number | null } {
    if (!this.deviceOrientation) {
      return { beta: null, gamma: null, alpha: null }
    }

    return {
      beta: this.deviceOrientation.beta,
      gamma: this.deviceOrientation.gamma,
      alpha: this.deviceOrientation.alpha
    }
  }

  setConfig(newConfig: Partial<MotionConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  destroy() {
    this.isActive = false
    
    if (window.DeviceMotionEvent) {
      window.removeEventListener('devicemotion', this.handleDeviceMotion.bind(this))
    }

    if (window.DeviceOrientationEvent) {
      window.removeEventListener('deviceorientation', this.handleDeviceOrientation.bind(this))
    }

    this.gestureCallbacks.clear()
  }
}

// BLE Controller Integration
export interface BLEController {
  id: string
  name: string
  connected: boolean
  battery?: number
}

export class BLEControllerSystem {
  private controllers: Map<string, BLEController> = new Map()
  private isScanning = false

  async scanForControllers(): Promise<BLEController[]> {
    if (!('bluetooth' in navigator)) {
      throw new Error('Bluetooth not supported')
    }

    try {
      this.isScanning = true
      
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { namePrefix: 'FinanceController' },
          { namePrefix: 'MoneyPad' }
        ],
        optionalServices: ['battery_service', 'device_information']
      })

      if (device) {
        const controller: BLEController = {
          id: device.id,
          name: device.name || 'Unknown Controller',
          connected: false
        }

        this.controllers.set(device.id, controller)
        return Array.from(this.controllers.values())
      }

      return []
    } catch (error) {
      console.error('BLE scan failed:', error)
      return []
    } finally {
      this.isScanning = false
    }
  }

  async connectController(controllerId: string): Promise<boolean> {
    const controller = this.controllers.get(controllerId)
    if (!controller) return false

    try {
      // Implementation would connect to the actual BLE device
      // For now, simulate connection
      controller.connected = true
      return true
    } catch (error) {
      console.error('Failed to connect controller:', error)
      return false
    }
  }

  getConnectedControllers(): BLEController[] {
    return Array.from(this.controllers.values()).filter(c => c.connected)
  }
}