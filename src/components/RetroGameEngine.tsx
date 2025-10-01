import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, Clock, Coins, Lightning, Target, 
  Play, Pause, ArrowCounterClockwise, Trophy
} from '@phosphor-icons/react'

interface RetroGame {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  color: string
  gameType: 'lemonade-boss' | 'pixel-budget-runner' | 'market-tycoon' | 'debt-dash'
  kinestheticEnabled: boolean
  bciEnabled: boolean
  learningObjectives: string[]
}

interface LearningStyle {
  visual: number
  auditory: number
  readWrite: number
  kinesthetic: number
  dominant: 'visual' | 'auditory' | 'read-write' | 'kinesthetic'
}

interface RetroGameEngineProps {
  game: RetroGame
  learningStyle: LearningStyle | null
  kinestheticEnabled: boolean
  bciEnabled: boolean
  onComplete: (score: number, timeSpent: number, additionalData?: any) => void
  onExit: () => void
}

interface GameState {
  score: number
  timeRemaining: number
  level: number
  lives: number
  money: number
  status: 'playing' | 'paused' | 'completed' | 'failed'
  currentChallenge?: string
  powerUps: string[]
}

// Lemonade Stand Game Logic
function LemonadeBossGame({ 
  gameState, 
  setGameState, 
  learningStyle, 
  kinestheticEnabled, 
  focusLevel 
}: {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  learningStyle: LearningStyle | null
  kinestheticEnabled: boolean
  focusLevel: number
}) {
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rainy'>('sunny')
  const [lemonadeCost, setLemonadeCost] = useState(0.25)
  const [sellingPrice, setSellingPrice] = useState(1.00)
  const [inventory, setInventory] = useState(20)
  const [customerDemand, setCustomerDemand] = useState(15)

  useEffect(() => {
    // BCI influence: focused mind keeps weather stable
    if (focusLevel > 0.7) {
      // High focus prevents bad weather
      if (weather === 'rainy') setWeather('cloudy')
    } else if (focusLevel < 0.3) {
      // Low focus can trigger storms
      if (Math.random() < 0.1) setWeather('rainy')
    }
  }, [focusLevel, weather])

  const calculateProfit = () => {
    const unitsSold = Math.min(inventory, customerDemand * weatherMultiplier())
    const revenue = unitsSold * sellingPrice
    const cost = unitsSold * lemonadeCost
    return revenue - cost
  }

  const weatherMultiplier = () => {
    switch (weather) {
      case 'sunny': return 1.2
      case 'cloudy': return 1.0
      case 'rainy': return 0.5
      default: return 1.0
    }
  }

  const sellLemonade = () => {
    const profit = calculateProfit()
    const newMoney = gameState.money + profit
    const newScore = gameState.score + Math.max(0, profit * 10)
    
    setGameState(prevState => ({
      ...prevState,
      money: newMoney,
      score: newScore,
      level: Math.floor(newScore / 500) + 1
    }))

    // Simulate market changes
    setCustomerDemand(Math.max(5, customerDemand + Math.floor(Math.random() * 10 - 5)))
    setWeather(['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)] as any)
  }

  return (
    <div className="h-full bg-gradient-to-b from-yellow-100 to-yellow-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-800 mb-2">🍋 Lemonade Boss</h2>
          <p className="text-yellow-700">Master unit costs, pricing, and profit margins!</p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">${gameState.money.toFixed(2)}</div>
            <div className="text-sm text-slate-600">Money</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
            <div className="text-sm text-slate-600">Score</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl">{weather === 'sunny' ? '☀️' : weather === 'cloudy' ? '☁️' : '🌧️'}</div>
            <div className="text-sm text-slate-600 capitalize">{weather}</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{customerDemand}</div>
            <div className="text-sm text-slate-600">Demand</div>
          </div>
        </div>

        {/* Business Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Production</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cost per Cup</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.10"
                    max="0.50"
                    step="0.05"
                    value={lemonadeCost}
                    onChange={(e) => setLemonadeCost(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-bold">${lemonadeCost.toFixed(2)}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Inventory</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={inventory}
                    onChange={(e) => setInventory(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-bold">{inventory} cups</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Sales</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Selling Price</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.50"
                    max="3.00"
                    step="0.25"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-bold">${sellingPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600 mb-2">Projected Profit</div>
                <div className="text-2xl font-bold text-green-600">
                  ${calculateProfit().toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Margin: {((sellingPrice - lemonadeCost) / sellingPrice * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button 
            onClick={sellLemonade}
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 text-lg"
          >
            <Coins className="w-5 h-5 mr-2" />
            Sell Lemonade Day!
          </Button>
        </div>

        {/* Learning Insights */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-bold mb-2">💡 Learning Insights</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <div>• Unit Cost: ${lemonadeCost.toFixed(2)} per cup</div>
            <div>• Selling Price: ${sellingPrice.toFixed(2)} per cup</div>
            <div>• Profit Margin: {((sellingPrice - lemonadeCost) / sellingPrice * 100).toFixed(1)}%</div>
            <div>• Weather Impact: {weatherMultiplier()}x demand multiplier</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple pixel-art style budget runner
function PixelBudgetRunner({ 
  gameState, 
  setGameState, 
  learningStyle, 
  kinestheticEnabled 
}: {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  learningStyle: LearningStyle | null
  kinestheticEnabled: boolean
}) {
  const [position, setPosition] = useState(2) // 0-4 lanes
  const [obstacles, setObstacles] = useState<Array<{x: number, lane: number, type: 'debt' | 'expense', id: string}>>([])
  const [collectibles, setCollectibles] = useState<Array<{x: number, lane: number, type: 'coin' | 'budget', id: string}>>([])

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameState.status !== 'playing') return

      // Move obstacles and collectibles
      setObstacles(prev => prev.map(obs => ({ ...obs, x: obs.x - 5 })).filter(obs => obs.x > -50))
      setCollectibles(prev => prev.map(col => ({ ...col, x: col.x - 5 })).filter(col => col.x > -50))

      // Check collisions for obstacles
      setObstacles(prev => {
        const collisions = prev.filter(obs => 
          obs.lane === position && obs.x > 70 && obs.x < 130
        )
        
        if (collisions.length > 0) {
          // Hit an obstacle - lose money and points
          setGameState(current => ({
            ...current,
            money: Math.max(0, current.money - 25),
            score: Math.max(0, current.score - 50),
            lives: current.lives - 1,
            status: current.lives <= 1 ? 'failed' as const : current.status
          }))
          
          // Remove hit obstacles
          return prev.filter(obs => !collisions.includes(obs))
        }
        return prev
      })

      // Check collisions for collectibles
      setCollectibles(prev => {
        const collections = prev.filter(col => 
          col.lane === position && col.x > 70 && col.x < 130
        )
        
        if (collections.length > 0) {
          // Collected item - gain money and points
          collections.forEach(col => {
            const moneyGain = col.type === 'coin' ? 10 : 25
            const scoreGain = col.type === 'coin' ? 20 : 50
            
            setGameState(current => ({
              ...current,
              money: current.money + moneyGain,
              score: current.score + scoreGain,
              level: Math.floor((current.score + scoreGain) / 200) + 1
            }))
          })
          
          // Remove collected items
          return prev.filter(col => !collections.includes(col))
        }
        return prev
      })

      // Spawn new obstacles
      if (Math.random() < 0.02) {
        setObstacles(prev => [...prev, {
          x: 800,
          lane: Math.floor(Math.random() * 5),
          type: Math.random() < 0.7 ? 'expense' : 'debt',
          id: `obs-${Date.now()}-${Math.random()}`
        }])
      }

      // Spawn collectibles
      if (Math.random() < 0.015) {
        setCollectibles(prev => [...prev, {
          x: 800,
          lane: Math.floor(Math.random() * 5),
          type: Math.random() < 0.8 ? 'coin' : 'budget',
          id: `col-${Date.now()}-${Math.random()}`
        }])
      }
    }, 50)

    return () => clearInterval(gameLoop)
  }, [gameState.status, position, setGameState])

  const movePlayer = (direction: 'up' | 'down') => {
    setPosition(prev => {
      if (direction === 'up') return Math.max(0, prev - 1)
      if (direction === 'down') return Math.min(4, prev + 1)
      return prev
    })
  }

  // Add keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.status !== 'playing') return
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault()
          movePlayer('up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault()
          movePlayer('down')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.status])

  return (
    <div className="h-full bg-gradient-to-r from-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-repeat-x bg-bottom" 
           style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'20\' viewBox=\'0 0 100 20\'%3E%3Cpath d=\'M0 20h100\' stroke=\'%23fff\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3C/svg%3E")'}} />
      
      {/* Game UI */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex gap-4 text-white">
          <div>Score: {gameState.score}</div>
          <div>Money: ${gameState.money}</div>
          <div>Lives: {gameState.lives}</div>
          <div>Level: {gameState.level}</div>
        </div>
      </div>

      {/* Player */}
      <div 
        className="absolute left-20 w-12 h-12 bg-green-400 rounded transition-all duration-150 flex items-center justify-center text-2xl z-20"
        style={{ top: `${20 + position * 80}px` }}
      >
        🏃
      </div>

      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <div
          key={obstacle.id}
          className={`absolute w-16 h-16 rounded flex items-center justify-center text-2xl ${
            obstacle.type === 'debt' ? 'bg-red-500' : 'bg-orange-500'
          }`}
          style={{
            left: `${obstacle.x}px`,
            top: `${20 + obstacle.lane * 80}px`
          }}
        >
          {obstacle.type === 'debt' ? '💳' : '💸'}
        </div>
      ))}

      {/* Collectibles */}
      {collectibles.map((collectible) => (
        <div
          key={collectible.id}
          className="absolute w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xl"
          style={{
            left: `${collectible.x}px`,
            top: `${24 + collectible.lane * 80}px`
          }}
        >
          {collectible.type === 'coin' ? '🪙' : '📊'}
        </div>
      ))}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 space-y-2">
        <div className="text-white text-xs text-center mb-2">
          Use ↑↓ or W/S keys
        </div>
        <Button onClick={() => movePlayer('up')} variant="outline" size="sm">
          ⬆️
        </Button>
        <Button onClick={() => movePlayer('down')} variant="outline" size="sm">
          ⬇️
        </Button>
      </div>

      {/* Lane Labels */}
      <div className="absolute right-20 top-20 space-y-12 text-white text-sm">
        <div>Housing</div>
        <div>Food</div>
        <div>Transport</div>
        <div>Entertainment</div>
        <div>Savings</div>
      </div>
    </div>
  )
}

