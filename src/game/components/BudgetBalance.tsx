/**
 * Budget Balance - Interactive mini-game for learning budget management
 * Players balance a scale by allocating income to different expense categories
 */

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  House, Car, ShoppingBag, GameController, 
  Heart, GraduationCap, Coins, Target, 
  TrendUp, Trophy, Star
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
}

interface BudgetBalanceProps {
  income: number
  difficulty: 'easy' | 'medium' | 'hard'
  onComplete: (score: number, timeSpent: number) => void
  onExit: () => void
}

export const BudgetBalance: React.FC<BudgetBalanceProps> = ({
  income,
  difficulty,
  onComplete,
  onExit
}) => {
  const startTime = useRef(Date.now())
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(difficulty === 'easy' ? 120 : difficulty === 'medium' ? 90 : 60)
  const [gamePhase, setGamePhase] = useState<'playing' | 'won' | 'lost'>('playing')
  
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
      priority: 'needs'
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
      priority: 'needs'
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
      priority: 'needs'
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
      priority: 'needs'
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
      priority: 'wants'
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
      priority: 'wants'
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
      priority: 'savings'
    }
  ])

  // Game timer
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

  // Check win condition
  useEffect(() => {
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
    const tolerance = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 3 : 1
    
    if (Math.abs(totalAllocated - 100) <= tolerance) {
      const balanced = categories.every(cat => 
        Math.abs(cat.allocated - cat.target) <= tolerance
      )
      
      if (balanced && gamePhase === 'playing') {
        const timeSpent = Date.now() - startTime.current
        const timeBonus = Math.max(0, timeLeft * 10)
        const accuracyBonus = categories.reduce((sum, cat) => {
          const accuracy = Math.max(0, 100 - Math.abs(cat.allocated - cat.target) * 10)
          return sum + accuracy
        }, 0)
        
        const finalScore = timeBonus + accuracyBonus
        setScore(finalScore)
        setGamePhase('won')
        
        toast.success('Perfect Budget Balance!', {
          description: `Score: ${finalScore} points!`
        })
      }
    }
  }, [categories, difficulty, gamePhase, timeLeft])

  const updateAllocation = (categoryId: string, value: number) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, allocated: value }
          : cat
      )
    )
  }

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const remaining = 100 - totalAllocated

  const handleComplete = () => {
    const timeSpent = Date.now() - startTime.current
    onComplete(score, timeSpent)
  }

  if (gamePhase === 'won') {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-bold text-primary">Perfect Balance!</h2>
        <p className="text-lg text-muted-foreground">
          You successfully balanced your budget within the target ranges!
        </p>
        <div className="bg-card p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <div className="font-bold text-2xl">{score}</div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            <div>
              <Target className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <div className="font-bold text-2xl">{Math.round((timeLeft / (difficulty === 'easy' ? 120 : 90)) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Time Bonus</div>
            </div>
            <div>
              <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <div className="font-bold text-2xl">A+</div>
              <div className="text-sm text-muted-foreground">Grade</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Button onClick={handleComplete} className="w-full">
            Continue
          </Button>
          <Button variant="outline" onClick={onExit} className="w-full">
            Play Again
          </Button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'lost') {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">⏰</div>
        <h2 className="text-3xl font-bold text-destructive">Time's Up!</h2>
        <p className="text-lg text-muted-foreground">
          Keep practicing to balance your budget faster!
        </p>
        <div className="space-y-2">
          <Button variant="outline" onClick={onExit} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Budget Balance Challenge</h2>
          <p className="text-muted-foreground">
            Allocate your ${income.toLocaleString()} monthly income across categories
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
          <div className="text-sm text-muted-foreground">Time Left</div>
        </div>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Budget Allocation</span>
            <Badge variant={Math.abs(remaining) <= 1 ? "default" : "secondary"}>
              {remaining > 0 ? `$${Math.round(income * remaining / 100)} remaining` : 
               remaining < 0 ? `$${Math.round(Math.abs(income * remaining / 100))} over budget` : 
               'Perfect!'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Total Allocated</span>
              <span>{totalAllocated.toFixed(1)}%</span>
            </div>
            <Progress 
              value={totalAllocated} 
              className={`h-3 ${totalAllocated > 100 ? 'bg-red-100' : 'bg-green-100'}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Sliders */}
      <div className="grid gap-4">
        {categories.map(category => {
          const amount = Math.round(income * category.allocated / 100)
          const targetAmount = Math.round(income * category.target / 100)
          const isInRange = category.allocated >= category.minPercent && category.allocated <= category.maxPercent
          const isNearTarget = Math.abs(category.allocated - category.target) <= (difficulty === 'easy' ? 5 : 3)
          
          return (
            <Card 
              key={category.id} 
              className={`border-2 transition-all ${
                isNearTarget ? 'border-green-500 bg-green-50' : 
                isInRange ? 'border-blue-200' : 'border-red-300 bg-red-50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.color} text-white`}>
                      {category.icon}
                    </div>
                    <div>
                      <div className="font-semibold">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Target: {category.target}% (${targetAmount.toLocaleString()})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{category.allocated.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">
                      ${amount.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Slider
                    value={[category.allocated]}
                    onValueChange={([value]) => updateAllocation(category.id, value)}
                    max={category.maxPercent}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {category.minPercent}%</span>
                    <span>Max: {category.maxPercent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Priority Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget Priority Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="font-semibold text-red-600">🏠 Needs (50-60%)</div>
              <div className="text-sm text-muted-foreground">
                Essential expenses you can't avoid
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-blue-600">🎯 Wants (20-30%)</div>
              <div className="text-sm text-muted-foreground">
                Lifestyle choices and entertainment
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-green-600">💰 Savings (20%+)</div>
              <div className="text-sm text-muted-foreground">
                Emergency fund and future goals
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}