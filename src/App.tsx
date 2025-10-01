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
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  FinanceQuest Pro
                </h1>
                <p className="text-sm text-gray-600">Professional Financial Learning Platform</p>
              </div>
            </div>
            
            {userProfile?.name && (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-medium text-gray-900">Welcome, {userProfile.name}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Medal className="w-4 h-4" />
                      <span>Level {userProfile.level}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1">
                      <Fire className="w-4 h-4 text-orange-500" />
                      <span>{userProfile.currentStreak} day streak</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Coins className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">{userProfile.totalCoins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <TrendUp className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">{userProfile.xp} XP</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Level Progress Bar */}
          {userProfile?.name && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Level {userProfile.level} Progress</span>
                <span>{currentLevelXP}/{xpForNextLevel} XP</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-gray-100" />
            </div>
          )}
        </div>
      </header>

      {/* Professional Mini Game Hub Modal */}
      {isPlaying && (
        <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0 border-0">
            <ProfessionalGameHub
              onGameComplete={completeGame}
              onExit={() => setIsPlaying(false)}
              userTier="middle" // This could be dynamic based on user profile
            />
          </DialogContent>
        </Dialog>
      )}

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
              <TabsTrigger value="games" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Games</TabsTrigger>
              <TabsTrigger value="challenges" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Challenges</TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Progress</TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Achievements</TabsTrigger>
            </TabsList>

          <TabsContent value="games" className="space-y-8">
            <div className="text-center space-y-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">Interactive Financial Learning Games</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Master essential financial skills through engaging, interactive games that adapt to your learning style and age group.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">🎯 Skill-Based Learning</Badge>
                <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">📊 Real-Time Feedback</Badge>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-4 py-2">🎮 Interactive Gameplay</Badge>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-4 py-2">🏆 Achievement System</Badge>
              </div>
              
              <Button 
                size="lg"
                onClick={() => setIsPlaying(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium shadow-md"
              >
                <GameController className="w-5 h-5 mr-2" />
                Start Learning Games
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Coins className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">Coin Catcher</h4>
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700">Easy</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Catch falling coins while avoiding expenses in this fast-paced savings game that teaches smart spending decisions.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Saving Skills</Badge>
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Quick Math</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calculator className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">Budget Balancer</h4>
                      <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">Medium</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Balance your monthly budget by categorizing expenses and making smart financial decisions.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Budgeting</Badge>
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Planning</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">Investment Tower</h4>
                      <Badge variant="outline" className="text-xs border-red-200 text-red-700">Hard</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Build your investment portfolio by stacking different asset blocks strategically to maximize returns.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Investing</Badge>
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Strategy</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Daily Financial Challenges</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Test your financial skills with fresh challenges that reset daily. Build consistent learning habits and track your improvement over time.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Lightning className="w-6 h-6 text-green-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Beginner</Badge>
                  </div>
                  <CardTitle className="text-lg text-gray-900 mt-3">Quick Budget Challenge</CardTitle>
                  <p className="text-gray-600 text-sm">Balance a simple budget in under 60 seconds</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <strong>Time Limit:</strong> 1 minute
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">Intermediate</Badge>
                  </div>
                  <CardTitle className="text-lg text-gray-900 mt-3">Investment Speed Run</CardTitle>
                  <p className="text-gray-600 text-sm">Build a diversified portfolio quickly and efficiently</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <strong>Time Limit:</strong> 2 minutes
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-white shadow-md border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-lg">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{userProfile?.gamesCompleted || 0}</p>
                      <p className="text-sm text-gray-600">Games Completed</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{userProfile?.currentStreak || 0}</p>
                      <p className="text-sm text-gray-600">Day Streak</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Level Progress</span>
                      <span className="text-gray-600">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="w-full h-2 bg-gray-100" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-lg">Recent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {(gameScores?.length || 0) === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-3">🎯</div>
                      <p className="text-gray-500 text-sm">No games completed yet</p>
                      <p className="text-gray-400 text-xs mt-1">Start with a learning game!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(gameScores || []).slice(-5).reverse().map((score, index) => (
                        <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                          <div>
                            <span className="font-medium text-gray-900 capitalize">{score.gameId.replace('-', ' ')}</span>
                            <div className="text-xs text-gray-500">
                              {score.finalNetWorth ? `Result: $${score.finalNetWorth.toLocaleString()}` : `Score: ${score.score}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-green-600 font-semibold">+{score.score}</span>
                            <div className="text-xs text-gray-500">
                              {Math.floor(score.timeSpent / 60000)}:{String(Math.floor((score.timeSpent % 60000) / 1000)).padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-lg">Skill Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Financial Planning</span>
                      <div className="flex items-center gap-3">
                        <Progress value={75} className="w-20 h-2 bg-gray-100" />
                        <span className="text-sm text-gray-600 w-8">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Investment Strategy</span>
                      <div className="flex items-center gap-3">
                        <Progress value={60} className="w-20 h-2 bg-gray-100" />
                        <span className="text-sm text-gray-600 w-8">60%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Risk Management</span>
                      <div className="flex items-center gap-3">
                        <Progress value={45} className="w-20 h-2 bg-gray-100" />
                        <span className="text-sm text-gray-600 w-8">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Business Skills</span>
                      <div className="flex items-center gap-3">
                        <Progress value={30} className="w-20 h-2 bg-gray-100" />
                        <span className="text-sm text-gray-600 w-8">30%</span>
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
    </div>
  )
}

export default App