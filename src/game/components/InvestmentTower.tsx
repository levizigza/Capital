/**
 * Investment Tower - Stack different investment types to build wealth
 * Players drag and drop investment blocks, managing risk vs reward
 */

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendUp, TrendDown, Warning, Trophy, 
  ChartLine, CurrencyDollar, Lightning, Shield
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface InvestmentBlock {
  id: string
  type: 'savings' | 'bonds' | 'stocks' | 'crypto' | 'reits' | 'commodities'
  name: string
  expectedReturn: number
  risk: number
  color: string
  emoji: string
  value: number
  placed: boolean
  position?: { x: number; y: number }
}

interface InvestmentTowerProps {
  startingAmount: number
  targetGrowth: number
  timeLimit: number
  difficulty: 'easy' | 'medium' | 'hard'
  onComplete: (score: number, finalValue: number, timeSpent: number) => void
  onExit: () => void
}

export const InvestmentTower: React.FC<InvestmentTowerProps> = ({
  startingAmount,
  targetGrowth,
  timeLimit,
  difficulty,
  onComplete,
  onExit
}) => {
  const startTime = useRef(Date.now())
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [currentValue, setCurrentValue] = useState(startingAmount)
  const [gamePhase, setGamePhase] = useState<'playing' | 'won' | 'lost'>('playing')
  const [marketCondition, setMarketCondition] = useState<'bull' | 'bear' | 'volatile'>('bull')
  const [score, setScore] = useState(0)
  const dragRef = useRef<HTMLDivElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  
  const [availableBlocks, setAvailableBlocks] = useState<InvestmentBlock[]>([
    {
      id: 'savings-1',
      type: 'savings',
      name: 'High-Yield Savings',
      expectedReturn: 3,
      risk: 1,
      color: 'bg-green-500',
      emoji: '🏦',
      value: startingAmount * 0.2,
      placed: false
    },
    {
      id: 'bonds-1',
      type: 'bonds',
      name: 'Government Bonds',
      expectedReturn: 5,
      risk: 2,
      color: 'bg-blue-500',
      emoji: '🏛️',
      value: startingAmount * 0.3,
      placed: false
    },
    {
      id: 'stocks-1',
      type: 'stocks',
      name: 'Index Funds',
      expectedReturn: 8,
      risk: 4,
      color: 'bg-purple-500',
      emoji: '📈',
      value: startingAmount * 0.25,
      placed: false
    },
    {
      id: 'stocks-2',
      type: 'stocks',
      name: 'Growth Stocks',
      expectedReturn: 12,
      risk: 6,
      color: 'bg-indigo-500',
      emoji: '🚀',
      value: startingAmount * 0.15,
      placed: false
    },
    {
      id: 'reits-1',
      type: 'reits',
      name: 'Real Estate',
      expectedReturn: 9,
      risk: 5,
      color: 'bg-orange-500',
      emoji: '🏠',
      value: startingAmount * 0.2,
      placed: false
    },
    {
      id: 'crypto-1',
      type: 'crypto',
      name: 'Bitcoin',
      expectedReturn: 15,
      risk: 9,
      color: 'bg-yellow-500',
      emoji: '₿',
      value: startingAmount * 0.1,
      placed: false
    }
  ])
  
  const [placedBlocks, setPlacedBlocks] = useState<InvestmentBlock[]>([])

  // Game timer
  useEffect(() => {
    if (gamePhase !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGamePhase('lost')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gamePhase])

  // Market conditions change
  useEffect(() => {
    const marketTimer = setInterval(() => {
      const conditions: Array<'bull' | 'bear' | 'volatile'> = ['bull', 'bear', 'volatile']
      const newCondition = conditions[Math.floor(Math.random() * conditions.length)]
      setMarketCondition(newCondition)
      
      const conditionNames = {
        bull: 'Bull Market',
        bear: 'Bear Market', 
        volatile: 'Volatile Market'
      }
      
      toast.info(`Market Update: ${conditionNames[newCondition]}`, {
        duration: 2000
      })
    }, 15000)

    return () => clearInterval(marketTimer)
  }, [])

  // Calculate portfolio value with market effects
  useEffect(() => {
    const portfolioValue = placedBlocks.reduce((total, block) => {
      let adjustedReturn = block.expectedReturn
      
      // Apply market condition effects
      switch (marketCondition) {
        case 'bull':
          adjustedReturn *= block.risk > 5 ? 1.3 : 1.1
          break
        case 'bear':
          adjustedReturn *= block.risk > 5 ? 0.5 : 0.8
          break
        case 'volatile':
          adjustedReturn *= 0.7 + (Math.random() * 0.6) // 70% to 130%
          break
      }
      
      const yearlyGrowth = adjustedReturn / 100
      const timeElapsed = (timeLimit - timeLeft) / timeLimit
      const compoundGrowth = Math.pow(1 + yearlyGrowth, timeElapsed)
      
      return total + (block.value * compoundGrowth)
    }, startingAmount - placedBlocks.reduce((sum, b) => sum + b.value, 0))
    
    setCurrentValue(portfolioValue)
    
    // Check win condition
    if (portfolioValue >= startingAmount * (1 + targetGrowth / 100) && gamePhase === 'playing') {
      const timeSpent = Date.now() - startTime.current
      const timeBonus = Math.max(0, timeLeft * 50)
      const growthBonus = Math.max(0, (portfolioValue - startingAmount) * 0.1)
      const riskScore = calculateRiskScore()
      
      const finalScore = timeBonus + growthBonus + riskScore
      setScore(finalScore)
      setGamePhase('won')
      
      toast.success('Investment Goal Achieved!', {
        description: `Portfolio grew to $${portfolioValue.toLocaleString()}!`
      })
    }
  }, [placedBlocks, marketCondition, timeLeft, startingAmount, targetGrowth, gamePhase])

  const calculateRiskScore = () => {
    if (placedBlocks.length === 0) return 0
    
    const totalValue = placedBlocks.reduce((sum, b) => sum + b.value, 0)
    const weightedRisk = placedBlocks.reduce((sum, b) => sum + (b.risk * b.value / totalValue), 0)
    
    // Reward balanced portfolios (risk 4-6 is optimal)
    if (weightedRisk >= 4 && weightedRisk <= 6) return 1000
    if (weightedRisk >= 3 && weightedRisk <= 7) return 500
    return 100
  }

  const handleDragStart = (e: React.DragEvent, block: InvestmentBlock) => {
    e.dataTransfer.setData('text/plain', block.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const blockId = e.dataTransfer.getData('text/plain')
    const block = availableBlocks.find(b => b.id === blockId)
    
    if (block && !block.placed) {
      const remainingCash = startingAmount - placedBlocks.reduce((sum, b) => sum + b.value, 0)
      
      if (block.value <= remainingCash) {
        setAvailableBlocks(prev => 
          prev.map(b => b.id === blockId ? { ...b, placed: true } : b)
        )
        setPlacedBlocks(prev => [...prev, { ...block, placed: true }])
        
        toast.success(`Added ${block.name} to portfolio`, {
          description: `Invested $${block.value.toLocaleString()}`
        })
      } else {
        toast.error('Insufficient funds for this investment')
      }
    }
  }

  const removeBlock = (blockId: string) => {
    const block = placedBlocks.find(b => b.id === blockId)
    if (block) {
      setPlacedBlocks(prev => prev.filter(b => b.id !== blockId))
      setAvailableBlocks(prev => 
        prev.map(b => b.id === blockId ? { ...b, placed: false } : b)
      )
      toast.info(`Removed ${block.name} from portfolio`)
    }
  }

  const totalInvested = placedBlocks.reduce((sum, b) => sum + b.value, 0)
  const remainingCash = startingAmount - totalInvested
  const portfolioRisk = placedBlocks.length > 0 
    ? placedBlocks.reduce((sum, b) => sum + (b.risk * b.value / totalInvested), 0)
    : 0

  const targetValue = startingAmount * (1 + targetGrowth / 100)
  const progressPercent = Math.min(100, (currentValue / targetValue) * 100)

  if (gamePhase === 'won') {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">💰</div>
        <h2 className="text-3xl font-bold text-primary">Investment Success!</h2>
        <p className="text-lg text-muted-foreground">
          Your portfolio reached the target growth of {targetGrowth}%!
        </p>
        <div className="bg-card p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <div className="font-bold text-2xl">{score.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            <div>
              <TrendUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <div className="font-bold text-2xl">${currentValue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Portfolio Value</div>
            </div>
            <div>
              <Shield className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <div className="font-bold text-2xl">{portfolioRisk.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Risk Score</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Button onClick={() => onComplete(score, currentValue, Date.now() - startTime.current)} className="w-full">
            Continue
          </Button>
          <Button variant="outline" onClick={onExit} className="w-full">
            Play Again
          </Button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'lost') {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">⏰</div>
        <h2 className="text-3xl font-bold text-destructive">Time's Up!</h2>
        <p className="text-lg text-muted-foreground">
          Your portfolio value: ${currentValue.toLocaleString()} (Target: ${targetValue.toLocaleString()})
        </p>
        <div className="space-y-2">
          <Button variant="outline" onClick={onExit} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Investment Tower</h2>
          <p className="text-muted-foreground">
            Build a portfolio to reach ${targetValue.toLocaleString()} ({targetGrowth}% growth)
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
          <div className="text-sm text-muted-foreground">Time Left</div>
        </div>
      </div>

      {/* Market Condition Alert */}
      <Card className={`border-2 ${
        marketCondition === 'bull' ? 'border-green-500 bg-green-50' :
        marketCondition === 'bear' ? 'border-red-500 bg-red-50' :
        'border-yellow-500 bg-yellow-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {marketCondition === 'bull' ? <TrendUp className="w-6 h-6 text-green-600" /> :
             marketCondition === 'bear' ? <TrendDown className="w-6 h-6 text-red-600" /> :
             <Lightning className="w-6 h-6 text-yellow-600" />}
            <div>
              <div className="font-semibold">
                {marketCondition === 'bull' ? '🐂 Bull Market' :
                 marketCondition === 'bear' ? '🐻 Bear Market' :
                 '⚡ Volatile Market'}
              </div>
              <div className="text-sm text-muted-foreground">
                {marketCondition === 'bull' ? 'High-risk investments performing well' :
                 marketCondition === 'bear' ? 'Safe investments outperforming risky ones' :
                 'Unpredictable returns across all investments'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Portfolio Performance</span>
            <Badge variant={progressPercent >= 100 ? "default" : "secondary"}>
              ${currentValue.toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Goal</span>
                <span>{progressPercent.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <CurrencyDollar className="w-6 h-6 mx-auto text-green-500 mb-1" />
                <div className="font-bold">${remainingCash.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Available Cash</div>
              </div>
              <div>
                <ChartLine className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                <div className="font-bold">${totalInvested.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Invested</div>
              </div>
              <div>
                <Warning className="w-6 h-6 mx-auto text-orange-500 mb-1" />
                <div className="font-bold">{portfolioRisk.toFixed(1)}/10</div>
                <div className="text-xs text-muted-foreground">Risk Level</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Investments */}
        <Card>
          <CardHeader>
            <CardTitle>Available Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableBlocks.filter(b => !b.placed).map(block => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, block)}
                  className={`p-4 rounded-lg cursor-move border-2 border-dashed hover:border-solid transition-all ${block.color} text-white`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{block.emoji}</span>
                      <div>
                        <div className="font-semibold">{block.name}</div>
                        <div className="text-sm opacity-90">
                          ${block.value.toLocaleString()} • {block.expectedReturn}% return
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">Risk: {block.risk}/10</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio (Drop Zone) */}
        <Card>
          <CardHeader>
            <CardTitle>Your Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="min-h-[300px] border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 space-y-3"
            >
              {placedBlocks.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>Drag investments here to build your portfolio</p>
                </div>
              ) : (
                placedBlocks.map(block => (
                  <div
                    key={block.id}
                    className={`p-3 rounded-lg ${block.color} text-white cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => removeBlock(block.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{block.emoji}</span>
                        <div>
                          <div className="font-semibold text-sm">{block.name}</div>
                          <div className="text-xs opacity-90">
                            ${block.value.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs">Click to remove</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}