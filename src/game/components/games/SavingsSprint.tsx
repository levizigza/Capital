import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Trophy } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface SavingsSprintGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface Collectible {
  id: number
  type: 'coin' | 'bill' | 'bonus'
  value: number
  x: number
  y: number
  emoji: string
}

export function SavingsSprintGame({ onComplete, onExit, userTier = 'middle' }: SavingsSprintGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [distance, setDistance] = useState(0)
  const [speed, setSpeed] = useState(5)
  const [playerLane, setPlayerLane] = useState(1) // 0, 1, 2 (left, center, right)
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [combo, setCombo] = useState(0)
  
  const gameLoopRef = useRef<number>(0)
  const collectibleIdRef = useRef(0)
  const lanes = [0, 1, 2]

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            endGame()
            return 0
          }
          return prev - 1
        })
        setDistance(prev => prev + speed)
        setSpeed(prev => Math.min(prev + 0.1, 15))
      }, 100)

      // Spawn collectibles
      const spawnInterval = setInterval(() => {
        spawnCollectible()
      }, 800)

      // Move collectibles
      const moveInterval = setInterval(() => {
        setCollectibles(prev => {
          const updated = prev.map(c => ({ ...c, y: c.y + speed }))
          const collected = updated.filter(c => 
            c.y > 80 && Math.abs(c.x - playerLane * 33.33) < 15
          )
          
          if (collected.length > 0) {
            collected.forEach(c => {
              setScore(prev => prev + c.value)
              setCombo(prev => prev + 1)
              toast.success(`+$${c.value}`, { duration: 500 })
            })
          }

          return updated.filter(c => c.y < 100 && !collected.includes(c))
        })
      }, 50)

      return () => {
        clearInterval(interval)
        clearInterval(spawnInterval)
        clearInterval(moveInterval)
      }
    }
  }, [gameState, speed, playerLane])

  useEffect(() => {
    if (combo > 0 && combo % 5 === 0) {
      toast.success(`${combo}x Combo!`, { duration: 1000 })
    }
  }, [combo])

  const spawnCollectible = () => {
    const lane = Math.floor(Math.random() * 3)
    const type = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'bill' : 'bonus') : 'coin'
    
    const collectibleData = {
      coin: { emoji: '🪙', value: 10 },
      bill: { emoji: '💵', value: 50 },
      bonus: { emoji: '💎', value: 100 }
    }

    const data = collectibleData[type]
    const newCollectible: Collectible = {
      id: collectibleIdRef.current++,
      type,
      value: data.value,
      x: lane * 33.33 + 16.66,
      y: -10,
      emoji: data.emoji
    }

    setCollectibles(prev => [...prev, newCollectible])
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (gameState !== 'playing') return
    
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      setPlayerLane(prev => Math.max(0, prev - 1))
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      setPlayerLane(prev => Math.min(2, prev + 1))
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState])

  const endGame = () => {
    setGameState('ended')
    const finalScore = score + (distance * 0.1) + (combo * 5)
    setTimeout(() => {
      onComplete(Math.floor(finalScore), {
        distance: Math.floor(distance),
        collectiblesCollected: collectibles.length,
        maxCombo: combo,
        finalSpeed: speed
      })
    }, 2000)
  }

  const startGame = () => {
    setGameState('playing')
    setTimeLeft(60)
    setScore(0)
    setDistance(0)
    setSpeed(5)
    setPlayerLane(1)
    setCollectibles([])
    setCombo(0)
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏃</div>
            <h2 className="text-3xl font-bold mb-4">Savings Sprint</h2>
            <p className="text-lg text-gray-600 mb-6">
              Race down the track collecting coins and bills! Use arrow keys or A/D to switch lanes.
              Build combos for bonus points!
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl mb-2">🪙</div>
                <p className="text-sm font-semibold">Coins: $10</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">💵</div>
                <p className="text-sm font-semibold">Bills: $50</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">💎</div>
                <p className="text-sm font-semibold">Bonus: $100</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={onExit} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2" /> Exit
              </Button>
              <Button onClick={startGame} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                Start Race
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-4">Race Complete!</h2>
            <p className="text-2xl font-bold text-green-600 mb-2">Score: {score}</p>
            <p className="text-lg text-gray-600 mb-6">
              Distance: {Math.floor(distance)}m • Max Combo: {combo}x • Speed: {speed.toFixed(1)}x
            </p>
            <Button onClick={() => onComplete(score)} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-4">
      {/* HUD */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Score</div>
              <div className="text-2xl font-bold">${score}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Distance</div>
              <div className="text-2xl font-bold">{Math.floor(distance)}m</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Combo</div>
              <div className="text-2xl font-bold">{combo}x</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Time</div>
              <div className="text-2xl font-bold">{timeLeft}s</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Game Track */}
      <div className="max-w-4xl mx-auto relative bg-black/20 rounded-lg p-8 min-h-[500px] overflow-hidden">
        {/* Lane Markers */}
        {lanes.map(lane => (
          <div
            key={lane}
            className="absolute top-0 bottom-0 border-dashed border-l-2 border-white/30"
            style={{ left: `${lane * 33.33}%` }}
          />
        ))}

        {/* Collectibles */}
        <AnimatePresence>
          {collectibles.map(collectible => (
            <motion.div
              key={collectible.id}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                x: `${collectible.x}%`,
                y: `${collectible.y}%`
              }}
              exit={{ opacity: 0 }}
              className="absolute text-4xl"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              {collectible.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Player */}
        <motion.div
          className="absolute bottom-10 text-6xl"
          style={{ 
            left: `${playerLane * 33.33 + 16.66}%`,
            transform: 'translateX(-50%)'
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          🏃
        </motion.div>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto mt-4">
        <Card className="bg-white/90">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">
              Use <strong>Arrow Keys</strong> or <strong>A/D</strong> to switch lanes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exit Button */}
      <div className="max-w-4xl mx-auto mt-4">
        <Button onClick={onExit} variant="outline" className="bg-white/90">
          <ArrowLeft className="mr-2" /> Exit
        </Button>
      </div>
    </div>
  )
}
