import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Star,
  Medal,
  Crown,
  Fire,
  Target,
  Coins,
  Lightning,
} from '@phosphor-icons/react'
import type { UserProfile } from '@/App'

interface AchievementsTabProps {
  userProfile: UserProfile
  language: 'en' | 'fr'
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  progress: number
  target: number
  unlocked: boolean
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const translations = {
  en: {
    myAchievements: 'My Achievements',
    unlocked: 'Unlocked',
    locked: 'Locked',
    progress: 'Progress',
    all: 'All',
    financial: 'Financial',
    gameplay: 'Gameplay',
    social: 'Social',
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
    noAchievements: 'Keep playing to unlock achievements!',
  },
  fr: {
    myAchievements: 'Mes Réalisations',
    unlocked: 'Débloqué',
    locked: 'Verrouillé',
    progress: 'Progrès',
    all: 'Tous',
    financial: 'Financier',
    gameplay: 'Gameplay',
    social: 'Social',
    common: 'Commun',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
    noAchievements: 'Continuez à jouer pour débloquer des réalisations!',
  },
}

export default function AchievementsTab({
  userProfile,
  language,
}: AchievementsTabProps) {
  const t = translations[language]

  const achievements = useMemo<Achievement[]>(() => {
    const userLevel = userProfile.level
    const userCoins = userProfile.totalCoins
    const gamesCompleted = userProfile.gamesCompleted
    const streak = userProfile.currentStreak

    return [
      {
        id: 'first-game',
        title: language === 'en' ? 'First Steps' : 'Premiers Pas',
        description:
          language === 'en'
            ? 'Complete your first game'
            : 'Complétez votre premier jeu',
        icon: <Star weight="fill" size={24} />,
        progress: Math.min(gamesCompleted, 1),
        target: 1,
        unlocked: gamesCompleted >= 1,
        category: 'gameplay',
        rarity: 'common',
      },
      {
        id: 'ten-games',
        title: language === 'en' ? 'Getting Started' : 'Bon Début',
        description:
          language === 'en'
            ? 'Complete 10 games'
            : 'Complétez 10 jeux',
        icon: <Trophy weight="fill" size={24} />,
        progress: Math.min(gamesCompleted, 10),
        target: 10,
        unlocked: gamesCompleted >= 10,
        category: 'gameplay',
        rarity: 'common',
      },
      {
        id: 'level-5',
        title: language === 'en' ? 'Rising Star' : 'Étoile Montante',
        description:
          language === 'en' ? 'Reach level 5' : 'Atteignez le niveau 5',
        icon: <Medal weight="fill" size={24} />,
        progress: Math.min(userLevel, 5),
        target: 5,
        unlocked: userLevel >= 5,
        category: 'gameplay',
        rarity: 'rare',
      },
      {
        id: 'level-10',
        title: language === 'en' ? 'Financial Expert' : 'Expert Financier',
        description:
          language === 'en' ? 'Reach level 10' : 'Atteignez le niveau 10',
        icon: <Crown weight="fill" size={24} />,
        progress: Math.min(userLevel, 10),
        target: 10,
        unlocked: userLevel >= 10,
        category: 'gameplay',
        rarity: 'epic',
      },
      {
        id: 'streak-7',
        title: language === 'en' ? 'Week Warrior' : 'Guerrier de la Semaine',
        description:
          language === 'en'
            ? 'Maintain a 7-day streak'
            : 'Maintenez une série de 7 jours',
        icon: <Fire weight="fill" size={24} />,
        progress: Math.min(streak, 7),
        target: 7,
        unlocked: streak >= 7,
        category: 'gameplay',
        rarity: 'rare',
      },
      {
        id: 'coins-1000',
        title: language === 'en' ? 'Coin Collector' : 'Collectionneur de Pièces',
        description:
          language === 'en'
            ? 'Collect 1,000 coins'
            : 'Collectez 1 000 pièces',
        icon: <Coins weight="fill" size={24} />,
        progress: Math.min(userCoins, 1000),
        target: 1000,
        unlocked: userCoins >= 1000,
        category: 'financial',
        rarity: 'common',
      },
      {
        id: 'coins-5000',
        title: language === 'en' ? 'Wealth Builder' : 'Bâtisseur de Richesse',
        description:
          language === 'en'
            ? 'Collect 5,000 coins'
            : 'Collectez 5 000 pièces',
        icon: <Target weight="fill" size={24} />,
        progress: Math.min(userCoins, 5000),
        target: 5000,
        unlocked: userCoins >= 5000,
        category: 'financial',
        rarity: 'epic',
      },
      {
        id: 'coins-10000',
        title: language === 'en' ? 'Finance Legend' : 'Légende Financière',
        description:
          language === 'en'
            ? 'Collect 10,000 coins'
            : 'Collectez 10 000 pièces',
        icon: <Lightning weight="fill" size={24} />,
        progress: Math.min(userCoins, 10000),
        target: 10000,
        unlocked: userCoins >= 10000,
        category: 'financial',
        rarity: 'legendary',
      },
    ]
  }, [userProfile, language])

  const unlockedAchievements = useMemo(
    () => achievements.filter((a) => a.unlocked),
    [achievements]
  )

  const lockedAchievements = useMemo(
    () => achievements.filter((a) => !a.unlocked),
    [achievements]
  )

  const getRarityColor = (rarity: Achievement['rarity']) => {
    const colors = {
      common: 'oklch(0.48 0.010 240)',
      rare: 'oklch(0.35 0.12 240)',
      epic: 'oklch(0.55 0.20 280)',
      legendary: 'oklch(0.65 0.15 65)',
    }
    return colors[rarity]
  }

  const getRarityBadgeVariant = (rarity: Achievement['rarity']) => {
    const variants = {
      common: 'secondary' as const,
      rare: 'default' as const,
      epic: 'default' as const,
      legendary: 'default' as const,
    }
    return variants[rarity]
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy weight="fill" size={32} className="text-accent" />
          {t.myAchievements}
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-base px-4 py-1">
            {unlockedAchievements.length} / {achievements.length}
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {t.progress} - {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress
              value={(unlockedAchievements.length / achievements.length) * 100}
              className="h-3"
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t.unlocked} ({unlockedAchievements.length})
        </h3>
        {unlockedAchievements.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.noAchievements}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="relative overflow-hidden"
                style={{
                  borderColor: getRarityColor(achievement.rarity),
                  borderWidth: '2px',
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${getRarityColor(achievement.rarity)}20`,
                        color: getRarityColor(achievement.rarity),
                      }}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {achievement.title}
                        </h4>
                        <Badge
                          variant={getRarityBadgeVariant(achievement.rarity)}
                          className="text-xs"
                          style={{
                            backgroundColor: getRarityColor(achievement.rarity),
                            color: 'white',
                          }}
                        >
                          {t[achievement.rarity]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Progress value={100} className="h-2 flex-1" />
                        <span className="text-xs text-primary font-medium">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {lockedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t.locked} ({lockedAchievements.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="relative opacity-60 hover:opacity-80 transition-opacity"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {achievement.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {t[achievement.rarity]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Progress
                          value={(achievement.progress / achievement.target) * 100}
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
