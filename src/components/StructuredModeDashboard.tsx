import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartLine, GameController, House, User, Trophy, Target, 
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
    const nextLevelXP = userProfile.level * 100
    const progress = ((userProfile.xp - currentLevelXP) / 100) * 100
    return Math.min(Math.max(progress, 0), 100)
  }, [userProfile.level, userProfile.xp])

  return (
    <div className="mode-structured min-h-screen mode-transition-enter">
      <div className="mode-indicator structured" />
      
      {/* Professional Navigation Header */}
      <header className="sticky top-0 z-50 bg-structured-card border-b border-structured-border backdrop-blur-sm bg-opacity-95">
        <div className="container-pro">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <button
                onClick={onModeSwitch}
                className="flex items-center gap-2 text-sm font-medium text-structured-fg hover:text-structured-primary transition-colors"
                aria-label="Return to mode selection"
              >
                <House size={20} weight="fill" />
                <span className="hidden sm:inline">Home</span>
              </button>
              
              <div className="flex items-center gap-2 text-sm text-structured-muted-fg">
                <ChartLine size={18} weight="fill" />
                <span className="font-medium">Structured Mode</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onModeSwitch}
                className="gap-2"
              >
                <GameController size={18} weight="fill" />
                <span className="hidden sm:inline">Switch to Creative</span>
              </Button>
              
              <button
                onClick={onOpenProfile}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-structured-primary to-structured-secondary flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                aria-label="Open profile"
              >
                {userProfile.name?.[0] || 'U'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container-pro py-8">
        {/* Hero Stats Section */}
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--structured-fg)' }}>
              Financial Progress Dashboard
            </h1>
            <p className="text-lg" style={{ color: 'var(--structured-muted-fg)' }}>
              Track your journey to financial mastery
            </p>
          </motion.div>
        </section>

        {/* KPI Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              transition={{ delay: idx * 0.1, duration: 0.3 }}
            >
              <Card className="pro-card hover:border-structured-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: stat.bgColor,
                        color: stat.color
                      }}
                    >
                      <stat.icon size={20} weight="fill" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1" style={{ color: 'var(--structured-fg)' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--structured-muted-fg)' }}>
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Level Progress */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="pro-card">
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
              <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--structured-muted-fg)' }}>
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
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Recent Activity */}
              <Card className="pro-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={20} weight="fill" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gameScores.length === 0 ? (
                    <div className="text-center py-12" style={{ color: 'var(--structured-muted-fg)' }}>
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
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: 'var(--structured-muted)' }}
                            >
                              <CheckCircle size={20} weight="fill" style={{ color: 'var(--structured-primary)' }} />
                            </div>
                            <div>
                              <div className="font-medium text-sm" style={{ color: 'var(--structured-fg)' }}>
                                {score.gameId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--structured-muted-fg)' }}>
                                {new Date(score.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold" style={{ color: 'var(--structured-primary)' }}>
                              {score.score}%
                            </div>
                            <div className="text-xs" style={{ color: 'var(--structured-muted-fg)' }}>
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
              <Card className="pro-card" style={{ borderColor: 'var(--structured-primary)', borderWidth: '2px' }}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--structured-fg)' }}>
                        Ready to improve your skills?
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--structured-muted-fg)' }}>
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
              <Card className="pro-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={20} weight="fill" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12" style={{ color: 'var(--structured-muted-fg)' }}>
                    <Trophy size={48} weight="duotone" className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No achievements unlocked yet</p>
                    <p className="text-xs mt-1">Complete challenges to earn badges</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card className="pro-card">
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
                            <TrendUp size={20} weight="fill" style={{ color: 'var(--structured-primary)' }} className="mt-0.5" />
                            <div>
                              <h4 className="font-medium mb-1" style={{ color: 'var(--structured-fg)' }}>
                                Strong Performance
                              </h4>
                              <p className="text-sm" style={{ color: 'var(--structured-muted-fg)' }}>
                                Your average score of {stats.avgScore}% shows good financial decision-making skills.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="section-muted p-4">
                          <div className="flex items-start gap-3">
                            <Coins size={20} weight="fill" style={{ color: 'oklch(0.68 0.16 80)' }} className="mt-0.5" />
                            <div>
                              <h4 className="font-medium mb-1" style={{ color: 'var(--structured-fg)' }}>
                                Consistent Progress
                              </h4>
                              <p className="text-sm" style={{ color: 'var(--structured-muted-fg)' }}>
                                You've completed {stats.total} game{stats.total !== 1 ? 's' : ''} with a {userProfile.currentStreak}-day streak. Keep it up!
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12" style={{ color: 'var(--structured-muted-fg)' }}>
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
      <footer className="border-t border-structured-border mt-16" style={{ backgroundColor: 'var(--structured-card)' }}>
        <div className="container-pro py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--structured-muted-fg)' }}>
            <div>© 2024 FinanceQuest Pro. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-structured-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-structured-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-structured-primary transition-colors">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
