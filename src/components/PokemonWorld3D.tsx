import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Sky, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { EnhancedAvatarConfig } from './EnhancedAvatarCustomizer'
import { resolveSkinColor } from '@/lib/skin-colors'

// World locations/neighborhoods
interface WorldLocation {
  id: string
  name: string
  description: string
  position: [number, number, number]
  color: string
  emoji: string
  games: string[]
  unlocked: boolean
  completed: boolean
  boss?: {
    name: string
    emoji: string
    difficulty: 'easy' | 'medium' | 'hard' | 'boss'
  }
}

const WORLD_LOCATIONS: WorldLocation[] = [
  {
    id: 'starter-town',
    name: 'Starter Town',
    description: 'Begin your financial journey here!',
    position: [0, 0, 0],
    color: '#4CAF50',
    emoji: '🏠',
    games: ['coin-catcher', 'savings-sprint'],
    unlocked: true,
    completed: false,
  },
  {
    id: 'budget-boulevard',
    name: 'Budget Boulevard',
    description: 'Learn to manage your money wisely',
    position: [4, 0, 2],
    color: '#2196F3',
    emoji: '💰',
    games: ['budget-balance', 'expense-escape'],
    unlocked: true,
    completed: false,
    boss: { name: 'Budget Beast', emoji: '🐉', difficulty: 'easy' }
  },
  {
    id: 'savings-summit',
    name: 'Savings Summit',
    description: 'Climb to the top of savings mountain!',
    position: [8, 2, 0],
    color: '#9C27B0',
    emoji: '⛰️',
    games: ['compound-growth', 'piggy-bank-puzzle'],
    unlocked: false,
    completed: false,
    boss: { name: 'Savings Serpent', emoji: '🐍', difficulty: 'medium' }
  },
  {
    id: 'investment-island',
    name: 'Investment Island',
    description: 'Discover the secrets of growing wealth',
    position: [6, 0, -4],
    color: '#FF9800',
    emoji: '🏝️',
    games: ['stock-market', 'investment-tower'],
    unlocked: false,
    completed: false,
    boss: { name: 'Investment Iguana', emoji: '🦎', difficulty: 'hard' }
  },
  {
    id: 'credit-castle',
    name: 'Credit Castle',
    description: 'Master the art of credit and debt',
    position: [-4, 1, 3],
    color: '#E91E63',
    emoji: '🏰',
    games: ['credit-card-memory', 'debt-dungeon'],
    unlocked: false,
    completed: false,
    boss: { name: 'Credit King', emoji: '👑', difficulty: 'hard' }
  },
  {
    id: 'entrepreneur-empire',
    name: 'Entrepreneur Empire',
    description: 'Build your business empire!',
    position: [-6, 0, -2],
    color: '#F44336',
    emoji: '🏢',
    games: ['lemonade-stand', 'business-builder'],
    unlocked: false,
    completed: false,
    boss: { name: 'Emperor of Enterprise', emoji: '🦅', difficulty: 'boss' }
  },
  {
    id: 'bank-of-wisdom',
    name: 'Bank of Wisdom',
    description: 'The final challenge awaits...',
    position: [0, 3, -6],
    color: '#FFD700',
    emoji: '🏦',
    games: ['final-challenge'],
    unlocked: false,
    completed: false,
    boss: { name: 'Grand Master of Finance', emoji: '🧙', difficulty: 'boss' }
  },
]

// Path connections between locations
const PATHS: [string, string][] = [
  ['starter-town', 'budget-boulevard'],
  ['budget-boulevard', 'savings-summit'],
  ['budget-boulevard', 'investment-island'],
  ['starter-town', 'credit-castle'],
  ['credit-castle', 'entrepreneur-empire'],
  ['savings-summit', 'bank-of-wisdom'],
  ['investment-island', 'bank-of-wisdom'],
  ['entrepreneur-empire', 'bank-of-wisdom'],
]

