import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, CreditCard } from '@phosphor-icons/react'

interface CreditDefenderGameProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

export function CreditDefenderGame({ onComplete, onExit, userTier = 'middle' }: CreditDefenderGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)

  const startGame = () => {
    setGameState('playing')
    setTimeout(() => {
      setScore(850)
      setGameState('ended')
    }, 3000)
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Credit Defended!</h2>
            <p className="text-gray-600 mb-6">You protected your credit score!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Credit Score:</span>
                <span className="font-bold text-green-600">{score}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={startGame} className="flex-1">
                Play Again
              </Button>
              <Button onClick={() => onComplete(score)} variant="outline" className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold">Credit Score Defender</h1>
          </div>
        </div>
      </div>

      <div className="p-8">
        {gameState === 'ready' ? (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-6">🛡️</div>
                <h2 className="text-2xl font-bold mb-4">Credit Score Defender</h2>
                <p className="text-gray-600 mb-6">
                  Protect your credit score from bad financial decisions in this tower defense game!
                </p>
                <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Defend Credit
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg">Defending your credit score...</p>
            <div className="mt-8 text-6xl">🛡️</div>
          </div>
        )}
      </div>
    </div>
  )
}