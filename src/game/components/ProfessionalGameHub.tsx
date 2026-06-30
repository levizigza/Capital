import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, Clock, Trophy, Star, Target, Calculator,
  PiggyBank, TrendUp, CreditCard, Building, Coins, GameController
} from '@phosphor-icons/react'
import { CoinCatcherGame } from './games/CoinCatcherGame'
import BudgetBalancerGame from './games/BudgetBalancerGame'
import { InvestmentClimberGame } from './games/InvestmentClimberGame'
import { CreditDefenderGame } from './games/CreditDefenderGame'
import { BusinessBuilderGame } from './games/BusinessBuilderGame'
import PixelBudgetRunner from '@/components/PixelBudgetRunner'

interface GameHubProps {
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface GameInfo {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  skills: string[]
  component: React.ComponentType<GameComponentProps>
  minAge: number
}

interface GameComponentProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

const games: GameInfo[] = [
  {
    id: 'coin-catcher',
    title: 'Coin Catcher',
    description: 'Catch falling coins while avoiding expenses in this fast-paced savings game',
    icon: <Coins className="w-6 h-6" />,
    difficulty: 'Easy',
    estimatedTime: '2-3 min',
    skills: ['Saving', 'Quick Math', 'Decision Making'],
    component: CoinCatcherGame,
    minAge: 8
  },
  {
    id: 'pixel-budget-runner',
    title: 'Pixel Budget Runner',
    description: 'Side-scrolling endless runner teaching zero-based budgeting',
    icon: <GameController className="w-6 h-6" />,
    difficulty: 'Easy',
    estimatedTime: '2-4 min',
    skills: ['Zero-Based Budgeting', 'Quick Reflexes', 'Resource Allocation'],
    component: PixelBudgetRunner,
    minAge: 8
  },
  {
    id: 'budget-balancer',
    title: 'Budget Balancer',
    description: 'Balance your monthly budget by dragging expenses to the right categories',
    icon: <Calculator className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '3-5 min',
    skills: ['Budgeting', 'Categorization', 'Planning'],
    component: BudgetBalancerGame,
    minAge: 10
  },
  {
    id: 'investment-climber',
    title: 'Investment Tower',
    description: 'Build your investment portfolio by stacking different asset blocks strategically',
    icon: <TrendUp className="w-6 h-6" />,
    difficulty: 'Hard',
    estimatedTime: '5-7 min',
    skills: ['Investing', 'Risk Management', 'Strategy'],
    component: InvestmentClimberGame,
    minAge: 12
  },
  {
    id: 'credit-defender',
    title: 'Credit Score Defender',
    description: 'Protect your credit score from bad financial decisions in this tower defense game',
    icon: <CreditCard className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '4-6 min',
    skills: ['Credit Management', 'Risk Assessment', 'Planning'],
    component: CreditDefenderGame,
    minAge: 14
  },
  {
    id: 'business-builder',
    title: 'Business Builder',
    description: 'Run a virtual business, make decisions, and grow your profit in this simulation game',
    icon: <Building className="w-6 h-6" />,
    difficulty: 'Hard',
    estimatedTime: '7-10 min',
    skills: ['Entrepreneurship', 'Financial Planning', 'Strategy'],
    component: BusinessBuilderGame,
    minAge: 16
  }
]

export function ProfessionalGameHub({ onGameComplete, onExit, userTier = 'middle' }: GameHubProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  // Filter games based on user tier
  const getAgeLimit = (): number => {
    switch (userTier) {
      case 'elementary': return 12
      case 'middle': return 16
      case 'adult': return 100
      default: return 16
    }
  }

  const availableGames = games.filter(game => game.minAge <= getAgeLimit())

  const handleGameStart = (gameId: string): void => {
    setSelectedGame(gameId)
    setGameStartTime(Date.now())
  }

  const handleGameComplete = (score: number, additionalData?: Record<string, unknown>): void => {
    if (selectedGame) {
      const timeSpent = Date.now() - gameStartTime
      onGameComplete(selectedGame, score, timeSpent, additionalData)
    }
    setSelectedGame(null)
  }

  const handleGameExit = (): void => {
    setSelectedGame(null)
  }

  // Render individual game
  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame)
    if (game) {
      const GameComponent = game.component
      return (
        <div className="h-full">
          <GameComponent
            onComplete={handleGameComplete}
            onExit={handleGameExit}
            userTier={userTier}
          />
        </div>
      )
    }
  }

  // Render game selection hub
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Professional Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onExit}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Financial Learning Games</h1>
                <p className="text-sm text-gray-600">Interactive games that teach real financial skills</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Level
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Game Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableGames.map((game) => (
            <Card 
              key={game.id} 
              className="hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {game.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">{game.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            game.difficulty === 'Easy' ? 'border-green-200 text-green-700' :
                            game.difficulty === 'Medium' ? 'border-amber-200 text-amber-700' :
                            'border-red-200 text-red-700'
                          }`}
                        >
                          {game.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{game.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {game.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Skills You'll Learn:</p>
                    <div className="flex flex-wrap gap-1">
                      {game.skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleGameStart(game.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Learning Progress Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Learning Progress</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <PiggyBank className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Saving Skills</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={75} className="w-20 h-2" />
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Investment Knowledge</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={45} className="w-20 h-2" />
                      <span className="text-sm text-gray-600">45%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Business Skills</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={30} className="w-20 h-2" />
                      <span className="text-sm text-gray-600">30%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}