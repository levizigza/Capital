import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendUp, TrendDown, Minus, ArrowLeft, Trophy, Coins, ChartBar } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Sector {
  id: string
  name: string
  icon: string
  pricePerShare: number
  shares: number
  trend: 'up' | 'down' | 'stable'
  color: string
  position: { x: number; y: number }
  volatility: number
}

interface MarketEvent {
  id: string
  title: string
  description: string
  sector: string
  impact: number
}

interface MarketTycoonGameProps {
  onComplete: (score: number, timeSpent: number, data: any) => void
  onBack: () => void
}

const GAME_DURATION = 120
const MARKET_UPDATE_INTERVAL = 5000
const STARTING_CASH = 1000

const INITIAL_SECTORS: Sector[] = [
  {
    id: 'tech',
    name: 'Tech',
    icon: '💻',
    pricePerShare: 50,
    shares: 0,
    trend: 'stable',
    color: 'oklch(0.55 0.20 290)',
    position: { x: 15, y: 20 },
    volatility: 0.15
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '⚕️',
    pricePerShare: 75,
    shares: 0,
    trend: 'stable',
    color: 'oklch(0.65 0.22 350)',
    position: { x: 70, y: 25 },
    volatility: 0.08
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: '⚡',
    pricePerShare: 60,
    shares: 0,
    trend: 'stable',
    color: 'oklch(0.75 0.18 85)',
    position: { x: 40, y: 50 },
    volatility: 0.12
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    icon: '🏠',
    pricePerShare: 100,
    shares: 0,
    trend: 'stable',
    color: 'oklch(0.60 0.18 140)',
    position: { x: 25, y: 70 },
    volatility: 0.06
  },
  {
    id: 'consumer',
    name: 'Consumer',
    icon: '🛒',
    pricePerShare: 40,
    shares: 0,
    trend: 'stable',
    color: 'oklch(0.70 0.15 200)',
    position: { x: 65, y: 65 },
    volatility: 0.10
  }
]

const MARKET_EVENTS: Omit<MarketEvent, 'id'>[] = [
  { title: '🚀 Tech Boom!', description: 'New AI breakthrough', sector: 'tech', impact: 0.20 },
  { title: '📉 Tech Correction', description: 'Regulation concerns', sector: 'tech', impact: -0.15 },
  { title: '💊 Medical Breakthrough', description: 'New drug approved', sector: 'healthcare', impact: 0.18 },
  { title: '🔬 Trial Failure', description: 'Clinical trial setback', sector: 'healthcare', impact: -0.12 },
  { title: '⚡ Energy Crisis', description: 'Supply disruption', sector: 'energy', impact: 0.25 },
  { title: '🌱 Green Energy Surge', description: 'Renewable adoption', sector: 'energy', impact: 0.15 },
  { title: '🏗️ Housing Boom', description: 'Low interest rates', sector: 'realestate', impact: 0.12 },
  { title: '📊 Market Downturn', description: 'Economic concerns', sector: 'realestate', impact: -0.10 },
  { title: '🛍️ Consumer Spending Up', description: 'Holiday season surge', sector: 'consumer', impact: 0.15 },
  { title: '💳 Retail Slowdown', description: 'Consumer confidence down', sector: 'consumer', impact: -0.12 }
]

