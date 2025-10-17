import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calculator, Check, X, Star, TrendUp, ArrowsDownUp } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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
  isPlaced?: boolean
  emoji: string
}

interface BudgetCategory {
  name: string
  target: number
  current: number
  color: string
  description: string
  items: BudgetItem[]
}

export function BudgetBalancerGame({ onComplete, onExit, userTier = 'middle' }: BudgetBalancerGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120)
  const [draggedItem, setDraggedItem] = useState<BudgetItem | null>(null)
  const [correctPlacements, setCorrectPlacements] = useState(0)
  const [wrongPlacements, setWrongPlacements] = useState(0)
  
  const getGameData = () => {
    switch (userTier) {
      case 'elementary':
        return {
          income: 100,
          items: [
            { id: 1, name: 'Lunch Money', amount: 25, category: 'Food', emoji: '🍎' },
            { id: 2, name: 'New Toy', amount: 15, category: 'Fun', emoji: '🧸' },
            { id: 3, name: 'School Supplies', amount: 10, category: 'School', emoji: '✏️' },
            { id: 4, name: 'Snacks', amount: 8, category: 'Food', emoji: '🍪' },
            { id: 5, name: 'Movie Ticket', amount: 12, category: 'Fun', emoji: '🎬' },
            { id: 6, name: 'Books', amount: 20, category: 'School', emoji: '📚' },
            { id: 7, name: 'Piggy Bank', amount: 10, category: 'Savings', emoji: '🐷' }
          ],
          categories: [
            { 
              name: 'Food', 
              target: 33, 
              current: 0, 
              color: 'from-green-100 to-green-50 border-green-300',
              description: 'Meals and snacks',
              items: []
            },
            { 
              name: 'Fun', 
              target: 27, 
              current: 0, 
              color: 'from-blue-100 to-blue-50 border-blue-300',
              description: 'Games and entertainment',
              items: []
            },
            { 
              name: 'School', 
              target: 30, 
              current: 0, 
              color: 'from-purple-100 to-purple-50 border-purple-300',
              description: 'Learning materials',
              items: []
            },
            { 
              name: 'Savings', 
              target: 10, 
              current: 0, 
              color: 'from-yellow-100 to-yellow-50 border-yellow-300',
              description: 'Money for later',
              items: []
            }
          ]
        }
      case 'middle':
        return {
          income: 500,
          items: [
            { id: 1, name: 'Groceries', amount: 150, category: 'Needs', emoji: '🛒' },
            { id: 2, name: 'Video Games', amount: 60, category: 'Entertainment', emoji: '🎮' },
            { id: 3, name: 'School Supplies', amount: 40, category: 'Education', emoji: '📖' },
            { id: 4, name: 'Clothes', amount: 80, category: 'Needs', emoji: '👕' },
            { id: 5, name: 'Streaming Services', amount: 45, category: 'Entertainment', emoji: '📺' },
            { id: 6, name: 'Online Course', amount: 35, category: 'Education', emoji: '💻' },
            { id: 7, name: 'Emergency Fund', amount: 50, category: 'Savings', emoji: '💰' },
            { id: 8, name: 'Goal Savings', amount: 40, category: 'Savings', emoji: '🎯' }
          ],
          categories: [
            { 
              name: 'Needs', 
              target: 230, 
              current: 0, 
              color: 'from-red-100 to-red-50 border-red-300',
              description: 'Essential expenses',
              items: []
            },
            { 
              name: 'Entertainment', 
              target: 105, 
              current: 0, 
              color: 'from-blue-100 to-blue-50 border-blue-300',
              description: 'Fun activities',
              items: []
            },
            { 
              name: 'Education', 
              target: 75, 
              current: 0, 
              color: 'from-purple-100 to-purple-50 border-purple-300',
              description: 'Learning investments',
              items: []
            },
            { 
              name: 'Savings', 
              target: 90, 
              current: 0, 
              color: 'from-green-100 to-green-50 border-green-300',
              description: 'Future goals',
              items: []
            }
          ]
        }
      case 'adult':
        return {
          income: 4000,
          items: [
            { id: 1, name: 'Rent/Mortgage', amount: 1200, category: 'Housing', emoji: '🏠' },
            { id: 2, name: 'Groceries', amount: 400, category: 'Food', emoji: '🛒' },
            { id: 3, name: 'Car Payment', amount: 350, category: 'Transportation', emoji: '🚗' },
            { id: 4, name: 'Health Insurance', amount: 200, category: 'Insurance', emoji: '🏥' },
            { id: 5, name: 'Utilities', amount: 150, category: 'Housing', emoji: '💡' },
            { id: 6, name: 'Gas', amount: 120, category: 'Transportation', emoji: '⛽' },
            { id: 7, name: 'Entertainment', amount: 200, category: 'Lifestyle', emoji: '🎭' },
            { id: 8, name: 'Dining Out', amount: 180, category: 'Food', emoji: '🍽️' },
            { id: 9, name: 'Emergency Fund', amount: 400, category: 'Savings', emoji: '💰' },
            { id: 10, name: 'Retirement 401k', amount: 600, category: 'Savings', emoji: '🏖️' },
            { id: 11, name: 'Car Insurance', amount: 300, category: 'Insurance', emoji: '🛡️' }
          ],
          categories: [
            { 
              name: 'Housing', 
              target: 1350, 
              current: 0, 
              color: 'from-red-100 to-red-50 border-red-300',
              description: 'Rent & utilities',
              items: []
            },
            { 
              name: 'Food', 
              target: 580, 
              current: 0, 
              color: 'from-green-100 to-green-50 border-green-300',
              description: 'Groceries & dining',
              items: []
            },
            { 
              name: 'Transportation', 
              target: 470, 
              current: 0, 
              color: 'from-blue-100 to-blue-50 border-blue-300',
              description: 'Car & commute',
              items: []
            },
            { 
              name: 'Insurance', 
              target: 500, 
              current: 0, 
              color: 'from-purple-100 to-purple-50 border-purple-300',
              description: 'Health & auto',
              items: []
            },
            { 
              name: 'Lifestyle', 
              target: 200, 
              current: 0, 
              color: 'from-orange-100 to-orange-50 border-orange-300',
              description: 'Entertainment',
              items: []
            },
            { 
              name: 'Savings', 
              target: 1000, 
              current: 0, 
              color: 'from-yellow-100 to-yellow-50 border-yellow-300',
              description: 'Future & retirement',
              items: []
            }
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

  useEffect(() => {
    const data = getGameData()
    setGameData(data)
    setBudgetItems([...data.items])
    setCategories([...data.categories])
  }, [userTier])

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
    setTimeLeft(120)
    setCorrectPlacements(0)
    setWrongPlacements(0)
    const data = getGameData()
    setBudgetItems([...data.items])
    setCategories(data.categories.map(cat => ({ ...cat, current: 0, items: [] })))
  }

  const handleDragStart = (item: BudgetItem) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (categoryName: string) => {
    if (!draggedItem || draggedItem.isPlaced) return

    const isCorrect = draggedItem.category === categoryName
    
    const pointsEarned = isCorrect ? draggedItem.amount : -Math.floor(draggedItem.amount * 0.3)
    setScore(prev => Math.max(0, prev + pointsEarned))

    if (isCorrect) {
      setCorrectPlacements(prev => prev + 1)
      toast.success(`✓ Correct! +${draggedItem.amount} points`, { duration: 1500 })
    } else {
      setWrongPlacements(prev => prev + 1)
      toast.error(`✗ Wrong category! -${Math.floor(draggedItem.amount * 0.3)} points`, { duration: 1500 })
    }

    setCategories(prev => prev.map(cat => 
      cat.name === categoryName 
        ? { 
            ...cat, 
            current: cat.current + draggedItem.amount,
            items: [...cat.items, draggedItem]
          }
        : cat
    ))

    setBudgetItems(prev => prev.map(item => 
      item.id === draggedItem.id 
        ? { ...item, isPlaced: true }
        : item
    ))

    setDraggedItem(null)

    if (budgetItems.filter(i => !i.isPlaced).length === 1) {
      setTimeout(() => endGame(), 1000)
    }
  }

  const endGame = () => {
    setGameState('ended')
    const totalItems = budgetItems.length
    const accuracy = (correctPlacements / totalItems) * 100
    
    onComplete(score, { 
      accuracy: Math.round(accuracy),
      correctPlacements,
      wrongPlacements,
      timeRemaining: timeLeft
    })
  }

  const getBudgetBalance = () => {
    const totalSpent = categories.reduce((sum, cat) => sum + cat.current, 0)
    return gameData.income - totalSpent
  }

  const getCompletionPercentage = () => {
    const total = budgetItems.length
    const placed = budgetItems.filter(i => i.isPlaced).length
    return (placed / total) * 100
  }

  if (gameState === 'ended') {
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.current, 0)
    const balance = gameData.income - totalBudgeted
    const accuracy = (correctPlacements / budgetItems.length) * 100
    const performanceRating = accuracy >= 90 ? 'Outstanding!' : accuracy >= 75 ? 'Great Job!' : accuracy >= 60 ? 'Good Work!' : 'Keep Practicing!'
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-3xl glass-card shadow-2xl">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center mb-8"
            >
              <div className="text-7xl mb-4">📊</div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Budget Complete!</h2>
              <p className="text-xl text-accent font-semibold">{performanceRating}</p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-accent text-center"
              >
                <div className="text-4xl font-bold text-accent mb-2">{score}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </motion.div>
              
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-primary text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">{Math.round(accuracy)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </motion.div>
              
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`glass-card p-6 rounded-xl border-l-4 text-center ${
                  balance >= 0 ? 'border-l-secondary' : 'border-l-destructive'
                }`}
              >
                <div className={`text-4xl font-bold mb-2 ${balance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                  ${Math.abs(balance)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {balance >= 0 ? 'Saved' : 'Over Budget'}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid md:grid-cols-2 gap-4 mb-8"
            >
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Correct Placements</span>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-bold text-green-600">{correctPlacements}</span>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wrong Placements</span>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-lg font-bold text-red-600">{wrongPlacements}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-muted/30 p-6 rounded-xl mb-8"
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" weight="fill" />
                Key Learnings
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Categorizing expenses helps you understand where your money goes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Following the 50/30/20 rule: 50% needs, 30% wants, 20% savings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Tracking your spending prevents over-budget surprises</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-3"
            >
              <Button onClick={startGame} className="flex-1 btn-primary-gaming">
                <Calculator className="w-4 h-4 mr-2" />
                Budget Again
              </Button>
              <Button onClick={() => onComplete(score)} variant="outline" className="flex-1 border-2">
                Continue
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const unplacedItems = budgetItems.filter(i => !i.isPlaced)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="glass-card border-b-0 shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onExit} className="hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div className="flex items-center gap-3">
                <div className="gradient-primary p-2 rounded-xl">
                  <Calculator className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Budget Balancer</h1>
                  <p className="text-xs text-muted-foreground">Organize your finances</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {unplacedItems.length}/{budgetItems.length}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress value={getCompletionPercentage()} className="h-2 bg-muted/50" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {gameState === 'ready' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="glass-card shadow-2xl">
              <CardContent className="p-10">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    📊
                  </motion.div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">Budget Balancer</h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Master the art of budgeting! Drag each expense to its correct category and learn to organize your finances like a pro.
                  </p>
                </div>
                
                <div className="glass-card bg-accent/10 p-6 rounded-xl mb-8 border-2 border-accent/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground font-medium">Monthly Income</span>
                    <div className="text-3xl font-bold text-accent">${gameData.income}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allocate all expenses to their proper categories within your budget
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="glass-card p-6 rounded-xl border-l-4 border-l-accent">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">✓</div>
                      <div>
                        <div className="font-bold text-accent text-lg">Correct Match</div>
                        <div className="text-sm text-muted-foreground">Earn full points</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Place each item in the right category to maximize your score
                    </p>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl border-l-4 border-l-destructive">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">✗</div>
                      <div>
                        <div className="font-bold text-destructive text-lg">Wrong Match</div>
                        <div className="text-sm text-muted-foreground">Lose some points</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Incorrect placements will deduct from your score
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={startGame} size="lg" className="btn-primary-gaming px-12 py-6 text-lg shadow-2xl">
                    <Calculator className="w-5 h-5 mr-2" />
                    Start Budgeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-6"
            >
              <Card className="glass-card shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Monthly Budget</div>
                      <div className="text-3xl font-bold text-foreground">${gameData.income}</div>
                    </div>
                    <ArrowsDownUp className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Balance</div>
                      <div className={`text-3xl font-bold ${getBudgetBalance() >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                        ${Math.abs(getBudgetBalance())}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-6">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-1"
              >
                <Card className="glass-card shadow-lg h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendUp className="w-5 h-5 text-primary" />
                      Budget Items
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Drag to categories →
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {unplacedItems.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ delay: index * 0.05 }}
                            draggable
                            onDragStart={() => handleDragStart(item)}
                            className="p-4 glass-card border-2 border-border rounded-xl cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-lg transition-all transform hover:scale-105"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{item.emoji}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground text-sm truncate">{item.name}</div>
                                <Badge variant="outline" className="text-xs mt-1">${item.amount}</Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {unplacedItems.length === 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="p-8 text-center text-muted-foreground"
                        >
                          <Check className="w-12 h-12 mx-auto mb-2 text-green-600" />
                          <p className="font-semibold">All items placed!</p>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-3"
              >
                <Card className="glass-card shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Budget Categories</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Drop items into the correct category
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {categories.map((category, index) => (
                        <motion.div
                          key={category.name}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(category.name)}
                          className={`p-5 border-2 border-dashed rounded-xl min-h-48 bg-gradient-to-br ${category.color} transition-all hover:shadow-xl hover:scale-105`}
                        >
                          <div className="mb-4">
                            <h3 className="font-bold text-lg text-foreground mb-1">{category.name}</h3>
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Budget</span>
                              <span className="text-sm font-bold text-foreground">
                                ${category.current} / ${category.target}
                              </span>
                            </div>
                            <Progress 
                              value={Math.min((category.current / category.target) * 100, 100)} 
                              className="h-2"
                            />
                          </div>

                          <div className="space-y-2 mt-4">
                            {category.items.map(item => (
                              <div key={item.id} className="flex items-center gap-2 text-xs bg-white/60 rounded p-2">
                                <span>{item.emoji}</span>
                                <span className="flex-1 truncate">{item.name}</span>
                                <span className="font-bold">${item.amount}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-4 glass-card px-6 py-3 rounded-full text-sm text-muted-foreground">
                <span>💡 Tip: Drag and drop items to their correct budget categories</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
