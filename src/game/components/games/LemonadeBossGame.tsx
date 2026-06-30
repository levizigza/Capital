import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Minus, ShoppingCart, User, Coins } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface LemonadeBossGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface Customer {
  id: number
  x: number
  y: number
  emoji: string
  maxPrice: number
}

export function LemonadeBossGame({ onComplete, onExit }: LemonadeBossGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [money, setMoney] = useState(20)
  const [lemons, setLemons] = useState(0)
  const [sugar, setSugar] = useState(0)
  const [price, setPrice] = useState(0.50)
  const [totalSales, setTotalSales] = useState(0)
  const [cupsSold, setCupsSold] = useState(0)
  const [customersMissed, setCustomersMissed] = useState(0)
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const customerIdRef = useRef(0)
  const lastCustomerTimeRef = useRef(0)

  const LEMON_PACK_COST = 5
  const LEMON_PACK_SIZE = 10
  const SUGAR_PACK_COST = 3
  const SUGAR_PACK_SIZE = 10
  const CUSTOMER_INTERVAL = 3000
  const STARTING_MONEY = 20

  const canMakeCup = lemons >= 1 && sugar >= 1

  const getSaleChance = (price: number): number => {
    if (price <= 0.50) return 1.0
    if (price <= 0.75) return 0.8
    if (price <= 1.00) return 0.5
    if (price <= 1.25) return 0.3
    return 0.1
  }

  const buyLemons = () => {
    if (money >= LEMON_PACK_COST) {
      setMoney(prev => prev - LEMON_PACK_COST)
      setLemons(prev => prev + LEMON_PACK_SIZE)
      toast.success(`Bought 10 lemons for $${LEMON_PACK_COST}!`)
    } else {
      toast.error('Not enough money!')
    }
  }

  const buySugar = () => {
    if (money >= SUGAR_PACK_COST) {
      setMoney(prev => prev - SUGAR_PACK_COST)
      setSugar(prev => prev + SUGAR_PACK_SIZE)
      toast.success(`Bought 10 sugar units for $${SUGAR_PACK_COST}!`)
    } else {
      toast.error('Not enough money!')
    }
  }

  const incrementPrice = () => {
    setPrice(prev => Math.min(3.00, prev + 0.25))
  }

  const decrementPrice = () => {
    setPrice(prev => Math.max(0.25, prev - 0.25))
  }

  const spawnCustomer = () => {
    if (!canMakeCup) return

    const customerEmojis = ['🧑', '👩', '👨', '🧒', '👴', '👵', '🧑‍💼', '👨‍💼', '👩‍💼']
    const emoji = customerEmojis[Math.floor(Math.random() * customerEmojis.length)]
    
    const newCustomer: Customer = {
      id: customerIdRef.current++,
      x: Math.random() * 60 + 20,
      y: -10,
      emoji,
      maxPrice: 0.5 + Math.random() * 1.5
    }

    setCustomers(prev => [...prev, newCustomer])
  }

  useEffect(() => {
    if (gameState !== 'playing') return

    const customerTimer = setInterval(() => {
      const now = Date.now()
      if (now - lastCustomerTimeRef.current >= CUSTOMER_INTERVAL && canMakeCup) {
        spawnCustomer()
        lastCustomerTimeRef.current = now
      }
    }, 100)

    return () => clearInterval(customerTimer)
  }, [gameState, canMakeCup])

  useEffect(() => {
    if (gameState !== 'playing') return

    const moveInterval = setInterval(() => {
      setCustomers(prev => {
        const updated = prev.map(customer => ({
          ...customer,
          y: customer.y + 2
        })).filter(customer => {
          if (customer.y > 70 && customer.y < 85) {
            if (!canMakeCup) {
              setCustomersMissed(prev => prev + 1)
              toast.error('No lemonade to sell!', { duration: 1000 })
              return false
            }

            const saleChance = getSaleChance(price)
            const customerWillBuy = customer.maxPrice >= price && Math.random() < saleChance

            if (customerWillBuy) {
              setLemons(prev => prev - 1)
              setSugar(prev => prev - 1)
              setMoney(prev => prev + price)
              setTotalSales(prev => prev + price)
              setCupsSold(prev => prev + 1)
              toast.success(`Sold for $${price.toFixed(2)}! 🍋`, { duration: 1000 })
            } else {
              setCustomersMissed(prev => prev + 1)
              if (customer.maxPrice < price) {
                toast.error('Too expensive!', { duration: 1000 })
              } else {
                toast.error('Customer not interested', { duration: 1000 })
              }
            }
            return false
          }

          if (customer.y > 110) {
            setCustomersMissed(prev => prev + 1)
            return false
          }

          return true
        })

        return updated
      })
    }, 100)

    return () => clearInterval(moveInterval)
  }, [gameState, canMakeCup, price, lemons, sugar])

  useEffect(() => {
    if (gameState === 'playing' && money < SUGAR_PACK_COST && !canMakeCup) {
      setGameState('ended')
      toast.error('Game Over! Out of money and inventory.')
    }
  }, [money, canMakeCup, gameState])

  const startGame = () => {
    setGameState('playing')
    setMoney(STARTING_MONEY)
    setLemons(0)
    setSugar(0)
    setPrice(0.50)
    setTotalSales(0)
    setCupsSold(0)
    setCustomersMissed(0)
    setCustomers([])
    lastCustomerTimeRef.current = Date.now()
  }

  const endGame = () => {
    const profit = totalSales - (STARTING_MONEY - money + totalSales)
    const finalScore = Math.max(Math.round(totalSales * 10), 0)
    
    onComplete(finalScore, {
      totalSales: totalSales.toFixed(2),
      cupsSold,
      customersMissed,
      finalMoney: money.toFixed(2),
      profit: profit.toFixed(2)
    })
  }

  const unitCostPerCup = (LEMON_PACK_COST / LEMON_PACK_SIZE) + (SUGAR_PACK_COST / SUGAR_PACK_SIZE)
  const profitMargin = price > 0 ? ((price - unitCostPerCup) / price * 100) : 0

  if (gameState === 'ended') {
    const totalCost = STARTING_MONEY + totalSales - money
    const profit = totalSales - totalCost
    const performanceRating = profit > 20 ? 'Business Tycoon!' : profit > 10 ? 'Great Manager!' : profit > 5 ? 'Good Start!' : 'Keep Learning!'

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-2xl glass-card shadow-2xl">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center"
            >
              <div className="text-7xl mb-4">🍋</div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Stand Closed!</h2>
              <p className="text-xl text-amber-600 font-semibold mb-8">{performanceRating}</p>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-green-500 text-center"
              >
                <div className="text-4xl font-bold text-green-600 mb-2">${totalSales.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
              </motion.div>
              
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-amber-500 text-center"
              >
                <div className={`text-4xl font-bold mb-2 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${profit.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Net Profit</div>
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-blue-500 text-center"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">{cupsSold}</div>
                <div className="text-sm text-muted-foreground">Cups Sold</div>
              </motion.div>
              
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-purple-500 text-center"
              >
                <div className="text-4xl font-bold text-purple-600 mb-2">${money.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Cash Left</div>
              </motion.div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-200">
              <h3 className="font-semibold text-foreground mb-3">Key Learnings:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Unit cost matters - you spent ${unitCostPerCup.toFixed(2)} per cup to make</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Higher prices mean more profit per cup, but fewer sales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Managing inventory and cash flow is essential for any business</span>
                </li>
              </ul>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Button onClick={startGame} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={endGame} variant="outline" className="flex-1 border-2">
                Return to Hub
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-green-50 to-blue-100 p-8">
        <Card className="w-full max-w-2xl glass-card shadow-2xl">
          <CardContent className="p-12 flex flex-col items-center gap-8">
            <div className="text-8xl mb-4">🍋</div>
            <h2 className="text-4xl font-bold text-foreground mb-2">Welcome to Lemonade Boss!</h2>
            <p className="text-xl text-muted-foreground mb-8 text-center max-w-lg">
              Buy lemons and sugar, set your price, and sell as many cups as you can! Adjust your price to maximize sales and profit.
            </p>
            <Button onClick={startGame} className="game-arcade-btn w-full max-w-md text-2xl">
              <ShoppingCart className="w-6 h-6 mr-3" />
              Start Game
            </Button>
            <Button onClick={onExit} variant="outline" className="w-full max-w-md text-lg mt-2 border-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fix: Implement handleMakeCup and map button handlers correctly
  const handleMakeCup = () => {
    if (canMakeCup) {
      setLemons(prev => prev - 1)
      setSugar(prev => prev - 1)
      setMoney(prev => prev + price)
      setTotalSales(prev => prev + price)
      setCupsSold(prev => prev + 1)
      toast.success(`Sold for $${price.toFixed(2)}! 🍋`, { duration: 1000 })
    } else {
      toast.error('Not enough ingredients!')
    }
  }
  const handleBuyLemons = buyLemons
  const handleBuySugar = buySugar

  return (
    <div className="game-arcade-container">
      <div className="game-arcade-header flex items-center gap-4 mb-6">
        <span className="text-5xl">🍋</span>
        Lemonade Boss
      </div>
      <div className="game-arcade-stats">
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-green-600">${money.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Cash</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-amber-600">{cupsSold}</div>
          <div className="text-xs text-muted-foreground">Sold</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-blue-600">${totalSales.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Sales</div>
        </div>
      </div>
      <div className="game-arcade-actions">
        <button className="game-arcade-btn" onClick={handleMakeCup}>Make Lemonade</button>
        <button className="game-arcade-btn" onClick={handleBuyLemons}>Buy Lemons</button>
        <button className="game-arcade-btn" onClick={handleBuySugar}>Buy Sugar</button>
        <button className="game-arcade-btn" onClick={onExit}>Exit</button>
      </div>
      {/* ...other game UI... */}
    </div>
  )
}
