import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Coins, Trophy, Users, Target, BookOpen, Star } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface UserProfile {
  name: string
  level: number
  xp: number
  totalCoins: number
  gamesCompleted: number
  achievements: string[]
  currentStreak: number
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | null
}

interface GameScore {
  gameId: string
  score: number
  completed: boolean
  timeSpent: number
  date: string
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
    learningStyle: null
  })

  const [gameScores, setGameScores] = useKV<GameScore[]>('game-scores', [])
  const [currentGame, setCurrentGame] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Calculate level from XP - provide defaults if userProfile is undefined
  const xpForNextLevel = (userProfile?.level || 1) * 100
  const currentLevelXP = (userProfile?.xp || 0) % 100
  const progressPercent = (currentLevelXP / xpForNextLevel) * 100

  // Game completion handler
  const completeGame = (gameId: string, earnedCoins: number, earnedXP: number) => {
    const newScore: GameScore = {
      gameId,
      score: earnedCoins,
      completed: true,
      timeSpent: Math.floor(Math.random() * 300) + 60, // Simulated time
      date: new Date().toISOString()
    }

    setGameScores(prevScores => [...(prevScores || []), newScore])
    
    setUserProfile(prevProfile => {
      const profile = prevProfile || {
        name: '',
        level: 1,
        xp: 0,
        totalCoins: 0,
        gamesCompleted: 0,
        achievements: [],
        currentStreak: 0,
        learningStyle: null
      }
      
      const newXP = profile.xp + earnedXP
      const newLevel = Math.floor(newXP / 100) + 1
      const leveledUp = newLevel > profile.level

      if (leveledUp) {
        toast.success(`Level Up! You're now level ${newLevel}!`, {
          duration: 3000,
        })
      }

      return {
        ...profile,
        xp: newXP,
        level: newLevel,
        totalCoins: profile.totalCoins + earnedCoins,
        gamesCompleted: profile.gamesCompleted + 1,
        currentStreak: profile.currentStreak + 1
      }
    })

    toast.success(`Game completed! +${earnedCoins} coins, +${earnedXP} XP`)
    setCurrentGame(null)
    setIsPlaying(false)
  }

  // Onboarding for new users
  useEffect(() => {
    if (!userProfile?.name) {
      const name = prompt("Welcome to FinanceQuest! What's your name?")
      if (name) {
        setUserProfile(prev => ({ 
          ...(prev || {
            name: '',
            level: 1,
            xp: 0,
            totalCoins: 0,
            gamesCompleted: 0,
            achievements: [],
            currentStreak: 0,
            learningStyle: null
          }), 
          name 
        }))
        toast.success(`Welcome, ${name}! Let's start learning about money!`)
      }
    }
  }, [userProfile?.name, setUserProfile])

  // Mini-games based on top-rated board games
  const games = [
    {
      id: 'allowance-game',
      title: 'Allowance Adventure',
      description: 'Earn money by doing chores and learn to save vs spend',
      difficulty: 'Beginner',
      estimatedTime: '5-10 min',
      icon: <Coins className="w-8 h-8" />,
      color: 'bg-green-100 text-green-800',
      baseCoins: 10,
      baseXP: 25
    },
    {
      id: 'payday-challenge',
      title: 'PayDay Challenge',
      description: 'Manage monthly income, pay bills, and budget wisely',
      difficulty: 'Intermediate',
      estimatedTime: '10-15 min',
      icon: <Target className="w-8 h-8" />,
      color: 'bg-blue-100 text-blue-800',
      baseCoins: 20,
      baseXP: 50
    },
    {
      id: 'property-tycoon',
      title: 'Property Tycoon',
      description: 'Buy, sell, and trade properties like in Monopoly',
      difficulty: 'Advanced',
      estimatedTime: '15-20 min',
      icon: <Trophy className="w-8 h-8" />,
      color: 'bg-purple-100 text-purple-800',
      baseCoins: 30,
      baseXP: 75
    },
    {
      id: 'cashflow-junior',
      title: 'Cashflow Junior',
      description: 'Learn about assets, liabilities, and passive income',
      difficulty: 'Expert',
      estimatedTime: '20-25 min',
      icon: <Star className="w-8 h-8" />,
      color: 'bg-amber-100 text-amber-800',
      baseCoins: 50,
      baseXP: 100
    }
  ]

  const GameSimulator = ({ game }: { game: typeof games[0] }) => {
    const [gameStep, setGameStep] = useState(0)
    const [playerMoney, setPlayerMoney] = useState(100)
    const [gameChoices, setGameChoices] = useState<string[]>([])

    const gameSteps = {
      'allowance-game': [
        {
          scenario: "You have $10 allowance. Your friend wants to go to the movies ($8).",
          choices: [
            { text: "Go to movies", cost: 8, learning: "spending" },
            { text: "Save for bigger goal", cost: 0, learning: "saving" }
          ]
        },
        {
          scenario: "You find $5 on the ground! What do you do?",
          choices: [
            { text: "Buy candy", cost: 5, learning: "impulse" },
            { text: "Add to savings", cost: -5, learning: "saving" }
          ]
        },
        {
          scenario: "Mom offers $3 for washing dishes. Do you take the job?",
          choices: [
            { text: "Yes, earn $3", cost: -3, learning: "earning" },
            { text: "No, I'm busy", cost: 0, learning: "opportunity" }
          ]
        }
      ],
      'payday-challenge': [
        {
          scenario: "Monthly salary: $2000. First, pay rent ($800).",
          choices: [
            { text: "Pay rent on time", cost: 800, learning: "budgeting" },
            { text: "Skip this month", cost: 0, learning: "consequences" }
          ]
        },
        {
          scenario: "Surprise car repair bill: $300. You have $400 left.",
          choices: [
            { text: "Pay immediately", cost: 300, learning: "emergency" },
            { text: "Put on credit card", cost: 350, learning: "debt" }
          ]
        }
      ]
    }

    const currentSteps = gameSteps[game.id as keyof typeof gameSteps] || gameSteps['allowance-game']

    const handleChoice = (choice: any) => {
      setPlayerMoney(prev => prev - choice.cost)
      setGameChoices(prev => [...prev, choice.learning])
      
      if (gameStep < currentSteps.length - 1) {
        setGameStep(prev => prev + 1)
      } else {
        // Game completed
        const finalCoins = Math.max(5, Math.floor(playerMoney / 10))
        completeGame(game.id, finalCoins, game.baseXP)
      }
    }

    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Step {gameStep + 1} of {currentSteps.length}</h3>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            <span>${playerMoney}</span>
          </div>
        </div>
        
        <Progress value={(gameStep / currentSteps.length) * 100} className="w-full" />
        
        <div className="bg-card p-4 rounded-lg">
          <p className="text-base mb-4">{currentSteps[gameStep]?.scenario}</p>
          
          <div className="space-y-2">
            {currentSteps[gameStep]?.choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleChoice(choice)}
              >
                {choice.text}
                {choice.cost > 0 && <span className="ml-auto text-red-600">-${choice.cost}</span>}
                {choice.cost < 0 && <span className="ml-auto text-green-600">+${Math.abs(choice.cost)}</span>}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FinanceQuest</h1>
                <p className="text-sm text-muted-foreground">Learn Money Through Play</p>
              </div>
            </div>
            
            {userProfile?.name && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">Hi, {userProfile.name}!</p>
                  <p className="text-sm text-muted-foreground">Level {userProfile.level}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-accent" />
                  <span className="font-bold text-accent">{userProfile.totalCoins}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {games.map((game) => (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${game.color}`}>
                        {game.icon}
                      </div>
                      <Badge variant="secondary">{game.difficulty}</Badge>
                    </div>
                    <CardTitle>{game.title}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>⏱️ {game.estimatedTime}</span>
                      <span>🏆 +{game.baseXP} XP</span>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          Play Game
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{game.title}</DialogTitle>
                        </DialogHeader>
                        <GameSimulator game={game} />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level {userProfile?.level || 1}</span>
                      <span>{currentLevelXP}/{xpForNextLevel} XP</span>
                    </div>
                    <Progress value={progressPercent} className="w-full" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{userProfile?.gamesCompleted || 0}</p>
                      <p className="text-sm text-muted-foreground">Games Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">{userProfile?.currentStreak || 0}</p>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Games</CardTitle>
                </CardHeader>
                <CardContent>
                  {(gameScores?.length || 0) === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No games played yet. Start with Allowance Adventure!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {(gameScores || []).slice(-5).reverse().map((score, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span className="capitalize">{score.gameId.replace('-', ' ')}</span>
                          <span className="text-accent font-semibold">+{score.score} coins</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: 'First Steps', description: 'Complete your first game', unlocked: (userProfile?.gamesCompleted || 0) >= 1 },
                { name: 'Penny Saver', description: 'Earn 100 coins', unlocked: (userProfile?.totalCoins || 0) >= 100 },
                { name: 'Level Up!', description: 'Reach level 3', unlocked: (userProfile?.level || 1) >= 3 },
                { name: 'Streak Master', description: 'Play 5 games in a row', unlocked: (userProfile?.currentStreak || 0) >= 5 },
                { name: 'Game Explorer', description: 'Try all game types', unlocked: new Set((gameScores || []).map(s => s.gameId)).size >= 4 },
                { name: 'Money Master', description: 'Earn 500 coins', unlocked: (userProfile?.totalCoins || 0) >= 500 }
              ].map((achievement, index) => (
                <Card key={index} className={`${achievement.unlocked ? 'bg-accent/10 border-accent' : 'opacity-50'}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">
                      {achievement.unlocked ? '🏆' : '🔒'}
                    </div>
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App