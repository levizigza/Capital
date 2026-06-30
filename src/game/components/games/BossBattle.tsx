import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Heart, Sword, Shield, Coins, Star, Lightning, Brain } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Boss } from '@/components/PokemonWorldMap'
import { musicService } from '@/lib/music-service'

interface BossBattleProps {
  boss: Boss
  neighborhoodId: string
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
}

interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
  category: 'savings' | 'budget' | 'investing' | 'credit' | 'business'
  difficulty: number
}

// Financial literacy questions for boss battles
const QUESTIONS: Question[] = [
  // Savings questions
  { id: 'q1', question: 'What is the best reason to save money?', options: ['To buy everything you want now', 'To prepare for future needs and emergencies', 'To show off to friends', 'Saving is not important'], correctIndex: 1, category: 'savings', difficulty: 1 },
  { id: 'q2', question: 'What happens when you put money in a savings account?', options: ['It disappears', 'It earns interest over time', 'It stays exactly the same', 'The bank takes it'], correctIndex: 1, category: 'savings', difficulty: 1 },
  { id: 'q3', question: 'How much of your allowance should you try to save?', options: ['Nothing', 'Everything', 'At least 10-20%', 'Only when you feel like it'], correctIndex: 2, category: 'savings', difficulty: 1 },
  
  // Budget questions
  { id: 'q4', question: 'What is a budget?', options: ['A type of bank account', 'A plan for how to spend and save money', 'A credit card', 'A way to borrow money'], correctIndex: 1, category: 'budget', difficulty: 1 },
  { id: 'q5', question: 'Which is a "need" vs a "want"?', options: ['Video games are a need', 'Food and shelter are needs', 'Toys are needs', 'Candy is a need'], correctIndex: 1, category: 'budget', difficulty: 1 },
  { id: 'q6', question: 'What should you do if you spend more than you earn?', options: ['Keep spending', 'Reduce expenses or earn more', 'Ignore it', 'Borrow more money'], correctIndex: 1, category: 'budget', difficulty: 2 },
  
  // Investing questions
  { id: 'q7', question: 'What is compound interest?', options: ['Interest on your interest', 'A type of loan', 'A bank fee', 'A savings account'], correctIndex: 0, category: 'investing', difficulty: 2 },
  { id: 'q8', question: 'Why is diversification important in investing?', options: ['To put all eggs in one basket', 'To reduce risk by spreading investments', 'To make investing more complicated', 'It is not important'], correctIndex: 1, category: 'investing', difficulty: 2 },
  { id: 'q9', question: 'What is a stock?', options: ['A type of soup', 'Ownership share in a company', 'A bank account', 'A type of loan'], correctIndex: 1, category: 'investing', difficulty: 2 },
  
  // Credit questions
  { id: 'q10', question: 'What is a credit score?', options: ['Your test score', 'A number showing how reliable you are with money', 'Your age', 'How much money you have'], correctIndex: 1, category: 'credit', difficulty: 2 },
  { id: 'q11', question: 'What happens if you dont pay credit card bills on time?', options: ['Nothing', 'You pay extra fees and hurt your credit score', 'You get more money', 'The bank gives you a reward'], correctIndex: 1, category: 'credit', difficulty: 2 },
  { id: 'q12', question: 'What is interest on a loan?', options: ['Free money', 'The cost of borrowing money', 'A gift from the bank', 'Your salary'], correctIndex: 1, category: 'credit', difficulty: 2 },
  
  // Business questions
  { id: 'q13', question: 'What is profit?', options: ['Money you spend', 'Money earned minus money spent', 'A type of business', 'A loan'], correctIndex: 1, category: 'business', difficulty: 2 },
  { id: 'q14', question: 'What is an entrepreneur?', options: ['Someone who works for others', 'Someone who starts their own business', 'A type of bank', 'A government worker'], correctIndex: 1, category: 'business', difficulty: 2 },
  { id: 'q15', question: 'Why is customer service important for a business?', options: ['It is not important', 'Happy customers come back and tell friends', 'To make customers angry', 'To save money'], correctIndex: 1, category: 'business', difficulty: 3 },
]

type AttackType = 'knowledge' | 'savings' | 'budget'

const ATTACKS: Record<AttackType, { name: string; icon: React.ReactNode; damage: number; description: string }> = {
  knowledge: { name: 'Knowledge Strike', icon: <Brain className="w-6 h-6" />, damage: 25, description: 'Answer a question to deal damage!' },
  savings: { name: 'Savings Shield', icon: <Shield className="w-6 h-6" />, damage: 15, description: 'Protect yourself and deal light damage!' },
  budget: { name: 'Budget Blast', icon: <Lightning className="w-6 h-6" />, damage: 35, description: 'High damage but risky!' },
}

