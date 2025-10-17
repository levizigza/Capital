import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plant, Drop, Sun, CloudRain, Flower, Tree, Butterfly,
  GameController, Medal, Sparkle, GearSix, ArrowsClockwise,
  Trophy, Fire, Coins, Calculator, TrendUp, CreditCard, 
  Building, Target, Clock, Star, Lightbulb, ChartLine,
  Brain, Rocket, Lightning
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { CoinCatcherGame } from '@/game/components/games/CoinCatcherGame'
import { BudgetBalancerGame } from '@/game/components/games/BudgetBalancerGame'
import { InvestmentClimberGame } from '@/game/components/games/InvestmentClimberGame'
import { CreditDefenderGame } from '@/game/components/games/CreditDefenderGame'
import { BusinessBuilderGame } from '@/game/components/games/BusinessBuilderGame'
import { CreditCardMemory } from '@/game/components/CreditCardMemory'
import { CompoundGrowth } from '@/game/components/CompoundGrowth'
import type { GameScore } from '@/App'

interface CreativeModeHubProps {
  userProfile: {
    name: string
    level: number
    xp: number
    totalCoins: number
    gamesCompleted: number
    achievements: string[]
    currentStreak: number
    gardenProgress?: {
      plants: Array<{ type: string; growth: number; position: { x: number; y: number } }>
      gardenLevel: number
      unlockedAreas: string[]
    }
  }
  setUserProfile: (updater: (prev: any) => any) => void
  gameScores: GameScore[]
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: any) => void
  onModeSwitch: () => void
}

interface GameInfo {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  skills: string[]
  component: React.ComponentType<any>
  category: 'mini-game' | 'adventure'
  type: 'savings' | 'investing' | 'credit' | 'business' | 'general'
  gardenType: string
  props?: any
}

const miniGames: GameInfo[] = [
  {
    id: 'coin-catcher',
    title: 'Coin Catcher',
    description: 'Catch falling coins while avoiding expenses in this fast-paced savings game',
    icon: <Coins className="w-6 h-6" />,
    difficulty: 'Easy',
    estimatedTime: '2-3 min',
    skills: ['Saving', 'Quick Math', 'Decision Making'],
    component: CoinCatcherGame,
    category: 'mini-game',
    type: 'savings',
    gardenType: 'Savings Meadow'
  },
  {
    id: 'budget-balancer',
    title: 'Budget Balancer',
    description: 'Balance your monthly budget by dragging expenses to the right categories',
    icon: <Calculator className="w-6 h-6" />,
    difficulty: 'Easy',
    estimatedTime: '3-4 min',
    skills: ['Budgeting', 'Categorization', 'Planning'],
    component: BudgetBalancerGame,
    category: 'mini-game',
    type: 'savings',
    gardenType: 'Savings Meadow'
  },
  {
    id: 'credit-card-memory',
    title: 'Credit Card Memory',
    description: 'Match credit cards with their features to learn about different card types',
    icon: <Brain className="w-6 h-6" />,
    difficulty: 'Easy',
    estimatedTime: '3-5 min',
    skills: ['Memory', 'Credit Knowledge', 'Card Features'],
    component: CreditCardMemory,
    category: 'mini-game',
    type: 'credit',
    gardenType: 'Credit Garden',
    props: { difficulty: 'medium' }
  },
  {
    id: 'compound-growth',
    title: 'Compound Growth Visualizer',
    description: 'Adjust investment parameters and watch your money grow through compound interest',
    icon: <ChartLine className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '4-6 min',
    skills: ['Compound Interest', 'Long-term Planning', 'Investment Strategy'],
    component: CompoundGrowth,
    category: 'mini-game',
    type: 'investing',
    gardenType: 'Investment Orchard',
    props: { targetAmount: 10000, timeLimit: 300, difficulty: 'medium' }
  }
]

