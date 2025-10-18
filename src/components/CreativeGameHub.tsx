import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  House, ChartLine, Coins, Star, Lightning, Trophy,
  GameController, Plant, Fire, Sparkle, LockKey,
  Clock, Target
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UserProfile, GameScore } from '@/App'

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
  locked: boolean
  minLevel: number
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
    locked: false,
    minLevel: 1
  },
  {
    id: 'budget-balancer',
    title: 'Budget Balancer',
    description: 'Sort expenses into the right buckets! Learn budgeting the fun way!',
    category: 'savings',
    difficulty: 'Easy',
    time: '3-4 min',
    icon: '🧮',
    locked: false,
    minLevel: 1
  },
  {
    id: 'investment-tower',
    title: 'Investment Tower',
    description: 'Build your investment empire! Stack assets and watch them grow!',
    category: 'investing',
    difficulty: 'Medium',
    time: '4-5 min',
    icon: '📈',
    locked: false,
    minLevel: 3
  },
  {
    id: 'credit-defender',
    title: 'Credit Score Defender',
    description: 'Protect your credit score from bad decisions! Tower defense fun!',
    category: 'credit',
    difficulty: 'Medium',
    time: '5-6 min',
    icon: '💳',
    locked: false,
    minLevel: 5
  },
  {
    id: 'business-builder',
    title: 'Business Builder',
    description: 'Run your own business! Make smart choices and grow profits!',
    category: 'business',
    difficulty: 'Hard',
    time: '6-8 min',
    icon: '🏪',
    locked: false,
    minLevel: 7
  },
  {
    id: 'lemonade-boss',
    title: 'Lemonade Boss',
    description: 'Classic lemonade stand! Price it right and beat the competition!',
    category: 'business',
    difficulty: 'Easy',
    time: '3-4 min',
    icon: '🍋',
    locked: false,
    minLevel: 1
  }
]

