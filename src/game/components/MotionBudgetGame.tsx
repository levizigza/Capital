/**
 * Motion Budget Game - Kinesthetic budgeting with physical jar metaphors
 * Players physically tilt their device to "pour" money into budget categories
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, House, Car, ShoppingBag, GameController, 
  PiggyBank, Heart, GraduationCap, Lightning, Trophy
} from '@phosphor-icons/react'
import { MotionControlSystem, GestureEvent } from '../systems/MotionControlSystem'
import { VARKSystem } from '../systems/VARKSystem'
import { AgeTierSystem } from '../systems/AgeTierSystem'

interface BudgetCategory {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  targetPercentage: number
  currentAmount: number
  maxAmount: number
  priority: 'need' | 'want' | 'save'
}

interface MotionBudgetProps {
  income: number
  difficulty: 'easy' | 'medium' | 'hard'
  onComplete: (score: number, timeSpent: number, additionalData?: any) => void
  onExit: () => void
}

export const MotionBudgetGame: React.FC<MotionBudgetProps> = ({
  income,
  difficulty,
  onComplete,
  onExit
}) => {
  const [categories, setCategories] = useState<BudgetCategory[]>([
    {
      id: 'housing',
      name: 'Housing',
      icon: <House className="w-8 h-8" />,
      color: 'bg-blue-500',
      targetPercentage: 30,
      currentAmount: 0,
      maxAmount: income * 0.35,
      priority: 'need'
    },
    {
      id: 'food',
      name: 'Food',
      icon: <ShoppingBag className="w-8 h-8" />,
      color: 'bg-green-500',
      targetPercentage: 15,
      currentAmount: 0,
      maxAmount: income * 0.20,
      priority: 'need'
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: <Car className="w-8 h-8" />,
      color: 'bg-yellow-500',
      targetPercentage: 15,
      currentAmount: 0,
      maxAmount: income * 0.20,
      priority: 'need'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: <GameController className="w-8 h-8" />,
      color: 'bg-purple-500',
      targetPercentage: 10,
      currentAmount: 0,
      maxAmount: income * 0.15,
      priority: 'want'
    },
    {
      id: 'savings',
      name: 'Savings',
      icon: <PiggyBank className="w-8 h-8" />,
      color: 'bg-pink-500',
      targetPercentage: 20,
      currentAmount: 0,
      maxAmount: income * 0.30,
      priority: 'save'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: <Heart className="w-8 h-8" />,
      color: 'bg-red-500',
      targetPercentage: 10,
      currentAmount: 0,
      maxAmount: income * 0.15,
      priority: 'need'
    }
  ])

  const [availableMoney, setAvailableMoney] = useState(income)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [gamePhase, setGamePhase] = useState<'instructions' | 'budgeting' | 'review' | 'complete'>('instructions')
  const [timeLeft, setTimeLeft] = useState(difficulty === 'easy' ? 300 : difficulty === 'medium' ? 240 : 180)
  const [pourAmount, setPourAmount] = useState(50)
  const [isPouring, setIsPouring] = useState(false)
  const [motionEnabled, setMotionEnabled] = useState(false)
  const [currentTilt, setCurrentTilt] = useState({ x: 0, y: 0 })

  const startTime = useRef(Date.now())
  const motionSystem = useRef<MotionControlSystem | null>(null)
  const varkSystem = useRef<VARKSystem | null>(null)
  const ageSystem = useRef<AgeTierSystem | null>(null)

  useEffect(() => {
    // Initialize systems
    varkSystem.current = new VARKSystem()
    ageSystem.current = new AgeTierSystem()
    
    // Set up motion controls
    motionSystem.current = new MotionControlSystem({
      sensitivity: 1.0,
      supportedGestures: ['tilt', 'pour', 'shake']
    })

    motionSystem.current.initialize().then(success => {
      setMotionEnabled(success)
      if (success) {
        motionSystem.current!.onGesture('tilt', handleTiltGesture)
        motionSystem.current!.onGesture('pour', handlePourGesture)
        motionSystem.current!.onGesture('shake', handleShakeGesture)
      }
    })

    // Game timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      motionSystem.current?.destroy()
    }
  }, [])

  const handleTiltGesture = (gesture: GestureEvent) => {
    if (gamePhase !== 'budgeting' || !selectedCategory) return

    setCurrentTilt({
      x: gesture.direction === 'left' ? -gesture.intensity : gesture.direction === 'right' ? gesture.intensity : 0,
      y: gesture.direction === 'forward' ? -gesture.intensity : gesture.direction === 'back' ? gesture.intensity : 0
    })

    // Adjust pour amount based on tilt intensity
    const newPourAmount = Math.round(50 + (gesture.intensity * 100))
    setPourAmount(Math.min(availableMoney, newPourAmount))
  }

  const handlePourGesture = (gesture: GestureEvent) => {
    if (gamePhase !== 'budgeting' || !selectedCategory || availableMoney <= 0) return

    const amountToPour = Math.min(pourAmount, availableMoney)
    pourMoney(selectedCategory, amountToPour)
    
    setIsPouring(true)
    setTimeout(() => setIsPouring(false), 800)
  }

  const handleShakeGesture = (gesture: GestureEvent) => {
    if (gamePhase !== 'budgeting') return
    
    // Shake to redistribute money evenly
    redistributeEvenly()
  }

  const pourMoney = (categoryId: string, amount: number) => {
    if (amount <= 0 || availableMoney < amount) return

    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const newAmount = Math.min(cat.maxAmount, cat.currentAmount + amount)
        const actualAmount = newAmount - cat.currentAmount
        setAvailableMoney(prevMoney => prevMoney - actualAmount)
        return { ...cat, currentAmount: newAmount }
      }
      return cat
    }))
  }

  const removeMoney = (categoryId: string, amount: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const newAmount = Math.max(0, cat.currentAmount - amount)
        const actualAmount = cat.currentAmount - newAmount
        setAvailableMoney(prevMoney => prevMoney + actualAmount)
        return { ...cat, currentAmount: newAmount }
      }
      return cat
    }))
  }

  const redistributeEvenly = () => {
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.currentAmount, 0)
    const totalToRedistribute = totalAllocated + availableMoney
    
    setCategories(prev => prev.map(cat => {
      const targetAmount = (cat.targetPercentage / 100) * totalToRedistribute
      return { ...cat, currentAmount: Math.min(cat.maxAmount, targetAmount) }
    }))

    const newTotalAllocated = categories.reduce((sum, cat) => sum + Math.min(cat.maxAmount, (cat.targetPercentage / 100) * totalToRedistribute), 0)
    setAvailableMoney(totalToRedistribute - newTotalAllocated)
  }

  const calculateScore = () => {
    let score = 0
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.currentAmount, 0)
    
    // Points for allocating all money
    if (availableMoney === 0) {
      score += 200
    } else {
      score += Math.max(0, 200 - (availableMoney / income) * 100)
    }

    // Points for meeting target percentages
    categories.forEach(cat => {
      const targetAmount = (cat.targetPercentage / 100) * income
      const difference = Math.abs(cat.currentAmount - targetAmount)
      const accuracy = Math.max(0, 1 - (difference / targetAmount))
      
      if (cat.priority === 'need') {
        score += accuracy * 100 // Needs are worth more
      } else if (cat.priority === 'save') {
        score += accuracy * 80  // Savings are important
      } else {
        score += accuracy * 60  // Wants are worth less
      }
    })

    // Bonus for using motion controls
    if (motionEnabled) {
      score += 100
    }

    return Math.round(score)
  }

  const endGame = () => {
    const timeSpent = Date.now() - startTime.current
    const finalScore = calculateScore()
    
    setGamePhase('complete')
    
    onComplete(finalScore, timeSpent, {
      finalBudget: categories.map(cat => ({
        category: cat.name,
        amount: cat.currentAmount,
        percentage: (cat.currentAmount / income) * 100
      })),
      moneyLeftOver: availableMoney,
      usedMotionControls: motionEnabled
    })
  }

  const formatCurrency = (amount: number) => {
    return ageSystem.current?.formatCurrency(amount) || `$${amount.toFixed(0)}`
  }

  const getCategoryPercentage = (category: BudgetCategory) => {
    return (category.currentAmount / income) * 100
  }

  const getCategoryFillPercentage = (category: BudgetCategory) => {
    return (category.currentAmount / category.maxAmount) * 100
  }

  if (gamePhase === 'complete') {
    const score = calculateScore()
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-6xl">💰</div>
        <h2 className="text-2xl font-bold">Budget Complete!</h2>
        <div className="text-center space-y-2">
          <p className="text-lg">Final Score: <span className="font-bold text-primary">{score}</span></p>
          <p>Money Left: <span className={availableMoney === 0 ? 'text-green-600' : 'text-yellow-600'}>{formatCurrency(availableMoney)}</span></p>
          {motionEnabled && (
            <Badge className="bg-blue-100 text-blue-800">
              <Lightning className="w-4 h-4 mr-1" />
              Motion Control Master!
            </Badge>
          )}
        </div>
        <Button onClick={onExit}>Continue</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-green-100 to-blue-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              💰 Motion Budget Challenge
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Available: {formatCurrency(availableMoney)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-lg">Monthly Income: <span className="font-bold text-primary">{formatCurrency(income)}</span></p>
            <Progress value={(1 - availableMoney / income) * 100} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {Math.round((1 - availableMoney / income) * 100)}% allocated
            </p>
          </div>
        </CardContent>
      </Card>

      {gamePhase === 'instructions' && (
        <Card>
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p>🎯 <strong>Goal:</strong> Allocate your monthly income across budget categories</p>
              <p>⚖️ <strong>Balance:</strong> Meet your needs, save for the future, and enjoy some wants</p>
              {motionEnabled ? (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="font-semibold text-blue-800">Motion Controls:</p>
                  <p>📱 <strong>Tilt:</strong> Adjust pour amount</p>
                  <p>🫗 <strong>Pour gesture:</strong> Move money into selected jar</p>
                  <p>🤝 <strong>Shake:</strong> Auto-distribute based on recommended percentages</p>
                </div>
              ) : (
                <p>🖱️ Use buttons to move money between categories</p>
              )}
            </div>
            <Button onClick={() => setGamePhase('budgeting')} className="w-full">
              Start Budgeting
            </Button>
          </CardContent>
        </Card>
      )}

      {gamePhase === 'budgeting' && (
        <div className="space-y-4">
          {motionEnabled && selectedCategory && (
            <Card className="border-2 border-primary">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <p className="font-semibold">Selected: {categories.find(c => c.id === selectedCategory)?.name}</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(pourAmount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {isPouring ? "Pouring money... 🫗" : "Tilt to adjust amount, pour gesture to add money"}
                  </p>
                  {currentTilt.x !== 0 || currentTilt.y !== 0 && (
                    <div className="text-xs text-blue-600">
                      Tilt detected: {currentTilt.x > 0 ? '→' : currentTilt.x < 0 ? '←' : ''} 
                      {currentTilt.y > 0 ? '↓' : currentTilt.y < 0 ? '↑' : ''}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.id ? 'ring-2 ring-primary scale-105' : ''
                } ${isPouring && selectedCategory === category.id ? 'animate-pulse' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg text-white ${category.color}`}>
                      {category.icon}
                    </div>
                    <Badge variant={category.priority === 'need' ? 'default' : category.priority === 'save' ? 'secondary' : 'outline'}>
                      {category.priority}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Target: {category.targetPercentage}%</span>
                      <span>Current: {getCategoryPercentage(category).toFixed(1)}%</span>
                    </div>
                    <Progress value={getCategoryFillPercentage(category)} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(category.currentAmount)}</span>
                      <span>max: {formatCurrency(category.maxAmount)}</span>
                    </div>
                  </div>

                  {!motionEnabled && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          pourMoney(category.id, 50)
                        }}
                        disabled={availableMoney < 50}
                      >
                        +$50
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeMoney(category.id, 50)
                        }}
                        disabled={category.currentAmount < 50}
                      >
                        -$50
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            {!motionEnabled && (
              <Button onClick={redistributeEvenly} variant="outline">
                Auto-Distribute
              </Button>
            )}
            <Button 
              onClick={() => setGamePhase('review')}
              disabled={availableMoney > 0}
              className={availableMoney === 0 ? '' : 'opacity-50'}
            >
              {availableMoney === 0 ? 'Review Budget' : `${formatCurrency(availableMoney)} remaining`}
            </Button>
          </div>
        </div>
      )}

      {gamePhase === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Budget Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded text-white ${category.color}`}>
                      <div className="w-5 h-5">{category.icon}</div>
                    </div>
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Target: {category.targetPercentage}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(category.currentAmount)}</p>
                    <p className={`text-sm ${
                      Math.abs(getCategoryPercentage(category) - category.targetPercentage) < 2 
                        ? 'text-green-600' 
                        : Math.abs(getCategoryPercentage(category) - category.targetPercentage) < 5 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {getCategoryPercentage(category).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-lg">
                Estimated Score: <span className="font-bold text-primary">{calculateScore()}</span>
              </p>
            </div>
            
            <Button onClick={endGame} className="w-full">
              Complete Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}