export function BossBattle({ boss, neighborhoodId, onComplete, onExit }: BossBattleProps) {
  const [gameState, setGameState] = useState<'intro' | 'battle' | 'question' | 'victory' | 'defeat'>('intro')
  const [playerHealth, setPlayerHealth] = useState(100)
  const [bossHealth, setBossHealth] = useState(boss.health)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAttack, setSelectedAttack] = useState<AttackType | null>(null)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState<string[]>([])
  const [showDamage, setShowDamage] = useState<{ type: 'player' | 'boss'; amount: number } | null>(null)
  const [isBossAttacking, setIsBossAttacking] = useState(false)
  const [combo, setCombo] = useState(0)

  // Play battle music
  useEffect(() => {
    musicService.playByCategory('battle')
    return () => {
      musicService.playByCategory('adventure')
    }
  }, [])

  // Check win/lose conditions
  useEffect(() => {
    if (bossHealth <= 0 && gameState === 'battle') {
      setGameState('victory')
      musicService.playByCategory('victory')
    } else if (playerHealth <= 0 && gameState === 'battle') {
      setGameState('defeat')
    }
  }, [bossHealth, playerHealth, gameState])

  const getRandomQuestion = useCallback(() => {
    const availableQuestions = QUESTIONS.filter(q => !usedQuestions.includes(q.id))
    if (availableQuestions.length === 0) {
      setUsedQuestions([])
      return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
    }
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
  }, [usedQuestions])

  const handleAttackSelect = (attack: AttackType) => {
    setSelectedAttack(attack)
    const question = getRandomQuestion()
    setCurrentQuestion(question)
    setUsedQuestions(prev => [...prev, question.id])
    setTotalQuestions(prev => prev + 1)
    setGameState('question')
  }

  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion || !selectedAttack) return

    const isCorrect = answerIndex === currentQuestion.correctIndex
    const attack = ATTACKS[selectedAttack]
    
    if (isCorrect) {
      // Player deals damage
      const comboBonus = Math.floor(combo * 5)
      const totalDamage = attack.damage + comboBonus
      setBossHealth(prev => Math.max(0, prev - totalDamage))
      setShowDamage({ type: 'boss', amount: totalDamage })
      setScore(prev => prev + 100 + comboBonus)
      setCorrectAnswers(prev => prev + 1)
      setCombo(prev => prev + 1)
      toast.success(`Correct! ${totalDamage} damage! ${combo > 0 ? `🔥 ${combo + 1}x Combo!` : ''}`)
    } else {
      // Boss counterattacks
      const bossDamage = Math.floor(20 + Math.random() * 15)
      setPlayerHealth(prev => Math.max(0, prev - bossDamage))
      setShowDamage({ type: 'player', amount: bossDamage })
      setCombo(0)
      toast.error(`Wrong! Boss attacks for ${bossDamage} damage!`)
    }

    setTimeout(() => {
      setShowDamage(null)
      setCurrentQuestion(null)
      setSelectedAttack(null)
      
      if (bossHealth > 0 && playerHealth > 0) {
        // Boss turn (automatic light attack)
        setIsBossAttacking(true)
        setTimeout(() => {
          const bossAttackDamage = Math.floor(5 + Math.random() * 10)
          setPlayerHealth(prev => Math.max(0, prev - bossAttackDamage))
          setShowDamage({ type: 'player', amount: bossAttackDamage })
          toast.warning(`${boss.name} attacks! -${bossAttackDamage} HP`)
          setTimeout(() => {
            setShowDamage(null)
            setIsBossAttacking(false)
            setGameState('battle')
          }, 500)
        }, 500)
      } else {
        setGameState('battle')
      }
    }, 1500)
  }

  const startBattle = () => {
    setGameState('battle')
  }

  const handleVictory = () => {
    const finalScore = score + (playerHealth * 5) + (correctAnswers * 50)
    onComplete(finalScore, {
      bossId: boss.id,
      neighborhoodId,
      correctAnswers,
      totalQuestions,
      accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      healthRemaining: playerHealth,
      rewards: boss.rewards
    })
  }

  // Intro Screen
  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1 }}
        >
          <Card className="max-w-lg w-full bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-yellow-500 text-white">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-9xl mb-6"
              >
                {boss.icon}
              </motion.div>
              
              <h1 className="text-4xl font-black text-yellow-400 mb-2">
                {boss.name}
              </h1>
              <p className="text-xl text-orange-300 mb-4">{boss.title}</p>
              
              <Badge variant="destructive" className="mb-6 text-lg px-4 py-1">
                {boss.difficulty} Boss
              </Badge>
              
              <p className="text-gray-300 mb-8">{boss.description}</p>
              
              <div className="bg-black/50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-yellow-400 mb-2">Battle Rewards:</h3>
                <div className="flex justify-center gap-6">
                  <span className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    {boss.rewards.coins}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-purple-400" />
                    {boss.rewards.xp} XP
                  </span>
                </div>
                <p className="text-sm text-green-400 mt-2">{boss.rewards.specialItem}</p>
              </div>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={onExit}
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Retreat
                </Button>
                <Button
                  onClick={startBattle}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-lg"
                >
                  <Sword className="mr-2" />
                  FIGHT!
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Victory Screen
  if (gameState === 'victory') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <Card className="max-w-lg w-full bg-white border-4 border-yellow-500">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-8xl mb-4"
              >
                🏆
              </motion.div>
              
              <h1 className="text-4xl font-black text-yellow-600 mb-2">VICTORY!</h1>
              <p className="text-xl text-gray-600 mb-6">You defeated {boss.name}!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div>
              
              <div className="bg-yellow-100 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-yellow-700 mb-2">Rewards Earned:</h3>
                <div className="flex justify-center gap-6">
                  <span className="flex items-center gap-1 text-yellow-700">
                    <Coins className="w-5 h-5" />
                    +{boss.rewards.coins}
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <Star className="w-5 h-5" />
                    +{boss.rewards.xp} XP
                  </span>
                </div>
                <p className="text-green-600 font-bold mt-2">{boss.rewards.specialItem}</p>
              </div>
              
              <Button onClick={handleVictory} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold">
                Claim Rewards
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Defeat Screen
  if (gameState === 'defeat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-lg w-full bg-gray-800 border-4 border-red-500 text-white">
            <CardContent className="p-8 text-center">
              <div className="text-8xl mb-4">💔</div>
              
              <h1 className="text-4xl font-black text-red-500 mb-2">DEFEATED</h1>
              <p className="text-xl text-gray-400 mb-6">{boss.name} was too strong...</p>
              
              <p className="text-gray-300 mb-6">
                Don't give up! Practice more games to strengthen your financial knowledge!
              </p>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={onExit}
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Return to Map
                </Button>
                <Button
                  onClick={() => {
                    setPlayerHealth(100)
                    setBossHealth(boss.health)
                    setScore(0)
                    setCorrectAnswers(0)
                    setTotalQuestions(0)
                    setUsedQuestions([])
                    setCombo(0)
                    setGameState('intro')
                  }}
                  className="flex-1 bg-red-600 text-white"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Battle Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-orange-900 p-4">
      {/* Health Bars */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Player Health */}
          <div className="bg-black/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-500" weight="fill" />
              <span className="text-white font-bold">You</span>
              {combo > 0 && (
                <Badge className="bg-orange-500 text-white">🔥 {combo}x Combo</Badge>
              )}
            </div>
            <Progress value={playerHealth} className="h-4" />
            <div className="text-right text-white text-sm mt-1">{playerHealth}/100 HP</div>
          </div>
          
          {/* Boss Health */}
          <div className="bg-black/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{boss.icon}</span>
              <span className="text-white font-bold">{boss.name}</span>
            </div>
            <Progress value={(bossHealth / boss.health) * 100} className="h-4 bg-red-900" />
            <div className="text-right text-white text-sm mt-1">{bossHealth}/{boss.health} HP</div>
          </div>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-black/30 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
          {/* Boss */}
          <motion.div
            animate={isBossAttacking ? { x: [0, -50, 0], scale: [1, 1.2, 1] } : { y: [0, -10, 0] }}
            transition={isBossAttacking ? { duration: 0.3 } : { repeat: Infinity, duration: 2 }}
            className="text-center"
          >
            <div className="text-9xl mb-4 drop-shadow-2xl">{boss.icon}</div>
            
            {/* Damage indicator */}
            <AnimatePresence>
              {showDamage && showDamage.type === 'boss' && (
                <motion.div
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{ y: -50, opacity: 0, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 text-4xl font-black text-red-500"
                >
                  -{showDamage.amount}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Player damage indicator */}
          <AnimatePresence>
            {showDamage && showDamage.type === 'player' && (
              <motion.div
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ y: 50, opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 text-4xl font-black text-red-500"
              >
                -{showDamage.amount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Question Panel */}
        {gameState === 'question' && currentQuestion && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4"
          >
            <Card className="bg-white/95">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{currentQuestion.question}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleAnswer(index)}
                      className="h-auto py-4 text-left justify-start"
                    >
                      <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Attack Selection */}
        {gameState === 'battle' && !isBossAttacking && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4"
          >
            <Card className="bg-white/95">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Choose Your Attack:</h3>
                <div className="grid grid-cols-3 gap-4">
                  {(Object.entries(ATTACKS) as [AttackType, typeof ATTACKS[AttackType]][]).map(([key, attack]) => (
                    <Button
                      key={key}
                      variant="outline"
                      onClick={() => handleAttackSelect(key)}
                      className="h-auto py-4 flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-400"
                    >
                      <div className="text-purple-600">{attack.icon}</div>
                      <div className="font-bold">{attack.name}</div>
                      <div className="text-xs text-gray-500">{attack.damage} DMG</div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Score Display */}
        <div className="mt-4 flex justify-center gap-8">
          <div className="bg-white/20 px-6 py-2 rounded-full text-white">
            <span className="font-bold">Score: {score}</span>
          </div>
          <div className="bg-white/20 px-6 py-2 rounded-full text-white">
            <span className="font-bold">Correct: {correctAnswers}/{totalQuestions}</span>
          </div>
        </div>

        {/* Exit Button */}
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={onExit} className="text-white/70 hover:text-white">
            Retreat from Battle
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BossBattle
