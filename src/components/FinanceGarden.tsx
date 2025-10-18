import { useState, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plant, Drop, Sun, CloudRain, Flower, Tree, Sparkle,
  Coins, Calculator, GameController, Brain, ChartLine, Storefront,
  TrendUp, CreditCard, Building
} from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { GameScore } from '@/App'

interface FinanceGardenProps {
  userProfile: {
    name: string
    level: number
    xp: number
    totalCoins: number
    gamesCompleted: number
    achievements: string[]
  }
  gameScores: GameScore[]
  onGameSelect: (gameId: string) => void
}

interface PlantData {
  id: string
  name: string
  type: 'lemon-tree' | 'bamboo' | 'money-tree' | 'flower' | 'coin-flower' | 'budget-bush' | 'memory-vine' | 'compound-oak' | 'investment-palm' | 'credit-lily' | 'business-maple'
  gameId: string
  icon: React.ReactNode
  position: { x: number; y: number }
  color: string
  description: string
}

const plants: PlantData[] = [
  {
    id: 'lemonade-boss',
    name: 'Lemon Tree',
    type: 'lemon-tree',
    gameId: 'lemonade-boss',
    icon: <Storefront className="w-8 h-8" weight="fill" />,
    position: { x: 15, y: 60 },
    color: 'from-yellow-400 to-yellow-500',
    description: 'Grows with your business skills'
  },
  {
    id: 'pixel-budget-runner',
    name: 'Bamboo Stalks',
    type: 'bamboo',
    gameId: 'pixel-budget-runner',
    icon: <GameController className="w-8 h-8" weight="fill" />,
    position: { x: 75, y: 55 },
    color: 'from-emerald-400 to-green-500',
    description: 'Strong and balanced budgets'
  },
  {
    id: 'coin-catcher',
    name: 'Coin Flowers',
    type: 'coin-flower',
    gameId: 'coin-catcher',
    icon: <Coins className="w-8 h-8" weight="fill" />,
    position: { x: 30, y: 70 },
    color: 'from-amber-400 to-orange-500',
    description: 'Blooms with savings'
  },
  {
    id: 'budget-balancer',
    name: 'Budget Bush',
    type: 'budget-bush',
    gameId: 'budget-balancer',
    icon: <Calculator className="w-8 h-8" weight="fill" />,
    position: { x: 60, y: 75 },
    color: 'from-green-400 to-teal-500',
    description: 'Well-organized growth'
  },
  {
    id: 'credit-card-memory',
    name: 'Memory Vines',
    type: 'memory-vine',
    gameId: 'credit-card-memory',
    icon: <Brain className="w-8 h-8" weight="fill" />,
    position: { x: 45, y: 50 },
    color: 'from-purple-400 to-pink-500',
    description: 'Climbs with knowledge'
  },
  {
    id: 'compound-growth',
    name: 'Compound Oak',
    type: 'compound-oak',
    gameId: 'compound-growth',
    icon: <ChartLine className="w-8 h-8" weight="fill" />,
    position: { x: 25, y: 45 },
    color: 'from-blue-400 to-cyan-500',
    description: 'Grows exponentially over time'
  },
  {
    id: 'investment-climber',
    name: 'Investment Palm',
    type: 'investment-palm',
    gameId: 'investment-climber',
    icon: <TrendUp className="w-8 h-8" weight="fill" />,
    position: { x: 70, y: 35 },
    color: 'from-indigo-400 to-blue-500',
    description: 'Reaches for financial heights'
  },
  {
    id: 'credit-defender',
    name: 'Credit Lily',
    type: 'credit-lily',
    gameId: 'credit-defender',
    icon: <CreditCard className="w-8 h-8" weight="fill" />,
    position: { x: 50, y: 65 },
    color: 'from-pink-400 to-rose-500',
    description: 'Blooms with responsibility'
  },
  {
    id: 'business-builder',
    name: 'Business Maple',
    type: 'business-maple',
    gameId: 'business-builder',
    icon: <Building className="w-8 h-8" weight="fill" />,
    position: { x: 80, y: 45 },
    color: 'from-red-400 to-orange-600',
    description: 'Strong roots in entrepreneurship'
  }
]

