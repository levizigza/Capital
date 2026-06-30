import { useState, useEffect, useCallback, Suspense } from 'react'
import { useKV } from '@/hooks/use-safe-kv'
import { Toaster } from 'sonner'
import { motion } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'
import React from 'react'
import { ISLANDS_ENABLED } from '@/islands/featureFlags'

// Use the new 3D mode selection
import ThreeJSModeSelection from '@/components/ThreeJSModeSelection'
import StructuredModeHub from '@/components/StructuredModeHub'
import { MusicPlayer } from '@/components/MusicPlayer'
import { OfflineIndicator } from '@/hooks/use-offline-support'
import type { Tier, SkillLine } from '@/data/tiers'
import { TIER_DATA } from '@/data/tiers'
import type { ArchetypeId } from '@/data/archetype-questions'

// Lazy load heavy components
const EnhancedGameHub = React.lazy(() => import('@/components/EnhancedGameHub'))
const AIChatHelper = React.lazy(() => import('@/components/AIChatHelper'))
const ArchetypeQuiz = React.lazy(() => import('@/components/ArchetypeQuiz'))
const DebugPanel = React.lazy(() => import('@/components/DebugPanel').then(m => ({ default: m.DebugPanel })))
const IslandsApp = React.lazy(() => import('@/islands/IslandsApp'))
const IPLintScreen = React.lazy(() => import('@/components/IPLintScreen'))
const ScenarioDeckSimulator = React.lazy(() => import('@/components/ScenarioDeckSimulator'))

export type LearningMode = 'creative' | 'structured' | 'islands' | null

type NavigationState = {
  mode: LearningMode
  page?: string
}

export interface UserProfile {
  id?: string
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
  userId?: string
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
  additionalData?: Record<string, unknown>
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
  archetype: {
    primary: 'navigator', // Use a valid ArchetypeId
    secondary: 'strategist', // Use a valid ArchetypeId
    completedQuiz: false // Always require quiz before Creative Mode
  },
  gardenProgress: undefined,
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

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="text-center">
        <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xl text-white font-bold">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  // ?fresh query param wipes saved state for a clean demo
  if (typeof window !== 'undefined' && window.location.search.includes('fresh')) {
    localStorage.removeItem('kv_user-profile')
    localStorage.removeItem('kv_game-scores')
    window.history.replaceState(null, '', window.location.pathname)
    window.location.reload()
  }

