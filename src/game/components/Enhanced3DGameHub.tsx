import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Text, PerspectiveCamera, Stars } from '@react-three/drei'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, Clock, Trophy, Star, Target, Calculator,
  PiggyBank, TrendUp, CreditCard, Building, Coins, Cube,
  Play, Sparkle, Rocket
} from '@phosphor-icons/react'
import { CoinCollector3D } from './games/CoinCollector3D'
import { BudgetBuilder3D } from './games/BudgetBuilder3D'
import { InvestmentGalaxy3D } from './games/InvestmentGalaxy3D'
import { CreditDefender3D } from './games/CreditDefender3D'
import { BusinessSimulator3D } from './games/BusinessSimulator3D'
import * as THREE from 'three'

interface GameHubProps {
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface Game3DInfo {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
  estimatedTime: string
  skills: string[]
  component: React.ComponentType<any>
  minAge: number
  color: string
  position: [number, number, number]
}

const games3D: Game3DInfo[] = [
  {
    id: 'coin-collector-3d',
    title: '3D Coin Collector',
    description: 'Navigate through a 3D world collecting coins while avoiding expenses using physics-based gameplay',
    icon: <Coins className="w-6 h-6" />,
    difficulty: 'Easy',
    estimatedTime: '3-5 min',
    skills: ['3D Navigation', 'Saving', 'Quick Decisions', 'Spatial Awareness'],
    component: CoinCollector3D,
    minAge: 8,
    color: '#f59e0b',
    position: [-4, 0, 0]
  },
  {
    id: 'budget-builder-3d',
    title: 'Budget Builder 3D',
    description: 'Construct and balance 3D budget towers by placing expense blocks strategically in space',
    icon: <Calculator className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '5-7 min',
    skills: ['3D Construction', 'Budgeting', 'Balance', 'Physics Understanding'],
    component: BudgetBuilder3D,
    minAge: 10,
    color: '#3b82f6',
    position: [-2, 0, 0]
  },
  {
    id: 'investment-galaxy-3d',
    title: 'Investment Galaxy',
    description: 'Explore a 3D galaxy of investment opportunities across different planets and asset classes',
    icon: <TrendUp className="w-6 h-6" />,
    difficulty: 'Hard',
    estimatedTime: '7-10 min',
    skills: ['Space Navigation', 'Portfolio Theory', 'Risk Assessment', '3D Strategy'],
    component: InvestmentGalaxy3D,
    minAge: 12,
    color: '#10b981',
    position: [0, 0, 0]
  },
  {
    id: 'credit-defender-3d',
    title: 'Credit Score Fortress',
    description: 'Defend your 3D credit fortress from bad financial decisions using tower defense mechanics',
    icon: <CreditCard className="w-6 h-6" />,
    difficulty: 'Medium',
    estimatedTime: '6-8 min',
    skills: ['3D Defense', 'Credit Management', 'Strategic Planning', 'Risk Assessment'],
    component: CreditDefender3D,
    minAge: 14,
    color: '#8b5cf6',
    position: [2, 0, 0]
  },
  {
    id: 'business-simulator-3d',
    title: 'Business Empire 3D',
    description: 'Build and manage a 3D business empire with realistic market dynamics and competition',
    icon: <Building className="w-6 h-6" />,
    difficulty: 'Expert',
    estimatedTime: '10-15 min',
    skills: ['3D Management', 'Business Strategy', 'Market Analysis', 'Complex Decision Making'],
    component: BusinessSimulator3D,
    minAge: 16,
    color: '#ef4444',
    position: [4, 0, 0]
  }
]

// 3D Game Selection Scene Component
function GameSelectionScene({ games, onGameSelect, selectedGame }: { 
  games: Game3DInfo[], 
  onGameSelect: (gameId: string) => void,
  selectedGame: string | null 
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />
      
      {games.map((game, index) => (
        <group key={game.id} position={game.position}>
          {/* Game Platform */}
          <mesh position={[0, -0.5, 0]} onClick={() => onGameSelect(game.id)}>
            <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
            <meshStandardMaterial 
              color={selectedGame === game.id ? '#ffffff' : game.color} 
              metalness={0.3} 
              roughness={0.4}
              emissive={selectedGame === game.id ? game.color : '#000000'}
              emissiveIntensity={selectedGame === game.id ? 0.3 : 0}
            />
          </mesh>
          
          {/* Game Icon Representation */}
          <mesh position={[0, 0.5, 0]} onClick={() => onGameSelect(game.id)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={game.color} 
              metalness={0.6} 
              roughness={0.2}
              emissive={game.color}
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Floating Particles */}
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[
                Math.sin(Date.now() * 0.001 + i) * 2,
                1 + Math.sin(Date.now() * 0.002 + i) * 0.5,
                Math.cos(Date.now() * 0.001 + i) * 2
              ]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial 
                color={game.color} 
                emissive={game.color}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
          
          {/* Game Title */}
          <Text
            position={[0, 2, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-Bold.woff"
          >
            {game.title}
          </Text>
          
          {/* Difficulty Badge */}
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.2}
            color={game.color}
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-Medium.woff"
          >
            {game.difficulty}
          </Text>
        </group>
      ))}
      
      {/* Central Hub */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[8, 8, 0.5, 64]} />
        <meshStandardMaterial 
          color="#1e293b" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#1e293b"
          emissiveIntensity={0.1}
        />
      </mesh>
    </>
  )
}

export function Enhanced3DGameHub({ onGameComplete, onExit, userTier = 'middle' }: GameHubProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [playingGame, setPlayingGame] = useState<string | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  // Filter games based on user tier
  const getAgeLimit = () => {
    switch (userTier) {
      case 'elementary': return 12
      case 'middle': return 16
      case 'adult': return 99
      default: return 16
    }
  }

  const availableGames = games3D.filter(game => game.minAge <= getAgeLimit())
  const selectedGameData = availableGames.find(game => game.id === selectedGame)

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(selectedGame === gameId ? null : gameId)
  }

  const handlePlayGame = () => {
    if (selectedGame) {
      setPlayingGame(selectedGame)
      setGameStartTime(Date.now())
    }
  }

  const handleGameComplete = (score: number, additionalData?: any) => {
    if (playingGame) {
      const timeSpent = Date.now() - gameStartTime
      onGameComplete(playingGame, score, timeSpent, additionalData)
      setPlayingGame(null)
      setSelectedGame(null)
    }
  }

  const handleBackToSelection = () => {
    setPlayingGame(null)
    setSelectedGame(null)
  }

  // If playing a game, render the game component
  if (playingGame) {
    const GameComponent = availableGames.find(game => game.id === playingGame)?.component
    if (GameComponent) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-900">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-lg font-medium">Loading 3D Game...</p>
              </div>
            </div>
          }>
            <GameComponent
              onComplete={handleGameComplete}
              onExit={handleBackToSelection}
              difficulty={userTier}
            />
          </Suspense>
        </div>
      )
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-900 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">3D Financial Learning Games</h1>
              <p className="text-white/80 text-sm">Choose your immersive learning experience</p>
            </div>
          </div>
          
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
            <Cube className="w-4 h-4 mr-2" />
            3D Environment Active
          </Badge>
        </div>
      </div>

      {/* 3D Scene */}
      <div className="w-full h-full">
        <Canvas shadows>
          <GameSelectionScene 
            games={availableGames} 
            onGameSelect={handleGameSelect}
            selectedGame={selectedGame}
          />
        </Canvas>
      </div>

      {/* Game Information Panel */}
      {selectedGame && selectedGameData && (
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <Card className="bg-black/40 backdrop-blur-xl border-white/20 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl" style={{ backgroundColor: selectedGameData.color }}>
                    {selectedGameData.icon}
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">{selectedGameData.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className="text-xs border-white/30 text-white/90">
                        {selectedGameData.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-white/80">
                        <Clock className="w-4 h-4" />
                        {selectedGameData.estimatedTime}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handlePlayGame}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg font-medium"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-white/90 mb-4 leading-relaxed">{selectedGameData.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedGameData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80 border-white/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {!selectedGame && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
            <p className="text-white/90 text-center font-medium">
              🖱️ Click on a game platform to learn more • 🎮 Use mouse to navigate the 3D environment
            </p>
          </div>
        </div>
      )}
    </div>
  )
}