// 3D Player Character
function PlayerCharacter({ 
  position, 
  config, 
  isMoving,
  targetPosition 
}: { 
  position: THREE.Vector3
  config: EnhancedAvatarConfig
  isMoving: boolean
  targetPosition?: THREE.Vector3
}) {
  const meshRef = useRef<THREE.Group>(null)
  const [currentPos] = useState(position.clone())
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    // Smooth movement towards target
    if (targetPosition && isMoving) {
      currentPos.lerp(targetPosition, delta * 2)
      meshRef.current.position.copy(currentPos)
      
      // Face movement direction
      const direction = new THREE.Vector3().subVectors(targetPosition, currentPos)
      if (direction.length() > 0.1) {
        meshRef.current.rotation.y = Math.atan2(direction.x, direction.z)
      }
    }
    
    // Idle/walking animation
    const bounce = isMoving 
      ? Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.1
      : Math.sin(state.clock.elapsedTime * 2) * 0.02
    meshRef.current.position.y = currentPos.y + bounce + 0.5
  })

  const skinColor = resolveSkinColor(config.skinTone)
  const topColor = config.topColor || '#3498DB'
  
  return (
    <group ref={meshRef} position={[position.x, position.y + 0.5, position.z]}>
      {/* Body */}
      <RoundedBox args={[0.4, 0.6, 0.3]} radius={0.05}>
        <meshStandardMaterial color={topColor} />
      </RoundedBox>
      
      {/* Head */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.06, 0.55, 0.18]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.06, 0.55, 0.18]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.06, 0.55, 0.2]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      <mesh position={[0.06, 0.55, 0.2]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* Legs */}
      <RoundedBox args={[0.12, 0.4, 0.12]} radius={0.02} position={[-0.1, -0.45, 0]}>
        <meshStandardMaterial color={config.bottomColor || '#2C3E50'} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.4, 0.12]} radius={0.02} position={[0.1, -0.45, 0]}>
        <meshStandardMaterial color={config.bottomColor || '#2C3E50'} />
      </RoundedBox>
      
      {/* Shadow */}
      <mesh position={[0, -0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshBasicMaterial color="black" opacity={0.3} transparent />
      </mesh>
      
      {/* Pet companion */}
      {config.pet && config.pet !== 'none' && (
        <group position={[0.5, 0, 0.3]}>
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={config.petColor || '#E74C3C'} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// Location Building
function LocationBuilding({ location, onClick, isSelected }: { 
  location: WorldLocation
  onClick: () => void
  isSelected: boolean
}) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (!meshRef.current) return
    
    // Hover/selection animation
    const targetScale = hovered || isSelected ? 1.1 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    
    // Floating animation for unlocked locations
    if (location.unlocked) {
      meshRef.current.position.y = location.position[1] + Math.sin(state.clock.elapsedTime * 2 + location.position[0]) * 0.05
    }
  })

  return (
    <group 
      ref={meshRef}
      position={location.position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Base platform */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[1, 1.2, 0.2, 32]} />
        <meshStandardMaterial 
          color={location.unlocked ? location.color : '#666'} 
          opacity={location.unlocked ? 1 : 0.5}
          transparent
        />
      </mesh>
      
      {/* Building */}
      <RoundedBox args={[1.2, 1.5, 1.2]} radius={0.1} position={[0, 0.75, 0]}>
        <meshStandardMaterial 
          color={location.unlocked ? location.color : '#444'}
          opacity={location.unlocked ? 1 : 0.6}
          transparent
        />
      </RoundedBox>
      
      {/* Roof */}
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[0.9, 0.6, 4]} />
        <meshStandardMaterial color={location.unlocked ? '#8B4513' : '#333'} />
      </mesh>
      
      {/* Emoji label */}
      <Html position={[0, 2.5, 0]} center>
        <div className={`text-4xl ${!location.unlocked && 'grayscale opacity-50'}`}>
          {location.emoji}
        </div>
      </Html>
      
      {/* Name label */}
      <Html position={[0, -0.5, 0]} center>
        <div className={`text-center whitespace-nowrap ${!location.unlocked && 'opacity-50'}`}>
          <div className="bg-black/70 text-white px-2 py-1 rounded-lg text-sm font-bold">
            {location.name}
            {location.boss && (
              <span className="ml-1">{location.boss.emoji}</span>
            )}
          </div>
        </div>
      </Html>
      
      {/* Lock indicator */}
      {!location.unlocked && (
        <Html position={[0, 1, 0]} center>
          <div className="text-3xl">🔒</div>
        </Html>
      )}
      
      {/* Completion star */}
      {location.completed && (
        <Html position={[0.6, 2, 0]} center>
          <div className="text-2xl animate-pulse">⭐</div>
        </Html>
      )}
      
      {/* Glow effect for selected */}
      {isSelected && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color={location.color} opacity={0.2} transparent />
        </mesh>
      )}
    </group>
  )
}

