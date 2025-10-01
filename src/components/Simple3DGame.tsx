import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Coins, Timer } from '@phosphor-icons/react'
import { ErrorBoundary } from 'react-error-boundary'
import * as THREE from 'three'

// Simple fallback game for when 3D is not available
function FallbackGame({ gameType, onComplete, score }: { 
  gameType: string, 
  onComplete: (score: number) => void, 
  score: number 
}) {
  const handleComplete = () => {
    const fallbackScore = score + 200 // Give some points for trying
    onComplete(fallbackScore)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎮</div>
        <h3 className="text-2xl font-bold text-slate-800">
          {gameType === 'coin-collector' && 'Coin Collection Complete!'}
          {gameType === 'budget-builder' && 'Budget Built Successfully!'}
          {gameType === 'investment-galaxy' && 'Investment Strategy Set!'}
        </h3>
        <p className="text-slate-600 max-w-md">
          {gameType === 'coin-collector' && 'You\'ve successfully learned about saving and collecting financial resources.'}
          {gameType === 'budget-builder' && 'You\'ve mastered the basics of budget allocation and financial planning.'}
          {gameType === 'investment-galaxy' && 'You\'ve explored different investment options and their potential returns.'}
        </p>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-slate-500 mb-2">Learning Objectives Achieved:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {gameType === 'coin-collector' && (
              <>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Savings Skills</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Resource Management</span>
              </>
            )}
            {gameType === 'budget-builder' && (
              <>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Budget Planning</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Financial Allocation</span>
              </>
            )}
            {gameType === 'investment-galaxy' && (
              <>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Investment Strategy</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">Risk Assessment</span>
              </>
            )}
          </div>
        </div>
        <Button 
          onClick={handleComplete}
          size="lg"
          className="bg-slate-800 hover:bg-slate-700 px-8"
        >
          Complete & Continue
        </Button>
      </div>
    </div>
  )
}

// Error Boundary for 3D components
function Simple3DErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="h-96 flex items-center justify-center bg-slate-50 rounded-lg">
      <div className="text-center space-y-4">
        <div className="text-6xl">⚠️</div>
        <h3 className="text-xl font-bold text-slate-800">3D Game Error</h3>
        <p className="text-slate-600">Unable to load 3D graphics</p>
        <Button onClick={resetErrorBoundary} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  )
}

interface Simple3DGameProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  gameType: 'coin-collector' | 'budget-builder' | 'investment-galaxy'
}

// Simple 3D Coin component
function Coin({ position, collected, onCollect }: { 
  position: [number, number, number], 
  collected: boolean,
  onCollect: () => void 
}) {
  const meshRef = useRef<THREE.Mesh | null>(null)
  
  useFrame((state, delta) => {
    if (!collected && meshRef.current && state?.clock && meshRef.current.rotation && meshRef.current.position) {
      try {
        if (typeof delta === 'number' && !isNaN(delta) && isFinite(delta)) {
          meshRef.current.rotation.y += delta * 2
          const time = state.clock.elapsedTime || 0
          if (typeof time === 'number' && !isNaN(time) && isFinite(time)) {
            meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1
          }
        }
      } catch (error) {
        // Silently handle any transformation errors
        console.warn('Coin animation error:', error)
      }
    }
  })

  if (collected) return null

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onCollect}
      onPointerOver={() => {
        try {
          if (document?.body?.style) {
            document.body.style.cursor = 'pointer'
          }
        } catch (error) {
          console.warn('Pointer over error:', error)
        }
      }}
      onPointerOut={() => {
        try {
          if (document?.body?.style) {
            document.body.style.cursor = 'default'
          }
        } catch (error) {
          console.warn('Pointer out error:', error)
        }
      }}
    >
      <cylinderGeometry args={[0.3, 0.3, 0.1, 12]} />
      <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
    </mesh>
  )
}

// Simple 3D Budget Block component
function BudgetBlock({ position, category, amount, color }: { 
  position: [number, number, number],
  category: string,
  amount: number,
  color: string
}) {
  const meshRef = useRef<THREE.Mesh | null>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current && meshRef.current.rotation) {
      try {
        if (typeof delta === 'number' && !isNaN(delta) && isFinite(delta)) {
          meshRef.current.rotation.y += delta * 0.5
        }
      } catch (error) {
        console.warn('BudgetBlock animation error:', error)
      }
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, amount/1000, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, amount/2000 + 0.3, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {category}: ${amount}
      </Text>
    </group>
  )
}

// Simple 3D Planet component for investment game
function InvestmentPlanet({ position, type, returns }: { 
  position: [number, number, number],
  type: string,
  returns: number
}) {
  const meshRef = useRef<THREE.Mesh | null>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current && meshRef.current.rotation) {
      try {
        if (typeof delta === 'number' && !isNaN(delta) && isFinite(delta)) {
          meshRef.current.rotation.y += delta * 0.3
          meshRef.current.rotation.x += delta * 0.1
        }
      } catch (error) {
        console.warn('InvestmentPlanet animation error:', error)
      }
    }
  })

  const getColor = () => {
    switch (type) {
      case 'stocks': return '#4ade80'
      case 'bonds': return '#60a5fa'
      case 'crypto': return '#f59e0b'
      case 'real-estate': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={getColor()} />
      </mesh>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {type}
      </Text>
      <Text
        position={[0, -1, 0]}
        fontSize={0.12}
        color="green"
        anchorX="center"
        anchorY="middle"
      >
        {returns > 0 ? '+' : ''}{returns}%
      </Text>
    </group>
  )
}

