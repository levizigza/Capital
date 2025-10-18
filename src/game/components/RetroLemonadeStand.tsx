/**
 * Retro Lemonade Stand - 8-bit style business simulation with motion controls and BCI integration
 * Teaches basic entrepreneurship, pricing, and profit/loss concepts
 */

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Sun, Cloud, CloudRain, Thermometer, Coins, 
  Share, TrendUp, Users, Clock, Lightning 
} from '@phosphor-icons/react'
import { MotionControlSystem, GestureEvent } from '../systems/MotionControlSystem'
import { BCISystem, CognitiveState } from '../systems/BCISystem'
import { VARKSystem } from '../systems/VARKSystem'
import { AgeTierSystem } from '../systems/AgeTierSystem'

interface GameState {
  day: number
  money: number
  reputation: number
  weather: 'sunny' | 'cloudy' | 'rainy'
  temperature: number
  customers: number
  ingredients: {
    lemons: number
    sugar: number
    ice: number
    cups: number
  }
  recipe: {
    lemonsPerCup: number
    sugarPerCup: number
    icePerCup: number
  }
  price: number
  cupsSold: number
  dailyProfit: number
  totalProfit: number
  gameOver: boolean
  score: number
}

interface RetroLemonadeProps {
  difficulty: 'easy' | 'medium' | 'hard'
  onComplete: (score: number, timeSpent: number, additionalData?: any) => void
  onExit: () => void
}

