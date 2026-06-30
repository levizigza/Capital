import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Lock, Star } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UserProfile, GameScore } from '@/App'
import { UserAvatar } from '@/components/UserAvatar'

interface VillageLocation {
  id: string
  name: string
  x: number // Percentage position on map
  y: number
  icon: string
  color: string
  gameId: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  minLevel: number
  locked: boolean
  category: 'savings' | 'investing' | 'credit' | 'business' | 'new'
}

interface VillageMapProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  onGameStart: (gameId: string) => void
  onModeSwitch: () => void
}

const VILLAGE_LOCATIONS: VillageLocation[] = [
  // Existing games
  {
    id: 'savings-square',
    name: 'Savings Square',
    x: 15,
    y: 30,
    icon: '🪙',
    color: '#10b981',
    gameId: 'coin-catcher',
    description: 'Catch coins and dodge expenses!',
    difficulty: 'Easy',
    minLevel: 1,
    locked: false,
    category: 'savings'
  },
  {
    id: 'budget-boulevard',
    name: 'Budget Boulevard',
    x: 35,
    y: 25,
    icon: '🧮',
    color: '#22c55e',
    gameId: 'budget-balancer',
    description: 'Balance your budget perfectly!',
    difficulty: 'Easy',
    minLevel: 1,
    locked: false,
    category: 'savings'
  },
  {
    id: 'investment-island',
    name: 'Investment Island',
    x: 55,
    y: 20,
    icon: '📈',
    color: '#3b82f6',
    gameId: 'investment-tower',
    description: 'Build your investment tower!',
    difficulty: 'Medium',
    minLevel: 3,
    locked: false,
    category: 'investing'
  },
  {
    id: 'credit-castle',
    name: 'Credit Castle',
    x: 75,
    y: 30,
    icon: '💳',
    color: '#8b5cf6',
    gameId: 'credit-defender',
    description: 'Defend your credit score!',
    difficulty: 'Medium',
    minLevel: 5,
    locked: false,
    category: 'credit'
  },
  {
    id: 'business-bazaar',
    name: 'Business Bazaar',
    x: 25,
    y: 60,
    icon: '🏪',
    color: '#f59e0b',
    gameId: 'business-builder',
    description: 'Build your business empire!',
    difficulty: 'Hard',
    minLevel: 7,
    locked: false,
    category: 'business'
  },
  {
    id: 'lemonade-lane',
    name: 'Lemonade Lane',
    x: 45,
    y: 65,
    icon: '🍋',
    color: '#eab308',
    gameId: 'lemonade-boss',
    description: 'Run your lemonade stand!',
    difficulty: 'Easy',
    minLevel: 1,
    locked: false,
    category: 'business'
  },
  {
    id: 'collect-corner',
    name: 'Collect Corner',
    x: 65,
    y: 70,
    icon: '🧲',
    color: '#0ea5e9',
    gameId: 'collect-game-2d',
    description: 'Collect items fast!',
    difficulty: 'Easy',
    minLevel: 1,
    locked: false,
    category: 'savings'
  },
  // NEW GAMES - 5 new locations
  {
    id: 'debt-dungeon',
    name: 'Debt Dungeon',
    x: 85,
    y: 55,
    icon: '⚔️',
    color: '#ef4444',
    gameId: 'debt-dungeon',
    description: 'Fight debt monsters!',
    difficulty: 'Medium',
    minLevel: 4,
    locked: false,
    category: 'credit'
  },
  {
    id: 'savings-sprint',
    name: 'Savings Sprint',
    x: 10,
    y: 70,
    icon: '🏃',
    color: '#06b6d4',
    gameId: 'savings-sprint',
    description: 'Race to save money!',
    difficulty: 'Easy',
    minLevel: 2,
    locked: false,
    category: 'savings'
  },
  {
    id: 'portfolio-park',
    name: 'Portfolio Park',
    x: 50,
    y: 45,
    icon: '🎯',
    color: '#14b8a6',
    gameId: 'portfolio-park',
    description: 'Optimize your portfolio!',
    difficulty: 'Hard',
    minLevel: 6,
    locked: false,
    category: 'investing'
  },
  {
    id: 'expense-express',
    name: 'Expense Express',
    x: 30,
    y: 45,
    icon: '🚂',
    color: '#f97316',
    gameId: 'expense-express',
    description: 'Track expenses on the go!',
    difficulty: 'Medium',
    minLevel: 3,
    locked: false,
    category: 'savings'
  },
  {
    id: 'interest-inn',
    name: 'Interest Inn',
    x: 70,
    y: 50,
    icon: '🏨',
    color: '#a855f7',
    gameId: 'interest-inn',
    description: 'Learn compound interest!',
    difficulty: 'Easy',
    minLevel: 2,
    locked: false,
    category: 'investing'
  }
]

