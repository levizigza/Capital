import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartLine, GameController, House, Trophy, Target, 
  Clock, Fire, Coins, TrendUp, Lightning, CheckCircle,
  Calendar, Brain
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { UserProfile, GameScore } from '@/App'

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
  const stats = useMemo(() => {
    const total = gameScores.length
    const avgScore = total > 0 
      ? Math.round(gameScores.reduce((sum, g) => sum + g.score, 0) / total) 
      : 0
    const totalTime = gameScores.reduce((sum, g) => sum + g.timeSpent, 0)
    const avgTime = total > 0 ? Math.round(totalTime / total / 1000) : 0
    
    return { total, avgScore, avgTime, totalTime }
  }, [gameScores])

  const progressToNextLevel = useMemo(() => {
    const currentLevelXP = (userProfile.level - 1) * 100
    const progress = ((userProfile.xp - currentLevelXP) / 100) * 100
    return Math.min(Math.max(progress, 0), 100)
  }, [userProfile.level, userProfile.xp])

  return (
    <div className="mode-structured min-h-screen mode-transition-enter bg-gradient-to-br from-structured-bg via-white to-structured-muted/60">
      <div className="mode-indicator-bar structured" />
      {/* Awwwards-style Navigation Header with Glassmorphism and animated underline */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-structured-border/40 shadow-lg">
        <div className="max-w-container">
          <div className="flex items-center justify-between h-20 px-2 md:px-0">
            <div className="flex items-center gap-8">
              <button
                onClick={onModeSwitch}
                className="flex items-center gap-2 text-lg font-semibold text-structured-fg hover:text-structured-primary transition-colors relative group focus:outline-none"
                aria-label="Return to mode selection"
                title="Go to Home / Mode Selection"
              >
                <House size={24} weight="fill" className="drop-shadow-md" />
                <span className="hidden sm:inline">Home</span>
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-structured-primary transition-all group-hover:w-full" />
              </button>
              <div className="flex items-center gap-2 text-base text-structured-muted-fg font-medium">
                <ChartLine size={20} weight="fill" className="animate-pulse" />
                <span>Structured Mode</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={onModeSwitch}
                className="gap-2 text-base font-semibold hover:bg-structured-primary/10"
                title="Switch to Creative Mode for free play"
              >
                <GameController size={20} weight="fill" className="transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline">Switch to Creative</span>
              </Button>
              <button
                onClick={onOpenProfile}
                className="w-11 h-11 rounded-full bg-gradient-to-br from-structured-primary to-structured-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-105 transition-all border-2 border-white/60 focus:outline-none focus:ring-2 focus:ring-structured-primary"
                aria-label="Open profile"
                title="View your profile and achievements"
              >
                {userProfile.name?.[0] || 'U'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-container py-12">
        {/* Hero Stats Section */}
  <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-structured-primary via-structured-secondary to-structured-fg bg-clip-text text-transparent drop-shadow-lg animate-fade-in">
              Financial Progress Dashboard
            </h1>
            <p className="text-2xl md:text-3xl font-medium text-structured-muted-fg animate-fade-in-slow">
              Track your journey to financial mastery
            </p>
          </motion.div>
        </section>

        {/* Add a classic subtitle and instructions for Structured Mode */}
        <motion.div className="text-center mb-8">
          <h2 className="text-3xl font-black text-blue-700 mb-2">Structured Mode</h2>
          <p className="text-lg font-bold text-blue-600">
            Follow the guided lessons and quizzes below to build your financial literacy step by step. Your progress and achievements are tracked here.
          </p>
        </motion.div>

        {/* KPI Cards Grid */}
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              icon: Trophy, 
              label: 'Games Completed', 
              value: stats.total, 
              color: 'oklch(0.58 0.18 145)',
              bgColor: 'oklch(0.58 0.18 145 / 0.08)'
            },
            { 
              icon: Target, 
              label: 'Average Score', 
              value: `${stats.avgScore}%`, 
              color: 'oklch(0.60 0.14 240)',
              bgColor: 'oklch(0.60 0.14 240 / 0.08)'
            },
            { 
              icon: Clock, 
              label: 'Avg. Time', 
              value: `${stats.avgTime}s`, 
              color: 'oklch(0.68 0.16 80)',
              bgColor: 'oklch(0.68 0.16 80 / 0.08)'
            },
            { 
              icon: Fire, 
              label: 'Current Streak', 
              value: userProfile.currentStreak, 
              color: 'oklch(0.65 0.22 35)',
              bgColor: 'oklch(0.65 0.22 35 / 0.08)'
            }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: idx * 0.08, 
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2 }
              }}
            >
              <Card className="pro-card hover:border-structured-primary/40 group overflow-hidden relative shadow-xl backdrop-blur-xl bg-white/60 border border-structured-border/30">
                <div className="absolute inset-0 bg-gradient-to-br from-structured-primary/10 via-white/0 to-structured-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <CardContent className="pt-8 relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <motion.div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-md"
                      style={{ 
                        backgroundColor: stat.bgColor,
                        color: stat.color
                      }}
                      whileHover={{ rotate: 5 }}
                    >
                      <stat.icon size={20} weight="fill" />
                    </motion.div>
                  </div>
                  <motion.div 
                    className="text-4xl font-extrabold mb-2 transition-colors text-structured-fg drop-shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (idx * 0.08) + 0.2 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-base font-medium transition-colors text-structured-muted-fg">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Level Progress */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="pro-card shadow-2xl backdrop-blur-xl bg-white/70 border border-structured-border/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lightning size={20} weight="fill" style={{ color: 'var(--structured-primary)' }} />
                    Level Progress
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Level {userProfile.level} • {userProfile.xp} XP
                  </CardDescription>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-sm px-3 py-1"
                  style={{
                    backgroundColor: 'var(--structured-muted)',
                    color: 'var(--structured-fg)'
                  }}
                >
                  {Math.round(progressToNextLevel)}% to Level {userProfile.level + 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress 
                value={progressToNextLevel} 
                className="h-3"
              />
              <div className="flex justify-between text-xs mt-2 text-structured-muted-fg">
                <span>Level {userProfile.level}</span>
                <span>Level {userProfile.level + 1}</span>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Tabbed Content */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs defaultValue="overview" className="w-full animate-fade-in-slow">
            <TabsList className="grid w-full grid-cols-3 mb-8 rounded-xl bg-gradient-to-r from-structured-muted/40 to-structured-card/60 shadow-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Recent Activity */}
              <Card className="pro-card shadow-lg backdrop-blur-xl bg-white/70 border border-structured-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={20} weight="fill" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gameScores.length === 0 ? (
                    <div className="text-center py-12 text-structured-muted-fg">
                      <GameController size={48} weight="duotone" className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No games played yet</p>
                      <p className="text-xs mt-1">Start playing to see your progress here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {gameScores.slice(-5).reverse().map((score, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-structured-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center bg-structured-muted"
                            >
                              <CheckCircle size={20} weight="fill" className="text-structured-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm text-structured-fg">
                                {score.gameId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </div>
                              <div className="text-xs text-structured-muted-fg">
                                {new Date(score.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-structured-primary">
                              {score.score}%
                            </div>
                            <div className="text-xs text-structured-muted-fg">
                              {Math.round(score.timeSpent / 1000)}s
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Start Playing CTA */}
              <Card className="pro-card shadow-lg border-2 border-structured-primary/60 bg-gradient-to-br from-structured-primary/10 to-white/80 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-structured-fg">
                        Ready to improve your skills?
                      </h3>
                      <p className="text-sm text-structured-muted-fg">
                        Play mini-games to earn XP and level up your financial knowledge
                      </p>
                    </div>
                    <Button 
                      className="btn-primary whitespace-nowrap"
                      size="lg"
                      onClick={onModeSwitch}
                    >
                      <GameController size={20} weight="fill" className="mr-2" />
                      Play Games
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="pro-card shadow-lg backdrop-blur-xl bg-white/70 border border-structured-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={20} weight="fill" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-structured-muted-fg">
                    <Trophy size={48} weight="duotone" className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No achievements unlocked yet</p>
                    <p className="text-xs mt-1">Complete challenges to earn badges</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card className="pro-card shadow-lg backdrop-blur-xl bg-white/70 border border-structured-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={20} weight="fill" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.total > 0 ? (
                      <>
                        <div className="section-muted p-4">
                          <div className="flex items-start gap-3">
                            <TrendUp size={20} weight="fill" className="mt-0.5 text-structured-primary" />
                            <div>
                              <h4 className="font-medium mb-1 text-structured-fg">
                                Strong Performance
                              </h4>
                              <p className="text-sm text-structured-muted-fg">
                                Your average score of {stats.avgScore}% shows good financial decision-making skills.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="section-muted p-4">
                          <div className="flex items-start gap-3">
                            <Coins size={20} weight="fill" className="mt-0.5 text-amber-600" />
                            <div>
                              <h4 className="font-medium mb-1 text-structured-fg">
                                Consistent Progress
                              </h4>
                              <p className="text-sm text-structured-muted-fg">
                                You've completed {stats.total} game{stats.total !== 1 ? 's' : ''} with a {userProfile.currentStreak}-day streak. Keep it up!
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-structured-muted-fg">
                        <Brain size={48} weight="duotone" className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm">No insights available yet</p>
                        <p className="text-xs mt-1">Play games to unlock personalized insights</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.section>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-structured-border/40 mt-20 bg-gradient-to-t from-structured-card/80 to-white/60 shadow-inner">
        <div className="max-w-container py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-base font-medium text-structured-muted-fg">
            <div>© 2024 Capital. All rights reserved.</div>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-structured-primary transition-colors underline-offset-4">Privacy</a>
              <a href="#" className="hover:text-structured-primary transition-colors underline-offset-4">Terms</a>
              <a href="#" className="hover:text-structured-primary transition-colors underline-offset-4">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
