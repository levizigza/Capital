import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, TrendUp, TrendDown, Warning, Trophy, Target } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface InvestmentClimberGameProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface Asset {
  id: string
  type: 'stocks' | 'bonds' | 'crypto' | 'reits' | 'commodities' | 'cash'
  name: string
  expectedReturn: number
  risk: number
  currentValue: number
  color: string
  emoji: string
}

interface MarketEvent {
  type: 'bull' | 'bear' | 'crash' | 'boom'
  message: string
  impact: { [key: string]: number }
}

const marketEvents: MarketEvent[] = [
  {
    type: 'bull',
    message: '📈 Stock market rally! Tech stocks soar!',
    impact: { stocks: 1.15, crypto: 1.12, bonds: 1.02, reits: 1.08, commodities: 1.05, cash: 1.0 }
  },
  {
    type: 'bear',
    message: '📉 Market correction. Safe havens strengthen.',
    impact: { stocks: 0.92, crypto: 0.85, bonds: 1.05, reits: 0.95, commodities: 1.03, cash: 1.0 }
  },
  {
    type: 'crash',
    message: '⚠️ Economic uncertainty! Risky assets tumble!',
    impact: { stocks: 0.85, crypto: 0.70, bonds: 1.08, reits: 0.88, commodities: 0.92, cash: 1.0 }
  },
  {
    type: 'boom',
    message: '🚀 Economic boom! All assets rising!',
    impact: { stocks: 1.20, crypto: 1.25, bonds: 1.03, reits: 1.15, commodities: 1.12, cash: 1.0 }
  }
]

