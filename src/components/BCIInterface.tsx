import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, Lightning, Target, Play, Stop,
  WifiHigh, WifiSlash, CheckCircle, XCircle
} from '@phosphor-icons/react'

interface BCIInterfaceProps {
  onFocusChange: (focus: number) => void
  onConnectionChange: (connected: boolean) => void
}

interface EEGData {
  alpha: number
  beta: number
  gamma: number
  theta: number
  focus: number
  relaxation: number
  timestamp: number
}

// Simulated BCI device - in real implementation this would connect to actual hardware
class MockBCIDevice {
  private isConnected = false
  private intervalId: NodeJS.Timeout | null = null
  private baselineAlpha = 0.5
  private baselineBeta = 0.4
  private focusLevel = 0.5

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = Math.random() > 0.2 // 80% success rate for demo
        resolve(this.isConnected)
      }, 2000)
    })
  }

  disconnect() {
    this.isConnected = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  startReading(callback: (data: EEGData) => void) {
    if (!this.isConnected) return

    this.intervalId = setInterval(() => {
      // Simulate realistic EEG patterns with some noise
      const noise = () => (Math.random() - 0.5) * 0.2
      
      // Simulate focus changes based on time and random factors
      const focusChange = (Math.random() - 0.5) * 0.1
      this.focusLevel = Math.max(0, Math.min(1, this.focusLevel + focusChange))
      
      const alpha = Math.max(0, Math.min(1, this.baselineAlpha + noise()))
      const beta = Math.max(0, Math.min(1, this.baselineBeta + noise()))
      const gamma = Math.max(0, Math.min(1, 0.3 + noise()))
      const theta = Math.max(0, Math.min(1, 0.6 + noise()))
      
      // Focus calculation based on beta/alpha ratio (simplified)
      const focus = Math.max(0, Math.min(1, (beta / (alpha + 0.1)) * 0.5 + this.focusLevel * 0.5))
      const relaxation = Math.max(0, Math.min(1, alpha / (beta + 0.1)))

      callback({
        alpha,
        beta,
        gamma,
        theta,
        focus,
        relaxation,
        timestamp: Date.now()
      })
    }, 250) // 4Hz update rate
  }

  stopReading() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  isConnectedDevice(): boolean {
    return this.isConnected
  }
}

