import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  GameController,
  Trophy,
  Clock,
  Fire,
  TrendUp,
  Coins,
  ChartLine,
  Target,
} from '@phosphor-icons/react'
import type { UserProfile, GameScore } from '@/App'

interface OverviewTabProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  language: 'en' | 'fr'
}

const translations = {
  en: {
    kpiTitle: 'Key Performance Indicators',
    gamesCompleted: 'Games Completed',
    averageScore: 'Average Score',
    timeInvested: 'Time Invested',
    currentStreak: 'Current Streak',
    level: 'Level',
    experiencePoints: 'Experience Points',
    totalCoins: 'Total Coins',
    skillsUnlocked: 'Skills Unlocked',
    recentActivity: 'Recent Activity',
    skillProgress: 'Skill Progress',
    progressToNextLevel: 'Progress to Next Level',
    minutes: 'minutes',
    days: 'days',
    noActivity: 'No recent activity. Start playing to see your progress!',
    budgeting: 'Budgeting',
    investing: 'Investing',
    debtManagement: 'Debt Management',
    profitCalculation: 'Profit Calculation',
  },
  fr: {
    kpiTitle: 'Indicateurs de Performance Clés',
    gamesCompleted: 'Jeux Complétés',
    averageScore: 'Score Moyen',
    timeInvested: 'Temps Investi',
    currentStreak: 'Série Actuelle',
    level: 'Niveau',
    experiencePoints: 'Points d\'Expérience',
    totalCoins: 'Pièces Totales',
    skillsUnlocked: 'Compétences Débloquées',
    recentActivity: 'Activité Récente',
    skillProgress: 'Progrès des Compétences',
    progressToNextLevel: 'Progrès vers le prochain niveau',
    minutes: 'minutes',
    days: 'jours',
    noActivity: 'Aucune activité récente. Commencez à jouer pour voir vos progrès!',
    budgeting: 'Budgétisation',
    investing: 'Investissement',
    debtManagement: 'Gestion de la Dette',
    profitCalculation: 'Calcul des Profits',
  },
}

export default function OverviewTab({
  userProfile,
  gameScores,
  language,
}: OverviewTabProps) {
  const t = translations[language]

  const stats = useMemo(() => {
    const totalGames = gameScores.length
    const totalTime = gameScores.reduce((acc, score) => acc + score.timeSpent, 0)
    const avgScore =
      totalGames > 0
        ? Math.round(
            gameScores.reduce((acc, score) => acc + score.score, 0) / totalGames
          )
        : 0

    return {
      totalGames,
      avgScore,
      totalTime: Math.round(totalTime / 60),
      streak: userProfile.currentStreak,
    }
  }, [gameScores, userProfile.currentStreak])

  const xpToNextLevel = 100
  const currentLevelXP = userProfile.xp % 100
  const progressPercentage = (currentLevelXP / xpToNextLevel) * 100

  const skillCategories = useMemo(() => [
    { name: t.budgeting, progress: 75, color: 'oklch(0.35 0.12 240)' },
    { name: t.investing, progress: 60, color: 'oklch(0.45 0.15 155)' },
    { name: t.debtManagement, progress: 45, color: 'oklch(0.65 0.15 65)' },
    { name: t.profitCalculation, progress: 80, color: 'oklch(0.58 0.15 25)' },
  ], [t])

  const recentGames = useMemo(
    () => gameScores.slice(-5).reverse(),
    [gameScores]
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-12"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">{t.kpiTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.gamesCompleted}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalGames}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <GameController weight="fill" size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.averageScore}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.avgScore}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Trophy weight="fill" size={24} className="text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.timeInvested}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalTime}
                    <span className="text-sm text-muted-foreground ml-1">
                      {t.minutes}
                    </span>
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Clock weight="fill" size={24} className="text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.currentStreak}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.streak}
                    <span className="text-sm text-muted-foreground ml-1">
                      {t.days}
                    </span>
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Fire weight="fill" size={24} className="text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp weight="fill" size={24} />
              {t.progressToNextLevel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {t.level} {userProfile.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {currentLevelXP} / {xpToNextLevel} XP
                  </span>
                </div>
                <span className="text-sm font-medium text-primary">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChartLine weight="bold" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.experiencePoints}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {userProfile.xp}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Coins weight="bold" size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.totalCoins}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {userProfile.totalCoins}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Target weight="bold" size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.skillsUnlocked}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {userProfile.skillsUnlocked.length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GameController weight="fill" size={24} />
              {t.recentActivity}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentGames.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t.noActivity}
              </p>
            ) : (
              <div className="space-y-3">
                {recentGames.map((game, index) => (
                  <div
                    key={`${game.gameId}-${game.date}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GameController weight="fill" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {game.gameId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(game.date).toLocaleDateString(
                            language === 'fr' ? 'fr-FR' : 'en-US'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{game.score}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(game.timeSpent / 60)} {t.minutes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-4"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target weight="fill" size={24} />
              {t.skillProgress}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillCategories.map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {skill.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {skill.progress}%
                  </span>
                </div>
                <Progress
                  value={skill.progress}
                  className="h-2"
                  style={
                    {
                      '--progress-color': skill.color,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
