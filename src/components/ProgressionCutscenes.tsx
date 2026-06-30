import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedAvatarConfig } from './EnhancedAvatarCustomizer'

type CutsceneType = 
  | 'game-start' 
  | 'level-up' 
  | 'achievement' 
  | 'broke' 
  | 'rich' 
  | 'boss-intro' 
  | 'boss-victory'
  | 'chapter-complete'
  | 'game-over'
  | 'new-location'

interface CutsceneProps {
  type: CutsceneType
  avatarConfig: EnhancedAvatarConfig
  data?: {
    amount?: number
    locationName?: string
    achievementName?: string
    bossName?: string
    bossEmoji?: string
    chapterTitle?: string
  }
  onComplete: () => void
}

// Animated character component
function AnimatedCharacter({ 
  config, 
  animation,
  size = 'medium'
}: { 
  config: EnhancedAvatarConfig
  animation: 'idle' | 'walk' | 'jump' | 'celebrate' | 'sad' | 'run' | 'money-rain'
  size?: 'small' | 'medium' | 'large'
}) {
  const sizeClasses = {
    small: 'text-4xl',
    medium: 'text-6xl',
    large: 'text-8xl'
  }

  const animations = {
    idle: {
      y: [0, -5, 0],
      transition: { repeat: Infinity, duration: 1 }
    },
    walk: {
      x: [-10, 10, -10],
      y: [0, -5, 0],
      transition: { repeat: Infinity, duration: 0.5 }
    },
    jump: {
      y: [0, -30, 0],
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 0.8 }
    },
    celebrate: {
      rotate: [-10, 10, -10],
      y: [0, -20, 0],
      transition: { repeat: Infinity, duration: 0.5 }
    },
    sad: {
      y: [0, 5, 0],
      rotate: [-2, 2, -2],
      transition: { repeat: Infinity, duration: 2 }
    },
    run: {
      x: [0, 300],
      y: [0, -10, 0, -10, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    'money-rain': {
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 0.3 }
    }
  }

  // Simple emoji-based avatar
  const getAvatarEmoji = () => {
    if (config.characterType === 'robot') return '🤖'
    if (config.characterType === 'alien') return '👽'
    if (config.characterType === 'elder') return config.gender === 'girl' ? '👵' : '👴'
    if (config.gender === 'girl') return '👧'
    return '👦'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} relative`}
      animate={animations[animation]}
    >
      <span>{getAvatarEmoji()}</span>
      {config.hat && config.hat !== 'none' && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">
          {config.hat === 'crown' ? '👑' : config.hat === 'cap' ? '🧢' : '🎩'}
        </span>
      )}
      {config.pet && config.pet !== 'none' && (
        <motion.span 
          className="absolute -right-8 bottom-0 text-2xl"
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
        >
          {config.pet === 'dog' ? '🐕' : config.pet === 'cat' ? '🐱' : config.pet === 'dragon' ? '🐉' : '🐾'}
        </motion.span>
      )}
    </motion.div>
  )
}

// Money rain effect
function MoneyRain() {
  const coins = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: ['💰', '💵', '🪙', '💎'][Math.floor(Math.random() * 4)],
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {coins.map(coin => (
        <motion.div
          key={coin.id}
          className="absolute text-3xl"
          style={{ left: `${coin.x}%` }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ 
            y: '100vh', 
            opacity: [0, 1, 1, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: coin.duration, 
            delay: coin.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2
          }}
        >
          {coin.emoji}
        </motion.div>
      ))}
    </div>
  )
}

// Confetti effect
function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)],
    x: Math.random() * 100,
    delay: Math.random() * 0.5
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(piece => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: piece.color, left: `${piece.x}%` }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ 
            y: '100vh',
            rotate: 720,
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: 3,
            delay: piece.delay,
            ease: 'easeIn'
          }}
        />
      ))}
    </div>
  )
}

// Main cutscene component
export default function ProgressionCutscene({
  type,
  avatarConfig,
  data,
  onComplete
}: CutsceneProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    // Auto-advance phases
    const timer = setTimeout(() => {
      if (phase < 2) {
        setPhase(prev => prev + 1)
      } else {
        onComplete()
      }
    }, type === 'broke' || type === 'rich' ? 4000 : 3000)

    return () => clearTimeout(timer)
  }, [phase, type, onComplete])

  // Skip on click
  const handleSkip = () => {
    onComplete()
  }

  // Broke cutscene - walking into bank
  if (type === 'broke') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-gray-700 to-gray-900 flex flex-col items-center justify-center"
        onClick={handleSkip}
      >
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="phase0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-8xl mb-4"
              >
                😰
              </motion.div>
              <h2 className="text-4xl font-bold text-red-400 mb-2">OH NO!</h2>
              <p className="text-xl text-gray-300">You've run out of money...</p>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full max-w-lg"
            >
              {/* Street scene */}
              <div className="bg-gray-600 h-32 relative">
                {/* Buildings */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-around">
                  <div className="w-20 h-24 bg-gray-800 rounded-t-lg" />
                  <div className="w-24 h-32 bg-amber-700 rounded-t-lg flex items-center justify-center">
                    <span className="text-4xl">🏦</span>
                  </div>
                  <div className="w-20 h-20 bg-gray-800 rounded-t-lg" />
                </div>
                
                {/* Walking character */}
                <motion.div
                  className="absolute bottom-0"
                  initial={{ left: '10%' }}
                  animate={{ left: '45%' }}
                  transition={{ duration: 3 }}
                >
                  <AnimatedCharacter config={avatarConfig} animation="walk" size="medium" />
                </motion.div>
              </div>
              
              <p className="text-center text-gray-400 mt-4">Walking to the bank...</p>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-8xl mb-4"
              >
                🏦
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Time to Work Your Way Back!</h2>
              <p className="text-gray-300">Complete challenges to earn money again!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="absolute bottom-8 text-gray-500 text-sm">Click anywhere to skip</p>
      </motion.div>
    )
  }

  // Rich cutscene - money rain and celebration
  if (type === 'rich') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400 flex flex-col items-center justify-center"
        onClick={handleSkip}
      >
        <MoneyRain />
        <Confetti />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="text-center relative z-10"
        >
          <AnimatedCharacter config={avatarConfig} animation="celebrate" size="large" />
          
          <motion.h1
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="text-5xl font-bold text-white mt-8 drop-shadow-lg"
          >
            🎉 YOU'RE RICH! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl text-white mt-4"
          >
            ${data?.amount?.toLocaleString() || '10,000'}!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-xl text-yellow-100"
          >
            Your financial knowledge is paying off! 💰
          </motion.div>
        </motion.div>

        <p className="absolute bottom-8 text-yellow-100 text-sm">Click anywhere to continue</p>
      </motion.div>
    )
  }

  // Boss intro cutscene
  if (type === 'boss-intro') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900 via-red-900 to-black flex flex-col items-center justify-center"
        onClick={handleSkip}
      >
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="phase0"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center"
            >
              <AnimatedCharacter config={avatarConfig} animation="idle" size="medium" />
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl text-gray-300 mt-4"
              >
                A powerful enemy approaches...
              </motion.p>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="phase1"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [-5, 5, -5]
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-9xl"
              >
                {data?.bossEmoji || '👹'}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold text-red-400 mt-4"
              >
                {data?.bossName || 'The Boss'}
              </motion.h1>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-8">
                <AnimatedCharacter config={avatarConfig} animation="jump" size="medium" />
                <motion.span
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 0.3 }}
                  className="text-4xl"
                >
                  ⚔️
                </motion.span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="text-6xl"
                >
                  {data?.bossEmoji || '👹'}
                </motion.span>
              </div>
              <h2 className="text-3xl font-bold text-white mt-8">BATTLE START!</h2>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="absolute bottom-8 text-gray-500 text-sm">Click anywhere to skip</p>
      </motion.div>
    )
  }

  // Boss victory cutscene
  if (type === 'boss-victory') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-green-400 via-emerald-500 to-teal-600 flex flex-col items-center justify-center"
        onClick={handleSkip}
      >
        <Confetti />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="text-center relative z-10"
        >
          <AnimatedCharacter config={avatarConfig} animation="celebrate" size="large" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white mt-8 drop-shadow-lg">
              🏆 VICTORY! 🏆
            </h1>
            <p className="text-2xl text-white mt-4">
              You defeated {data?.bossName || 'the Boss'}!
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            className="mt-8 bg-white/20 rounded-xl p-6"
          >
            <p className="text-xl text-white">Rewards Earned:</p>
            <p className="text-3xl font-bold text-yellow-300">
              +${data?.amount || 500} 💰
            </p>
          </motion.div>
        </motion.div>

        <p className="absolute bottom-8 text-white/70 text-sm">Click anywhere to continue</p>
      </motion.div>
    )
  }

  // New location unlocked
  if (type === 'new-location') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600 flex flex-col items-center justify-center"
        onClick={handleSkip}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-8xl mb-6"
          >
            🗺️
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            NEW AREA UNLOCKED!
          </h1>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="bg-white/20 rounded-xl p-6"
          >
            <p className="text-3xl font-bold text-yellow-300">
              {data?.locationName || 'Mystery Location'}
            </p>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl text-white/80 mt-6"
          >
            New adventures await! 🌟
          </motion.p>
        </motion.div>

        <p className="absolute bottom-8 text-white/70 text-sm">Click anywhere to continue</p>
      </motion.div>
    )
  }

  // Chapter complete
  if (type === 'chapter-complete') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-b from-purple-500 via-pink-500 to-rose-500 flex flex-col items-center justify-center"
        onClick={handleSkip}
      >
        <Confetti />
        
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-8xl mb-6"
          >
            ⭐
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            CHAPTER COMPLETE!
          </h1>
          
          <p className="text-2xl text-white/90">
            "{data?.chapterTitle || 'The Journey Continues'}"
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <AnimatedCharacter config={avatarConfig} animation="celebrate" size="medium" />
          </motion.div>
        </motion.div>

        <p className="absolute bottom-8 text-white/70 text-sm">Click anywhere to continue</p>
      </motion.div>
    )
  }

  // Default/level up
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center"
      onClick={handleSkip}
    >
      <Confetti />
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="text-center relative z-10"
      >
        <AnimatedCharacter config={avatarConfig} animation="jump" size="large" />
        
        <motion.h1
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-5xl font-bold text-white mt-8 drop-shadow-lg"
        >
          {type === 'level-up' ? '⬆️ LEVEL UP! ⬆️' : 
           type === 'achievement' ? '🏆 ACHIEVEMENT! 🏆' :
           '🎮 GAME START! 🎮'}
        </motion.h1>
        
        {data?.achievementName && (
          <p className="text-2xl text-yellow-300 mt-4">
            {data.achievementName}
          </p>
        )}
      </motion.div>

      <p className="absolute bottom-8 text-white/70 text-sm">Click anywhere to continue</p>
    </motion.div>
  )
}
