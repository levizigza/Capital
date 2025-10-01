import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Coins, Trophy, Users, Target, BookOpen, Star, Brain, ChartLine, 
  GameController, Lightning, TrendUp, Medal, Fire, Clock, Calculator
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MiniGameHub } from './game/components/MiniGameHub'
import { ProfessionalGameHub } from './game/components/ProfessionalGameHub'
import { toast } from 'sonner'

interface UserProfile {
  name: string
  level: number
  xp: number
  totalCoins: number
  gamesCompleted: number
  achievements: string[]
  currentStreak: number
  skillsUnlocked: string[]
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | null
  preferences: {
    difficulty: 'adaptive' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
    gameTypes: string[]
    playTime: 'short' | 'medium' | 'long'
  }
}

interface GameScore {
  gameId: string
  score: number
  completed: boolean
  timeSpent: number
  date: string
  difficulty: string
  finalNetWorth?: number
  decisions: Array<{
    eventId: string
    choice: number
    outcome: string
  }>
}

interface GameResults {
  success: boolean
  finalNetWorth: number
  xpEarned: number
  coinsEarned: number
  achievementsUnlocked: string[]
  timeSpent: number
  decisions: Array<{
    eventId: string
    choice: number
    outcome: string
  }>
}

function App() {
  const [userProfile, setUserProfile] = useKV<UserProfile>('user-profile', {
    name: '',
    level: 1,
    xp: 0,
    totalCoins: 0,
    gamesCompleted: 0,
    achievements: [],
    currentStreak: 0,
    skillsUnlocked: [],
    learningStyle: null,
    preferences: {
      difficulty: 'adaptive',
      gameTypes: [],
      playTime: 'medium'
    }
  })

  const [gameScores, setGameScores] = useKV<GameScore[]>('game-scores', [])
  const [currentScenario, setCurrentScenario] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Calculate level from XP with exponential scaling
  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, (userProfile?.level || 1) - 1))
  const currentLevelXP = (userProfile?.xp || 0) % xpForNextLevel
  const progressPercent = (currentLevelXP / xpForNextLevel) * 100

  // Mini-game completion handler
  const completeGame = (gameId: string, score: number, timeSpent: number, additionalData?: any) => {
    const newScore: GameScore = {
      gameId: gameId,
      score: score,
      completed: true,
      timeSpent: timeSpent,
      date: new Date().toISOString(),
      difficulty: userProfile?.preferences.difficulty || 'adaptive',
      finalNetWorth: additionalData?.finalAmount || 0,
      decisions: []
    }

    setGameScores(prevScores => [...(prevScores || []), newScore])
    
    // Calculate XP and coins based on score
    const xpEarned = Math.floor(score * 0.5) + 50 // Base XP + score bonus
    const coinsEarned = Math.floor(score * 0.3) + 25 // Base coins + score bonus
    
    setUserProfile(prevProfile => {
      if (!prevProfile) {
        const defaultProfile: UserProfile = {
          name: 'Anonymous',
          level: 1,
          xp: xpEarned,
          totalCoins: coinsEarned,
          gamesCompleted: 1,
          achievements: [],
          currentStreak: 1,
          skillsUnlocked: [],
          learningStyle: null,
          preferences: {
            difficulty: 'adaptive',
            gameTypes: [],
            playTime: 'medium'
          }
        }
        return defaultProfile
      }
      
      const newXP = prevProfile.xp + xpEarned
      const newLevel = Math.floor(newXP / 100) + 1
      const leveledUp = newLevel > prevProfile.level

      if (leveledUp) {
        toast.success(`Level Up! You're now level ${newLevel}!`, {
          duration: 3000,
        })
      }

      return {
        ...prevProfile,
        xp: newXP,
        level: newLevel,
        totalCoins: prevProfile.totalCoins + coinsEarned,
        gamesCompleted: prevProfile.gamesCompleted + 1,
        currentStreak: prevProfile.currentStreak + 1,
        achievements: prevProfile.achievements
      }
    })

    toast.success('Game Completed Successfully!', {
      description: `+${coinsEarned} coins, +${xpEarned} XP, Score: ${score}`
    })
    
    setCurrentScenario(null)
    setIsPlaying(false)
  }

  // Onboarding for new users
  useEffect(() => {
    if (!userProfile?.name) {
      const name = prompt("Welcome to FinanceQuest Pro! What's your name?")
      if (name) {
        const defaultProfile: UserProfile = {
          name,
          level: 1,
          xp: 0,
          totalCoins: 0,
          gamesCompleted: 0,
          achievements: [],
          currentStreak: 0,
          skillsUnlocked: [],
          learningStyle: null,
          preferences: {
            difficulty: 'adaptive',
            gameTypes: [],
            playTime: 'medium'
          }
        }
        
        setUserProfile(defaultProfile)
        toast.success(`Welcome, ${name}! Ready to master finance through advanced gameplay?`)
      }
    }
  }, [userProfile?.name, setUserProfile])

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budgeting': return <Users className="w-6 h-6" />
      case 'investing': return <ChartLine className="w-6 h-6" />
      case 'credit': return <Target className="w-6 h-6" />
      case 'savings': return <Lightning className="w-6 h-6" />
      default: return <GameController className="w-6 h-6" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Modern Gaming Header */}
      <header className="glass-card border-b-0 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="gradient-primary p-3 rounded-2xl shadow-lg">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient-primary">
                  FinanceQuest Pro
                </h1>
                <p className="text-base font-medium text-muted-foreground">
                  Interactive Financial Learning Platform
                </p>
              </div>
            </div>
            
            {userProfile?.name && (
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">Welcome back, {userProfile.name}</p>
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Medal className="w-4 h-4 text-accent" />
                      <span>Level {userProfile.level}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      <Fire className="w-4 h-4 text-orange-500" />
                      <span>{userProfile.currentStreak} day streak</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 glass-card border border-accent/20 rounded-xl">
                    <Coins className="w-5 h-5 text-accent" />
                    <span className="text-lg font-bold text-accent">
                      {userProfile.totalCoins.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 glass-card border border-primary/20 rounded-xl">
                    <TrendUp className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-primary">
                      {userProfile.xp} XP
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Level Progress Bar */}
          {userProfile?.name && (
            <div className="mt-6">
              <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-3">
                <span>Level {userProfile.level} Progress</span>
                <span className="text-primary font-semibold">
                  {currentLevelXP}/{xpForNextLevel} XP
                </span>
              </div>
              <div className="enhanced-progress h-3 rounded-full overflow-hidden">
                <Progress 
                  value={progressPercent} 
                  className="h-full bg-transparent [&>div]:gradient-primary [&>div]:rounded-full" 
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Gaming Modal with Enhanced Styling */}
      {isPlaying && (
        <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0 border-0 glass-card shadow-2xl">
            <ProfessionalGameHub
              onGameComplete={completeGame}
              onExit={() => setIsPlaying(false)}
              userTier="middle"
            />
          </DialogContent>
        </Dialog>
      )}

      <div className="min-h-screen pt-8">
        <div className="container mx-auto px-6 pb-12">
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-card border shadow-lg h-14 p-1 mb-8">
              <TabsTrigger 
                value="games" 
                className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold text-base rounded-lg transition-all duration-200"
              >
                <GameController className="w-5 h-5 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger 
                value="challenges" 
                className="data-[state=active]:gradient-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-md font-semibold text-base rounded-lg transition-all duration-200"
              >
                <Target className="w-5 h-5 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:gradient-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md font-semibold text-base rounded-lg transition-all duration-200"
              >
                <ChartLine className="w-5 h-5 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="data-[state=active]:gradient-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md font-semibold text-base rounded-lg transition-all duration-200"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Achievements
              </TabsTrigger>
            </TabsList>

          <TabsContent value="games" className="space-y-10">
            <div className="text-center space-y-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-gradient-primary mb-6">
                  Interactive Financial Learning Games
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Master essential financial skills through engaging, interactive games that adapt to your learning style and experience level.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <Badge className="badge-gaming px-6 py-3 text-base">
                  🎯 Skill-Based Learning
                </Badge>
                <Badge className="badge-gaming px-6 py-3 text-base">
                  📊 Real-Time Feedback
                </Badge>
                <Badge className="badge-gaming px-6 py-3 text-base">
                  🎮 Interactive Gameplay
                </Badge>
                <Badge className="badge-achievement px-6 py-3 text-base">
                  🏆 Achievement System
                </Badge>
              </div>
              
              <Button 
                size="lg"
                onClick={() => setIsPlaying(true)}
                className="btn-primary-gaming px-10 py-6 text-xl font-bold shadow-2xl hover:shadow-accent/25 transition-all duration-300"
              >
                <GameController className="w-6 h-6 mr-3" />
                Start Learning Adventure
              </Button>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="interactive-card glass-card border-l-4 border-l-accent shadow-lg hover:shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="gradient-accent p-3 rounded-2xl shadow-md">
                      <Coins className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-foreground">Coin Catcher</h4>
                      <Badge className="badge-gaming mt-1">Easy • 2-3 min</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                    Catch falling coins while avoiding expenses in this fast-paced savings game that teaches smart spending decisions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">Saving Skills</Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">Quick Math</Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">Decision Making</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="interactive-card glass-card border-l-4 border-l-primary shadow-lg hover:shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="gradient-primary p-3 rounded-2xl shadow-md">
                      <Calculator className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-foreground">Budget Balancer</h4>
                      <Badge className="badge-gaming mt-1">Medium • 3-5 min</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                    Balance your monthly budget by categorizing expenses and making smart financial decisions through interactive gameplay.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">Budgeting</Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">Planning</Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">Analysis</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="interactive-card glass-card border-l-4 border-l-secondary shadow-lg hover:shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="gradient-secondary p-3 rounded-2xl shadow-md">
                      <TrendUp className="w-7 h-7 text-secondary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-foreground">Investment Tower</h4>
                      <Badge className="badge-gaming mt-1">Hard • 5-7 min</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                    Build your investment portfolio by stacking different asset blocks strategically to maximize returns and minimize risk.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">Investing</Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">Strategy</Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">Risk Management</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-10">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-gradient-primary">Daily Financial Challenges</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Test your financial skills with fresh challenges that reset daily. Build consistent learning habits and track your improvement over time.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="interactive-card glass-card category-savings shadow-lg hover:shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="gradient-secondary p-3 rounded-2xl shadow-md">
                      <Lightning className="w-7 h-7 text-secondary-foreground" />
                    </div>
                    <Badge className="badge-gaming">Beginner</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Quick Budget Challenge</CardTitle>
                  <p className="text-muted-foreground">Balance a simple budget in under 60 seconds</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-5 h-5" />
                      <strong className="text-foreground">Time Limit:</strong> 1 minute
                    </div>
                    <Button className="w-full btn-secondary-gaming" disabled>
                      <Star className="w-4 h-4 mr-2" />
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="interactive-card glass-card category-investing shadow-lg hover:shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="gradient-primary p-3 rounded-2xl shadow-md">
                      <TrendUp className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <Badge className="badge-achievement">Intermediate</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Investment Speed Run</CardTitle>
                  <p className="text-muted-foreground">Build a diversified portfolio quickly and efficiently</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-5 h-5" />
                      <strong className="text-foreground">Time Limit:</strong> 2 minutes
                    </div>
                    <Button className="w-full btn-primary-gaming" disabled>
                      <Target className="w-4 h-4 mr-2" />
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-10">
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="glass-card shadow-lg border-l-4 border-l-primary">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                    <ChartLine className="w-6 h-6 text-primary" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 glass-card rounded-2xl border border-primary/20">
                      <p className="text-3xl font-bold text-primary mb-2">{userProfile?.gamesCompleted || 0}</p>
                      <p className="text-sm font-medium text-muted-foreground">Games Completed</p>
                    </div>
                    <div className="text-center p-4 glass-card rounded-2xl border border-secondary/20">
                      <p className="text-3xl font-bold text-secondary mb-2">{userProfile?.currentStreak || 0}</p>
                      <p className="text-sm font-medium text-muted-foreground">Day Streak</p>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-foreground">Level Progress</span>
                      <span className="text-gradient-accent font-bold">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="enhanced-progress h-3 rounded-full overflow-hidden">
                      <Progress 
                        value={progressPercent} 
                        className="h-full bg-transparent [&>div]:gradient-accent [&>div]:rounded-full" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card shadow-lg border-l-4 border-l-accent">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-accent" />
                    Recent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(gameScores?.length || 0) === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4 opacity-50">🎯</div>
                      <p className="text-muted-foreground font-medium">No games completed yet</p>
                      <p className="text-muted-foreground text-sm mt-2">Start your learning adventure!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(gameScores || []).slice(-5).reverse().map((score, index) => (
                        <div key={index} className="flex justify-between items-center py-4 px-4 glass-card rounded-xl border border-border/50">
                          <div>
                            <span className="font-semibold text-foreground capitalize">
                              {score.gameId.replace('-', ' ')}
                            </span>
                            <div className="text-sm text-muted-foreground">
                              {score.finalNetWorth ? `Result: $${score.finalNetWorth.toLocaleString()}` : `Score: ${score.score}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-secondary font-bold text-lg">+{score.score}</span>
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(score.timeSpent / 60000)}:{String(Math.floor((score.timeSpent % 60000) / 1000)).padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card shadow-lg border-l-4 border-l-secondary">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-secondary" />
                    Skill Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Financial Planning</span>
                        <span className="text-sm font-bold text-primary">75%</span>
                      </div>
                      <div className="enhanced-progress h-2 rounded-full overflow-hidden">
                        <Progress 
                          value={75} 
                          className="h-full bg-transparent [&>div]:gradient-primary [&>div]:rounded-full" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Investment Strategy</span>
                        <span className="text-sm font-bold text-secondary">60%</span>
                      </div>
                      <div className="enhanced-progress h-2 rounded-full overflow-hidden">
                        <Progress 
                          value={60} 
                          className="h-full bg-transparent [&>div]:gradient-secondary [&>div]:rounded-full" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Risk Management</span>
                        <span className="text-sm font-bold text-accent">45%</span>
                      </div>
                      <div className="enhanced-progress h-2 rounded-full overflow-hidden">
                        <Progress 
                          value={45} 
                          className="h-full bg-transparent [&>div]:gradient-accent [&>div]:rounded-full" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">Business Skills</span>
                        <span className="text-sm font-bold text-muted-foreground">30%</span>
                      </div>
                      <div className="enhanced-progress h-2 rounded-full overflow-hidden">
                        <Progress 
                          value={30} 
                          className="h-full bg-transparent [&>div]:bg-muted-foreground [&>div]:rounded-full" 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gradient-primary mb-4">Achievement Gallery</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Track your financial learning milestones and unlock prestigious badges as you master each skill area.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {[
                { 
                  name: 'First Steps', 
                  description: 'Complete your first learning game', 
                  unlocked: (userProfile?.gamesCompleted || 0) >= 1, 
                  rarity: 'common',
                  icon: '🎯'
                },
                { 
                  name: 'Wealth Builder', 
                  description: 'Achieve $100K net worth in any scenario', 
                  unlocked: (gameScores || []).some(score => (score.finalNetWorth || 0) >= 100000), 
                  rarity: 'rare',
                  icon: '💰'
                },
                { 
                  name: 'Level Master', 
                  description: 'Reach level 10 in your learning journey', 
                  unlocked: (userProfile?.level || 1) >= 10, 
                  rarity: 'epic',
                  icon: '🏆'
                },
                { 
                  name: 'Streak Legend', 
                  description: 'Maintain a 10-day learning streak', 
                  unlocked: (userProfile?.currentStreak || 0) >= 10, 
                  rarity: 'legendary',
                  icon: '⚡'
                },
                { 
                  name: 'Game Explorer', 
                  description: 'Complete all available game types', 
                  unlocked: new Set((gameScores || []).map(s => s.gameId)).size >= 3, 
                  rarity: 'epic',
                  icon: '🎮'
                },
                { 
                  name: 'Financial Guru', 
                  description: 'Earn 10,000 coins total', 
                  unlocked: (userProfile?.totalCoins || 0) >= 10000, 
                  rarity: 'legendary',
                  icon: '🧠'
                },
                { 
                  name: 'Crisis Survivor', 
                  description: 'Successfully navigate a crisis scenario', 
                  unlocked: (gameScores || []).some(score => score.gameId.includes('crisis') && score.completed), 
                  rarity: 'rare',
                  icon: '🛡️'
                },
                { 
                  name: 'Entrepreneur', 
                  description: 'Complete a business management scenario', 
                  unlocked: (gameScores || []).some(score => score.gameId.includes('startup') && score.completed), 
                  rarity: 'epic',
                  icon: '🚀'
                }
              ].map((achievement, index) => {
                const rarityStyles = {
                  common: 'glass-card border-muted-foreground/20',
                  rare: 'glass-card border-primary/30 bg-primary/5',
                  epic: 'glass-card border-secondary/30 bg-secondary/5',
                  legendary: 'glass-card border-accent/30 bg-accent/5'
                }
                
                const rarityColors = {
                  common: 'text-muted-foreground',
                  rare: 'text-primary',
                  epic: 'text-secondary', 
                  legendary: 'text-accent'
                }
                
                return (
                  <Card 
                    key={index} 
                    className={`${rarityStyles[achievement.rarity as keyof typeof rarityStyles]} ${
                      achievement.unlocked 
                        ? 'shadow-lg hover:shadow-xl interactive-card' 
                        : 'opacity-60 grayscale'
                    } transition-all duration-300`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-4">
                        {achievement.unlocked ? achievement.icon : '🔒'}
                      </div>
                      <h3 className="font-bold text-lg text-foreground mb-2">
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {achievement.description}
                      </p>
                      <Badge 
                        className={`${rarityColors[achievement.rarity as keyof typeof rarityColors]} font-semibold capitalize`}
                        variant="outline"
                      >
                        {achievement.rarity}
                      </Badge>
                      {achievement.unlocked && (
                        <div className="mt-3">
                          <Badge className="badge-achievement text-xs">
                            ✓ Unlocked
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  )
}

export default App