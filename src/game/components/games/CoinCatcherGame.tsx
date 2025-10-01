import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pause, Play, Coins, X } from '@phosphor-icons/react'

interface CoinCatcherGameProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface FallingItem {
  id: number
  x: number
  y: number
  type: 'coin' | 'expense'
  value: number
  label: string
  speed: number
}

export function CoinCatcherGame({ onComplete, onExit, userTier = 'middle' }: CoinCatcherGameProps) {
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(60)
  const [playerX, setPlayerX] = useState(50) // percentage from left
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([])
  const [gameSpeed, setGameSpeed] = useState(1)
  
  const gameLoopRef = useRef<number>(0)
  const itemIdRef = useRef(0)
  const lastSpawnRef = useRef(0)

  // Game configuration based on user tier
  const getGameConfig = () => {
    switch (userTier) {
      case 'elementary':
        return {
          spawnRate: 1500, // slower spawn
          coinValues: [1, 2, 5],
          expenseValues: [1, 2],
          expenseLabels: ['Candy', 'Toy', 'Snack'],
          coinLabels: ['Penny', 'Nickel', 'Dime']
        }
      case 'middle':
        return {
          spawnRate: 1200,
          coinValues: [5, 10, 20],
          expenseValues: [5, 10, 15],
          expenseLabels: ['Movie', 'Game', 'Food'],
          coinLabels: ['$5', '$10', '$20']
        }
      case 'adult':
        return {
          spawnRate: 1000,
          coinValues: [50, 100, 200],
          expenseValues: [50, 100, 150],
          expenseLabels: ['Coffee', 'Gas', 'Lunch'],
          coinLabels: ['$50', '$100', '$200']
        }
      default:
        return {
          spawnRate: 1200,
          coinValues: [5, 10, 20],
          expenseValues: [5, 10, 15],
          expenseLabels: ['Movie', 'Game', 'Food'],
          coinLabels: ['$5', '$10', '$20']
        }
    }
  }

  const config = getGameConfig()

  // Handle mouse/touch movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!gameAreaRef.current || gameState !== 'playing') return
    
    const rect = gameAreaRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setPlayerX(Math.max(5, Math.min(95, x)))
  }, [gameState])

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerX(prev => Math.max(5, prev - 5))
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerX(prev => Math.min(95, prev + 5))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState])

  // Spawn falling items
  const spawnItem = useCallback(() => {
    const now = Date.now()
    if (now - lastSpawnRef.current < config.spawnRate / gameSpeed) return

    const isCoin = Math.random() > 0.3 // 70% coins, 30% expenses
    const values = isCoin ? config.coinValues : config.expenseValues
    const labels = isCoin ? config.coinLabels : config.expenseLabels
    const value = values[Math.floor(Math.random() * values.length)]
    const label = labels[Math.floor(Math.random() * labels.length)]

    const newItem: FallingItem = {
      id: itemIdRef.current++,
      x: Math.random() * 90 + 5, // 5% to 95%
      y: -10,
      type: isCoin ? 'coin' : 'expense',
      value,
      label,
      speed: (Math.random() * 2 + 1) * gameSpeed
    }

    setFallingItems(prev => [...prev, newItem])
    lastSpawnRef.current = now
  }, [config, gameSpeed])

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return

    // Spawn new items
    spawnItem()

    // Update falling items
    setFallingItems(prev => {
      const updated = prev.map(item => ({
        ...item,
        y: item.y + item.speed
      })).filter(item => {
        // Check collision with player
        const playerWidth = 12 // percentage
        const itemWidth = 8
        const collision = 
          item.y > 75 && item.y < 90 &&
          item.x > playerX - playerWidth/2 && 
          item.x < playerX + playerWidth/2

        if (collision) {
          if (item.type === 'coin') {
            setScore(prev => prev + item.value)
          } else {
            setScore(prev => Math.max(0, prev - item.value))
            setLives(prev => prev - 1)
          }
          return false // Remove item
        }

        // Remove items that fell off screen
        if (item.y > 110) {
          if (item.type === 'coin') {
            setLives(prev => prev - 1) // Lose life for missing coins
          }
          return false
        }

        return true
      })

      return updated
    })

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, spawnItem, playerX])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('ended')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Game speed increases over time
  useEffect(() => {
    if (gameState !== 'playing') return

    const speedTimer = setInterval(() => {
      setGameSpeed(prev => Math.min(3, prev + 0.1))
    }, 10000) // Increase speed every 10 seconds

    return () => clearInterval(speedTimer)
  }, [gameState])

  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, gameLoop])

  // Check game end conditions
  useEffect(() => {
    if (lives <= 0 || timeLeft <= 0) {
      setGameState('ended')
    }
  }, [lives, timeLeft])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setLives(3)
    setTimeLeft(60)
    setFallingItems([])
    setGameSpeed(1)
    setPlayerX(50)
  }

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused')
  }

  const endGame = () => {
    onComplete(score, { 
      itemsCaught: fallingItems.length,
      accuracy: score / Math.max(1, fallingItems.length),
      livesRemaining: lives 
    })
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Complete!</h2>
            <p className="text-gray-600 mb-6">Great job catching those coins!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Final Score:</span>
                <span className="font-bold text-green-600">${score}</span>
              </div>
              <div className="flex justify-between">
                <span>Lives Remaining:</span>
                <span className="font-bold">{lives}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={startGame} className="flex-1">
                Play Again
              </Button>
              <Button onClick={endGame} variant="outline" className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-600" />
              <h1 className="text-xl font-semibold">Coin Catcher</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${score}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{lives}</div>
              <div className="text-xs text-gray-500">Lives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{timeLeft}s</div>
              <div className="text-xs text-gray-500">Time</div>
            </div>
            
            {gameState === 'playing' || gameState === 'paused' ? (
              <Button onClick={pauseGame} variant="outline" size="sm">
                {gameState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="p-8">
        {gameState === 'ready' ? (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-6">🪙</div>
                <h2 className="text-2xl font-bold mb-4">Coin Catcher</h2>
                <p className="text-gray-600 mb-6">
                  Move your basket to catch falling coins and avoid expenses! 
                  Use your mouse or arrow keys to move left and right.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 font-semibold">Catch Coins 💰</div>
                    <div className="text-green-700">Earn points</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-red-600 font-semibold">Avoid Expenses 💸</div>
                    <div className="text-red-700">Lose points & lives</div>
                  </div>
                </div>

                <Button onClick={startGame} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Game
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div 
              ref={gameAreaRef}
              className="relative bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg border-2 border-sky-300 overflow-hidden"
              style={{ height: '500px' }}
              onMouseMove={handleMouseMove}
            >
              {/* Falling Items */}
              {fallingItems.map(item => (
                <div
                  key={item.id}
                  className={`absolute transition-none pointer-events-none`}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className={`
                    px-2 py-1 rounded-lg text-xs font-bold text-center min-w-12
                    ${item.type === 'coin' 
                      ? 'bg-yellow-400 text-yellow-900 border-2 border-yellow-600' 
                      : 'bg-red-400 text-red-900 border-2 border-red-600'
                    }
                  `}>
                    {item.type === 'coin' ? '💰' : '💸'}
                    <div className="text-xs">{item.label}</div>
                    <div className="font-bold">${item.value}</div>
                  </div>
                </div>
              ))}

              {/* Player Basket */}
              <div
                className="absolute bottom-4 transition-all duration-100"
                style={{
                  left: `${playerX}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="text-4xl">🧺</div>
              </div>

              {/* Game Paused Overlay */}
              {gameState === 'paused' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-bold mb-4">Game Paused</h3>
                      <Button onClick={pauseGame}>Resume</Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Move with your mouse or use ← → arrow keys
            </div>
          </div>
        )}
      </div>
    </div>
  )
}