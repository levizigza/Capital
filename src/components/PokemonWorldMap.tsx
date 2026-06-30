import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, Lock, Trophy, Sword, MapPin, House, Coins } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AvatarPreview, type AvatarConfig, DEFAULT_AVATAR } from '@/components/AvatarCustomizer'
import type { UserProfile, GameScore } from '@/App'
import { musicService } from '@/lib/music-service'

// Neighborhood definitions
export interface Neighborhood {
  id: string
  name: string
  description: string
  icon: string
  color: string
  bgGradient: string
  unlockLevel: number
  games: NeighborhoodGame[]
  boss: Boss
  rewards: {
    coins: number
    xp: number
    badge: string
  }
}

export interface NeighborhoodGame {
  id: string
  name: string
  icon: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  xpReward: number
  coinReward: number
}

export interface Boss {
  id: string
  name: string
  title: string
  icon: string
  description: string
  health: number
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Epic'
  requiredGamesCompleted: number
  rewards: {
    coins: number
    xp: number
    specialItem: string
  }
}

// Define the neighborhoods
const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'savings-village',
    name: 'Savings Village',
    description: 'Learn the basics of saving money in this friendly starter town!',
    icon: '🏘️',
    color: '#10b981',
    bgGradient: 'from-green-200 via-emerald-100 to-teal-100',
    unlockLevel: 1,
    games: [
      { id: 'coin-catcher', name: 'Coin Catcher', icon: '🪙', description: 'Catch coins and avoid expenses!', difficulty: 'Easy', xpReward: 50, coinReward: 25 },
      { id: 'savings-sprint', name: 'Savings Sprint', icon: '🏃', description: 'Race to save money fast!', difficulty: 'Easy', xpReward: 60, coinReward: 30 },
      { id: 'collect-game-2d', name: 'Juice Collector', icon: '🧃', description: 'Collect valuable items!', difficulty: 'Easy', xpReward: 40, coinReward: 20 },
    ],
    boss: {
      id: 'piggy-boss',
      name: 'Baron Pigsworth',
      title: 'The Savings Guardian',
      icon: '🐷',
      description: 'A wise piggy bank who tests your saving skills!',
      health: 100,
      difficulty: 'Easy',
      requiredGamesCompleted: 2,
      rewards: { coins: 200, xp: 300, specialItem: '🏆 Saver Badge' }
    },
    rewards: { coins: 100, xp: 200, badge: '🌟 Village Hero' }
  },
  {
    id: 'budget-boulevard',
    name: 'Budget Boulevard',
    description: 'Master the art of budgeting in this organized district!',
    icon: '🏙️',
    color: '#3b82f6',
    bgGradient: 'from-blue-200 via-sky-100 to-cyan-100',
    unlockLevel: 3,
    games: [
      { id: 'budget-balancer', name: 'Budget Balancer', icon: '⚖️', description: 'Balance your budget perfectly!', difficulty: 'Medium', xpReward: 80, coinReward: 40 },
      { id: 'expense-express', name: 'Expense Express', icon: '🚂', description: 'Track expenses on the go!', difficulty: 'Medium', xpReward: 70, coinReward: 35 },
    ],
    boss: {
      id: 'calculator-boss',
      name: 'Professor Calculus',
      title: 'The Budget Master',
      icon: '🧮',
      description: 'A mathematical genius who challenges your budgeting skills!',
      health: 150,
      difficulty: 'Medium',
      requiredGamesCompleted: 2,
      rewards: { coins: 350, xp: 500, specialItem: '📊 Budget Pro Badge' }
    },
    rewards: { coins: 150, xp: 300, badge: '💼 Budget Master' }
  },
  {
    id: 'investment-island',
    name: 'Investment Island',
    description: 'Explore the exciting world of investments on this tropical island!',
    icon: '🏝️',
    color: '#8b5cf6',
    bgGradient: 'from-purple-200 via-violet-100 to-fuchsia-100',
    unlockLevel: 5,
    games: [
      { id: 'investment-tower', name: 'Investment Climber', icon: '📈', description: 'Build your investment tower!', difficulty: 'Medium', xpReward: 100, coinReward: 50 },
      { id: 'portfolio-park', name: 'Portfolio Park', icon: '🎯', description: 'Optimize your portfolio!', difficulty: 'Hard', xpReward: 120, coinReward: 60 },
      { id: 'interest-inn', name: 'Interest Inn', icon: '🏨', description: 'Learn compound interest!', difficulty: 'Easy', xpReward: 70, coinReward: 35 },
    ],
    boss: {
      id: 'bull-boss',
      name: 'Sir Bullsworth',
      title: 'The Market Bull',
      icon: '🐂',
      description: 'A powerful bull who guards the secrets of investing!',
      health: 200,
      difficulty: 'Hard',
      requiredGamesCompleted: 2,
      rewards: { coins: 500, xp: 700, specialItem: '📈 Investor Elite Badge' }
    },
    rewards: { coins: 250, xp: 400, badge: '💎 Island Champion' }
  },
  {
    id: 'credit-castle',
    name: 'Credit Castle',
    description: 'Navigate the mysterious castle of credit and debt management!',
    icon: '🏰',
    color: '#ef4444',
    bgGradient: 'from-red-200 via-orange-100 to-amber-100',
    unlockLevel: 7,
    games: [
      { id: 'credit-defender', name: 'Credit Defender', icon: '🛡️', description: 'Defend your credit score!', difficulty: 'Medium', xpReward: 90, coinReward: 45 },
      { id: 'debt-dungeon', name: 'Debt Dungeon', icon: '⚔️', description: 'Fight debt monsters!', difficulty: 'Hard', xpReward: 130, coinReward: 65 },
    ],
    boss: {
      id: 'dragon-boss',
      name: 'Debtron the Dragon',
      title: 'Lord of Debt',
      icon: '🐉',
      description: 'A fearsome dragon made of unpaid bills and credit card statements!',
      health: 250,
      difficulty: 'Hard',
      requiredGamesCompleted: 2,
      rewards: { coins: 600, xp: 800, specialItem: '🛡️ Debt Slayer Badge' }
    },
    rewards: { coins: 300, xp: 500, badge: '⚔️ Castle Conqueror' }
  },
  {
    id: 'business-bay',
    name: 'Business Bay',
    description: 'Start your entrepreneurial journey in this bustling business district!',
    icon: '🌃',
    color: '#f59e0b',
    bgGradient: 'from-amber-200 via-yellow-100 to-orange-100',
    unlockLevel: 10,
    games: [
      { id: 'lemonade-boss', name: 'Lemonade Boss', icon: '🍋', description: 'Run your lemonade empire!', difficulty: 'Medium', xpReward: 100, coinReward: 50 },
      { id: 'business-builder', name: 'Business Builder', icon: '🏪', description: 'Build your business!', difficulty: 'Hard', xpReward: 150, coinReward: 75 },
    ],
    boss: {
      id: 'tycoon-boss',
      name: 'Titan Tycoon',
      title: 'The Business Emperor',
      icon: '👔',
      description: 'The ultimate business mogul who rules the financial world!',
      health: 300,
      difficulty: 'Epic',
      requiredGamesCompleted: 2,
      rewards: { coins: 1000, xp: 1200, specialItem: '👑 Tycoon Crown' }
    },
    rewards: { coins: 500, xp: 750, badge: '🏆 Business Tycoon' }
  }
]