// Path between locations
function PathConnection({ from, to, completed }: { 
  from: [number, number, number]
  to: [number, number, number]
  completed: boolean
}) {
  const points = []
  const segments = 20
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = from[0] + (to[0] - from[0]) * t
    const y = from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI) * 0.3
    const z = from[2] + (to[2] - from[2]) * t
    points.push(new THREE.Vector3(x, y, z))
  }
  
  const curve = new THREE.CatmullRomCurve3(points)
  
  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.05, 8, false]} />
      <meshStandardMaterial 
        color={completed ? '#FFD700' : '#8B4513'} 
        opacity={completed ? 1 : 0.6}
        transparent
      />
    </mesh>
  )
}

// Ground/terrain
function Terrain() {
  return (
    <>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      
      {/* Water areas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, -0.4, 5]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#1E90FF" opacity={0.8} transparent />
      </mesh>
      
      {/* Hills */}
      <mesh position={[-8, 0, 6]}>
        <sphereGeometry args={[2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2E8B57" />
      </mesh>
      
      <mesh position={[12, 0, -3]}>
        <sphereGeometry args={[1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3CB371" />
      </mesh>
    </>
  )
}

// Camera controller that follows player
function CameraController({ target }: { target: THREE.Vector3 }) {
  const { camera } = useThree()
  
  useFrame(() => {
    const targetPos = new THREE.Vector3(
      target.x + 5,
      target.y + 8,
      target.z + 8
    )
    camera.position.lerp(targetPos, 0.02)
    camera.lookAt(target)
  })
  
  return null
}

interface PokemonWorld3DProps {
  avatarConfig: EnhancedAvatarConfig
  onSelectLocation: (location: WorldLocation) => void
  onStartGame: (gameId: string, locationId: string) => void
  completedGames: string[]
  playerMoney: number
}

export default function PokemonWorld3D({
  avatarConfig,
  onStartGame,
  completedGames,
  playerMoney
}: PokemonWorld3DProps) {
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 0, 0))
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<WorldLocation | null>(null)
  const [showLocationMenu, setShowLocationMenu] = useState(false)
  const [locations, setLocations] = useState(WORLD_LOCATIONS)

  // Update locations based on completed games
  useEffect(() => {
    setLocations(prev => prev.map(loc => ({
      ...loc,
      completed: loc.games.every(g => completedGames.includes(g)),
      unlocked: loc.id === 'starter-town' || 
        PATHS.some(([from, to]) => {
          const fromLoc = prev.find(l => l.id === from)
          return (to === loc.id && fromLoc?.completed)
        })
    })))
  }, [completedGames])

  const handleLocationClick = useCallback((location: WorldLocation) => {
    if (!location.unlocked) {
      // Show locked message
      return
    }
    
    // Move player to location
    const target = new THREE.Vector3(...location.position)
    setTargetPosition(target)
    setIsMoving(true)
    setSelectedLocation(location)
    
    // Stop moving when close enough
    const checkArrival = setInterval(() => {
      if (playerPosition.distanceTo(target) < 0.5) {
        setIsMoving(false)
        setPlayerPosition(target)
        setShowLocationMenu(true)
        clearInterval(checkArrival)
      }
    }, 100)
    
    setTimeout(() => {
      clearInterval(checkArrival)
      setIsMoving(false)
      setShowLocationMenu(true)
    }, 3000)
  }, [playerPosition])

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-400 to-sky-200">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        {/* Player info */}
        <div className="retro-card p-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{avatarConfig.pet && avatarConfig.pet !== 'none' ? '🧑‍🤝‍🧑' : '🧑'}</div>
            <div>
              <div className="font-bold text-lg">Explorer</div>
              <div className="retro-money-display">
                <span className="retro-money-icon">💰</span>
                <span>${playerMoney.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mini map / location list */}
        <div className="retro-card p-4 max-w-xs">
          <div className="text-sm font-bold mb-2">📍 Locations</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {locations.map(loc => (
              <div 
                key={loc.id}
                className={`flex items-center gap-2 text-xs p-1 rounded ${
                  loc.unlocked ? 'cursor-pointer hover:bg-gray-100' : 'opacity-50'
                } ${selectedLocation?.id === loc.id ? 'bg-yellow-100' : ''}`}
                onClick={() => loc.unlocked && handleLocationClick(loc)}
              >
                <span>{loc.emoji}</span>
                <span>{loc.name}</span>
                {loc.completed && <span>⭐</span>}
                {!loc.unlocked && <span>🔒</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D World */}
      <Canvas shadows camera={{ position: [5, 8, 8], fov: 60 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
          />
          
          {/* Sky */}
          <Sky sunPosition={[100, 20, 100]} />
          
          {/* Terrain */}
          <Terrain />
          
          {/* Paths */}
          {PATHS.map(([from, to], i) => {
            const fromLoc = locations.find(l => l.id === from)
            const toLoc = locations.find(l => l.id === to)
            if (!fromLoc || !toLoc) return null
            return (
              <PathConnection 
                key={i}
                from={fromLoc.position}
                to={toLoc.position}
                completed={fromLoc.completed && toLoc.unlocked}
              />
            )
          })}
          
          {/* Locations */}
          {locations.map(location => (
            <LocationBuilding
              key={location.id}
              location={location}
              onClick={() => handleLocationClick(location)}
              isSelected={selectedLocation?.id === location.id}
            />
          ))}
          
          {/* Player */}
          <PlayerCharacter
            position={playerPosition}
            config={avatarConfig}
            isMoving={isMoving}
            targetPosition={targetPosition || undefined}
          />
          
          {/* Camera follow */}
          <CameraController target={targetPosition || playerPosition} />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={false}
            minDistance={5}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
          />
        </Suspense>
      </Canvas>

      {/* Location Menu Popup */}
      <AnimatePresence>
        {showLocationMenu && selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-4 left-4 right-4 z-20"
          >
            <div className="retro-card max-w-md mx-auto">
              <div 
                className="retro-card-header flex items-center justify-between dynamic-gradient-header"
                ref={(el) => { if (el) { el.style.setProperty('--header-color', selectedLocation.color); el.style.setProperty('--header-color-end', selectedLocation.color + 'dd') } }}
              >
                <span>{selectedLocation.emoji} {selectedLocation.name}</span>
                <button 
                  onClick={() => setShowLocationMenu(false)}
                  className="text-2xl hover:scale-110 transition-transform"
                  aria-label="Close location menu"
                >
                  ✕
                </button>
              </div>
              <div className="retro-card-body">
                <p className="text-gray-600 mb-4">{selectedLocation.description}</p>
                
                {/* Games list */}
                <div className="space-y-2 mb-4">
                  <div className="font-bold text-sm">🎮 Available Games:</div>
                  {selectedLocation.games.map(gameId => (
                    <button
                      key={gameId}
                      onClick={() => onStartGame(gameId, selectedLocation.id)}
                      className={`w-full retro-btn ${
                        completedGames.includes(gameId) 
                          ? 'retro-btn-green' 
                          : 'retro-btn-blue'
                      } text-sm py-2`}
                    >
                      {completedGames.includes(gameId) ? '✅' : '🎮'} {gameId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
                
                {/* Boss battle */}
                {selectedLocation.boss && (
                  <div className="border-t-2 border-dashed pt-4">
                    <div className="font-bold text-sm mb-2">👹 Boss Battle:</div>
                    <button
                      onClick={() => onStartGame('boss-battle', selectedLocation.id)}
                      className="w-full retro-btn retro-btn-red"
                      disabled={!selectedLocation.games.every(g => completedGames.includes(g))}
                    >
                      {selectedLocation.boss.emoji} Fight {selectedLocation.boss.name}!
                    </button>
                    {!selectedLocation.games.every(g => completedGames.includes(g)) && (
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Complete all games to unlock boss battle
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          🖱️ Click a location to travel • Scroll to zoom • Drag to rotate
        </div>
      </div>
    </div>
  )
}
