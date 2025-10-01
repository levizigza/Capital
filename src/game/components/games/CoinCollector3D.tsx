import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Coins, Timer, Target } from '@phosphor-icons/react'
import * as THREE from 'three'

interface CoinCollector3DProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  difficulty: string
}

// Player character component
function Player({ position, onMove }: { 
  position: [number, number, number], 
  onMove: (position: [number, number, number]) => void
}) {
  const playerRef = useRef<THREE.Mesh>(null)
  const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false, space: false })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeys(prev => ({ ...prev, w: true }))
          break
        case 'KeyS':
        case 'ArrowDown':
          setKeys(prev => ({ ...prev, s: true }))
          break
        case 'KeyA':
        case 'ArrowLeft':
          setKeys(prev => ({ ...prev, a: true }))
          break
        case 'KeyD':
        case 'ArrowRight':
          setKeys(prev => ({ ...prev, d: true }))
          break
        case 'Space':
          event.preventDefault()
          setKeys(prev => ({ ...prev, space: true }))
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeys(prev => ({ ...prev, w: false }))
          break
        case 'KeyS':
        case 'ArrowDown':
          setKeys(prev => ({ ...prev, s: false }))
          break
        case 'KeyA':
        case 'ArrowLeft':
          setKeys(prev => ({ ...prev, a: false }))
          break
        case 'KeyD':
        case 'ArrowRight':
          setKeys(prev => ({ ...prev, d: false }))
          break
        case 'Space':
          setKeys(prev => ({ ...prev, space: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (!playerRef.current) return
    
    const speed = 5 * delta
    const jumpHeight = 0.1
    
    if (keys.w) playerRef.current.position.z -= speed
    if (keys.s) playerRef.current.position.z += speed
    if (keys.a) playerRef.current.position.x -= speed
    if (keys.d) playerRef.current.position.x += speed
    if (keys.space) {
      playerRef.current.position.y += jumpHeight
      setTimeout(() => {
        if (playerRef.current) playerRef.current.position.y = Math.max(0.5, playerRef.current.position.y - jumpHeight)
      }, 200)
    }
    
    // Keep player within bounds
    playerRef.current.position.x = Math.max(-20, Math.min(20, playerRef.current.position.x))
    playerRef.current.position.z = Math.max(-20, Math.min(20, playerRef.current.position.z))
    playerRef.current.position.y = Math.max(0.5, playerRef.current.position.y)
    
    onMove([playerRef.current.position.x, playerRef.current.position.y, playerRef.current.position.z])
  })

  return (
    <mesh ref={playerRef} position={position} castShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.4} />
    </mesh>
  )
}

// Coin component with collection logic
function Coin({ position, value, onCollect, id, playerPosition }: { 
  position: [number, number, number], 
  value: number, 
  onCollect: (id: string, value: number) => void,
  id: string,
  playerPosition: [number, number, number]
}) {
  const coinRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (coinRef.current) {
      coinRef.current.rotation.y += 0.02
      coinRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + parseFloat(id.split('-')[1] || '0')) * 0.3
      
      // Check collision with player
      const distance = Math.sqrt(
        Math.pow(coinRef.current.position.x - playerPosition[0], 2) +
        Math.pow(coinRef.current.position.y - playerPosition[1], 2) +
        Math.pow(coinRef.current.position.z - playerPosition[2], 2)
      )
      
      if (distance < 1) {
        onCollect(id, value)
      }
    }
  })

  return (
    <group>
      <mesh ref={coinRef} position={position} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={position}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 16]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
      </mesh>
      <Text
        position={[position[0], position[1] + 0.8, position[2]]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ${value}
      </Text>
    </group>
  )
}

// Expense obstacle component
function Expense({ position, value, onHit, id, playerPosition }: { 
  position: [number, number, number], 
  value: number, 
  onHit: (id: string, value: number) => void,
  id: string,
  playerPosition: [number, number, number]
}) {
  const expenseRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (expenseRef.current) {
      expenseRef.current.rotation.x += 0.01
      expenseRef.current.rotation.z += 0.01
      
      // Check collision with player
      const distance = Math.sqrt(
        Math.pow(expenseRef.current.position.x - playerPosition[0], 2) +
        Math.pow(expenseRef.current.position.y - playerPosition[1], 2) +
        Math.pow(expenseRef.current.position.z - playerPosition[2], 2)
      )
      
      if (distance < 1) {
        onHit(id, value)
      }
    }
  })

  return (
    <group>
      <mesh ref={expenseRef} position={position} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={position}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
      </mesh>
      <Text
        position={[position[0], position[1] + 0.8, position[2]]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        -${value}
      </Text>
    </group>
  )
}

