import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Sword, Shield, Coins } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface DebtDungeonGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface DebtMonster {
  id: number
  type: 'credit-card' | 'loan' | 'subscription'
  health: number
  maxHealth: number
  debt: number
  emoji: string
  name: string
  x: number
  y: number
}

export function DebtDungeonGame({ onComplete, onExit, userTier = 'middle' }: DebtDungeonGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(100)
  const [money, setMoney] = useState(1000)
  const [monsters, setMonsters] = useState<DebtMonster[]>([])
  const [wave, setWave] = useState(1)
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedAttack, setSelectedAttack] = useState<'budget-cut' | 'payment' | 'negotiate' | null>(null)
  
  const gameLoopRef = useRef<number>(0)
  const monsterIdRef = useRef(0)

  const attackTypes = {
    'budget-cut': { damage: 30, cost: 50, emoji: '✂️', name: 'Budget Cut' },
    'payment': { damage: 50, cost: 100, emoji: '💵', name: 'Payment' },
    'negotiate': { damage: 20, cost: 0, emoji: '🤝', name: 'Negotiate' }
  }

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
      }, 1000)

      // Spawn monsters
      const spawnInterval = setInterval(() => {
        if (monsters.length < 5) {
          spawnMonster()
        }
      }, 3000)

      return () => {
        clearInterval(interval)
        clearInterval(spawnInterval)
      }
    }
  }, [gameState, monsters.length])

  const spawnMonster = () => {
    const types: Array<'credit-card' | 'loan' | 'subscription'> = ['credit-card', 'loan', 'subscription']
    const type = types[Math.floor(Math.random() * types.length)]
    
    const monsterData = {
      'credit-card': { emoji: '💳', name: 'Credit Card Debt', health: 50 + wave * 10, debt: 500 },
      loan: { emoji: '📋', name: 'Loan Monster', health: 80 + wave * 15, debt: 1000 },
      subscription: { emoji: '📱', name: 'Subscription Trap', health: 30 + wave * 5, debt: 200 }
    }

    const data = monsterData[type]
    const newMonster: DebtMonster = {
      id: monsterIdRef.current++,
      type,
      health: data.health,
      maxHealth: data.health,
      debt: data.debt,
      emoji: data.emoji,
      name: data.name,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20
    }

    setMonsters(prev => [...prev, newMonster])
  }

  const attackMonster = (monsterId: number) => {
    if (!selectedAttack) {
      toast.error('Select an attack first!')
      return
    }

    const attack = attackTypes[selectedAttack]
    if (money < attack.cost) {
      toast.error('Not enough money!')
      return
    }

    setMonsters(prev => prev.map(m => {
      if (m.id === monsterId) {
        const newHealth = Math.max(0, m.health - attack.damage)
        if (newHealth === 0) {
          // Monster defeated
          setScore(prev => prev + m.debt)
          setMoney(prev => prev + m.debt * 0.5) // Get reward
          toast.success(`Defeated ${m.name}! +${m.debt} points`)
          return null
        }
        return { ...m, health: newHealth }
      }
      return m
    }).filter(Boolean) as DebtMonster[])

    setMoney(prev => prev - attack.cost)
    setSelectedAttack(null)

    // Check for wave completion
    if (monsters.length === 1) {
      setWave(prev => prev + 1)
      toast.success(`Wave ${wave + 1} starting!`)
    }
  }

  const endGame = () => {
    setGameState('ended')
    const finalScore = score + (health * 10) + (money * 0.1)
    setTimeout(() => {
      onComplete(Math.floor(finalScore), {
        monstersDefeated: monsters.length,
        wavesCompleted: wave,
        finalHealth: health,
        finalMoney: money
      })
    }, 2000)
  }

  const startGame = () => {
    setGameState('playing')
    setTimeLeft(60)
    setScore(0)
    setHealth(100)
    setMoney(1000)
    setWave(1)
    setMonsters([])
    spawnMonster()
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="text-3xl font-bold mb-4">Debt Dungeon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Fight debt monsters using smart financial strategies! Use budget cuts, payments, and negotiations to defeat them.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-3xl mb-2">💳</div>
                <p className="text-sm font-semibold">Credit Cards</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm font-semibold">Loans</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">📱</div>
                <p className="text-sm font-semibold">Subscriptions</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={onExit} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2" /> Exit
              </Button>
              <Button onClick={startGame} className="flex-1 bg-red-600 hover:bg-red-700">
                Start Battle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-4">Battle Complete!</h2>
            <p className="text-2xl font-bold text-green-600 mb-2">Score: {score}</p>
            <p className="text-lg text-gray-600 mb-6">
              Waves Completed: {wave - 1} • Health: {health}% • Money: ${money}
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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 p-4">
      {/* HUD */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Health</div>
              <Progress value={health} className="h-2 mb-1" />
              <div className="text-lg font-bold">{health}%</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Money</div>
              <div className="text-2xl font-bold">${money}</div>
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

      {/* Game Area */}
      <div className="max-w-6xl mx-auto relative bg-black/30 rounded-lg p-8 min-h-[400px]">
        {/* Monsters */}
        <div className="relative h-full min-h-[400px]">
          <AnimatePresence>
            {monsters.map(monster => (
              <motion.div
                key={monster.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, x: `${monster.x}%`, y: `${monster.y}%` }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute cursor-pointer"
                style={{ transform: 'translate(-50%, -50%)' }}
                onClick={() => attackMonster(monster.id)}
              >
                <div className="text-center">
                  <div className="text-6xl mb-2">{monster.emoji}</div>
                  <div className="bg-white/90 px-3 py-1 rounded-lg text-xs font-bold mb-1">
                    {monster.name}
                  </div>
                  <Progress value={(monster.health / monster.maxHealth) * 100} className="w-24 h-2" />
                  <div className="text-xs text-white mt-1">${monster.debt}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Attack Selection */}
      <div className="max-w-6xl mx-auto mt-4">
        <Card className="bg-white/90">
          <CardContent className="p-4">
            <div className="text-sm font-semibold mb-3">Select Attack:</div>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(attackTypes).map(([key, attack]) => (
                <Button
                  key={key}
                  variant={selectedAttack === key ? 'default' : 'outline'}
                  onClick={() => setSelectedAttack(key as any)}
                  disabled={money < attack.cost}
                  className="h-20 flex-col"
                >
                  <div className="text-2xl mb-1">{attack.emoji}</div>
                  <div className="text-xs">{attack.name}</div>
                  <div className="text-xs opacity-70">Cost: ${attack.cost}</div>
                </Button>
              ))}
            </div>
            {selectedAttack && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  Selected: <strong>{attackTypes[selectedAttack].name}</strong> - Click on a monster to attack!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exit Button */}
      <div className="max-w-6xl mx-auto mt-4">
        <Button onClick={onExit} variant="outline" className="bg-white/90">
          <ArrowLeft className="mr-2" /> Exit
        </Button>
      </div>
    </div>
  )
}
