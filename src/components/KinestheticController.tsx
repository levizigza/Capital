import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Hand, DeviceMobile, GameController, Target, Lightning,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from '@phosphor-icons/react'

interface MotionData {
  type: 'tilt' | 'shake' | 'tap' | 'gesture'
  direction?: 'up' | 'down' | 'left' | 'right' | 'forward' | 'back'
  intensity: number
  timestamp: number
}

interface KinestheticControllerProps {
  onMotionDetected: (motion: MotionData) => void
  className?: string
}

export function KinestheticController({ onMotionDetected, className }: KinestheticControllerProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentMotion, setCurrentMotion] = useState<string>('')
  const [motionIntensity, setMotionIntensity] = useState(0)
  const [deviceSupport, setDeviceSupport] = useState({
    accelerometer: false,
    gyroscope: false,
    touch: true
  })
  
  const lastMotionRef = useRef<number>(0)
  const shakeThreshold = 15
  const tiltThreshold = 5

  // Check device capabilities
  useEffect(() => {
    const checkDeviceSupport = () => {
      setDeviceSupport({
        accelerometer: 'DeviceMotionEvent' in window,
        gyroscope: 'DeviceOrientationEvent' in window,
        touch: 'ontouchstart' in window
      })
    }

    checkDeviceSupport()
  }, [])

  // Initialize motion detection
  useEffect(() => {
    if (!isActive) return

    let lastX = 0, lastY = 0, lastZ = 0

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity
      if (!acceleration) return

      const x = acceleration.x || 0
      const y = acceleration.y || 0
      const z = acceleration.z || 0

      // Calculate shake intensity
      const deltaX = Math.abs(x - lastX)
      const deltaY = Math.abs(y - lastY)
      const deltaZ = Math.abs(z - lastZ)
      const totalDelta = deltaX + deltaY + deltaZ

      // Detect shake
      if (totalDelta > shakeThreshold) {
        const now = Date.now()
        if (now - lastMotionRef.current > 500) { // Throttle to prevent spam
          const motion: MotionData = {
            type: 'shake',
            intensity: Math.min(totalDelta / shakeThreshold, 2),
            timestamp: now
          }
          
          onMotionDetected(motion)
          setCurrentMotion('shake')
          setMotionIntensity(motion.intensity)
          lastMotionRef.current = now
        }
      }

      lastX = x
      lastY = y
      lastZ = z
    }

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0  // front-to-back tilt
      const gamma = event.gamma || 0 // left-to-right tilt

      let direction: 'up' | 'down' | 'left' | 'right' | undefined
      let intensity = 0

      // Detect significant tilts
      if (Math.abs(beta) > tiltThreshold) {
        direction = beta > 0 ? 'forward' as 'down' : 'back' as 'up'
        intensity = Math.abs(beta) / 90 // Normalize to 0-1
      } else if (Math.abs(gamma) > tiltThreshold) {
        direction = gamma > 0 ? 'right' : 'left'
        intensity = Math.abs(gamma) / 90
      }

      if (direction && intensity > 0.1) {
        const now = Date.now()
        if (now - lastMotionRef.current > 200) {
          const motion: MotionData = {
            type: 'tilt',
            direction,
            intensity,
            timestamp: now
          }
          
          onMotionDetected(motion)
          setCurrentMotion(`tilt-${direction}`)
          setMotionIntensity(intensity)
          lastMotionRef.current = now
        }
      }
    }

    // Request permission for iOS devices
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission()
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion)
          }
        } catch (error) {
          console.error('Motion permission denied:', error)
        }
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion)
      }

      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission()
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation)
          }
        } catch (error) {
          console.error('Orientation permission denied:', error)
        }
      } else {
        window.addEventListener('deviceorientation', handleDeviceOrientation)
      }
    }

    requestPermission()

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion)
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
    }
  }, [isActive, onMotionDetected])

  // Reset motion display after a delay
  useEffect(() => {
    if (currentMotion) {
      const timer = setTimeout(() => {
        setCurrentMotion('')
        setMotionIntensity(0)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentMotion])

  const handleTestGesture = (type: 'shake' | 'tilt', direction?: string) => {
    const motion: MotionData = {
      type,
      direction: direction as any,
      intensity: 0.8,
      timestamp: Date.now()
    }
    
    onMotionDetected(motion)
    setCurrentMotion(`${type}${direction ? `-${direction}` : ''}`)
    setMotionIntensity(0.8)
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Hand className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="font-semibold text-slate-800">Motion Controls</h3>
              <p className="text-sm text-slate-600">Use your device as a controller</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsActive(!isActive)}
              className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isActive ? 'Active' : 'Activate'}
            </Button>
          </div>
        </div>

        {/* Device Support Status */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-2">
            <DeviceMobile className="w-4 h-4" />
            <span className="text-xs">Motion</span>
            <Badge variant={deviceSupport.accelerometer ? "default" : "outline"} className="text-xs">
              {deviceSupport.accelerometer ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="text-xs">Tilt</span>
            <Badge variant={deviceSupport.gyroscope ? "default" : "outline"} className="text-xs">
              {deviceSupport.gyroscope ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Hand className="w-4 h-4" />
            <span className="text-xs">Touch</span>
            <Badge variant={deviceSupport.touch ? "default" : "outline"} className="text-xs">
              {deviceSupport.touch ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        {/* Current Motion Display */}
        {isActive && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lightning className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Motion Detected</span>
              </div>
              
              {currentMotion ? (
                <div className="space-y-2">
                  <div className="text-lg font-bold text-slate-800 capitalize">
                    {currentMotion.replace('-', ' ')}
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${motionIntensity * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Intensity: {Math.round(motionIntensity * 100)}%
                  </div>
                </div>
              ) : (
                <div className="text-slate-500">
                  Waiting for motion...
                </div>
              )}
            </div>

            {/* Control Instructions */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                <div className="font-medium text-slate-700">Gestures:</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GameController className="w-3 h-3" />
                    <span>Shake to activate power-ups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="w-3 h-3" />
                    <span>Tilt left/right to steer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUp className="w-3 h-3" />
                    <span>Tilt forward/back to speed</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-slate-700">Test Controls:</div>
                <div className="space-y-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleTestGesture('shake')}
                    className="w-full text-xs py-1"
                  >
                    Test Shake
                  </Button>
                  <div className="grid grid-cols-2 gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleTestGesture('tilt', 'left')}
                      className="text-xs py-1"
                    >
                      ← Tilt
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleTestGesture('tilt', 'right')}
                      className="text-xs py-1"
                    >
                      Tilt →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inactive State */}
        {!isActive && (
          <div className="text-center py-4 text-slate-500">
            <GameController className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Activate motion controls to use your device as a game controller</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}