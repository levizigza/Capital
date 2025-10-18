import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartLine, ChartBar, ChartPie } from '@phosphor-icons/react'
import type { UserProfile, GameScore } from '@/App'

interface AnalyticsTabProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  language: 'en' | 'fr'
}

const translations = {
  en: {
    performanceTrends: 'Performance Trends',
    scoreOverTime: 'Score Over Time',
    skillComparison: 'Skill Comparison',
    categoryDistribution: 'Category Distribution',
    score: 'Score',
    game: 'Game',
    category: 'Category',
    count: 'Count',
    budgeting: 'Budgeting',
    investing: 'Investing',
    debtManagement: 'Debt Management',
    profitCalculation: 'Profit Calculation',
    noData: 'No data available yet. Play some games to see your analytics!',
  },
  fr: {
    performanceTrends: 'Tendances de Performance',
    scoreOverTime: 'Score au Fil du Temps',
    skillComparison: 'Comparaison des Compétences',
    categoryDistribution: 'Distribution par Catégorie',
    score: 'Score',
    game: 'Jeu',
    category: 'Catégorie',
    count: 'Nombre',
    budgeting: 'Budgétisation',
    investing: 'Investissement',
    debtManagement: 'Gestion de la Dette',
    profitCalculation: 'Calcul des Profits',
    noData: 'Aucune donnée disponible. Jouez pour voir vos analyses!',
  },
}

const COLORS = [
  'oklch(0.35 0.12 240)',
  'oklch(0.45 0.15 155)',
  'oklch(0.65 0.15 65)',
  'oklch(0.58 0.15 25)',
]

export default function AnalyticsTab({
  userProfile,
  gameScores,
  language,
}: AnalyticsTabProps) {
  const t = translations[language]

  const scoreOverTime = useMemo(() => {
    return gameScores.map((score, index) => ({
      name: `${t.game} ${index + 1}`,
      score: score.score,
    }))
  }, [gameScores, t.game])

  const skillComparison = useMemo(() => {
    return [
      { name: t.budgeting, value: 75 },
      { name: t.investing, value: 60 },
      { name: t.debtManagement, value: 45 },
      { name: t.profitCalculation, value: 80 },
    ]
  }, [t])

  const categoryDistribution = useMemo(() => {
    const categories = {
      [t.budgeting]: 0,
      [t.investing]: 0,
      [t.debtManagement]: 0,
      [t.profitCalculation]: 0,
    }

    gameScores.forEach((score) => {
      if (score.gameId.toLowerCase().includes('budget')) {
        categories[t.budgeting]++
      } else if (score.gameId.toLowerCase().includes('invest')) {
        categories[t.investing]++
      } else if (score.gameId.toLowerCase().includes('debt') || score.gameId.toLowerCase().includes('credit')) {
        categories[t.debtManagement]++
      } else {
        categories[t.profitCalculation]++
      }
    })

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }))
  }, [gameScores, t])

  if (gameScores.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <ChartLine size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.noData}</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine weight="fill" size={24} />
              {t.scoreOverTime}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={scoreOverTime}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.008 240)" />
                <XAxis
                  dataKey="name"
                  stroke="oklch(0.48 0.010 240)"
                  tick={{ fill: 'oklch(0.48 0.010 240)' }}
                />
                <YAxis
                  stroke="oklch(0.48 0.010 240)"
                  tick={{ fill: 'oklch(0.48 0.010 240)' }}
                  label={{
                    value: t.score,
                    angle: -90,
                    position: 'insideLeft',
                    fill: 'oklch(0.48 0.010 240)',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.90 0.008 240)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="oklch(0.35 0.12 240)"
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.35 0.12 240)', r: 4 }}
                  activeDot={{ r: 6 }}
                  name={t.score}
                  aria-label={`${t.scoreOverTime} line chart`}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar weight="fill" size={24} />
                {t.skillComparison}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={skillComparison}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.008 240)" />
                  <XAxis
                    dataKey="name"
                    stroke="oklch(0.48 0.010 240)"
                    tick={{ fill: 'oklch(0.48 0.010 240)', fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="oklch(0.48 0.010 240)"
                    tick={{ fill: 'oklch(0.48 0.010 240)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0.008 240)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="oklch(0.45 0.15 155)"
                    radius={[8, 8, 0, 0]}
                    name={t.score}
                    aria-label={`${t.skillComparison} bar chart`}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartPie weight="fill" size={24} />
                {t.categoryDistribution}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="oklch(0.35 0.12 240)"
                    dataKey="value"
                    aria-label={`${t.categoryDistribution} pie chart`}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0.008 240)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
