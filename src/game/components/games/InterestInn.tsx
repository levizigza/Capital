import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { ArrowLeft, TrendUp, Calculator } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface InterestInnGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

export function InterestInnGame({ onComplete, onExit, userTier = 'middle' }: InterestInnGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [principal, setPrincipal] = useState(1000)
  const [rate, setRate] = useState(5)
  const [time, setTime] = useState(10)
  const [userGuess, setUserGuess] = useState(0)
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [roundsCompleted, setRoundsCompleted] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameState])

  useEffect(() => {
    if (gameState === 'playing') {
      generateNewRound()
    }
  }, [round, gameState])

  const calculateCompoundInterest = (p: number, r: number, t: number) => {
    return p * Math.pow(1 + r / 100, t)
  }

  const generateNewRound = () => {
    const newPrincipal = Math.floor(Math.random() * 5000) + 500
    const newRate = Math.floor(Math.random() * 10) + 2
    const newTime = Math.floor(Math.random() * 20) + 5
    
    setPrincipal(newPrincipal)
    setRate(newRate)
    setTime(newTime)
    
    const answer = calculateCompoundInterest(newPrincipal, newRate, newTime)
    setCorrectAnswer(answer)
    setUserGuess(0)
  }

  const checkAnswer = () => {
    const difference = Math.abs(userGuess - correctAnswer)
    const accuracy = 1 - (difference / correctAnswer)
    const roundScore = Math.max(0, accuracy * 1000)
    
    setScore(prev => prev + roundScore)
    setRoundsCompleted(prev => prev + 1)

    if (accuracy > 0.9) {
      toast.success(`Excellent! You were ${(accuracy * 100).toFixed(1)}% accurate!`, { duration: 2000 })
    } else if (accuracy > 0.7) {
      toast.success(`Good! You were ${(accuracy * 100).toFixed(1)}% accurate!`, { duration: 2000 })
    } else {
      toast.error(`Close! The answer was $${correctAnswer.toFixed(2)}`, { duration: 2000 })
    }

    if (roundsCompleted >= 4) {
      endGame()
    } else {
      setRound(prev => prev + 1)
      setTimeout(() => generateNewRound(), 1000)
    }
  }

  const endGame = () => {
    setGameState('ended')
    setTimeout(() => {
      onComplete(Math.floor(score), {
        roundsCompleted,
        finalAccuracy: roundsCompleted > 0 ? score / (roundsCompleted * 1000) : 0
      })
    }, 2000)
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setRound(1)
    setRoundsCompleted(0)
    setTimeLeft(60)
    generateNewRound()
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏨</div>
            <h2 className="text-3xl font-bold mb-4">Interest Inn</h2>
            <p className="text-lg text-gray-600 mb-6">
              Learn compound interest by calculating how much money grows over time!
              Adjust the slider to guess the final amount after interest compounds.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-sm font-semibold">Principal</p>
                <p className="text-xs text-gray-600">Starting amount</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <p className="text-sm font-semibold">Rate</p>
                <p className="text-xs text-gray-600">Interest %</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl mb-2">⏰</div>
                <p className="text-sm font-semibold">Time</p>
                <p className="text-xs text-gray-600">Years</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={onExit} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2" /> Exit
              </Button>
              <Button onClick={startGame} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Start Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-4">Learning Complete!</h2>
            <p className="text-2xl font-bold text-green-600 mb-2">Score: {Math.floor(score)}</p>
            <p className="text-lg text-gray-600 mb-6">
              Rounds Completed: {roundsCompleted} • Average Accuracy: {roundsCompleted > 0 ? ((score / (roundsCompleted * 1000)) * 100).toFixed(1) : 0}%
            </p>
            <Button onClick={() => onComplete(score)} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const maxGuess = correctAnswer * 2
  const minGuess = principal

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-50 p-4">
      {/* HUD */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Round</div>
              <div className="text-2xl font-bold">{round}/5</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Score</div>
              <div className="text-2xl font-bold">{Math.floor(score)}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Completed</div>
              <div className="text-2xl font-bold">{roundsCompleted}/5</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Time</div>
              <div className="text-2xl font-bold">{timeLeft}s</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Problem Display */}
      <div className="max-w-4xl mx-auto mb-6">
        <Card className="bg-white/90">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Calculate Compound Interest</h3>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Principal</div>
                <div className="text-3xl font-bold text-purple-600">${principal}</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Interest Rate</div>
                <div className="text-3xl font-bold text-pink-600">{rate}%</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Time Period</div>
                <div className="text-3xl font-bold text-indigo-600">{time} years</div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-600 mb-3 text-center">
                What will be the final amount after compound interest?
              </div>
              <Slider
                value={[userGuess]}
                onValueChange={(value) => setUserGuess(value[0])}
                min={minGuess}
                max={maxGuess}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>${minGuess}</span>
                <span className="text-lg font-bold text-purple-600">${Math.floor(userGuess)}</span>
                <span>${Math.floor(maxGuess)}</span>
              </div>
            </div>

            <Button 
              onClick={checkAnswer} 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={userGuess === 0}
            >
              <Calculator className="mr-2" /> Check Answer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Formula Hint */}
      <div className="max-w-4xl mx-auto mb-4">
        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-gray-700 text-center">
              <strong>Formula:</strong> Final Amount = Principal × (1 + Rate/100)<sup>Time</sup>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exit Button */}
      <div className="max-w-4xl mx-auto">
        <Button onClick={onExit} variant="outline" className="bg-white/90">
          <ArrowLeft className="mr-2" /> Exit
        </Button>
      </div>
    </div>
  )
}
