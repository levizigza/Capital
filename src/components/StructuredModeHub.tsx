import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { 
  ChartBar, ChartLine, TrendUp, TrendDown, Target, 
  GameController, GearSix, ArrowsClockwise, Calendar,
  CheckCircle, Clock, Trophy, Coins, Moon, Sun,
  Play, ChartPie, SortAscending, SortDescending,
  Medal, Fire, Sparkle, Wallet, Bank, CreditCard, ChartLineUp,
  Path
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ProfessionalGameHub } from '@/game/components/ProfessionalGameHub'
import type { GameScore } from '@/App'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TierProgressionView } from '@/components/TierProgressionView'
import type { SkillLine } from '@/data/tiers'

interface StructuredModeHubProps {
  userProfile: {
    name: string
    level: number
    xp: number
    totalCoins: number
    gamesCompleted: number
    achievements: string[]
    currentStreak: number
    tierProgression?: {
      currentTierId: number
      tiers: Array<any>
      skillLines: Record<SkillLine, number>
      availableLineXP: number
    }
  }
  setUserProfile: (updater: (prev: any) => any) => void
  gameScores: GameScore[]
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: any) => void
  onModeSwitch: () => void
  onQuestComplete: (tierId: number, questId: string) => void
  onAllocateLineXP: (line: SkillLine, amount: number) => void
}

interface GameInfo {
  id: string
  name: string
  description: string
  skillFocus: string
  icon: React.ReactNode
  color: string
  category: 'budgeting' | 'investing' | 'debt' | 'profit'
}

type SortField = 'name' | 'lastPlayed' | 'highScore' | 'timesPlayed'
type SortOrder = 'asc' | 'desc'

const CHART_COLORS = {
  primary: 'oklch(0.45 0.15 250)',
  secondary: 'oklch(0.55 0.18 200)',
  accent: 'oklch(0.65 0.2 350)',
  success: 'oklch(0.55 0.15 145)',
  warning: 'oklch(0.70 0.18 75)',
}