interface PokemonWorldMapProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  avatar?: AvatarConfig
  onGameStart: (gameId: string) => void
  onBossBattle: (boss: Boss, neighborhoodId: string) => void
  onModeSwitch: () => void
  onAvatarEdit: () => void
}

export default function PokemonWorldMap({
  userProfile,
  gameScores,
  avatar = DEFAULT_AVATAR,
  onGameStart,
  onBossBattle,
  onModeSwitch,
  onAvatarEdit
}: PokemonWorldMapProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null)
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 80 })
  const [isMoving, setIsMoving] = useState(false)
  const [showBossDialog, setShowBossDialog] = useState(false)

  // Play adventure music when entering the map
  useEffect(() => {
    musicService.playByCategory('adventure')
  }, [])

  // Check which neighborhoods are unlocked
  const isNeighborhoodUnlocked = (neighborhood: Neighborhood) => {
    return userProfile.level >= neighborhood.unlockLevel
  }

  // Check games completed in a neighborhood
  const getCompletedGamesInNeighborhood = (neighborhood: Neighborhood) => {
    return neighborhood.games.filter(game => 
      gameScores.some(score => score.gameId === game.id && score.completed)
    ).length
  }

  // Check if boss is available
  const isBossAvailable = (neighborhood: Neighborhood) => {
    const completedGames = getCompletedGamesInNeighborhood(neighborhood)
    return completedGames >= neighborhood.boss.requiredGamesCompleted
  }

  // Check if boss is defeated
  const isBossDefeated = (neighborhood: Neighborhood) => {
    return gameScores.some(score => 
      score.gameId === `boss-${neighborhood.boss.id}` && score.completed
    )
  }

  // Handle neighborhood selection
  const handleNeighborhoodClick = (neighborhood: Neighborhood) => {
    if (!isNeighborhoodUnlocked(neighborhood)) return
    
    // Move player to neighborhood
    setIsMoving(true)
    const neighborhoodPositions: Record<string, { x: number; y: number }> = {
      'savings-village': { x: 20, y: 70 },
      'budget-boulevard': { x: 40, y: 50 },
      'investment-island': { x: 70, y: 60 },
      'credit-castle': { x: 80, y: 30 },
      'business-bay': { x: 50, y: 20 },
    }
    
    const pos = neighborhoodPositions[neighborhood.id] || { x: 50, y: 50 }
    setPlayerPosition(pos)
    
    setTimeout(() => {
      setIsMoving(false)
      setSelectedNeighborhood(neighborhood)
    }, 500)
  }

  const handleBossClick = () => {
    if (selectedNeighborhood && isBossAvailable(selectedNeighborhood)) {
      musicService.playByCategory('battle')
      setShowBossDialog(true)
    }
  }

  const startBossBattle = () => {
    if (selectedNeighborhood) {
      setShowBossDialog(false)
      onBossBattle(selectedNeighborhood.boss, selectedNeighborhood.id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-green-200 to-yellow-100 relative overflow-hidden">
      {/* Sky and clouds background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-60"
            initial={{ x: -100 }}
            animate={{ x: '100vw' }}
            transition={{
              duration: 30 + i * 5,
              repeat: Infinity,
              delay: i * 6,
              ease: 'linear'
            }}
            style={{ top: `${10 + i * 15}%` }}
          >
            ☁️
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onAvatarEdit}
            className="hover:scale-110 transition-transform"
            aria-label="Edit avatar"
            title="Edit avatar"
          >
            <AvatarPreview avatar={avatar} size="sm" />
          </button>
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg">
            <div className="font-bold text-gray-800">{userProfile.name || 'Adventurer'}</div>
            <div className="text-sm text-gray-600 flex items-center gap-3">
              <span>⭐ Level {userProfile.level}</span>
              <span className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                {userProfile.totalCoins}
              </span>
            </div>
          </div>
        </div>
        
        <Button onClick={onModeSwitch} variant="outline" className="bg-white/90">
          <ArrowLeft className="mr-2" /> Back
        </Button>
      </div>

      {/* World Map Title */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-black text-white drop-shadow-lg text-center"
          style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}
        >
          🏝️ Finance Archipelago 🏝️
        </motion.h1>
      </div>

      {/* Map Container */}
      <div className="w-full h-screen relative pt-32">
        {/* Neighborhoods on the map */}
        {NEIGHBORHOODS.map((neighborhood, index) => {
          const positions = [
            { x: 15, y: 65 },  // savings-village
            { x: 35, y: 45 },  // budget-boulevard
            { x: 65, y: 55 },  // investment-island
            { x: 80, y: 25 },  // credit-castle
            { x: 45, y: 15 },  // business-bay
          ]
          const pos = positions[index]
          const unlocked = isNeighborhoodUnlocked(neighborhood)
          const completed = isBossDefeated(neighborhood)
          
          return (
            <motion.div
              key={neighborhood.id}
              className="absolute cursor-pointer"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              initial={{ scale: 0 }}
              animate={{ scale: unlocked ? 1 : 0.7, opacity: unlocked ? 1 : 0.5 }}
              whileHover={unlocked ? { scale: 1.15 } : {}}
              onClick={() => handleNeighborhoodClick(neighborhood)}
            >
              <div className="relative">
                {/* Neighborhood Icon */}
                <div
                  className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center text-4xl
                    shadow-xl border-4 transition-all
                    ${unlocked ? 'bg-white' : 'bg-gray-300'}
                    ${completed ? 'border-yellow-400' : 'border-white'}
                  `}
                  style={{ borderColor: unlocked ? neighborhood.color : '#9ca3af' }}
                >
                  {unlocked ? neighborhood.icon : <Lock className="w-8 h-8 text-gray-500" />}
                </div>
                
                {/* Neighborhood Name */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div 
                    className="bg-white/95 px-3 py-1 rounded-lg shadow-md text-xs font-bold"
                    style={{ color: unlocked ? neighborhood.color : '#6b7280' }}
                  >
                    {neighborhood.name}
                    {!unlocked && <span className="ml-1">(Lv.{neighborhood.unlockLevel})</span>}
                  </div>
                </div>
                
                {/* Completion Star */}
                {completed && (
                  <motion.div
                    className="absolute -top-3 -right-3"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                  >
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 drop-shadow-lg" weight="fill" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Paths connecting neighborhoods */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          <defs>
            <pattern id="path-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
              <circle cx="5" cy="5" r="2" fill="#8b5cf6" opacity="0.5" />
            </pattern>
          </defs>
          {/* Draw paths between neighborhoods */}
          <path
            d="M 15% 65% Q 25% 55% 35% 45%"
            stroke="url(#path-pattern)"
            strokeWidth="8"
            fill="none"
            strokeDasharray="10,10"
          />
          <path
            d="M 35% 45% Q 50% 50% 65% 55%"
            stroke="url(#path-pattern)"
            strokeWidth="8"
            fill="none"
            strokeDasharray="10,10"
          />
          <path
            d="M 65% 55% Q 72% 40% 80% 25%"
            stroke="url(#path-pattern)"
            strokeWidth="8"
            fill="none"
            strokeDasharray="10,10"
          />
          <path
            d="M 35% 45% Q 40% 30% 45% 15%"
            stroke="url(#path-pattern)"
            strokeWidth="8"
            fill="none"
            strokeDasharray="10,10"
          />
        </svg>

        {/* Player Avatar on map */}
        <motion.div
          className="absolute z-20"
          style={{ left: `${playerPosition.x}%`, top: `${playerPosition.y}%` }}
          animate={{
            x: '-50%',
            y: '-50%',
            scale: isMoving ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <AvatarPreview avatar={avatar} size="md" />
            {isMoving && (
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Neighborhood Detail Panel */}
      <AnimatePresence>
        {selectedNeighborhood && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40"
          >
            <Card 
              className={`mx-4 mb-4 bg-gradient-to-br ${selectedNeighborhood.bgGradient} border-4 shadow-2xl`}
              style={{ borderColor: selectedNeighborhood.color }}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{selectedNeighborhood.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: selectedNeighborhood.color }}>
                        {selectedNeighborhood.name}
                      </h2>
                      <p className="text-sm text-gray-600">{selectedNeighborhood.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedNeighborhood(null)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{getCompletedGamesInNeighborhood(selectedNeighborhood)}/{selectedNeighborhood.games.length} Games</span>
                  </div>
                  <Progress 
                    value={(getCompletedGamesInNeighborhood(selectedNeighborhood) / selectedNeighborhood.games.length) * 100}
                    className="h-3"
                  />
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {selectedNeighborhood.games.map(game => {
                    const isCompleted = gameScores.some(s => s.gameId === game.id && s.completed)
                    
                    return (
                      <motion.button
                        key={game.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onGameStart(game.id)}
                        className={`
                          p-4 rounded-xl border-2 text-left transition-all
                          ${isCompleted 
                            ? 'bg-green-100 border-green-400' 
                            : 'bg-white border-gray-200 hover:border-gray-400'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{game.icon}</span>
                          {isCompleted && <Star className="w-4 h-4 text-yellow-500" weight="fill" />}
                        </div>
                        <div className="font-bold text-sm">{game.name}</div>
                        <div className="text-xs text-gray-500">{game.description}</div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {game.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            +{game.xpReward} XP
                          </Badge>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Boss Section */}
                <div 
                  className={`
                    p-4 rounded-xl border-3 
                    ${isBossAvailable(selectedNeighborhood) 
                      ? 'bg-gradient-to-r from-red-100 to-orange-100 border-red-400 cursor-pointer hover:shadow-lg' 
                      : 'bg-gray-100 border-gray-300'
                    }
                    ${isBossDefeated(selectedNeighborhood) ? 'border-yellow-400 bg-gradient-to-r from-yellow-100 to-amber-100' : ''}
                  `}
                  onClick={handleBossClick}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">
                      {isBossDefeated(selectedNeighborhood) ? '👑' : selectedNeighborhood.boss.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">
                          {isBossDefeated(selectedNeighborhood) ? '✨ Defeated! ' : ''}
                          {selectedNeighborhood.boss.name}
                        </h3>
                        <Badge variant={isBossDefeated(selectedNeighborhood) ? 'default' : 'destructive'}>
                          {selectedNeighborhood.boss.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{selectedNeighborhood.boss.title}</p>
                      {!isBossAvailable(selectedNeighborhood) && !isBossDefeated(selectedNeighborhood) && (
                        <p className="text-xs text-red-500 mt-1">
                          Complete {selectedNeighborhood.boss.requiredGamesCompleted} games to challenge!
                        </p>
                      )}
                      {isBossAvailable(selectedNeighborhood) && !isBossDefeated(selectedNeighborhood) && (
                        <div className="flex items-center gap-2 mt-2">
                          <Sword className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-bold text-red-600">Ready to Battle!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boss Battle Dialog */}
      <AnimatePresence>
        {showBossDialog && selectedNeighborhood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBossDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={e => e.stopPropagation()}
            >
              <Card className="max-w-md w-full bg-gradient-to-br from-red-900 via-red-800 to-orange-900 border-4 border-yellow-500 text-white">
                <CardContent className="p-8 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-8xl mb-4"
                  >
                    {selectedNeighborhood.boss.icon}
                  </motion.div>
                  
                  <h2 className="text-3xl font-black mb-2 text-yellow-400">
                    {selectedNeighborhood.boss.name}
                  </h2>
                  <p className="text-lg text-orange-300 mb-4">
                    {selectedNeighborhood.boss.title}
                  </p>
                  <p className="text-sm text-gray-300 mb-6">
                    {selectedNeighborhood.boss.description}
                  </p>
                  
                  <div className="bg-black/30 rounded-lg p-4 mb-6">
                    <h3 className="font-bold text-yellow-400 mb-2">Victory Rewards:</h3>
                    <div className="flex justify-center gap-4 text-sm">
                      <span>💰 {selectedNeighborhood.boss.rewards.coins}</span>
                      <span>⭐ {selectedNeighborhood.boss.rewards.xp} XP</span>
                      <span>{selectedNeighborhood.boss.rewards.specialItem}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowBossDialog(false)}
                      className="flex-1 border-white text-white hover:bg-white/20"
                    >
                      Not Yet
                    </Button>
                    <Button
                      onClick={startBossBattle}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold hover:from-yellow-400 hover:to-orange-400"
                    >
                      <Sword className="mr-2" />
                      BATTLE!
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Hint */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-xs text-gray-600 z-20">
        <p className="font-semibold mb-1">🎮 How to Play:</p>
        <p>Click on a neighborhood to explore!</p>
        <p>Complete games to unlock the Boss!</p>
      </div>
    </div>
  )
}

export { NEIGHBORHOODS }
