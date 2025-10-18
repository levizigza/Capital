import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from 'sonner'
import ModeSelection from '@/components/ModeSelection'
import CreativeModeHub from '@/components/CreativeModeHub'
import StructuredModeHub from '@/components/StructuredModeHub'
import type { Tier, SkillLine } from '@/data/tiers'
import { TIER_DATA } from '@/data/tiers'

export type LearningMode = 'creative' | 'structured' | null

type NavigationState = {
  mode: LearningMode
  page?: string
}

interface UserProfile {
  name: string
  level: number
  xp: number
  totalCoins: number
  gamesCompleted: number
  achievements: string[]
  currentStreak: number
  skillsUnlocked: string[]
  preferredMode: LearningMode
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

function App() {
  const initializeTiers = (): Tier[] => {
    return TIER_DATA.map((tierData, index) => ({
      ...tierData,
      unlocked: index === 0,
      completed: false
    }))
  }

  const [userProfile, setUserProfile] = useKV<UserProfile>('user-profile', {
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
  })

  const [gameScores, setGameScores] = useKV<GameScore[]>('game-scores', [])
  const [currentMode, setCurrentMode] = useState<LearningMode>(userProfile?.preferredMode || null)

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

  useEffect(() => {
    if (userProfile?.preferredMode && !currentMode) {
      setCurrentMode(userProfile.preferredMode)
    }
  }, [userProfile?.preferredMode, currentMode])

  useEffect(() => {
    if (userProfile && !userProfile.tierProgression) {
      setUserProfile(prev => {
        if (!prev) {
          return {
            name: 'Player',
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
        }
        
        if (prev.tierProgression) return prev
        
        return {
          ...prev,
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
      })
    }
  }, [userProfile?.tierProgression, setUserProfile])

  const handleModeSelect = (mode: LearningMode) => {
    setCurrentMode(mode)
    const newState: NavigationState = { mode }
    window.history.pushState(newState, '', window.location.href)
    
    setUserProfile(prev => {
      if (!prev) {
        return {
          name: 'Player',
          level: 1,
          xp: 0,
          totalCoins: 0,
          gamesCompleted: 0,
          achievements: [],
          currentStreak: 0,
          skillsUnlocked: [],
          preferredMode: mode,
          preferences: {
            difficulty: 'adaptive',
            gameTypes: [],
            playTime: 'medium'
          }
        }
      }
      return {
        ...prev,
        preferredMode: mode
      }
    })
  }

  const handleModeSwitch = useCallback(() => {
    setCurrentMode(null)
    const newState: NavigationState = { mode: null }
    window.history.pushState(newState, '', window.location.href)
  }, [])

  const completeGame = (gameId: string, score: number, timeSpent: number, additionalData?: any) => {
    const newScore: GameScore = {
      gameId: gameId,
      score: score,
      completed: true,
      timeSpent: timeSpent,
      date: new Date().toISOString(),
      difficulty: userProfile?.preferences.difficulty || 'adaptive',
      finalNetWorth: additionalData?.finalAmount || 0,
      decisions: []
    }

    setGameScores(prevScores => [...(prevScores || []), newScore])
    
    const xpEarned = Math.floor(score * 0.5) + 50
    const coinsEarned = Math.floor(score * 0.3) + 25
    
    setUserProfile(prevProfile => {
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
        currentStreak: prevProfile.currentStreak + 1,
      }
    })
  }

  const handleQuestComplete = (tierId: number, questId: string) => {
    setUserProfile(prevProfile => {
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
  }

  const handleAllocateLineXP = (line: SkillLine, amount: number) => {
    setUserProfile(prevProfile => {
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
  }

  if (!currentMode) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <ModeSelection onSelectMode={handleModeSelect} />
      </>
    )
  }

  if (currentMode === 'creative') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <CreativeModeHub
          userProfile={userProfile!}
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
      <StructuredModeHub
        userProfile={userProfile!}
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
