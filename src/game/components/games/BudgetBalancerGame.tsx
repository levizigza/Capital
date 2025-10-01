import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calculator, Check, X } from '@phosphor-icons/react'

interface BudgetBalancerGameProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface BudgetItem {
  id: number
  name: string
  amount: number
  category: string
  isCorrect?: boolean
}

interface BudgetCategory {
  name: string
  target: number
  current: number
  color: string
}

export function BudgetBalancerGame({ onComplete, onExit, userTier = 'middle' }: BudgetBalancerGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds] = useState(3)
  const [timeLeft, setTimeLeft] = useState(90)
  const [draggedItem, setDraggedItem] = useState<BudgetItem | null>(null)
  
  // Game data based on user tier
  const getGameData = () => {
    switch (userTier) {
      case 'elementary':
        return {
          income: 100,
          items: [
            { id: 1, name: 'Lunch Money', amount: 25, category: 'Food' },
            { id: 2, name: 'New Toy', amount: 15, category: 'Fun' },
            { id: 3, name: 'School Supplies', amount: 10, category: 'School' },
            { id: 4, name: 'Snacks', amount: 8, category: 'Food' },
            { id: 5, name: 'Movie Ticket', amount: 12, category: 'Fun' },
            { id: 6, name: 'Books', amount: 20, category: 'School' },
            { id: 7, name: 'Save for Later', amount: 10, category: 'Savings' }
          ],
          categories: [
            { name: 'Food', target: 33, current: 0, color: 'bg-green-100 border-green-300' },
            { name: 'Fun', target: 27, current: 0, color: 'bg-blue-100 border-blue-300' },
            { name: 'School', target: 30, current: 0, color: 'bg-purple-100 border-purple-300' },
            { name: 'Savings', target: 10, current: 0, color: 'bg-yellow-100 border-yellow-300' }
          ]
        }
      case 'middle':
        return {
          income: 500,
          items: [
            { id: 1, name: 'Food & Groceries', amount: 150, category: 'Needs' },
            { id: 2, name: 'Video Games', amount: 60, category: 'Entertainment' },
            { id: 3, name: 'School Supplies', amount: 40, category: 'Education' },
            { id: 4, name: 'Clothes', amount: 80, category: 'Needs' },
            { id: 5, name: 'Movies & Music', amount: 45, category: 'Entertainment' },
            { id: 6, name: 'Books & Courses', amount: 35, category: 'Education' },
            { id: 7, name: 'Emergency Fund', amount: 50, category: 'Savings' },
            { id: 8, name: 'Future Goals', amount: 40, category: 'Savings' }
          ],
          categories: [
            { name: 'Needs', target: 230, current: 0, color: 'bg-red-100 border-red-300' },
            { name: 'Entertainment', target: 105, current: 0, color: 'bg-blue-100 border-blue-300' },
            { name: 'Education', target: 75, current: 0, color: 'bg-purple-100 border-purple-300' },
            { name: 'Savings', target: 90, current: 0, color: 'bg-green-100 border-green-300' }
          ]
        }
      case 'adult':
        return {
          income: 4000,
          items: [
            { id: 1, name: 'Rent/Mortgage', amount: 1200, category: 'Housing' },
            { id: 2, name: 'Groceries', amount: 400, category: 'Food' },
            { id: 3, name: 'Car Payment', amount: 350, category: 'Transportation' },
            { id: 4, name: 'Insurance', amount: 200, category: 'Insurance' },
            { id: 5, name: 'Utilities', amount: 150, category: 'Housing' },
            { id: 6, name: 'Gas', amount: 120, category: 'Transportation' },
            { id: 7, name: 'Entertainment', amount: 200, category: 'Lifestyle' },
            { id: 8, name: 'Dining Out', amount: 180, category: 'Food' },
            { id: 9, name: 'Emergency Fund', amount: 400, category: 'Savings' },
            { id: 10, name: 'Retirement', amount: 600, category: 'Savings' },
            { id: 11, name: 'Health Insurance', amount: 300, category: 'Insurance' }
          ],
          categories: [
            { name: 'Housing', target: 1350, current: 0, color: 'bg-red-100 border-red-300' },
            { name: 'Food', target: 580, current: 0, color: 'bg-green-100 border-green-300' },
            { name: 'Transportation', target: 470, current: 0, color: 'bg-blue-100 border-blue-300' },
            { name: 'Insurance', target: 500, current: 0, color: 'bg-purple-100 border-purple-300' },
            { name: 'Lifestyle', target: 200, current: 0, color: 'bg-orange-100 border-orange-300' },
            { name: 'Savings', target: 1000, current: 0, color: 'bg-yellow-100 border-yellow-300' }
          ]
        }
      default:
        return {
          income: 500,
          items: [],
          categories: []
        }
    }
  }

  const [gameData, setGameData] = useState(getGameData())
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<BudgetCategory[]>([])

  // Initialize game data
  useEffect(() => {
    const data = getGameData()
    setGameData(data)
    setBudgetItems([...data.items])
    setCategories([...data.categories])
  }, [userTier])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setCurrentRound(1)
    setTimeLeft(90)
    const data = getGameData()
    setBudgetItems([...data.items])
    setCategories(data.categories.map(cat => ({ ...cat, current: 0 })))
  }

  const handleDragStart = (item: BudgetItem) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (categoryName: string) => {
    if (!draggedItem) return

    const isCorrect = draggedItem.category === categoryName
    
    // Update categories
    setCategories(prev => prev.map(cat => 
      cat.name === categoryName 
        ? { ...cat, current: cat.current + draggedItem.amount }
        : cat
    ))

    // Update items
    setBudgetItems(prev => prev.map(item => 
      item.id === draggedItem.id 
        ? { ...item, isCorrect }
        : item
    ).filter(item => item.id !== draggedItem.id))

    // Update score
    if (isCorrect) {
      setScore(prev => prev + draggedItem.amount)
    } else {
      setScore(prev => Math.max(0, prev - draggedItem.amount * 0.5))
    }

    setDraggedItem(null)

    // Check if round is complete
    if (budgetItems.length === 1) {
      if (currentRound < totalRounds) {
        // Next round
        setTimeout(() => {
          setCurrentRound(prev => prev + 1)
          const data = getGameData()
          setBudgetItems([...data.items])
          setCategories(data.categories.map(cat => ({ ...cat, current: 0 })))
        }, 1000)
      } else {
        // Game complete
        setTimeout(() => endGame(), 1000)
      }
    }
  }

  const endGame = () => {
    setGameState('ended')
    const accuracy = score / (gameData.income * totalRounds)
    onComplete(score, { 
      accuracy: Math.round(accuracy * 100),
      roundsPlayed: currentRound,
      timeRemaining: timeLeft
    })
  }

  const getBudgetBalance = () => {
    const totalSpent = categories.reduce((sum, cat) => sum + cat.current, 0)
    return gameData.income - totalSpent
  }

  if (gameState === 'ended') {
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.current, 0)
    const balance = gameData.income - totalBudgeted
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget Complete!</h2>
            <p className="text-gray-600 mb-6">Great job managing your budget!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-bold text-green-600">{score} points</span>
              </div>
              <div className="flex justify-between">
                <span>Budget Balance:</span>
                <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${balance}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rounds Completed:</span>
                <span className="font-bold">{currentRound}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={startGame} className="flex-1">
                Play Again
              </Button>
              <Button onClick={() => onComplete(score)} variant="outline" className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Budget Balancer</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentRound}/{totalRounds}</div>
              <div className="text-xs text-gray-500">Round</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{timeLeft}s</div>
              <div className="text-xs text-gray-500">Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="p-8">
        {gameState === 'ready' ? (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-6">📊</div>
                <h2 className="text-2xl font-bold mb-4">Budget Balancer</h2>
                <p className="text-gray-600 mb-6">
                  Drag budget items to the correct categories to balance your monthly budget! 
                  Make smart choices to maximize your score.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="text-lg font-semibold text-blue-800">
                    Monthly Income: ${gameData.income}
                  </div>
                </div>

                <Button onClick={startGame} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Budgeting
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Budget Overview */}
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Monthly Budget: ${gameData.income}</span>
                    <span className={`text-lg ${getBudgetBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Balance: ${getBudgetBalance()}
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Budget Items */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {budgetItems.map(item => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(item)}
                          className="p-3 bg-white border-2 border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="outline">${item.amount}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Budget Categories */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map(category => (
                        <div
                          key={category.name}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(category.name)}
                          className={`p-4 border-2 border-dashed rounded-lg min-h-32 ${category.color} transition-all hover:shadow-md`}
                        >
                          <div className="text-center">
                            <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                            <div className="text-2xl font-bold mb-2">
                              ${category.current} / ${category.target}
                            </div>
                            <Progress 
                              value={(category.current / category.target) * 100} 
                              className="w-full h-2"
                            />
                            <div className="mt-2 text-sm">
                              {category.current <= category.target ? (
                                <span className="text-green-600 flex items-center justify-center gap-1">
                                  <Check className="w-4 h-4" />
                                  On Track
                                </span>
                              ) : (
                                <span className="text-red-600 flex items-center justify-center gap-1">
                                  <X className="w-4 h-4" />
                                  Over Budget
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Drag budget items from the left to the appropriate categories on the right
            </div>
          </div>
        )}
      </div>
    </div>
  )
}