const assetTemplates: Omit<Asset, 'id' | 'currentValue'>[] = [
  { type: 'stocks', name: 'S&P 500 ETF', expectedReturn: 10, risk: 6, color: 'bg-blue-500', emoji: '📊' },
  { type: 'bonds', name: 'Treasury Bonds', expectedReturn: 4, risk: 2, color: 'bg-green-500', emoji: '🏛️' },
  { type: 'crypto', name: 'Cryptocurrency', expectedReturn: 15, risk: 9, color: 'bg-purple-500', emoji: '₿' },
  { type: 'reits', name: 'Real Estate ETF', expectedReturn: 8, risk: 5, color: 'bg-orange-500', emoji: '🏠' },
  { type: 'commodities', name: 'Gold & Commodities', expectedReturn: 6, risk: 4, color: 'bg-yellow-500', emoji: '🪙' },
  { type: 'cash', name: 'High-Yield Savings', expectedReturn: 2, risk: 1, color: 'bg-gray-500', emoji: '💵' }
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

  const startGame = () => {
    const initialAssets = assetTemplates.map((template, index) => ({
      ...template,
      id: `asset-${index}`,
      currentValue: 0
    }))
    setAvailableAssets(initialAssets)
    setCash(10000)
    setPortfolio([])
    setPortfolioValue(0)
    setRound(1)
    setScore(0)
    setGameState('playing')
    toast.success('Investment Tower Started! Build a diversified portfolio.')
  }

  const buyAsset = (asset: Asset) => {
    const investAmount = 1000
    if (cash >= investAmount) {
      const newAsset = {
        ...asset,
        id: `${asset.type}-${Date.now()}`,
        currentValue: investAmount
      }
      setPortfolio(prev => [...prev, newAsset])
      setCash(prev => prev - investAmount)
      toast.success(`Invested $${investAmount.toLocaleString()} in ${asset.name}`)
    } else {
      toast.error('Insufficient cash!')
    }
  }

  const sellAsset = (assetId: string) => {
    const asset = portfolio.find(a => a.id === assetId)
    if (asset) {
      setCash(prev => prev + asset.currentValue)
      setPortfolio(prev => prev.filter(a => a.id !== assetId))
      toast.info(`Sold ${asset.name} for $${Math.round(asset.currentValue).toLocaleString()}`)
    }
  }

  const nextRound = () => {
    if (portfolio.length === 0) {
      toast.error('You must own at least one asset to continue!')
      return
    }

    const event = marketEvents[Math.floor(Math.random() * marketEvents.length)]
    setCurrentEvent(event)

    setPortfolio(prev => prev.map(asset => ({
      ...asset,
      currentValue: asset.currentValue * (event.impact[asset.type] || 1)
    })))

    setTimeout(() => {
      setCurrentEvent(null)
      if (round >= maxRounds) {
        endGame()
      } else {
        setRound(prev => prev + 1)
      }
    }, 3000)
  }

  const endGame = () => {
    const totalValue = portfolioValue + cash
    const returnPercent = ((totalValue - 10000) / 10000) * 100
    const finalScore = Math.max(0, Math.round(totalValue + diversificationBonus * 100 - riskScore * 50))
    setScore(finalScore)
    setGameState('ended')
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

  if (gameState === 'ended') {
    const totalValue = portfolioValue + cash
    const returnPercent = ((totalValue - 10000) / 10000) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {returnPercent > 20 ? '🏆' : returnPercent > 0 ? '📈' : '📉'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Complete!</h2>
              <p className="text-gray-600">
                {returnPercent > 20 ? 'Outstanding Performance!' : returnPercent > 0 ? 'Solid Returns!' : 'Learning Experience'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                <div className="text-sm text-gray-600 mb-1">Final Value</div>
                <div className="text-2xl font-bold text-green-600">
                  ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Total Return</div>
                <div className={`text-2xl font-bold ${returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(1)}%
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Diversification</div>
                <div className="text-2xl font-bold text-purple-600">
                  {diversificationBonus}/6 Assets
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-orange-200">
                <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                <div className="text-2xl font-bold text-orange-600">
                  {riskScore.toFixed(1)}/10
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Key Lessons</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ {diversificationBonus >= 4 ? 'Great diversification!' : 'Try diversifying across more asset types'}</li>
                <li>✓ {riskScore < 6 ? 'Well-balanced risk level' : 'Consider balancing with lower-risk assets'}</li>
                <li>✓ Portfolio rebalancing helps manage market volatility</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={startGame} className="flex-1 bg-green-600 hover:bg-green-700">
                <TrendUp className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={() => onComplete(score, { finalValue: totalValue, returnPercent })} variant="outline" className="flex-1">
                <Trophy className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white border-b shadow-sm p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <TrendUp className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-semibold">Investment Tower</h1>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-6">📈</div>
                <h2 className="text-2xl font-bold mb-4">Investment Tower</h2>
                <p className="text-gray-600 mb-6">
                  Build a diversified investment portfolio over 10 market rounds. Buy and sell assets as market conditions change. Maximize returns while managing risk!
                </p>

                <div className="bg-blue-50 rounded-xl p-6 mb-6 text-left">
                  <h3 className="font-semibold text-blue-900 mb-3">How to Play:</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Start with $10,000 in cash to invest</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>Buy assets ($1,000 each) from 6 different types</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>Each round brings market events that affect asset values</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">4.</span>
                      <span>Diversify to reduce risk and maximize returns!</span>
                    </li>
                  </ul>
                </div>

                <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
                  <TrendUp className="w-5 h-5 mr-2" />
                  Start Investing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white border-b shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <TrendUp className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-semibold">Investment Tower</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base px-4 py-2">
              Round {round}/{maxRounds}
            </Badge>
          </div>
        </div>
      </div>

      {currentEvent && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="container mx-auto text-center">
            <p className="text-lg font-semibold text-yellow-900">{currentEvent.message}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Cash</div>
                    <div className="text-xl font-bold text-green-600">
                      ${cash.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Portfolio</div>
                    <div className="text-xl font-bold text-blue-600">
                      ${Math.round(portfolioValue).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Total Value</div>
                    <div className="text-xl font-bold text-purple-600">
                      ${Math.round(portfolioValue + cash).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Return</div>
                    <div className={`text-xl font-bold ${portfolioValue + cash >= 10000 ? 'text-green-600' : 'text-red-600'}`}>
                      {((portfolioValue + cash - 10000) / 10000 * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Available Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableAssets.map(asset => (
                    <div key={asset.id} className={`${asset.color} bg-opacity-10 border-2 border-current rounded-xl p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{asset.emoji}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{asset.name}</div>
                            <div className="text-xs text-gray-600">Avg: {asset.expectedReturn}% | Risk: {asset.risk}/10</div>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => buyAsset(asset)}
                        disabled={cash < 1000}
                        size="sm"
                        className="w-full"
                      >
                        Buy $1,000
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Your Portfolio</h3>
                {portfolio.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No investments yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {portfolio.map(asset => (
                      <div key={asset.id} className="bg-white border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{asset.emoji}</span>
                            <div>
                              <div className="font-semibold text-sm text-gray-900">{asset.name}</div>
                              <div className="text-xs text-gray-600">
                                ${Math.round(asset.currentValue).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => sellAsset(asset.id)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Sell
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Portfolio Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Diversification</span>
                      <span className="font-semibold">{diversificationBonus}/6</span>
                    </div>
                    <Progress value={(diversificationBonus / 6) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Risk Level</span>
                      <span className="font-semibold">{riskScore.toFixed(1)}/10</span>
                    </div>
                    <Progress value={(riskScore / 10) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={nextRound}
              disabled={portfolio.length === 0 || currentEvent !== null}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {round === maxRounds ? 'Finish Game' : 'Next Round →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