export function Simple3DGame({ onComplete, onExit, gameType }: Simple3DGameProps) {
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [collected, setCollected] = useState<boolean[]>([])
  const [canvasError, setCanvasError] = useState(false)

  // Initialize game based on type
  useEffect(() => {
    try {
      if (gameType === 'coin-collector') {
        setCollected(new Array(10).fill(false))
      } else {
        setCollected([])
      }
    } catch (error) {
      console.warn('Game initialization error:', error)
      setCanvasError(true)
    }
  }, [gameType])

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('completed')
      onComplete(score)
    }
  }, [timeLeft, gameState, score, onComplete])

  const handleGameComplete = (score: number, timeSpent: number = 60) => {
    onComplete(score, timeSpent)
  }

  const handleCoinCollect = (index: number) => {
    try {
      if (collected.length > index && !collected[index]) {
        const newCollected = [...collected]
        newCollected[index] = true
        setCollected(newCollected)
        setScore(prevScore => prevScore + 100)
        
        if (newCollected.every(c => c === true)) {
          setGameState('completed')
          onComplete(score + 600) // Bonus for collecting all
        }
      }
    } catch (error) {
      console.warn('Coin collection error:', error)
    }
  }

  const renderGame = () => {
    try {
      switch (gameType) {
        case 'coin-collector':
          return (
            <>
              {/* Generate coins in a circle */}
              {collected.length > 0 && Array.from({ length: Math.min(10, collected.length) }, (_, i) => {
                const angle = (i / 10) * Math.PI * 2
                const radius = 3
                const x = Math.cos(angle) * radius
                const z = Math.sin(angle) * radius
                return (
                  <Coin
                    key={i}
                    position={[x, 0, z]}
                    collected={collected[i] || false}
                    onCollect={() => handleCoinCollect(i)}
                  />
                )
              })}
            </>
          )
        
        case 'budget-builder':
          return (
            <>
              <BudgetBlock position={[-2, 0, 0]} category="Housing" amount={1500} color="#3b82f6" />
              <BudgetBlock position={[0, 0, 0]} category="Food" amount={800} color="#10b981" />
              <BudgetBlock position={[2, 0, 0]} category="Transport" amount={600} color="#f59e0b" />
              <BudgetBlock position={[0, 0, 2]} category="Savings" amount={1000} color="#8b5cf6" />
            </>
          )
        
        case 'investment-galaxy':
          return (
            <>
              <InvestmentPlanet position={[-3, 0, 0]} type="stocks" returns={8.5} />
              <InvestmentPlanet position={[3, 0, 0]} type="bonds" returns={3.2} />
              <InvestmentPlanet position={[0, 0, -3]} type="crypto" returns={15.7} />
              <InvestmentPlanet position={[0, 0, 3]} type="real-estate" returns={5.4} />
            </>
          )
        
        default:
          return null
      }
    } catch (error) {
      console.warn('Game rendering error:', error)
      return null
    }
  }

  if (gameState === 'completed') {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h3 className="text-2xl font-bold text-slate-800">Game Complete!</h3>
          <p className="text-lg text-slate-600">Final Score: {score}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => onComplete(score)}>Continue</Button>
            <Button variant="outline" onClick={onExit}>Exit</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 bg-slate-50 rounded-lg overflow-hidden">
      {/* Game HUD */}
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <Button variant="ghost" onClick={onExit} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span className="font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-600" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>
        <div className="w-32">
          <Progress value={((60 - timeLeft) / 60) * 100} className="h-2" />
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="h-full">
        {canvasError ? (
          <FallbackGame 
            gameType={gameType} 
            onComplete={(fallbackScore) => handleGameComplete(fallbackScore)}
            score={score}
          />
        ) : (
          <ErrorBoundary
            FallbackComponent={Simple3DErrorFallback}
            onError={(error) => {
              console.error('3D Game Error:', error)
              setCanvasError(true)
            }}
          >
            <Suspense fallback={
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-2"></div>
                  <p>Loading 3D scene...</p>
                </div>
              </div>
            }>
              <Canvas 
                camera={{ position: [0, 5, 5], fov: 60 }}
                onCreated={(state) => {
                  // Ensure proper initialization
                  try {
                    if (state?.gl && state?.size) {
                      state.gl.setSize(state.size.width, state.size.height)
                    }
                    if (state?.gl?.domElement) {
                      state.gl.domElement.style.outline = 'none'
                    }
                    // Initialize clock if not present
                    if (state && !state.clock) {
                      state.clock = new THREE.Clock()
                    }
                  } catch (error) {
                    console.warn('Canvas initialization error:', error)
                    setCanvasError(true)
                  }
                }}
                gl={{ 
                  antialias: true,
                  alpha: false,
                  preserveDrawingBuffer: false 
                }}
                onError={(error) => {
                  console.error('Canvas error:', error)
                  setCanvasError(true)
                }}
              >
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} />
                <pointLight position={[-10, -10, -10]} intensity={0.3} />
                
                {/* Ground plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                  <planeGeometry args={[20, 20]} />
                  <meshStandardMaterial color="#f1f5f9" />
                </mesh>
                
                {renderGame()}
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}