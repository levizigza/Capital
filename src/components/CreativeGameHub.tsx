import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, GameController, Coins, ChartLine, CreditCard, Storefront,
  Star, Lightning, Trophy, Fire, Sparkle, Clock, Target, Heart, Medal
} from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import type { UserProfile, GameScore } from '../App'

interface CreativeGameHubProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  onModeSwitch: () => void
  onGameStart: (gameId: string) => void
}

interface GameCardData {
  id: string
  title: string
  description: string
  category: 'savings' | 'investing' | 'credit' | 'business'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  time: string
  icon: string
  color: string
  gradient: string
  locked: boolean
  minLevel: number
  funFact: string
}

const GAME_CARDS: GameCardData[] = [
  {
    id: 'coin-catcher',
    title: 'Coin Catcher',
    description: 'Catch coins and dodge expenses in this action-packed savings game!',
    category: 'savings',
    difficulty: 'Easy',
    time: '2-3 min',
    icon: '🪙',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    locked: false,
    minLevel: 1,
    funFact: 'Save early, save often!'
  },
  {
    id: 'budget-balancer',
    title: 'Budget Balancer',
    description: 'Sort expenses into the right buckets! Learn budgeting the fun way!',
    category: 'savings',
    difficulty: 'Easy',
    time: '3-4 min',
    icon: '🧮',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    locked: false,
    minLevel: 1,
    funFact: 'Every dollar has a job!'
  },
  {
    id: 'investment-tower',
    title: 'Investment Tower',
    description: 'Build your investment empire! Stack assets and watch them grow!',
    category: 'investing',
    difficulty: 'Medium',
    time: '4-5 min',
    icon: '📈',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    locked: false,
    minLevel: 3,
    funFact: 'Time in market beats timing!'
  },
  {
    id: 'credit-defender',
    title: 'Credit Defender',
    description: 'Protect your credit score from bad decisions! Tower defense fun!',
    category: 'credit',
    difficulty: 'Medium',
    time: '5-6 min',
    icon: '💳',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    locked: false,
    minLevel: 5,
    funFact: 'Your credit score is your superpower!'
  },
  {
    id: 'business-builder',
    title: 'Business Builder',
    description: 'Run your own business! Make smart choices and grow profits!',
    category: 'business',
    difficulty: 'Hard',
    time: '6-8 min',
    icon: '🏪',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    locked: false,
    minLevel: 7,
    funFact: 'Every business starts with an idea!'
  },
  {
    id: 'lemonade-boss',
    title: 'Lemonade Boss',
    description: 'Classic lemonade stand! Price it right and beat the competition!',
    category: 'business',
    difficulty: 'Easy',
    time: '3-4 min',
    icon: '🍋',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    locked: false,
    minLevel: 1,
    funFact: 'When life gives you lemons, sell lemonade!'
  }
]

