import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, TrendUp, TrendDown } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface PortfolioParkGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface Asset {
  id: number
  type: 'stocks' | 'bonds' | 'crypto' | 'real-estate'
  name: string
  risk: number // 1-10
  return: number // percentage
  emoji: string
  color: string
}

export function PortfolioParkGame({ onComplete, onExit, userTier = 'middle' }: PortfolioParkGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [portfolio, setPortfolio] = useState<Asset[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [round, setRound] = useState(1)
  const [budget, setBudget] = useState(10000)
  const [timeLeft, setTimeLeft] = useState(120)
  const [targetReturn, setTargetReturn] = useState(8)
  const [maxRisk, setMaxRisk] = useState(6)

  const assetTypes: Asset[] = [
    { id: 1, type: 'stocks', name: 'Tech Stocks', risk: 8, return: 12, emoji: '📈', color: '#3b82f6' },
    { id: 2, type: 'stocks', name: 'Blue Chips', risk: 5, return: 7, emoji: '💼', color: '#10b981' },
    { id: 3, type: 'bonds', name: 'Government Bonds', risk: 2, return: 3, emoji: '🏛️', color: '#8b5cf6' },
    { id: 4, type: 'bonds', name: 'Corporate Bonds', risk: 4, return: 5, emoji: '🏢', color: '#6366f1' },
    { id: 5, type: 'crypto', name: 'Bitcoin', risk: 9, return: 15, emoji: '₿', color: '#f59e0b' },
    { id: 6, type: 'crypto', name: 'Ethereum', risk: 8, return: 12, emoji: 'Ξ', color: '#ec4899' },
    { id: 7, type: 'real-estate', name: 'REITs', risk: 6, return: 8, emoji: '🏠', color: '#14b8a6' },
    { id: 8, type: 'real-estate', name: 'Property Fund', risk: 4, return: 6, emoji: '🏘️', color: '#06b6d4' }
  ]

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            endRound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState === 'playing' && availableAssets.length === 0) {
      // Shuffle and select 6 random assets
      const shuffled = [...assetTypes].sort(() => Math.random() - 0.5)
      setAvailableAssets(shuffled.slice(0, 6))
    }
  }, [gameState])

  const calculatePortfolioMetrics = () => {
    if (portfolio.length === 0) return { avgRisk: 0, avgReturn: 0, totalValue: 0 }
    
    const totalValue = portfolio.reduce((sum, asset) => sum + (budget / portfolio.length), 0)
    const avgRisk = portfolio.reduce((sum, asset) => sum + asset.risk, 0) / portfolio.length
    const avgReturn = portfolio.reduce((sum, asset) => sum + asset.return, 0) / portfolio.length
    
    return { avgRisk, avgReturn, totalValue }
  }

  const addToPortfolio = (asset: Asset) => {
    if (portfolio.length >= 6) {
      toast.error('Portfolio is full! Remove an asset first.')
      return
    }
    setPortfolio(prev => [...prev, asset])
    setAvailableAssets(prev => prev.filter(a => a.id !== asset.id))
  }

  const removeFromPortfolio = (asset: Asset) => {
    setPortfolio(prev => prev.filter(a => a.id !== asset.id))
    setAvailableAssets(prev => [...prev, asset])
  }

  const endRound = () => {
    const metrics = calculatePortfolioMetrics()
    const riskScore = metrics.avgRisk <= maxRisk ? 100 : Math.max(0, 100 - (metrics.avgRisk - maxRisk) * 10)
    const returnScore = metrics.avgReturn >= targetReturn ? 100 : (metrics.avgReturn / targetReturn) * 100
    const diversificationScore = portfolio.length >= 4 ? 50 : portfolio.length * 12.5
    
    const roundScore = (riskScore * 0.4 + returnScore * 0.4 + diversificationScore * 0.2)
    setScore(prev => prev + roundScore)

    if (round >= 3) {
      endGame()
    } else {
      toast.success(`Round ${round} complete! Score: ${Math.floor(roundScore)}`)
      setRound(prev => prev + 1)
      setTimeLeft(120)
      setPortfolio([])
      setAvailableAssets([])
      setTargetReturn(prev => prev + 1)
    }
  }

  const endGame = () => {
    setGameState('ended')
    setTimeout(() => {
      onComplete(Math.floor(score), {
        roundsCompleted: round,
        finalPortfolio: portfolio.length,
        finalMetrics: calculatePortfolioMetrics()
      })
    }, 2000)
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setRound(1)
    setTimeLeft(120)
    setBudget(10000)
    setTargetReturn(8)
    setMaxRisk(6)
    setPortfolio([])
    setAvailableAssets([])
  }

  const metrics = calculatePortfolioMetrics()

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold mb-4">Portfolio Park</h2>
            <p className="text-lg text-gray-600 mb-6">
              Build the perfect investment portfolio! Balance risk and return to meet targets.
              Diversify across different asset types for bonus points!
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <p className="text-sm font-semibold">Target Return: {targetReturn}%</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl mb-2">⚠️</div>
                <p className="text-sm font-semibold">Max Risk: {maxRisk}/10</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={onExit} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2" /> Exit
              </Button>
              <Button onClick={startGame} className="flex-1 bg-green-600 hover:bg-green-700">
                Start Building
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-4">Portfolio Complete!</h2>
            <p className="text-2xl font-bold text-green-600 mb-2">Score: {Math.floor(score)}</p>
            <p className="text-lg text-gray-600 mb-6">
              Rounds Completed: {round} • Final Portfolio Size: {portfolio.length} assets
            </p>
            <Button onClick={() => onComplete(score)} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-cyan-50 p-4">
      {/* HUD */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Round</div>
              <div className="text-2xl font-bold">{round}/3</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Score</div>
              <div className="text-2xl font-bold">{Math.floor(score)}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Time</div>
              <div className="text-2xl font-bold">{timeLeft}s</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Target Return</div>
              <div className="text-xl font-bold">{targetReturn}%</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-4">
              <div className="text-sm font-semibold text-gray-600">Max Risk</div>
              <div className="text-xl font-bold">{maxRisk}/10</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4">
        {/* Available Assets */}
        <Card className="bg-white/90">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Available Assets</h3>
            <div className="grid grid-cols-2 gap-3">
              {availableAssets.map(asset => (
                <motion.div
                  key={asset.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    className="cursor-pointer border-2"
                    style={{ borderColor: asset.color }}
                    onClick={() => addToPortfolio(asset)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{asset.emoji}</div>
                      <div className="text-sm font-bold">{asset.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Risk: {asset.risk}/10 • Return: {asset.return}%
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="bg-white/90">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Your Portfolio ({portfolio.length}/6)</h3>
            {portfolio.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                Click assets to add them to your portfolio
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {portfolio.map(asset => (
                    <motion.div
                      key={asset.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card 
                        className="cursor-pointer border-2"
                        style={{ borderColor: asset.color }}
                        onClick={() => removeFromPortfolio(asset)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl mb-2">{asset.emoji}</div>
                          <div className="text-sm font-bold">{asset.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            Risk: {asset.risk}/10 • Return: {asset.return}%
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                {/* Portfolio Metrics */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600">Avg Risk</div>
                      <div className="text-lg font-bold" style={{ 
                        color: metrics.avgRisk > maxRisk ? '#ef4444' : '#10b981' 
                      }}>
                        {metrics.avgRisk.toFixed(1)}/10
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Avg Return</div>
                      <div className="text-lg font-bold" style={{ 
                        color: metrics.avgReturn >= targetReturn ? '#10b981' : '#f59e0b' 
                      }}>
                        {metrics.avgReturn.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complete Button */}
      <div className="max-w-6xl mx-auto mt-4">
        <Button 
          onClick={endRound} 
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={portfolio.length === 0}
        >
          Complete Round
        </Button>
      </div>

      {/* Exit Button */}
      <div className="max-w-6xl mx-auto mt-4">
        <Button onClick={onExit} variant="outline" className="bg-white/90">
          <ArrowLeft className="mr-2" /> Exit
        </Button>
      </div>
    </div>
  )
}