// Market Tycoon - Investment game
function MarketTycoon({ 
  gameState, 
  setGameState, 
  learningStyle, 
  kinestheticEnabled 
}: {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  learningStyle: LearningStyle | null
  kinestheticEnabled: boolean
}) {
  const [portfolio, setPortfolio] = useState({
    stocks: 0,
    bonds: 0,
    crypto: 0,
    savings: gameState.money
  })
  const [marketPrices, setMarketPrices] = useState({
    stocks: 100,
    bonds: 50,
    crypto: 200
  })
  const [marketTrend, setMarketTrend] = useState<'bull' | 'bear' | 'stable'>('stable')

  useEffect(() => {
    const marketLoop = setInterval(() => {
      if (gameState.status !== 'playing') return

      // Simulate market movements
      setMarketPrices(prev => {
        const volatility = { stocks: 0.05, bonds: 0.02, crypto: 0.15 }
        const trend = marketTrend === 'bull' ? 1.02 : marketTrend === 'bear' ? 0.98 : 1.0
        
        return {
          stocks: Math.max(20, prev.stocks * (trend + (Math.random() - 0.5) * volatility.stocks)),
          bonds: Math.max(10, prev.bonds * (trend + (Math.random() - 0.5) * volatility.bonds)), 
          crypto: Math.max(50, prev.crypto * (trend + (Math.random() - 0.5) * volatility.crypto))
        }
      })

      // Random market events
      if (Math.random() < 0.05) {
        const trends: Array<'bull' | 'bear' | 'stable'> = ['bull', 'bear', 'stable']
        setMarketTrend(trends[Math.floor(Math.random() * trends.length)])
      }

      // Calculate portfolio value and update score
      const totalValue = 
        portfolio.stocks * marketPrices.stocks +
        portfolio.bonds * marketPrices.bonds +
        portfolio.crypto * marketPrices.crypto +
        portfolio.savings

      setGameState(prev => ({
        ...prev,
        money: totalValue,
        score: Math.floor(totalValue - 100), // Starting money was 100
        level: Math.floor((totalValue - 100) / 200) + 1
      }))
    }, 2000)

    return () => clearInterval(marketLoop)
  }, [gameState.status, portfolio, marketPrices, marketTrend, setGameState])

  const buyAsset = (asset: 'stocks' | 'bonds' | 'crypto', amount: number) => {
    const cost = marketPrices[asset] * amount
    if (portfolio.savings >= cost) {
      setPortfolio(prev => ({
        ...prev,
        [asset]: prev[asset] + amount,
        savings: prev.savings - cost
      }))
    }
  }

  const sellAsset = (asset: 'stocks' | 'bonds' | 'crypto', amount: number) => {
    if (portfolio[asset] >= amount) {
      const value = marketPrices[asset] * amount
      setPortfolio(prev => ({
        ...prev,
        [asset]: prev[asset] - amount,
        savings: prev.savings + value
      }))
    }
  }

  return (
    <div className="h-full bg-gradient-to-b from-green-100 to-green-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-800 mb-2">📈 8-Bit Market Tycoon</h2>
          <p className="text-green-700">Build a diversified portfolio and beat the market!</p>
          <div className="mt-2">
            <Badge className={`${marketTrend === 'bull' ? 'bg-green-500' : marketTrend === 'bear' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
              Market: {marketTrend.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{portfolio.stocks}</div>
            <div className="text-sm text-slate-600">Stocks</div>
            <div className="text-xs text-slate-500">${marketPrices.stocks.toFixed(2)} each</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{portfolio.bonds}</div>
            <div className="text-sm text-slate-600">Bonds</div>
            <div className="text-xs text-slate-500">${marketPrices.bonds.toFixed(2)} each</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{portfolio.crypto}</div>
            <div className="text-sm text-slate-600">Crypto</div>
            <div className="text-xs text-slate-500">${marketPrices.crypto.toFixed(2)} each</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">${portfolio.savings.toFixed(2)}</div>
            <div className="text-sm text-slate-600">Cash</div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Stocks */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-blue-600">📊 Stocks</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">${marketPrices.stocks.toFixed(2)}</div>
                <div className="text-sm text-slate-600">per share</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => buyAsset('stocks', 1)} size="sm" className="flex-1">
                  Buy 1
                </Button>
                <Button onClick={() => sellAsset('stocks', 1)} variant="outline" size="sm" className="flex-1">
                  Sell 1
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                Medium risk, moderate growth potential
              </div>
            </div>
          </div>

          {/* Bonds */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-purple-600">🏛️ Bonds</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">${marketPrices.bonds.toFixed(2)}</div>
                <div className="text-sm text-slate-600">per bond</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => buyAsset('bonds', 1)} size="sm" className="flex-1">
                  Buy 1
                </Button>
                <Button onClick={() => sellAsset('bonds', 1)} variant="outline" size="sm" className="flex-1">
                  Sell 1
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                Low risk, stable returns
              </div>
            </div>
          </div>

          {/* Crypto */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-orange-600">₿ Crypto</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">${marketPrices.crypto.toFixed(2)}</div>
                <div className="text-sm text-slate-600">per coin</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => buyAsset('crypto', 1)} size="sm" className="flex-1">
                  Buy 1
                </Button>
                <Button onClick={() => sellAsset('crypto', 1)} variant="outline" size="sm" className="flex-1">
                  Sell 1
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                High risk, high reward potential
              </div>
            </div>
          </div>
        </div>

        {/* Learning Insights */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-bold mb-2">💡 Investment Insights</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <div>• Diversification reduces risk across asset classes</div>
            <div>• Market timing is difficult - focus on long-term strategy</div>
            <div>• Higher risk typically means higher potential returns</div>
            <div>• Keep some cash for opportunities during market downturns</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Debt Dash - Debt management runner game
function DebtDash({ 
  gameState, 
  setGameState, 
  learningStyle, 
  kinestheticEnabled 
}: {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  learningStyle: LearningStyle | null
  kinestheticEnabled: boolean
}) {
  const [position, setPosition] = useState(2)
  const [debts, setDebts] = useState([
    { id: 'cc1', name: 'Credit Card', balance: 2500, rate: 0.18, minPayment: 50 },
    { id: 'loan', name: 'Personal Loan', balance: 8000, rate: 0.12, minPayment: 150 },
    { id: 'cc2', name: 'Store Card', balance: 1200, rate: 0.24, minPayment: 30 }
  ])
  const [obstacles, setObstacles] = useState<Array<{x: number, lane: number, type: 'interest' | 'fee', id: string, damage: number}>>([])
  const [paymentPowers, setPaymentPowers] = useState<Array<{x: number, lane: number, type: 'payment' | 'bonus', id: string, amount: number}>>([])

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameState.status !== 'playing') return

      // Move obstacles and power-ups
      setObstacles(prev => prev.map(obs => ({ ...obs, x: obs.x - 6 })).filter(obs => obs.x > -50))
      setPaymentPowers(prev => prev.map(pow => ({ ...pow, x: pow.x - 6 })).filter(pow => pow.x > -50))

      // Check collisions with obstacles
      setObstacles(prev => {
        const hits = prev.filter(obs => obs.lane === position && obs.x > 70 && obs.x < 130)
        
        if (hits.length > 0) {
          hits.forEach(hit => {
            // Add interest or fees to random debt
            const randomDebt = Math.floor(Math.random() * debts.length)
            setDebts(prevDebts => 
              prevDebts.map((debt, idx) => 
                idx === randomDebt 
                  ? { ...debt, balance: debt.balance + hit.damage }
                  : debt
              )
            )
          })
          
          setGameState(prev => ({
            ...prev,
            score: Math.max(0, prev.score - 25),
            lives: prev.lives - 1,
            status: prev.lives <= 1 ? 'failed' as const : prev.status
          }))
          
          return prev.filter(obs => !hits.includes(obs))
        }
        return prev
      })

      // Check collisions with payment power-ups
      setPaymentPowers(prev => {
        const collected = prev.filter(pow => pow.lane === position && pow.x > 70 && pow.x < 130)
        
        if (collected.length > 0) {
          collected.forEach(power => {
            // Apply payment to highest interest debt (avalanche method)
            const highestRateDebt = debts.reduce((max, debt) => 
              debt.rate > max.rate ? debt : max
            )
            
            setDebts(prevDebts => 
              prevDebts.map(debt => 
                debt.id === highestRateDebt.id
                  ? { ...debt, balance: Math.max(0, debt.balance - power.amount) }
                  : debt
              )
            )
          })
          
          setGameState(prev => ({
            ...prev,
            score: prev.score + 50,
            money: prev.money + 10
          }))
          
          return prev.filter(pow => !collected.includes(pow))
        }
        return prev
      })

      // Spawn obstacles
      if (Math.random() < 0.025) {
        setObstacles(prev => [...prev, {
          x: 800,
          lane: Math.floor(Math.random() * 5),
          type: Math.random() < 0.6 ? 'interest' : 'fee',
          id: `obs-${Date.now()}-${Math.random()}`,
          damage: Math.floor(Math.random() * 100) + 50
        }])
      }

      // Spawn payment power-ups
      if (Math.random() < 0.018) {
        setPaymentPowers(prev => [...prev, {
          x: 800,
          lane: Math.floor(Math.random() * 5),
          type: Math.random() < 0.8 ? 'payment' : 'bonus',
          id: `pow-${Date.now()}-${Math.random()}`,
          amount: Math.floor(Math.random() * 200) + 100
        }])
      }

      // Update score based on debt reduction
      const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0)
      const debtReduction = Math.max(0, 11700 - totalDebt) // Started with $11,700 total debt
      setGameState(prev => ({
        ...prev,
        score: Math.floor(debtReduction / 10)
      }))

    }, 50)

    return () => clearInterval(gameLoop)
  }, [gameState.status, position, debts, setGameState])

  const movePlayer = (direction: 'up' | 'down') => {
    setPosition(prev => {
      if (direction === 'up') return Math.max(0, prev - 1)
      if (direction === 'down') return Math.min(4, prev + 1)
      return prev
    })
  }

  // Add keyboard controls for debt dash
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.status !== 'playing') return
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault()
          movePlayer('up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault()
          movePlayer('down')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.status])

  const totalDebtRemaining = debts.reduce((sum, debt) => sum + debt.balance, 0)

  return (
    <div className="h-full bg-gradient-to-r from-red-900 to-orange-900 relative overflow-hidden">
      {/* Game UI */}
      <div className="absolute top-4 left-4 z-10 text-white">
        <div className="space-y-2">
          <div className="flex gap-4">
            <div>Score: {gameState.score}</div>
            <div>Lives: {gameState.lives}</div>
            <div>Total Debt: ${totalDebtRemaining.toFixed(0)}</div>
          </div>
          <div className="text-sm space-y-1">
            {debts.map(debt => (
              <div key={debt.id} className="flex justify-between min-w-[300px]">
                <span>{debt.name}:</span>
                <span>${debt.balance.toFixed(0)} @ {(debt.rate * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player */}
      <div 
        className="absolute left-20 w-12 h-12 bg-blue-400 rounded transition-all duration-150 flex items-center justify-center text-2xl z-20"
        style={{ top: `${20 + position * 80}px` }}
      >
        🏃‍♂️
      </div>

      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <div
          key={obstacle.id}
          className={`absolute w-16 h-16 rounded flex items-center justify-center text-2xl ${
            obstacle.type === 'interest' ? 'bg-red-600' : 'bg-orange-600'
          }`}
          style={{
            left: `${obstacle.x}px`,
            top: `${20 + obstacle.lane * 80}px`
          }}
        >
          {obstacle.type === 'interest' ? '📈' : '💸'}
        </div>
      ))}

      {/* Payment Power-ups */}
      {paymentPowers.map((power) => (
        <div
          key={power.id}
          className="absolute w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-xl"
          style={{
            left: `${power.x}px`,
            top: `${24 + power.lane * 80}px`
          }}
        >
          💰
        </div>
      ))}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 space-y-2">
        <div className="text-white text-xs text-center mb-2">
          Use ↑↓ or W/S keys
        </div>
        <Button onClick={() => movePlayer('up')} variant="outline" size="sm">
          ⬆️
        </Button>
        <Button onClick={() => movePlayer('down')} variant="outline" size="sm">
          ⬇️
        </Button>
      </div>

      {/* Strategy Labels */}
      <div className="absolute right-20 top-20 space-y-12 text-white text-sm">
        <div>Avalanche</div>
        <div>Snowball</div>
        <div>Minimum</div>
        <div>Extra Payment</div>
        <div>Negotiation</div>
      </div>

      {/* Progress */}
      <div className="absolute bottom-4 left-4 text-white">
        <div className="text-sm">Debt Freedom Progress:</div>
        <Progress value={((11700 - totalDebtRemaining) / 11700) * 100} className="w-64 h-2 mt-1" />
      </div>
    </div>
  )
}

export function RetroGameEngine({ 
  game, 
  learningStyle, 
  kinestheticEnabled, 
  bciEnabled, 
  onComplete, 
  onExit 
}: RetroGameEngineProps) {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeRemaining: 180, // 3 minutes
    level: 1,
    lives: 3,
    money: 100,
    status: 'paused', // Start paused to show instructions
    powerUps: []
  })

  const [startTime] = useState(Date.now())
  const [focusLevel, setFocusLevel] = useState(0.5)
  const [showInstructions, setShowInstructions] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Game timer and win condition checks
  useEffect(() => {
    if (gameState.status === 'playing') {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timeRemaining - 1
          
          // Check win conditions based on game type
          let shouldComplete = false
          
          if (newTime <= 0) {
            shouldComplete = true
          } else {
            // Game-specific win conditions
            switch (game.gameType) {
              case 'lemonade-boss':
                if (prev.money >= 500) shouldComplete = true // Win if you earn $500
                break
              case 'pixel-budget-runner':
                if (prev.score >= 1000) shouldComplete = true // Win if you score 1000 points
                break
              case 'market-tycoon':
                if (prev.money >= 1000) shouldComplete = true // Win if portfolio reaches $1000
                break
              case 'debt-dash':
                if (prev.score >= 500) shouldComplete = true // Win if you pay off enough debt
                break
            }
          }
          
          if (shouldComplete) {
            return { ...prev, timeRemaining: Math.max(0, newTime), status: 'completed' }
          }
          return { ...prev, timeRemaining: newTime }
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState.status, game.gameType])

  // Game completion - just track status, don't auto-complete
  useEffect(() => {
    // Completion is now handled by the overlay button click
    // This effect just tracks the status change for potential future use
  }, [gameState.status, gameState.score, gameState.money, gameState.level, gameState.lives, startTime, onComplete])

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, status: prev.status === 'playing' ? 'paused' : 'playing' }))
  }

  const startGame = () => {
    setShowInstructions(false)
    setGameState(prev => ({ ...prev, status: 'playing' }))
  }

  const resetGame = () => {
    setGameState({
      score: 0,
      timeRemaining: 180,
      level: 1,
      lives: 3,
      money: 100,
      status: 'playing',
      powerUps: []
    })
    setShowInstructions(false)
  }

  const renderGame = () => {
    switch (game.gameType) {
      case 'lemonade-boss':
        return (
          <LemonadeBossGame
            gameState={gameState}
            setGameState={setGameState}
            learningStyle={learningStyle}
            kinestheticEnabled={kinestheticEnabled}
            focusLevel={focusLevel}
          />
        )
      case 'pixel-budget-runner':
        return (
          <PixelBudgetRunner
            gameState={gameState}
            setGameState={setGameState}
            learningStyle={learningStyle}
            kinestheticEnabled={kinestheticEnabled}
          />
        )
      case 'market-tycoon':
        return (
          <MarketTycoon
            gameState={gameState}
            setGameState={setGameState}
            learningStyle={learningStyle}
            kinestheticEnabled={kinestheticEnabled}
          />
        )
      case 'debt-dash':
        return (
          <DebtDash
            gameState={gameState}
            setGameState={setGameState}
            learningStyle={learningStyle}
            kinestheticEnabled={kinestheticEnabled}
          />
        )
      default:
        return (
          <div className="h-full flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Game Coming Soon!</h3>
              <p className="text-slate-600 mb-4">{game.title} is under development.</p>
              <Button onClick={() => onComplete(100, 5000)}>
                Complete Demo
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Game Header */}
      <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onExit} className="text-white hover:bg-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div>
            <h1 className="text-lg font-bold">{game.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                {gameState.score}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.floor(gameState.timeRemaining / 60)}:{(gameState.timeRemaining % 60).toString().padStart(2, '0')}
              </div>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4" />
                ${gameState.money}
              </div>
              {/* Win Goal Progress */}
              <div className="flex items-center gap-1 text-yellow-300">
                <Target className="w-4 h-4" />
                {game.gameType === 'lemonade-boss' && `$${gameState.money}/500`}
                {game.gameType === 'pixel-budget-runner' && `${gameState.score}/1000`}
                {game.gameType === 'market-tycoon' && `$${gameState.money}/1000`}
                {game.gameType === 'debt-dash' && `${gameState.score}/500`}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {kinestheticEnabled && (
            <Badge variant="outline" className="text-xs">
              Motion On
            </Badge>
          )}
          {bciEnabled && (
            <Badge variant="outline" className="text-xs">
              BCI Active
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={pauseGame}>
            {gameState.status === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowInstructions(true)}>
            ?
          </Button>
          <Button variant="outline" size="sm" onClick={resetGame}>
            <ArrowCounterClockwise className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 relative">
        {/* Instructions Overlay */}
        {(gameState.status === 'completed' || gameState.status === 'failed') && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="max-w-md bg-white rounded-lg p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">
                {gameState.status === 'completed' ? '🎉' : '💥'}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {gameState.status === 'completed' ? 'Congratulations!' : 'Game Over'}
              </h2>
              <p className="text-slate-600 mb-6">
                {gameState.status === 'completed' 
                  ? 'You successfully completed the challenge!' 
                  : 'Don\'t worry, try again to improve your score!'}
              </p>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Final Score:</span>
                  <span className="font-bold text-green-600">{gameState.score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Money Earned:</span>
                  <span className="font-bold text-blue-600">${gameState.money}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Level Reached:</span>
                  <span className="font-bold text-purple-600">{gameState.level}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button onClick={() => {
                  const timeSpent = Date.now() - startTime
                  onComplete(gameState.score, timeSpent, {
                    finalMoney: gameState.money,
                    level: gameState.level,
                    lives: gameState.lives
                  })
                }} size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <Trophy className="w-5 h-5 mr-2" />
                  Continue to Progress
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetGame} className="flex-1">
                    <ArrowCounterClockwise className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                  <Button variant="outline" onClick={onExit} className="flex-1">
                    Back to Menu
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showInstructions && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="max-w-md bg-white rounded-lg p-8 text-center shadow-2xl">
              <div className="text-6xl mb-4">{game.gameType === 'lemonade-boss' ? '🍋' : game.gameType === 'pixel-budget-runner' ? '🏃' : game.gameType === 'market-tycoon' ? '📈' : '💳'}</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">{game.title}</h2>
              <p className="text-slate-600 mb-6">{game.description}</p>
              
              <div className="text-left space-y-3 mb-6">
                <h3 className="font-bold text-slate-800">How to Play:</h3>
                {game.gameType === 'pixel-budget-runner' ? (
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• Use <strong>Arrow Keys</strong> or <strong>W/S</strong> to move up/down</p>
                    <p>• <strong>Collect coins</strong> and <strong>budget items</strong> for points</p>
                    <p>• <strong>Avoid obstacles</strong> to keep your lives</p>
                    <p><strong>🎯 Win Goal:</strong> Score 1,000 points or survive 3 minutes!</p>
                  </div>
                ) : game.gameType === 'debt-dash' ? (
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• Use <strong>Arrow Keys</strong> or <strong>W/S</strong> to move up/down</p>
                    <p>• <strong>Collect payment power-ups</strong> to reduce debt</p>
                    <p>• <strong>Avoid interest charges</strong> and fees</p>
                    <p><strong>🎯 Win Goal:</strong> Score 500 points by managing debt!</p>
                  </div>
                ) : game.gameType === 'lemonade-boss' ? (
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• <strong>Set prices</strong> for your lemonade</p>
                    <p>• <strong>Manage inventory</strong> and costs</p>
                    <p>• <strong>Adapt to weather</strong> changes</p>
                    <p><strong>🎯 Win Goal:</strong> Earn $500 in profits!</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• <strong>Buy and sell</strong> investments</p>
                    <p>• <strong>Watch market trends</strong></p>
                    <p>• <strong>Diversify portfolio</strong> to reduce risk</p>
                    <p><strong>🎯 Win Goal:</strong> Build a $1,000 portfolio!</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Button onClick={startGame} size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <Play className="w-5 h-5 mr-2" />
                  Start Playing!
                </Button>
                <Button variant="outline" onClick={onExit} className="w-full">
                  Back to Game Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {gameState.status === 'paused' && !showInstructions && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Game Paused</h2>
              <Button onClick={pauseGame} size="lg">
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            </div>
          </div>
        )}
        
        {renderGame()}
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800 p-2">
        <Progress 
          value={(180 - gameState.timeRemaining) / 180 * 100} 
          className="h-2" 
        />
      </div>
    </div>
  )
}