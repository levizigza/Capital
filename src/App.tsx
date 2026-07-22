import { useState, useEffect, useCallback, Suspense } from 'react'
import { useKV } from '@/hooks/use-safe-kv'
import { Toaster } from 'sonner'
import { motion } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'
import React from 'react'
import { ISLANDS_ENABLED, ISLANDS_DEFAULT } from '@/islands/featureFlags'
import { CapitalOpeningIntro, shouldPlayCapitalIntroOnBoot } from '@/islands/views/CapitalOpeningIntro'
import { CarpetOpeningIntro } from '@/islands/world3d/CarpetOpeningIntro'

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
/** Dev-only — never block production Islands boot on a stale DebugPanel chunk. */
const DebugPanel = import.meta.env.DEV
  ? React.lazy(() => import('@/components/DebugPanel').then(m => ({ default: m.DebugPanel })))
  : null
const IslandsApp = React.lazy(() =>
  import('@/islands/IslandsApp').catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    void import('@/lib/hardRecover').then(({ autoRecoverStaleChunkOnce }) => {
      autoRecoverStaleChunkOnce(message || 'Failed to fetch dynamically imported module')
    })
    throw err instanceof Error ? err : new Error(message)
  }),
)
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

function resolveStartupMode(): LearningMode {
  if (typeof window === "undefined") return "islands";
  // Islands-only product for now. Legacy modes only via ?legacy=1&mode=creative|structured|select
  const params = new URLSearchParams(window.location.search);
  const legacy = params.get("legacy") === "1";
  const requested = params.get("mode");
  if (legacy && (requested === "creative" || requested === "structured" || requested === "select")) {
    return requested === "select" ? null : requested;
  }
  if (ISLANDS_ENABLED) return "islands";
  return null;
}

