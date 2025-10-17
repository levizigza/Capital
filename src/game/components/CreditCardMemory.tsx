/**
 * Credit Card Memory Game - Match credit cards with their features to learn about credit
 * Players flip cards to match credit cards with their benefits, rates, and fees
 */

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Trophy, Star, Clock, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CreditCardData {
  id: string
  name: string
  type: 'rewards' | 'cashback' | 'travel' | 'secured' | 'student' | 'balance-transfer'
  apr: number
  annualFee: number
  creditLimit: string
  mainBenefit: string
  color: string
  emoji: string
  description: string
}

interface GameCard {
  id: string
  type: 'card' | 'feature'
  content: CreditCardData | string
  isFlipped: boolean
  isMatched: boolean
  matchId: string
}

interface CreditCardMemoryProps {
  difficulty?: 'easy' | 'medium' | 'hard'
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
}

export const CreditCardMemory: React.FC<CreditCardMemoryProps> = ({
  difficulty = 'medium',
  onComplete,
  onExit
}) => {
  const startTime = useRef(Date.now())
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [gamePhase, setGamePhase] = useState<'playing' | 'won' | 'lost'>('playing')
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(difficulty === 'easy' ? 180 : difficulty === 'medium' ? 120 : 90)
  
  const creditCards: CreditCardData[] = [
    {
      id: 'rewards-1',
      name: 'Premium Rewards Card',
      type: 'rewards',
      apr: 18.99,
      annualFee: 95,
      creditLimit: '$5,000-$25,000',
      mainBenefit: '2x points on all purchases',
      color: 'bg-gradient-to-r from-purple-500 to-purple-700',
      emoji: '💎',
      description: 'Earn points on every purchase with bonus categories'
    },
    {
      id: 'cashback-1',
      name: 'Cashback Plus Card',
      type: 'cashback',
      apr: 16.49,
      annualFee: 0,
      creditLimit: '$1,000-$15,000',
      mainBenefit: '1.5% cash back on all purchases',
      color: 'bg-gradient-to-r from-green-500 to-green-700',
      emoji: '💸',
      description: 'Simple cash back rewards with no annual fee'
    },
    {
      id: 'travel-1',
      name: 'Travel Elite Card',
      type: 'travel',
      apr: 21.99,
      annualFee: 450,
      creditLimit: '$10,000-$50,000',
      mainBenefit: 'Airport lounge access & travel credits',
      color: 'bg-gradient-to-r from-blue-500 to-blue-700',
      emoji: '✈️',
      description: 'Premium travel perks and high reward rates'
    },
    {
      id: 'secured-1',
      name: 'Secured Credit Builder',
      type: 'secured',
      apr: 22.99,
      annualFee: 25,
      creditLimit: '$200-$2,000',
      mainBenefit: 'Build credit with security deposit',
      color: 'bg-gradient-to-r from-orange-500 to-orange-700',
      emoji: '🔒',
      description: 'Perfect for building or rebuilding credit history'
    },
    {
      id: 'student-1',
      name: 'Student Starter Card',
      type: 'student',
      apr: 19.99,
      annualFee: 0,
      creditLimit: '$500-$5,000',
      mainBenefit: 'No credit history required',
      color: 'bg-gradient-to-r from-pink-500 to-pink-700',
      emoji: '🎓',
      description: 'Designed for students with limited credit history'
    },
    {
      id: 'balance-transfer-1',
      name: 'Balance Transfer Pro',
      type: 'balance-transfer',
      apr: 14.99,
      annualFee: 0,
      creditLimit: '$2,000-$20,000',
      mainBenefit: '0% APR for 18 months',
      color: 'bg-gradient-to-r from-teal-500 to-teal-700',
      emoji: '⚖️',
      description: 'Transfer high-interest debt to save money'
    }
  ]

  const [gameCards, setGameCards] = useState<GameCard[]>([])

  // Initialize cards based on difficulty
  useEffect(() => {
    const numPairs = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 6
    const selectedCards = creditCards.slice(0, numPairs)
    
    const cards: GameCard[] = []
    
    // Add card cards
    selectedCards.forEach(cardData => {
      cards.push({
        id: `card-${cardData.id}`,
        type: 'card',
        content: cardData,
        isFlipped: false,
        isMatched: false,
        matchId: cardData.id
      })
    })
    
    // Add feature cards  
    selectedCards.forEach(cardData => {
      cards.push({
        id: `feature-${cardData.id}`,
        type: 'feature',
        content: cardData.mainBenefit,
        isFlipped: false,
        isMatched: false,
        matchId: cardData.id
      })
    })
    
    // Shuffle cards
    const shuffled = cards.sort(() => Math.random() - 0.5)
    setGameCards(shuffled)
  }, [difficulty])

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

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      const firstCard = gameCards.find(c => c.id === first)
      const secondCard = gameCards.find(c => c.id === second)
      
      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        // Match found!
        setTimeout(() => {
          setGameCards(prev => 
            prev.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isMatched: true, isFlipped: true }
                : card
            )
          )
          setMatches(prev => prev + 1)
          setFlippedCards([])
          
          const matchBonus = 100 * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2)
          setScore(prev => prev + matchBonus)
          
          toast.success('Perfect Match!', {
            description: `+${matchBonus} points`
          })
        }, 1000)
      } else {
        // No match
        setTimeout(() => {
          setGameCards(prev => 
            prev.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isFlipped: false }
                : card
            )
          )
          setFlippedCards([])
        }, 1500)
      }
      
      setMoves(prev => prev + 1)
    }
  }, [flippedCards, gameCards, difficulty])

  // Check win condition
  useEffect(() => {
    const totalPairs = gameCards.length / 2
    if (matches === totalPairs && totalPairs > 0 && gamePhase === 'playing') {
      const timeSpent = Date.now() - startTime.current
      const timeBonus = Math.max(0, timeLeft * 20)
      const efficiencyBonus = Math.max(0, (totalPairs * 3 - moves) * 50)
      
      const finalScore = score + timeBonus + efficiencyBonus
      setScore(finalScore)
      setGamePhase('won')
      
      toast.success('All Cards Matched!', {
        description: `Perfect credit knowledge! +${timeBonus + efficiencyBonus} bonus points`
      })
    }
  }, [matches, gameCards.length, gamePhase, score, moves, timeLeft])

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length >= 2) return
    if (flippedCards.includes(cardId)) return
    
    const card = gameCards.find(c => c.id === cardId)
    if (!card || card.isMatched) return
    
    setGameCards(prev =>
      prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c)
    )
    setFlippedCards(prev => [...prev, cardId])
  }

  const renderCardContent = (card: GameCard) => {
    if (!card.isFlipped && !card.isMatched) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-lg flex items-center justify-center">
          <CreditCard className="w-12 h-12" />
        </div>
      )
    }

    if (card.type === 'card') {
      const cardData = card.content as CreditCardData
      return (
        <div className={`w-full h-full ${cardData.color} text-white rounded-lg p-4 flex flex-col justify-between`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-bold">{cardData.name}</div>
              <div className="text-sm opacity-90">{cardData.type.toUpperCase()}</div>
            </div>
            <div className="text-2xl">{cardData.emoji}</div>
          </div>
          <div className="space-y-1 text-sm">
            <div>APR: {cardData.apr}%</div>
            <div>Fee: ${cardData.annualFee}</div>
            <div>Limit: {cardData.creditLimit}</div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-lg p-4 flex items-center justify-center text-center">
          <div>
            <Star className="w-8 h-8 mx-auto mb-2" />
            <div className="font-semibold text-sm">{card.content as string}</div>
          </div>
        </div>
      )
    }
  }

  if (gamePhase === 'won') {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-bold text-primary">Credit Expert!</h2>
        <p className="text-lg text-muted-foreground">
          You've mastered credit card knowledge!
        </p>
        <div className="bg-card p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <div className="font-bold text-2xl">{score}</div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            <div>
              <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <div className="font-bold text-2xl">{moves}</div>
              <div className="text-sm text-muted-foreground">Total Moves</div>
            </div>
            <div>
              <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <div className="font-bold text-2xl">{matches}/{gameCards.length/2}</div>
              <div className="text-sm text-muted-foreground">Matches</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Button onClick={() => onComplete(score, { 
            timeSpent: Date.now() - startTime.current,
            moves,
            matches,
            totalPairs: gameCards.length / 2
          })} className="w-full">
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
          You matched {matches} out of {gameCards.length/2} pairs
        </p>
        <div className="space-y-2">
          <Button variant="outline" onClick={onExit} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const gridCols = difficulty === 'easy' ? 'grid-cols-3' : difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4'

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Credit Card Memory</h2>
          <p className="text-muted-foreground">
            Match credit cards with their main benefits
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
          <div className="text-sm text-muted-foreground">Time Left</div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{matches}</div>
            <div className="text-sm text-muted-foreground">Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{moves}</div>
            <div className="text-sm text-muted-foreground">Moves</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{gameCards.length/2}</div>
            <div className="text-sm text-muted-foreground">Pairs</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Board */}
      <div className={`grid ${gridCols} gap-4`}>
        {gameCards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-[3/4] cursor-pointer transition-all duration-300 hover:scale-105 ${
              card.isMatched ? 'opacity-75 scale-95' : 'hover:shadow-lg'
            }`}
          >
            {renderCardContent(card)}
          </div>
        ))}
      </div>

      {/* Learning Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning className="w-5 h-5" />
            Credit Card Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-semibold">💳 Choose the Right Type:</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Secured:</strong> Best for building credit</li>
                <li>• <strong>Student:</strong> No credit history needed</li>
                <li>• <strong>Cashback:</strong> Simple rewards</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">📊 Key Factors:</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>APR:</strong> Interest rate on balances</li>
                <li>• <strong>Annual Fee:</strong> Yearly cost</li>
                <li>• <strong>Credit Limit:</strong> Maximum you can spend</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}