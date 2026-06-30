import EnhancedStructuredModeDashboard from '@/components/EnhancedStructuredModeDashboard'
import type { GameScore } from '@/App'
import type { SkillLine } from '@/data/tiers'
import type { UserProfile } from '@/App'
import { QuestSystem, type UserQuestState } from '@/utils/questSystem'
import { useState, useEffect } from 'react'

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
  setUserProfile,
  gameScores,
  onGameComplete,
  onModeSwitch,
  onQuestComplete,
  onAllocateLineXP
}: StructuredModeHubProps) {
  const [questState, setQuestState] = useState<UserQuestState>(() =>
    QuestSystem.initializeQuestState(userProfile)
  )

  // Initialize quest state when user profile changes
  useEffect(() => {
    setQuestState(QuestSystem.initializeQuestState(userProfile))
  }, [userProfile])

  const handleQuestStart = (questId: string) => {
    const newState = QuestSystem.startQuest(questState, questId)
    setQuestState(newState)

    // Store quest state in user profile or local storage
    setUserProfile(prev => ({
      ...prev,
      questState: newState
    }))
  }

  const handleQuestComplete = (tierId: number, questId: string) => {
    const newState = QuestSystem.completeQuest(questState, questId)
    setQuestState(newState)

    // Update user profile with new state
    setUserProfile(prev => ({
      ...prev,
      questState: newState
    }))

    // Award XP based on quest completion
    const tier = newState.tiers[tierId]
    const questProgress = tier.questProgress[questId]
    if (questProgress.completed) {
      // Find original quest to get XP rewards
      import('@/data/tiers').then(({ TIER_DATA }) => {
        const originalTier = TIER_DATA[tierId - 1]
        const originalQuest = originalTier.quests.find(q => q.id === questId)
        if (originalQuest) {
          setUserProfile(prev => ({
            ...prev,
            xp: prev.xp + originalQuest.financeXP
          }))
        }
      })
    }

    // Call original handler
    onQuestComplete(tierId, questId)
  }

  const handleAllocateLineXP = (line: SkillLine, amount: number) => {
    onAllocateLineXP(line, amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedStructuredModeDashboard
        userProfile={userProfile}
        gameScores={gameScores}
        onModeSwitch={onModeSwitch}
        onOpenProfile={() => {}}
        onQuestStart={handleQuestStart}
        onQuestComplete={handleQuestComplete}
        onAllocateLineXP={handleAllocateLineXP}
      />
    </div>
  )
}