export default function FinanceGarden({ userProfile, gameScores = [], onGameSelect }: FinanceGardenProps) {
  const [hoveredPlant, setHoveredPlant] = useState<string | null>(null)

  const plantGrowthMap = useMemo(() => {
    const growthMap = new Map<string, number>()
    
    if (!gameScores || gameScores.length === 0) {
      plants.forEach(plant => growthMap.set(plant.gameId, 0))
      return growthMap
    }
    
    plants.forEach(plant => {
      const scores = gameScores.filter(s => s.gameId === plant.gameId)
      if (scores.length === 0) {
        growthMap.set(plant.gameId, 0)
      } else {
        const bestScore = Math.max(...scores.map(s => s.score))
        const completions = scores.length
        growthMap.set(plant.gameId, Math.min(100, (bestScore / 10) + (completions * 5)))
      }
    })
    
    return growthMap
  }, [gameScores])

  const getPlantGrowth = useCallback((gameId: string): number => {
    return plantGrowthMap.get(gameId) || 0
  }, [plantGrowthMap])

  const getPlantSize = useCallback((growth: number): number => {
    if (growth === 0) return 0
    if (growth < 25) return 40
    if (growth < 50) return 60
    if (growth < 75) return 80
    return 100
  }, [])

  const getPlantOpacity = useCallback((growth: number): number => {
    if (growth === 0) return 0.2
    if (growth < 25) return 0.5
    if (growth < 50) return 0.7
    if (growth < 75) return 0.85
    return 1
  }, [])

  const overallHealth = useMemo(() => {
    return Math.round(
      plants.reduce((sum, plant) => sum + (plantGrowthMap.get(plant.gameId) || 0), 0) / Math.max(1, plants.length)
    )
  }, [plantGrowthMap])

  const getBackgroundGradient = useCallback(() => {
    if (overallHealth < 20) return 'from-stone-300 via-stone-200 to-stone-100'
    if (overallHealth < 40) return 'from-green-200/30 via-emerald-100/30 to-teal-100/30'
    if (overallHealth < 60) return 'from-green-300/50 via-emerald-200/50 to-teal-200/50'
    if (overallHealth < 80) return 'from-green-400/70 via-emerald-300/70 to-teal-300/70'
    return 'from-green-500/90 via-emerald-400/90 to-teal-400/90'
  }, [overallHealth])

  const getSkyColor = useCallback(() => {
    if (overallHealth < 20) return 'from-gray-300 to-gray-200'
    if (overallHealth < 40) return 'from-sky-200 to-blue-100'
    if (overallHealth < 60) return 'from-sky-300 to-blue-200'
    if (overallHealth < 80) return 'from-sky-400 to-blue-300'
    return 'from-sky-500 to-blue-400'
  }, [overallHealth])

  const getEncouragingMessage = useCallback(() => {
    if (overallHealth < 20) return "🌱 Plant your first seeds - your financial garden awaits!"
    if (overallHealth < 40) return "🌿 Your financial garden is taking root!"
    if (overallHealth < 60) return "🌸 Beautiful growth! Keep nurturing your skills!"
    if (overallHealth < 80) return "🌳 Your financial garden is flourishing!"
    return "🌺 Magnificent! Your financial garden is in full bloom!"
  }, [overallHealth])

  return (
    <div className="relative w-full h-full min-h-[500px] sm:min-h-[600px] overflow-hidden rounded-xl sm:rounded-2xl">
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-b transition-all duration-1000",
          getSkyColor()
        )}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />

      <motion.div
        className="absolute top-4 sm:top-8 right-4 sm:right-8"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Sun className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-yellow-400" weight="fill" />
      </motion.div>

      {overallHealth > 30 && (
        <motion.div
          className="absolute top-1/4 left-1/4"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            x: [-20, 20, -20],
            y: [-10, 10, -10]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <CloudRain className="w-12 h-12 text-white/80" weight="fill" />
        </motion.div>
      )}

      {overallHealth > 60 && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 15}%`
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                rotate: [0, 360, 720]
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 2
              }}
            >
              <Sparkle className="w-6 h-6 text-yellow-400" weight="fill" />
            </motion.div>
          ))}
        </>
      )}

      <motion.div
        className={cn(
          "absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-b transition-all duration-1000",
          getBackgroundGradient()
        )}
        style={{
          clipPath: 'polygon(0 20%, 100% 10%, 100% 100%, 0 100%)'
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grass" patternUnits="userSpaceOnUse" width="40" height="40">
              <path
                d="M0 40 Q5 35 10 40 Q15 35 20 40 Q25 35 30 40 Q35 35 40 40"
                stroke={overallHealth > 50 ? '#22c55e' : '#86efac'}
                strokeWidth="2"
                fill="none"
                opacity={overallHealth / 100}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grass)" />
        </svg>
      </div>

      <div className="absolute inset-0">
        {plants.map((plant) => {
          const growth = getPlantGrowth(plant.gameId)
          const size = getPlantSize(growth)
          const opacity = getPlantOpacity(growth)
          const completions = (gameScores || []).filter(s => s.gameId === plant.gameId).length
          const bestScore = (gameScores || [])
            .filter(s => s.gameId === plant.gameId)
            .reduce((max, s) => Math.max(max, s.score), 0)

          return (
            <motion.div
              key={plant.id}
              className="absolute cursor-pointer"
              style={{
                left: `${plant.position.x}%`,
                top: `${plant.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: size / 100,
                opacity: opacity
              }}
              whileHover={{ 
                scale: (size / 100) * 1.15,
                zIndex: 50
              }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              onHoverStart={() => setHoveredPlant(plant.id)}
              onHoverEnd={() => setHoveredPlant(null)}
              onClick={() => growth > 0 ? onGameSelect(plant.gameId) : null}
            >
              <motion.div
                className={cn(
                  "relative rounded-full p-3 sm:p-4 shadow-2xl backdrop-blur-sm",
                  `bg-gradient-to-br ${plant.color}`,
                  growth === 0 && "grayscale"
                )}
                animate={growth > 0 ? {
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 0, 0.3)',
                    '0 0 40px rgba(0, 255, 0, 0.5)',
                    '0 0 20px rgba(0, 255, 0, 0.3)'
                  ]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="text-white">
                  {plant.icon}
                </div>

                {growth > 0 && (
                  <motion.div
                    className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-[10px] sm:text-xs font-bold text-green-700">
                      {Math.round(growth)}
                    </span>
                  </motion.div>
                )}

                {growth === 0 && (
                  <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-600">?</span>
                  </div>
                )}

                <AnimatePresence>
                  {hoveredPlant === plant.id && (
                    <motion.div
                      className="absolute top-full mt-2 sm:mt-4 left-1/2 -translate-x-1/2 w-56 sm:w-64 pointer-events-none z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card className="shadow-2xl border-2 border-white/50 backdrop-blur-lg bg-white/95">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <div className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0",
                              `bg-gradient-to-br ${plant.color}`
                            )}>
                              <div className="text-white scale-75">
                                {plant.icon}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-1 truncate">
                                {plant.name}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2">
                                {plant.description}
                              </p>
                            </div>
                          </div>

                          {growth > 0 ? (
                            <>
                              <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                  <span className="text-gray-600">Growth</span>
                                  <span className="font-bold text-green-700">{Math.round(growth)}%</span>
                                </div>
                                <Progress value={growth} className="h-1.5 sm:h-2" />
                              </div>

                              <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3">
                                <div className="flex items-center gap-1">
                                  <Coins className="w-3 h-3 flex-shrink-0" weight="fill" />
                                  <span className="truncate">Best: {bestScore}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Sparkle className="w-3 h-3 flex-shrink-0" weight="fill" />
                                  <span className="truncate">{completions} plays</span>
                                </div>
                              </div>

                              <Button 
                                size="sm" 
                                className={cn(
                                  "w-full text-[10px] sm:text-xs shadow-md min-h-[36px]",
                                  `bg-gradient-to-r ${plant.color} hover:opacity-90 text-white`
                                )}
                                onClick={() => onGameSelect(plant.gameId)}
                              >
                                Play Game
                              </Button>
                            </>
                          ) : (
                            <div className="text-center py-2">
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-2">
                                Play to grow this plant!
                              </p>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full text-[10px] sm:text-xs min-h-[36px]"
                                onClick={() => onGameSelect(plant.gameId)}
                              >
                                Start Growing
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {growth > 50 && (
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  animate={{
                    y: [-20, -40, -20],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                >
                  <Sparkle className="w-4 h-4 text-yellow-400" weight="fill" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="absolute top-4 sm:top-6 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-6 z-30">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl border-2 border-white/50 backdrop-blur-lg bg-white/90">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 mb-1 truncate">
                    Finance Garden
                  </h2>
                  <p className="text-xs sm:text-sm text-green-600 line-clamp-2">
                    {getEncouragingMessage()}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Badge className="bg-green-500 text-white text-sm sm:text-base md:text-lg px-2 sm:px-3 md:px-4 py-1 sm:py-2 shadow-md">
                    <Plant className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" weight="fill" />
                    {overallHealth}%
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 font-medium">Overall Garden Health</span>
                  <span className="font-bold text-green-700">{overallHealth}%</span>
                </div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallHealth}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900">
                    {plants.filter(p => getPlantGrowth(p.gameId) > 0).length}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Plants Growing</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900">
                    {plants.filter(p => getPlantGrowth(p.gameId) >= 75).length}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Fully Bloomed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900">
                    {userProfile.gamesCompleted}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Total Harvests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] sm:w-auto max-w-md px-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-xl border-2 border-white/50 backdrop-blur-lg bg-white/90">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                <span className="font-semibold text-green-700">Click on any plant</span> to play its game and help it grow!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
      `}</style>
    </div>
  )
}

import React from 'react'
