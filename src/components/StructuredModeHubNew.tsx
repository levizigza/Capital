import { useState, useCallback } from 'react'
import { useKV } from '@/hooks/use-safe-kv'
import { User } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ProfessionalGameHub } from '@/game/components/ProfessionalGameHub'
import type { GameScore } from '@/App'
import type { SkillLine } from '@/data/tiers'
import { useThrottledCallback } from '@/hooks/use-debounced-callback'
import StructuredModeDashboard from '@/components/StructuredModeDashboard'

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
  setUserProfile,
  gameScores,
  onGameComplete,
  onModeSwitch,
  onQuestComplete,
  onAllocateLineXP
}: StructuredModeHubProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const handleGameComplete = (gameId: string, score: number, timeSpent: number, additionalData?: Record<string, unknown>): void => {
    onGameComplete(gameId, score, timeSpent, additionalData)
    setIsPlaying(false)
    if (window.history.state && window.history.state.playing) {
      window.history.back()
    } else {
      window.history.pushState({ mode: 'structured', playing: false }, '', window.location.href)
    }
    
    toast.success('Game Completed!', {
      description: `Score: ${score} • Time: ${Math.floor(timeSpent / 1000)}s`
    })
  }

  const handleGameExit = useCallback(() => {
    setIsPlaying(false)
    if (window.history.state && window.history.state.playing) {
      window.history.back()
    } else {
      window.history.pushState({ mode: 'structured', playing: false }, '', window.location.href)
    }
  }, [])

  if (isPlaying) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <ProfessionalGameHub
          onGameComplete={handleGameComplete}
          onExit={handleGameExit}
          userTier="middle"
        />
      </div>
    )
  }

  return (
    <>
      <StructuredModeDashboard
        userProfile={userProfile}
        gameScores={gameScores}
        onModeSwitch={onModeSwitch}
        onOpenProfile={() => setShowProfile(true)}
      />

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User weight="fill" size={24} />
              User Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {userProfile.name?.[0] || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold">{userProfile.name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">Level {userProfile.level}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userProfile.xp}</p>
                    <p className="text-sm text-muted-foreground">Experience Points</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userProfile.totalCoins}</p>
                    <p className="text-sm text-muted-foreground">Total Coins</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userProfile.gamesCompleted}</p>
                    <p className="text-sm text-muted-foreground">Games Completed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userProfile.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