const adventureGames: GameInfo[] = [
  {
    id: 'investment-climber',
    title: 'Investment Tower',
    description: 'Build your investment portfolio by managing different assets through market cycles',
    icon: <TrendUp className="w-6 h-6" />,
    difficulty: 'Hard',
    estimatedTime: '5-7 min',
    skills: ['Investing', 'Risk Management', 'Portfolio Strategy'],
    component: InvestmentClimberGame,
    category: 'adventure',
    type: 'investing',
    gardenType: 'Investment Orchard'
  },
  {
    id: 'credit-defender',
    title: 'Credit Score Defender',
    description: 'Protect your credit score from bad financial decisions in this strategic defense game',
    icon: <CreditCard className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '4-6 min',
    skills: ['Credit Management', 'Risk Assessment', 'Strategic Planning'],
    component: CreditDefenderGame,
    category: 'adventure',
    type: 'credit',
    gardenType: 'Credit Garden'
  },
  {
    id: 'business-builder',
    title: 'Business Builder',
    description: 'Run a virtual business, make strategic decisions, and grow your profit over time',
    icon: <Building className="w-6 h-6" />,
    difficulty: 'Hard',
    estimatedTime: '7-10 min',
    skills: ['Entrepreneurship', 'Financial Planning', 'Business Strategy'],
    component: BusinessBuilderGame,
    category: 'adventure',
    type: 'business',
    gardenType: 'Business Park'
  }
]

const allGames = [...miniGames, ...adventureGames]

