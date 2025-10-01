import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, TrendUp, Timer } from '@phosphor-icons/react'

interface InvestmentGalaxy3DProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  difficulty: string
}

export function InvestmentGalaxy3D({ onComplete, onExit, difficulty }: InvestmentGalaxy3DProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  // Game timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      onComplete(score)
    }
  }, [timeLeft, score, onComplete])

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-emerald-900 relative">
      {/* Game UI */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Game
          </Button>
          
          <div className="flex items-center gap-6">
            <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
              <CardContent className="flex items-center gap-2 p-3 text-white">
                <TrendUp className="w-5 h-5 text-green-400" />
                <span className="font-bold text-lg">Score: {score}</span>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
              <CardContent className="flex items-center gap-2 p-3 text-white">
                <Timer className="w-5 h-5 text-blue-400" />
                <span className="font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <Progress value={(timeLeft / 300) * 100} className="h-2" />
        </div>
      </div>

      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center space-y-4">
          <TrendUp className="w-24 h-24 mx-auto text-green-400" />
          <h2 className="text-3xl font-bold">Investment Galaxy 3D</h2>
          <p className="text-lg text-white/80">Coming Soon!</p>
          <p className="text-sm text-white/60 max-w-md">
            Explore a 3D galaxy of investment opportunities across different planets 
            and asset classes with realistic physics and market dynamics.
          </p>
        </div>
      </div>
    </div>
  )
}