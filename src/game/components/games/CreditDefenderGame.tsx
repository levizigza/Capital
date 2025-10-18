import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CreditCard, Warning, ShieldCheck, Trophy, X, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CreditDefenderGameProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

interface Decision {
  id: string
  text: string
  type: 'payment' | 'utilization' | 'inquiry' | 'length' | 'mix'
  choices: {
    text: string
    impact: number
    explanation: string
    isGood: boolean
  }[]
  position: number
}

const creditDecisions: Omit<Decision, 'id' | 'position'>[] = [
  {
    text: 'Your credit card bill is due. You have $500 available and owe $600.',
    type: 'payment',
    choices: [
      { text: 'Pay the $50 minimum', impact: -15, explanation: 'Only making minimum payments increases debt and shows poor credit management', isGood: false },
      { text: 'Pay $500 and carry $100 balance', impact: -5, explanation: 'Partial payment is better than minimum, but carrying a balance still costs you', isGood: false },
      { text: 'Ask family for help to pay in full', impact: 10, explanation: 'Paying in full avoids interest and protects your payment history', isGood: true }
    ]
  },
  {
    text: 'You want to buy a new phone. Your credit card limit is $2,000 and you have a $400 balance.',
    type: 'utilization',
    choices: [
      { text: 'Charge $1,500 phone to card', impact: -20, explanation: 'High utilization (95%) severely damages your credit score', isGood: false },
      { text: 'Charge $800 phone to card', impact: -10, explanation: 'This brings utilization to 60%, which is too high (aim for under 30%)', isGood: false },
      { text: 'Save up and buy with cash', impact: 15, explanation: 'Keeps utilization low (20%) and avoids unnecessary debt', isGood: true }
    ]
  },
  {
    text: 'Three stores offer you credit cards with sign-up bonuses.',
    type: 'inquiry',
    choices: [
      { text: 'Apply for all three', impact: -25, explanation: 'Multiple hard inquiries in short time signals financial desperation', isGood: false },
      { text: 'Apply for one with best terms', impact: -5, explanation: 'One inquiry has minimal temporary impact if you really need it', isGood: false },
      { text: 'Skip them all', impact: 10, explanation: 'Unnecessary applications hurt your score and tempt overspending', isGood: true }
    ]
  },
  {
    text: 'Your oldest credit card has a $25 annual fee. You rarely use it.',
    type: 'length',
    choices: [
      { text: 'Close the account', impact: -15, explanation: 'Closing your oldest card reduces average account age', isGood: false },
      { text: 'Keep it and use occasionally', impact: 15, explanation: 'Maintaining old accounts builds credit history length', isGood: true },
      { text: 'Leave it completely unused', impact: 5, explanation: 'Better than closing, but issuer might close inactive accounts', isGood: false }
    ]
  },
  {
    text: 'You need a loan. You have good credit and $5,000 saved.',
    type: 'payment',
    choices: [
      { text: 'Get a personal loan for $10,000', impact: -10, explanation: 'Taking on unnecessary debt for wants rather than needs', isGood: false },
      { text: 'Use your savings instead', impact: 20, explanation: 'Using savings avoids interest and builds financial discipline', isGood: true },
      { text: 'Get a loan and keep savings', impact: -5, explanation: 'Paying interest while having savings available is poor financial planning', isGood: false }
    ]
  },
  {
    text: 'Your credit card company increased your limit from $2,000 to $4,000.',
    type: 'utilization',
    choices: [
      { text: 'Celebrate by spending more', impact: -20, explanation: 'Higher limit is opportunity for better utilization, not to spend more', isGood: false },
      { text: 'Keep same spending habits', impact: 20, explanation: 'Same balance with higher limit improves utilization ratio!', isGood: true },
      { text: 'Ask them to reverse it', impact: 0, explanation: 'No benefit to reducing your available credit', isGood: false }
    ]
  },
  {
    text: 'You have a chance to become an authorized user on your parent\'s excellent credit card.',
    type: 'mix',
    choices: [
      { text: 'Decline the offer', impact: 0, explanation: 'Missed opportunity to benefit from their good credit history', isGood: false },
      { text: 'Accept and use it heavily', impact: -10, explanation: 'Their good history helps, but overspending hurts both of you', isGood: false },
      { text: 'Accept and use responsibly', impact: 15, explanation: 'Authorized user status can boost your score with their positive history', isGood: true }
    ]
  },
  {
    text: 'You\'re 3 days late on a $50 credit card payment.',
    type: 'payment',
    choices: [
      { text: 'Pay it within 30 days', impact: 5, explanation: 'Payments under 30 days late typically not reported to bureaus', isGood: true },
      { text: 'Wait until next month', impact: -30, explanation: '30+ days late creates a serious negative mark on your report', isGood: false },
      { text: 'Ignore it completely', impact: -50, explanation: 'Severely damages payment history, the most important factor', isGood: false }
    ]
  },
  {
    text: 'A store offers 20% off if you open their credit card today.',
    type: 'inquiry',
    choices: [
      { text: 'Open it for the discount', impact: -15, explanation: 'Hard inquiry + new account + temptation to overspend', isGood: false },
      { text: 'Negotiate discount without card', impact: 10, explanation: 'Smart shopping without credit damage', isGood: true },
      { text: 'Open it and close after', impact: -25, explanation: 'Worst option: inquiry damage + reduced credit history', isGood: false }
    ]
  },
  {
    text: 'You have 2 credit cards with balances. Card A: $500/$2000. Card B: $1500/$3000.',
    type: 'utilization',
    choices: [
      { text: 'Pay minimum on both', impact: -15, explanation: 'High overall utilization (40%) and accruing interest', isGood: false },
      { text: 'Pay off Card A completely', impact: 10, explanation: 'Good, but Card B still has 50% utilization', isGood: false },
      { text: 'Pay both to under 30% each', impact: 20, explanation: 'Optimal strategy: per-card and overall utilization both under 30%', isGood: true }
    ]
  }
]