export const RetroLemonadeStand: React.FC<RetroLemonadeProps> = ({
  difficulty,
  onComplete,
  onExit
}) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    money: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 10,
    reputation: 50,
    weather: 'sunny',
    temperature: 75,
    customers: 0,
    ingredients: { lemons: 0, sugar: 0, ice: 0, cups: 0 },
    recipe: { lemonsPerCup: 1, sugarPerCup: 1, icePerCup: 1 },
    price: 0.50,
    cupsSold: 0,
    dailyProfit: 0,
    totalProfit: 0,
    gameOver: false,
    score: 0
  })

  const [gamePhase, setGamePhase] = useState<'setup' | 'shopping' | 'mixing' | 'selling' | 'results'>('setup')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isShaking, setIsShaking] = useState(false)
  const [focusBonus, setFocusBonus] = useState(1)
  const [motionEnabled, setMotionEnabled] = useState(false)
  const [bciEnabled, setBciEnabled] = useState(false)

  const startTime = useRef(Date.now())
  const motionSystem = useRef<MotionControlSystem | null>(null)
  const bciSystem = useRef<BCISystem | null>(null)
  const varkSystem = useRef<VARKSystem | null>(null)
  const ageSystem = useRef<AgeTierSystem | null>(null)

  useEffect(() => {
    // Initialize systems
    varkSystem.current = new VARKSystem()
    ageSystem.current = new AgeTierSystem()
    
    // Set up motion controls
    motionSystem.current = new MotionControlSystem({
      sensitivity: 1.2,
      supportedGestures: ['shake', 'tilt', 'pour']
    })

    motionSystem.current.initialize().then(success => {
      setMotionEnabled(success)
      if (success) {
        motionSystem.current!.onGesture('shake', handleShakeGesture)
        motionSystem.current!.onGesture('pour', handlePourGesture)
        motionSystem.current!.onGesture('tilt', handleTiltGesture)
      }
    })

    // Set up BCI if available
    bciSystem.current = new BCISystem({ deviceType: 'mock' })
    bciSystem.current.initialize().then(success => {
      setBciEnabled(success)
      if (success) {
        bciSystem.current!.onStateChange(handleCognitiveStateChange)
        bciSystem.current!.calibrate(5) // Quick calibration for demo
      }
    })

    // Game timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      motionSystem.current?.destroy()
      bciSystem.current?.disconnect()
    }
  }, [])

  const handleShakeGesture = (gesture: GestureEvent) => {
    if (gamePhase !== 'mixing') return

    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)

    // Mixing improves recipe quality
    setGameState(prev => ({
      ...prev,
      reputation: Math.min(100, prev.reputation + gesture.intensity * 5)
    }))
  }

  const handlePourGesture = (gesture: GestureEvent) => {
    if (gamePhase !== 'mixing') return

    // Pouring motion adjusts recipe ingredients
    const direction = gesture.direction
    setGameState(prev => {
      let newRecipe = { ...prev.recipe }
      
      switch (direction) {
        case 'left':
          newRecipe.lemonsPerCup = Math.max(0.5, newRecipe.lemonsPerCup - 0.1)
          break
        case 'right':
          newRecipe.lemonsPerCup = Math.min(3, newRecipe.lemonsPerCup + 0.1)
          break
        case 'forward':
          newRecipe.sugarPerCup = Math.max(0.5, newRecipe.sugarPerCup - 0.1)
          break
        case 'back':
          newRecipe.sugarPerCup = Math.min(3, newRecipe.sugarPerCup + 0.1)
          break
      }

      return { ...prev, recipe: newRecipe }
    })
  }

  const handleTiltGesture = (gesture: GestureEvent) => {
    if (gamePhase !== 'selling') return

    // Tilting adjusts price
    const direction = gesture.direction
    setGameState(prev => {
      let newPrice = prev.price
      
      if (direction === 'up') {
        newPrice = Math.min(2.00, newPrice + 0.05)
      } else if (direction === 'down') {
        newPrice = Math.max(0.25, newPrice - 0.05)
      }

      return { ...prev, price: newPrice }
    })
  }

  const handleCognitiveStateChange = (state: CognitiveState) => {
    // High focus improves business decisions
    if (state.focus > 0.7) {
      setFocusBonus(1.2)
    } else if (state.focus < 0.3) {
      setFocusBonus(0.8)
    } else {
      setFocusBonus(1.0)
    }

    // High stress reduces customer satisfaction
    if (state.frustration > 0.6) {
      setGameState(prev => ({
        ...prev,
        reputation: Math.max(0, prev.reputation - 1)
      }))
    }

    // Flow state increases efficiency
    if (state.flow > 0.8) {
      setGameState(prev => ({
        ...prev,
        reputation: Math.min(100, prev.reputation + 2)
      }))
    }
  }

  const generateWeather = () => {
    const weatherOptions: Array<{ type: GameState['weather'], temp: number, probability: number }> = [
      { type: 'sunny', temp: 85, probability: 0.6 },
      { type: 'cloudy', temp: 70, probability: 0.3 },
      { type: 'rainy', temp: 65, probability: 0.1 }
    ]

    const rand = Math.random()
    let cumulative = 0
    
    for (const option of weatherOptions) {
      cumulative += option.probability
      if (rand <= cumulative) {
        return { weather: option.type, temperature: option.temp + Math.floor(Math.random() * 10) - 5 }
      }
    }
    
    return { weather: 'sunny' as const, temperature: 80 }
  }

  const buyIngredients = (ingredient: keyof GameState['ingredients'], amount: number) => {
    const costs = { lemons: 0.50, sugar: 0.25, ice: 0.10, cups: 0.05 }
    const cost = costs[ingredient] * amount

    setGameState(prev => {
      if (prev.money >= cost) {
        return {
          ...prev,
          money: prev.money - cost,
          ingredients: {
            ...prev.ingredients,
            [ingredient]: prev.ingredients[ingredient] + amount
          }
        }
      }
      return prev
    })
  }

  const simulateDay = () => {
    const { weather, temperature } = generateWeather()
    
    setGameState(prev => {
      // Calculate potential customers based on weather and reputation
      let baseCustomers = 20
      
      if (weather === 'sunny') baseCustomers *= 1.5
      else if (weather === 'rainy') baseCustomers *= 0.3
      
      if (temperature > 80) baseCustomers *= 1.3
      else if (temperature < 60) baseCustomers *= 0.7

      baseCustomers *= (prev.reputation / 100)
      baseCustomers *= focusBonus

      const customers = Math.floor(baseCustomers + Math.random() * 10)

      // Calculate recipe quality
      const optimalRatio = { lemons: 1.5, sugar: 1.2, ice: 1.0 }
      const recipeScore = Math.max(0, 1 - Math.abs(prev.recipe.lemonsPerCup - optimalRatio.lemons) * 0.2
                          - Math.abs(prev.recipe.sugarPerCup - optimalRatio.sugar) * 0.2
                          - Math.abs(prev.recipe.icePerCup - optimalRatio.ice) * 0.2)

      // Calculate demand based on price with probability
      const optimalPrice = 0.75
      const priceScore = Math.max(0, 1 - Math.abs(prev.price - optimalPrice) / optimalPrice)

      // Calculate cups that can be made
      const cupsCanMake = Math.floor(Math.min(
        prev.ingredients.lemons / prev.recipe.lemonsPerCup,
        prev.ingredients.sugar / prev.recipe.sugarPerCup,
        prev.ingredients.ice / prev.recipe.icePerCup,
        prev.ingredients.cups
      ))

      // Final sales calculation with probability
      const demandMultiplier = recipeScore * priceScore
      const potentialDemand = Math.floor(customers * demandMultiplier)
      
      // Add randomness to sales - each customer has a probability to buy
      let cupsSold = 0
      for (let i = 0; i < Math.min(potentialDemand, cupsCanMake); i++) {
        const saleProbability = demandMultiplier * 0.8 + 0.2
        if (Math.random() < saleProbability) {
          cupsSold++
        }
      }

      const revenue = cupsSold * prev.price
      const dailyProfit = revenue

      // Update reputation based on customer satisfaction
      let reputationChange = 0
      if (cupsSold === 0 && potentialDemand > 0) {
        reputationChange = -10
      } else if (recipeScore > 0.8) {
        reputationChange = 5
      } else if (recipeScore < 0.4) {
        reputationChange = -5
      }

      // Consume ingredients
      const newIngredients = {
        lemons: Math.max(0, prev.ingredients.lemons - (cupsSold * prev.recipe.lemonsPerCup)),
        sugar: Math.max(0, prev.ingredients.sugar - (cupsSold * prev.recipe.sugarPerCup)),
        ice: Math.max(0, prev.ingredients.ice - (cupsSold * prev.recipe.icePerCup)),
        cups: Math.max(0, prev.ingredients.cups - cupsSold)
      }

      return {
        ...prev,
        weather,
        temperature,
        customers: potentialDemand,
        cupsSold,
        dailyProfit,
        totalProfit: prev.totalProfit + dailyProfit,
        money: prev.money + revenue,
        ingredients: newIngredients,
        reputation: Math.max(0, Math.min(100, prev.reputation + reputationChange)),
        day: prev.day + 1
      }
    })

    setGamePhase('results')
  }

  const nextDay = () => {
    if (gameState.day >= 7 || gameState.money < 1) {
      endGame()
    } else {
      setGamePhase('shopping')
    }
  }

  const endGame = () => {
    const timeSpent = Date.now() - startTime.current
    const finalScore = Math.floor(
      gameState.totalProfit * 10 + 
      gameState.reputation + 
      (gameState.day - 1) * 50 +
      (focusBonus > 1 ? 100 : 0) // BCI bonus
    )

    setGameState(prev => ({ ...prev, gameOver: true, score: finalScore }))
    
    onComplete(finalScore, timeSpent, {
      finalProfit: gameState.totalProfit,
      daysPlayed: gameState.day - 1,
      finalReputation: gameState.reputation,
      usedMotionControls: motionEnabled,
      usedBCI: bciEnabled
    })
  }

  const getWeatherIcon = () => {
    switch (gameState.weather) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return ageSystem.current?.formatCurrency(amount) || `$${amount.toFixed(2)}`
  }

  if (gameState.gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-6xl">🏆</div>
        <h2 className="text-2xl font-bold">Lemonade Stand Complete!</h2>
        <div className="text-center space-y-2">
          <p className="text-lg">Final Score: <span className="font-bold text-primary">{gameState.score}</span></p>
          <p>Total Profit: <span className="text-green-600 font-semibold">{formatCurrency(gameState.totalProfit)}</span></p>
          <p>Days in Business: <span className="font-semibold">{gameState.day - 1}</span></p>
          <p>Final Reputation: <span className="font-semibold">{gameState.reputation}%</span></p>
          {bciEnabled && focusBonus > 1 && (
            <Badge className="bg-purple-100 text-purple-800">
              <Lightning className="w-4 h-4 mr-1" />
              Focus Master Bonus!
            </Badge>
          )}
        </div>
        <Button onClick={onExit}>Continue</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-yellow-100 to-orange-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              🍋 Retro Lemonade Stand - Day {gameState.day}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Badge>
              {bciEnabled && (
                <Badge className="bg-purple-100 text-purple-800">
                  <Lightning className="w-4 h-4 mr-1" />
                  Focus: {Math.round(focusBonus * 100)}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Money</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(gameState.money)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reputation</p>
              <Progress value={gameState.reputation} className="w-full mt-1" />
              <p className="text-sm font-semibold">{gameState.reputation}%</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {getWeatherIcon()}
              <div>
                <p className="text-sm font-semibold capitalize">{gameState.weather}</p>
                <p className="text-xs text-muted-foreground">{gameState.temperature}°F</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(gameState.totalProfit)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Phase Content */}
      {gamePhase === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Lemonade Stand!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Ready to start your business? Let's go shopping for ingredients!</p>
            {motionEnabled && (
              <Badge className="bg-blue-100 text-blue-800">
                <Share className="w-4 h-4 mr-1" />
                Motion controls enabled! Shake to mix, tilt to adjust price
              </Badge>
            )}
            <Button onClick={() => setGamePhase('shopping')} className="w-full">
              Start Day {gameState.day}
            </Button>
          </CardContent>
        </Card>
      )}

      {gamePhase === 'shopping' && (
        <Card>
          <CardHeader>
            <CardTitle>Buy Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries({
                lemons: { cost: 0.50, emoji: '🍋' },
                sugar: { cost: 0.25, emoji: '🍯' },
                ice: { cost: 0.10, emoji: '🧊' },
                cups: { cost: 0.05, emoji: '🥤' }
              }).map(([ingredient, data]) => (
                <div key={ingredient} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{data.emoji}</span>
                    <div>
                      <p className="font-semibold capitalize">{ingredient}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(data.cost)} each</p>
                      <p className="text-xs">Have: {gameState.ingredients[ingredient as keyof typeof gameState.ingredients]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => buyIngredients(ingredient as keyof GameState['ingredients'], 1)}
                      disabled={gameState.money < data.cost}
                    >
                      +1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => buyIngredients(ingredient as keyof GameState['ingredients'], 10)}
                      disabled={gameState.money < data.cost * 10}
                    >
                      +10
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setGamePhase('mixing')} className="w-full mt-4">
              Done Shopping - Mix Recipe
            </Button>
          </CardContent>
        </Card>
      )}

      {gamePhase === 'mixing' && (
        <Card className={isShaking ? 'animate-pulse border-yellow-400' : ''}>
          <CardHeader>
            <CardTitle>Mix Your Recipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {motionEnabled ? (
              <div className="text-center space-y-2">
                <p className="text-lg">🥤 Shake your device to mix!</p>
                <p className="text-sm text-muted-foreground">
                  Tilt left/right to adjust lemons, forward/back for sugar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(gameState.recipe).map(([ingredient, amount]) => (
                  <div key={ingredient} className="flex items-center justify-between">
                    <span className="capitalize">{ingredient.replace('PerCup', ' per cup')}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setGameState(prev => ({
                          ...prev,
                          recipe: {
                            ...prev.recipe,
                            [ingredient]: Math.max(0.5, amount - 0.1)
                          }
                        }))}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{amount.toFixed(1)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setGameState(prev => ({
                          ...prev,
                          recipe: {
                            ...prev.recipe,
                            [ingredient]: Math.min(3, amount + 0.1)
                          }
                        }))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-semibold">Recipe Quality: 
                <span className={`ml-2 ${gameState.reputation > 70 ? 'text-green-600' : gameState.reputation > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {gameState.reputation > 70 ? 'Excellent' : gameState.reputation > 40 ? 'Good' : 'Needs Work'}
                </span>
              </p>
            </div>
            
            <Button onClick={() => setGamePhase('selling')} className="w-full">
              Set Price & Open Stand
            </Button>
          </CardContent>
        </Card>
      )}

      {gamePhase === 'selling' && (
        <Card>
          <CardHeader>
            <CardTitle>Set Your Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{formatCurrency(gameState.price)}</p>
              <p className="text-sm text-muted-foreground">per cup</p>
            </div>
            
            {!motionEnabled && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setGameState(prev => ({ 
                    ...prev, 
                    price: Math.max(0.25, prev.price - 0.05) 
                  }))}
                >
                  -$0.05
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setGameState(prev => ({ 
                    ...prev, 
                    price: Math.min(2.00, prev.price + 0.05) 
                  }))}
                >
                  +$0.05
                </Button>
              </div>
            )}

            {motionEnabled && (
              <p className="text-center text-sm text-muted-foreground">
                Tilt your device up/down to adjust price
              </p>
            )}
            
            <Button onClick={simulateDay} className="w-full">
              Open for Business!
            </Button>
          </CardContent>
        </Card>
      )}

      {gamePhase === 'results' && (
        <Card>
          <CardHeader>
            <CardTitle>Day {gameState.day - 1} Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{gameState.customers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cups Sold</p>
                <p className="text-2xl font-bold">{gameState.cupsSold}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Profit</p>
                <p className={`text-2xl font-bold ${gameState.dailyProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(gameState.dailyProfit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reputation</p>
                <p className="text-2xl font-bold">{gameState.reputation}%</p>
              </div>
            </div>
            
            {focusBonus > 1 && (
              <Badge className="bg-purple-100 text-purple-800 justify-center w-full">
                <Lightning className="w-4 h-4 mr-1" />
                Great focus today! +20% efficiency bonus
              </Badge>
            )}
            
            <Button onClick={nextDay} className="w-full">
              {gameState.day >= 7 || gameState.money < 1 ? 'Finish Game' : `Continue to Day ${gameState.day + 1}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}