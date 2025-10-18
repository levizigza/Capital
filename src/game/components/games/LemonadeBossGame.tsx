import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Minus, ShoppingCart, User, Coins } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface LemonadeBossGameProps {
  onComplete: (score: number, additionalData?: any) => void
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      <div className="glass-card border-b-0 shadow-md bg-amber-100/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onExit} className="hover:bg-amber-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-xl">
                  <span className="text-3xl">🍋</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Lemonade Boss</h1>
                  <p className="text-xs text-muted-foreground">Master pricing & profit margins</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${money.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Cash</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{cupsSold}</div>
                <div className="text-xs text-muted-foreground">Sold</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">${totalSales.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Sales</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {gameState === 'ready' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="glass-card shadow-2xl bg-white/90">
              <CardContent className="p-10">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    className="text-8xl mb-6"
                  >
                    🍋
                  </motion.div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">Lemonade Boss</h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                    Run your own lemonade stand! Learn about unit costs, pricing strategy, and profit margins while serving thirsty customers.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="glass-card bg-green-50 p-6 rounded-xl border-l-4 border-l-green-500">
                    <div className="text-3xl mb-2">🍋</div>
                    <div className="font-bold text-green-700 text-lg mb-1">Buy Supplies</div>
                    <p className="text-sm text-muted-foreground">
                      Lemons: $5 for 10<br/>Sugar: $3 for 10
                    </p>
                  </div>
                  
                  <div className="glass-card bg-amber-50 p-6 rounded-xl border-l-4 border-l-amber-500">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="font-bold text-amber-700 text-lg mb-1">Set Your Price</div>
                    <p className="text-sm text-muted-foreground">
                      Higher prices = more profit, but fewer sales
                    </p>
                  </div>

                  <div className="glass-card bg-blue-50 p-6 rounded-xl border-l-4 border-l-blue-500">
                    <div className="text-3xl mb-2">🧑</div>
                    <div className="font-bold text-blue-700 text-lg mb-1">Serve Customers</div>
                    <p className="text-sm text-muted-foreground">
                      Customer every 3 seconds if you have inventory
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-xl mb-8 border border-amber-200">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Game Mechanics
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-foreground mb-2">Sale Probability:</div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• $0.50: 100% chance</li>
                        <li>• $1.00: 50% chance</li>
                        <li>• $1.50+: 10% chance</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-2">Recipe:</div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• 1 lemon per cup</li>
                        <li>• 1 sugar per cup</li>
                        <li>• Unit cost: $0.80</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12 py-6 text-lg shadow-2xl">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Open Your Stand
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <Card className="glass-card shadow-lg bg-white/90">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-amber-600" />
                      Buy Supplies
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🍋</span>
                          <div>
                            <div className="font-semibold text-sm">Lemons</div>
                            <div className="text-xs text-muted-foreground">${LEMON_PACK_COST} for {LEMON_PACK_SIZE}</div>
                          </div>
                        </div>
                        <Button 
                          onClick={buyLemons}
                          disabled={money < LEMON_PACK_COST}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Buy
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🧂</span>
                          <div>
                            <div className="font-semibold text-sm">Sugar</div>
                            <div className="text-xs text-muted-foreground">${SUGAR_PACK_COST} for {SUGAR_PACK_SIZE}</div>
                          </div>
                        </div>
                        <Button 
                          onClick={buySugar}
                          disabled={money < SUGAR_PACK_COST}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Buy
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-bold text-sm mb-3">Current Inventory</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-amber-50 p-3 rounded-lg text-center border border-amber-200">
                          <div className="text-2xl font-bold text-amber-700">{lemons}</div>
                          <div className="text-xs text-muted-foreground">🍋 Lemons</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg text-center border border-amber-200">
                          <div className="text-2xl font-bold text-amber-700">{sugar}</div>
                          <div className="text-xs text-muted-foreground">🧂 Sugar</div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <Badge className={`${canMakeCup ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                          {canMakeCup ? `Can make ${Math.min(lemons, sugar)} cups` : 'Need supplies!'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card shadow-lg bg-white/90">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-600" />
                      Set Price
                    </h3>
                    
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-xl mb-4 border-2 border-amber-300">
                      <div className="text-center mb-4">
                        <div className="text-5xl font-black text-amber-700">
                          ${price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">per cup</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={decrementPrice}
                          disabled={price <= 0.25}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Minus className="w-4 h-4" weight="bold" />
                        </Button>
                        <Button
                          onClick={incrementPrice}
                          disabled={price >= 3.00}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="w-4 h-4" weight="bold" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Unit Cost:</span>
                        <span className="font-bold">${unitCostPerCup.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Profit per Cup:</span>
                        <span className={`font-bold ${(price - unitCostPerCup) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${(price - unitCostPerCup).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Margin:</span>
                        <span className={`font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitMargin.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-muted-foreground">Sale Chance:</span>
                        <span className="font-bold text-blue-600">
                          {Math.round(getSaleChance(price) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="glass-card shadow-lg bg-white/90 overflow-hidden">
                  <CardContent className="p-0">
                    <div 
                      className="relative overflow-hidden"
                      style={{ 
                        height: '600px',
                        background: 'linear-gradient(to bottom, #fef3c7 0%, #fed7aa 50%, #fb923c 100%)',
                        backgroundImage: `
                          repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,0,0,0.03) 19px, rgba(0,0,0,0.03) 20px),
                          repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0,0,0,0.03) 19px, rgba(0,0,0,0.03) 20px)
                        `
                      }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-amber-800/30 border-t-4 border-amber-900">
                        <div className="flex items-center justify-center h-full">
                          <div className="text-6xl drop-shadow-2xl">
                            🧃
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-4 left-1/2 -translate-x-1/2">
                        <div className="bg-amber-800 text-amber-50 px-6 py-3 rounded-lg font-bold text-lg shadow-lg border-2 border-amber-900">
                          🍋 LEMONADE ${price.toFixed(2)} 🍋
                        </div>
                      </div>

                      <AnimatePresence>
                        {customers.map(customer => (
                          <motion.div
                            key={customer.id}
                            initial={{ scale: 0, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${customer.x}%`,
                              top: `${customer.y}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            <div className="text-center">
                              <motion.div
                                animate={{ 
                                  y: [0, -5, 0],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="text-5xl drop-shadow-lg"
                              >
                                {customer.emoji}
                              </motion.div>
                              {customer.y > 40 && customer.y < 70 && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="mt-2 bg-white px-2 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-gray-300"
                                >
                                  Max: ${customer.maxPrice.toFixed(2)}
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {!canMakeCup && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                          <Card className="glass-card shadow-2xl">
                            <CardContent className="p-6 text-center">
                              <div className="text-4xl mb-3">⚠️</div>
                              <h3 className="text-xl font-bold text-foreground mb-2">Out of Inventory!</h3>
                              <p className="text-sm text-muted-foreground">Buy more supplies to continue</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-4 glass-card px-6 py-3 rounded-full bg-white/90">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-blue-600" weight="fill" />
                      <span className="text-muted-foreground">Customers: Every 3 seconds</span>
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Missed: <span className="font-bold text-red-600">{customersMissed}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