export default function VillageMap({ userProfile, gameScores, onGameStart, onModeSwitch }: VillageMapProps) {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 })
  const [selectedLocation, setSelectedLocation] = useState<VillageLocation | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false })
  const mapRef = useRef<HTMLDivElement>(null)

  // Update locked status based on user level
  const locations = VILLAGE_LOCATIONS.map(loc => ({
    ...loc,
    locked: userProfile.level < loc.minLevel
  }))

  // Keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        const key = e.key.toLowerCase()
        if (key === 'w' || key === 'arrowup') setKeys(prev => ({ ...prev, w: true }))
        if (key === 's' || key === 'arrowdown') setKeys(prev => ({ ...prev, s: true }))
        if (key === 'a' || key === 'arrowleft') setKeys(prev => ({ ...prev, a: true }))
        if (key === 'd' || key === 'arrowright') setKeys(prev => ({ ...prev, d: true }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'w' || key === 'arrowup') setKeys(prev => ({ ...prev, w: false }))
      if (key === 's' || key === 'arrowdown') setKeys(prev => ({ ...prev, s: false }))
      if (key === 'a' || key === 'arrowleft') setKeys(prev => ({ ...prev, a: false }))
      if (key === 'd' || key === 'arrowright') setKeys(prev => ({ ...prev, d: false }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Movement animation
  useEffect(() => {
    if (isMoving) return

    const moveSpeed = 0.3
    let newX = playerPosition.x
    let newY = playerPosition.y

    if (keys.w) newY = Math.max(5, newY - moveSpeed)
    if (keys.s) newY = Math.min(95, newY + moveSpeed)
    if (keys.a) newX = Math.max(5, newX - moveSpeed)
    if (keys.d) newX = Math.min(95, newX + moveSpeed)

    if (newX !== playerPosition.x || newY !== playerPosition.y) {
      setIsMoving(true)
      setPlayerPosition({ x: newX, y: newY })
      setTimeout(() => setIsMoving(false), 50)
    }
  }, [keys, playerPosition, isMoving])

  // Check proximity to locations
  useEffect(() => {
    const checkProximity = () => {
      for (const location of locations) {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - location.x, 2) + Math.pow(playerPosition.y - location.y, 2)
        )
        if (distance < 8 && !location.locked) {
          if (selectedLocation?.id !== location.id) {
            setSelectedLocation(location)
          }
          return
        }
      }
      if (selectedLocation) {
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - selectedLocation.x, 2) + Math.pow(playerPosition.y - selectedLocation.y, 2)
        )
        if (distance >= 8) {
          setSelectedLocation(null)
        }
      }
    }

    checkProximity()
  }, [playerPosition, locations, selectedLocation])

  const handleLocationClick = (location: VillageLocation) => {
    if (!location.locked) {
      setPlayerPosition({ x: location.x, y: location.y })
      setTimeout(() => {
        onGameStart(location.gameId)
      }, 500)
    }
  }

  const getLocationStatus = (location: VillageLocation) => {
    const gameScore = gameScores.find(gs => gs.gameId === location.gameId)
    if (location.locked) return 'locked'
    if (gameScore?.completed) return 'completed'
    return 'available'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-yellow-50 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar userProfile={userProfile} size="sm" />
          <div>
            <h1 className="text-2xl font-bold text-green-800">Finance Village</h1>
            <p className="text-sm text-gray-600">Level {userProfile.level} • {userProfile.totalCoins} coins</p>
          </div>
        </div>
        <Button onClick={onModeSwitch} variant="outline" className="bg-white/90">
          <ArrowLeft className="mr-2" /> Back
        </Button>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-screen relative"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1), transparent 50%), radial-gradient(circle at 40% 80%, rgba(234, 179, 8, 0.1), transparent 50%)'
        }}
      >
        {/* Village Locations */}
        {locations.map((location) => {
          const status = getLocationStatus(location)
          const isNearby = selectedLocation?.id === location.id
          
          return (
            <motion.div
              key={location.id}
              className="absolute cursor-pointer"
              style={{
                left: `${location.x}%`,
                top: `${location.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: isNearby ? 1.2 : location.locked ? 0.7 : 1,
                opacity: location.locked ? 0.5 : 1
              }}
              whileHover={{ scale: location.locked ? 0.7 : 1.3 }}
              onClick={() => handleLocationClick(location)}
            >
              <div className="relative">
                {/* Location Icon */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 transition-all"
                  style={{
                    backgroundColor: location.color + '20',
                    borderColor: location.color,
                    boxShadow: isNearby ? `0 0 20px ${location.color}` : 'none'
                  }}
                >
                  {location.locked ? <Lock size={24} /> : location.icon}
                </div>
                
                {/* Location Name */}
                <motion.div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                  animate={{ opacity: isNearby ? 1 : 0.7 }}
                >
                  <div className="bg-white/95 px-3 py-1 rounded-lg shadow-md border-2 text-xs font-bold"
                    style={{ borderColor: location.color, color: location.color }}>
                    {location.name}
                  </div>
                </motion.div>

                {/* Status Badge */}
                {status === 'completed' && (
                  <div className="absolute -top-2 -right-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Player Avatar */}
        <motion.div
          className="absolute z-10"
          style={{
            left: `${playerPosition.x}%`,
            top: `${playerPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: isMoving ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-2xl">
            👤
          </div>
          {/* Walking indicator */}
          {isMoving && (
            <motion.div
              className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </motion.div>
          )}
        </motion.div>

        {/* Paths/Dotted lines connecting locations */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          {locations.slice(0, -1).map((loc, idx) => {
            const nextLoc = locations[idx + 1]
            if (!nextLoc) return null
            return (
              <line
                key={`path-${idx}`}
                x1={`${loc.x}%`}
                y1={`${loc.y}%`}
                x2={`${nextLoc.x}%`}
                y2={`${nextLoc.y}%`}
                stroke={loc.color}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )
          })}
        </svg>
      </div>

      {/* Location Info Card */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
          >
            <Card className="bg-white/95 backdrop-blur shadow-2xl border-4 min-w-[300px]"
              style={{ borderColor: selectedLocation.color }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{selectedLocation.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1" style={{ color: selectedLocation.color }}>
                      {selectedLocation.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedLocation.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" style={{ borderColor: selectedLocation.color }}>
                        {selectedLocation.difficulty}
                      </Badge>
                      {selectedLocation.locked && (
                        <Badge variant="destructive">Level {selectedLocation.minLevel} Required</Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleLocationClick(selectedLocation)}
                      disabled={selectedLocation.locked}
                      className="w-full"
                      style={{ backgroundColor: selectedLocation.color }}
                    >
                      {selectedLocation.locked ? '🔒 Locked' : '▶ Enter & Play'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Hint */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-xs text-gray-600 z-20">
        <p className="font-semibold mb-1">Controls:</p>
        <p>WASD or Arrow Keys to move</p>
        <p>Walk near locations to interact</p>
      </div>
    </div>
  )
}
