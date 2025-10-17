import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  House, Car, ShoppingBag, GameController, 
  Heart, GraduationCap, Coins, Target, 
  TrendUp, Trophy, Star, ArrowLeft, CheckCircle, X, Warning
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BudgetCategory {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  minPercent: number
  maxPercent: number
  allocated: number
  target: number
  priority: 'needs' | 'wants' | 'savings'
  description: string
}

interface BudgetBalanceProps {
  income: number
  difficulty: 'easy' | 'medium' | 'hard'
  onComplete: (score: number, timeSpent: number) => void
  onExit: () => void
}

export const BudgetBalance: React.FC<BudgetBalanceProps> = ({
  income = 5000,
  difficulty,
  onComplete,
  onExit
}) => {
  const startTime = useRef(Date.now())
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(difficulty === 'easy' ? 180 : difficulty === 'medium' ? 120 : 90)
  const [gamePhase, setGamePhase] = useState<'playing' | 'won' | 'lost'>('playing')
  const [showHints, setShowHints] = useState(difficulty === 'easy')
  
  const [categories, setCategories] = useState<BudgetCategory[]>([
    {
      id: 'housing',
      name: 'Housing',
      icon: <House className="w-6 h-6" />,
      color: 'bg-blue-500',
      minPercent: 25,
      maxPercent: 35,
      allocated: 0,
      target: 30,
      priority: 'needs',
      description: 'Rent, mortgage, utilities'
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: <Car className="w-6 h-6" />,
      color: 'bg-green-500',
      minPercent: 10,
      maxPercent: 20,
      allocated: 0,
      target: 15,
      priority: 'needs',
      description: 'Car payment, gas, insurance'
    },
    {
      id: 'food',
      name: 'Food & Groceries',
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-orange-500',
      minPercent: 10,
      maxPercent: 20,
      allocated: 0,
      target: 12,
      priority: 'needs',
      description: 'Groceries and dining out'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-500',
      minPercent: 5,
      maxPercent: 15,
      allocated: 0,
      target: 8,
      priority: 'needs',
      description: 'Insurance, medical expenses'
    },
    {
      id: 'education',
      name: 'Education',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'bg-purple-500',
      minPercent: 0,
      maxPercent: 15,
      allocated: 0,
      target: 5,
      priority: 'wants',
      description: 'Courses, books, training'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: <GameController className="w-6 h-6" />,
      color: 'bg-pink-500',
      minPercent: 0,
      maxPercent: 15,
      allocated: 0,
      target: 10,
      priority: 'wants',
      description: 'Movies, hobbies, streaming'
    },
    {
      id: 'savings',
      name: 'Savings',
      icon: <Coins className="w-6 h-6" />,
      color: 'bg-yellow-500',
      minPercent: 10,
      maxPercent: 30,
      allocated: 0,
      target: 20,
      priority: 'savings',
      description: 'Emergency fund, investments'
    }
  ])

  useEffect(() => {
    if (gamePhase !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGamePhase('lost')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gamePhase])

  useEffect(() => {
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
    const tolerance = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 2 : 1
    
    if (Math.abs(totalAllocated - 100) <= tolerance && totalAllocated > 95) {
      const allInRange = categories.every(cat => {
        const withinTarget = Math.abs(cat.allocated - cat.target) <= tolerance
        const withinBounds = cat.allocated >= cat.minPercent && cat.allocated <= cat.maxPercent
        return withinTarget && withinBounds
      })
      
      if (allInRange && gamePhase === 'playing') {
        const timeSpent = Date.now() - startTime.current
        const timeBonus = Math.max(0, timeLeft * 10)
        const accuracyBonus = categories.reduce((sum, cat) => {
          const accuracy = Math.max(0, 100 - Math.abs(cat.allocated - cat.target) * 10)
          return sum + accuracy
        }, 0)
        
        const finalScore = Math.round(timeBonus + accuracyBonus)
        setScore(finalScore)
        setGamePhase('won')
        
        toast.success('Perfect Budget Balance!', {
          description: `Score: ${finalScore} points!`
        })
      }
    }
  }, [categories, difficulty, gamePhase, timeLeft])

  const updateAllocation = (categoryId: string, value: number[]) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, allocated: value[0] }
          : cat
      )
    )
  }

  const autoFill503020 = () => {
    const needsTotal = 50
    const wantsTotal = 30
    const savingsTotal = 20
    
    setCategories(prev => prev.map(cat => {
      if (cat.priority === 'needs') {
        if (cat.id === 'housing') return { ...cat, allocated: 30 }
        if (cat.id === 'transportation') return { ...cat, allocated: 10 }
        if (cat.id === 'food') return { ...cat, allocated: 7 }
        if (cat.id === 'healthcare') return { ...cat, allocated: 3 }
      }
      if (cat.priority === 'wants') {
        if (cat.id === 'education') return { ...cat, allocated: 10 }
        if (cat.id === 'entertainment') return { ...cat, allocated: 20 }
      }
      if (cat.priority === 'savings') {
        return { ...cat, allocated: 20 }
      }
      return cat
    }))
    
    toast.info('Applied 50/30/20 rule as a starting point!')
  }

  const resetAllocations = () => {
    setCategories(prev => prev.map(cat => ({ ...cat, allocated: 0 })))
    toast.info('Budget reset!')
  }

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const remaining = 100 - totalAllocated

  const handleComplete = () => {
    const timeSpent = Date.now() - startTime.current
    onComplete(score, timeSpent)
  }

  if (gamePhase === 'won') {
    const needsTotal = categories.filter(c => c.priority === 'needs').reduce((sum, c) => sum + c.allocated, 0)
    const wantsTotal = categories.filter(c => c.priority === 'wants').reduce((sum, c) => sum + c.allocated, 0)
    const savingsTotal = categories.filter(c => c.priority === 'savings').reduce((sum, c) => sum + c.allocated, 0)

    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-4xl font-bold text-green-600 mb-2">Perfect Balance!</h2>
              <p className="text-lg text-gray-600">
                You successfully balanced your budget within the target ranges!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-300">
                <Trophy className="w-12 h-12 mx-auto text-yellow-600 mb-3" />
                <div className="font-bold text-3xl text-yellow-700 mb-1">{score}</div>
                <div className="text-sm text-yellow-800 font-semibold">Final Score</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300">
                <Target className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <div className="font-bold text-3xl text-green-700 mb-1">{Math.round((timeLeft / (difficulty === 'easy' ? 180 : difficulty === 'medium' ? 120 : 90)) * 100)}%</div>
                <div className="text-sm text-green-800 font-semibold">Time Remaining</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300">
                <Star className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                <div className="font-bold text-3xl text-purple-700 mb-1">A+</div>
                <div className="text-sm text-purple-800 font-semibold">Grade</div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8 border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">Your Budget Breakdown</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-sm text-gray-600 mb-1">Needs</div>
                  <div className="text-2xl font-bold text-blue-600">{needsTotal}%</div>
                  <div className="text-xs text-gray-500 mt-1">Target: ~50%</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-sm text-gray-600 mb-1">Wants</div>
                  <div className="text-2xl font-bold text-purple-600">{wantsTotal}%</div>
                  <div className="text-xs text-gray-500 mt-1">Target: ~30%</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-sm text-gray-600 mb-1">Savings</div>
                  <div className="text-2xl font-bold text-green-600">{savingsTotal}%</div>
                  <div className="text-xs text-gray-500 mt-1">Target: ~20%</div>
                </div>
              </div>
              <div className="text-sm text-blue-800">
                <strong>50/30/20 Rule:</strong> Allocate 50% to needs, 30% to wants, and 20% to savings.
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleComplete} className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6">
                <Trophy className="w-5 h-5 mr-2" />
                Continue
              </Button>
              <Button variant="outline" onClick={() => {
                setGamePhase('playing')
                setTimeLeft(difficulty === 'easy' ? 180 : difficulty === 'medium' ? 120 : 90)
                resetAllocations()
              }} className="flex-1 text-lg py-6">
                <TrendUp className="w-5 h-5 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gamePhase === 'lost') {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">⏰</div>
              <h2 className="text-3xl font-bold text-orange-600 mb-2">Time's Up!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Keep practicing to balance your budget faster!
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 mb-6 border-2 border-orange-200">
              <h3 className="font-bold text-orange-900 mb-3">Quick Tips:</h3>
              <ul className="text-sm text-orange-800 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Start with essential categories like housing and transportation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Use the 50/30/20 rule as a starting guideline</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Watch the total percentage to ensure it equals 100%</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => {
                setGamePhase('playing')
                setTimeLeft(difficulty === 'easy' ? 180 : difficulty === 'medium' ? 120 : 90)
                resetAllocations()
              }} className="flex-1 bg-orange-600 hover:bg-orange-700 text-lg py-6">
                Try Again
              </Button>
              <Button variant="outline" onClick={onExit} className="flex-1 text-lg py-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Exit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="shadow-xl mb-6">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                Budget Balance Challenge
              </CardTitle>
              <p className="text-gray-600 mt-2">Allocate your ${income.toLocaleString()} monthly income across categories</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Time Left</div>
              <div className={`text-3xl font-bold ${timeLeft < 30 ? 'text-red-600' : 'text-blue-600'}`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Total Allocated</div>
              <div className={`text-2xl font-bold ${totalAllocated === 100 ? 'text-green-600' : totalAllocated > 100 ? 'text-red-600' : 'text-blue-600'}`}>
                {totalAllocated.toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <div className="text-sm text-gray-600 mb-1">Remaining</div>
              <div className={`text-2xl font-bold ${remaining === 0 ? 'text-green-600' : remaining < 0 ? 'text-red-600' : 'text-purple-600'}`}>
                {remaining.toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-1">Monthly Income</div>
              <div className="text-2xl font-bold text-green-600">
                ${income.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <div className="text-sm text-gray-600 mb-1">Difficulty</div>
              <Badge className="text-lg px-3 py-1">
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="mb-6">
            <Progress 
              value={totalAllocated > 100 ? 100 : totalAllocated} 
              className={`h-4 ${totalAllocated === 100 ? 'bg-green-100' : totalAllocated > 100 ? 'bg-red-100' : 'bg-gray-200'}`}
            />
            {totalAllocated > 100 && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                <X className="w-4 h-4" />
                You've allocated more than 100%! Reduce some categories.
              </p>
            )}
            {totalAllocated === 100 && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Perfect! Now fine-tune to match target ranges.
              </p>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            <Button onClick={autoFill503020} variant="outline" className="flex-1">
              <Target className="w-4 h-4 mr-2" />
              Apply 50/30/20 Rule
            </Button>
            <Button onClick={resetAllocations} variant="outline" className="flex-1">
              Reset
            </Button>
            <Button onClick={onExit} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const dollarAmount = (category.allocated / 100) * income
          const isInRange = category.allocated >= category.minPercent && category.allocated <= category.maxPercent
          const isNearTarget = Math.abs(category.allocated - category.target) <= (difficulty === 'easy' ? 3 : difficulty === 'medium' ? 2 : 1)
          
          return (
            <Card key={category.id} className={`shadow-lg transition-all ${isNearTarget ? 'ring-2 ring-green-400' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${category.color} p-3 rounded-xl text-white`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {category.priority.charAt(0).toUpperCase() + category.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${isNearTarget ? 'text-green-600' : 'text-gray-900'}`}>
                      {category.allocated.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      ${dollarAmount.toFixed(0)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Slider
                    value={[category.allocated]}
                    onValueChange={(value) => updateAllocation(category.id, value)}
                    max={category.maxPercent}
                    step={0.5}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {category.minPercent}%</span>
                    {showHints && <span className="text-blue-600 font-semibold">Target: {category.target}%</span>}
                    <span>Max: {category.maxPercent}%</span>
                  </div>

                  {!isInRange && category.allocated > 0 && (
                    <div className="text-xs text-orange-600 flex items-center gap-1">
                      <Warning className="w-3 h-3" />
                      Outside recommended range
                    </div>
                  )}
                  
                  {isNearTarget && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      On target!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