export default function CreativeGameHub({
  userProfile,
  gameScores,
  onModeSwitch,
  onGameStart
}: CreativeGameHubProps) {
  const [filter, setFilter] = useState<'all' | 'savings' | 'investing' | 'credit' | 'business'>('all')
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  const filteredGames = useMemo(() => {
    return GAME_CARDS.filter(game =>
      filter === 'all' || game.category === filter
    )
  }, [filter])

  const levelProgress = (userProfile.xp % 100) / 100 * 100

  return (
    <div className="mode-creative min-h-screen pb-20">
      {/* COOLMATH4KIDS-STYLE HEADER with bouncy navigation */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b-4 border-green-400 shadow-2xl"
      >
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Back Button - BRIGHT & BOUNCY */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={onModeSwitch}
                size="lg"
                className="mode-creative .btn-play shadow-2xl text-lg font-black"
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
                  color: 'white',
                  border: '4px solid #be185d',
                  borderRadius: '16px',
                  padding: '12px 24px'
                }}
              >
                <ArrowLeft className="mr-2" size={24} weight="bold" />
                Change Mode
              </Button>
            </motion.div>

            {/* Center Title - PLAYFUL */}
            <motion.div 
              className="flex items-center gap-4"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                🎮
              </motion.div>
              <div>
                <h1 className="text-4xl font-black" style={{
                  background: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  Finance Games!
                </h1>
                <p className="text-green-700 font-bold text-lg">Choose Your Adventure! 🚀</p>
              </div>
            </motion.div>

            {/* Stats - COLORFUL */}
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="text-center p-4 rounded-2xl shadow-lg border-4 border-yellow-400"
                style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)' }}
              >
                <div className="text-3xl font-black text-yellow-900">Lv. {userProfile.level}</div>
                <div className="text-xs font-bold text-yellow-700">LEVEL</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="text-center p-4 rounded-2xl shadow-lg border-4 border-green-400"
                style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)' }}
              >
                <div className="text-3xl font-black text-green-900">${userProfile.totalCoins}</div>
                <div className="text-xs font-bold text-green-700">COINS</div>
              </motion.div>
            </div>
          </div>

          {/* XP Bar - ANIMATED */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-purple-700">XP TO NEXT LEVEL</span>
              <span className="text-sm font-black text-purple-700">{userProfile.xp % 100}/100</span>
            </div>
            <div className="relative h-6 rounded-full overflow-hidden border-4 border-purple-400 shadow-inner">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
                  width: `${levelProgress}%`,
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 bg-white/30"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ width: '50%' }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* HERO SECTION - BRIGHT & EXCITING */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
          className="text-center mb-12 p-12 rounded-3xl border-8 border-blue-400 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)'
          }}
        >
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            🎯
          </motion.div>
          <h2 className="text-5xl font-black mb-4" style={{
            background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Master Money Through Play!
          </h2>
          <p className="text-2xl font-bold text-blue-900 max-w-3xl mx-auto leading-relaxed">
            Every game teaches real financial skills! 
            <span className="inline-block mx-2">💰</span>
            Have fun while learning to save, invest, and build wealth!
            <span className="inline-block mx-2">🚀</span>
          </p>
        </motion.div>

        {/* CATEGORY FILTER - PLAYFUL BUTTONS */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { id: 'all', label: 'All Games', icon: '🎮', color: '#8b5cf6' },
            { id: 'savings', label: 'Savings', icon: '💰', color: '#10b981' },
            { id: 'investing', label: 'Investing', icon: '📈', color: '#3b82f6' },
            { id: 'credit', label: 'Credit', icon: '💳', color: '#8b5cf6' },
            { id: 'business', label: 'Business', icon: '🏪', color: '#f59e0b' }
          ].map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-8 py-4 rounded-2xl font-black text-lg border-4 shadow-2xl
                transition-all duration-200
                ${filter === cat.id 
                  ? 'transform -rotate-2' 
                  : 'hover:shadow-xl'
                }
              `}
              style={{
                background: filter === cat.id 
                  ? `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}dd 100%)`
                  : 'white',
                color: filter === cat.id ? 'white' : cat.color,
                borderColor: cat.color,
                textShadow: filter === cat.id ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              <span className="text-2xl mr-2">{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* GAME CARDS GRID - BOUNCY & COLORFUL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  bounce: 0.5
                }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: hoveredGame === game.id ? 2 : 0,
                  y: -10
                }}
                onHoverStart={() => setHoveredGame(game.id)}
                onHoverEnd={() => setHoveredGame(null)}
                className="relative"
              >
                <Card 
                  className="mode-creative .game-card h-full overflow-hidden border-8 shadow-2xl cursor-pointer"
                  style={{
                    borderColor: game.color,
                    background: 'white',
                    transform: hoveredGame === game.id ? 'translateY(-8px) scale(1.03)' : 'none'
                  }}
                  onClick={() => !game.locked && onGameStart(game.id)}
                >
                  {/* Colorful Header */}
                  <div 
                    className="p-6 pb-3 relative overflow-hidden"
                    style={{ background: game.gradient }}
                  >
                    <motion.div
                      animate={{
                        scale: hoveredGame === game.id ? [1, 1.2, 1] : 1,
                        rotate: hoveredGame === game.id ? [0, 10, -10, 0] : 0
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-7xl mb-3 text-center drop-shadow-2xl"
                    >
                      {game.icon}
                    </motion.div>
                    
                    {/* Sparkles on hover */}
                    {hoveredGame === game.id && (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ 
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                              x: Math.random() * 100 - 50,
                              y: Math.random() * 100 - 50
                            }}
                            transition={{ 
                              duration: 1,
                              delay: i * 0.1,
                              repeat: Infinity
                            }}
                            className="absolute text-3xl"
                            style={{
                              left: '50%',
                              top: '50%'
                            }}
                          >
                            ✨
                          </motion.div>
                        ))}
                      </>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black mb-2 text-gray-900">
                      {game.title}
                    </h3>
                    
                    <p className="text-gray-700 font-semibold mb-4 leading-relaxed">
                      {game.description}
                    </p>

                    {/* Fun Fact Badge */}
                    <motion.div
                      animate={{
                        scale: hoveredGame === game.id ? [1, 1.05, 1] : 1
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="mb-4 p-3 rounded-xl border-4 border-dashed"
                      style={{
                        borderColor: game.color,
                        background: `${game.color}15`
                      }}
                    >
                      <div className="text-center">
                        <span className="text-2xl">💡</span>
                        <p className="text-sm font-bold" style={{ color: game.color }}>
                          {game.funFact}
                        </p>
                      </div>
                    </motion.div>

                    {/* Game Info */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        className="text-sm font-black px-3 py-1 border-2"
                        style={{
                          background: game.difficulty === 'Easy' ? '#10b981' : game.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                          color: 'white',
                          borderColor: game.difficulty === 'Easy' ? '#059669' : game.difficulty === 'Medium' ? '#d97706' : '#dc2626'
                        }}
                      >
                        {game.difficulty}
                      </Badge>
                      
                      <div className="flex items-center gap-2 text-gray-700 font-bold">
                        <Clock size={20} weight="bold" />
                        <span>{game.time}</span>
                      </div>
                    </div>

                    {/* Play Button - BIG & BOUNCY */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-4 rounded-2xl font-black text-xl border-4 shadow-xl"
                      style={{
                        background: game.gradient,
                        color: 'white',
                        borderColor: game.color,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      <span className="text-3xl mr-2">🎮</span>
                      PLAY NOW!
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ACHIEVEMENTS SECTION - PLAYFUL */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 p-10 rounded-3xl border-8 border-yellow-400 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)'
          }}
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-4"
            >
              🏆
            </motion.div>
            <h2 className="text-4xl font-black text-yellow-900 mb-2">Your Awesome Stats!</h2>
            <p className="text-xl font-bold text-yellow-800">Keep playing to unlock more achievements!</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="text-center p-6 rounded-2xl border-4 border-green-400 bg-white shadow-lg"
            >
              <div className="text-5xl mb-2">🎮</div>
              <div className="text-3xl font-black text-green-700">{userProfile.gamesCompleted}</div>
              <div className="text-sm font-bold text-green-600">Games Played</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="text-center p-6 rounded-2xl border-4 border-blue-400 bg-white shadow-lg"
            >
              <div className="text-5xl mb-2">⭐</div>
              <div className="text-3xl font-black text-blue-700">{userProfile.achievements.length}</div>
              <div className="text-sm font-bold text-blue-600">Achievements</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="text-center p-6 rounded-2xl border-4 border-orange-400 bg-white shadow-lg"
            >
              <div className="text-5xl mb-2">🔥</div>
              <div className="text-3xl font-black text-orange-700">{userProfile.currentStreak}</div>
              <div className="text-sm font-bold text-orange-600">Day Streak</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="text-center p-6 rounded-2xl border-4 border-purple-400 bg-white shadow-lg"
            >
              <div className="text-5xl mb-2">💎</div>
              <div className="text-3xl font-black text-purple-700">{userProfile.skillsUnlocked.length}</div>
              <div className="text-sm font-bold text-purple-600">Skills Unlocked</div>
            </motion.div>
          </div>
        </motion.div>

        {/* FOOTER - ENCOURAGING */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 p-8 rounded-3xl bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-4 border-purple-400"
        >
          <motion.div
            animate={{
              y: [0, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🌟
          </motion.div>
          <h3 className="text-3xl font-black text-purple-900 mb-3">
            You're Doing Great!
          </h3>
          <p className="text-xl font-bold text-purple-700 max-w-2xl mx-auto">
            Every game you play makes you smarter with money! Keep going, future millionaire! 💰🚀
          </p>
        </motion.div>
      </div>
    </div>
  )
}
