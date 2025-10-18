import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from 'sonner'
import { motion } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'
import ModeSelection from '@/components/ModeSelection'
import CreativeModeHub from '@/components/CreativeModeHub'
import StructuredModeHub from '@/components/StructuredModeHub'
import ArchetypeQuiz from '@/components/ArchetypeQuiz'
import { DebugPanel } from '@/components/DebugPanel'
import type { Tier, SkillLine } from '@/data/tiers'
import { TIER_DATA } from '@/data/tiers'
import type { ArchetypeId } from '@/data/archetype-questions'

export type LearningMode = 'creative' | 'structured' | null

type NavigationState = {
  mode: LearningMode
  page?: string
}

export interface UserProfile {
  name: string
  level: number
  xp: number
  totalCoins: number
  gamesCompleted: number
  achievements: string[]
  currentStreak: number
  skillsUnlocked: string[]
  preferredMode: LearningMode
  archetype?: {
    primary: ArchetypeId
    secondary: ArchetypeId | null
    completedQuiz: boolean
  }
  gardenProgress?: {
    plants: Array<{ type: string; growth: number; position: { x: number; y: number } }>
    gardenLevel: number
    unlockedAreas: string[]
  }
  preferences: {
    difficulty: 'adaptive' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
    gameTypes: string[]
    playTime: 'short' | 'medium' | 'long'
  }
  tierProgression?: {
    currentTierId: number
    tiers: Tier[]
    skillLines: Record<SkillLine, number>
    availableLineXP: number
  }
}

export interface GameScore {
  gameId: string
  score: number
  completed: boolean
  timeSpent: number
  date: string
  difficulty: string
  finalNetWorth?: number
  decisions: Array<{
    eventId: string
    choice: number
    outcome: string
  }>
}

const initializeTiers = (): Tier[] => {
  return TIER_DATA.map((tierData, index) => ({
    ...tierData,
    unlocked: index === 0,
    completed: false
  }))
}

const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  level: 1,
  xp: 0,
  totalCoins: 0,
  gamesCompleted: 0,
  achievements: [],
  currentStreak: 0,
  skillsUnlocked: [],
  preferredMode: null,
  preferences: {
    difficulty: 'adaptive',
    gameTypes: [],
    playTime: 'medium'
  },
  tierProgression: {
    currentTierId: 1,
    tiers: initializeTiers(),
    skillLines: {
      cognition: 0,
      values: 0,
      morals: 0,
      faith: 0
    },
    availableLineXP: 0
  }
}

