import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, TrendUp, TrendDown, Warning, Trophy, Target, ChartLine, Shield, Star, Coins } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface InvestmentClimberGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface Asset {
  id: string
  type: 'stocks' | 'bonds' | 'crypto' | 'reits' | 'commodities' | 'cash'
  name: string
  description: string
  expectedReturn: number
  risk: number
  currentValue: number
  purchasePrice: number
  color: string
  gradient: string
  emoji: string
}

interface MarketEvent {
  type: 'bull' | 'bear' | 'crash' | 'boom' | 'stable'
  message: string
  description: string
  impact: { [key: string]: number }
  emoji: string
}

const marketEvents: MarketEvent[] = [
  {
    type: 'bull',
    message: 'Bull Market Rally',
    description: 'Stock market soars as tech sector leads gains',
    impact: { stocks: 1.15, crypto: 1.12, bonds: 1.02, reits: 1.08, commodities: 1.05, cash: 1.0 },
    emoji: '📈'
  },
  {
    type: 'bear',
    message: 'Market Correction',
    description: 'Economic concerns trigger selloff, safe havens gain',
    impact: { stocks: 0.92, crypto: 0.85, bonds: 1.05, reits: 0.95, commodities: 1.03, cash: 1.0 },
    emoji: '📉'
  },
  {
    type: 'crash',
    message: 'Market Volatility',
    description: 'Uncertainty hits risk assets hard',
    impact: { stocks: 0.85, crypto: 0.70, bonds: 1.08, reits: 0.88, commodities: 0.92, cash: 1.0 },
    emoji: '⚠️'
  },
  {
    type: 'boom',
    message: 'Economic Boom',
    description: 'Strong GDP growth lifts all asset classes',
    impact: { stocks: 1.20, crypto: 1.25, bonds: 1.03, reits: 1.15, commodities: 1.12, cash: 1.0 },
    emoji: '🚀'
  },
  {
    type: 'stable',
    message: 'Stable Markets',
    description: 'Markets trade sideways with modest gains',
    impact: { stocks: 1.03, crypto: 1.02, bonds: 1.01, reits: 1.02, commodities: 1.01, cash: 1.0 },
    emoji: '📊'
  }
]

const assetTemplates: Omit<Asset, 'id' | 'currentValue' | 'purchasePrice'>[] = [
  { 
    type: 'stocks', 
    name: 'Stock Index ETF', 
    description: 'Diversified equity fund',
    expectedReturn: 10, 
    risk: 6, 
    color: 'from-blue-500 to-blue-400', 
    gradient: 'from-blue-100 to-blue-50',
    emoji: '📊' 
  },
  { 
    type: 'bonds', 
    name: 'Government Bonds', 
    description: 'Safe treasury securities',
    expectedReturn: 4, 
    risk: 2, 
    color: 'from-green-500 to-green-400', 
    gradient: 'from-green-100 to-green-50',
    emoji: '🏛️' 
  },
  { 
    type: 'crypto', 
    name: 'Cryptocurrency', 
    description: 'Digital assets with high volatility',
    expectedReturn: 15, 
    risk: 9, 
    color: 'from-purple-500 to-purple-400', 
    gradient: 'from-purple-100 to-purple-50',
    emoji: '₿' 
  },
  { 
    type: 'reits', 
    name: 'Real Estate Fund', 
    description: 'Property investment trust',
    expectedReturn: 8, 
    risk: 5, 
    color: 'from-orange-500 to-orange-400', 
    gradient: 'from-orange-100 to-orange-50',
    emoji: '🏠' 
  },
  { 
    type: 'commodities', 
    name: 'Gold & Commodities', 
    description: 'Precious metals hedge',
    expectedReturn: 6, 
    risk: 4, 
    color: 'from-yellow-500 to-yellow-400', 
    gradient: 'from-yellow-100 to-yellow-50',
    emoji: '🪙' 
  },
  { 
    type: 'cash', 
    name: 'Savings Account', 
    description: 'Ultra-safe liquid cash',
    expectedReturn: 2, 
    risk: 1, 
    color: 'from-gray-500 to-gray-400', 
    gradient: 'from-gray-100 to-gray-50',
    emoji: '💵' 
  }
]

