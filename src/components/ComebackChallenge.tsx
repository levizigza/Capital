import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedAvatarConfig } from './EnhancedAvatarCustomizer'

// Comeback mini-games to earn your way back
interface ComebackGame {
  id: string
  name: string
  emoji: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  reward: number
  minReward: number
}

const COMEBACK_GAMES: ComebackGame[] = [
  {
    id: 'coin-sort',
    name: 'Coin Sorting',
    emoji: '🪙',
    description: 'Sort coins into the right jars as fast as you can!',
    difficulty: 'easy',
    reward: 50,
    minReward: 10
  },
  {
    id: 'budget-quiz',
    name: 'Budget Brain',
    emoji: '🧠',
    description: 'Answer money questions correctly!',
    difficulty: 'easy',
    reward: 75,
    minReward: 15
  },
  {
    id: 'catch-coins',
    name: 'Street Performer',
    emoji: '🎭',
    description: 'Catch coins thrown by passersby!',
    difficulty: 'medium',
    reward: 100,
    minReward: 25
  },
  {
    id: 'recycling',
    name: 'Recycling Rush',
    emoji: '♻️',
    description: 'Sort recyclables to earn money!',
    difficulty: 'medium',
    reward: 125,
    minReward: 30
  },
  {
    id: 'odd-jobs',
    name: 'Odd Jobs',
    emoji: '🧹',
    description: 'Complete quick tasks for neighbors!',
    difficulty: 'hard',
    reward: 200,
    minReward: 50
  }
]

// Budget quiz questions
const BUDGET_QUESTIONS = [
  { q: 'What should you do FIRST when you get money?', a: ['Spend it all', 'Save some', 'Give it away'], correct: 1 },
  { q: 'Which is a NEED, not a WANT?', a: ['Video game', 'Food', 'Candy'], correct: 1 },
  { q: 'What is a budget?', a: ['A type of bird', 'A money plan', 'A piggy bank'], correct: 1 },
  { q: 'What makes money grow over time?', a: ['Magic', 'Interest', 'Wishes'], correct: 1 },
  { q: 'If you have $10 and save $2, how much can you spend?', a: ['$10', '$8', '$2'], correct: 1 },
  { q: 'What is the best way to reach a savings goal?', a: ['Hope for luck', 'Save a little regularly', 'Borrow money'], correct: 1 },
]

interface ComebackChallengeProps {
  avatarConfig: EnhancedAvatarConfig
  onComplete: (earnedMoney: number) => void
  onGiveUp: () => void
  debtAmount: number
}