// Game environment
function GameEnvironment() {
  return (
    <>
      {/* Ground */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[50, 1, 50]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[25, 5, 0]}>
        <boxGeometry args={[0.5, 10, 50]} />
        <meshStandardMaterial color="#374151" transparent opacity={0.7} />
      </mesh>
      
      <mesh position={[-25, 5, 0]}>
        <boxGeometry args={[0.5, 10, 50]} />
        <meshStandardMaterial color="#374151" transparent opacity={0.7} />
      </mesh>

      <mesh position={[0, 5, 25]}>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#374151" transparent opacity={0.7} />
      </mesh>

      <mesh position={[0, 5, -25]}>
        <boxGeometry args={[50, 10, 0.5]} />
        <meshStandardMaterial color="#374151" transparent opacity={0.7} />
      </mesh>
    </>
  )
}

export function CoinCollector3D({ onComplete, onExit, difficulty }: CoinCollector3DProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [coinsCollected, setCoinsCollected] = useState(0)
  const [expensesHit, setExpensesHit] = useState(0)
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0.5, 0])
  const [gameItems, setGameItems] = useState<{
    coins: Array<{ id: string; position: [number, number, number]; value: number; collected: boolean }>;
    expenses: Array<{ id: string; position: [number, number, number]; value: number; hit: boolean }>;
  }>({ coins: [], expenses: [] })

  // Generate random game items
  useEffect(() => {
    const coins = Array.from({ length: 15 }, (_, i) => ({
      id: `coin-${i}`,
      position: [
        (Math.random() - 0.5) * 30,
        Math.random() * 4 + 2,
        (Math.random() - 0.5) * 30
      ] as [number, number, number],
      value: Math.floor(Math.random() * 50) + 10,
      collected: false
    }))

    const expenses = Array.from({ length: 10 }, (_, i) => ({
      id: `expense-${i}`,
      position: [
        (Math.random() - 0.5) * 30,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 30
      ] as [number, number, number],
      value: Math.floor(Math.random() * 30) + 5,
      hit: false
    }))

    setGameItems({ coins, expenses })
  }, [])

  // Game timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Game over
      const finalScore = Math.max(0, score)
      onComplete(finalScore, { 
        coinsCollected, 
        expensesHit, 
        efficiency: coinsCollected / (coinsCollected + expensesHit) || 0 
      })
    }
  }, [timeLeft, score, expensesHit, coinsCollected, onComplete])

  const handleCoinCollect = (id: string, value: number) => {
    setGameItems(prev => ({
      ...prev,
      coins: prev.coins.map(coin => 
        coin.id === id ? { ...coin, collected: true } : coin
      )
    }))
    setScore(prev => prev + value)
    setCoinsCollected(prev => prev + 1)
  }

  const handleExpenseHit = (id: string, value: number) => {
    setGameItems(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense => 
        expense.id === id ? { ...expense, hit: true } : expense
      )
    }))
    setScore(prev => prev - value)
    setExpensesHit(prev => prev + 1)
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-blue-900 relative">
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
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-lg">${score}</span>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
              <CardContent className="flex items-center gap-2 p-3 text-white">
                <Timer className="w-5 h-5 text-blue-400" />
                <span className="font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
              <CardContent className="flex items-center gap-2 p-3 text-white">
                <Target className="w-5 h-5 text-green-400" />
                <span className="font-bold">{coinsCollected}/{gameItems.coins.length}</span>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <Progress value={(timeLeft / 120) * 100} className="h-2" />
        </div>
      </div>

      {/* Controls Instructions */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
          <CardContent className="p-4 text-white">
            <p className="text-sm font-medium mb-2">Controls:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>WASD / Arrow Keys: Move</div>
              <div>Space: Jump</div>
              <div className="col-span-2 mt-2 text-yellow-300">
                💰 Collect coins to earn money • ❌ Avoid red expenses!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Game Scene */}
      <Canvas shadows camera={{ position: [0, 15, 20], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#3b82f6" />

        <GameEnvironment />
        
        <Player 
          position={playerPosition} 
          onMove={setPlayerPosition}
        />
        
        {/* Render coins */}
        {gameItems.coins.filter(coin => !coin.collected).map(coin => (
          <Coin
            key={coin.id}
            id={coin.id}
            position={coin.position}
            value={coin.value}
            onCollect={handleCoinCollect}
            playerPosition={playerPosition}
          />
        ))}
        
        {/* Render expenses */}
        {gameItems.expenses.filter(expense => !expense.hit).map(expense => (
          <Expense
            key={expense.id}
            id={expense.id}
            position={expense.position}
            value={expense.value}
            onHit={handleExpenseHit}
            playerPosition={playerPosition}
          />
        ))}
        
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  )
}