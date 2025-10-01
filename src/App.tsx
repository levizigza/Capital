import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Coins, Trophy, Users, Target, BookOpen, Star, Brain, ChartLine, 
  GameController, Lightning, TrendUp, Medal, Fire, Clock
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
    <div className="min-h-screen bg-background">
      {/* Advanced Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-xl shadow-lg">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  FinanceQuest Pro
                </h1>
                <p className="text-sm text-muted-foreground">Advanced Financial Gaming Platform</p>
              </div>
            </div>
            
            {userProfile?.name && (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-semibold text-lg">Hi, {userProfile.name}!</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Medal className="w-4 h-4" />
                    <span>Level {userProfile.level}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <Fire className="w-4 h-4 text-orange-500" />
                    <span>{userProfile.currentStreak} streak</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full">
                    <Coins className="w-5 h-5 text-accent" />
                    <span className="font-bold text-accent">{userProfile.totalCoins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <TrendUp className="w-5 h-5 text-primary" />
                    <span className="font-bold text-primary">{userProfile.xp} XP</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Level Progress Bar */}
          {userProfile?.name && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {userProfile.level} Progress</span>
                <span>{currentLevelXP}/{xpForNextLevel} XP</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
        </div>
      </header>

      {/* Mini Game Hub Modal */}
      {isPlaying && (
        <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GameController className="w-6 h-6" />
                Financial Mini-Games
              </DialogTitle>
            </DialogHeader>
            <MiniGameHub
              onGameComplete={completeGame}
              onExit={() => setIsPlaying(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="games">Mini-Games</TabsTrigger>
            <TabsTrigger value="challenges">Daily Challenges</TabsTrigger>
            <TabsTrigger value="progress">Analytics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎮</div>
              <h3 className="text-2xl font-bold">Financial Learning Games</h3>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Master money management through fun, interactive mini-games that teach real financial skills.
              </p>
              <Button 
                size="lg"
                onClick={() => setIsPlaying(true)}
                className="text-lg px-8 py-3"
              >
                <GameController className="w-6 h-6 mr-2" />
                Play Mini-Games
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">⚖️</div>
                  <h4 className="font-semibold mb-2">Budget Balance</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn to allocate income across expense categories
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">📈</div>
                  <h4 className="font-semibold mb-2">Investment Tower</h4>
                  <p className="text-sm text-muted-foreground">
                    Build wealth by stacking different investments
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">💳</div>
                  <h4 className="font-semibold mb-2">Credit Memory</h4>
                  <p className="text-sm text-muted-foreground">
                    Match credit cards with their features
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">🧮</div>
                  <h4 className="font-semibold mb-2">Compound Growth</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize the magic of compound interest
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚡</div>
              <h3 className="text-2xl font-bold">Daily Challenges</h3>
              <p className="text-muted-foreground">
                New financial challenges refresh daily to keep your skills sharp!
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Lightning className="w-8 h-8 text-amber-500" />
                    <Badge className="bg-green-100 text-green-800">Easy</Badge>
                  </div>
                  <CardTitle>Quick Budget Challenge</CardTitle>
                  <CardDescription>Balance a budget in under 60 seconds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Time Limit:</strong> 1 minute
                    </div>
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Lightning className="w-8 h-8 text-amber-500" />
                    <Badge className="bg-blue-100 text-blue-800">Medium</Badge>
                  </div>
                  <CardTitle>Investment Speed Run</CardTitle>
                  <CardDescription>Build a diversified portfolio quickly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Time Limit:</strong> 2 minutes
                    </div>
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{userProfile?.gamesCompleted || 0}</p>
                      <p className="text-sm text-muted-foreground">Scenarios Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">{userProfile?.currentStreak || 0}</p>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Level Progress</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {(gameScores?.length || 0) === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No games played yet. Start with a beginner scenario!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(gameScores || []).slice(-5).reverse().map((score, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <span className="font-medium capitalize">{score.gameId.replace('-', ' ')}</span>
                            <div className="text-xs text-muted-foreground">
                              {score.finalNetWorth ? `Net Worth: $${score.finalNetWorth.toLocaleString()}` : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-accent font-semibold">+{score.score}</span>
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(score.timeSpent / 60000)}m {Math.floor((score.timeSpent % 60000) / 1000)}s
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Financial Planning</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Investment Strategy</span>
                      <div className="flex items-center gap-2">
                        <Progress value={60} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">60%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Management</span>
                      <div className="flex items-center gap-2">
                        <Progress value={45} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Business Acumen</span>
                      <div className="flex items-center gap-2">
                        <Progress value={30} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">30%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[
                { name: 'First Steps', description: 'Complete your first advanced scenario', unlocked: (userProfile?.gamesCompleted || 0) >= 1, rarity: 'common' },
                { name: 'Wealth Builder', description: 'Achieve $100K net worth in any scenario', unlocked: (gameScores || []).some(score => (score.finalNetWorth || 0) >= 100000), rarity: 'rare' },
                { name: 'Level Master', description: 'Reach level 10', unlocked: (userProfile?.level || 1) >= 10, rarity: 'epic' },
                { name: 'Streak Legend', description: 'Maintain a 10-game win streak', unlocked: (userProfile?.currentStreak || 0) >= 10, rarity: 'legendary' },
                { name: 'Scenario Explorer', description: 'Complete all scenario types', unlocked: new Set((gameScores || []).map(s => s.gameId)).size >= 3, rarity: 'epic' },
                { name: 'Financial Guru', description: 'Earn 10,000 coins total', unlocked: (userProfile?.totalCoins || 0) >= 10000, rarity: 'legendary' },
                { name: 'Crisis Survivor', description: 'Successfully navigate a crisis scenario', unlocked: (gameScores || []).some(score => score.gameId.includes('crisis') && score.completed), rarity: 'rare' },
                { name: 'Entrepreneur', description: 'Complete a business management scenario', unlocked: (gameScores || []).some(score => score.gameId.includes('startup') && score.completed), rarity: 'epic' }
              ].map((achievement, index) => {
                const rarityColors = {
                  common: 'bg-gray-100 text-gray-800 border-gray-200',
                  rare: 'bg-blue-100 text-blue-800 border-blue-200',
                  epic: 'bg-purple-100 text-purple-800 border-purple-200',
                  legendary: 'bg-amber-100 text-amber-800 border-amber-200'
                }
                
                return (
                  <Card key={index} className={`${achievement.unlocked ? rarityColors[achievement.rarity as keyof typeof rarityColors] + ' shadow-md' : 'opacity-50'}`}>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">
                        {achievement.unlocked ? (
                          achievement.rarity === 'legendary' ? '🏆' : 
                          achievement.rarity === 'epic' ? '🥇' :
                          achievement.rarity === 'rare' ? '🥈' : '🥉'
                        ) : '🔒'}
                      </div>
                      <h3 className="font-semibold text-sm">{achievement.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {achievement.rarity}
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App