export default function CreativeGameHub({
  userProfile,
  gameScores,
  onModeSwitch,
  onGameStart
}: CreativeGameHubProps) {
  const [filter, setFilter] = useState<'all' | 'savings' | 'investing' | 'credit' | 'business'>('all')

  const filteredGames = useMemo(() => {
    return GAME_CARDS.filter(game => 
      filter === 'all' || game.category === filter
    )
  }, [filter])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'savings': return { bg: 'category-savings', text: 'oklch(0.98 0.03 145)' }
      case 'investing': return { bg: 'category-investing', text: 'oklch(0.98 0.02 220)' }
      case 'credit': return { bg: 'category-credit', text: 'oklch(0.98 0.02 320)' }
      case 'business': return { bg: 'category-business', text: 'oklch(0.98 0.02 35)' }
      default: return { bg: '', text: 'oklch(0.98 0.02 120)' }
    }
  }

  return (
    <div className="mode-creative min-h-screen mode-transition-enter">
      <div className="mode-indicator creative" />
      
      {/* Fun Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-creative-card/95 backdrop-blur-md border-b-4 border-creative-border shadow-lg">
        <div className="container-creative">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={onModeSwitch}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-creative-primary text-creative-primary-fg font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg"
                aria-label="Back to Home"
              >
                <House size={20} weight="fill" />
                <span>HOME</span>
              </button>
              
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-creative-accent/20 border-2 border-creative-accent">
                <Plant size={20} weight="fill" style={{ color: 'var(--creative-accent)' }} />
                <span className="font-bold text-sm" style={{ color: 'var(--creative-accent)' }}>Creative Mode</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-creative-accent text-creative-accent-fg font-bold text-sm shadow-md">
                <Coins size={18} weight="fill" />
                <span>{userProfile.totalCoins}</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-creative-secondary text-creative-secondary-fg font-bold text-sm shadow-md">
                <Star size={18} weight="fill" />
                <span>Lvl {userProfile.level}</span>
              </div>
              
              <button
                onClick={onModeSwitch}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-creative-muted border-2 border-creative-border font-bold text-sm hover:scale-105 active:scale-95 transition-all"
              >
                <ChartLine size={18} weight="fill" />
                <span>Switch to Pro</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-creative pt-28 pb-12">
        {/* Hero Section */}
        <motion.section 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Sparkle size={32} weight="fill" style={{ color: 'var(--creative-accent)' }} />
            <h1 className="text-4xl md:text-5xl font-black" style={{ 
              background: 'linear-gradient(135deg, var(--creative-primary) 0%, var(--creative-secondary) 50%, var(--creative-accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              PLAY & LEARN GAMES!
            </h1>
            <Sparkle size={32} weight="fill" style={{ color: 'var(--creative-secondary)' }} />
          </div>
          <p className="text-lg md:text-xl font-bold mb-6" style={{ color: 'var(--creative-fg)' }}>
            Choose a game and start having fun while learning about money! 🎮
          </p>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { id: 'all', label: 'All Games', icon: GameController },
              { id: 'savings', label: 'Savings', icon: Coins },
              { id: 'investing', label: 'Investing', icon: Trophy },
              { id: 'credit', label: 'Credit', icon: Star },
              { id: 'business', label: 'Business', icon: Fire }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id as typeof filter)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm
                  border-3 transition-all shadow-md hover:shadow-lg
                  ${filter === id 
                    ? 'bg-creative-primary text-creative-primary-fg border-creative-primary scale-105' 
                    : 'bg-creative-card text-creative-fg border-creative-border hover:scale-105'
                  }
                `}
              >
                <Icon size={18} weight="fill" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Games Grid */}
        <section className="grid-games">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game, idx) => {
              const colors = getCategoryColor(game.category)
              const isLocked = game.locked || userProfile.level < game.minLevel
              
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  layout
                >
                  <button
                    onClick={() => !isLocked && onGameStart(game.id)}
                    disabled={isLocked}
                    className={`
                      game-card w-full text-left
                      ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {/* Colorful Header */}
                    <div 
                      className={`h-28 flex items-center justify-center text-6xl relative overflow-hidden ${colors.bg}`}
                    >
                      {isLocked ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                          <LockKey size={48} weight="fill" style={{ color: 'oklch(1 0 0 / 0.8)' }} />
                        </div>
                      ) : (
                        <span className="drop-shadow-lg">{game.icon}</span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-xl leading-tight" style={{ color: 'var(--creative-fg)' }}>
                          {game.title}
                        </h3>
                        <Badge className="badge-fun flex-shrink-0">
                          {game.difficulty}
                        </Badge>
                      </div>

                      <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--creative-muted-fg)' }}>
                        {game.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t-2 border-creative-border">
                        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--creative-muted-fg)' }}>
                          <Clock size={16} weight="fill" />
                          <span>{game.time}</span>
                        </div>
                        
                        {!isLocked ? (
                          <div className="btn-play px-4 py-2 text-sm pulse-play">
                            PLAY NOW! →
                          </div>
                        ) : (
                          <div className="text-xs font-bold px-3 py-2 rounded-lg bg-creative-muted" style={{ color: 'var(--creative-muted-fg)' }}>
                            Unlock at Lvl {game.minLevel}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </section>

        {/* Fun Stats Section */}
        <motion.section 
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: Trophy, label: 'Games Played', value: gameScores.length, color: 'oklch(0.65 0.22 35)' },
            { icon: Fire, label: 'Day Streak', value: userProfile.currentStreak, color: 'oklch(0.68 0.24 15)' },
            { icon: Lightning, label: 'Total XP', value: userProfile.xp, color: 'oklch(0.60 0.24 280)' },
            { icon: Target, label: 'High Score', value: gameScores.length > 0 ? Math.max(...gameScores.map(g => g.score)) : 0, color: 'oklch(0.58 0.20 145)' }
          ].map(({ icon: Icon, label, value, color }) => (
            <div 
              key={label}
              className="game-card p-4 text-center"
            >
              <div 
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <Icon size={24} weight="fill" />
              </div>
              <div className="text-2xl font-black mb-1" style={{ color: 'var(--creative-fg)' }}>
                {value}
              </div>
              <div className="text-xs font-bold" style={{ color: 'var(--creative-muted-fg)' }}>
                {label}
              </div>
            </div>
          ))}
        </motion.section>
      </main>

      {/* Fun Footer */}
      <footer className="border-t-4 border-creative-border bg-creative-card mt-12">
        <div className="container-creative py-6 text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--creative-muted-fg)' }}>
            Keep playing, keep learning! You're doing great! 🌟
          </p>
        </div>
      </footer>
    </div>
  )
}
