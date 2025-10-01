/**
 * Advanced Game Engine Component - Integrates with React and provides sophisticated gameplay
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { GameEngine, GameEntity } from '../GameEngine'
import { EconomicSystem, MarketCondition } from '../systems/EconomicSystem'
import { ProgressionSystem, SkillNode, Achievement } from '../systems/ProgressionSystem'
import { GameScenario, GameEvent } from '../../data/gameData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendUp, TrendDown, Warning, Trophy, Brain, CurrencyDollar } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AdvancedGameEngineProps {
  scenario: GameScenario
  playerId: string
  onComplete: (results: GameResults) => void
  onExit: () => void
}

interface GameResults {
  success: boolean
  finalNetWorth: number
  xpEarned: number
  coinsEarned: number
  achievementsUnlocked: string[]
  timeSpent: number
  decisions: Array<{
    eventId: string
    choice: number
    outcome: string
  }>
}

interface GameState {
  cash: number
  income: number
  expenses: number
  assets: Array<{
    type: string
    name: string
    value: number
    risk: number
    returns: number
  }>
  liabilities: Array<{
    type: string
    name: string
    balance: number
    interestRate: number
    minimumPayment: number
  }>
  time: number
  currentEvent?: GameEvent
  netWorthHistory: Array<{ time: number; netWorth: number }>
}

export const AdvancedGameEngine: React.FC<AdvancedGameEngineProps> = ({
  scenario,
  playerId,
  onComplete,
  onExit
}) => {
  const [gameEngine] = useState(() => new GameEngine())
  const [economicSystem] = useState(() => new EconomicSystem())
  const [progressionSystem] = useState(() => new ProgressionSystem())
  const [gameState, setGameState] = useState<GameState>(() => ({
    cash: scenario.initialConditions?.cash || 0,
    income: scenario.initialConditions?.income || 0,
    expenses: scenario.initialConditions?.expenses || 0,
    assets: scenario.initialConditions?.assets || [],
    liabilities: scenario.initialConditions?.liabilities || [],
    time: 0,
    netWorthHistory: []
  }))
  const [marketConditions, setMarketConditions] = useState<MarketCondition>()
  const [gameStartTime] = useState(Date.now())
  const [decisions, setDecisions] = useState<GameResults['decisions']>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(0)

  // Initialize game engine
  useEffect(() => {
    // Create player entity
    const playerEntity = gameEngine.createEntity(playerId)
    
    // Add components
    gameEngine.addComponent(playerId, {
      type: 'economy',
      data: { conditions: null }
    })
    
    gameEngine.addComponent(playerId, {
      type: 'progression',
      data: {
        level: 1,
        xp: 0,
        skillPoints: 0
      }
    })
    
    gameEngine.addComponent(playerId, {
      type: 'stats',
      data: {
        totalCoins: gameState.cash,
        savings: gameState.cash,
        bonuses: {
          incomeBoost: 0,
          expenseReduction: 0,
          investmentReturns: 0,
          riskTolerance: 0
        }
      }
    })

    // Add systems
    gameEngine.addSystem(economicSystem)
    gameEngine.addSystem(progressionSystem)

    // Set up event listeners
    gameEngine.addEventListener('economicEvent', handleEconomicEvent)
    gameEngine.addEventListener('levelUp', handleLevelUp)
    gameEngine.addEventListener('achievementUnlocked', handleAchievementUnlocked)

    // Start game engine
    gameEngine.start()

    return () => {
      gameEngine.stop()
    }
  }, [])

  // Calculate net worth
  const calculateNetWorth = useCallback(() => {
    const assetValue = gameState.assets.reduce((sum, asset) => sum + asset.value, 0)
    const liabilityValue = gameState.liabilities.reduce((sum, liability) => sum + liability.balance, 0)
    return gameState.cash + assetValue - liabilityValue
  }, [gameState])

  // Update game state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.time + 1000
        const netWorth = calculateNetWorth()
        
        // Update net worth history
        const newHistory = [...prev.netWorthHistory]
        if (newHistory.length === 0 || newTime % 5000 === 0) { // Every 5 seconds
          newHistory.push({ time: newTime / 1000, netWorth })
          if (newHistory.length > 20) newHistory.shift() // Keep last 20 points
        }

        // Apply income and expenses (every 30 seconds = 1 month in game)
        if (newTime % 30000 === 0) {
          const monthlyIncome = prev.income
          const monthlyExpenses = prev.expenses
          const netCashFlow = monthlyIncome - monthlyExpenses
          
          return {
            ...prev,
            time: newTime,
            cash: Math.max(0, prev.cash + netCashFlow),
            netWorthHistory: newHistory
          }
        }

        return {
          ...prev,
          time: newTime,
          netWorthHistory: newHistory
        }
      })

      // Trigger time-based events
      const currentEvent = (scenario.events || []).find(event => 
        event.trigger === 'time' && 
        event.triggerValue === gameState.time &&
        !gameState.currentEvent
      )
      
      if (currentEvent) {
        setGameState(prev => ({ ...prev, currentEvent }))
      }

      // Check win conditions
      const netWorth = calculateNetWorth()
      const winConditionMet = (scenario.winConditions || []).some(condition => {
        switch (condition.type) {
          case 'net_worth':
            return netWorth >= condition.target
          case 'cash_flow':
            return (gameState.income - gameState.expenses) >= condition.target
          case 'time_survival':
            return gameState.time >= condition.target
          default:
            return false
        }
      })

      if (winConditionMet) {
        handleGameComplete(true)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState, scenario, calculateNetWorth])

  // Event handlers
  const handleEconomicEvent = (data: any) => {
    setMarketConditions(data.conditions)
    toast.info(`Economic Event: ${data.conditions.economicEvent?.name}`, {
      description: data.conditions.economicEvent?.description
    })
  }

  const handleLevelUp = (data: any) => {
    toast.success(`Level Up! You're now level ${data.newLevel}!`, {
      description: `+${data.skillPointsGained} skill points earned`
    })
  }

  const handleAchievementUnlocked = (data: any) => {
    toast.success(`Achievement Unlocked: ${data.achievement.name}!`, {
      description: data.achievement.description
    })
  }

  const handleEventChoice = (choiceIndex: number) => {
    const currentEvent = gameState.currentEvent
    if (!currentEvent || !currentEvent.choices) return

    const choice = currentEvent.choices[choiceIndex]
    if (!choice) return
    
    const consequences = choice.consequences

    // Record decision
    setDecisions(prev => [...prev, {
      eventId: currentEvent.id,
      choice: choiceIndex,
      outcome: choice.learningNote
    }])

    // Apply consequences
    setGameState(prev => {
      let newState = { ...prev, currentEvent: undefined }

      if (consequences.cash) {
        newState.cash = Math.max(0, newState.cash + consequences.cash)
      }
      if (consequences.income) {
        newState.income = Math.max(0, newState.income + consequences.income)
      }
      if (consequences.expenses) {
        newState.expenses = Math.max(0, newState.expenses + consequences.expenses)
      }
      if (consequences.assets) {
        newState.assets = newState.assets.map(asset => {
          const assetChange = consequences.assets?.find(change => change.type === asset.type)
          if (assetChange) {
            return {
              ...asset,
              value: Math.max(0, asset.value + assetChange.change)
            }
          }
          return asset
        })
      }
      if (consequences.liabilities) {
        newState.liabilities = newState.liabilities.map(liability => {
          const liabilityChange = consequences.liabilities?.find(change => change.type === liability.type)
          if (liabilityChange) {
            return {
              ...liability,
              balance: Math.max(0, liability.balance + liabilityChange.change)
            }
          }
          return liability
        })
      }

      return newState
    })

    toast.info(choice.learningNote, { duration: 4000 })
  }

  const handleGameComplete = (success: boolean) => {
    const timeSpent = Date.now() - gameStartTime
    const netWorth = calculateNetWorth()
    
    const results: GameResults = {
      success,
      finalNetWorth: netWorth,
      xpEarned: scenario.rewards.xp,
      coinsEarned: scenario.rewards.coins,
      achievementsUnlocked: scenario.rewards.achievements || [],
      timeSpent,
      decisions
    }

    onComplete(results)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const netWorth = calculateNetWorth()
  const monthlyNetIncome = gameState.income - gameState.expenses

  return (
    <div className="space-y-6">
      {/* Header with key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className={`text-lg font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netWorth)}
                </p>
              </div>
              <CurrencyDollar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Flow</p>
                <p className={`text-lg font-bold ${monthlyNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(monthlyNetIncome)}
                </p>
              </div>
              {monthlyNetIncome >= 0 ? (
                <TrendUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Cash</p>
                <p className="text-lg font-bold">{formatCurrency(gameState.cash)}</p>
              </div>
              <Brain className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Elapsed</p>
                <p className="text-lg font-bold">{formatTime(gameState.time)}</p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Economic conditions alert */}
      {marketConditions?.economicEvent && (
        <Alert className="border-amber-200 bg-amber-50">
          <Warning className="h-4 w-4" />
          <AlertDescription>
            <strong>{marketConditions.economicEvent.name}:</strong> {marketConditions.economicEvent.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Current event */}
      {gameState.currentEvent && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warning className="w-5 h-5" />
              {gameState.currentEvent.title}
            </CardTitle>
            <CardDescription>{gameState.currentEvent.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(gameState.currentEvent.choices || []).map((choice, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => handleEventChoice(index)}
                >
                  <div>
                    <div className="font-medium">{choice.text}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {choice.learningNote}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Net worth chart */}
      <Card>
        <CardHeader>
          <CardTitle>Net Worth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gameState.netWorthHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line 
                  type="monotone" 
                  dataKey="netWorth" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Win conditions progress */}
      <Card>
        <CardHeader>
          <CardTitle>Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(scenario.winConditions || []).map((condition, index) => {
              let progress = 0
              let current = 0
              
              switch (condition.type) {
                case 'net_worth':
                  current = netWorth
                  progress = (netWorth / condition.target) * 100
                  break
                case 'cash_flow':
                  current = monthlyNetIncome
                  progress = (monthlyNetIncome / condition.target) * 100
                  break
                case 'time_survival':
                  current = gameState.time / 1000
                  progress = (gameState.time / condition.target) * 100
                  break
              }

              progress = Math.min(100, Math.max(0, progress))

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{condition.description}</span>
                    <span className={progress >= 100 ? 'text-green-600 font-bold' : 'text-muted-foreground'}>
                      {condition.type === 'time_survival' 
                        ? `${Math.floor(current)}s / ${condition.target}s`
                        : `${formatCurrency(current)} / ${formatCurrency(condition.target)}`
                      }
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Game controls */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onExit}>
          Exit Game
        </Button>
        <Button onClick={() => handleGameComplete(true)} disabled={!(scenario.winConditions || []).some(condition => {
          switch (condition.type) {
            case 'net_worth':
              return netWorth >= condition.target
            case 'cash_flow':
              return monthlyNetIncome >= condition.target
            case 'time_survival':
              return gameState.time >= condition.target
            default:
              return false
          }
        })}>
          Complete Game
        </Button>
      </div>
    </div>
  )
}