export function CreditDefenderGame({ onComplete, onExit, userTier = 'middle' }: CreditDefenderGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready')
  const [creditScore, setCreditScore] = useState(650)
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [decisionHistory, setDecisionHistory] = useState<{ decision: string, choice: string, impact: number, explanation: string }[]>([])
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)

  const startGame = () => {
    const shuffled = [...creditDecisions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)
      .map((d, i) => ({
        ...d,
        id: `decision-${i}`,
        position: i
      }))
    
    setDecisions(shuffled)
    setCreditScore(650)
    setCurrentDecisionIndex(0)
    setDecisionHistory([])
    setLives(3)
    setScore(0)
    setGameState('playing')
    toast.success('Credit Score Defender Started! Make wise choices!')
  }

  const makeChoice = (choiceIndex: number) => {
    const currentDecision = decisions[currentDecisionIndex]
    const choice = currentDecision.choices[choiceIndex]
    
    const newScore = Math.max(300, Math.min(850, creditScore + choice.impact))
    setCreditScore(newScore)

    if (!choice.isGood) {
      setLives(prev => prev - 1)
      toast.error(choice.explanation)
    } else {
      toast.success(choice.explanation)
    }

    setDecisionHistory(prev => [...prev, {
      decision: currentDecision.text,
      choice: choice.text,
      impact: choice.impact,
      explanation: choice.explanation
    }])

    const pointsEarned = choice.isGood ? 100 : 0
    setScore(prev => prev + pointsEarned)

    setTimeout(() => {
      if (lives <= 1 && !choice.isGood) {
        setGameState('ended')
      } else if (currentDecisionIndex >= decisions.length - 1) {
        setGameState('ended')
      } else {
        setCurrentDecisionIndex(prev => prev + 1)
      }
    }, 2000)
  }

  const getCreditRating = (score: number) => {
    if (score >= 800) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 740) return { text: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (score >= 670) return { text: 'Good', color: 'text-purple-600', bg: 'bg-purple-50' }
    if (score >= 580) return { text: 'Fair', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { text: 'Poor', color: 'text-red-600', bg: 'bg-red-50' }
  }

  if (gameState === 'ended') {
    const rating = getCreditRating(creditScore)
    const finalScore = creditScore + score

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {creditScore >= 740 ? '🏆' : creditScore >= 670 ? '⭐' : '📊'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Complete!</h2>
              <p className="text-gray-600">
                {lives > 0 ? 'You successfully managed your credit!' : 'Learning experience - try again!'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`${rating.bg} rounded-xl p-4 border-2 border-current ${rating.color}`}>
                <div className="text-sm mb-1">Final Credit Score</div>
                <div className="text-3xl font-bold">{creditScore}</div>
                <div className="text-sm font-semibold mt-1">{rating.text}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Total Points</div>
                <div className="text-3xl font-bold text-blue-600">{finalScore}</div>
                <div className="text-sm text-blue-600 mt-1">Score + Credit</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 mb-6 border">
              <h3 className="font-semibold text-gray-900 mb-3">Your Decisions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {decisionHistory.map((item, i) => (
                  <div key={i} className={`text-sm p-2 rounded ${item.impact > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-start gap-2">
                      {item.impact > 0 ? (
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold">{item.choice}</div>
                        <div className="text-xs text-gray-600 mt-1">{item.explanation}</div>
                      </div>
                      <div className={`font-bold ${item.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.impact > 0 ? '+' : ''}{item.impact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-purple-900 mb-2">Credit Score Factors</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>✓ Payment History (35%) - Most important factor</li>
                <li>✓ Credit Utilization (30%) - Keep below 30%</li>
                <li>✓ Credit History Length (15%) - Keep old accounts open</li>
                <li>✓ Credit Mix (10%) - Variety of credit types</li>
                <li>✓ New Credit (10%) - Limit hard inquiries</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={startGame} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={() => onComplete(finalScore, { creditScore, lives })} variant="outline" className="flex-1">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="bg-white border-b shadow-sm p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold">Credit Score Defender</h1>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-6">🛡️</div>
                <h2 className="text-2xl font-bold mb-4">Credit Score Defender</h2>
                <p className="text-gray-600 mb-6">
                  Protect your credit score by making smart financial decisions! Face real-world scenarios and learn what builds or damages your credit.
                </p>

                <div className="bg-purple-50 rounded-xl p-6 mb-6 text-left">
                  <h3 className="font-semibold text-purple-900 mb-3">How to Play:</h3>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Start with a 650 credit score and 3 lives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>Face 8 financial decision scenarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>Choose wisely - bad choices hurt your score and cost lives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">4.</span>
                      <span>Reach 740+ for "Very Good" credit or 800+ for "Excellent"!</span>
                    </li>
                  </ul>
                </div>

                <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Defend Credit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const currentDecision = decisions[currentDecisionIndex]
  const rating = getCreditRating(creditScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white border-b shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold">Credit Score Defender</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i < lives ? 'bg-red-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  ❤️
                </div>
              ))}
            </div>
            <Badge variant="outline" className="text-base px-4 py-2">
              Question {currentDecisionIndex + 1}/{decisions.length}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Current Credit Score</div>
                <div className={`text-4xl font-bold ${rating.color}`}>{creditScore}</div>
                <Badge className={`mt-2 ${rating.bg} ${rating.color}`}>{rating.text}</Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Points Earned</div>
                <div className="text-2xl font-bold text-blue-600">{score}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>300</span>
                <span>850</span>
              </div>
              <Progress value={((creditScore - 300) / 550) * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <Badge className="mb-4" variant="outline">
              {currentDecision.type.charAt(0).toUpperCase() + currentDecision.type.slice(1)} Decision
            </Badge>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentDecision.text}
            </h3>

            <div className="space-y-3">
              {currentDecision.choices.map((choice, index) => (
                <Button
                  key={index}
                  onClick={() => makeChoice(index)}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4 px-6 hover:bg-purple-50 hover:border-purple-300"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-base">{choice.text}</span>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> Think about how each choice affects the 5 credit factors: payment history, utilization, credit age, credit mix, and new inquiries.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