export default function MarketTycoonGame({ onComplete, onBack }: MarketTycoonGameProps) {
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing')
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION)
  const [cash, setCash] = useState(STARTING_CASH)
  const [sectors, setSectors] = useState<Sector[]>(INITIAL_SECTORS)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [currentEvent, setCurrentEvent] = useState<MarketEvent | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [gameStartTime] = useState(Date.now())

  const calculatePortfolioValue = useCallback(() => {
    return sectors.reduce((total, sector) => {
      return total + (sector.shares * sector.pricePerShare)
    }, 0)
  }, [sectors])

  const calculateDiversificationScore = useCallback(() => {
    const sectorsInvested = sectors.filter(s => s.shares > 0).length
    const totalShares = sectors.reduce((sum, s) => sum + s.shares, 0)
    
    if (totalShares === 0) return 0
    
    let concentrationScore = 0
    sectors.forEach(sector => {
      const weight = sector.shares / totalShares
      concentrationScore += weight * weight
    })
    
    const diversificationScore = (1 - concentrationScore) * 100
    const sectorBonusScore = (sectorsInvested / sectors.length) * 100
    
    return Math.round((diversificationScore * 0.7 + sectorBonusScore * 0.3))
  }, [sectors])

  const updateMarketPrices = useCallback(() => {
    setSectors(prevSectors => {
      return prevSectors.map(sector => {
        const randomChange = (Math.random() - 0.5) * 2 * sector.volatility
        const newPrice = Math.max(10, sector.pricePerShare * (1 + randomChange))
        
        let newTrend: 'up' | 'down' | 'stable' = 'stable'
        const priceDiff = newPrice - sector.pricePerShare
        if (priceDiff > sector.pricePerShare * 0.03) newTrend = 'up'
        else if (priceDiff < -sector.pricePerShare * 0.03) newTrend = 'down'
        
        return {
          ...sector,
          pricePerShare: Math.round(newPrice * 100) / 100,
          trend: newTrend
        }
      })
    })
  }, [])

  const triggerMarketEvent = useCallback(() => {
    if (Math.random() < 0.4) {
      const eventTemplate = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)]
      const event: MarketEvent = {
        ...eventTemplate,
        id: `event-${Date.now()}`
      }
      
      setCurrentEvent(event)
      
      setSectors(prevSectors => 
        prevSectors.map(sector => {
          if (sector.id === event.sector) {
            const newPrice = Math.max(10, sector.pricePerShare * (1 + event.impact))
            return {
              ...sector,
              pricePerShare: Math.round(newPrice * 100) / 100,
              trend: event.impact > 0 ? 'up' : 'down'
            }
          }
          return sector
        })
      )
      
      toast(event.title, {
        description: event.description,
        duration: 4000
      })
      
      setTimeout(() => setCurrentEvent(null), 4000)
    }
  }, [])

  const buySector = useCallback((sectorId: string) => {
    setSectors(prevSectors => {
      const sector = prevSectors.find(s => s.id === sectorId)
      if (!sector) return prevSectors
      
      if (cash >= sector.pricePerShare) {
        setCash(prev => prev - sector.pricePerShare)
        setTransactionHistory(prev => [...prev, {
          type: 'buy',
          sector: sectorId,
          price: sector.pricePerShare,
          time: GAME_DURATION - timeRemaining
        }])
        
        return prevSectors.map(s => 
          s.id === sectorId ? { ...s, shares: s.shares + 1 } : s
        )
      } else {
        toast.error('Insufficient funds!')
        return prevSectors
      }
    })
  }, [cash, timeRemaining])

  const sellSector = useCallback((sectorId: string) => {
    setSectors(prevSectors => {
      const sector = prevSectors.find(s => s.id === sectorId)
      if (!sector || sector.shares === 0) return prevSectors
      
      setCash(prev => prev + sector.pricePerShare)
      setTransactionHistory(prev => [...prev, {
        type: 'sell',
        sector: sectorId,
        price: sector.pricePerShare,
        time: GAME_DURATION - timeRemaining
      }])
      
      return prevSectors.map(s => 
        s.id === sectorId ? { ...s, shares: s.shares - 1 } : s
      )
    })
  }, [timeRemaining])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameState('completed')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const marketTimer = setInterval(() => {
      updateMarketPrices()
      triggerMarketEvent()
    }, MARKET_UPDATE_INTERVAL)

    return () => clearInterval(marketTimer)
  }, [updateMarketPrices, triggerMarketEvent])

  useEffect(() => {
    if (gameState === 'completed') {
      const portfolioValue = calculatePortfolioValue()
      const totalValue = cash + portfolioValue
      const returnPercentage = ((totalValue - STARTING_CASH) / STARTING_CASH) * 100
      const diversificationScore = calculateDiversificationScore()
      
      const baseScore = Math.max(0, Math.round(returnPercentage * 10))
      const diversificationBonus = Math.round(diversificationScore * 2)
      const finalScore = baseScore + diversificationBonus
      
      const timeSpent = Math.round((Date.now() - gameStartTime) / 1000)
      
      onComplete(finalScore, timeSpent, {
        finalCash: cash,
        portfolioValue,
        totalValue,
        returnPercentage,
        diversificationScore,
        transactions: transactionHistory.length
      })
    }
  }, [gameState, cash, calculatePortfolioValue, calculateDiversificationScore, gameStartTime, onComplete, transactionHistory.length])

  if (gameState === 'completed') {
    const portfolioValue = calculatePortfolioValue()
    const totalValue = cash + portfolioValue
    const returnPercentage = ((totalValue - STARTING_CASH) / STARTING_CASH) * 100
    const diversificationScore = calculateDiversificationScore()
    const profit = totalValue - STARTING_CASH

    return (
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.25_0.08_280)] via-[oklch(0.20_0.10_260)] to-[oklch(0.15_0.08_240)] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-8 bg-gradient-to-br from-card to-muted border-2 border-primary/20">
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Trophy size={64} weight="fill" className="mx-auto text-accent" />
              </motion.div>
              
              <div>
                <h2 className="text-3xl font-bold mb-2">Market Closed!</h2>
                <p className="text-muted-foreground">Your investment portfolio results</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-background/50">
                  <div className="text-sm text-muted-foreground mb-1">Starting Capital</div>
                  <div className="text-2xl font-bold">${STARTING_CASH}</div>
                </Card>
                
                <Card className="p-4 bg-background/50">
                  <div className="text-sm text-muted-foreground mb-1">Final Value</div>
                  <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
                </Card>
                
                <Card className="p-4 bg-background/50">
                  <div className="text-sm text-muted-foreground mb-1">Return</div>
                  <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {profit >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%
                  </div>
                </Card>
                
                <Card className="p-4 bg-background/50">
                  <div className="text-sm text-muted-foreground mb-1">Diversification</div>
                  <div className="text-2xl font-bold text-accent">{diversificationScore}/100</div>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cash on Hand</span>
                  <span className="font-semibold">${cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Portfolio Value</span>
                  <span className="font-semibold">${portfolioValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Transactions</span>
                  <span className="font-semibold">{transactionHistory.length}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {diversificationScore >= 70 
                    ? "🎯 Excellent diversification! You spread risk well across sectors."
                    : diversificationScore >= 40
                    ? "📊 Good effort! Try spreading investments more evenly next time."
                    : "⚠️ High concentration risk. Diversify across more sectors for safety."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profit >= 100
                    ? "🚀 Outstanding returns! You capitalized on market opportunities."
                    : profit >= 0
                    ? "✅ Positive returns! You beat the break-even point."
                    : "📉 Market losses. Remember: buy low, sell high!"}
                </p>
              </div>

              <Button 
                onClick={onBack}
                size="lg"
                className="w-full"
              >
                Return to Hub
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  const portfolioValue = calculatePortfolioValue()
  const totalValue = cash + portfolioValue
  const diversificationScore = calculateDiversificationScore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.25_0.08_280)] via-[oklch(0.20_0.10_260)] to-[oklch(0.15_0.08_240)] p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 pixel-text">
              🎮 8-Bit Market Tycoon
            </h1>
            <p className="text-sm text-white/80">Build your investment empire!</p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-white/70">Time Left</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-card/90 to-muted/90 backdrop-blur-sm border-2 border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Coins size={24} weight="fill" className="text-accent" />
                <span className="font-semibold">Cash</span>
              </div>
              <span className="text-2xl font-bold">${cash.toFixed(2)}</span>
            </div>
            <Progress value={(cash / STARTING_CASH) * 100} className="h-2" />
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card/90 to-muted/90 backdrop-blur-sm border-2 border-secondary/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ChartBar size={24} weight="fill" className="text-secondary" />
                <span className="font-semibold">Portfolio</span>
              </div>
              <span className="text-2xl font-bold">${portfolioValue.toFixed(2)}</span>
            </div>
            <Progress value={(portfolioValue / (STARTING_CASH * 2)) * 100} className="h-2" />
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card/90 to-muted/90 backdrop-blur-sm border-2 border-accent/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy size={24} weight="fill" className="text-accent" />
                <span className="font-semibold">Diversification</span>
              </div>
              <span className="text-2xl font-bold">{diversificationScore}</span>
            </div>
            <Progress value={diversificationScore} className="h-2" />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6 bg-gradient-to-br from-card/80 to-muted/80 backdrop-blur-sm border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px),
                                 repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)`,
                backgroundSize: '20px 20px'
              }}
            />
            
            <h3 className="text-lg font-bold mb-4 relative z-10">🗺️ Market Map</h3>
            
            <div className="relative h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/30 overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 30% 40%, oklch(0.70 0.15 200 / 0.1) 0%, transparent 50%),
                                 radial-gradient(circle at 70% 60%, oklch(0.55 0.20 290 / 0.1) 0%, transparent 50%)`
              }} />
              
              {sectors.map((sector) => (
                <motion.div
                  key={sector.id}
                  className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                    selectedSector === sector.id ? 'z-20' : 'z-10'
                  }`}
                  style={{
                    left: `${sector.position.x}%`,
                    top: `${sector.position.y}%`
                  }}
                  onClick={() => setSelectedSector(sector.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={selectedSector === sector.id ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`p-3 min-w-[140px] ${
                      selectedSector === sector.id 
                        ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-2 border-white shadow-xl' 
                        : 'bg-card/95 border-2'
                    }`}
                    style={{
                      borderColor: selectedSector === sector.id ? 'white' : sector.color
                    }}
                  >
                    <div className="text-center space-y-1">
                      <div className="text-3xl">{sector.icon}</div>
                      <div className="font-bold text-sm">{sector.name}</div>
                      <div className="text-xs font-mono">${sector.pricePerShare.toFixed(2)}</div>
                      <div className="flex items-center justify-center gap-1">
                        {sector.trend === 'up' && <TrendUp size={14} className="text-green-500" />}
                        {sector.trend === 'down' && <TrendDown size={14} className="text-red-500" />}
                        {sector.trend === 'stable' && <Minus size={14} className="text-yellow-500" />}
                        {sector.shares > 0 && (
                          <span className="text-xs font-bold px-1 py-0.5 bg-accent text-accent-foreground rounded">
                            {sector.shares}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <AnimatePresence>
              {currentEvent && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                >
                  <Card className="p-4 bg-gradient-to-r from-accent/90 to-accent/70 border-2 border-accent text-accent-foreground">
                    <div className="font-bold text-lg mb-1">{currentEvent.title}</div>
                    <div className="text-sm">{currentEvent.description}</div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Card className="p-6 bg-gradient-to-br from-card/80 to-muted/80 backdrop-blur-sm border-2 border-secondary/20">
              {selectedSector ? (
                <div className="space-y-4">
                  {(() => {
                    const sector = sectors.find(s => s.id === selectedSector)!
                    const holdings = sector.shares * sector.pricePerShare
                    
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{sector.icon}</div>
                            <div>
                              <h3 className="text-xl font-bold">{sector.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>${sector.pricePerShare.toFixed(2)}/share</span>
                                {sector.trend === 'up' && <TrendUp size={16} className="text-green-500" />}
                                {sector.trend === 'down' && <TrendDown size={16} className="text-red-500" />}
                                {sector.trend === 'stable' && <Minus size={16} className="text-yellow-500" />}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedSector(null)}
                          >
                            ✕
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Shares Owned</div>
                            <div className="text-2xl font-bold">{sector.shares}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Holdings Value</div>
                            <div className="text-2xl font-bold">${holdings.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => buySector(sector.id)}
                            disabled={cash < sector.pricePerShare}
                            className="flex-1"
                            size="lg"
                          >
                            Buy ${sector.pricePerShare.toFixed(2)}
                          </Button>
                          <Button
                            onClick={() => sellSector(sector.id)}
                            disabled={sector.shares === 0}
                            variant="secondary"
                            className="flex-1"
                            size="lg"
                          >
                            Sell
                          </Button>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Volatility:</span>
                            <span className="font-semibold">{(sector.volatility * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Available Cash:</span>
                            <span className="font-semibold">${cash.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="text-6xl">📍</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Select a Sector</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on any sector in the market map to buy or sell shares
                    </p>
                  </div>
                  <div className="pt-4 space-y-2 text-xs text-muted-foreground text-left max-w-xs mx-auto">
                    <div className="flex items-start gap-2">
                      <TrendUp size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Green arrow = Price rising</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendDown size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Red arrow = Price falling</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Trophy size={16} className="text-accent flex-shrink-0 mt-0.5" />
                      <span>Diversify to boost your score!</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4 bg-gradient-to-br from-card/80 to-muted/80 backdrop-blur-sm border-2 border-accent/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <ChartBar size={20} />
                Portfolio Breakdown
              </h4>
              <div className="space-y-2">
                {sectors.map(sector => {
                  const value = sector.shares * sector.pricePerShare
                  const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0
                  
                  return (
                    <div key={sector.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span>{sector.icon}</span>
                          <span>{sector.name}</span>
                        </span>
                        <span className="font-semibold">
                          {sector.shares > 0 ? `${percentage.toFixed(1)}%` : '—'}
                        </span>
                      </div>
                      {sector.shares > 0 && (
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: sector.color }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
