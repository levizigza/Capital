import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TrendUp, TrendDown, Play, Coins, ChartLine, ShoppingCart, Tag } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface StockMarketGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface Stock {
  id: string
  name: string
  emoji: string
  price: number
  previousPrice: number
  owned: number
  volatility: number
  trend: 'up' | 'down' | 'stable'
}

interface NewsEvent {
  id: string
  headline: string
  impact: { stockId: string; multiplier: number }[]
  emoji: string
}

const INITIAL_STOCKS: Stock[] = [
  { id: 'tech', name: 'TechCorp', emoji: '💻', price: 100, previousPrice: 100, owned: 0, volatility: 0.15, trend: 'stable' },
  { id: 'food', name: 'FoodMart', emoji: '🍔', price: 50, previousPrice: 50, owned: 0, volatility: 0.08, trend: 'stable' },
  { id: 'energy', name: 'GreenPower', emoji: '⚡', price: 75, previousPrice: 75, owned: 0, volatility: 0.12, trend: 'stable' },
  { id: 'games', name: 'GameZone', emoji: '🎮', price: 120, previousPrice: 120, owned: 0, volatility: 0.2, trend: 'stable' },
  { id: 'pets', name: 'PetPals', emoji: '🐕', price: 40, previousPrice: 40, owned: 0, volatility: 0.1, trend: 'stable' },
]

const NEWS_EVENTS: NewsEvent[] = [
  { id: 'n1', headline: 'New smartphone released!', emoji: '📱', impact: [{ stockId: 'tech', multiplier: 1.15 }] },
  { id: 'n2', headline: 'Fast food sales boom!', emoji: '🍟', impact: [{ stockId: 'food', multiplier: 1.12 }] },
  { id: 'n3', headline: 'Solar energy breakthrough!', emoji: '☀️', impact: [{ stockId: 'energy', multiplier: 1.2 }] },
  { id: 'n4', headline: 'Popular game launches!', emoji: '🎯', impact: [{ stockId: 'games', multiplier: 1.25 }] },
  { id: 'n5', headline: 'Pet adoption rises!', emoji: '🐾', impact: [{ stockId: 'pets', multiplier: 1.18 }] },
  { id: 'n6', headline: 'Tech company faces issues', emoji: '⚠️', impact: [{ stockId: 'tech', multiplier: 0.85 }] },
  { id: 'n7', headline: 'Health concerns about fast food', emoji: '🥗', impact: [{ stockId: 'food', multiplier: 0.88 }] },
  { id: 'n8', headline: 'Energy prices drop', emoji: '📉', impact: [{ stockId: 'energy', multiplier: 0.9 }] },
  { id: 'n9', headline: 'Gaming industry slowdown', emoji: '😴', impact: [{ stockId: 'games', multiplier: 0.82 }] },
  { id: 'n10', headline: 'Market rally! Everything up!', emoji: '🚀', impact: INITIAL_STOCKS.map(s => ({ stockId: s.id, multiplier: 1.1 })) },
  { id: 'n11', headline: 'Market correction', emoji: '📊', impact: INITIAL_STOCKS.map(s => ({ stockId: s.id, multiplier: 0.95 })) },
]

