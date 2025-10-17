import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { 
  ArrowLeft, Building, TrendUp, TrendDown, Users, 
  Package, Megaphone, Trophy, Warning, CheckCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BusinessBuilderGameProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface BusinessMetrics {
  cash: number
  revenue: number
  expenses: number
  customers: number
  satisfaction: number
  monthlyGrowth: number
}

interface BusinessDecision {
  id: string
  month: number
  title: string
  description: string
  category: 'marketing' | 'product' | 'operations' | 'finance'
  options: {
    text: string
    cost: number
    impact: {
      revenue?: number
      expenses?: number
      customers?: number
      satisfaction?: number
    }
    explanation: string
  }[]
}

const businessDecisions: Omit<BusinessDecision, 'id' | 'month'>[] = [
  {
    title: 'Launch Marketing Campaign',
    description: 'You need to attract more customers. What\'s your strategy?',
    category: 'marketing',
    options: [
      {
        text: 'Expensive TV advertising campaign',
        cost: 5000,
        impact: { customers: 50, expenses: 500 },
        explanation: 'High cost, moderate customer acquisition. Better for established brands.'
      },
      {
        text: 'Social media and content marketing',
        cost: 1000,
        impact: { customers: 80, satisfaction: 5 },
        explanation: 'Cost-effective digital marketing with engaged audience. Smart choice!'
      },
      {
        text: 'Word-of-mouth only (no marketing)',
        cost: 0,
        impact: { customers: 10 },
        explanation: 'Minimal growth. In competitive markets, you need active marketing.'
      }
    ]
  },
  {
    title: 'Product Quality Decision',
    description: 'A supplier offers cheaper materials. What do you do?',
    category: 'product',
    options: [
      {
        text: 'Switch to cheaper materials',
        cost: 0,
        impact: { expenses: -300, satisfaction: -15, customers: -20 },
        explanation: 'Short-term savings, but quality drop loses customers and reputation.'
      },
      {
        text: 'Keep current quality',
        cost: 0,
        impact: { satisfaction: 5 },
        explanation: 'Maintaining quality preserves your reputation and customer loyalty.'
      },
      {
        text: 'Upgrade to premium materials',
        cost: 500,
        impact: { satisfaction: 15, revenue: 200, expenses: 100 },
        explanation: 'Higher costs but justifies premium pricing and builds brand value!'
      }
    ]
  },
  {
    title: 'Hiring Decision',
    description: 'Business is growing! You need help.',
    category: 'operations',
    options: [
      {
        text: 'Hire full-time employee',
        cost: 3000,
        impact: { customers: 40, satisfaction: 10, expenses: 800 },
        explanation: 'Fixed cost but reliable support. Good for sustainable growth.'
      },
      {
        text: 'Hire part-time contractors',
        cost: 1500,
        impact: { customers: 25, expenses: 400 },
        explanation: 'Flexible and cheaper, but less consistent service quality.'
      },
      {
        text: 'Work alone (no hire)',
        cost: 0,
        impact: { satisfaction: -10, customers: -15 },
        explanation: 'Overwhelmed owner leads to poor service and lost opportunities.'
      }
    ]
  },
  {
    title: 'Pricing Strategy',
    description: 'Competitors just lowered their prices. What\'s your move?',
    category: 'finance',
    options: [
      {
        text: 'Match their lower prices',
        cost: 0,
        impact: { revenue: -500, customers: 30, satisfaction: -5 },
        explanation: 'Price wars hurt everyone. Competes on price rather than value.'
      },
      {
        text: 'Keep your prices, emphasize quality',
        cost: 500,
        impact: { customers: 20, satisfaction: 15, revenue: 300 },
        explanation: 'Value-based positioning. Attracts customers who appreciate quality!'
      },
      {
        text: 'Raise prices to appear premium',
        cost: 0,
        impact: { revenue: 800, customers: -30, satisfaction: -10 },
        explanation: 'Risky move. Premium pricing needs premium product to back it up.'
      }
    ]
  },
  {
    title: 'Customer Service Crisis',
    description: 'Angry customer posted negative review. How do you respond?',
    category: 'operations',
    options: [
      {
        text: 'Ignore it and hope it goes away',
        cost: 0,
        impact: { satisfaction: -20, customers: -40 },
        explanation: 'Silence is seen as guilt. One negative review can spiral.'
      },
      {
        text: 'Argue publicly that they\'re wrong',
        cost: 0,
        impact: { satisfaction: -30, customers: -60 },
        explanation: 'Worst option! Public arguments damage reputation severely.'
      },
      {
        text: 'Apologize publicly, fix privately',
        cost: 200,
        impact: { satisfaction: 25, customers: 20 },
        explanation: 'Professional response shows you care. Turns critics into advocates!'
      }
    ]
  },
  {
    title: 'Expansion Opportunity',
    description: 'You can expand to a new location or invest in online presence.',
    category: 'finance',
    options: [
      {
        text: 'Open second physical location',
        cost: 10000,
        impact: { customers: 100, revenue: 1500, expenses: 1200 },
        explanation: 'High risk, high reward. Requires significant capital and management.'
      },
      {
        text: 'Build e-commerce website',
        cost: 3000,
        impact: { customers: 150, revenue: 1000, expenses: 300 },
        explanation: 'Lower cost, wider reach. Smart digital expansion!'
      },
      {
        text: 'Stay as-is and build reserves',
        cost: 0,
        impact: { satisfaction: 5 },
        explanation: 'Conservative approach. Missed growth opportunities but low risk.'
      }
    ]
  },
  {
    title: 'Technology Investment',
    description: 'New software could automate tasks but costs money to implement.',
    category: 'operations',
    options: [
      {
        text: 'Buy premium automation software',
        cost: 4000,
        impact: { expenses: -600, satisfaction: 10, customers: 30 },
        explanation: 'High upfront cost but long-term efficiency gains. Scales well!'
      },
      {
        text: 'Use free basic tools',
        cost: 0,
        impact: { expenses: -100 },
        explanation: 'Some savings but limited capabilities for growth.'
      },
      {
        text: 'Continue manual processes',
        cost: 0,
        impact: { expenses: 200, satisfaction: -10 },
        explanation: 'Inefficient as business grows. Time cost adds up.'
      }
    ]
  },
  {
    title: 'Cash Flow Challenge',
    description: 'Slow month. Bills are due but revenue is down. What do you do?',
    category: 'finance',
    options: [
      {
        text: 'Take out a high-interest loan',
        cost: 0,
        impact: { revenue: 3000, expenses: 500 },
        explanation: 'Expensive debt creates long-term burden. Last resort option.'
      },
      {
        text: 'Use emergency fund reserves',
        cost: 2000,
        impact: {},
        explanation: 'This is why emergency funds exist! Smart financial planning.'
      },
      {
        text: 'Delay paying suppliers',
        cost: 0,
        impact: { satisfaction: -15, expenses: 300 },
        explanation: 'Damages relationships and credibility. May add late fees.'
      }
    ]
  },
  {
    title: 'Community Engagement',
    description: 'Local charity asks you to sponsor their event.',
    category: 'marketing',
    options: [
      {
        text: 'Decline to save money',
        cost: 0,
        impact: {},
        explanation: 'Neutral but missed opportunity for community goodwill.'
      },
      {
        text: 'Small sponsorship ($500)',
        cost: 500,
        impact: { customers: 30, satisfaction: 10, revenue: 200 },
        explanation: 'Community engagement builds local loyalty and brand awareness!'
      },
      {
        text: 'Major sponsorship ($2000)',
        cost: 2000,
        impact: { customers: 80, satisfaction: 20, revenue: 500 },
        explanation: 'Significant investment with strong community impact if affordable.'
      }
    ]
  },
  {
    title: 'Competitive Threat',
    description: 'Major competitor opening nearby. How do you respond?',
    category: 'marketing',
    options: [
      {
        text: 'Panic and slash prices',
        cost: 0,
        impact: { revenue: -1000, customers: 20, satisfaction: -15 },
        explanation: 'Fear-based decision. Competing on price alone is unsustainable.'
      },
      {
        text: 'Focus on what makes you unique',
        cost: 1000,
        impact: { customers: 60, satisfaction: 20, revenue: 800 },
        explanation: 'Differentiation strategy! Customers choose you for unique value.'
      },
      {
        text: 'Do nothing different',
        cost: 0,
        impact: { customers: -50, revenue: -500 },
        explanation: 'Complacency is dangerous. Adapt or lose market share.'
      }
    ]
  }
]

export function BusinessBuilderGame({ onComplete, onExit, userTier = 'middle' }: BusinessBuilderGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [month, setMonth] = useState(1)
  const [maxMonths] = useState(10)
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    cash: 15000,
    revenue: 2000,
    expenses: 1500,
    customers: 50,
    satisfaction: 75,
    monthlyGrowth: 0
  })
  const [decisions, setDecisions] = useState<BusinessDecision[]>([])
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0)
  const [decisionHistory, setDecisionHistory] = useState<{ month: number, decision: string, choice: string, result: string }[]>([])
  const [showDecision, setShowDecision] = useState(false)
  const [score, setScore] = useState(0)

  const startGame = () => {
    const shuffled = [...businessDecisions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map((d, i) => ({
        ...d,
        id: `decision-${i}`,
        month: i + 1
      }))
    
    setDecisions(shuffled)
    setMonth(1)
    setCurrentDecisionIndex(0)
    setDecisionHistory([])
    setMetrics({
      cash: 15000,
      revenue: 2000,
      expenses: 1500,
      customers: 50,
      satisfaction: 75,
      monthlyGrowth: 0
    })
    setScore(0)
    setGameState('playing')
    setShowDecision(true)
    toast.success('Business Builder Started! Grow your business wisely.')
  }

  const makeDecision = (optionIndex: number) => {
    const decision = decisions[currentDecisionIndex]
    const option = decision.options[optionIndex]

    if (metrics.cash < option.cost) {
      toast.error('Insufficient cash for this option!')
      return
    }

    setMetrics(prev => {
      const newMetrics = {
        cash: prev.cash - option.cost + (option.impact.revenue || 0),
        revenue: prev.revenue + (option.impact.revenue || 0),
        expenses: prev.expenses + (option.impact.expenses || 0),
        customers: Math.max(0, prev.customers + (option.impact.customers || 0)),
        satisfaction: Math.max(0, Math.min(100, prev.satisfaction + (option.impact.satisfaction || 0))),
        monthlyGrowth: ((option.impact.customers || 0) / prev.customers) * 100
      }
      return newMetrics
    })

    const profit = (metrics.revenue - metrics.expenses) * (metrics.satisfaction / 100)
    setScore(prev => prev + Math.round(profit))

    setDecisionHistory(prev => [...prev, {
      month: month,
      decision: decision.title,
      choice: option.text,
      result: option.explanation
    }])

    toast.info(option.explanation)

    setShowDecision(false)
    
    setTimeout(() => {
      processMonthEnd()
    }, 2000)
  }

  const processMonthEnd = () => {
    setMetrics(prev => {
      const monthlyProfit = prev.revenue - prev.expenses
      const satisfactionMultiplier = prev.satisfaction / 100
      const actualProfit = monthlyProfit * satisfactionMultiplier
      
      return {
        ...prev,
        cash: prev.cash + actualProfit
      }
    })

    if (metrics.cash <= 0) {
      toast.error('Out of cash! Game Over')
      setGameState('ended')
      return
    }

    if (month >= maxMonths) {
      setGameState('ended')
      return
    }

    setMonth(prev => prev + 1)
    setCurrentDecisionIndex(prev => prev + 1)
    
    setTimeout(() => {
      setShowDecision(true)
    }, 1000)
  }

  if (gameState === 'ended') {
    const finalProfit = metrics.cash - 15000
    const profitPercent = (finalProfit / 15000) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {profitPercent > 50 ? '🏆' : profitPercent > 0 ? '🏢' : '📉'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Journey Complete!</h2>
              <p className="text-gray-600">
                {profitPercent > 50 ? 'Exceptional Growth!' : profitPercent > 0 ? 'Profitable Business!' : 'Learning Experience'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`rounded-xl p-4 border-2 ${finalProfit > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm text-gray-600 mb-1">Final Cash</div>
                <div className={`text-2xl font-bold ${finalProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${metrics.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className={`rounded-xl p-4 border-2 ${profitPercent > 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="text-sm text-gray-600 mb-1">Total Profit</div>
                <div className={`text-2xl font-bold ${profitPercent > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {profitPercent > 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Customers</div>
                <div className="text-2xl font-bold text-purple-600">{metrics.customers}</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <div className="text-sm text-gray-600 mb-1">Satisfaction</div>
                <div className="text-2xl font-bold text-orange-600">{metrics.satisfaction}%</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 mb-6 border max-h-48 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Business Decisions</h3>
              <div className="space-y-2">
                {decisionHistory.map((item, i) => (
                  <div key={i} className="text-sm p-2 rounded bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">Month {item.month}: {item.decision}</div>
                        <div className="text-xs text-gray-600 mt-1">{item.result}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-orange-900 mb-2">Key Business Lessons</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>✓ Customer satisfaction drives repeat business and growth</li>
                <li>✓ Smart investments pay off more than cutting costs</li>
                <li>✓ Cash flow management is critical for survival</li>
                <li>✓ Differentiation beats price competition</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={startGame} className="flex-1 bg-orange-600 hover:bg-orange-700">
                <Building className="w-4 h-4 mr-2" />
                New Business
              </Button>
              <Button onClick={() => onComplete(score, { finalCash: metrics.cash, customers: metrics.customers })} variant="outline" className="flex-1">
                <Trophy className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-white border-b shadow-sm p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <Building className="w-6 h-6 text-orange-600" />
              <h1 className="text-xl font-semibold">Business Builder</h1>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-6">🏢</div>
                <h2 className="text-2xl font-bold mb-4">Business Builder</h2>
                <p className="text-gray-600 mb-6">
                  Run your own business for 10 months! Make strategic decisions about marketing, operations, and finances. Keep customers happy and grow profitably!
                </p>

                <div className="bg-orange-50 rounded-xl p-6 mb-6 text-left">
                  <h3 className="font-semibold text-orange-900 mb-3">How to Play:</h3>
                  <ul className="text-sm text-orange-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Start with $15,000 cash and 50 customers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>Make decisions each month about your business</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>Balance growth, customer satisfaction, and cash flow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">4.</span>
                      <span>Grow your business profitably over 10 months!</span>
                    </li>
                  </ul>
                </div>

                <Button onClick={startGame} size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <Building className="w-5 h-5 mr-2" />
                  Start Business
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const currentDecision = decisions[currentDecisionIndex]
  const monthlyProfit = metrics.revenue - metrics.expenses

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white border-b shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <Building className="w-6 h-6 text-orange-600" />
              <h1 className="text-xl font-semibold">Business Builder</h1>
            </div>
          </div>
          
          <Badge variant="outline" className="text-base px-4 py-2">
            Month {month}/{maxMonths}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">Cash</div>
              <div className={`text-xl font-bold ${metrics.cash > 15000 ? 'text-green-600' : metrics.cash > 5000 ? 'text-blue-600' : 'text-red-600'}`}>
                ${metrics.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">Monthly Profit</div>
              <div className={`text-xl font-bold ${monthlyProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyProfit > 0 ? '+' : ''}${monthlyProfit.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">Customers</div>
              <div className="text-xl font-bold text-purple-600 flex items-center gap-1">
                <Users className="w-5 h-5" />
                {metrics.customers}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">Satisfaction</div>
              <div className="text-xl font-bold text-orange-600">
                {metrics.satisfaction}%
              </div>
              <Progress value={metrics.satisfaction} className="h-1 mt-1" />
            </CardContent>
          </Card>
        </div>

        {showDecision && currentDecision && (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl ${
                  currentDecision.category === 'marketing' ? 'bg-blue-100' :
                  currentDecision.category === 'product' ? 'bg-green-100' :
                  currentDecision.category === 'operations' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  {currentDecision.category === 'marketing' && <Megaphone className="w-6 h-6 text-blue-600" />}
                  {currentDecision.category === 'product' && <Package className="w-6 h-6 text-green-600" />}
                  {currentDecision.category === 'operations' && <Users className="w-6 h-6 text-purple-600" />}
                  {currentDecision.category === 'finance' && <TrendUp className="w-6 h-6 text-orange-600" />}
                </div>
                <div className="flex-1">
                  <Badge className="mb-2" variant="outline">
                    {currentDecision.category.charAt(0).toUpperCase() + currentDecision.category.slice(1)}
                  </Badge>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentDecision.title}</h3>
                  <p className="text-gray-600">{currentDecision.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {currentDecision.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => makeDecision(index)}
                    disabled={metrics.cash < option.cost}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-4 px-6 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 flex-shrink-0 mt-1">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">{option.text}</div>
                        <div className="text-sm text-gray-600">
                          Cost: ${option.cost.toLocaleString()}
                          {option.impact.revenue && ` • Revenue: +$${option.impact.revenue}`}
                          {option.impact.customers && ` • Customers: ${option.impact.customers > 0 ? '+' : ''}${option.impact.customers}`}
                          {option.impact.satisfaction && ` • Satisfaction: ${option.impact.satisfaction > 0 ? '+' : ''}${option.impact.satisfaction}%`}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 <strong>Business Tip:</strong> Consider both short-term cash flow and long-term customer relationships when making decisions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!showDecision && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing month...</h3>
              <p className="text-gray-600">Calculating results...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