export default function StructuredModeHub({
  userProfile,
  setUserProfile,
  gameScores,
  onGameComplete,
  onModeSwitch,
  onQuestComplete,
  onAllocateLineXP
}: StructuredModeHubProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [darkMode, setDarkMode] = useKV<boolean>('structured-dark-mode', false)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.playing === false && isPlaying) {
        setIsPlaying(false)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isPlaying])

  const availableGames: GameInfo[] = [
    {
      id: 'coin-catcher',
      name: 'Coin Catcher',
      description: 'Fast-paced savings game with streak rewards',
      skillFocus: 'Savings & Quick Decisions',
      icon: <Coins className="w-6 h-6" weight="fill" />,
      color: 'from-amber-500 to-orange-600',
      category: 'budgeting'
    },
    {
      id: 'budget-balancer',
      name: 'Budget Balancer',
      description: 'Categorize expenses and balance your budget',
      skillFocus: 'Budget Management',
      icon: <Wallet className="w-6 h-6" weight="fill" />,
      color: 'from-emerald-500 to-teal-600',
      category: 'budgeting'
    },
    {
      id: 'investment-tower',
      name: 'Investment Tower',
      description: 'Build a diversified investment portfolio',
      skillFocus: 'Portfolio Diversification',
      icon: <ChartLineUp className="w-6 h-6" weight="fill" />,
      color: 'from-blue-500 to-indigo-600',
      category: 'investing'
    },
    {
      id: 'credit-score-defender',
      name: 'Credit Score Defender',
      description: 'Make smart decisions to protect your credit',
      skillFocus: 'Credit Management',
      icon: <CreditCard className="w-6 h-6" weight="fill" />,
      color: 'from-purple-500 to-pink-600',
      category: 'debt'
    },
    {
      id: 'lemonade-boss',
      name: 'Lemonade Boss',
      description: 'Run a lemonade stand and maximize profit',
      skillFocus: 'Profit Calculation',
      icon: <Target className="w-6 h-6" weight="fill" />,
      color: 'from-yellow-500 to-amber-600',
      category: 'profit'
    },
    {
      id: 'market-tycoon',
      name: 'Market Tycoon',
      description: 'Trade stocks and diversify investments',
      skillFocus: 'Investment Strategy',
      icon: <ChartLine className="w-6 h-6" weight="fill" />,
      color: 'from-cyan-500 to-blue-600',
      category: 'investing'
    }
  ]

  const getGameStats = (gameId: string) => {
    const gameHistory = gameScores.filter(s => s.gameId === gameId)
    return {
      timesPlayed: gameHistory.length,
      highScore: gameHistory.length > 0 ? Math.max(...gameHistory.map(s => s.score)) : 0,
      lastPlayed: gameHistory.length > 0 ? gameHistory[gameHistory.length - 1].date : null,
      avgScore: gameHistory.length > 0 ? Math.round(gameHistory.reduce((sum, s) => sum + s.score, 0) / gameHistory.length) : 0
    }
  }

  const sortedGames = useMemo(() => {
    const gamesWithStats = availableGames.map(game => ({
      ...game,
      stats: getGameStats(game.id)
    }))

    return gamesWithStats.sort((a, b) => {
      let compareValue = 0
      
      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'lastPlayed':
          const aDate = a.stats.lastPlayed ? new Date(a.stats.lastPlayed).getTime() : 0
          const bDate = b.stats.lastPlayed ? new Date(b.stats.lastPlayed).getTime() : 0
          compareValue = aDate - bDate
          break
        case 'highScore':
          compareValue = a.stats.highScore - b.stats.highScore
          break
        case 'timesPlayed':
          compareValue = a.stats.timesPlayed - b.stats.timesPlayed
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })
  }, [sortField, sortOrder, gameScores])

  const skillCategoryProgress = useMemo(() => {
    const categories = {
      budgeting: { name: 'Budgeting', games: 0, totalScore: 0, icon: <Wallet className="w-5 h-5" /> },
      investing: { name: 'Investing', games: 0, totalScore: 0, icon: <ChartLineUp className="w-5 h-5" /> },
      debt: { name: 'Debt Management', games: 0, totalScore: 0, icon: <CreditCard className="w-5 h-5" /> },
      profit: { name: 'Profit Calculation', games: 0, totalScore: 0, icon: <Target className="w-5 h-5" /> }
    }

    gameScores.forEach(score => {
      const game = availableGames.find(g => g.id === score.gameId)
      if (game && categories[game.category]) {
        categories[game.category].games++
        categories[game.category].totalScore += score.score
      }
    })

    return Object.entries(categories).map(([key, data]) => ({
      category: key,
      name: data.name,
      progress: Math.min(data.games * 10, 100),
      gamesPlayed: data.games,
      avgScore: data.games > 0 ? Math.round(data.totalScore / data.games) : 0,
      icon: data.icon
    }))
  }, [gameScores])

  const progressOverTime = useMemo(() => {
    if (gameScores.length === 0) return []
    
    const dailyScores: { [key: string]: { total: number; count: number } } = {}
    
    gameScores.forEach(score => {
      const date = new Date(score.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!dailyScores[date]) {
        dailyScores[date] = { total: 0, count: 0 }
      }
      dailyScores[date].total += score.score
      dailyScores[date].count += 1
    })

    return Object.entries(dailyScores).map(([date, data]) => ({
      date,
      avgScore: Math.round(data.total / data.count),
      gamesPlayed: data.count
    })).slice(-10)
  }, [gameScores])

  const leaderboardData = useMemo(() => {
    const allScores = gameScores.map(score => {
      const game = availableGames.find(g => g.id === score.gameId)
      return {
        ...score,
        gameName: game?.name || score.gameId
      }
    }).sort((a, b) => b.score - a.score).slice(0, 10)

    return allScores
  }, [gameScores])

  const categoryDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {
      budgeting: 0,
      investing: 0,
      debt: 0,
      profit: 0
    }

    gameScores.forEach(score => {
      const game = availableGames.find(g => g.id === score.gameId)
      if (game) {
        distribution[game.category]++
      }
    })

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))
  }, [gameScores])

  const totalTimeSpent = gameScores.reduce((sum, s) => sum + s.timeSpent, 0)
  const avgScore = gameScores.length > 0 
    ? Math.round(gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length)
    : 0
  const completionPercentage = Math.min(Math.round((userProfile.gamesCompleted / 50) * 100), 100)

  const handleGameComplete = (gameId: string, score: number, timeSpent: number, additionalData?: any) => {
    onGameComplete(gameId, score, timeSpent, additionalData)
    setIsPlaying(false)
    if (window.history.state && window.history.state.playing) {
      window.history.back()
    } else {
      window.history.pushState({ mode: 'structured', playing: false }, '', window.location.href)
    }
    
    toast.success('Game Completed!', {
      description: `Score: ${score} • Time: ${Math.floor(timeSpent / 1000)}s`
    })
  }

  const handleGameStart = () => {
    setIsPlaying(true)
    window.history.pushState({ mode: 'structured', playing: true }, '', window.location.href)
  }

  const handleGameExit = () => {
    setIsPlaying(false)
    if (window.history.state && window.history.state.playing) {
      window.history.back()
    } else {
      window.history.pushState({ mode: 'structured', playing: false }, '', window.location.href)
    }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  if (isPlaying) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <ProfessionalGameHub
          onGameComplete={handleGameComplete}
          onExit={handleGameExit}
          userTier="middle"
        />
      </div>
    )
  }

  const themeClass = darkMode ? 'dark' : ''

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-300`}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                  <ChartBar className="w-6 h-6 text-white" weight="fill" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Structured Learning Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Data-driven financial mastery</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border">
                    <Target className="w-4 h-4 text-primary" weight="fill" />
                    <span className="text-lg font-bold">Lvl {userProfile.level}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border">
                    <Coins className="w-4 h-4 text-amber-500" weight="fill" />
                    <span className="text-lg font-bold">{userProfile.totalCoins}</span>
                  </div>
                </div>

                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <GearSix className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dark-mode">Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Toggle dark theme
                          </p>
                        </div>
                        <Switch
                          id="dark-mode"
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                        />
                      </div>
                      <Button 
                        onClick={onModeSwitch}
                        variant="outline"
                        className="w-full"
                      >
                        <ArrowsClockwise className="w-4 h-4 mr-2" />
                        Switch to Creative Mode
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="dashboard">
                <ChartBar className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="progression">
                <Path className="w-4 h-4 mr-2" />
                Progression
              </TabsTrigger>
              <TabsTrigger value="games">
                <GameController className="w-4 h-4 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger value="statistics">
                <ChartLine className="w-4 h-4 mr-2" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-muted-foreground">Games Completed</p>
                        <CheckCircle className="w-5 h-5 text-primary" weight="fill" />
                      </div>
                      <p className="text-3xl font-bold">{userProfile.gamesCompleted}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Progress value={completionPercentage} className="h-1 flex-1" />
                        <span>{completionPercentage}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                        <Target className="w-5 h-5 text-blue-500" weight="fill" />
                      </div>
                      <p className="text-3xl font-bold">{avgScore}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <TrendUp className="w-3 h-3 text-green-500" weight="bold" />
                        Across all games
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-muted-foreground">Time Invested</p>
                        <Clock className="w-5 h-5 text-purple-500" weight="fill" />
                      </div>
                      <p className="text-3xl font-bold">{Math.floor(totalTimeSpent / 60000)}m</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Total learning time
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                        <Fire className="w-5 h-5 text-orange-500" weight="fill" />
                      </div>
                      <p className="text-3xl font-bold">{userProfile.currentStreak}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        days active
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartBar className="w-5 h-5" />
                      Skill Category Progress
                    </CardTitle>
                    <CardDescription>Your mastery across financial domains</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {skillCategoryProgress.map((category, index) => (
                      <div key={category.category}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="text-primary">{category.icon}</div>
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">{category.progress}%</span>
                            <p className="text-xs text-muted-foreground">{category.gamesPlayed} games</p>
                          </div>
                        </div>
                        <Progress value={category.progress} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartPie className="w-5 h-5" />
                      Category Distribution
                    </CardTitle>
                    <CardDescription>Where you spend your time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryDistribution.some(d => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={categoryDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <ChartPie className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>No data yet</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progression" className="space-y-6">
              {userProfile.tierProgression ? (
                <TierProgressionView
                  userTiers={userProfile.tierProgression.tiers}
                  currentTierId={userProfile.tierProgression.currentTierId}
                  skillLines={userProfile.tierProgression.skillLines}
                  onQuestComplete={onQuestComplete}
                  onAllocateLineXP={onAllocateLineXP}
                  availableLineXP={userProfile.tierProgression.availableLineXP}
                />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Path className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">Tier progression system loading...</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="games" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Available Games</h2>
                  <p className="text-sm text-muted-foreground">Choose a game to start learning</p>
                </div>
                <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="lastPlayed">Last Played</SelectItem>
                    <SelectItem value="highScore">High Score</SelectItem>
                    <SelectItem value="timesPlayed">Times Played</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {sortedGames.map((game, index) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center text-white mb-4`}>
                            {game.icon}
                          </div>
                          
                          <h3 className="text-lg font-bold mb-1">{game.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Skill Focus:</span>
                              <Badge variant="secondary" className="text-xs">{game.skillFocus}</Badge>
                            </div>
                            {game.stats.lastPlayed && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Last Played:</span>
                                <span className="font-medium">{new Date(game.stats.lastPlayed).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">High Score:</span>
                              <span className="font-bold text-primary">{game.stats.highScore}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Times Played:</span>
                              <span className="font-medium">{game.stats.timesPlayed}</span>
                            </div>
                          </div>

                          <Button 
                            onClick={handleGameStart} 
                            className="w-full"
                            size="lg"
                          >
                            <Play className="w-4 h-4 mr-2" weight="fill" />
                            Start Game
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartLine className="w-5 h-5" />
                    Performance Over Time
                  </CardTitle>
                  <CardDescription>Track your score progression</CardDescription>
                </CardHeader>
                <CardContent>
                  {progressOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={progressOverTime}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="avgScore" 
                          stroke={CHART_COLORS.primary} 
                          strokeWidth={3}
                          name="Average Score"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="gamesPlayed" 
                          stroke={CHART_COLORS.success} 
                          strokeWidth={3}
                          name="Games Played"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <ChartLine className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Play games to see your progress</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar className="w-5 h-5" />
                    Performance by Category
                  </CardTitle>
                  <CardDescription>Compare your skills across domains</CardDescription>
                </CardHeader>
                <CardContent>
                  {skillCategoryProgress.some(c => c.gamesPlayed > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={skillCategoryProgress}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgScore" fill={CHART_COLORS.primary} name="Avg Score" />
                        <Bar dataKey="gamesPlayed" fill={CHART_COLORS.secondary} name="Games Played" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <ChartBar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Play games to see category statistics</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Top 10 High Scores
                  </CardTitle>
                  <CardDescription>Your best performances across all games</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboardData.length > 0 ? (
                    <div className="space-y-2">
                      {leaderboardData.map((entry, index) => (
                        <motion.div
                          key={`${entry.gameId}-${entry.date}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8">
                            {index === 0 && <Medal className="w-7 h-7 text-yellow-500" weight="fill" />}
                            {index === 1 && <Medal className="w-7 h-7 text-gray-400" weight="fill" />}
                            {index === 2 && <Medal className="w-7 h-7 text-amber-600" weight="fill" />}
                            {index > 2 && <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-bold">{entry.gameName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString()} • {Math.floor(entry.timeSpent / 1000)}s
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{entry.score}</p>
                            {entry.finalNetWorth && (
                              <p className="text-xs text-muted-foreground">${entry.finalNetWorth.toLocaleString()}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="font-medium">No scores yet</p>
                      <p className="text-sm mt-2">Start playing to build your leaderboard</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
