/**
 * Compound Growth - Interactive visualization of compound interest
 * Players adjust investment parameters and watch money grow in real-time
 */

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from 'recharts'
import { 
  TrendUp, Trophy, Target, Coins, 
  Lightning, Clock, Calculator, Star
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CompoundGrowthProps {
  targetAmount?: number
  timeLimit?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
}

interface InvestmentData {
  year: number
  principal: number
  interest: number
  total: number
}

export const CompoundGrowth: React.FC<CompoundGrowthProps> = ({
  targetAmount = 10000,
  timeLimit = 300,
  difficulty = 'medium',
  onComplete,
  onExit
}) => {
  const startTime = useRef(Date.now())
  const animationRef = useRef<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gamePhase, setGamePhase] = useState<'playing' | 'won' | 'lost'>('playing')
  
  // Investment parameters
  const [initialAmount, setInitialAmount] = useState([1000])
  const [monthlyContribution, setMonthlyContribution] = useState([100])
  const [interestRate, setInterestRate] = useState([7])
  const [investmentYears, setInvestmentYears] = useState([10])
  
  // Animation and visualization
  const [animatedAmount, setAnimatedAmount] = useState(0)
  const [growthData, setGrowthData] = useState<InvestmentData[]>([])
  const [currentYear, setCurrentYear] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

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

  // Calculate compound growth data
  const calculateGrowth = () => {
    const data: InvestmentData[] = []
    const initial = initialAmount[0]
    const monthly = monthlyContribution[0]
    const rate = interestRate[0] / 100
    const years = investmentYears[0]
    
    let principal = initial
    let totalAmount = initial
    
    for (let year = 0; year <= years; year++) {
      const yearlyContributions = monthly * 12
      const interestEarned = totalAmount * rate
      
      if (year > 0) {
        principal += yearlyContributions
        totalAmount += yearlyContributions + interestEarned
      }
      
      data.push({
        year,
        principal: Math.round(principal),
        interest: Math.round(totalAmount - principal),
        total: Math.round(totalAmount)
      })
    }
    
    return data
  }

  // Update growth data when parameters change
  useEffect(() => {
    const data = calculateGrowth()
    setGrowthData(data)
    setAnimatedAmount(data[data.length - 1]?.total || 0)
    
    // Check win condition
    const finalAmount = data[data.length - 1]?.total || 0
    if (finalAmount >= targetAmount && gamePhase === 'playing') {
      const timeSpent = Date.now() - startTime.current
      const timeBonus = Math.max(0, timeLeft * 50)
      const efficiencyBonus = finalAmount > targetAmount * 1.5 ? 1000 : finalAmount > targetAmount * 1.2 ? 500 : 200
      
      const finalScore = timeBonus + efficiencyBonus
      setScore(finalScore)
      setGamePhase('won')
      
      toast.success('Target Reached!', {
        description: `Your investment will grow to $${finalAmount.toLocaleString()}!`
      })
    }
  }, [initialAmount, monthlyContribution, interestRate, investmentYears, targetAmount, gamePhase, timeLeft])

  // Animation for real-time growth visualization
  const playGrowthAnimation = () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    setCurrentYear(0)
    setAnimatedAmount(initialAmount[0])
    
    const data = growthData
    let yearIndex = 0
    
    const animate = () => {
      if (yearIndex < data.length - 1) {
        yearIndex++
        setCurrentYear(yearIndex)
        
        // Animate the amount growing
        const targetAmount = data[yearIndex].total
        const currentAmount = data[yearIndex - 1].total
        const difference = targetAmount - currentAmount
        
        let step = 0
        const steps = 20
        const increment = difference / steps
        
        const stepAnimation = () => {
          if (step < steps) {
            setAnimatedAmount(currentAmount + (increment * step))
            step++
            setTimeout(stepAnimation, 50)
          } else {
            setAnimatedAmount(targetAmount)
            setTimeout(animate, 200)
          }
        }
        
        stepAnimation()
      } else {
        setIsPlaying(false)
      }
    }
    
    animate()
  }

  const finalAmount = growthData[growthData.length - 1]?.total || 0
  const totalContributions = growthData[growthData.length - 1]?.principal || 0
  const totalInterest = finalAmount - totalContributions
  const interestRatio = totalContributions > 0 ? (totalInterest / totalContributions) * 100 : 0

  if (gamePhase === 'won') {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">📈</div>
        <h2 className="text-3xl font-bold text-primary">Investment Mastery!</h2>
        <p className="text-lg text-muted-foreground">
          You've created a plan to reach ${targetAmount.toLocaleString()}!
        </p>
        <div className="bg-card p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <div className="font-bold text-2xl">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div>
              <TrendUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <div className="font-bold text-2xl">${finalAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Final Amount</div>
            </div>
            <div>
              <Lightning className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <div className="font-bold text-2xl">{interestRatio.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Interest Ratio</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Button onClick={() => onComplete(score, {
            finalAmount,
            timeSpent: Date.now() - startTime.current,
            initialAmount: initialAmount[0],
            monthlyContribution: monthlyContribution[0],
            interestRate: interestRate[0],
            investmentYears: investmentYears[0]
          })} className="w-full">
            Continue
          </Button>
          <Button variant="outline" onClick={onExit} className="w-full">
            Try Different Strategy
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
          Your plan would reach ${finalAmount.toLocaleString()} (Target: ${targetAmount.toLocaleString()})
        </p>
        <div className="space-y-2">
          <Button variant="outline" onClick={onExit} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const progressPercent = Math.min(100, (finalAmount / targetAmount) * 100)

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Compound Growth Challenge</h2>
          <p className="text-muted-foreground">
            Create an investment plan to reach ${targetAmount.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
          <div className="text-sm text-muted-foreground">Time Left</div>
        </div>
      </div>

      {/* Progress to Target */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Progress to Target</span>
            <Badge variant={progressPercent >= 100 ? "default" : "secondary"}>
              ${finalAmount.toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Target Achievement</span>
                <span>{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="relative">
                <div className="w-full bg-secondary rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${
                      progressPercent >= 100 ? 'bg-green-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    ${animatedAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Coins className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                <div className="font-bold">${totalContributions.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Your Money</div>
              </div>
              <div>
                <TrendUp className="w-6 h-6 mx-auto text-green-500 mb-1" />
                <div className="font-bold">${totalInterest.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Compound Interest</div>
              </div>
              <div>
                <Target className="w-6 h-6 mx-auto text-purple-500 mb-1" />
                <div className="font-bold">{investmentYears[0]} years</div>
                <div className="text-xs text-muted-foreground">Time Period</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Initial Investment</label>
                <span className="text-sm text-muted-foreground">${initialAmount[0].toLocaleString()}</span>
              </div>
              <Slider
                value={initialAmount}
                onValueChange={setInitialAmount}
                max={50000}
                min={100}
                step={100}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Monthly Contribution</label>
                <span className="text-sm text-muted-foreground">${monthlyContribution[0]}</span>
              </div>
              <Slider
                value={monthlyContribution}
                onValueChange={setMonthlyContribution}
                max={2000}
                min={0}
                step={25}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Annual Return</label>
                <span className="text-sm text-muted-foreground">{interestRate[0]}%</span>
              </div>
              <Slider
                value={interestRate}
                onValueChange={setInterestRate}
                max={15}
                min={1}
                step={0.5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Investment Period</label>
                <span className="text-sm text-muted-foreground">{investmentYears[0]} years</span>
              </div>
              <Slider
                value={investmentYears}
                onValueChange={setInvestmentYears}
                max={40}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            <Button 
              onClick={playGrowthAnimation} 
              disabled={isPlaying}
              className="w-full"
              variant="outline"
            >
              {isPlaying ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Animating Year {currentYear}...
                </>
              ) : (
                <>
                  <Lightning className="w-4 h-4 mr-2" />
                  Watch Growth Animation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`,
                      name === 'total' ? 'Total Value' : 
                      name === 'principal' ? 'Your Contributions' : 'Interest Earned'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="principal" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="principal"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year-by-Year Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Compound Interest Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name === 'principal' ? 'Your Money' : 'Interest Earned'
                  ]}
                />
                <Bar dataKey="principal" stackId="a" fill="#3b82f6" />
                <Bar dataKey="interest" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Learning Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Compound Interest Secrets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">Start Early</span>
              </div>
              <p className="text-muted-foreground">
                Time is your biggest advantage. Starting 10 years earlier can double your final amount!
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">Consistency Wins</span>
              </div>
              <p className="text-muted-foreground">
                Regular monthly contributions often matter more than the initial amount.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">Patience Pays</span>
              </div>
              <p className="text-muted-foreground">
                The magic happens in the later years when interest earns interest.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}