export default function CreativeModeHub({
  userProfile,
  setUserProfile,
  gameScores,
  onGameComplete,
  onModeSwitch
}: CreativeModeHubProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'mini-games' | 'adventures' | 'progress'>('overview')

  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, userProfile.level - 1))
  const currentLevelXP = userProfile.xp % xpForNextLevel
  const progressPercent = (currentLevelXP / xpForNextLevel) * 100

  const gardenLevel = Math.floor(userProfile.level / 3) + 1
  const totalPlants = userProfile.gamesCompleted

  const handleGameStart = (gameId: string) => {
    setSelectedGame(gameId)
    setGameStartTime(Date.now())
  }

  const handleGameComplete = (score: number, additionalData?: any) => {
    if (selectedGame) {
      const timeSpent = Date.now() - gameStartTime
      onGameComplete(selectedGame, score, timeSpent, additionalData)
      setSelectedGame(null)
      
      toast.success('🌱 Your garden grows!', {
        description: `New plant sprouted from your achievement!`
      })
    }
  }

  const handleGameExit = () => {
    setSelectedGame(null)
  }

  const gardens = [
    {
      name: 'Savings Meadow',
      icon: Flower,
      color: 'from-green-400 to-emerald-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50/80',
      borderColor: 'border-green-200',
      plants: Math.floor(totalPlants * 0.4),
      unlocked: true,
      description: 'Where smart spending decisions bloom'
    },
    {
      name: 'Investment Orchard',
      icon: Tree,
      color: 'from-amber-400 to-orange-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200',
      plants: Math.floor(totalPlants * 0.3),
      unlocked: userProfile.level >= 3,
      description: 'Fruit trees that grow wealth over time'
    },
    {
      name: 'Debt-Free Forest',
      icon: Tree,
      color: 'from-blue-400 to-cyan-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-200',
      plants: Math.floor(totalPlants * 0.2),
      unlocked: userProfile.level >= 5,
      description: 'Clear the thorns and grow strong'
    },
    {
      name: 'Credit Garden',
      icon: Butterfly,
      color: 'from-purple-400 to-pink-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50/80',
      borderColor: 'border-purple-200',
      plants: Math.floor(totalPlants * 0.1),
      unlocked: userProfile.level >= 8,
      description: 'Where responsibility takes flight'
    }
  ]

  if (selectedGame) {
    const game = allGames.find(g => g.id === selectedGame)
    if (game) {
      const GameComponent = game.component
      return (
        <div className="fixed inset-0 z-50 bg-background">
          <GameComponent
            onComplete={handleGameComplete}
            onExit={handleGameExit}
            userTier="middle"
            {...(game.props || {})}
          />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="border-b border-green-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <Plant className="w-6 h-6 text-white" weight="fill" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-900">FinanceQuest Pro</h1>
                <p className="text-sm text-green-600">Creative Mode - Finance Garden</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 border border-amber-200">
                  <Coins className="w-4 h-4 text-amber-600" weight="fill" />
                  <span className="text-lg font-bold text-amber-700">{userProfile.totalCoins}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 border border-green-200">
                  <Sun className="w-4 h-4 text-green-600" weight="fill" />
                  <span className="text-lg font-bold text-green-700">Level {userProfile.level}</span>
                </div>
              </div>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-green-200 hover:bg-green-50">
                    <GearSix className="w-5 h-5 text-green-700" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Button 
                      onClick={onModeSwitch}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowsClockwise className="w-4 h-4 mr-2" />
                      Switch to Structured Mode
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-green-700 mb-2">
              <span className="font-medium">Garden Growth</span>
              <span className="font-bold">{currentLevelXP}/{xpForNextLevel} XP</span>
            </div>
            <div className="h-3 bg-green-100 rounded-full overflow-hidden border border-green-200">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-8">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 bg-white/80 border border-green-200 shadow-sm h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 py-3">
              <Plant className="w-4 h-4 mr-2" />
              Garden
            </TabsTrigger>
            <TabsTrigger value="mini-games" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 py-3">
              <Lightning className="w-4 h-4 mr-2" />
              Mini-Games
            </TabsTrigger>
            <TabsTrigger value="adventures" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 py-3">
              <Rocket className="w-4 h-4 mr-2" />
              Adventures
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 py-3">
              <Trophy className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-green-900 mb-4">
                Your Financial Garden
              </h2>
              <p className="text-xl text-green-600 max-w-2xl mx-auto">
                Every game you play plants a seed. Every smart decision helps it grow. 
                Watch your financial health flourish! 🌱
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {gardens.map((garden, index) => {
                const Icon = garden.icon
                return (
                  <motion.div
                    key={garden.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${garden.bgColor} border-2 ${garden.borderColor} ${garden.unlocked ? 'shadow-lg hover:shadow-xl' : 'opacity-60'} transition-all duration-300`}>
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${garden.color} flex items-center justify-center shadow-md`}>
                              <Icon className="w-8 h-8 text-white" weight="fill" />
                            </div>
                            <div>
                              <h3 className={`text-2xl font-bold ${garden.textColor}`}>
                                {garden.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{garden.description}</p>
                            </div>
                          </div>
                          {garden.unlocked && (
                            <Badge className="bg-white/50 text-green-700 border-green-200">
                              Level {gardenLevel}
                            </Badge>
                          )}
                        </div>

                        {garden.unlocked ? (
                          <>
                            <div className="flex items-center gap-3 mb-4">
                              <Plant className={`w-5 h-5 ${garden.textColor}`} weight="fill" />
                              <span className={`text-lg font-semibold ${garden.textColor}`}>
                                {garden.plants} plants growing
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-8 gap-2 mb-4">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: i < garden.plants ? 1 : 0.3 }}
                                  transition={{ delay: i * 0.05 }}
                                  className={`aspect-square rounded-lg ${
                                    i < garden.plants 
                                      ? `bg-gradient-to-br ${garden.color}` 
                                      : 'bg-gray-200'
                                  } flex items-center justify-center`}
                                >
                                  {i < garden.plants && (
                                    <Plant className="w-4 h-4 text-white" weight="fill" />
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-3">🔒</div>
                            <p className="text-gray-500 font-medium">
                              Reach Level {Math.ceil(index * 2.5 + 3)} to unlock
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid md:grid-cols-3 gap-6"
            >
              <Card className="bg-white/80 border-green-200 shadow-md">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" weight="fill" />
                  <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.gamesCompleted}</p>
                  <p className="text-sm text-green-600 font-medium">Games Completed</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 border-green-200 shadow-md">
                <CardContent className="p-6 text-center">
                  <Fire className="w-10 h-10 text-orange-500 mx-auto mb-3" weight="fill" />
                  <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.currentStreak}</p>
                  <p className="text-sm text-green-600 font-medium">Day Streak</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 border-green-200 shadow-md">
                <CardContent className="p-6 text-center">
                  <Medal className="w-10 h-10 text-purple-500 mx-auto mb-3" weight="fill" />
                  <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.achievements.length}</p>
                  <p className="text-sm text-green-600 font-medium">Achievements</p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="mini-games" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-green-900 mb-4">
                Quick Financial Mini-Games
              </h2>
              <p className="text-xl text-green-600 max-w-2xl mx-auto">
                Fast-paced games to learn financial concepts in just a few minutes! 🎮
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {miniGames.map((game, index) => {
                const completions = gameScores.filter(s => s.gameId === game.id).length
                const bestScore = gameScores
                  .filter(s => s.gameId === game.id)
                  .reduce((max, s) => Math.max(max, s.score), 0)

                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/90 border-2 border-green-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            {game.icon}
                          </div>
                          <Badge variant={
                            game.difficulty === 'Easy' ? 'default' : 
                            game.difficulty === 'Medium' ? 'secondary' : 
                            'destructive'
                          }>
                            {game.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-green-900">{game.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {game.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{game.estimatedTime}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {game.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {completions > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-green-700">
                                <Trophy className="w-4 h-4" weight="fill" />
                                <span className="font-medium">Best: {bestScore}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Target className="w-4 h-4" />
                                <span>{completions} plays</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button 
                          onClick={() => handleGameStart(game.id)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
                        >
                          <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                          Play Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-green-400 to-emerald-500 border-0 shadow-2xl text-white">
                <CardContent className="p-8 text-center">
                  <Lightning className="w-12 h-12 mx-auto mb-4" weight="fill" />
                  <h3 className="text-2xl font-bold mb-3">Quick & Fun Learning</h3>
                  <p className="text-green-50 leading-relaxed">
                    Mini-games are designed for quick play sessions. Master the basics, earn coins, and level up your garden!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="adventures" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-green-900 mb-4">
                Financial Adventure Games
              </h2>
              <p className="text-xl text-green-600 max-w-2xl mx-auto">
                Deep dive into complex financial scenarios with these immersive adventures! 🚀
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adventureGames.map((game, index) => {
                const completions = gameScores.filter(s => s.gameId === game.id).length
                const bestScore = gameScores
                  .filter(s => s.gameId === game.id)
                  .reduce((max, s) => Math.max(max, s.score), 0)

                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/90 border-2 border-amber-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            {game.icon}
                          </div>
                          <Badge variant={
                            game.difficulty === 'Easy' ? 'default' : 
                            game.difficulty === 'Medium' ? 'secondary' : 
                            'destructive'
                          }>
                            {game.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-amber-900">{game.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {game.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{game.estimatedTime}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {game.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {completions > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-amber-700">
                                <Trophy className="w-4 h-4" weight="fill" />
                                <span className="font-medium">Best: {bestScore}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Target className="w-4 h-4" />
                                <span>{completions} plays</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button 
                          onClick={() => handleGameStart(game.id)}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md"
                        >
                          <Rocket className="w-4 h-4 mr-2" weight="fill" />
                          Start Adventure
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-amber-400 to-orange-500 border-0 shadow-2xl text-white">
                <CardContent className="p-8 text-center">
                  <Rocket className="w-12 h-12 mx-auto mb-4" weight="fill" />
                  <h3 className="text-2xl font-bold mb-3">Deep Financial Learning</h3>
                  <p className="text-orange-50 leading-relaxed">
                    Adventure games provide complex scenarios that mirror real-world financial challenges. Take your time and master advanced concepts!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-green-900 mb-4">
                Your Financial Journey
              </h2>
              <p className="text-xl text-green-600 max-w-2xl mx-auto">
                Track your achievements, streaks, and skill development! 📊
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-4 gap-6"
            >
              <Card className="bg-white/80 border-green-200 shadow-md">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" weight="fill" />
                  <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.gamesCompleted}</p>
                  <p className="text-sm text-green-600 font-medium">Games Completed</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 border-green-200 shadow-md">
                <CardContent className="p-6 text-center">
                  <Fire className="w-10 h-10 text-orange-500 mx-auto mb-3" weight="fill" />
                  <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.currentStreak}</p>
                  <p className="text-sm text-green-600 font-medium">Day Streak</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 border-green-200 shadow-md">
                <CardContent className="p-6 text-center">
                  <Medal className="w-10 h-10 text-purple-500 mx-auto mb-3" weight="fill" />
                  <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.achievements.length}</p>
                  <p className="text-sm text-green-600 font-medium">Achievements</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 border-green-200 shadow-md">
                <CardContent className="p-6 text-center">
                  <Sun className="w-10 h-10 text-green-500 mx-auto mb-3" weight="fill" />
                  <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.level}</p>
                  <p className="text-sm text-green-600 font-medium">Garden Level</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/80 border-green-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center gap-2">
                    <GameController className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gameScores.length > 0 ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {gameScores.slice(-10).reverse().map((score, index) => {
                          const game = allGames.find(g => g.id === score.gameId)
                          return (
                            <motion.div
                              key={`${score.gameId}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-4 rounded-xl bg-green-50/50 border border-green-100 hover:bg-green-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                  {game?.icon || <GameController className="w-5 h-5 text-white" />}
                                </div>
                                <div>
                                  <p className="font-semibold text-green-900">{game?.title || 'Game'}</p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(score.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-700">{score.score}</p>
                                <p className="text-xs text-gray-500">points</p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <GameController className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No games played yet</p>
                      <p className="text-sm text-gray-400 mt-2">Start playing to see your activity here!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-green-900 mb-4">
                Your Financial Garden
              </h2>
              <p className="text-xl text-green-600 max-w-2xl mx-auto">
                Every game you play plants a seed. Every smart decision helps it grow. 
                Watch your financial health flourish! 🌱
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {gardens.map((garden, index) => {
                const Icon = garden.icon
                return (
                  <motion.div
                    key={garden.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${garden.bgColor} border-2 ${garden.borderColor} ${garden.unlocked ? 'shadow-lg hover:shadow-xl' : 'opacity-60'} transition-all duration-300`}>
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${garden.color} flex items-center justify-center shadow-md`}>
                              <Icon className="w-8 h-8 text-white" weight="fill" />
                            </div>
                            <div>
                              <h3 className={`text-2xl font-bold ${garden.textColor}`}>
                                {garden.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{garden.description}</p>
                            </div>
                          </div>
                          {garden.unlocked && (
                            <Badge className="bg-white/50 text-green-700 border-green-200">
                              Level {gardenLevel}
                            </Badge>
                          )}
                        </div>

                        {garden.unlocked ? (
                          <>
                            <div className="flex items-center gap-3 mb-4">
                              <Plant className={`w-5 h-5 ${garden.textColor}`} weight="fill" />
                              <span className={`text-lg font-semibold ${garden.textColor}`}>
                                {garden.plants} plants growing
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-8 gap-2 mb-4">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: i < garden.plants ? 1 : 0.3 }}
                                  transition={{ delay: i * 0.05 }}
                                  className={`aspect-square rounded-lg ${
                                    i < garden.plants 
                                      ? `bg-gradient-to-br ${garden.color}` 
                                      : 'bg-gray-200'
                                  } flex items-center justify-center`}
                                >
                                  {i < garden.plants && (
                                    <Plant className="w-4 h-4 text-white" weight="fill" />
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-3">🔒</div>
                            <p className="text-gray-500 font-medium">
                              Reach Level {Math.ceil(index * 2.5 + 3)} to unlock
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-green-400 to-emerald-500 border-0 shadow-2xl text-white">
                <CardContent className="p-8 text-center">
                  <Plant className="w-12 h-12 mx-auto mb-4" weight="fill" />
                  <h3 className="text-2xl font-bold mb-3">How It Works</h3>
                  <p className="text-green-50 leading-relaxed">
                    Play games to earn XP and coins. Each completed game plants a new seed in your financial garden. 
                    Level up to unlock new garden areas and more challenging games!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