function App() {
  const [userProfile, setUserProfile] = useKV<UserProfile>('user-profile', DEFAULT_USER_PROFILE)
  const [gameScores, setGameScores] = useKV<GameScore[]>('game-scores', [])
  const [currentMode, setCurrentMode] = useState<LearningMode>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showArchetypeQuiz, setShowArchetypeQuiz] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setIsInitialized(true)
      
      if (!userProfile.archetype?.completedQuiz && currentMode !== null) {
        setShowArchetypeQuiz(true)
      }
    }
  }, [userProfile, currentMode])

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.mode !== undefined) {
        setCurrentMode(event.state.mode)
      } else {
        setCurrentMode(null)
      }
    }

    window.addEventListener('popstate', handlePopState)

    const initialState: NavigationState = { mode: currentMode }
    if (window.history.state === null || window.history.state.mode === undefined) {
      window.history.replaceState(initialState, '', window.location.href)
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Commented out auto-selection to always show mode selection first
  // useEffect(() => {
  //   if (isInitialized && userProfile?.preferredMode && currentMode === null) {
  //     setCurrentMode(userProfile.preferredMode)
  //   }
  // }, [userProfile?.preferredMode, isInitialized, currentMode])

  useEffect(() => {
    if (userProfile && !userProfile.tierProgression) {
      setUserProfile((prev): UserProfile => {
        if (!prev || prev.tierProgression) return prev!
        
        return {
          ...prev,
          tierProgression: DEFAULT_USER_PROFILE.tierProgression!
        }
      })
    }
  }, [userProfile?.tierProgression, setUserProfile])

  const handleModeSelect = (mode: LearningMode): void => {
    setCurrentMode(mode)
    const newState: NavigationState = { mode }
    window.history.pushState(newState, '', window.location.href)
    
    setUserProfile((prev): UserProfile => {
      if (!prev) return prev!
      return {
        ...prev,
        preferredMode: mode
      }
    })
    
    if (!userProfile?.archetype?.completedQuiz) {
      setShowArchetypeQuiz(true)
    }
  }

  const handleArchetypeComplete = (primaryArchetype: ArchetypeId, secondaryArchetype: ArchetypeId | null) => {
    setUserProfile((prev): UserProfile => {
      if (!prev) return prev!
      return {
        ...prev,
        archetype: {
          primary: primaryArchetype,
          secondary: secondaryArchetype,
          completedQuiz: true
        }
      }
    })
    setShowArchetypeQuiz(false)
  }

  const handleSkipArchetype = () => {
    setUserProfile((prev): UserProfile => {
      if (!prev) return prev!
      return {
        ...prev,
        archetype: {
          primary: 'tempo',
          secondary: null,
          completedQuiz: false
        }
      }
    })
    setShowArchetypeQuiz(false)
  }

  const handleModeSwitch = useCallback(() => {
    setCurrentMode(null)
    const newState: NavigationState = { mode: null }
    window.history.pushState(newState, '', window.location.href)
  }, [])

  const completeGame = useCallback((gameId: string, score: number, timeSpent: number, additionalData?: Record<string, unknown>): void => {
    const newScore: GameScore = {
      gameId: gameId,
      score: score,
      completed: true,
      timeSpent: timeSpent,
      date: new Date().toISOString(),
      difficulty: userProfile?.preferences.difficulty || 'adaptive',
      finalNetWorth: (additionalData?.finalAmount as number | undefined) || 0,
      decisions: []
    }

    setGameScores((prevScores): GameScore[] => [...(prevScores || []), newScore])
    
    const xpEarned = Math.floor(score * 0.5) + 50
    const coinsEarned = Math.floor(score * 0.3) + 25
    
    setUserProfile((prevProfile): UserProfile => {
      if (!prevProfile) {
        const defaultProfile: UserProfile = {
          name: 'Player',
          level: 1,
          xp: xpEarned,
          totalCoins: coinsEarned,
          gamesCompleted: 1,
          achievements: [],
          currentStreak: 1,
          skillsUnlocked: [],
          preferredMode: currentMode,
          preferences: {
            difficulty: 'adaptive',
            gameTypes: [],
            playTime: 'medium'
          },
          tierProgression: DEFAULT_USER_PROFILE.tierProgression
        }
        return defaultProfile
      }
      
      const newXP = prevProfile.xp + xpEarned
      const newLevel = Math.floor(newXP / 100) + 1

      return {
        ...prevProfile,
        xp: newXP,
        level: newLevel,
        totalCoins: prevProfile.totalCoins + coinsEarned,
        gamesCompleted: prevProfile.gamesCompleted + 1,
        currentStreak: prevProfile.currentStreak + 1
      }
    })
  }, [userProfile?.preferences.difficulty, currentMode, setGameScores, setUserProfile])

  const handleQuestComplete = useCallback((tierId: number, questId: string): void => {
    setUserProfile((prevProfile): UserProfile => {
      if (!prevProfile?.tierProgression) return prevProfile!

      const updatedTiers = prevProfile.tierProgression.tiers.map(tier => {
        if (tier.id === tierId) {
          const updatedQuests = tier.quests.map(quest => {
            if (quest.id === questId && !quest.completed) {
              const financialComplete = quest.financialKPI.current >= quest.financialKPI.target
              const softSkillComplete = quest.softSkillKPI.completed
              
              if (financialComplete && softSkillComplete) {
                return { ...quest, completed: true }
              }
            }
            return quest
          })

          const allQuestsComplete = updatedQuests.every(q => q.completed)
          
          return {
            ...tier,
            quests: updatedQuests,
            completed: allQuestsComplete
          }
        }
        return tier
      })

      const currentTier = updatedTiers.find(t => t.id === tierId)
      const completedQuest = currentTier?.quests.find(q => q.id === questId && q.completed)
      
      let newXP = prevProfile.xp
      let newAvailableLineXP = prevProfile.tierProgression.availableLineXP
      let newLevel = prevProfile.level

      if (completedQuest && !prevProfile.tierProgression.tiers.find(t => t.id === tierId)?.quests.find(q => q.id === questId)?.completed) {
        newXP += completedQuest.financeXP
        newAvailableLineXP += completedQuest.lineXPReward
        newLevel = Math.floor(newXP / 100) + 1
      }

      const currentTierComplete = currentTier?.completed
      let newCurrentTierId = prevProfile.tierProgression.currentTierId
      
      if (currentTierComplete && tierId === prevProfile.tierProgression.currentTierId) {
        const nextTier = updatedTiers.find(t => t.id === tierId + 1)
        if (nextTier) {
          updatedTiers[tierId] = { ...updatedTiers[tierId], unlocked: true }
          newCurrentTierId = tierId + 1
        }
      }

      return {
        ...prevProfile,
        xp: newXP,
        level: newLevel,
        tierProgression: {
          ...prevProfile.tierProgression,
          currentTierId: newCurrentTierId,
          tiers: updatedTiers,
          availableLineXP: newAvailableLineXP
        }
      }
    })
  }, [setUserProfile])

  const handleAllocateLineXP = useCallback((line: SkillLine, amount: number): void => {
    setUserProfile((prevProfile): UserProfile => {
      if (!prevProfile?.tierProgression) return prevProfile!
      
      if (prevProfile.tierProgression.availableLineXP < amount) return prevProfile

      return {
        ...prevProfile,
        tierProgression: {
          ...prevProfile.tierProgression,
          skillLines: {
            ...prevProfile.tierProgression.skillLines,
            [line]: prevProfile.tierProgression.skillLines[line] + amount
          },
          availableLineXP: prevProfile.tierProgression.availableLineXP - amount
        }
      }
    })
  }, [setUserProfile])

  if (!isInitialized || !userProfile) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-2xl"
            >
              <Sparkle className="w-10 h-10 text-white" weight="fill" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading FinanceQuest Pro</h2>
            <p className="text-lg text-gray-600">Initializing your financial journey...</p>
          </div>
        </div>
      </>
    )
  }

  if (!currentMode) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <ModeSelection onSelectMode={handleModeSelect} />
      </>
    )
  }

  if (showArchetypeQuiz && !userProfile?.archetype?.completedQuiz) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <ArchetypeQuiz 
          onComplete={handleArchetypeComplete}
          onSkip={handleSkipArchetype}
        />
      </>
    )
  }

  if (currentMode === 'creative') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <DebugPanel 
          userProfile={userProfile}
          currentMode={currentMode}
          isInitialized={isInitialized}
          gameScores={gameScores || []}
        />
        <CreativeModeHub
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          gameScores={gameScores || []}
          onGameComplete={completeGame}
          onModeSwitch={handleModeSwitch}
          onQuestComplete={handleQuestComplete}
          onAllocateLineXP={handleAllocateLineXP}
        />
      </>
    )
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <DebugPanel 
        userProfile={userProfile}
        currentMode={currentMode}
        isInitialized={isInitialized}
        gameScores={gameScores || []}
      />
      <StructuredModeHub
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        gameScores={gameScores || []}
        onGameComplete={completeGame}
        onModeSwitch={handleModeSwitch}
        onQuestComplete={handleQuestComplete}
        onAllocateLineXP={handleAllocateLineXP}
      />
    </>
  )
}

export default App