  const [userProfile, setUserProfile] = useKV<UserProfile>('user-profile', DEFAULT_USER_PROFILE)
  const [gameScores, setGameScores] = useKV<GameScore[]>('game-scores', [])
  const [currentMode, setCurrentMode] = useState<LearningMode>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "islands" && (import.meta.env.VITE_ISLANDS === "1" || import.meta.env.VITE_QA === "1")) {
      return "islands";
    }
    return null;
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [showArchetypeQuiz, setShowArchetypeQuiz] = useState(false)
  const [profileError, setProfileError] = useState(false)
  const [showIPLint, setShowIPLint] = useState(false)
  const [showDeckSim, setShowDeckSim] = useState(false)

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
  }, [currentMode])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.tierProgression, setUserProfile])

  // Robust profile/game score loading
  useEffect(() => {
    try {
      if (!userProfile || typeof userProfile !== 'object') {
        setProfileError(true)
      }
      if (!Array.isArray(gameScores)) {
        setProfileError(true)
      }
    } catch {
      setProfileError(true)
    }
  }, [userProfile, gameScores])

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
    setCurrentMode('creative') // Automatically route to Creative Game Hub after quiz
  }

  const handleSkipArchetype = () => {
    setUserProfile((prev): UserProfile => {
      if (!prev) return prev!
      return {
        ...prev,
        archetype: {
          primary: 'guardian',
          secondary: null,
          completedQuiz: true // Changed to true so quiz doesn't keep showing
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

  const handleResetProfile = () => {
    try {
      window.localStorage.clear()
      window.location.reload()
    } catch {
      setProfileError(true)
    }
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Profile or game data is corrupted</h2>
        <button className="px-6 py-3 rounded-xl bg-pink-600 text-white font-black text-lg shadow-lg border-4 border-pink-900" onClick={handleResetProfile}>
          Reset Profile & Restart
        </button>
      </div>
    )
  }

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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Capital</h2>
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
        <div className="fixed top-4 right-4 z-50">
          <MusicPlayer />
        </div>
        <ThreeJSModeSelection onSelectMode={handleModeSelect} />
        {import.meta.env.DEV && (
          <>
            <button
              onClick={() => setShowIPLint(true)}
              className="fixed bottom-4 left-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center text-lg transition-colors"
              title="IP Lint Scanner"
            >
              IP
            </button>
            {showIPLint && (
              <Suspense fallback={null}>
                <IPLintScreen onClose={() => setShowIPLint(false)} />
              </Suspense>
            )}
            <button
              onClick={() => setShowDeckSim(true)}
              className="fixed bottom-4 left-18 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center text-lg transition-colors"
              title="Scenario Deck Simulator"
            >
              🎲
            </button>
            {showDeckSim && (
              <Suspense fallback={null}>
                <ScenarioDeckSimulator onClose={() => setShowDeckSim(false)} />
              </Suspense>
            )}
          </>
        )}
      </>
    )
  }

  if (showArchetypeQuiz && !userProfile?.archetype?.completedQuiz) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<LoadingFallback />}>
          <ArchetypeQuiz
            onComplete={handleArchetypeComplete}
            onSkip={handleSkipArchetype}
          />
        </Suspense>
      </>
    )
  }

  if (currentMode === 'creative') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <OfflineIndicator />
        <div className="fixed top-4 right-4 z-50">
          <MusicPlayer />
        </div>
        <Suspense fallback={<LoadingFallback />}>
          {/* AI Chat Helper - always available */}
          <AIChatHelper 
            playerName={userProfile.name || 'Explorer'}
          />
          <DebugPanel
            userProfile={userProfile}
            currentMode={currentMode}
            isInitialized={isInitialized}
            gameScores={gameScores || []}
          />
          {import.meta.env.DEV && (
            <>
              <button
                onClick={() => setShowIPLint(true)}
                className="fixed bottom-4 left-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center text-lg transition-colors"
                title="IP Lint Scanner"
              >
                IP
              </button>
              {showIPLint && <IPLintScreen onClose={() => setShowIPLint(false)} />}
              <button
                onClick={() => setShowDeckSim(true)}
                className="fixed bottom-4 left-18 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center text-lg transition-colors"
                title="Scenario Deck Simulator"
              >
                🎲
              </button>
              {showDeckSim && (
                <Suspense fallback={null}>
                  <ScenarioDeckSimulator onClose={() => setShowDeckSim(false)} />
                </Suspense>
              )}
            </>
          )}
          {/* Enhanced Game Hub with 3D world, story mode, and more */}
          <EnhancedGameHub
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            gameScores={gameScores || []}
            onGameComplete={completeGame}
            onModeSwitch={handleModeSwitch}
          />
        </Suspense>
      </>
    )
  }

   if (currentMode === 'islands' && ISLANDS_ENABLED) {
     return (
       <>
         <Toaster position="top-right" richColors />
         <OfflineIndicator />
         <div className="fixed top-4 right-4 z-50">
           <MusicPlayer />
         </div>
         <Suspense fallback={<LoadingFallback />}>
           <DebugPanel
             userProfile={userProfile}
             currentMode={currentMode}
             isInitialized={isInitialized}
             gameScores={gameScores || []}
           />
           {import.meta.env.DEV && (
             <>
               <button
                 onClick={() => setShowIPLint(true)}
                 className="fixed bottom-4 left-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center text-lg transition-colors"
                 title="IP Lint Scanner"
               >
                 IP
               </button>
               {showIPLint && <IPLintScreen onClose={() => setShowIPLint(false)} />}
               <button
                 onClick={() => setShowDeckSim(true)}
                 className="fixed bottom-4 left-18 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center text-lg transition-colors"
                 title="Scenario Deck Simulator"
               >
                 🎲
               </button>
               {showDeckSim && (
                 <Suspense fallback={null}>
                   <ScenarioDeckSimulator onClose={() => setShowDeckSim(false)} />
                 </Suspense>
               )}
             </>
           )}
           <IslandsApp
             userProfile={userProfile}
             setUserProfile={setUserProfile}
             onExit={handleModeSwitch}
           />
         </Suspense>
       </>
     )
   }

  return (
    <>
      <Toaster position="top-right" richColors />
      <OfflineIndicator />
      <div className="fixed top-4 right-4 z-50">
        <MusicPlayer />
      </div>
      <Suspense fallback={<LoadingFallback />}>
        <DebugPanel
          userProfile={userProfile}
          currentMode={currentMode}
          isInitialized={isInitialized}
          gameScores={gameScores || []}
        />
        {import.meta.env.DEV && (
          <>
            <button
              onClick={() => setShowIPLint(true)}
              className="fixed bottom-4 left-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center text-lg transition-colors"
              title="IP Lint Scanner"
            >
              IP
            </button>
            {showIPLint && <IPLintScreen onClose={() => setShowIPLint(false)} />}
            <button
              onClick={() => setShowDeckSim(true)}
              className="fixed bottom-4 left-18 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center text-lg transition-colors"
              title="Scenario Deck Simulator"
            >
              🎲
            </button>
            {showDeckSim && (
              <Suspense fallback={null}>
                <ScenarioDeckSimulator onClose={() => setShowDeckSim(false)} />
              </Suspense>
            )}
          </>
        )}
      </Suspense>
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
