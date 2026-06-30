import React, { useState, useMemo } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import type { UserProfile, GameScore } from '../App'
import UserAvatar3D from './UserAvatar3D'
import TrophyRoom3D from './TrophyRoom3D'

interface CreativeGameHubProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  onModeSwitch: () => void
  onGameStart: (gameId: string) => void
}

interface GameCardData {
  id: string
  title: string
  description: string
  category: 'savings' | 'investing' | 'credit' | 'business'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  time: string
  icon: string
  color: string
  gradient: string
  locked: boolean
  minLevel: number
  funFact: string
}

const GAME_CARDS: GameCardData[] = [
  {
    id: 'coin-catcher',
    title: 'Coin Catcher',
    description: 'Catch coins and dodge expenses in this action-packed savings game!',
    category: 'savings',
    difficulty: 'Easy',
    time: '2-3 min',
    icon: '🪙',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    locked: false,
    minLevel: 1,
    funFact: 'Save early, save often!'
  },
  {
    id: 'budget-balancer',
    title: 'Budget Balancer',
    description: 'Sort expenses into the right buckets! Learn budgeting the fun way!',
    category: 'savings',
    difficulty: 'Easy',
    time: '3-4 min',
    icon: '🧮',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    locked: false,
    minLevel: 1,
    funFact: 'Every dollar has a job!'
  },
  {
    id: 'investment-tower',
    title: 'Investment Tower',
    description: 'Build your investment empire! Stack assets and watch them grow!',
    category: 'investing',
    difficulty: 'Medium',
    time: '4-5 min',
    icon: '📈',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    locked: false,
    minLevel: 3,
    funFact: 'Time in market beats timing!'
  },
  {
    id: 'credit-defender',
    title: 'Credit Defender',
    description: 'Protect your credit score from bad decisions! Tower defense fun!',
    category: 'credit',
    difficulty: 'Medium',
    time: '5-6 min',
    icon: '💳',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    locked: false,
    minLevel: 5,
    funFact: 'Your credit score is your superpower!'
  },
  {
    id: 'business-builder',
    title: 'Business Builder',
    description: 'Run your own business! Make smart choices and grow profits!',
    category: 'business',
    difficulty: 'Hard',
    time: '6-8 min',
    icon: '🏪',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    locked: false,
    minLevel: 7,
    funFact: 'Every business starts with an idea!'
  },
  {
    id: 'lemonade-boss',
    title: 'Lemonade Boss',
    description: 'Classic lemonade stand! Price it right and beat the competition!',
    category: 'business',
    difficulty: 'Easy',
    time: '3-4 min',
    icon: '🍋',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    locked: false,
    minLevel: 1,
    funFact: 'When life gives you lemons, sell lemonade!'
  },
  {
    id: 'collect-game-2d',
    title: 'Collect Game 2D',
    description: 'Collect as many items as you can! Simple, fast-paced fun.',
    category: 'savings',
    difficulty: 'Easy',
    time: '2-3 min',
    icon: '🧲',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    locked: false,
    minLevel: 1,
    funFact: 'Quick reflexes pay off!'
  },
  {
    id: 'debt-dungeon',
    title: 'Debt Dungeon',
    description: 'Fight debt monsters using smart financial strategies!',
    category: 'credit',
    difficulty: 'Medium',
    time: '4-5 min',
    icon: '⚔️',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    locked: false,
    minLevel: 4,
    funFact: 'Defeat debt before it defeats you!'
  },
  {
    id: 'savings-sprint',
    title: 'Savings Sprint',
    description: 'Race down the track collecting coins and bills!',
    category: 'savings',
    difficulty: 'Easy',
    time: '2-3 min',
    icon: '🏃',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    locked: false,
    minLevel: 2,
    funFact: 'Speed saves!'
  },
  {
    id: 'portfolio-park',
    title: 'Portfolio Park',
    description: 'Build the perfect investment portfolio!',
    category: 'investing',
    difficulty: 'Hard',
    time: '5-6 min',
    icon: '🎯',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    locked: false,
    minLevel: 6,
    funFact: 'Diversification is key!'
  },
  {
    id: 'expense-express',
    title: 'Expense Express',
    description: 'Categorize expenses as they come by on the train!',
    category: 'savings',
    difficulty: 'Medium',
    time: '3-4 min',
    icon: '🚂',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    locked: false,
    minLevel: 3,
    funFact: 'Track every expense!'
  },
  {
    id: 'interest-inn',
    title: 'Interest Inn',
    description: 'Learn compound interest by calculating growth!',
    category: 'investing',
    difficulty: 'Easy',
    time: '4-5 min',
    icon: '🏨',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    locked: false,
    minLevel: 2,
    funFact: 'Compound interest is your friend!'
  }
]

export default function CreativeGameHub({
  userProfile,
  gameScores,
  onModeSwitch,
  onGameStart
}: CreativeGameHubProps) {
  const [filter, setFilter] = useState<'all' | 'savings' | 'investing' | 'credit' | 'business'>('all')
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  const filteredGames = useMemo(() => {
    return GAME_CARDS.filter(game =>
      filter === 'all' || game.category === filter
    )
  }, [filter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-green-700 drop-shadow-lg">🎮 Play Creative Games</h1>
          <button
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black text-lg shadow-lg border-4 border-blue-900 hover:bg-blue-700 transition"
            onClick={onModeSwitch}
          >
            ← Back to Mode Select
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {GAME_CARDS.map((game) => (
            <div key={game.id} className="card bg-white shadow-2xl border-4 flex flex-col items-center p-6 hover:scale-105 transition-transform duration-200" style={{ borderColor: game.color }}>
              <span className="text-6xl mb-2" style={{ color: game.color }}>{game.icon}</span>
              <h3 className="text-2xl font-black mb-1" style={{ color: game.color }}>{game.title}</h3>
              <p className="text-base text-gray-700 mb-2 text-center">{game.description}</p>
              <span className="text-xs font-bold mb-2" style={{ color: game.color }}>{game.difficulty} • {game.time}</span>
              <span className="text-xs font-bold mb-2" style={{ color: game.color }}>{game.funFact}</span>
              <button
                className="mt-4 px-6 py-3 rounded-xl bg-green-600 text-white font-black text-lg shadow-lg border-4 border-green-900 hover:bg-green-700 transition w-full"
                onClick={() => onGameStart(game.id)}
              >
                ▶ Play
              </button>
            </div>
          ))}
        </div>
        {GAME_CARDS.length === 0 && (
          <div className="text-center text-xl text-gray-500 mt-12">No games available yet. Check back soon!</div>
        )}
      </div>
    </div>
  )
}
