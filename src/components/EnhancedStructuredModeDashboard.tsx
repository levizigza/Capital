import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Target, Clock, Fire, Coins, TrendUp, Lightning, CheckCircle,
  Calendar, Brain, BookOpen, Users, Star, Award, BarChart3, PieChart,
  Activity, Zap, Lock, Unlock, PlayCircle, ChevronRight, Heart,
  Flag, Milestone, Compass, Lightbulb, Eye, ArrowUp, ArrowDown, ArrowLeft, House
} from '@/lib/lucide'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import type { UserProfile, GameScore } from '@/App'
import { TIER_DATA, SKILL_LINES, type Tier, type Quest, type SkillLine } from '@/data/tiers'

interface EnhancedStructuredModeDashboardProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  onModeSwitch: () => void
  onOpenProfile: () => void
  onQuestStart: (questId: string) => void
  onQuestComplete: (tierId: number, questId: string) => void
  onAllocateLineXP: (line: SkillLine, amount: number) => void
}

export default function EnhancedStructuredModeDashboard({
  userProfile,
  gameScores,
  onModeSwitch,
  onOpenProfile,
  onQuestStart,
  onQuestComplete,
  onAllocateLineXP
}: EnhancedStructuredModeDashboardProps) {
  const [selectedTier, setSelectedTier] = useState<number>(1)
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null)

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const totalGames = gameScores.length
    const avgScore = totalGames > 0
      ? Math.round(gameScores.reduce((sum, g) => sum + g.score, 0) / totalGames)
      : 0
    const totalTime = gameScores.reduce((sum, g) => sum + g.timeSpent, 0)
    const avgTime = totalGames > 0 ? Math.round(totalTime / totalGames / 1000) : 0

    // Calculate skill line proficiencies based on game performance
    const skillProficiencies = Object.keys(SKILL_LINES).reduce((acc, line) => {
      const lineGames = gameScores.filter(g =>
        g.gameId.toLowerCase().includes(line.toLowerCase()) ||
        g.additionalData?.skillLine === line
      )
      const lineAvgScore = lineGames.length > 0
        ? lineGames.reduce((sum, g) => sum + g.score, 0) / lineGames.length
        : 0
      acc[line as SkillLine] = Math.min(100, Math.round(lineAvgScore))
      return acc
    }, {} as Record<SkillLine, number>)

    // Calculate learning path progress
    const currentTier = TIER_DATA.find(t => t.id === selectedTier) || TIER_DATA[0]
    const tierProgress = {
      total: currentTier.quests.length,
      completed: currentTier.quests.filter(q => q.completed).length,
      financialKPIProgress: currentTier.quests.reduce((sum, q) =>
        sum + (q.financialKPI.current / q.financialKPI.target), 0
      ) / currentTier.quests.length * 100
    }

    // Generate performance data for charts
    const performanceData = gameScores.slice(-12).map((score, idx) => ({
      day: `Day ${idx + 1}`,
      score: score.score,
      time: Math.round(score.timeSpent / 1000),
      efficiency: Math.round((score.score / Math.max(score.timeSpent / 1000, 1)) * 10)
    }))

    // Skill distribution data
    const skillDistribution = Object.entries(SKILL_LINES).map(([key, skill]) => ({
      name: skill.name,
      value: skillProficiencies[key as SkillLine],
      color: skill.color,
      icon: skill.icon
    }))

    return {
      totalGames,
      avgScore,
      avgTime,
      skillProficiencies,
      tierProgress,
      performanceData,
      skillDistribution,
      xpProgress: {
        current: userProfile.xp,
        nextLevel: userProfile.level * 100,
        progress: ((userProfile.xp % 100) / 100) * 100
      }
    }
  }, [gameScores, userProfile, selectedTier])

  const currentTier = useMemo(() =>
    TIER_DATA.find(t => t.id === selectedTier) || TIER_DATA[0],
    [selectedTier]
  )

  const getQuestStatusColor = (quest: Quest) => {
    if (quest.completed) return 'text-green-600 bg-green-50'
    if (quest.financialKPI.current > 0) return 'text-blue-600 bg-blue-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getQuestStatusIcon = (quest: Quest) => {
    if (quest.completed) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (quest.financialKPI.current > 0) return <PlayCircle className="w-5 h-5 text-blue-600" />
    return <Lock className="w-5 h-5 text-gray-400" />
  }

  const getDifficultyColor = (tierId: number) => {
    const colors = [
      'from-green-600 to-emerald-700',
      'from-blue-600 to-indigo-700',
      'from-purple-600 to-violet-700',
      'from-orange-600 to-amber-600',
      'from-teal-600 to-cyan-600',
      'from-yellow-500 to-amber-500',
      'from-cyan-500 to-teal-500',
      'from-rose-600 to-pink-700'
    ]
    return colors[tierId - 1] || colors[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header with prominent back button */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              {/* Prominent Back Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onModeSwitch}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <House className="w-5 h-5" />
                  <span className="font-bold">Back to Menu</span>
                </Button>
              </motion.div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center gap-2 text-lg font-semibold text-blue-700">
                <Trophy className="w-6 h-6" />
                <span>Structured Mode</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Progress</div>
                <div className="text-lg font-bold text-blue-700">Tier {selectedTier} • {analytics.tierProgress.completed}/{analytics.tierProgress.total} Quests</div>
              </div>
              <Button
                onClick={onOpenProfile}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold"
              >
                {userProfile.name?.[0] || 'U'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced KPI Section */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[
            {
              icon: Trophy,
              label: 'Quests Completed',
              value: analytics.tierProgress.completed,
              change: '+2 this week',
              trend: 'up'
            },
            {
              icon: Target,
              label: 'Financial Mastery',
              value: `${analytics.avgScore}%`,
              change: '+5% improvement',
              trend: 'up'
            },
            {
              icon: Brain,
              label: 'Learning Streak',
              value: `${userProfile.currentStreak} days`,
              change: 'Personal best!',
              trend: 'up'
            },
            {
              icon: Zap,
              label: 'Total XP',
              value: userProfile.xp,
              change: `${analytics.xpProgress.progress}% to next level`,
              trend: 'neutral'
            }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.trend === 'up' && <ArrowUp className="w-4 h-4" />}
                      {stat.trend === 'down' && <ArrowDown className="w-4 h-4" />}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        {/* Level Progress */}
        <motion.section className="mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Level {userProfile.level} Progress
                </CardTitle>
                <Badge variant="outline">{Math.round(analytics.xpProgress.progress)}% to Level {userProfile.level + 1}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={analytics.xpProgress.progress} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{userProfile.xp} XP</span>
                <span>{analytics.xpProgress.nextLevel} XP</span>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tier Progress - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tier Selection */}
            <motion.section>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-600" />
                    Learning Path
                  </CardTitle>
                  <CardDescription>Select your current learning tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {TIER_DATA.slice(0, 8).map((tier) => (
                      <Button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id)}
                        variant={selectedTier === tier.id ? "default" : "outline"}
                        className={`p-3 h-auto flex flex-col gap-2 ${
                          selectedTier === tier.id
                            ? `bg-gradient-to-br ${tier.gradient}`
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-lg font-bold">{tier.name}</div>
                        <div className="text-xs opacity-80">{tier.focus}</div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Current Tier Quests */}
            <motion.section>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Flag className="w-5 h-5" style={{ color: currentTier.color }} />
                        {currentTier.name} Tier Quests
                      </CardTitle>
                      <CardDescription>{currentTier.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {analytics.tierProgress.completed}/{analytics.tierProgress.total} Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentTier.quests.map((quest, idx) => (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        quest.completed
                          ? 'border-green-200 bg-green-50'
                          : quest.financialKPI.current > 0
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setExpandedQuest(expandedQuest === quest.id ? null : quest.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getQuestStatusIcon(quest)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{quest.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">{quest.description}</p>

                            {/* Financial KPI Progress */}
                            <div className="mb-2">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{quest.financialKPI.description}</span>
                                <span>{quest.financialKPI.current}/{quest.financialKPI.target}</span>
                              </div>
                              <Progress
                                value={(quest.financialKPI.current / quest.financialKPI.target) * 100}
                                className="h-2"
                              />
                            </div>

                            {/* Rewards */}
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <Coins className="w-3 h-3 text-yellow-600" />
                                <span>{quest.financeXP} Finance XP</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-purple-600" />
                                <span>{quest.lineXPReward} Skill XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedQuest === quest.id ? 'rotate-90' : ''
                          }`}
                        />
                      </div>

                      <AnimatePresence>
                        {expandedQuest === quest.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-2">Financial Task</h5>
                                <div className="text-sm text-gray-600">{quest.financialKPI.description}</div>
                                <div className="mt-2 text-lg font-bold" style={{ color: currentTier.color }}>
                                  {Math.round((quest.financialKPI.current / quest.financialKPI.target) * 100)}% Complete
                                </div>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-2">Skill Development</h5>
                                <div className="text-sm text-gray-600">{quest.softSkillKPI.description}</div>
                                <div className="mt-2">
                                  {quest.softSkillKPI.completed ? (
                                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                  ) : (
                                    <Badge variant="outline">In Progress</Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {!quest.completed && quest.financialKPI.current === 0 && (
                              <Button
                                className="mt-4 w-full"
                                style={{ backgroundColor: currentTier.color }}
                                onClick={() => onQuestStart(quest.id)}
                              >
                                Start Quest
                              </Button>
                            )}

                            {!quest.completed && quest.financialKPI.current > 0 && (
                              <Button
                                className="mt-4 w-full"
                                variant="outline"
                                onClick={() => onQuestComplete(currentTier.id, quest.id)}
                              >
                                Continue Quest
                              </Button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>
          </div>

          {/* Right Column - Analytics & Progress */}
          <div className="space-y-8">
            {/* Skill Line Proficiencies */}
            <motion.section>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Skill Proficiencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={analytics.skillDistribution}>
                      <PolarGrid strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar
                        name="Skill Level"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {Object.entries(analytics.skillProficiencies).map(([line, proficiency]) => {
                      const skill = SKILL_LINES[line as SkillLine]
                      return (
                        <div key={line} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs">
                            {skill.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">{skill.name}</span>
                              <span>{proficiency}%</span>
                            </div>
                            <Progress value={proficiency} className="h-1" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Performance Trends */}
            <motion.section>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendUp className="w-5 h-5 text-green-600" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={analytics.performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.section>

            {/* Achievements */}
            <motion.section>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.totalGames > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Trophy className="w-8 h-8 text-yellow-600" />
                        <div>
                          <div className="font-medium text-sm">First Steps</div>
                          <div className="text-xs text-gray-600">Completed your first game</div>
                        </div>
                      </div>
                    )}
                    {userProfile.currentStreak >= 7 && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <Fire className="w-8 h-8 text-orange-600" />
                        <div>
                          <div className="font-medium text-sm">Week Warrior</div>
                          <div className="text-xs text-gray-600">7-day learning streak</div>
                        </div>
                      </div>
                    )}
                    {analytics.avgScore >= 80 && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Star className="w-8 h-8 text-purple-600" />
                        <div>
                          <div className="font-medium text-sm">High Performer</div>
                          <div className="text-xs text-gray-600">80%+ average score</div>
                        </div>
                      </div>
                    )}
                    {analytics.totalGames === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Complete quests to unlock achievements</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  )
}