export default function ComebackChallenge({
  avatarConfig,
  onComplete,
  onGiveUp,
  debtAmount
}: ComebackChallengeProps) {
  const [phase, setPhase] = useState<'intro' | 'select' | 'playing' | 'result'>('intro')
  const [selectedGame, setSelectedGame] = useState<ComebackGame | null>(null)
  const [earnedMoney, setEarnedMoney] = useState(0)
  const [gameScore, setGameScore] = useState(0)
  const [showAnimation, setShowAnimation] = useState(true)
  
  // Game-specific states
  const [coinSortScore, setCoinSortScore] = useState(0)
  const [coinSortTime, setCoinSortTime] = useState(30)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [catchScore, setCatchScore] = useState(0)
  const [catchTime, setCatchTime] = useState(20)
  const [fallingCoins, setFallingCoins] = useState<{id: number, x: number, y: number, value: number}[]>([])

  // Intro animation
  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(() => setShowAnimation(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Coin sort timer
  useEffect(() => {
    if (selectedGame?.id === 'coin-sort' && phase === 'playing' && coinSortTime > 0) {
      const timer = setInterval(() => {
        setCoinSortTime(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (coinSortTime === 0 && selectedGame?.id === 'coin-sort') {
      finishGame(coinSortScore)
    }
  }, [selectedGame, phase, coinSortTime, coinSortScore])

  // Catch coins timer and spawner
  useEffect(() => {
    if (selectedGame?.id === 'catch-coins' && phase === 'playing') {
      const timer = setInterval(() => {
        setCatchTime(prev => {
          if (prev <= 1) {
            finishGame(catchScore)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      const spawner = setInterval(() => {
        setFallingCoins(prev => [
          ...prev,
          {
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: 0,
            value: [1, 5, 10, 25][Math.floor(Math.random() * 4)]
          }
        ])
      }, 800)
      
      return () => {
        clearInterval(timer)
        clearInterval(spawner)
      }
    }
  }, [selectedGame, phase, catchScore])

  // Animate falling coins
  useEffect(() => {
    if (selectedGame?.id === 'catch-coins' && phase === 'playing') {
      const animator = setInterval(() => {
        setFallingCoins(prev => 
          prev
            .map(coin => ({ ...coin, y: coin.y + 3 }))
            .filter(coin => coin.y < 100)
        )
      }, 50)
      return () => clearInterval(animator)
    }
  }, [selectedGame, phase])

  const startGame = (game: ComebackGame) => {
    setSelectedGame(game)
    setPhase('playing')
    setGameScore(0)
    
    // Reset game-specific states
    if (game.id === 'coin-sort') {
      setCoinSortScore(0)
      setCoinSortTime(30)
    } else if (game.id === 'budget-quiz') {
      setQuizIndex(0)
      setQuizCorrect(0)
    } else if (game.id === 'catch-coins') {
      setCatchScore(0)
      setCatchTime(20)
      setFallingCoins([])
    }
  }

  const finishGame = (score: number) => {
    if (!selectedGame) return
    
    const earned = Math.max(
      selectedGame.minReward,
      Math.floor(selectedGame.reward * (score / 100))
    )
    
    setEarnedMoney(prev => prev + earned)
    setGameScore(score)
    setPhase('result')
  }

  const handleCoinSort = (correctJar: boolean) => {
    if (correctJar) {
      setCoinSortScore(prev => prev + 10)
    } else {
      setCoinSortScore(prev => Math.max(0, prev - 5))
    }
  }

  const handleQuizAnswer = (answerIndex: number) => {
    const question = BUDGET_QUESTIONS[quizIndex]
    if (answerIndex === question.correct) {
      setQuizCorrect(prev => prev + 1)
    }
    
    if (quizIndex < BUDGET_QUESTIONS.length - 1) {
      setQuizIndex(prev => prev + 1)
    } else {
      const score = Math.floor((quizCorrect + (answerIndex === question.correct ? 1 : 0)) / BUDGET_QUESTIONS.length * 100)
      finishGame(score)
    }
  }

  const handleCatchCoin = (coinId: number, value: number) => {
    setFallingCoins(prev => prev.filter(c => c.id !== coinId))
    setCatchScore(prev => prev + value)
  }

  // Intro screen - dramatic "broke" animation
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center p-4">
        <AnimatePresence>
          {showAnimation ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [-5, 5, -5]
                }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-9xl mb-8"
              >
                😰
              </motion.div>
              <motion.h1
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-4xl font-bold text-red-500 mb-4"
              >
                OH NO! YOU'RE BROKE!
              </motion.h1>
              <p className="text-gray-300 text-xl">You owe ${debtAmount}...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="retro-card max-w-lg w-full"
            >
              <div className="retro-card-header bg-gradient-to-r from-gray-700 to-gray-600">
                🏚️ Hard Times...
              </div>
              <div className="retro-card-body text-center">
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-xl font-bold mb-4">You've Hit Rock Bottom!</h2>
                <p className="text-gray-600 mb-4">
                  But don't worry! In real life and in this game, there's always a way back up!
                  Complete mini-challenges to earn money and get back on your feet!
                </p>
                
                <div className="bg-gray-100 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-500">Amount needed to continue:</p>
                  <p className="text-3xl font-bold text-red-600">${debtAmount}</p>
                  <p className="text-sm text-gray-500 mt-2">Current earnings: ${earnedMoney}</p>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={onGiveUp} className="retro-btn retro-btn-red flex-1">
                    😞 Give Up
                  </button>
                  <button onClick={() => setPhase('select')} className="retro-btn retro-btn-green flex-1">
                    💪 Let's Work!
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Game selection screen
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 via-gray-600 to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress header */}
          <div className="retro-card mb-6">
            <div className="retro-card-body">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Earned so far:</p>
                  <p className="text-2xl font-bold text-green-600">${earnedMoney}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Need:</p>
                  <p className="text-2xl font-bold text-red-600">${debtAmount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Remaining:</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${Math.max(0, debtAmount - earnedMoney)}
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="retro-progress">
                  <div 
                    className="retro-progress-fill"
                    style={{ width: `${Math.min(100, (earnedMoney / debtAmount) * 100)}%` }}
                  />
                </div>
              </div>
              
              {earnedMoney >= debtAmount && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-4 text-center"
                >
                  <p className="text-green-600 font-bold text-lg mb-2">🎉 You've earned enough!</p>
                  <button 
                    onClick={() => onComplete(earnedMoney)}
                    className="retro-btn retro-btn-green"
                  >
                    ✅ Continue Playing!
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Choose a Job to Earn Money! 💼
          </h2>

          {/* Game cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMEBACK_GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="retro-card cursor-pointer hover:scale-105 transition-transform"
                onClick={() => startGame(game)}
              >
                <div className={`h-24 flex items-center justify-center text-5xl ${
                  game.difficulty === 'easy' ? 'bg-green-200' :
                  game.difficulty === 'medium' ? 'bg-yellow-200' : 'bg-red-200'
                }`}>
                  {game.emoji}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{game.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{game.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      game.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {game.difficulty.toUpperCase()}
                    </span>
                    <span className="text-green-600 font-bold">Up to ${game.reward}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button onClick={onGiveUp} className="retro-btn retro-btn-red">
              😞 I Give Up
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Playing mini-games
  if (phase === 'playing' && selectedGame) {
    // Coin Sort Game
    if (selectedGame.id === 'coin-sort') {
      const coins = ['🪙', '💵', '💎']
      const jars = ['Coins', 'Bills', 'Gems']
      // Use coinSortScore modulo 3 to determine current coin (changes on each sort)
      const currentCoinIndex = Math.abs(coinSortScore) % 3
      
      return (
        <div className="min-h-screen bg-gradient-to-b from-amber-600 to-yellow-500 p-4">
          <div className="max-w-md mx-auto">
            {/* Timer and score */}
            <div className="retro-card mb-4">
              <div className="retro-card-body flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Time:</p>
                  <p className="text-2xl font-bold">{coinSortTime}s</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Score:</p>
                  <p className="text-2xl font-bold text-green-600">{coinSortScore}</p>
                </div>
              </div>
            </div>

            {/* Current coin */}
            <div className="text-center mb-8">
              <p className="text-white text-lg mb-2">Sort this into the right jar!</p>
              <motion.div
                key={coinSortScore}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-8xl"
              >
                {coins[currentCoinIndex]}
              </motion.div>
            </div>

            {/* Jars */}
            <div className="grid grid-cols-3 gap-4">
              {jars.map((jar, index) => (
                <motion.button
                  key={jar}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    handleCoinSort(index === currentCoinIndex)
                  }}
                  className="retro-card p-4 text-center"
                >
                  <div className="text-4xl mb-2">🫙</div>
                  <p className="font-bold">{jar}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Budget Quiz Game
    if (selectedGame.id === 'budget-quiz') {
      const question = BUDGET_QUESTIONS[quizIndex]
      
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-600 p-4">
          <div className="max-w-md mx-auto">
            {/* Progress */}
            <div className="retro-card mb-4">
              <div className="retro-card-body">
                <p className="text-center text-sm text-gray-500">
                  Question {quizIndex + 1} of {BUDGET_QUESTIONS.length}
                </p>
                <div className="retro-progress mt-2">
                  <div 
                    className="retro-progress-fill"
                    style={{ width: `${((quizIndex + 1) / BUDGET_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={quizIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="retro-card"
            >
              <div className="retro-card-header">
                🧠 Budget Brain
              </div>
              <div className="retro-card-body">
                <p className="text-lg font-bold mb-6 text-center">{question.q}</p>
                
                <div className="space-y-3">
                  {question.a.map((answer, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuizAnswer(index)}
                      className="w-full p-4 text-left rounded-xl border-3 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      {String.fromCharCode(65 + index)}. {answer}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )
    }

    // Catch Coins Game
    if (selectedGame.id === 'catch-coins') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 p-4 relative overflow-hidden">
          {/* Timer and score */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="retro-card">
              <div className="retro-card-body flex justify-between py-2">
                <div>
                  <p className="text-sm text-gray-500">Time:</p>
                  <p className="text-xl font-bold">{catchTime}s</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Caught:</p>
                  <p className="text-xl font-bold text-green-600">${catchScore}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Street performer avatar */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
            <div className="text-6xl">🎭</div>
          </div>

          {/* Falling coins */}
          {fallingCoins.map(coin => (
            <motion.button
              key={coin.id}
              className="absolute text-4xl cursor-pointer"
              style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
              onClick={() => handleCatchCoin(coin.id, coin.value)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
            >
              {coin.value >= 25 ? '💎' : coin.value >= 10 ? '💵' : coin.value >= 5 ? '🪙' : '🔵'}
            </motion.button>
          ))}

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-center text-white text-sm bg-black/30 rounded-full py-2 px-4">
              Tap the falling coins to catch them! 🪙
            </p>
          </div>
        </div>
      )
    }

    // Default fallback
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="retro-card p-8 text-center">
          <p>Game loading...</p>
          <button onClick={() => finishGame(50)} className="retro-btn retro-btn-blue mt-4">
            Complete (Demo)
          </button>
        </div>
      </div>
    )
  }

  // Result screen
  if (phase === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="retro-card max-w-md w-full"
        >
          <div className="retro-card-header bg-gradient-to-r from-green-500 to-emerald-500">
            💼 Job Complete!
          </div>
          <div className="retro-card-body text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: 3, duration: 0.3 }}
              className="text-6xl mb-4"
            >
              {gameScore >= 70 ? '🎉' : gameScore >= 40 ? '👍' : '😅'}
            </motion.div>
            
            <h2 className="text-xl font-bold mb-2">
              {gameScore >= 70 ? 'Great Job!' : gameScore >= 40 ? 'Not Bad!' : 'Keep Trying!'}
            </h2>
            
            <p className="text-gray-600 mb-4">Score: {gameScore}%</p>
            
            <div className="bg-green-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500">You earned:</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-green-600"
              >
                +${Math.max(selectedGame?.minReward || 0, Math.floor((selectedGame?.reward || 0) * (gameScore / 100)))}
              </motion.p>
            </div>
            
            <div className="bg-gray-100 rounded-xl p-4 mb-6">
              <div className="flex justify-between">
                <span>Total earned:</span>
                <span className="font-bold">${earnedMoney}</span>
              </div>
              <div className="flex justify-between">
                <span>Still need:</span>
                <span className="font-bold text-orange-600">
                  ${Math.max(0, debtAmount - earnedMoney)}
                </span>
              </div>
            </div>
            
            {earnedMoney >= debtAmount ? (
              <button 
                onClick={() => onComplete(earnedMoney)}
                className="retro-btn retro-btn-green w-full"
              >
                🎉 Back to the Game!
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => setPhase('select')}
                  className="retro-btn retro-btn-blue flex-1"
                >
                  💼 More Jobs
                </button>
                <button 
                  onClick={onGiveUp}
                  className="retro-btn retro-btn-red flex-1"
                >
                  😞 Give Up
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