export function InvestmentClimberGame({ onComplete, onExit, userTier = 'middle' }: InvestmentClimberGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [portfolio, setPortfolio] = useState<Asset[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [cash, setCash] = useState(10000)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [round, setRound] = useState(1)
  const [maxRounds] = useState(10)
  const [currentEvent, setCurrentEvent] = useState<MarketEvent | null>(null)
  const [score, setScore] = useState(0)
  const [riskScore, setRiskScore] = useState(0)
  const [diversificationBonus, setDiversificationBonus] = useState(0)
  const [showEvent, setShowEvent] = useState(false)
  const [investmentHistory, setInvestmentHistory] = useState<number[]>([10000])

  const startGame = () => {
    const initialAssets = assetTemplates.map((template, index) => ({
      ...template,
      id: `asset-${index}`,
      currentValue: 0,
      purchasePrice: 0
    }))
    setAvailableAssets(initialAssets)
    setCash(10000)
    setPortfolio([])
    setPortfolioValue(0)
    setRound(1)
    setScore(0)
    setInvestmentHistory([10000])
    setGameState('playing')
    toast.success('🎯 Start building your portfolio!', { duration: 2000 })
  }

  const buyAsset = (asset: Asset) => {
    const investAmount = 1000
    if (cash >= investAmount) {
      const newAsset: Asset = {
        ...asset,
        id: `${asset.type}-${Date.now()}`,
        currentValue: investAmount,
        purchasePrice: investAmount
      }
      setPortfolio(prev => [...prev, newAsset])
      setCash(prev => prev - investAmount)
      toast.success(`✓ Invested $${investAmount.toLocaleString()} in ${asset.name}`, { duration: 1500 })
    } else {
      toast.error('Insufficient cash available!', { duration: 1500 })
    }
  }

  const sellAsset = (assetId: string) => {
    const asset = portfolio.find(a => a.id === assetId)
    if (asset) {
      const profit = asset.currentValue - asset.purchasePrice
      setCash(prev => prev + asset.currentValue)
      setPortfolio(prev => prev.filter(a => a.id !== assetId))
      
      if (profit > 0) {
        toast.success(`✓ Sold for $${Math.round(asset.currentValue).toLocaleString()} (+$${Math.round(profit)})`, { duration: 1500 })
      } else {
        toast.error(`Sold for $${Math.round(asset.currentValue).toLocaleString()} (${Math.round(profit)})`, { duration: 1500 })
      }
    }
  }

  const nextRound = () => {
    if (portfolio.length === 0) {
      toast.error('⚠️ You must own at least one asset to continue!', { duration: 2000 })
      return
    }

    const event = marketEvents[Math.floor(Math.random() * marketEvents.length)]
    setCurrentEvent(event)
    setShowEvent(true)

    setPortfolio(prev => prev.map(asset => ({
      ...asset,
      currentValue: asset.currentValue * (event.impact[asset.type] || 1)
    })))

    const newTotalValue = portfolio.reduce((sum, asset) => 
      sum + (asset.currentValue * (event.impact[asset.type] || 1)), 0
    ) + cash
    setInvestmentHistory(prev => [...prev, newTotalValue])

    setTimeout(() => {
      setShowEvent(false)
      setCurrentEvent(null)
      
      if (round >= maxRounds) {
        endGame()
      } else {
        setRound(prev => prev + 1)
        toast.info(`Round ${round + 1} - Adjust your portfolio`, { duration: 2000 })
      }
    }, 3500)
  }

  const endGame = () => {
    const totalValue = portfolioValue + cash
    const returnPercent = ((totalValue - 10000) / 10000) * 100
    const finalScore = Math.max(0, Math.round(totalValue + diversificationBonus * 200 - riskScore * 30))
    setScore(finalScore)
    setGameState('ended')
    
    onComplete(finalScore, { 
      finalValue: totalValue, 
      returnPercent,
      diversification: diversificationBonus,
      riskLevel: riskScore
    })
  }

  useEffect(() => {
    const total = portfolio.reduce((sum, asset) => sum + asset.currentValue, 0)
    setPortfolioValue(total)

    const avgRisk = portfolio.length > 0
      ? portfolio.reduce((sum, asset) => sum + asset.risk, 0) / portfolio.length
      : 0
    setRiskScore(avgRisk)

    const assetTypes = new Set(portfolio.map(a => a.type))
    setDiversificationBonus(assetTypes.size)
  }, [portfolio])

  const getTotalValue = () => portfolioValue + cash
  const getReturnPercent = () => ((getTotalValue() - 10000) / 10000) * 100
  const getReturnDollar = () => getTotalValue() - 10000

  if (gameState === 'ended') {
    const totalValue = getTotalValue()
    const returnPercent = getReturnPercent()
    const performanceRating = returnPercent > 50 ? 'Outstanding!' : returnPercent > 25 ? 'Excellent!' : returnPercent > 10 ? 'Good!' : returnPercent > 0 ? 'Positive!' : 'Learning Experience'

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-4xl glass-card shadow-2xl">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center mb-8"
            >
              <div className="text-7xl mb-4">
                {returnPercent > 25 ? '🏆' : returnPercent > 10 ? '🎉' : returnPercent > 0 ? '📈' : '📉'}
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Investment Journey Complete!</h2>
              <p className="text-xl text-accent font-semibold">{performanceRating}</p>
            </motion.div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-accent text-center"
              >
                <div className="text-4xl font-bold text-accent mb-2">
                  ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-muted-foreground">Final Portfolio Value</div>
              </motion.div>
              
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`glass-card p-6 rounded-xl border-l-4 text-center ${
                  returnPercent >= 0 ? 'border-l-secondary' : 'border-l-destructive'
                }`}
              >
                <div className={`text-4xl font-bold mb-2 ${returnPercent >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                  {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Total Return</div>
              </motion.div>
              
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-primary text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">
                  {diversificationBonus}/6
                </div>
                <div className="text-sm text-muted-foreground">Asset Types</div>
              </motion.div>
              
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-muted-foreground text-center"
              >
                <div className="text-4xl font-bold text-foreground mb-2">
                  {riskScore.toFixed(1)}/10
                </div>
                <div className="text-sm text-muted-foreground">Risk Level</div>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid md:grid-cols-3 gap-4 mb-8"
            >
              <div className="glass-card p-4 rounded-xl text-center">
                <Coins className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold text-accent mb-1">
                  ${Math.abs(getReturnDollar()).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getReturnDollar() >= 0 ? 'Profit' : 'Loss'}
                </div>
              </div>
              
              <div className="glass-card p-4 rounded-xl text-center">
                <ChartLine className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {maxRounds}
                </div>
                <div className="text-xs text-muted-foreground">Rounds Completed</div>
              </div>
              
              <div className="glass-card p-4 rounded-xl text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold text-secondary mb-1">
                  {diversificationBonus >= 4 ? 'High' : diversificationBonus >= 3 ? 'Medium' : 'Low'}
                </div>
                <div className="text-xs text-muted-foreground">Diversification</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-muted/30 p-6 rounded-xl mb-8"
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" weight="fill" />
                Investment Insights
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>
                    {diversificationBonus >= 4 
                      ? 'Excellent diversification across multiple asset classes reduces risk' 
                      : 'Consider spreading investments across more asset types to reduce risk'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>
                    {riskScore < 5 
                      ? 'Your conservative approach provides stability during market volatility' 
                      : 'Higher risk portfolios can yield greater returns but require careful management'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Rebalancing your portfolio during market changes is key to long-term success</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Time in the market beats timing the market - stay invested for the long term</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3"
            >
              <Button onClick={startGame} className="flex-1 btn-secondary-gaming">
                <TrendUp className="w-4 h-4 mr-2" />
                Invest Again
              </Button>
              <Button onClick={() => endGame()} variant="outline" className="flex-1 border-2">
                Continue
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-blue-50 to-pink-50 p-8">
        <div className="w-full max-w-2xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">🏢</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Welcome to Investment Tower!</h2>
          <p className="text-xl text-muted-foreground mb-8 text-center max-w-lg">
            Invest wisely to climb the tower! Make smart choices to maximize your returns.
          </p>
          <Button onClick={startGame} className="game-arcade-btn w-full max-w-md text-2xl">
            <ArrowLeft className="w-6 h-6 mr-3" />
            Start Investing
          </Button>
          <Button onClick={onExit} variant="outline" className="w-full max-w-md text-lg mt-2 border-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-arcade-container">
      <div className="game-arcade-header flex items-center gap-4 mb-6">
        <span className="text-5xl">🏢</span>
        Investment Tower
      </div>
      <div className="game-arcade-stats">
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-green-600">${score}</div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-blue-600">{round}</div>
          <div className="text-xs text-muted-foreground">Level</div>
        </div>
      </div>
      <div className="game-arcade-actions">
        <button className="game-arcade-btn" onClick={startGame}>Invest</button>
        <button className="game-arcade-btn" onClick={nextRound}>Next Round</button>
        <button className="game-arcade-btn" onClick={onExit}>Exit</button>
      </div>

      <div className="game-arcade-content">
        <AnimatePresence>
          {showEvent && currentEvent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="glass-card border-b-0 overflow-hidden"
            >
              <div className="container mx-auto px-6 py-6">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center gap-4"
                >
                  <div className="text-5xl">{currentEvent.emoji}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{currentEvent.message}</h3>
                    <p className="text-muted-foreground">{currentEvent.description}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 glass-card rounded-xl border-2 border-accent/20">
                    <Coins className="w-6 h-6 mx-auto mb-2 text-accent" />
                    <div className="text-xs text-muted-foreground mb-1">Cash</div>
                    <div className="text-xl font-bold text-accent">
                      ${cash.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-4 glass-card rounded-xl border-2 border-primary/20">
                    <ChartLine className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-xs text-muted-foreground mb-1">Portfolio</div>
                    <div className="text-xl font-bold text-primary">
                      ${Math.round(portfolioValue).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-4 glass-card rounded-xl border-2 border-secondary/20">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-secondary" />
                    <div className="text-xs text-muted-foreground mb-1">Assets</div>
                    <div className="text-xl font-bold text-secondary">
                      {diversificationBonus}/6
                    </div>
                  </div>
                  <div className="text-center p-4 glass-card rounded-xl border-2 border-muted-foreground/20">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground mb-1">Risk</div>
                    <div className="text-xl font-bold text-foreground">
                      {riskScore.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Available Assets
                </CardTitle>
                <p className="text-xs text-muted-foreground">Click to invest $1,000 per asset</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {availableAssets.map((asset, index) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`glass-card p-5 rounded-xl bg-gradient-to-br ${asset.gradient} border-2 border-border hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{asset.emoji}</span>
                          <div>
                            <div className="font-bold text-foreground">{asset.name}</div>
                            <div className="text-xs text-muted-foreground">{asset.description}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="flex items-center gap-1">
                          <TrendUp className="w-3 h-3 text-secondary" />
                          <span className="text-muted-foreground">Return: {asset.expectedReturn}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Warning className="w-3 h-3 text-orange-500" />
                          <span className="text-muted-foreground">Risk: {asset.risk}/10</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => buyAsset(asset)}
                        disabled={cash < 1000 || showEvent}
                        size="sm"
                        className="w-full btn-primary-gaming"
                      >
                        Buy $1,000
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChartLine className="w-5 h-5 text-primary" />
                  Your Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolio.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No investments yet</p>
                    <p className="text-xs mt-1">Start by buying assets</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {portfolio.map((asset, index) => {
                        const profitLoss = asset.currentValue - asset.purchasePrice
                        const profitLossPercent = (profitLoss / asset.purchasePrice) * 100
                        
                        return (
                          <motion.div
                            key={asset.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`glass-card p-4 rounded-xl bg-gradient-to-br ${asset.gradient} border-2 border-border`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{asset.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-foreground">{asset.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  ${Math.round(asset.currentValue).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className={`text-xs font-semibold mb-3 ${
                              profitLoss >= 0 ? 'text-secondary' : 'text-destructive'
                            }`}>
                              {profitLoss >= 0 ? '+' : ''}${Math.round(profitLoss).toLocaleString()} 
                              ({profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)
                            </div>
                            
                            <Button
                              onClick={() => sellAsset(asset.id)}
                              disabled={showEvent}
                              variant="outline"
                              size="sm"
                              className="w-full border-2"
                            >
                              Sell Asset
                            </Button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Portfolio Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Diversification</span>
                    <span className="font-bold text-foreground">{diversificationBonus}/6 Types</span>
                  </div>
                  <Progress value={(diversificationBonus / 6) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {diversificationBonus >= 4 ? '✓ Well diversified' : 'Add more asset types'}
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span className="font-bold text-foreground">{riskScore.toFixed(1)}/10</span>
                  </div>
                  <Progress value={(riskScore / 10) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {riskScore < 4 ? 'Conservative' : riskScore < 7 ? 'Balanced' : 'Aggressive'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={nextRound}
              disabled={portfolio.length === 0 || showEvent}
              className="w-full btn-secondary-gaming py-6 text-lg shadow-xl"
              size="lg"
            >
              {round === maxRounds ? (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Finish & See Results
                </>
              ) : (
                <>
                  Next Round
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
