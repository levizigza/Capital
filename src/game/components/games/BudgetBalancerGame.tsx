import { useState, useEffect } from 'react'
import { World } from '@/game/ecs/World'
import type { Entity } from '@/game/ecs/Entity'
import { OnboardingSystem } from '@/game/ecs/systems/OnboardingSystem'
import { XPSystem } from '@/game/ecs/systems/XPSystem'
import type { OnboardingComponent } from '@/game/ecs/components/Onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calculator, Check, X, Star, TrendUp, ArrowsDownUp } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface BudgetBalancerGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
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

export default function BudgetBalancerGame({ onComplete, onExit, userTier = 'elementary' }: BudgetBalancerGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120)
  const [draggedItem, setDraggedItem] = useState<BudgetItem | null>(null)
  const [correctPlacements, setCorrectPlacements] = useState(0)
  const [wrongPlacements, setWrongPlacements] = useState(0)
  // ECS state
  const [entities, setEntities] = useState<Entity[]>([])
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [achievementUnlocked, setAchievementUnlocked] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  // ECS world/entity initialization
  useEffect(() => {
    const world = new World()
    world.addEntity({
      id: 0,
      components: {
        onboarding: { type: 'onboarding', completed: false, step: 0 } as OnboardingComponent
      }
    })
    setEntities(world.entities)
  }, [])

  // ECS onboarding system effect
  useEffect(() => {
    const player = entities.find(e => e.id === 0)
    if (!player) return
    const onboarding = player.components['onboarding'] as OnboardingComponent | undefined
    if (onboarding) {
      OnboardingSystem([player], () => setOnboardingComplete(true))
      setOnboardingStep(onboarding.step)
      setOnboardingComplete(onboarding.completed)
    }
    // ECS XP/level
    const xpComp = player.components['xp']
    if (xpComp) {
      setXp(xpComp.value)
      setLevel(xpComp.level)
    }
    // ECS Achievement
    const ach = player.components['achievement']
    if (ach) {
      setAchievementUnlocked(ach.unlocked)
    }
  }, [entities])

  // Advance onboarding step
  const handleAdvanceOnboarding = () => {
    setEntities(prev => prev.map(e => {
      if (e.id === 0 && e.components['onboarding']) {
        return {
          ...e,
          components: {
            ...e.components,
            onboarding: {
              ...e.components['onboarding'],
              step: e.components['onboarding'].step + 1
            }
          }
        }
      }
      return e
    }))
  }
  
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
            { name: 'Food', target: 33, current: 0, color: 'from-green-100 to-green-50 border-green-300', description: 'Meals & snacks', items: [] },
            { name: 'Fun', target: 27, current: 0, color: 'from-blue-100 to-blue-50 border-blue-300', description: 'Toys & entertainment', items: [] },
            { name: 'School', target: 30, current: 0, color: 'from-purple-100 to-purple-50 border-purple-300', description: 'School supplies', items: [] },
            { name: 'Savings', target: 10, current: 0, color: 'from-yellow-100 to-yellow-50 border-yellow-300', description: 'Piggy bank', items: [] }
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

  const startGame = (): void => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(120)
    setCorrectPlacements(0)
    setWrongPlacements(0)
    const data = getGameData()
    setBudgetItems([...data.items])
    setCategories(data.categories.map((cat) => ({ ...cat, current: 0, items: [] })))
  }

  const handleDragStart = (item: BudgetItem): void => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
  }

  const handleDrop = (categoryName: string): void => {
    if (!draggedItem || draggedItem.isPlaced) return

    const isCorrect = draggedItem.category === categoryName
    
    const pointsEarned = isCorrect ? draggedItem.amount : -Math.floor(draggedItem.amount * 0.3)
    setScore(prev => Math.max(0, prev + pointsEarned))

    if (isCorrect) {
      setCorrectPlacements(prev => prev + 1)
      toast.success(`✓ Correct! +${draggedItem.amount} points`, { duration: 1500 })
      // ECS: Award XP for correct placement
      setEntities(prev => {
        const updated = [...prev]
        XPSystem(updated.filter(e => e.id === 0), 20)
        return updated
      })
    } else {
      setWrongPlacements(prev => prev + 1)
      toast.error(`✗ Wrong category! -${Math.floor(draggedItem.amount * 0.3)} points`, { duration: 1500 })
    }

    setCategories((prev) => prev.map((cat) => 
      cat.name === categoryName 
        ? { 
            ...cat, 
            current: cat.current + draggedItem.amount,
            items: [...cat.items, draggedItem]
          }
        : cat
    ))

    setBudgetItems((prev) => prev.map((item) => 
      item.id === draggedItem.id 
        ? { ...item, isPlaced: true }
        : item
    ))

    setDraggedItem(null)

    if (budgetItems.filter((i) => !i.isPlaced).length === 1) {
      setTimeout(() => endGame(), 1000)
    }
  }

  const endGame = (): void => {
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

  const getBudgetBalance = (): number => {
    const totalSpent = categories.reduce((sum, cat) => sum + cat.current, 0)
    return gameData.income - totalSpent
  }

  const getCompletionPercentage = (): number => {
    const total = budgetItems.length
    const placed = budgetItems.filter((i) => i.isPlaced).length
    return (placed / total) * 100
  }

  // Add accuracy calculation for main render
  const accuracy = budgetItems.length > 0 ? (correctPlacements / budgetItems.length) * 100 : 0

  if (gameState === 'ended') {
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.current, 0)
    const balance = gameData.income - totalBudgeted
    const accuracy = (correctPlacements / budgetItems.length) + 100
    const performanceRating = accuracy >= 90 ? 'Outstanding!' : accuracy >= 75 ? 'Great Job!' : accuracy >= 60 ? 'Good Work!' : 'Keep Practicing!'
    // ECS: Unlock achievement for perfect score
    if (!achievementUnlocked && Math.round(accuracy) === 100) {
      setEntities(prev => prev.map(e => {
        if (e.id === 0 && e.components['achievement']) {
          return {
            ...e,
            components: {
              ...e.components,
              achievement: {
                ...e.components['achievement'],
                unlocked: true
              }
            }
          }
        }
        return e
      }))
    }
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
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16, marginBottom: 16 }}>
                <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', color: '#2563eb' }}>
                  XP: {xp} | Level: {level}
                </div>
                <div style={{ background: achievementUnlocked ? '#d1fae5' : '#f3f4f6', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', color: achievementUnlocked ? '#059669' : '#6b7280' }}>
                  {achievementUnlocked ? '🏆 Achievement: Perfect Budgeter' : 'Achievement: Locked'}
                </div>
              </div>
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
    <div className="game-arcade-container">
      <div className="game-arcade-header flex items-center gap-4 mb-6">
        <span className="text-5xl">💸</span>
        Budget Balancer
      </div>
      <div className="game-arcade-stats">
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-green-600">${score}</div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-blue-600">{Math.round(accuracy)}%</div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-red-600">
            ${Math.abs(getBudgetBalance())}
          </div>
          <div className="text-xs text-muted-foreground">
            {getBudgetBalance() >= 0 ? 'Saved' : 'Over Budget'}
          </div>
        </div>
      </div>
      <div className="game-arcade-actions">
        <Button onClick={startGame} className="game-arcade-btn">
          <Calculator className="w-4 h-4 mr-2" />
          Budget Again
        </Button>
        <Button onClick={() => onComplete(score)} variant="outline" className="game-arcade-btn">
          Continue
          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
        </Button>
      </div>

      {/* ECS Onboarding UI */}
      {!onboardingComplete && (
        <div style={{
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          borderRadius: 12,
          padding: 24,
          margin: '24px auto',
          maxWidth: 400,
          textAlign: 'center',
          boxShadow: '0 2px 8px #ffd70033'
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Welcome to Budget Balancer!</h3>
          <p style={{ marginBottom: 16 }}>
            {onboardingStep === 0 && 'Drag and drop each item to the correct budget category.'}
            {onboardingStep === 1 && 'Earn points for every correct placement.'}
            {onboardingStep === 2 && 'Achieve a perfect score to unlock a special achievement!'}
          </p>
          <button onClick={handleAdvanceOnboarding} style={{
            background: '#ffd700',
            color: '#222',
            fontWeight: 'bold',
            fontSize: 16,
            padding: '8px 24px',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #ffd70055'
          }}>
            {onboardingStep < 2 ? 'Next' : 'Finish Onboarding'}
          </button>
        </div>
      )}

      <div className="p-6">
        {gameState === 'ready' ? (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-blue-50 to-pink-50 p-8">
            <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
              <div className="text-8xl mb-4">💸</div>
              <h2 className="text-4xl font-bold text-foreground mb-2">Welcome to Budget Balancer!</h2>
              <p className="text-xl text-muted-foreground mb-8 text-center max-w-lg">
                Drag and drop items to balance your budget. Make sure you don’t overspend!
              </p>
              <Button onClick={startGame} className="game-arcade-btn w-full max-w-md text-2xl">
                <ArrowLeft className="w-6 h-6 mr-3" />
                Start Game
              </Button>
              <Button onClick={onExit} variant="outline" className="w-full max-w-md text-lg mt-2 border-2">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
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

                  <div className="flex justify-center mt-8">
                    <Button onClick={startGame} size="lg" className="btn-primary-gaming px-12 py-6 text-lg shadow-2xl animate-bounce">
                      <Calculator className="w-5 h-5 mr-2" />
                      Start Budgeting
                    </Button>
                  </div>
                  {/* Fallback button for extra clarity */}
                  <div className="flex justify-center mt-4">
                    <button onClick={startGame} style={{fontSize:'1.5rem',fontWeight:'bold',background:'#10b981',color:'#fff',padding:'1rem 2rem',borderRadius:'1rem',boxShadow:'0 2px 8px #0002',border:'none',cursor:'pointer'}}>
                      Start Budgeting
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
