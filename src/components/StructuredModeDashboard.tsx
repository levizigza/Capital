import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkle, ChartLine, TrendUp, Target, Trophy, GameController,
  Coins, Clock, Fire, Lightning, Brain, ChartBar, Wallet,
  ArrowsClockwise, House, PiggyBank, Receipt
} from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { UserProfile, GameScore } from '@/App'
import { ARCHETYPES } from '@/data/archetype-questions'

interface StructuredModeDashboardProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  onModeSwitch: () => void
  onOpenProfile: () => void
}

export default function StructuredModeDashboard({
  userProfile,
  gameScores,
  onModeSwitch,
  onOpenProfile
}: StructuredModeDashboardProps) {
  const [layoutRatio, setLayoutRatio] = useState(50)
  
  const archetype = userProfile?.archetype?.primary ? ARCHETYPES[userProfile.archetype.primary] : ARCHETYPES.tempo

  const playfulRatio = useMemo(() => {
    if (!userProfile?.archetype?.primary) return 50
    const archetypeId = userProfile.archetype.primary
    if (archetypeId === 'dynamo' || archetypeId === 'blaze') return 60
    if (archetypeId === 'steel' || archetypeId === 'tempo') return 40
    return 50
  }, [userProfile?.archetype?.primary])

  const stats = useMemo(() => {
    const totalGames = gameScores.length
    const avgScore = totalGames > 0 
      ? Math.round(gameScores.reduce((sum, g) => sum + g.score, 0) / totalGames)
      : 0
    const totalTime = gameScores.reduce((sum, g) => sum + g.timeSpent, 0)
    
    return {
      totalGames,
      avgScore,
      totalTime: Math.floor(totalTime / 60000),
      streak: userProfile.currentStreak || 0,
      level: userProfile.level || 1,
      xp: userProfile.xp || 0,
      coins: userProfile.totalCoins || 0,
      nextLevelXP: ((userProfile.level || 1) * 100)
    }
  }, [gameScores, userProfile])

  const recentGames = useMemo(() => {
    return [...gameScores]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [gameScores])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onModeSwitch}
              className="gap-2"
            >
              <House size={20} />
              Home
            </Button>
            <div className="flex items-center gap-2">
              <ChartLine className="text-primary" size={24} weight="bold" />
              <h1 className="text-xl font-bold">Structured Mode</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onModeSwitch}
              className="gap-2"
            >
              <GameController size={20} />
              Creative Mode
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenProfile}
              className="gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-sm font-bold">
                {userProfile.name?.[0] || 'U'}
              </div>
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
            style={{
              gridColumn: `span ${Math.round((playfulRatio / 100) * 2)} / span ${Math.round((playfulRatio / 100) * 2)}`
            }}
          >
            <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-br from-[oklch(0.80_0.15_145)] to-[oklch(0.75_0.18_35)] text-white shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
              
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">Level {stats.level}</h2>
                    <p className="text-white/80 text-sm">Keep up the amazing work! 🎉</p>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-5xl"
                  >
                    {archetype.icon}
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">XP Progress</span>
                    <span className="font-bold">{stats.xp} / {stats.nextLevelXP}</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={(stats.xp / stats.nextLevelXP) * 100} 
                      className="h-3 bg-white/20"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      style={{ borderRadius: 'inherit' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center"
                  >
                    <Fire size={28} weight="fill" className="mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.streak}</div>
                    <div className="text-xs text-white/80">Day Streak</div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center"
                  >
                    <Coins size={28} weight="fill" className="mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.coins}</div>
                    <div className="text-xs text-white/80">Coins</div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center"
                  >
                    <Trophy size={28} weight="fill" className="mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats.totalGames}</div>
                    <div className="text-xs text-white/80">Games</div>
                  </motion.div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkle size={20} weight="fill" />
                    <span className="font-semibold">Recent Achievements</span>
                  </div>
                  {userProfile.achievements && userProfile.achievements.length > 0 ? (
                    <div className="space-y-2">
                      {userProfile.achievements.slice(0, 3).map((achievement, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-2 text-sm bg-white/10 rounded-lg p-2"
                        >
                          <Trophy size={16} weight="fill" />
                          <span>{achievement}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/70">Complete games to unlock achievements!</p>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-white/90 font-bold text-lg py-6 rounded-2xl shadow-lg"
                  onClick={onModeSwitch}
                >
                  <GameController size={24} weight="fill" className="mr-2" />
                  Play Mini-Games
                </Button>
              </div>
            </div>

            <Card className="border-2 shadow-lg overflow-hidden bg-gradient-to-br from-white to-[oklch(0.98_0.01_145)]">
              <CardHeader className="bg-gradient-to-r from-[oklch(0.85_0.15_145)] to-[oklch(0.80_0.18_35)] text-white">
                <CardTitle className="flex items-center gap-2">
                  <Lightning size={24} weight="fill" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <ChartBar size={32} className="mx-auto mb-2 text-[oklch(0.55_0.18_145)]" weight="fill" />
                    <div className="text-2xl font-bold text-foreground">{stats.avgScore}</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <Clock size={32} className="mx-auto mb-2 text-[oklch(0.70_0.18_35)]" weight="fill" />
                    <div className="text-2xl font-bold text-foreground">{stats.totalTime}m</div>
                    <div className="text-xs text-muted-foreground">Time Played</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
            style={{
              gridColumn: `span ${2 - Math.round((playfulRatio / 100) * 2)} / span ${2 - Math.round((playfulRatio / 100) * 2)}`
            }}
          >
            <Card className="border shadow-md">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <ChartLine size={24} weight="bold" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription>Track your financial learning progress</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target size={16} />
                          <span>Games Completed</span>
                        </div>
                        <div className="text-3xl font-bold text-foreground">{stats.totalGames}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendUp size={16} />
                          <span>Average Score</span>
                        </div>
                        <div className="text-3xl font-bold text-foreground">{stats.avgScore}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress to Level {stats.level + 1}</span>
                        <span className="font-mono text-xs">{Math.round((stats.xp / stats.nextLevelXP) * 100)}%</span>
                      </div>
                      <Progress value={(stats.xp / stats.nextLevelXP) * 100} className="h-2" />
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <PiggyBank size={18} />
                        Key Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                          <Wallet size={20} className="text-primary" />
                          <div>
                            <div className="text-xs text-muted-foreground">Total Coins</div>
                            <div className="font-bold">{stats.coins}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                          <Fire size={20} className="text-orange-500" />
                          <div>
                            <div className="text-xs text-muted-foreground">Streak</div>
                            <div className="font-bold">{stats.streak} days</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Receipt size={18} />
                          Recent Games
                        </h4>
                        <Badge variant="outline">{recentGames.length} games</Badge>
                      </div>

                      {recentGames.length > 0 ? (
                        <div className="space-y-2">
                          {recentGames.map((game, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:border-primary/50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">{game.gameId}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(game.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary">{game.score}</div>
                                <div className="text-xs text-muted-foreground">
                                  {Math.floor(game.timeSpent / 1000)}s
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <GameController size={48} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No games played yet</p>
                          <p className="text-xs mt-1">Start playing to see your performance!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Brain size={20} className="text-primary" />
                        <h4 className="font-semibold text-sm">Personalized Insights</h4>
                      </div>

                      <div className="space-y-3">
                        {stats.totalGames > 0 ? (
                          <>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <TrendUp size={20} className="text-blue-600 mt-0.5" />
                                <div>
                                  <div className="font-semibold text-sm text-blue-900">Strong Start!</div>
                                  <p className="text-xs text-blue-700 mt-1">
                                    You've completed {stats.totalGames} games with an average score of {stats.avgScore}.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {stats.streak > 2 && (
                              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <Fire size={20} className="text-orange-600 mt-0.5" weight="fill" />
                                  <div>
                                    <div className="font-semibold text-sm text-orange-900">Consistency Wins!</div>
                                    <p className="text-xs text-orange-700 mt-1">
                                      Your {stats.streak}-day streak shows great dedication to learning.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Target size={20} className="text-green-600 mt-0.5" />
                                <div>
                                  <div className="font-semibold text-sm text-green-900">Next Milestone</div>
                                  <p className="text-xs text-green-700 mt-1">
                                    You're {stats.nextLevelXP - stats.xp} XP away from Level {stats.level + 1}!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Brain size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No insights yet</p>
                            <p className="text-xs mt-1">Play some games to get personalized insights!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border shadow-md">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-primary text-base">
                  <ArrowsClockwise size={20} weight="bold" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={onModeSwitch}
                  >
                    <GameController size={24} />
                    <span className="text-xs">Play Games</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={onOpenProfile}
                  >
                    <Trophy size={24} />
                    <span className="text-xs">View Profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