export function StockMarketGame({ onComplete, onExit, userTier = 'middle' }: StockMarketGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [cash, setCash] = useState(1000)
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS)
  const [day, setDay] = useState(1)
  const [maxDays] = useState(30)
  const [currentNews, setCurrentNews] = useState<NewsEvent | null>(null)
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({})
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [buyAmount, setBuyAmount] = useState(1)

  // Calculate portfolio value
  const portfolioValue = stocks.reduce((sum, stock) => sum + stock.price * stock.owned, 0)
  const totalValue = cash + portfolioValue
  const initialValue = 1000
  const profit = totalValue - initialValue
  const profitPercent = ((totalValue - initialValue) / initialValue) * 100

  // Initialize price history
  useEffect(() => {
    const history: Record<string, number[]> = {}
    stocks.forEach(stock => {
      history[stock.id] = [stock.price]
    })
    setPriceHistory(history)
  }, [])

  // Simulate market day
  const simulateDay = useCallback(() => {
    // Random news event (30% chance)
    let newsEvent: NewsEvent | null = null
    if (Math.random() < 0.3) {
      newsEvent = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)]
      setCurrentNews(newsEvent)
      toast.info(`📰 ${newsEvent.headline}`, { duration: 3000 })
    } else {
      setCurrentNews(null)
    }

    // Update stock prices
    setStocks(prevStocks => {
      return prevStocks.map(stock => {
        let newPrice = stock.price
        const previousPrice = stock.price

        // Apply news impact
        if (newsEvent) {
          const impact = newsEvent.impact.find(i => i.stockId === stock.id)
          if (impact) {
            newPrice *= impact.multiplier
          }
        }

        // Random market movement
        const change = (Math.random() - 0.5) * 2 * stock.volatility
        newPrice *= (1 + change)

        // Ensure minimum price
        newPrice = Math.max(5, Math.round(newPrice * 100) / 100)

        // Determine trend
        const trend: 'up' | 'down' | 'stable' = 
          newPrice > previousPrice * 1.02 ? 'up' : 
          newPrice < previousPrice * 0.98 ? 'down' : 'stable'

        return {
          ...stock,
          price: newPrice,
          previousPrice,
          trend
        }
      })
    })

    // Update price history
    setPriceHistory(prev => {
      const newHistory = { ...prev }
      stocks.forEach(stock => {
        if (!newHistory[stock.id]) newHistory[stock.id] = []
        newHistory[stock.id] = [...newHistory[stock.id], stock.price].slice(-10)
      })
      return newHistory
    })

    // Advance day
    setDay(prev => {
      if (prev >= maxDays) {
        setGameState('ended')
        return prev
      }
      return prev + 1
    })
  }, [stocks, maxDays])

  const buyStock = (stock: Stock, amount: number) => {
    const totalCost = stock.price * amount
    if (totalCost > cash) {
      toast.error('Not enough cash!')
      return
    }

    setCash(prev => prev - totalCost)
    setStocks(prev => prev.map(s => 
      s.id === stock.id ? { ...s, owned: s.owned + amount } : s
    ))
    toast.success(`Bought ${amount} ${stock.name} for $${totalCost.toFixed(2)}`)
  }

  const sellStock = (stock: Stock, amount: number) => {
    if (amount > stock.owned) {
      toast.error('Not enough shares!')
      return
    }

    const totalValue = stock.price * amount
    setCash(prev => prev + totalValue)
    setStocks(prev => prev.map(s => 
      s.id === stock.id ? { ...s, owned: s.owned - amount } : s
    ))
    toast.success(`Sold ${amount} ${stock.name} for $${totalValue.toFixed(2)}`)
  }

  const startGame = () => {
    setCash(1000)
    setStocks(INITIAL_STOCKS.map(s => ({ ...s, price: s.price, previousPrice: s.price, owned: 0 })))
    setDay(1)
    setCurrentNews(null)
    setGameState('playing')
  }

  const finishGame = () => {
    // Sell all stocks
    const finalValue = cash + stocks.reduce((sum, s) => sum + s.price * s.owned, 0)
    onComplete(Math.floor(finalValue), {
      finalCash: cash,
      portfolioValue,
      totalValue: finalValue,
      profit: finalValue - 1000,
      profitPercent: ((finalValue - 1000) / 1000) * 100,
      daysPlayed: day
    })
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-7xl mb-4"
            >
              📈
            </motion.div>
            <h2 className="text-3xl font-bold text-indigo-800 mb-4">Stock Market Simulator</h2>
            <p className="text-gray-600 mb-6">
              Start with $1,000 and try to grow your wealth over 30 days! Buy low, sell high, and watch out for news events!
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-sm font-semibold">Starting Cash: $1,000</div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-sm font-semibold">30 Trading Days</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={onExit} className="flex-1">
                <ArrowLeft className="mr-2" /> Exit
              </Button>
              <Button onClick={startGame} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                <Play className="mr-2" /> Start Trading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-white/95">
          <CardContent className="p-8 text-center">
            <div className="text-7xl mb-4">
              {profit >= 0 ? '🎉' : '📉'}
            </div>
            <h2 className="text-3xl font-bold text-indigo-800 mb-2">Trading Complete!</h2>
            <p className={`text-2xl font-bold mb-4 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profit >= 0 ? '+' : ''}{profitPercent.toFixed(1)}% Return
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Final Value</div>
                <div className="text-2xl font-bold text-blue-700">${totalValue.toFixed(2)}</div>
              </div>
              <div className={`p-4 rounded-lg ${profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="text-sm text-gray-600">Profit/Loss</div>
                <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-2">What You Learned:</h3>
              <ul className="text-sm text-left text-gray-600 space-y-1">
                <li>• Buy low, sell high is the key to profits</li>
                <li>• News events can impact stock prices</li>
                <li>• Diversification reduces risk</li>
                <li>• Patience is important in investing</li>
              </ul>
            </div>
            <Button onClick={finishGame} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
      {/* HUD */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white/90">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-gray-600">Day</div>
              <div className="text-2xl font-bold text-blue-600">{day}/{maxDays}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-gray-600">Cash</div>
              <div className="text-2xl font-bold text-green-600">${cash.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-gray-600">Portfolio</div>
              <div className="text-2xl font-bold text-purple-600">${portfolioValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90">
            <CardContent className="p-3 text-center">
              <div className="text-sm text-gray-600">Total</div>
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* News Banner */}
      <AnimatePresence>
        {currentNews && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="max-w-6xl mx-auto mb-4"
          >
            <Card className="bg-yellow-100 border-2 border-yellow-400">
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-2xl">{currentNews.emoji}</span>
                <span className="font-bold text-yellow-800">📰 Breaking News: {currentNews.headline}</span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock List */}
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/95">
          <CardContent className="p-4">
            <div className="grid gap-3">
              {stocks.map(stock => {
                const priceChange = stock.price - stock.previousPrice
                const priceChangePercent = (priceChange / stock.previousPrice) * 100
                
                return (
                  <motion.div
                    key={stock.id}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedStock?.id === stock.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-400'}
                    `}
                    onClick={() => setSelectedStock(stock)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{stock.emoji}</span>
                        <div>
                          <div className="font-bold">{stock.name}</div>
                          <div className="text-sm text-gray-500">
                            Owned: {stock.owned} shares
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">${stock.price.toFixed(2)}</div>
                        <div className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {priceChange >= 0 ? <TrendUp /> : <TrendDown />}
                          {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); buyStock(stock, 1); }}
                          disabled={cash < stock.price}
                          className="bg-green-50 hover:bg-green-100 border-green-300"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Buy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); sellStock(stock, 1); }}
                          disabled={stock.owned === 0}
                          className="bg-red-50 hover:bg-red-100 border-red-300"
                        >
                          <Tag className="w-4 h-4 mr-1" />
                          Sell
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Day Button */}
      <div className="max-w-6xl mx-auto mt-4 flex justify-center gap-4">
        <Button variant="outline" onClick={onExit} className="bg-white/90">
          <ArrowLeft className="mr-2" /> Exit
        </Button>
        <Button 
          onClick={simulateDay} 
          className="bg-indigo-600 hover:bg-indigo-700 px-8"
          disabled={day >= maxDays}
        >
          <ChartLine className="mr-2" />
          {day >= maxDays ? 'Trading Complete' : 'Next Day →'}
        </Button>
      </div>
    </div>
  )
}

export default StockMarketGame