function App() {
  // ?fresh query param wipes saved state for a clean demo
  if (typeof window !== 'undefined' && window.location.search.includes('fresh')) {
    localStorage.removeItem('kv_user-profile')
    localStorage.removeItem('kv_game-scores')
    localStorage.removeItem('kv_island_save_v1')
    try {
      sessionStorage.removeItem('capital_intro_seen_v1')
      sessionStorage.removeItem('capital_intro_done_for_boot')
    } catch {
      /* ignore */
    }
    window.history.replaceState(null, '', window.location.pathname)
    window.location.reload()
  }

  const [userProfile, setUserProfile] = useKV<UserProfile>('user-profile', DEFAULT_USER_PROFILE)
  const [gameScores, setGameScores] = useKV<GameScore[]>('game-scores', [])
  const [currentMode, setCurrentMode] = useState<LearningMode>(resolveStartupMode)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showArchetypeQuiz, setShowArchetypeQuiz] = useState(false)
  const [profileError, setProfileError] = useState(false)
  const [showIPLint, setShowIPLint] = useState(false)
  const [showDeckSim, setShowDeckSim] = useState(false)
  const [showCapitalIntro, setShowCapitalIntro] = useState(() => shouldPlayCapitalIntroOnBoot())
  /** Title mural first, then carpet POV flight into Harbor. */
  const [bootPhase, setBootPhase] = useState<"title" | "carpet">("title")

  // Every full page load: title mural → carpet flight (QA may opt out with skipIntro).
  useEffect(() => {
    if (shouldPlayCapitalIntroOnBoot()) {
      setShowCapitalIntro(true)
      setBootPhase("title")
      setCurrentMode("islands")
    }
  }, [])

  // Capital boots into islands — never fall back to the legacy mode picker by accident.
  useEffect(() => {
    if (!ISLANDS_ENABLED || !ISLANDS_DEFAULT) return
    const params = new URLSearchParams(window.location.search)
    const requested = params.get("mode")
    if (requested === "creative" || requested === "structured" || requested === "select") return
    if (currentMode !== "islands") {
      setCurrentMode("islands")
      window.history.replaceState({ mode: "islands" }, "", window.location.href)
    }
  }, [currentMode])

  useEffect(() => {
    if (userProfile) {
      setIsInitialized(true)
      const islandsFirst = currentMode === "islands" && ISLANDS_DEFAULT
      if (!userProfile.archetype?.completedQuiz && currentMode !== null && !islandsFirst) {
        setShowArchetypeQuiz(true)
      }
    }
  }, [userProfile, currentMode])

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.mode !== undefined) {
        setCurrentMode(event.state.mode)
      } else if (ISLANDS_DEFAULT && ISLANDS_ENABLED) {
        setCurrentMode("islands")
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
    // Route into the island launcher after the intro, unless the player is
    // deliberately in a legacy mode.
    setCurrentMode((prev) => (prev === 'creative' || prev === 'structured') ? prev : (ISLANDS_DEFAULT ? 'islands' : 'creative'))
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
    // Islands-only: "Exit" returns to Harbor hub, not the legacy mode picker.
    setCurrentMode("islands");
    const newState: NavigationState = { mode: "islands" };
    window.history.pushState(newState, "", window.location.href);
  }, []);

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

  // Boot: Capital title mural → carpet POV flight to Harbor Haven.
  if (showCapitalIntro && ISLANDS_ENABLED) {
    return (
      <>
        <Toaster position="top-right" richColors />
        {bootPhase === "title" ? (
          <CapitalOpeningIntro
            key="capital-opening-boot"
            onComplete={() => setBootPhase("carpet")}
          />
        ) : (
          <CarpetOpeningIntro
            key="capital-carpet-boot"
            onComplete={() => {
              setShowCapitalIntro(false)
              setBootPhase("title")
              setCurrentMode("islands")
            }}
          />
        )}
      </>
    )
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
        <div className="min-h-screen flex items-center justify-center cap-surface">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[var(--cap-gold)] mb-6 shadow-[var(--cap-shadow-ink)] border-2 border-[var(--cap-ink)]"
            >
              <Sparkle className="w-10 h-10 text-[var(--cap-ink)]" weight="fill" />
            </motion.div>
            <h2 className="cap-display text-2xl text-[var(--cap-ink)] mb-2">Capital</h2>
            <p className="text-lg text-[var(--cap-ink-soft)]">Loading your island adventure…</p>
          </div>
        </div>
      </>
    )
  }

  if (!currentMode) {
    // Legacy mode picker only when explicitly requested (?legacy=1&mode=select).
    // Otherwise stay islands-only.
    if (ISLANDS_ENABLED) {
      return (
        <>
          <Toaster position="top-right" richColors />
          <div className="min-h-screen flex items-center justify-center cap-surface">
            <p className="text-[var(--cap-ink-soft)]">Launching Harbor Haven…</p>
          </div>
        </>
      )
    }
    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="fixed top-4 right-4 z-50">
          <MusicPlayer />
        </div>
        <ThreeJSModeSelection onSelectMode={handleModeSelect} />
      </>
    )
  }

  // Islands is the product.
  if (currentMode === "islands" && ISLANDS_ENABLED) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <OfflineIndicator />
        <div className="fixed top-4 right-4 z-50">
          <MusicPlayer />
        </div>
        <Suspense fallback={<LoadingFallback />}>
          {DebugPanel ? (
            <DebugPanel
              userProfile={userProfile}
              currentMode={currentMode}
              isInitialized={isInitialized}
              gameScores={gameScores || []}
            />
          ) : null}
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
          <IslandsApp
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onExit={handleModeSwitch}
            onReplayIntro={() => {
              try {
                sessionStorage.removeItem("capital_intro_done_for_boot")
                sessionStorage.removeItem("capital_intro_seen_v1")
              } catch {
                /* ignore */
              }
              setBootPhase("title")
              setShowCapitalIntro(true)
            }}
          />
        </Suspense>
      </>
    )
  }

  if (currentMode === "creative") {
    return (
      <>
        <Toaster position="top-right" richColors />
        <OfflineIndicator />
        <div className="fixed top-4 right-4 z-50">
          <MusicPlayer />
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <AIChatHelper playerName={userProfile.name || "Explorer"} />
          {DebugPanel ? (
            <DebugPanel
              userProfile={userProfile}
              currentMode={currentMode}
              isInitialized={isInitialized}
              gameScores={gameScores || []}
            />
          ) : null}
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

  if (currentMode === "structured") {
    return (
      <>
        <Toaster position="top-right" richColors />
        <OfflineIndicator />
        <div className="fixed top-4 right-4 z-50">
          <MusicPlayer />
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <StructuredModeHub
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            gameScores={gameScores || []}
            onGameComplete={completeGame}
            onModeSwitch={handleModeSwitch}
            onQuestComplete={handleQuestComplete}
            onAllocateLineXP={handleAllocateLineXP}
          />
        </Suspense>
      </>
    )
  }

  // Fallback: stay in islands if somehow mode is unknown
  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 cap-surface">
        <p className="text-[var(--cap-ink-soft)]">Returning to Harbor Haven…</p>
        <button
          type="button"
          className="rounded-xl border-2 border-[var(--cap-ink)] bg-[var(--cap-gold)] px-5 py-2 font-bold"
          onClick={() => setCurrentMode("islands")}
        >
          Enter islands
        </button>
      </div>
    </>
  )
}

export default App
