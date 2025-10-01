import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Calculator, Timer, Target } from '@phosphor-icons/react'
import * as THREE from 'three'

interface BudgetBuilder3DProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  difficulty: string
}

export function BudgetBuilder3D({ onComplete, onExit, difficulty }: BudgetBuilder3DProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes
  const [towersBuilt, setTowersBuilt] = useState(0)

  // Game timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      onComplete(score, { towersBuilt })
    }
  }, [timeLeft, score, towersBuilt, onComplete])

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-900 relative">
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
                <Calculator className="w-5 h-5 text-blue-400" />
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
          <Progress value={(timeLeft / 180) * 100} className="h-2" />
        </div>
      </div>

      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center space-y-4">
          <Calculator className="w-24 h-24 mx-auto text-blue-400" />
          <h2 className="text-3xl font-bold">Budget Builder 3D</h2>
          <p className="text-lg text-white/80">Coming Soon!</p>
          <p className="text-sm text-white/60 max-w-md">
            Build and balance 3D budget towers by strategically placing expense blocks. 
            Learn the 50/30/20 rule through immersive architectural gameplay.
          </p>
        </div>
      </div>
    </div>
  )
}