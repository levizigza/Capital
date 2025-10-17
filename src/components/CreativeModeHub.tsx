import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plant, Drop, Sun, CloudRain, Flower, Tree, Butterfly,
  GameController, Medal, Sparkle, GearSix, ArrowsClockwise,
  Trophy, Fire, Coins
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ProfessionalGameHub } from '@/game/components/ProfessionalGameHub'
import type { GameScore } from '@/App'

interface CreativeModeHubProps {
  userProfile: {
    name: string
    level: number
    xp: number
    totalCoins: number
    gamesCompleted: number
    achievements: string[]
    currentStreak: number
    gardenProgress?: {
      plants: Array<{ type: string; growth: number; position: { x: number; y: number } }>
      gardenLevel: number
      unlockedAreas: string[]
    }
  }
  setUserProfile: (updater: (prev: any) => any) => void
  gameScores: GameScore[]
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: any) => void
  onModeSwitch: () => void
}

export default function CreativeModeHub({
  userProfile,
  setUserProfile,
  gameScores,
  onGameComplete,
  onModeSwitch
}: CreativeModeHubProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, userProfile.level - 1))
  const currentLevelXP = userProfile.xp % xpForNextLevel
  const progressPercent = (currentLevelXP / xpForNextLevel) * 100

  const gardenLevel = Math.floor(userProfile.level / 3) + 1
  const totalPlants = userProfile.gamesCompleted

  const handleGameComplete = (gameId: string, score: number, timeSpent: number, additionalData?: any) => {
    onGameComplete(gameId, score, timeSpent, additionalData)
    setIsPlaying(false)
    
    toast.success('🌱 Your garden grows!', {
      description: `New plant sprouted from your achievement!`
    })
  }

  const gardens = [
    {
      name: 'Savings Meadow',
      icon: Flower,
      color: 'from-green-400 to-emerald-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50/80',
      borderColor: 'border-green-200',
      plants: Math.floor(totalPlants * 0.4),
      unlocked: true,
      description: 'Where smart spending decisions bloom'
    },
    {
      name: 'Investment Orchard',
      icon: Tree,
      color: 'from-amber-400 to-orange-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200',
      plants: Math.floor(totalPlants * 0.3),
      unlocked: userProfile.level >= 3,
      description: 'Fruit trees that grow wealth over time'
    },
    {
      name: 'Debt-Free Forest',
      icon: Tree,
      color: 'from-blue-400 to-cyan-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-200',
      plants: Math.floor(totalPlants * 0.2),
      unlocked: userProfile.level >= 5,
      description: 'Clear the thorns and grow strong'
    },
    {
      name: 'Credit Garden',
      icon: Butterfly,
      color: 'from-purple-400 to-pink-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50/80',
      borderColor: 'border-purple-200',
      plants: Math.floor(totalPlants * 0.1),
      unlocked: userProfile.level >= 8,
      description: 'Where responsibility takes flight'
    }
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="border-b border-green-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <Plant className="w-6 h-6 text-white" weight="fill" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-900">Finance Garden</h1>
                <p className="text-sm text-green-600">Watch your wealth bloom</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 border border-amber-200">
                  <Coins className="w-4 h-4 text-amber-600" weight="fill" />
                  <span className="text-lg font-bold text-amber-700">{userProfile.totalCoins}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 border border-green-200">
                  <Sun className="w-4 h-4 text-green-600" weight="fill" />
                  <span className="text-lg font-bold text-green-700">Level {userProfile.level}</span>
                </div>
              </div>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-green-200 hover:bg-green-50">
                    <GearSix className="w-5 h-5 text-green-700" />
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
                      Switch to Structured Mode
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-green-700 mb-2">
              <span className="font-medium">Garden Growth</span>
              <span className="font-bold">{currentLevelXP}/{xpForNextLevel} XP</span>
            </div>
            <div className="h-3 bg-green-100 rounded-full overflow-hidden border border-green-200">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-green-900 mb-4">
            Your Financial Garden
          </h2>
          <p className="text-xl text-green-600 max-w-2xl mx-auto">
            Every game you play plants a seed. Every smart decision helps it grow. 
            Watch your financial health flourish! 🌱
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {gardens.map((garden, index) => {
            const Icon = garden.icon
            return (
              <motion.div
                key={garden.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${garden.bgColor} border-2 ${garden.borderColor} ${garden.unlocked ? 'shadow-lg hover:shadow-xl' : 'opacity-60'} transition-all duration-300`}>
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${garden.color} flex items-center justify-center shadow-md`}>
                          <Icon className="w-8 h-8 text-white" weight="fill" />
                        </div>
                        <div>
                          <h3 className={`text-2xl font-bold ${garden.textColor}`}>
                            {garden.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{garden.description}</p>
                        </div>
                      </div>
                      {garden.unlocked && (
                        <Badge className="bg-white/50 text-green-700 border-green-200">
                          Level {gardenLevel}
                        </Badge>
                      )}
                    </div>

                    {garden.unlocked ? (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <Plant className={`w-5 h-5 ${garden.textColor}`} weight="fill" />
                          <span className={`text-lg font-semibold ${garden.textColor}`}>
                            {garden.plants} plants growing
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-8 gap-2 mb-4">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: i < garden.plants ? 1 : 0.3 }}
                              transition={{ delay: i * 0.05 }}
                              className={`aspect-square rounded-lg ${
                                i < garden.plants 
                                  ? `bg-gradient-to-br ${garden.color}` 
                                  : 'bg-gray-200'
                              } flex items-center justify-center`}
                            >
                              {i < garden.plants && (
                                <Plant className="w-4 h-4 text-white" weight="fill" />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">🔒</div>
                        <p className="text-gray-500 font-medium">
                          Reach Level {Math.ceil(index * 2.5 + 3)} to unlock
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-green-400 to-emerald-500 border-0 shadow-2xl">
            <CardContent className="p-10 text-center text-white">
              <GameController className="w-16 h-16 mx-auto mb-6" weight="fill" />
              <h3 className="text-3xl font-bold mb-4">Play Financial Games</h3>
              <p className="text-lg text-green-50 mb-8 leading-relaxed">
                Each game plants new seeds in your garden. The better you play, the faster they grow!
              </p>
              <Button 
                size="lg"
                onClick={() => setIsPlaying(true)}
                className="bg-white text-green-600 hover:bg-green-50 px-10 py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkle className="w-6 h-6 mr-3" weight="fill" />
                Start Playing
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          <Card className="bg-white/80 border-green-200 shadow-md">
            <CardContent className="p-6 text-center">
              <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" weight="fill" />
              <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.gamesCompleted}</p>
              <p className="text-sm text-green-600 font-medium">Games Completed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 border-green-200 shadow-md">
            <CardContent className="p-6 text-center">
              <Fire className="w-10 h-10 text-orange-500 mx-auto mb-3" weight="fill" />
              <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.currentStreak}</p>
              <p className="text-sm text-green-600 font-medium">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 border-green-200 shadow-md">
            <CardContent className="p-6 text-center">
              <Medal className="w-10 h-10 text-purple-500 mx-auto mb-3" weight="fill" />
              <p className="text-3xl font-bold text-green-900 mb-2">{userProfile.achievements.length}</p>
              <p className="text-sm text-green-600 font-medium">Achievements</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
