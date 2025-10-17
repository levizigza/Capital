import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from 'sonner'
import ModeSelection from '@/components/ModeSelection'
import CreativeModeHub from '@/components/CreativeModeHub'
import StructuredModeHub from '@/components/StructuredModeHub'

export type LearningMode = 'creative' | 'structured' | null

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
    }
  })

  const [gameScores, setGameScores] = useKV<GameScore[]>('game-scores', [])
  const [currentMode, setCurrentMode] = useState<LearningMode>(userProfile?.preferredMode || null)

  useEffect(() => {
    if (userProfile?.preferredMode && !currentMode) {
      setCurrentMode(userProfile.preferredMode)
    }
  }, [userProfile?.preferredMode, currentMode])

  const handleModeSelect = (mode: LearningMode) => {
    setCurrentMode(mode)
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

  const handleModeSwitch = () => {
    setCurrentMode(null)
  }

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
      />
    </>
  )
}

export default App
