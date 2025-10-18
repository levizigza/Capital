import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Lightbulb,
  TrendUp,
  TrendDown,
  ArrowRight,
  Brain,
  Target,
  Clock,
  Fire,
} from '@phosphor-icons/react'
import type { UserProfile, GameScore } from '@/App'

interface InsightsTabProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  language: 'en' | 'fr'
}

interface Insight {
  id: string
  type: 'strength' | 'improvement' | 'recommendation' | 'milestone'
  title: string
  description: string
  action?: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
}

const translations = {
  en: {
    aiInsights: 'AI-Powered Insights',
    strengths: 'Your Strengths',
    improvements: 'Areas for Improvement',
    recommendations: 'Recommendations',
    milestones: 'Upcoming Milestones',
    takeAction: 'Take Action',
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
    noInsights: 'Play more games to receive personalized insights!',
    basedOnPerformance: 'Based on your performance data',
  },
  fr: {
    aiInsights: 'Perspectives IA',
    strengths: 'Vos Forces',
    improvements: 'Axes d\'Amélioration',
    recommendations: 'Recommandations',
    milestones: 'Jalons à Venir',
    takeAction: 'Agir',
    high: 'Priorité Haute',
    medium: 'Priorité Moyenne',
    low: 'Priorité Basse',
    noInsights: 'Jouez plus pour recevoir des perspectives personnalisées!',
    basedOnPerformance: 'Basé sur vos données de performance',
  },
}

