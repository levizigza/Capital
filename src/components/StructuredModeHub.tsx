import StructuredModeDashboard from '@/components/StructuredModeDashboard'
import type { GameScore } from '@/App'
import type { SkillLine } from '@/data/tiers'
import type { UserProfile } from '@/App'

interface StructuredModeHubProps {
  userProfile: UserProfile
  setUserProfile: (updater: (prev: UserProfile) => UserProfile) => void
  gameScores: GameScore[]
  onGameComplete: (gameId: string, score: number, timeSpent: number, additionalData?: Record<string, unknown>) => void
  onModeSwitch: () => void
  onQuestComplete: (tierId: number, questId: string) => void
  onAllocateLineXP: (line: SkillLine, amount: number) => void
}

export default function StructuredModeHub({
  userProfile,
  gameScores,
  onModeSwitch
}: StructuredModeHubProps) {
  return (
    <StructuredModeDashboard
      userProfile={userProfile}
      gameScores={gameScores}
      onModeSwitch={onModeSwitch}
      onOpenProfile={() => {}}
    />
  )
}
