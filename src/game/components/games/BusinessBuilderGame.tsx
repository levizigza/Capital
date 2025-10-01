import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Building } from '@phosphor-icons/react'

interface BusinessBuilderGameProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

export function BusinessBuilderGame({ onComplete, onExit, userTier = 'middle' }: BusinessBuilderGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)

  const startGame = () => {
    setGameState('playing')
    setTimeout(() => {
      setScore(25000)
      setGameState('ended')
    }, 5000)
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Built!</h2>
            <p className="text-gray-600 mb-6">Your business is profitable!</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Profit:</span>
                <span className="font-bold text-green-600">${score}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl font-semibold">Business Builder</h1>
          </div>
        </div>
      </div>

      <div className="p-8">
        {gameState === 'ready' ? (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-6">🏢</div>
                <h2 className="text-2xl font-bold mb-4">Business Builder</h2>
                <p className="text-gray-600 mb-6">
                  Run a virtual business, make strategic decisions, and grow your profit!
                </p>
                <Button onClick={startGame} size="lg" className="bg-orange-600 hover:bg-orange-700">
                  Start Business
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg">Building your business empire...</p>
            <div className="mt-8 text-6xl">🏗️</div>
          </div>
        )}
      </div>
    </div>
  )
}