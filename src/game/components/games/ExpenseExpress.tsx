import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Train } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ExpenseExpressGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface Expense {
  id: number
  category: 'food' | 'transport' | 'entertainment' | 'shopping' | 'bills'
  amount: number
  description: string
  emoji: string
  color: string
}

interface Car {
  id: number
  expense: Expense
  lane: number
  speed: number
}

export function ExpenseExpressGame({ onComplete, onExit, userTier = 'middle' }: ExpenseExpressGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [budget, setBudget] = useState(1000)
  const [cars, setCars] = useState<Car[]>([])
  const [categorizedExpenses, setCategorizedExpenses] = useState<Record<string, number>>({
    food: 0,
    transport: 0,
    entertainment: 0,
    shopping: 0,
    bills: 0
  })
  const [timeLeft, setTimeLeft] = useState(60)
  const [correctCategorizations, setCorrectCategorizations] = useState(0)
  
  const carIdRef = useRef(0)
  const lanes = [0, 1, 2, 3, 4]

  const expenseTypes: Expense[] = [
    { id: 1, category: 'food', amount: 15, description: 'Lunch', emoji: '🍔', color: '#f59e0b' },
    { id: 2, category: 'food', amount: 8, description: 'Coffee', emoji: '☕', color: '#f59e0b' },
    { id: 3, category: 'transport', amount: 25, description: 'Bus Pass', emoji: '🚌', color: '#3b82f6' },
    { id: 4, category: 'transport', amount: 50, description: 'Taxi', emoji: '🚕', color: '#3b82f6' },
    { id: 5, category: 'entertainment', amount: 30, description: 'Movie', emoji: '🎬', color: '#8b5cf6' },
    { id: 6, category: 'entertainment', amount: 20, description: 'Game', emoji: '🎮', color: '#8b5cf6' },
    { id: 7, category: 'shopping', amount: 40, description: 'Clothes', emoji: '👕', color: '#ec4899' },
    { id: 8, category: 'shopping', amount: 60, description: 'Electronics', emoji: '📱', color: '#ec4899' },
    { id: 9, category: 'bills', amount: 100, description: 'Electric', emoji: '⚡', color: '#ef4444' },
    { id: 10, category: 'bills', amount: 80, description: 'Internet', emoji: '📡', color: '#ef4444' }
  ]

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

      // Spawn cars
      const spawnInterval = setInterval(() => {
        const expense = expenseTypes[Math.floor(Math.random() * expenseTypes.length)]
        const lane = Math.floor(Math.random() * 5)
        const newCar: Car = {
          id: carIdRef.current++,
          expense,
          lane,
          speed: 2 + Math.random() * 2
        }
        setCars(prev => [...prev, newCar])
      }, 2000)

      // Move cars
      const moveInterval = setInterval(() => {
        setCars(prev => {
          return prev.map(car => ({
            ...car,
            lane: car.lane // Cars stay in their lane
          })).filter(car => {
            // Remove cars that passed
            return true // We'll handle removal on categorization
          })
        })
      }, 50)

      return () => {
        clearInterval(interval)
        clearInterval(spawnInterval)
        clearInterval(moveInterval)
      }
    }
  }, [gameState])

  const categorizeExpense = (carId: number, category: string) => {
    const car = cars.find(c => c.id === carId)
    if (!car) return

    const isCorrect = car.expense.category === category
    if (isCorrect) {
      setCorrectCategorizations(prev => prev + 1)
      setCategorizedExpenses(prev => ({
        ...prev,
        [category]: prev[category] + car.expense.amount
      }))
      setScore(prev => prev + car.expense.amount * 2)
      setBudget(prev => prev - car.expense.amount)
      toast.success(`Correct! ${car.expense.description} → ${category}`, { duration: 1000 })
    } else {
      setScore(prev => Math.max(0, prev - 20))
      toast.error(`Wrong! It was ${car.expense.category}`, { duration: 1000 })
    }

    setCars(prev => prev.filter(c => c.id !== carId))
  }

  const endGame = () => {
    setGameState('ended')
    const accuracy = correctCategorizations / Math.max(1, correctCategorizations + (cars.length))
    const finalScore = score + (accuracy * 500) + (budget * 0.1)
    setTimeout(() => {
      onComplete(Math.floor(finalScore), {
        correctCategorizations,
        accuracy: accuracy * 100,
        finalBudget: budget,
        expensesByCategory: categorizedExpenses
      })
    }, 2000)
  }

  const startGame = () => {
    setGameState('playing')
    setTimeLeft(60)
    setScore(0)
    setBudget(1000)
    setCars([])
    setCorrectCategorizations(0)
    setCategorizedExpenses({
      food: 0,
      transport: 0,
      entertainment: 0,
      shopping: 0,
      bills: 0
    })
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🚂</div>
            <h2 className="text-3xl font-bold mb-4">Expense Express</h2>
            <p className="text-lg text-gray-600 mb-6">
              Categorize expenses as they come by on the train! Click the correct category button
              to track your spending. Stay within budget!
            </p>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {['food', 'transport', 'entertainment', 'shopping', 'bills'].map(cat => (
                <div key={cat} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">{expenseTypes.find(e => e.category === cat)?.emoji}</div>
                  <div className="text-xs font-semibold capitalize">{cat}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Button onClick={onExit} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2" /> Exit
              </Button>
              <Button onClick={startGame} className="flex-1 bg-orange-600 hover:bg-orange-700">
                Start Tracking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-4">Tracking Complete!</h2>
            <p className="text-2xl font-bold text-green-600 mb-2">Score: {score}</p>
            <p className="text-lg text-gray-600 mb-6">
              Correct: {correctCategorizations} • Budget Remaining: ${budget}
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-4">
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
              <div className="text-sm font-semibold text-gray-600">Budget</div>
              <div className="text-2xl font-bold">${budget}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Correct</div>
              <div className="text-2xl font-bold">{correctCategorizations}</div>
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

      {/* Train Track */}
      <div className="max-w-6xl mx-auto relative bg-black/20 rounded-lg p-8 min-h-[400px] overflow-hidden">
        {/* Lane Markers */}
        {lanes.map(lane => (
          <div
            key={lane}
            className="absolute top-0 bottom-0 border-dashed border-l-2 border-white/30"
            style={{ left: `${lane * 20}%` }}
          />
        ))}

        {/* Expense Cars */}
        <AnimatePresence>
          {cars.map(car => (
            <motion.div
              key={car.id}
              initial={{ x: '-10%' }}
              animate={{ x: '110%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3 / car.speed }}
              className="absolute top-1/2 transform -translate-y-1/2"
              style={{ left: `${car.lane * 20 + 10}%` }}
            >
              <Card className="bg-white shadow-lg border-2" style={{ borderColor: car.expense.color }}>
                <CardContent className="p-4 text-center min-w-[120px]">
                  <div className="text-4xl mb-2">{car.expense.emoji}</div>
                  <div className="text-sm font-bold">{car.expense.description}</div>
                  <div className="text-lg font-bold" style={{ color: car.expense.color }}>
                    ${car.expense.amount}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Category Buttons */}
      <div className="max-w-6xl mx-auto mt-4">
        <Card className="bg-white/90">
          <CardContent className="p-4">
            <div className="text-sm font-semibold mb-3 text-center">Click the correct category:</div>
            <div className="grid grid-cols-5 gap-3">
              {['food', 'transport', 'entertainment', 'shopping', 'bills'].map(category => {
                const expense = expenseTypes.find(e => e.category === category)
                return (
                  <Button
                    key={category}
                    onClick={() => {
                      if (cars.length > 0) {
                        categorizeExpense(cars[0].id, category)
                      }
                    }}
                    className="h-20 flex-col bg-white border-2 hover:scale-105 transition-transform"
                    style={{ borderColor: expense?.color }}
                    disabled={cars.length === 0}
                  >
                    <div className="text-3xl mb-1">{expense?.emoji}</div>
                    <div className="text-xs font-semibold capitalize">{category}</div>
                    <div className="text-xs opacity-70 mt-1">
                      ${categorizedExpenses[category]}
                    </div>
                  </Button>
                )
              })}
            </div>
            {cars.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm font-semibold">
                  Categorize: {cars[0].expense.emoji} {cars[0].expense.description} (${cars[0].expense.amount})
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
