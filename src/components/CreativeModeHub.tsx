import { useState, useEffect } from 'react'
import PokemonWorldMap, { type Neighborhood, NEIGHBORHOODS, type Boss } from '@/components/PokemonWorldMap'
import AvatarCustomizer, { type AvatarConfig, DEFAULT_AVATAR } from '@/components/AvatarCustomizer'
import { CoinCatcherGame } from '@/game/components/games/CoinCatcherGame'
import BudgetBalancerGame from '@/game/components/games/BudgetBalancerGame'
import { InvestmentClimberGame } from '@/game/components/games/InvestmentClimberGame'
import { LemonadeBossGame } from '@/game/components/games/LemonadeBossGame'
import CollectGame2D from '@/game/components/games/CollectGame2D'
import CreditDefender2D from '@/game/components/games/CreditDefender2D'
import BusinessBuilder2D from '@/game/components/games/BusinessBuilder2D'
import TeamSavingsChallenge from '@/game/components/games/TeamSavingsChallenge'
import PortfolioOptimizer from '@/game/components/games/PortfolioOptimizer'
import HabitBuilder from '@/game/components/games/HabitBuilder'
import { DebtDungeonGame } from '@/game/components/games/DebtDungeon'
import { SavingsSprintGame } from '@/game/components/games/SavingsSprint'
import { PortfolioParkGame } from '@/game/components/games/PortfolioPark'
import { ExpenseExpressGame } from '@/game/components/games/ExpenseExpress'
import { InterestInnGame } from '@/game/components/games/InterestInn'
import MoneyMaze from '@/game/components/games/MoneyMaze'
import StockMarketGame from '@/game/components/games/StockMarketGame'
import BossBattle from '@/game/components/games/BossBattle'
import type { GameScore } from '@/App'
import type { SkillLine } from '@/data/tiers'
import type { UserProfile } from '@/App'
import { useKV } from '@/hooks/use-safe-kv'

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
  'lemonade-boss': LemonadeBossGame,
  'credit-defender': CreditDefender2D,
  'business-builder': BusinessBuilder2D,
  'collect-game-2d': CollectGame2D,
  'team-savings-challenge': TeamSavingsChallenge,
  'portfolio-optimizer': PortfolioOptimizer,
  'habit-builder': HabitBuilder,
  'debt-dungeon': DebtDungeonGame,
  'savings-sprint': SavingsSprintGame,
  'portfolio-park': PortfolioParkGame,
  'expense-express': ExpenseExpressGame,
  'interest-inn': InterestInnGame,
  // New games
  'money-maze': MoneyMaze,
  'stock-market': StockMarketGame,
}

type ViewMode = 'world-map' | 'avatar-customizer' | 'game' | 'boss-battle'

export default function CreativeModeHub({
  userProfile,
  setUserProfile,
  gameScores,
  onGameComplete,
  onModeSwitch,
  onQuestComplete,
  onAllocateLineXP
}: CreativeModeHubProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('world-map')
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  const [avatar, setAvatar] = useKV<AvatarConfig>('user-avatar', DEFAULT_AVATAR)
  const [currentBoss, setCurrentBoss] = useState<Boss | null>(null)
  const [currentNeighborhoodId, setCurrentNeighborhoodId] = useState<string | null>(null)

  // Check if this is first time (show avatar customizer)
  useEffect(() => {
    if (!avatar || avatar === DEFAULT_AVATAR) {
      // First time user - show avatar customizer
      setViewMode('avatar-customizer')
    }
  }, [])

  const handleGameStart = (gameId: string): void => {
    setSelectedGame(gameId)
    setGameStartTime(Date.now())
    setViewMode('game')
  }

  const handleGameComplete = (score: number, additionalData?: Record<string, unknown>) => {
    if (selectedGame) {
      const timeSpent = Date.now() - gameStartTime
      onGameComplete(selectedGame, score, timeSpent, additionalData)
      setSelectedGame(null)
      setViewMode('world-map')
    }
  }

  const handleGameExit = () => {
    setSelectedGame(null)
    setViewMode('world-map')
  }

  const handleAvatarSave = (newAvatar: AvatarConfig) => {
    setAvatar(newAvatar)
    setViewMode('world-map')
  }

  const handleAvatarEdit = () => {
    setViewMode('avatar-customizer')
  }

  const handleBossBattle = (boss: Boss, neighborhoodId: string) => {
    setCurrentBoss(boss)
    setCurrentNeighborhoodId(neighborhoodId)
    setViewMode('boss-battle')
  }

  const handleBossComplete = (score: number, additionalData?: Record<string, unknown>) => {
    if (currentBoss && currentNeighborhoodId) {
      const timeSpent = Date.now() - gameStartTime
      onGameComplete(`boss-${currentBoss.id}`, score, timeSpent, {
        ...additionalData,
        neighborhoodId: currentNeighborhoodId,
        bossDefeated: true
      })
      
      // Award boss rewards
      setUserProfile((prev) => ({
        ...prev,
        totalCoins: prev.totalCoins + (currentBoss?.rewards.coins || 0),
        xp: prev.xp + (currentBoss?.rewards.xp || 0),
        achievements: [...prev.achievements, currentBoss?.rewards.specialItem || '']
      }))
    }
    setCurrentBoss(null)
    setCurrentNeighborhoodId(null)
    setViewMode('world-map')
  }

  const handleBossExit = () => {
    setCurrentBoss(null)
    setCurrentNeighborhoodId(null)
    setViewMode('world-map')
  }

  // Render game if selected
  if (viewMode === 'game' && selectedGame && GAME_COMPONENTS[selectedGame]) {
    const GameComponent = GAME_COMPONENTS[selectedGame]
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <GameComponent
          onComplete={handleGameComplete}
          onExit={handleGameExit}
          userTier="middle"
        />
      </div>
    )
  }

  // Render boss battle
  if (viewMode === 'boss-battle' && currentBoss) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <BossBattle
          boss={currentBoss}
          neighborhoodId={currentNeighborhoodId || ''}
          onComplete={handleBossComplete}
          onExit={handleBossExit}
        />
      </div>
    )
  }

  // Render avatar customizer
  if (viewMode === 'avatar-customizer') {
    return (
      <AvatarCustomizer
        currentAvatar={avatar || DEFAULT_AVATAR}
        onSave={handleAvatarSave}
        onCancel={avatar ? () => setViewMode('world-map') : undefined}
      />
    )
  }

  // Render Pokemon-style world map
  return (
    <PokemonWorldMap
      userProfile={userProfile}
      gameScores={gameScores}
      avatar={avatar || DEFAULT_AVATAR}
      onGameStart={handleGameStart}
      onBossBattle={handleBossBattle}
      onModeSwitch={onModeSwitch}
      onAvatarEdit={handleAvatarEdit}
    />
  )
}
