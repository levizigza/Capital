import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, Clock, Trophy, Target, Calculator,
  TrendUp, Coins, Play, X
} from '@phosphor-icons/react'
import { Simple3DGame } from './Simple3DGame'

interface GameHubProps {
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface SimpleGame {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  color: string
  gameType: 'coin-collector' | 'budget-builder' | 'investment-galaxy' | 'demo'
}

const games: SimpleGame[] = [
  {
    id: 'coin-collector-3d',
    title: '3D Coin Collector',
    description: 'Navigate a 3D space to collect coins while learning about savings',
    icon: <Coins className="w-6 h-6" />,
    difficulty: 'Easy',
    estimatedTime: '2-3 min',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gameType: 'coin-collector'
  },
  {
    id: 'budget-builder-3d',
    title: '3D Budget Builder',
    description: 'Build and visualize budget allocations in 3D space',
    icon: <Calculator className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '3-5 min',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    gameType: 'budget-builder'
  },
  {
    id: 'investment-galaxy-3d',
    title: '3D Investment Galaxy',
    description: 'Explore investment options across different planetary assets',
    icon: <TrendUp className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '3-5 min',
    color: 'bg-green-100 text-green-800 border-green-200',
    gameType: 'investment-galaxy'
  },
  {
    id: 'budget-balance',
    title: 'Budget Balance Challenge',
    description: 'Balance your monthly budget by allocating funds wisely',
    icon: <Calculator className="w-6 h-6" />,
    difficulty: 'Easy',
    estimatedTime: '2-3 min',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    gameType: 'demo'
  }
]

// Simple Budget Game Component
function BudgetGameDemo({ onComplete, onExit }: { onComplete: (score: number, time: number) => void, onExit: () => void }) {
  const [income] = useState(5000)
  const [expenses, setExpenses] = useState({
    housing: 0,
    food: 0,
    transportation: 0,
    entertainment: 0,
    savings: 0
  })
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameStarted, setGameStarted] = useState(false)

  const totalAllocated = Object.values(expenses).reduce((sum, val) => sum + val, 0)
  const remaining = income - totalAllocated
  const isBalanced = Math.abs(remaining) <= 50

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      const score = isBalanced ? 100 - Math.abs(remaining) : Math.max(0, 50 - Math.abs(remaining) / 10)
      onComplete(Math.floor(score), 60)
    }
  }, [timeLeft, gameStarted, isBalanced, remaining, onComplete])

  const updateExpense = (category: keyof typeof expenses, value: number) => {
    if (totalAllocated - expenses[category] + value <= income) {
      setExpenses(prev => ({ ...prev, [category]: value }))
    }
  }

  if (!gameStarted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-6 bg-slate-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Budget Balance Challenge</h3>
          <p className="text-slate-600 mb-6">You have $5,000 monthly income. Allocate it wisely across categories!</p>
          <Button onClick={() => setGameStarted(true)} size="lg" className="bg-slate-800 hover:bg-slate-700">
            <Play className="w-5 h-5 mr-2" />
            Start Challenge
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Budget Challenge</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{timeLeft}s</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onExit}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-slate-600 mb-2">Monthly Income: <span className="font-bold text-green-600">${income.toLocaleString()}</span></p>
          <p className="text-sm text-slate-600 mb-2">Allocated: <span className="font-bold">${totalAllocated.toLocaleString()}</span></p>
          <p className={`text-sm mb-4 font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Remaining: ${remaining.toLocaleString()}
          </p>
        </div>
        <div>
          <Progress value={(totalAllocated / income) * 100} className="h-3 mb-2" />
          <p className="text-xs text-slate-500">Budget Utilization: {Math.round((totalAllocated / income) * 100)}%</p>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(expenses).map(([category, value]) => (
          <div key={category} className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 capitalize w-32">
              {category}:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={income}
                step="50"
                value={value}
                onChange={(e) => updateExpense(category as keyof typeof expenses, parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-mono w-20 text-right">${value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {isBalanced && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-center">
          <Trophy className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-sm text-green-800 font-medium">Perfect Balance Achieved!</p>
        </div>
      )}
    </div>
  )
}

export function Simple3DGameHub({ onGameComplete, onExit }: GameHubProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  const handleGameComplete = (score: number, timeSpent: number) => {
    if (selectedGame) {
      onGameComplete(selectedGame, score, timeSpent * 1000)
      setSelectedGame(null)
    }
  }

  const startGame = (gameId: string) => {
    setSelectedGame(gameId)
    setGameStartTime(Date.now())
  }

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame)
    
    return (
      <div className="h-full bg-slate-50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedGame(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </Button>
            <Button variant="ghost" onClick={onExit}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {selectedGame === 'budget-balance' && (
            <BudgetGameDemo 
              onComplete={handleGameComplete}
              onExit={() => setSelectedGame(null)}
            />
          )}
          
          {game && game.gameType !== 'demo' && (
            <Suspense fallback={
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-2"></div>
                  <p>Loading 3D Game...</p>
                </div>
              </div>
            }>
              <Simple3DGame
                gameType={game.gameType}
                onComplete={handleGameComplete}
                onExit={() => setSelectedGame(null)}
              />
            </Suspense>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Interactive 3D Financial Games</h2>
          <p className="text-slate-600">Learn financial concepts through immersive 3D experiences</p>
        </div>
        <Button variant="ghost" onClick={onExit}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-slate-100 rounded-lg">
                  {game.icon}
                </div>
                <Badge variant="outline" className={game.color}>
                  {game.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg">{game.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">{game.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{game.estimatedTime}</span>
                </div>
                <Button 
                  onClick={() => startGame(game.id)}
                  size="sm"
                  className="bg-slate-800 hover:bg-slate-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}