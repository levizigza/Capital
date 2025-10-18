/**
 * MiniGame Hub - Central component that manages and launches different financial mini-games
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Scales, TrendUp, CreditCard, Calculator,
  Trophy, Star, Clock, Target
} from '@phosphor-icons/react'
import { BudgetBalance } from './BudgetBalance'
import { InvestmentTower } from './InvestmentTower'
import { CreditCardMemory } from './CreditCardMemory'
import { CompoundGrowth } from './CompoundGrowth'

interface MiniGame {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'budgeting' | 'investing' | 'credit' | 'savings'
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
  learningObjectives: string[]
  color: string
  rewards: {
    xp: number
    coins: number
  }
}

interface MiniGameHubProps {
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
}

export const MiniGameHub: React.FC<MiniGameHubProps> = ({
  onGameComplete,
  onExit
}) => {
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  const miniGames: MiniGame[] = [
    {
      id: 'budget-balance',
      title: 'Budget Balance',
      description: 'Master the art of balancing your budget by allocating income across different expense categories',
      icon: <Scales className="w-8 h-8" />,
      category: 'budgeting',
      difficulty: 'easy',
      estimatedTime: '2-3 minutes',
      learningObjectives: [
        'Understand the 50/30/20 budgeting rule',
        'Learn to prioritize needs vs wants',
        'Practice percentage-based allocation',
        'Experience budget constraints in real-time'
      ],
      color: 'from-blue-500 to-blue-700',
      rewards: { xp: 150, coins: 75 }
    },
    {
      id: 'investment-tower',
      title: 'Investment Tower',
      description: 'Build wealth by stacking different investment types while managing risk and market conditions',
      icon: <TrendUp className="w-8 h-8" />,
      category: 'investing',
      difficulty: 'medium',
      estimatedTime: '3-5 minutes',
      learningObjectives: [
        'Understand risk vs reward relationships',
        'Learn about portfolio diversification',
        'Experience market volatility effects',
        'Practice drag-and-drop investment allocation'
      ],
      color: 'from-green-500 to-green-700',
      rewards: { xp: 200, coins: 100 }
    },
    {
      id: 'credit-memory',
      title: 'Credit Card Memory',
      description: 'Match credit cards with their features to learn about different types and their benefits',
      icon: <CreditCard className="w-8 h-8" />,
      category: 'credit',
      difficulty: 'medium',
      estimatedTime: '2-4 minutes',
      learningObjectives: [
        'Identify different credit card types',
        'Understand APR, fees, and credit limits',
        'Learn about secured vs unsecured cards',
        'Practice memory skills with financial terms'
      ],
      color: 'from-purple-500 to-purple-700',
      rewards: { xp: 175, coins: 90 }
    },
    {
      id: 'compound-growth',
      title: 'Compound Growth',
      description: 'Experiment with investment parameters to see the magic of compound interest in action',
      icon: <Calculator className="w-8 h-8" />,
      category: 'savings',
      difficulty: 'easy',
      estimatedTime: '3-4 minutes',
      learningObjectives: [
        'Visualize compound interest growth',
        'Understand the importance of starting early',
        'Learn how regular contributions compound',
        'Experience real-time growth calculations'
      ],
      color: 'from-amber-500 to-amber-700',
      rewards: { xp: 180, coins: 85 }
    }
  ]

  const handleGameSelect = (game: MiniGame): void => {
    setSelectedGame(game)
  }

  const handleStartGame = (): void => {
    if (selectedGame) {
      setIsPlaying(true)
    }
  }

  const handleGameComplete = (score: number, timeSpent: number, additionalData?: Record<string, unknown>): void => {
    if (selectedGame) {
      onGameComplete(selectedGame.id, score, timeSpent, additionalData)
      setIsPlaying(false)
      setSelectedGame(null)
    }
  }

  const handleGameExit = (): void => {
    setIsPlaying(false)
    setSelectedGame(null)
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'budgeting': return 'bg-blue-100 text-blue-800'
      case 'investing': return 'bg-green-100 text-green-800'
      case 'credit': return 'bg-purple-100 text-purple-800'
      case 'savings': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderGameComponent = (): React.ReactNode => {
    if (!selectedGame || !isPlaying) return null

    const startTime = Date.now()

    const handleBudgetBalanceComplete = (score: number, timeSpent: number): void => {
      handleGameComplete(score, timeSpent)
    }

    const handleInvestmentTowerComplete = (score: number, finalValue: number, timeSpent: number): void => {
      handleGameComplete(score, timeSpent, { finalValue })
    }

    const handleCreditMemoryComplete = (score: number, additionalData?: Record<string, unknown>): void => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      handleGameComplete(score, timeSpent, additionalData)
    }

    const handleCompoundGrowthComplete = (score: number, additionalData?: Record<string, unknown>): void => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      handleGameComplete(score, timeSpent, additionalData)
    }

    switch (selectedGame.id) {
      case 'budget-balance':
        return (
          <BudgetBalance
            income={5000}
            difficulty={selectedDifficulty}
            onComplete={handleBudgetBalanceComplete}
            onExit={handleGameExit}
          />
        )
      case 'investment-tower':
        return (
          <InvestmentTower
            startingAmount={10000}
            targetGrowth={50}
            timeLimit={selectedDifficulty === 'easy' ? 300 : selectedDifficulty === 'medium' ? 240 : 180}
            difficulty={selectedDifficulty}
            onComplete={handleInvestmentTowerComplete}
            onExit={handleGameExit}
          />
        )
      case 'credit-memory':
        return (
          <CreditCardMemory
            difficulty={selectedDifficulty}
            onComplete={handleCreditMemoryComplete}
            onExit={handleGameExit}
          />
        )
      case 'compound-growth':
        return (
          <CompoundGrowth
            targetAmount={100000}
            timeLimit={selectedDifficulty === 'easy' ? 240 : selectedDifficulty === 'medium' ? 180 : 120}
            difficulty={selectedDifficulty}
            onComplete={handleCompoundGrowthComplete}
            onExit={handleGameExit}
          />
        )
      default:
        return null
    }
  }

  if (isPlaying && selectedGame) {
    return (
      <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedGame.icon}
              {selectedGame.title}
            </DialogTitle>
          </DialogHeader>
          {renderGameComponent()}
        </DialogContent>
      </Dialog>
    )
  }

  if (selectedGame && !isPlaying) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedGame(null)}>
            ← Back to Games
          </Button>
          <div className={`p-3 rounded-lg bg-gradient-to-r ${selectedGame.color} text-white`}>
            {selectedGame.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{selectedGame.title}</h2>
            <p className="text-muted-foreground">{selectedGame.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Estimated Time: {selectedGame.estimatedTime}</span>
              </div>
              
              <div className="flex gap-2">
                <Badge className={getCategoryColor(selectedGame.category)}>
                  {selectedGame.category}
                </Badge>
                <Badge className={getDifficultyColor(selectedGame.difficulty)}>
                  {selectedGame.difficulty}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Learning Objectives:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedGame.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center gap-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="text-sm">+{selectedGame.rewards.xp} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm">+{selectedGame.rewards.coins} coins</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Difficulty Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                  <div
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDifficulty === difficulty 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/20 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold capitalize">{difficulty}</div>
                        <div className="text-sm text-muted-foreground">
                          {difficulty === 'easy' && 'Relaxed pace, helpful hints'}
                          {difficulty === 'medium' && 'Balanced challenge and time'}
                          {difficulty === 'hard' && 'Fast-paced, minimal guidance'}
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(difficulty)}>
                        {difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button onClick={handleStartGame} className="w-full">
                Start Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Financial Mini-Games</h2>
        <p className="text-muted-foreground text-lg">
          Learn money management through engaging, interactive games
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {miniGames.map((game) => (
          <Card 
            key={game.id} 
            className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            onClick={() => handleGameSelect(game)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${game.color} text-white`}>
                  {game.icon}
                </div>
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(game.category)}>
                    {game.category}
                  </Badge>
                  <Badge className={getDifficultyColor(game.difficulty)}>
                    {game.difficulty}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-xl">{game.title}</CardTitle>
              <CardDescription className="text-base">{game.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{game.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-accent" />
                      <span>+{game.rewards.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-primary" />
                      <span>+{game.rewards.coins} coins</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  Play Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}