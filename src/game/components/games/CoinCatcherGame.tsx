import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pause, Play, Coins, X, Heart, Star } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useThrottledCallback } from '@/hooks/use-debounced-callback'

interface CoinCatcherGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface FallingItem {
  id: number
  x: number
  y: number
  type: 'coin' | 'expense'
  value: number
  label: string
  speed: number
  emoji: string
}

interface FloatingText {
  id: number
  x: number
  y: number
  text: string
  type: 'gain' | 'loss'
}

export function CoinCatcherGame({ onComplete, onExit, userTier = 'middle' }: CoinCatcherGameProps) {
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'ended'>('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(60)
  const [playerX, setPlayerX] = useState(50)
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [gameSpeed, setGameSpeed] = useState(1)
  const [combo, setCombo] = useState(0)
  const [itemsCaught, setItemsCaught] = useState(0)
  const [itemsAvoided, setItemsAvoided] = useState(0)
  
  const gameLoopRef = useRef<number>(0)
  const itemIdRef = useRef(0)
  const textIdRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const playerXRef = useRef(50)
  const comboRef = useRef(0)

  const config = useMemo(() => {
    switch (userTier) {
      case 'elementary':
        return {
          duration: 60,
          spawnRate: 1500,
          coinValues: [1, 2, 5],
          expenseValues: [1, 2],
          items: [
            { type: 'coin', emoji: '🪙', labels: ['Penny', 'Nickel', 'Dime'] },
            { type: 'expense', emoji: '🍬', labels: ['Candy', 'Toy', 'Snack'] }
          ]
        }
      case 'middle':
        return {
          duration: 60,
          spawnRate: 1200,
          coinValues: [5, 10, 20, 50],
          expenseValues: [5, 10, 15],
          items: [
            { type: 'coin', emoji: '💵', labels: ['$5', '$10', '$20'] },
            { type: 'expense', emoji: '🎮', labels: ['Movie', 'Game', 'Snack'] }
          ]
        }
      case 'adult':
        return {
          duration: 60,
          spawnRate: 1000,
          coinValues: [50, 100, 200, 500],
          expenseValues: [50, 100, 150],
          items: [
            { type: 'coin', emoji: '💰', labels: ['Bonus', 'Refund', 'Income'] },
            { type: 'expense', emoji: '💳', labels: ['Impulse', 'Subscription', 'Upgrade'] }
          ]
        }
      default:
        return {
          duration: 60,
          spawnRate: 1200,
          coinValues: [5, 10, 20],
          expenseValues: [5, 10, 15],
          items: [
            { type: 'coin', emoji: '💵', labels: ['$5', '$10', '$20'] },
            { type: 'expense', emoji: '🎮', labels: ['Movie', 'Game', 'Snack'] }
          ]
        }
    }
  }, [userTier])

  useEffect(() => {
    playerXRef.current = playerX
  }, [playerX])

  useEffect(() => {
    comboRef.current = combo
  }, [combo])

  const addFloatingText = useCallback((x: number, y: number, text: string, type: 'gain' | 'loss') => {
    const newText: FloatingText = {
      id: textIdRef.current++,
      x,
      y,
      text,
      type
    }
    setFloatingTexts(prev => [...prev, newText])
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id))
    }, 1000)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!gameAreaRef.current || gameState !== 'playing') return
    
    const rect = gameAreaRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setPlayerX(Math.max(10, Math.min(90, x)))
  }, [gameState])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!gameAreaRef.current || gameState !== 'playing') return
    
    e.preventDefault()
    const rect = gameAreaRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    setPlayerX(Math.max(10, Math.min(90, x)))
  }, [gameState])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerX(prev => Math.max(10, prev - 3))
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerX(prev => Math.min(90, prev + 3))
      } else if (e.key === ' ') {
        e.preventDefault()
        pauseGame()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState])

  const spawnItem = useCallback(() => {
    const now = Date.now()
    if (now - lastSpawnRef.current < config.spawnRate / gameSpeed) return

    const isCoin = Math.random() > 0.35
    const values = isCoin ? config.coinValues : config.expenseValues
    const itemConfig = config.items.find(i => i.type === (isCoin ? 'coin' : 'expense'))!
    
    const value = values[Math.floor(Math.random() * values.length)]
    const label = itemConfig.labels[Math.floor(Math.random() * itemConfig.labels.length)]

    const newItem: FallingItem = {
      id: itemIdRef.current++,
      x: Math.random() * 70 + 15,
      y: -10,
      type: isCoin ? 'coin' : 'expense',
      value,
      label,
      speed: (Math.random() * 1.5 + 1.5) * gameSpeed,
      emoji: itemConfig.emoji
    }

    setFallingItems(prev => [...prev, newItem])
    lastSpawnRef.current = now
  }, [config, gameSpeed])

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return

    spawnItem()

    setFallingItems(prev => {
      const updated = prev.map(item => ({
        ...item,
        y: item.y + item.speed * 0.5
      })).filter(item => {
        const playerWidth = 14
        const collision = 
          item.y > 80 && item.y < 95 &&
          Math.abs(item.x - playerXRef.current) < playerWidth / 2

        if (collision) {
          const currentCombo = comboRef.current
          const comboBonus = currentCombo > 0 ? Math.floor(currentCombo * 0.1 * item.value) : 0
          
          if (item.type === 'coin') {
            const totalGain = item.value + comboBonus
            setScore(prev => prev + totalGain)
            setCombo(prev => prev + 1)
            setItemsCaught(prev => prev + 1)
            addFloatingText(item.x, item.y, `+$${totalGain}`, 'gain')
            
            if (currentCombo > 0 && currentCombo % 5 === 0) {
              toast.success(`🔥 ${currentCombo}x Combo!`, { duration: 1500 })
            }
          } else {
            setScore(prev => Math.max(0, prev - item.value))
            setLives(prev => prev - 1)
            setCombo(0)
            addFloatingText(item.x, item.y, `-$${item.value}`, 'loss')
            toast.error(`Hit expense! -$${item.value}`, { duration: 1000 })
          }
          return false
        }

        if (item.y > 105) {
          if (item.type === 'coin') {
            setCombo(0)
          } else {
            setItemsAvoided(prev => prev + 1)
          }
          return false
        }

        return true
      })

      return updated
    })

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, spawnItem, addFloatingText])

  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('ended')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'playing') return

    const speedTimer = setInterval(() => {
      setGameSpeed(prev => Math.min(2.5, prev + 0.08))
    }, 8000)

    return () => clearInterval(speedTimer)
  }, [gameState])

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, gameLoop])

  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      setGameState('ended')
      toast.error('Game Over! Out of lives.')
    }
  }, [lives, gameState])

  const startGame = useThrottledCallback(() => {
    setGameState('playing')
    setScore(0)
    setLives(3)
    setTimeLeft(config.duration)
    setFallingItems([])
    setFloatingTexts([])
    setGameSpeed(1)
    setPlayerX(50)
    setCombo(0)
    setItemsCaught(0)
    setItemsAvoided(0)
  }, 500)

  const pauseGame = useThrottledCallback(() => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused')
  }, 300)

  const endGame = useThrottledCallback(() => {
    const accuracy = itemsCaught / Math.max(1, itemsCaught + (3 - lives))
    const finalScore = Math.max(score, 0)
    
    onComplete(finalScore, { 
      itemsCaught,
      itemsAvoided,
      accuracy: Math.round(accuracy * 100),
      livesRemaining: lives,
      maxCombo: combo
    })
  }, 500)

  const handleExit = useThrottledCallback(() => {
    onExit()
  }, 500)

  if (gameState === 'ended') {
    const accuracy = itemsCaught / Math.max(1, itemsCaught + (3 - lives))
    const performanceRating = score > 500 ? 'Excellent!' : score > 300 ? 'Great!' : score > 150 ? 'Good!' : 'Keep Practicing!'

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-2xl glass-card shadow-2xl">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center"
            >
              <div className="text-7xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Game Complete!</h2>
              <p className="text-xl text-accent font-semibold mb-8">{performanceRating}</p>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-accent text-center"
              >
                <div className="text-4xl font-bold text-accent mb-2">${score}</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </motion.div>
              
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-primary text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">{Math.round(accuracy * 100)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-secondary text-center"
              >
                <div className="text-4xl font-bold text-secondary mb-2">{itemsCaught}</div>
                <div className="text-sm text-muted-foreground">Coins Caught</div>
              </motion.div>
              
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 rounded-xl border-l-4 border-l-muted-foreground text-center"
              >
                <div className="text-4xl font-bold text-foreground mb-2">{itemsAvoided}</div>
                <div className="text-sm text-muted-foreground">Expenses Dodged</div>
              </motion.div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-foreground mb-3">Key Learnings:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Active saving requires catching opportunities as they come</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Avoiding unnecessary expenses is just as important as earning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Building good habits (combos) multiplies your financial success</span>
                </li>
              </ul>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Button onClick={startGame} className="flex-1 btn-primary-gaming">
                <Play className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={endGame} variant="outline" className="flex-1 border-2">
                Continue
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="glass-card border-b-0 shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleExit} className="hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div className="flex items-center gap-3">
                <div className="gradient-accent p-2 rounded-xl">
                  <Coins className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Coin Catcher</h1>
                  <p className="text-xs text-muted-foreground">Catch coins, avoid expenses</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">${score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  {[...Array(3)].map((_, i) => (
                    <Heart 
                      key={i}
                      className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
                      weight={i < lives ? 'fill' : 'regular'}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">Lives</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
              
              {combo > 1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-orange-500">🔥 {combo}x</div>
                  <div className="text-xs text-muted-foreground">Combo</div>
                </motion.div>
              )}
              
              {gameState === 'playing' || gameState === 'paused' ? (
                <Button onClick={pauseGame} variant="outline" size="sm" className="border-2">
                  {gameState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
              ) : null}
            </div>
          </div>
          
          <div className="mt-3">
            <Progress value={(timeLeft / config.duration) * 100} className="h-2 bg-muted/50" />
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
            <Card className="glass-card shadow-2xl">
              <CardContent className="p-10">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    className="text-8xl mb-6"
                  >
                    🪙
                  </motion.div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">Coin Catcher</h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                    Test your reflexes and financial decision-making! Catch valuable coins while avoiding impulse expenses.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="glass-card bg-accent/5 p-6 rounded-xl border-l-4 border-l-accent">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">💰</div>
                      <div>
                        <div className="font-bold text-accent text-lg">Catch Coins</div>
                        <div className="text-sm text-muted-foreground">Earn money & build combos</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Every coin you catch adds to your savings. Chain catches to multiply your earnings!
                    </p>
                  </div>
                  
                  <div className="glass-card bg-destructive/5 p-6 rounded-xl border-l-4 border-l-destructive">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">💸</div>
                      <div>
                        <div className="font-bold text-destructive text-lg">Avoid Expenses</div>
                        <div className="text-sm text-muted-foreground">Dodge impulse purchases</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hitting expenses costs you money and breaks your combo streak!
                    </p>
                  </div>
                </div>

                <div className="bg-muted/30 p-6 rounded-xl mb-8">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent" weight="fill" />
                    How to Play
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="text-primary font-bold">1.</div>
                      <div>
                        <div className="font-semibold text-foreground">Move Your Basket</div>
                        <div className="text-muted-foreground">Use mouse, touch, or arrow keys</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-primary font-bold">2.</div>
                      <div>
                        <div className="font-semibold text-foreground">Catch Coins</div>
                        <div className="text-muted-foreground">Position under falling items</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-primary font-bold">3.</div>
                      <div>
                        <div className="font-semibold text-foreground">Avoid Expenses</div>
                        <div className="text-muted-foreground">Stay away from red items</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={startGame} size="lg" className="btn-primary-gaming px-12 py-6 text-lg shadow-2xl">
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div 
                    ref={gameAreaRef}
                    className="relative bg-gradient-to-b from-sky-100 via-sky-50 to-green-50 overflow-hidden cursor-none"
                    style={{ height: '600px' }}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                  >
                    <AnimatePresence>
                      {fallingItems.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${item.x}%`,
                            top: `${item.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className={`
                            px-4 py-2 rounded-xl text-sm font-bold text-center min-w-20 shadow-lg
                            ${item.type === 'coin' 
                              ? 'gradient-accent text-accent-foreground border-2 border-accent/30' 
                              : 'bg-destructive text-destructive-foreground border-2 border-destructive/50'
                            }
                          `}>
                            <div className="text-2xl mb-1">{item.emoji}</div>
                            <div className="text-xs opacity-90">{item.label}</div>
                            <div className="font-black">${item.value}</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <AnimatePresence>
                      {floatingTexts.map(text => (
                        <motion.div
                          key={text.id}
                          initial={{ y: 0, opacity: 1, scale: 1 }}
                          animate={{ y: -50, opacity: 0, scale: 1.2 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1 }}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${text.x}%`,
                            top: `${text.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className={`
                            text-2xl font-black drop-shadow-lg
                            ${text.type === 'gain' ? 'text-green-600' : 'text-red-600'}
                          `}>
                            {text.text}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <motion.div
                      className="absolute bottom-8"
                      style={{
                        left: `${playerX}%`,
                        transform: 'translateX(-50%)'
                      }}
                      animate={{ 
                        scale: gameState === 'playing' ? [1, 1.05, 1] : 1,
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <div className="text-5xl drop-shadow-2xl filter brightness-110">
                        🧺
                      </div>
                    </motion.div>

                    {gameState === 'paused' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                      >
                        <Card className="glass-card shadow-2xl">
                          <CardContent className="p-8 text-center">
                            <div className="text-5xl mb-4">⏸️</div>
                            <h3 className="text-2xl font-bold text-foreground mb-6">Game Paused</h3>
                            <Button onClick={pauseGame} className="btn-primary-gaming px-8" size="lg">
                              <Play className="w-5 h-5 mr-2" />
                              Resume
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-6 glass-card px-6 py-3 rounded-full">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">←</kbd>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">→</kbd>
                  <span>Move</span>
                </div>
                <div className="h-4 w-px bg-border"></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd>
                  <span>Pause</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
