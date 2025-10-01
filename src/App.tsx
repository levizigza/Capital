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
import { AdvancedGameEngine } from './game/components/AdvancedGameEngine'
import { advancedScenarios, dailyChallenges, multiplayerChallenges } from './data/gameData'
import type { GameScenario } from './data/gameData'
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
  const [currentScenario, setCurrentScenario] = useState<GameScenario | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Calculate level from XP with exponential scaling
  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, (userProfile?.level || 1) - 1))
  const currentLevelXP = (userProfile?.xp || 0) % xpForNextLevel
  const progressPercent = (currentLevelXP / xpForNextLevel) * 100

  // Advanced game completion handler
  const completeGame = (scenarioId: string, results: GameResults) => {
    const newScore: GameScore = {
      gameId: scenarioId,
      score: results.coinsEarned,
      completed: results.success,
      timeSpent: results.timeSpent,
      date: new Date().toISOString(),
      difficulty: userProfile?.preferences.difficulty || 'adaptive',
      finalNetWorth: results.finalNetWorth,
      decisions: results.decisions
    }

    setGameScores(prevScores => [...(prevScores || []), newScore])
    
    setUserProfile(prevProfile => {
      if (!prevProfile) {
        const defaultProfile: UserProfile = {
          name: 'Anonymous',
          level: 1,
          xp: results.xpEarned,
          totalCoins: results.coinsEarned,
          gamesCompleted: 1,
          achievements: results.achievementsUnlocked,
          currentStreak: results.success ? 1 : 0,
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
      
      const newXP = prevProfile.xp + results.xpEarned
      const newLevel = Math.floor(newXP / 100) + 1
      const leveledUp = newLevel > prevProfile.level

      if (leveledUp) {
        toast.success(`Level Up! You're now level ${newLevel}!`, {
          duration: 3000,
        })
      }

      // Check for new achievements
      const newAchievements = [...(prevProfile.achievements || [])]
      results.achievementsUnlocked.forEach(achievement => {
        if (!newAchievements.includes(achievement)) {
          newAchievements.push(achievement)
        }
      })

      return {
        ...prevProfile,
        xp: newXP,
        level: newLevel,
        totalCoins: prevProfile.totalCoins + results.coinsEarned,
        gamesCompleted: prevProfile.gamesCompleted + 1,
        currentStreak: results.success ? prevProfile.currentStreak + 1 : 0,
        achievements: newAchievements
      }
    })

    toast.success(
      results.success ? 'Game Completed Successfully!' : 'Game Completed',
      {
        description: `+${results.coinsEarned} coins, +${results.xpEarned} XP, Net Worth: $${results.finalNetWorth.toLocaleString()}`
      }
    )
    
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

  // Get recommended scenarios based on user progress
  const getRecommendedScenarios = () => {
    const userLevel = userProfile?.level || 1
    const completedGames = new Set((gameScores || []).map(score => score.gameId))
    
    return advancedScenarios.filter(scenario => {
      // Check if user meets prerequisites
      const meetsPrereqs = scenario.prerequisites.every(prereq => 
        (userProfile?.skillsUnlocked || []).includes(prereq) || completedGames.has(prereq)
      )
      
      // Check difficulty appropriateness
      const difficultyLevel = {
        'beginner': 1,
        'intermediate': 3,
        'advanced': 6,
        'expert': 10
      }
      
      return meetsPrereqs && userLevel >= (difficultyLevel[scenario.difficulty] || 1)
    })
  }

  const recommendedScenarios = getRecommendedScenarios()

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'life_simulation': return <Users className="w-6 h-6" />
      case 'market_trading': return <ChartLine className="w-6 h-6" />
      case 'business_management': return <Target className="w-6 h-6" />
      case 'crisis_management': return <Lightning className="w-6 h-6" />
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

      {/* Game Engine Modal */}
      {currentScenario && isPlaying && (
        <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getCategoryIcon(currentScenario.category)}
                {currentScenario.title}
              </DialogTitle>
            </DialogHeader>
            <AdvancedGameEngine
              scenario={currentScenario}
              playerId={userProfile?.name || 'anonymous'}
              onComplete={(results) => completeGame(currentScenario.id, results)}
              onExit={() => {
                setCurrentScenario(null)
                setIsPlaying(false)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="scenarios">Advanced Scenarios</TabsTrigger>
            <TabsTrigger value="challenges">Daily Challenges</TabsTrigger>
            <TabsTrigger value="multiplayer">Multiplayer</TabsTrigger>
            <TabsTrigger value="progress">Analytics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {recommendedScenarios.map((scenario) => (
                <Card key={scenario.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-br from-card to-muted`}>
                        {getCategoryIcon(scenario.category)}
                      </div>
                      <Badge className={getDifficultyColor(scenario.difficulty)}>
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{scenario.title}</CardTitle>
                    <CardDescription className="text-base">{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{scenario.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>+{scenario.rewards.xp} XP</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Learning Objectives:</h4>
                        <ScrollArea className="max-h-20">
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {scenario.learningObjectives.slice(0, 3).map((objective, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setCurrentScenario(scenario)
                          setIsPlaying(true)
                        }}
                      >
                        Start Advanced Scenario
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {dailyChallenges.map((challenge, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Lightning className="w-8 h-8 text-amber-500" />
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <CardTitle>{challenge.name}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <strong>Time Limit:</strong> {Math.floor(challenge.timeLimit / 60000)} minutes
                      </div>
                      <div className="space-y-1">
                        <strong className="text-sm">Rules:</strong>
                        {challenge.rules.map((rule, ruleIndex) => (
                          <div key={ruleIndex} className="text-sm text-muted-foreground">
                            • {rule}
                          </div>
                        ))}
                      </div>
                      <Button className="w-full" variant="outline">
                        Start Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="multiplayer" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {multiplayerChallenges.map((challenge, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Users className="w-8 h-8 text-primary" />
                      <Badge variant="secondary">{challenge.players} players</Badge>
                    </div>
                    <CardTitle>{challenge.name}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>Duration:</strong> {challenge.duration}
                      </div>
                      <div className="space-y-1">
                        <strong className="text-sm">Roles:</strong>
                        <div className="flex flex-wrap gap-1">
                          {challenge.roles.map((role, roleIndex) => (
                            <Badge key={roleIndex} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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