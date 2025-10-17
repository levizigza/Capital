import { useState } from 'react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { 
  ChartBar, ChartLine, TrendUp, TrendDown, Target, 
  GameController, GearSix, ArrowsClockwise, Calendar,
  CheckCircle, Clock, Trophy, Coins, FlagBanner, Timer,
  Sparkle
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ProfessionalGameHub } from '@/game/components/ProfessionalGameHub'
import type { GameScore } from '@/App'

interface StructuredModeHubProps {
  userProfile: {
    name: string
    level: number
    xp: number
    totalCoins: number
    gamesCompleted: number
    achievements: string[]
    currentStreak: number
  }
  setUserProfile: (updater: (prev: any) => any) => void
  gameScores: GameScore[]
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: any) => void
  onModeSwitch: () => void
}

export default function StructuredModeHub({
  userProfile,
  setUserProfile,
  gameScores,
  onGameComplete,
  onModeSwitch
}: StructuredModeHubProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const [dailyChallenges, setDailyChallenges] = useKV<Array<{
    id: string
    title: string
    description: string
    gameId: string
    requirement: { type: 'score' | 'time' | 'accuracy'; value: number }
    reward: { xp: number; coins: number }
    completed: boolean
    expiresAt: string
  }>>('daily-challenges-structured', [])
  
  const [weeklyChallenges, setWeeklyChallenges] = useKV<Array<{
    id: string
    title: string
    description: string
    progress: number
    target: number
    reward: { xp: number; coins: number }
    completed: boolean
    expiresAt: string
  }>>('weekly-challenges-structured', [])

  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, userProfile.level - 1))
  const currentLevelXP = userProfile.xp % xpForNextLevel
  const progressPercent = (currentLevelXP / xpForNextLevel) * 100

  const handleGameComplete = (gameId: string, score: number, timeSpent: number, additionalData?: any) => {
    onGameComplete(gameId, score, timeSpent, additionalData)
    checkAndCompleteChallenges(gameId, score, timeSpent)
    setIsPlaying(false)
    
    toast.success('Performance Recorded', {
      description: `Score: ${score} | Time: ${Math.floor(timeSpent / 1000)}s`
    })
  }

  const checkAndCompleteChallenges = (gameId: string, score: number, timeSpent: number) => {
    setDailyChallenges(prevChallenges => {
      const updated = (prevChallenges || []).map(challenge => {
        if (challenge.gameId === gameId && !challenge.completed) {
          let isCompleted = false
          if (challenge.requirement.type === 'score' && score >= challenge.requirement.value) {
            isCompleted = true
          } else if (challenge.requirement.type === 'time' && timeSpent <= challenge.requirement.value) {
            isCompleted = true
          }
          
          if (isCompleted) {
            setUserProfile(prev => ({
              ...prev!,
              xp: prev!.xp + challenge.reward.xp,
              totalCoins: prev!.totalCoins + challenge.reward.coins
            }))
            
            toast.success('🎯 Challenge Complete!', {
              description: `+${challenge.reward.xp} XP, +${challenge.reward.coins} coins`
            })
            
            return { ...challenge, completed: true }
          }
        }
        return challenge
      })
      return updated
    })
    
    setWeeklyChallenges(prevChallenges => {
      const updated = (prevChallenges || []).map(challenge => {
        if (!challenge.completed) {
          const newProgress = challenge.progress + 1
          const isCompleted = newProgress >= challenge.target
          
          if (isCompleted) {
            setUserProfile(prev => ({
              ...prev!,
              xp: prev!.xp + challenge.reward.xp,
              totalCoins: prev!.totalCoins + challenge.reward.coins
            }))
            
            toast.success('🏆 Weekly Challenge Complete!', {
              description: `+${challenge.reward.xp} XP, +${challenge.reward.coins} coins`
            })
          }
          
          return { ...challenge, progress: newProgress, completed: isCompleted }
        }
        return challenge
      })
      return updated
    })
  }

  const initializeChallenges = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    if ((dailyChallenges?.length || 0) === 0 || new Date(dailyChallenges?.[0]?.expiresAt || 0) < now) {
      const newDailyChallenges = [
        {
          id: `daily-1-${Date.now()}`,
          title: 'Score Target',
          description: 'Achieve a score of 500 or higher',
          gameId: 'any',
          requirement: { type: 'score' as const, value: 500 },
          reward: { xp: 100, coins: 50 },
          completed: false,
          expiresAt: tomorrow.toISOString()
        },
        {
          id: `daily-2-${Date.now()}`,
          title: 'Quick Completion',
          description: 'Complete any game in under 2 minutes',
          gameId: 'any',
          requirement: { type: 'time' as const, value: 120000 },
          reward: { xp: 120, coins: 60 },
          completed: false,
          expiresAt: tomorrow.toISOString()
        },
        {
          id: `daily-3-${Date.now()}`,
          title: 'High Performer',
          description: 'Score 800+ in any game',
          gameId: 'any',
          requirement: { type: 'score' as const, value: 800 },
          reward: { xp: 150, coins: 75 },
          completed: false,
          expiresAt: tomorrow.toISOString()
        }
      ]
      setDailyChallenges(newDailyChallenges)
    }
    
    if ((weeklyChallenges?.length || 0) === 0 || new Date(weeklyChallenges?.[0]?.expiresAt || 0) < now) {
      const newWeeklyChallenges = [
        {
          id: `weekly-1-${Date.now()}`,
          title: 'Consistency Champion',
          description: 'Complete 10 games this week',
          progress: 0,
          target: 10,
          reward: { xp: 500, coins: 250 },
          completed: false,
          expiresAt: nextWeek.toISOString()
        },
        {
          id: `weekly-2-${Date.now()}`,
          title: 'Score Aggregator',
          description: 'Accumulate 5000 total points across all games',
          progress: 0,
          target: 5000,
          reward: { xp: 400, coins: 200 },
          completed: false,
          expiresAt: nextWeek.toISOString()
        },
        {
          id: `weekly-3-${Date.now()}`,
          title: 'Elite Performer',
          description: 'Score 1000+ in any single game',
          progress: 0,
          target: 1,
          reward: { xp: 600, coins: 300 },
          completed: false,
          expiresAt: nextWeek.toISOString()
        }
      ]
      setWeeklyChallenges(newWeeklyChallenges)
    }
  }

  useState(() => {
    initializeChallenges()
  })

  const avgScore = gameScores.length > 0 
    ? Math.round(gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length)
    : 0

  const totalTimeSpent = gameScores.reduce((sum, s) => sum + s.timeSpent, 0)
  const avgTimePerGame = gameScores.length > 0 
    ? Math.round(totalTimeSpent / gameScores.length / 1000)
    : 0

  const recentGames = gameScores.slice(-5).reverse()
  const scoreTrend = gameScores.length >= 2
    ? gameScores[gameScores.length - 1].score > gameScores[gameScores.length - 2].score
    : true

  const skillCategories = [
    { name: 'Financial Planning', progress: Math.min((userProfile.gamesCompleted * 15), 100) },
    { name: 'Investment Strategy', progress: Math.min((userProfile.gamesCompleted * 12), 100) },
    { name: 'Risk Management', progress: Math.min((userProfile.gamesCompleted * 10), 100) },
    { name: 'Budget Management', progress: Math.min((userProfile.gamesCompleted * 18), 100) },
  ]

  if (isPlaying) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <ProfessionalGameHub
          onGameComplete={handleGameComplete}
          onExit={() => setIsPlaying(false)}
          userTier="middle"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="border-b border-blue-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <ChartBar className="w-6 h-6 text-white" weight="fill" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Analytics Dashboard</h1>
                <p className="text-sm text-blue-600">Track your financial mastery</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 border border-blue-200">
                  <Target className="w-4 h-4 text-blue-600" weight="fill" />
                  <span className="text-lg font-bold text-blue-700">Level {userProfile.level}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 border border-amber-200">
                  <Coins className="w-4 h-4 text-amber-600" weight="fill" />
                  <span className="text-lg font-bold text-amber-700">{userProfile.totalCoins}</span>
                </div>
              </div>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-blue-200 hover:bg-blue-50">
                    <GearSix className="w-5 h-5 text-blue-700" />
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
                      Switch to Creative Mode
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
              <span className="font-medium">Level Progress</span>
              <span className="font-bold">{currentLevelXP}/{xpForNextLevel} XP ({Math.round(progressPercent)}%)</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-blue-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-600" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white border border-blue-200 shadow-sm p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <ChartBar className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <FlagBanner className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <ChartLine className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <GameController className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-white border-blue-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-600">Games Completed</p>
                      <CheckCircle className="w-5 h-5 text-blue-500" weight="fill" />
                    </div>
                    <p className="text-4xl font-bold text-blue-900">{userProfile.gamesCompleted}</p>
                    <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                      <TrendUp className="w-3 h-3" weight="bold" />
                      Total sessions
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-white border-blue-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-600">Avg Score</p>
                      <Target className="w-5 h-5 text-indigo-500" weight="fill" />
                    </div>
                    <p className="text-4xl font-bold text-blue-900">{avgScore}</p>
                    <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${scoreTrend ? 'text-green-600' : 'text-orange-600'}`}>
                      {scoreTrend ? <TrendUp className="w-3 h-3" weight="bold" /> : <TrendDown className="w-3 h-3" weight="bold" />}
                      {scoreTrend ? 'Improving' : 'Keep practicing'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-white border-blue-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-600">Current Streak</p>
                      <Calendar className="w-5 h-5 text-orange-500" weight="fill" />
                    </div>
                    <p className="text-4xl font-bold text-blue-900">{userProfile.currentStreak}</p>
                    <p className="text-xs text-gray-600 font-medium mt-2">
                      days active
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-white border-blue-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-600">Avg Time</p>
                      <Clock className="w-5 h-5 text-purple-500" weight="fill" />
                    </div>
                    <p className="text-4xl font-bold text-blue-900">{avgTimePerGame}s</p>
                    <p className="text-xs text-gray-600 font-medium mt-2">
                      per game
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.5 }}
                className="md:col-span-2"
              >
                <Card className="bg-white border-blue-200 shadow-md h-full">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                      <ChartLine className="w-5 h-5" />
                      Skill Development
                    </CardTitle>
                    <CardDescription>Your progress across financial concepts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {skillCategories.map((skill, index) => (
                      <div key={skill.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                          <span className="text-sm font-bold text-blue-600">{skill.progress}%</span>
                        </div>
                        <Progress 
                          value={skill.progress} 
                          className="h-2.5 bg-blue-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-600"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-2xl text-white h-full">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                    <GameController className="w-16 h-16 mb-6" weight="fill" />
                    <h3 className="text-2xl font-bold mb-3">Start Learning</h3>
                    <p className="text-blue-100 mb-8 leading-relaxed">
                      Play financial games and track your improvement in real-time
                    </p>
                    <Button 
                      size="lg"
                      onClick={() => setIsPlaying(true)}
                      className="bg-white text-blue-600 hover:bg-blue-50 w-full font-bold shadow-lg"
                    >
                      Launch Games
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <Card className="bg-white border-blue-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-3">
                  <Calendar className="w-6 h-6" weight="fill" />
                  Daily Performance Targets
                </CardTitle>
                <CardDescription>
                  Complete these objectives before midnight for bonus XP and coins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(dailyChallenges || []).map((challenge, index) => {
                  const timeUntilExpiry = new Date(challenge.expiresAt).getTime() - Date.now()
                  const hoursLeft = Math.floor(timeUntilExpiry / (1000 * 60 * 60))
                  
                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`${challenge.completed ? 'bg-blue-50/50 border-blue-300' : 'bg-white border-blue-200'} border-2`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                challenge.completed 
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                                  : 'bg-gradient-to-br from-gray-200 to-gray-300'
                              }`}>
                                {challenge.completed ? (
                                  <CheckCircle className="w-6 h-6 text-white" weight="fill" />
                                ) : (
                                  <Target className="w-6 h-6 text-gray-600" weight="fill" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-blue-900 mb-1">{challenge.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Sparkle className="w-4 h-4" />
                                    <span className="font-semibold">+{challenge.reward.xp} XP</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-amber-600">
                                    <Coins className="w-4 h-4" />
                                    <span className="font-semibold">+{challenge.reward.coins}</span>
                                  </div>
                                  {!challenge.completed && (
                                    <div className="flex items-center gap-1 text-orange-600">
                                      <Timer className="w-4 h-4" />
                                      <span>{hoursLeft}h remaining</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {challenge.completed ? (
                              <Badge className="bg-blue-500 text-white">Completed</Badge>
                            ) : (
                              <Button
                                onClick={() => setIsPlaying(true)}
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                              >
                                Start
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-3">
                  <Trophy className="w-6 h-6" weight="fill" />
                  Weekly Milestones
                </CardTitle>
                <CardDescription>
                  Long-term objectives with premium rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(weeklyChallenges || []).map((challenge, index) => {
                  const timeUntilExpiry = new Date(challenge.expiresAt).getTime() - Date.now()
                  const daysLeft = Math.floor(timeUntilExpiry / (1000 * 60 * 60 * 24))
                  const progressPercent = (challenge.progress / challenge.target) * 100
                  
                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`${challenge.completed ? 'bg-purple-50/50 border-purple-300' : 'bg-white border-purple-200'} border-2`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-purple-900">{challenge.title}</h3>
                            {challenge.completed ? (
                              <Badge className="bg-purple-500 text-white">
                                <CheckCircle className="w-4 h-4 mr-1" weight="fill" />
                                Complete
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-purple-300 text-purple-700">
                                {daysLeft} days left
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-purple-700 font-bold">
                                {challenge.progress} / {challenge.target}
                              </span>
                            </div>
                            <Progress value={progressPercent} className="h-2.5 bg-purple-100 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" />
                            
                            <div className="flex items-center gap-4 text-sm pt-2">
                              <div className="flex items-center gap-1 text-blue-600">
                                <Sparkle className="w-4 h-4" />
                                <span className="font-semibold">+{challenge.reward.xp} XP</span>
                              </div>
                              <div className="flex items-center gap-1 text-amber-600">
                                <Coins className="w-4 h-4" />
                                <span className="font-semibold">+{challenge.reward.coins}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-2xl text-white">
              <CardContent className="p-8 text-center">
                <FlagBanner className="w-12 h-12 mx-auto mb-4" weight="fill" />
                <h3 className="text-2xl font-bold mb-3">Challenge System</h3>
                <p className="text-blue-100 leading-relaxed">
                  Complete daily and weekly challenges to maximize your XP gains and coin earnings. 
                  Challenges refresh automatically when they expire.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-8">
            <Card className="bg-white border-blue-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-blue-900">Recent Activity</CardTitle>
                <CardDescription>Your last 5 game sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentGames.length === 0 ? (
                  <div className="text-center py-12">
                    <ChartLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No games played yet</p>
                    <p className="text-gray-400 text-sm mt-2">Start playing to see your performance data</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Game</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Score</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Result</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentGames.map((game, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                            <td className="py-4 px-4">
                              <span className="font-medium text-gray-900 capitalize">
                                {game.gameId.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                {game.score}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {Math.floor(game.timeSpent / 1000)}s
                            </td>
                            <td className="py-4 px-4">
                              {game.finalNetWorth ? (
                                <span className="text-green-600 font-semibold">
                                  ${game.finalNetWorth.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-gray-500 text-sm">
                              {new Date(game.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games">
            <Card className="bg-white border-blue-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-blue-900">Available Games</CardTitle>
                <CardDescription>Financial learning through interactive gameplay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <GameController className="w-20 h-20 text-blue-500 mx-auto mb-6" weight="fill" />
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">
                    Launch Game Collection
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Access our full suite of financial mini-games to improve your skills
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => setIsPlaying(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg font-bold shadow-lg"
                  >
                    <GameController className="w-5 h-5 mr-2" />
                    Start Playing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