export function BCIInterface({ onFocusChange, onConnectionChange }: BCIInterfaceProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [eegData, setEegData] = useState<EEGData | null>(null)
  const [deviceType, setDeviceType] = useState<'muse' | 'emotiv' | 'openbci' | 'mock'>('mock')
  const [calibrating, setCalibrating] = useState(false)
  const [calibrationProgress, setCalibrationProgress] = useState(0)
  
  const deviceRef = useRef<MockBCIDevice | null>(null)
  const calibrationRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    deviceRef.current = new MockBCIDevice()
    return () => {
      if (deviceRef.current) {
        deviceRef.current.disconnect()
      }
    }
  }, [])

  const handleConnect = async () => {
    if (!deviceRef.current) return

    setIsConnecting(true)
    try {
      const connected = await deviceRef.current.connect()
      setIsConnected(connected)
      onConnectionChange(connected)
      
      if (connected) {
        // Start calibration
        startCalibration()
      }
    } catch (error) {
      console.error('BCI connection failed:', error)
      setIsConnected(false)
      onConnectionChange(false)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    if (deviceRef.current) {
      deviceRef.current.disconnect()
    }
    setIsConnected(false)
    setIsReading(false)
    setCalibrating(false)
    onConnectionChange(false)
  }

  const startCalibration = () => {
    setCalibrating(true)
    setCalibrationProgress(0)
    
    calibrationRef.current = setInterval(() => {
      setCalibrationProgress(prev => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          setCalibrating(false)
          if (calibrationRef.current) {
            clearInterval(calibrationRef.current)
            calibrationRef.current = null
          }
          startReading()
        }
        return newProgress
      })
    }, 300)
  }

  const startReading = () => {
    if (!deviceRef.current || !isConnected) return

    setIsReading(true)
    deviceRef.current.startReading((data) => {
      setEegData(data)
      onFocusChange(data.focus)
    })
  }

  const stopReading = () => {
    if (deviceRef.current) {
      deviceRef.current.stopReading()
    }
    setIsReading(false)
  }

  const getFocusColor = (focus: number) => {
    if (focus < 0.3) return 'text-red-500'
    if (focus < 0.6) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getSignalStrength = () => {
    if (!eegData) return 0
    // Simplified signal quality based on alpha + beta strength
    return Math.min(100, (eegData.alpha + eegData.beta) * 100)
  }

  return (
    <div className="space-y-4">
      {/* Connection Controls */}
      <Card className="border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-semibold text-slate-800">Brain-Computer Interface</h3>
                <p className="text-sm text-slate-600">Enhance learning with cognitive feedback</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isConnected ? (
                <WifiHigh className="w-5 h-5 text-green-500" />
              ) : (
                <WifiSlash className="w-5 h-5 text-slate-400" />
              )}
              <Badge variant={isConnected ? "default" : "outline"} className="text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>

          {/* Device Selection */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { id: 'mock', name: 'Demo', icon: '🎮' },
              { id: 'muse', name: 'Muse', icon: '🧠' },
              { id: 'emotiv', name: 'EMOTIV', icon: '⚡' },
              { id: 'openbci', name: 'OpenBCI', icon: '🔬' }
            ].map((device) => (
              <Button
                key={device.id}
                variant={deviceType === device.id ? "default" : "outline"}
                size="sm"
                onClick={() => setDeviceType(device.id as any)}
                disabled={isConnected}
                className="text-xs p-2"
              >
                <span className="mr-1">{device.icon}</span>
                {device.name}
              </Button>
            ))}
          </div>

          {/* Connection Button */}
          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
                size="sm"
              >
                {isConnecting ? (
                  <>
                    <Lightning className="w-4 h-4 mr-2 animate-pulse" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Connect {deviceType.toUpperCase()}
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Stop className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
                
                {!isReading && !calibrating ? (
                  <Button
                    onClick={startReading}
                    size="sm"
                    className="flex-1"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Start Reading
                  </Button>
                ) : (
                  <Button
                    onClick={stopReading}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Stop className="w-4 h-4 mr-2" />
                    Stop Reading
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calibration */}
      {calibrating && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-blue-500 animate-pulse" />
                <h4 className="font-medium">Calibrating...</h4>
              </div>
              <p className="text-sm text-slate-600">
                Relax and focus on the center of the screen for baseline measurements
              </p>
              <Progress value={calibrationProgress} className="h-2" />
              <p className="text-xs text-slate-500">
                {Math.round(calibrationProgress)}% Complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Data */}
      {isReading && eegData && (
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Brain Activity</h4>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Live</span>
                </div>
              </div>

              {/* Focus Meter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Focus Level</span>
                  <span className={`text-sm font-bold ${getFocusColor(eegData.focus)}`}>
                    {Math.round(eegData.focus * 100)}%
                  </span>
                </div>
                <div className="relative">
                  <Progress value={eegData.focus * 100} className="h-3" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-5 bg-slate-600 opacity-50" style={{ left: '30%' }} />
                    <div className="w-1 h-5 bg-slate-600 opacity-50" style={{ left: '70%' }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Distracted</span>
                  <span>Focused</span>
                  <span>Flow State</span>
                </div>
              </div>

              {/* Brainwave Bands */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Alpha (8-12Hz)</span>
                    <span>{Math.round(eegData.alpha * 100)}%</span>
                  </div>
                  <Progress value={eegData.alpha * 100} className="h-1" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Beta (12-30Hz)</span>
                    <span>{Math.round(eegData.beta * 100)}%</span>
                  </div>
                  <Progress value={eegData.beta * 100} className="h-1" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Theta (4-8Hz)</span>
                    <span>{Math.round(eegData.theta * 100)}%</span>
                  </div>
                  <Progress value={eegData.theta * 100} className="h-1" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Signal Quality</span>
                    <span>{Math.round(getSignalStrength())}%</span>
                  </div>
                  <Progress value={getSignalStrength()} className="h-1" />
                </div>
              </div>

              {/* Game Effects */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <h5 className="text-sm font-medium mb-2">Game Effects</h5>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    <span>High focus = lower interest rates in debt games</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightning className="w-3 h-3" />
                    <span>Calm state = bonus thinking time in decisions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-3 h-3" />
                    <span>Flow state = unlocks advanced challenges</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}