export default function InsightsTab({
  userProfile,
  gameScores,
  language,
}: InsightsTabProps) {
  const t = translations[language]

  const insights = useMemo<Insight[]>(() => {
    const avgScore =
      gameScores.length > 0
        ? gameScores.reduce((acc, s) => acc + s.score, 0) / gameScores.length
        : 0
    const recentScores = gameScores.slice(-5)
    const recentAvg =
      recentScores.length > 0
        ? recentScores.reduce((acc, s) => acc + s.score, 0) / recentScores.length
        : 0

    const generatedInsights: Insight[] = []

    if (avgScore > 70) {
      generatedInsights.push({
        id: 'high-performer',
        type: 'strength',
        title:
          language === 'en' ? 'Excellent Performance' : 'Performance Excellente',
        description:
          language === 'en'
            ? `Your average score of ${Math.round(avgScore)} shows strong financial knowledge!`
            : `Votre score moyen de ${Math.round(avgScore)} montre de solides connaissances financières!`,
        icon: <TrendUp weight="fill" size={24} />,
        priority: 'high',
      })
    }

    if (recentAvg > avgScore && gameScores.length >= 5) {
      generatedInsights.push({
        id: 'improving',
        type: 'strength',
        title: language === 'en' ? 'On the Rise' : 'En Progression',
        description:
          language === 'en'
            ? 'Your recent performance shows improvement. Keep it up!'
            : 'Votre performance récente montre une amélioration. Continuez!',
        icon: <Fire weight="fill" size={24} />,
        priority: 'medium',
      })
    }

    if (userProfile.currentStreak < 3) {
      generatedInsights.push({
        id: 'build-streak',
        type: 'improvement',
        title:
          language === 'en'
            ? 'Build Your Streak'
            : 'Construisez Votre Série',
        description:
          language === 'en'
            ? 'Playing consistently helps reinforce learning. Try to play daily!'
            : 'Jouer régulièrement aide à renforcer l\'apprentissage. Essayez de jouer quotidiennement!',
        action:
          language === 'en'
            ? 'Start Today'
            : 'Commencer Aujourd\'hui',
        icon: <Clock weight="fill" size={24} />,
        priority: 'medium',
      })
    }

    if (avgScore < 50 && gameScores.length >= 3) {
      generatedInsights.push({
        id: 'practice-more',
        type: 'improvement',
        title:
          language === 'en'
            ? 'Practice Makes Perfect'
            : 'La Pratique Rend Parfait',
        description:
          language === 'en'
            ? 'Try focusing on one skill area at a time to build confidence.'
            : 'Essayez de vous concentrer sur un domaine de compétence à la fois pour gagner en confiance.',
        action:
          language === 'en'
            ? 'Choose a Game'
            : 'Choisir un Jeu',
        icon: <Target weight="fill" size={24} />,
        priority: 'high',
      })
    }

    if (userProfile.level >= 3 && userProfile.level < 5) {
      generatedInsights.push({
        id: 'level-5-milestone',
        type: 'milestone',
        title:
          language === 'en'
            ? 'Level 5 Approaching'
            : 'Niveau 5 Approchant',
        description:
          language === 'en'
            ? `You're ${5 - userProfile.level} level(s) away from unlocking advanced features!`
            : `Vous êtes à ${5 - userProfile.level} niveau(x) de débloquer des fonctionnalités avancées!`,
        icon: <TrendUp weight="fill" size={24} />,
        priority: 'low',
      })
    }

    generatedInsights.push({
      id: 'diverse-practice',
      type: 'recommendation',
      title:
        language === 'en'
          ? 'Diversify Your Skills'
          : 'Diversifiez Vos Compétences',
      description:
        language === 'en'
          ? 'Try games from different categories to build well-rounded financial knowledge.'
          : 'Essayez des jeux de différentes catégories pour développer des connaissances financières complètes.',
      action:
        language === 'en'
          ? 'Explore Games'
          : 'Explorer les Jeux',
      icon: <Brain weight="fill" size={24} />,
      priority: 'medium',
    })

    return generatedInsights
  }, [userProfile, gameScores, language])

  const strengthInsights = useMemo(
    () => insights.filter((i) => i.type === 'strength'),
    [insights]
  )
  const improvementInsights = useMemo(
    () => insights.filter((i) => i.type === 'improvement'),
    [insights]
  )
  const recommendationInsights = useMemo(
    () => insights.filter((i) => i.type === 'recommendation'),
    [insights]
  )
  const milestoneInsights = useMemo(
    () => insights.filter((i) => i.type === 'milestone'),
    [insights]
  )

  const getPriorityColor = (priority: Insight['priority']) => {
    const colors = {
      high: 'oklch(0.58 0.15 25)',
      medium: 'oklch(0.65 0.15 65)',
      low: 'oklch(0.35 0.12 240)',
    }
    return colors[priority]
  }

  const getTypeColor = (type: Insight['type']) => {
    const colors = {
      strength: 'oklch(0.45 0.15 155)',
      improvement: 'oklch(0.65 0.15 65)',
      recommendation: 'oklch(0.35 0.12 240)',
      milestone: 'oklch(0.55 0.20 280)',
    }
    return colors[type]
  }

  const InsightCard = ({ insight }: { insight: Insight }) => (
    <Card
      className="relative overflow-hidden"
      style={{
        borderLeft: `4px solid ${getTypeColor(insight.type)}`,
      }}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${getTypeColor(insight.type)}20`,
              color: getTypeColor(insight.type),
            }}
          >
            {insight.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-foreground">{insight.title}</h4>
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: getPriorityColor(insight.priority),
                  color: getPriorityColor(insight.priority),
                }}
              >
                {t[insight.priority]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {insight.description}
            </p>
            {insight.action && (
              <Button size="sm" variant="outline" className="gap-2">
                {insight.action}
                <ArrowRight weight="bold" size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (gameScores.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Lightbulb size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.noInsights}</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Lightbulb weight="fill" size={32} className="text-accent" />
            {t.aiInsights}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">{t.basedOnPerformance}</p>
      </motion.div>

      {strengthInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendUp weight="fill" size={24} className="text-secondary" />
            {t.strengths}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {strengthInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </motion.div>
      )}

      {improvementInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendDown weight="fill" size={24} className="text-accent" />
            {t.improvements}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {improvementInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </motion.div>
      )}

      {recommendationInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain weight="fill" size={24} className="text-primary" />
            {t.recommendations}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recommendationInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </motion.div>
      )}

      {milestoneInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target weight="fill" size={24} className="text-accent" />
            {t.milestones}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {milestoneInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
