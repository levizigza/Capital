import { useState } from 'react'
import CreativeGameHub from '@/components/CreativeGameHub'
import { CoinCatcherGame } from '@/game/components/games/CoinCatcherGame'
import { BudgetBalancerGame } from '@/game/components/games/BudgetBalancerGame'
import { InvestmentClimberGame } from '@/game/components/games/InvestmentClimberGame'
import { LemonadeBossGame } from '@/game/components/games/LemonadeBossGame'
import type { GameScore } from '@/App'
import type { SkillLine } from '@/data/tiers'
import type { UserProfile } from '@/App'

interface CreativeModeHubProps {
  userProfile: UserProfile
  setUserProfile: (updater: (prev: UserProfile) => UserProfile) => void
  gameScores: GameScore[]
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: Record<string, unknown>) => void
  onModeSwitch: () => void
  onQuestComplete: (tierId: number, questId: string) => void
  onAllocateLineXP: (line: SkillLine, amount: number) => void
}

interface GameComponentProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}

const GAME_COMPONENTS: Record<string, React.ComponentType<GameComponentProps>> = {
  'coin-catcher': CoinCatcherGame,
  'budget-balancer': BudgetBalancerGame,
  'investment-tower': InvestmentClimberGame,
  'lemonade-boss': LemonadeBossGame
}

export default function CreativeModeHub({
  userProfile,
  gameScores,
  onGameComplete,
  onModeSwitch
}: CreativeModeHubProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)

  const handleGameStart = (gameId: string): void => {
    setSelectedGame(gameId)
    setGameStartTime(Date.now())
  }

  const handleGameComplete = (score: number, additionalData?: Record<string, unknown>) => {
    if (selectedGame) {
      const timeSpent = Date.now() - gameStartTime
      onGameComplete(selectedGame, score, timeSpent, additionalData)
      setSelectedGame(null)
    }
  }

  const handleGameExit = () => {
    setSelectedGame(null)
  }

  if (selectedGame && GAME_COMPONENTS[selectedGame]) {
    const GameComponent = GAME_COMPONENTS[selectedGame]
    return (
      <div className="mode-creative fixed inset-0 z-50">
        <GameComponent
          onComplete={handleGameComplete}
          onExit={handleGameExit}
          userTier="middle"
        />
      </div>
    )
  }

  return (
    <CreativeGameHub
      userProfile={userProfile}
      gameScores={gameScores}
      onModeSwitch={onModeSwitch}
      onGameStart={handleGameStart}
    />
  )
}
