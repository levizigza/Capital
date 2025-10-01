import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Hand, Target, Trophy, Coins, Lightning
} from '@phosphor-icons/react'

interface MotionGameDemoProps {
  onComplete: (score: number) => void
  onExit: () => void
}

interface GameState {
  score: number
  coinsCollected: number
  position: { x: number, y: number }
  isActive: boolean
  timeLeft: number
}

export function MotionGameDemo({ onComplete, onExit }: MotionGameDemoProps) {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    coinsCollected: 0,
    position: { x: 50, y: 50 },
    isActive: false,
    timeLeft: 30
  })
  
  const [deviceMotion, setDeviceMotion] = useState({ x: 0, y: 0, z: 0 })
  const [coins, setCoins] = useState<Array<{ id: number, x: number, y: number, collected: boolean }>>([])
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const coinIdRef = useRef(0)

  // Initialize coins
  useEffect(() => {
    const initialCoins = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      collected: false
    }))
    setCoins(initialCoins)
  }, [])

  // Game timer
  useEffect(() => {
    if (!gameState.isActive) return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          onComplete(prev.score)
          return { ...prev, timeLeft: 0, isActive: false }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isActive, onComplete])

  // Motion detection
  useEffect(() => {
    if (!gameState.isActive) return

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity
      if (!acceleration) return

      const x = acceleration.x || 0
      const y = acceleration.y || 0
      const z = acceleration.z || 0

      setDeviceMotion({ x, y, z })

      // Convert motion to player position (simple mapping)
      setGameState(prev => ({
        ...prev,
        position: {
          x: Math.max(5, Math.min(95, prev.position.x + x * 2)),
          y: Math.max(5, Math.min(95, prev.position.y - y * 2))
        }
      }))
    }

    // Request permission for iOS
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
    }

    requestPermission()

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion)
    }
  }, [gameState.isActive])

  // Collision detection
  useEffect(() => {
    coins.forEach(coin => {
      if (coin.collected) return

      const distance = Math.sqrt(
        Math.pow(gameState.position.x - coin.x, 2) + 
        Math.pow(gameState.position.y - coin.y, 2)
      )

      if (distance < 8) {
        setCoins(prev => prev.map(c => 
          c.id === coin.id ? { ...c, collected: true } : c
        ))
        
        setGameState(prev => ({
          ...prev,
          score: prev.score + 100,
          coinsCollected: prev.coinsCollected + 1
        }))

        // Spawn new coin
        setTimeout(() => {
          coinIdRef.current++
          setCoins(prev => [...prev, {
            id: coinIdRef.current,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            collected: false
          }])
        }, 1000)
      }
    })
  }, [gameState.position, coins])

  const startGame = async () => {
    // Request device motion permission
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        if (permission !== 'granted') {
          alert('Motion permission is required for this game!')
          return
        }
      } catch (error) {
        console.error('Permission request failed:', error)
      }
    }

    setGameState(prev => ({ ...prev, isActive: true, timeLeft: 30 }))
  }

  const useKeyboardControls = () => {
    setGameState(prev => ({ ...prev, isActive: true, timeLeft: 30 }))
    
    // Add keyboard controls as fallback
    const handleKeyPress = (e: KeyboardEvent) => {
      const speed = 5
      setGameState(prev => {
        let newX = prev.position.x
        let newY = prev.position.y
        
        switch (e.key) {
          case 'ArrowLeft':
            newX = Math.max(5, prev.position.x - speed)
            break
          case 'ArrowRight':
            newX = Math.min(95, prev.position.x + speed)
            break
          case 'ArrowUp':
            newY = Math.max(5, prev.position.y - speed)
            break
          case 'ArrowDown':
            newY = Math.min(95, prev.position.y + speed)
            break
        }
        
        return { ...prev, position: { x: newX, y: newY } }
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }

  if (!gameState.isActive) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Hand className="w-8 h-8 text-blue-500" />
              Motion Coin Collector
            </CardTitle>
            <p className="text-slate-600">
              Tilt your device to move and collect financial coins!
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <div className="text-6xl">🪙</div>
              <p className="text-sm text-slate-600">
                Use device motion to navigate and collect coins. Each coin represents $100 in your savings account!
              </p>
            </div>
            
            <div className="space-y-3">
              <Button onClick={startGame} className="w-full" size="lg">
                <Lightning className="w-5 h-5 mr-2" />
                Start Motion Game
              </Button>
              
              <Button onClick={useKeyboardControls} variant="outline" className="w-full">
                <Target className="w-5 h-5 mr-2" />
                Use Arrow Keys Instead
              </Button>
              
              <Button onClick={onExit} variant="ghost" className="w-full">
                Back to Games
              </Button>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <div className="font-medium mb-2">How to Play:</div>
              <ul className="space-y-1 text-slate-600">
                <li>• Tilt your device to move the player</li>
                <li>• Collect coins to earn points</li>
                <li>• Each coin = $100 learned savings</li>
                <li>• Collect as many as possible in 30 seconds!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-green-900 to-blue-900 relative overflow-hidden">
      {/* Game UI */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Card className="p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-bold">{gameState.score}</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-green-500" />
              <span className="font-bold">{gameState.coinsCollected}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">{gameState.timeLeft}s</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-2">
          <div className="text-xs space-y-1">
            <div>Motion: X: {deviceMotion.x.toFixed(1)}</div>
            <div>Y: {deviceMotion.y.toFixed(1)}</div>
          </div>
        </Card>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="absolute inset-4 border-2 border-white border-opacity-30 rounded-lg overflow-hidden"
      >
        {/* Player */}
        <div
          className="absolute w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-xl transition-all duration-100 z-20"
          style={{
            left: `${gameState.position.x}%`,
            top: `${gameState.position.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          🎯
        </div>

        {/* Coins */}
        {coins
          .filter(coin => !coin.collected)
          .map(coin => (
            <div
              key={coin.id}
              className="absolute w-6 h-6 text-2xl transition-all duration-200 animate-pulse"
              style={{
                left: `${coin.x}%`,
                top: `${coin.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              🪙
            </div>
          ))
        }

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
          <p className="text-sm opacity-75">
            Tilt your device to move • Collect coins to learn about savings!
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="absolute bottom-4 left-4 right-4">
        <Progress value={(30 - gameState.timeLeft) / 30 * 100} className="h-2" />
      </div>
    </div>
  )
}