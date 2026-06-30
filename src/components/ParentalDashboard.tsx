import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Clock, Target, Award, BookOpen, Heart,
  BarChart3, PieChart, Calendar, Download, Share2, Mail,
  CheckCircle, AlertTriangle, Star, Trophy, Brain, Eye,
  Activity, DollarSign, Lightbulb, Gamepad2, Compass
} from '@/lib/lucide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { UserProfile, GameScore } from '@/App';

interface ParentalDashboardProps {
  userProfile: UserProfile;
  gameScores: GameScore[];
  children: UserProfile[];
  onExportReport: () => void;
  onShareProgress: () => void;
  onScheduleMeeting: () => void;
}

interface ChildProgress {
  child: UserProfile;
  scores: GameScore[];
  weeklyProgress: WeeklyData[];
  skillDevelopment: SkillData[];
  recentAchievements: Achievement[];
  financialLiteracyLevel: number;
  recommendedActivities: Activity[];
}

interface WeeklyData {
  week: string;
  gamesPlayed: number;
  averageScore: number;
  timeSpent: number;
  conceptsLearned: string[];
}

interface SkillData {
  skill: string;
  level: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'milestone' | 'streak' | 'mastery' | 'social';
  icon: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'real-world' | 'discussion' | 'practice' | 'creative';
  ageAppropriate: boolean;
  duration: string;
  materials: string[];
}

// Mock data generation for demonstration
const generateChildProgress = (child: UserProfile, allScores: GameScore[]): ChildProgress => {
  const childScores = allScores.filter(score => score.userId === child.id);

  // Generate weekly progress data
  const weeklyProgress: WeeklyData[] = [
    { week: 'Week 1', gamesPlayed: 3, averageScore: 75, timeSpent: 45, conceptsLearned: ['Saving', 'Needs vs Wants'] },
    { week: 'Week 2', gamesPlayed: 5, averageScore: 82, timeSpent: 65, conceptsLearned: ['Budgeting', 'Sharing'] },
    { week: 'Week 3', gamesPlayed: 4, averageScore: 88, timeSpent: 55, conceptsLearned: ['Goal Setting'] },
    { week: 'Week 4', gamesPlayed: 6, averageScore: 91, timeSpent: 78, conceptsLearned: ['Patience', 'Planning'] },
  ];

  // Generate skill development data
  const skillDevelopment: SkillData[] = [
    { skill: 'Saving Habits', level: 85, trend: 'up', description: 'Consistently saving virtual coins in games' },
    { skill: 'Needs vs Wants', level: 78, trend: 'up', description: 'Making thoughtful spending choices' },
    { skill: 'Goal Setting', level: 92, trend: 'stable', description: 'Setting and achieving saving goals' },
    { skill: 'Sharing & Generosity', level: 70, trend: 'up', description: 'Understanding the value of helping others' },
  ];

  // Generate recent achievements
  const recentAchievements: Achievement[] = [
    {
      id: 'first-week-streak',
      title: 'Week Warrior!',
      description: 'Completed activities every day for a week',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'streak',
      icon: '🔥'
    },
    {
      id: 'savings-master',
      title: 'Super Saver',
      description: 'Saved 100 coins in the Treasure Hunt game',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      type: 'mastery',
      icon: '💰'
    },
    {
      id: 'helping-hand',
      title: 'Helpful Friend',
      description: 'Shared virtual resources with game characters',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: 'social',
      icon: '🤝'
    }
  ];

  // Generate recommended activities
  const recommendedActivities: Activity[] = [
    {
      id: 'real-piggy-bank',
      title: 'Real Piggy Bank Adventure',
      description: 'Help your child set up a real piggy bank and set a savings goal',
      category: 'real-world',
      ageAppropriate: true,
      duration: '15 minutes daily',
      materials: ['Piggy bank', 'Coins', 'Goal chart']
    },
    {
      id: 'store-budget',
      title: 'Grocery Store Budget',
      description: 'Give your child a small budget for treats at the grocery store',
      category: 'real-world',
      ageAppropriate: true,
      duration: '30 minutes',
      materials: ['Shopping list', 'Budget amount', 'Store']
    },
    {
      id: 'money-talks',
      title: 'Money Talks',
      description: 'Have family discussions about where money comes from and where it goes',
      category: 'discussion',
      ageAppropriate: true,
      duration: '20 minutes',
      materials: ['Quiet time', 'Open attitude']
    },
    {
      id: 'lemonade-stand',
      title: 'Mini Lemonade Stand',
      description: 'Set up a small stand to learn about earning and pricing',
      category: 'practice',
      ageAppropriate: true,
      duration: '2-3 hours',
      materials: ['Lemonade', 'Cups', 'Sign', 'Price list']
    }
  ];

  const financialLiteracyLevel = Math.round(
    (childScores.reduce((sum, score) => sum + score.score, 0) / Math.max(childScores.length, 1)) * 0.8 +
    (child.currentStreak * 5)
  );

  return {
    child,
    scores: childScores,
    weeklyProgress,
    skillDevelopment,
    recentAchievements,
    financialLiteracyLevel,
    recommendedActivities
  };
};

export default function ParentalDashboard({
  userProfile,
  gameScores,
  children,
  onExportReport,
  onShareProgress,
  onScheduleMeeting
}: ParentalDashboardProps) {
  const [selectedChild, setSelectedChild] = useState<UserProfile>(children[0] || userProfile);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  // Generate progress data for all children
  const childrenProgress = useMemo(() => {
    return children.map(child => generateChildProgress(child, gameScores));
  }, [children, gameScores]);

  const selectedProgress = useMemo(() => {
    return childrenProgress.find(cp => cp.child.id === selectedChild.id) || childrenProgress[0];
  }, [childrenProgress, selectedChild]);

  // Aggregate family statistics
  const familyStats = useMemo(() => {
    const totalGames = childrenProgress.reduce((sum, cp) => sum + cp.scores.length, 0);
    const avgScore = totalGames > 0
      ? Math.round(childrenProgress.reduce((sum, cp) =>
          sum + cp.scores.reduce((s, score) => s + score.score, 0), 0) / totalGames)
      : 0;
    const totalTime = childrenProgress.reduce((sum, cp) =>
      sum + cp.scores.reduce((s, score) => s + score.timeSpent, 0), 0);
    const avgLiteracyLevel = Math.round(
      childrenProgress.reduce((sum, cp) => sum + cp.financialLiteracyLevel, 0) / Math.max(children.length, 1)
    );

    return {
      totalGames,
      avgScore,
      totalTime: Math.round(totalTime / 1000 / 60), // Convert to minutes
      avgLiteracyLevel,
      totalAchievements: childrenProgress.reduce((sum, cp) => sum + cp.recentAchievements.length, 0)
    };
  }, [childrenProgress]);

  const getSkillColor = (level: number) => {
    if (level >= 80) return 'text-green-600 bg-green-100';
    if (level >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'real-world': return <DollarSign className="w-5 h-5" />;
      case 'discussion': return <Users className="w-5 h-5" />;
      case 'practice': return <Gamepad2 className="w-5 h-5" />;
      case 'creative': return <Lightbulb className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">👨‍👩‍👧‍👦</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
                <p className="text-gray-600">Track your family's financial literacy journey</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={onExportReport} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button onClick={onShareProgress} variant="outline" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Progress
              </Button>
              <Button onClick={onScheduleMeeting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Family Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Family Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Gamepad2, label: 'Total Games Played', value: familyStats.totalGames, color: 'blue' },
              { icon: Target, label: 'Average Score', value: `${familyStats.avgScore}%`, color: 'green' },
              { icon: Clock, label: 'Learning Time', value: `${familyStats.totalTime} min`, color: 'purple' },
              { icon: Brain, label: 'Financial Literacy', value: `${familyStats.avgLiteracyLevel}%`, color: 'orange' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/80">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Child Selection */}
        <div className="mb-6">
          <div className="flex gap-4 flex-wrap">
            {children.map(child => (
              <Button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                variant={selectedChild.id === child.id ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {child.name?.[0] || 'C'}
                </div>
                {child.name || 'Child'}
              </Button>
            ))}
          </div>
        </div>

        {/* Detailed Progress */}
        {selectedProgress && (
          <Tabs defaultValue="progress" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Progress Chart */}
                <Card className="border-0 shadow-lg bg-white/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Weekly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={selectedProgress.weeklyProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="averageScore" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Learning Activity */}
                <Card className="border-0 shadow-lg bg-white/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      Learning Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={selectedProgress.weeklyProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="gamesPlayed" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Concepts */}
              <Card className="border-0 shadow-lg bg-white/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Recent Concepts Learned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgress.weeklyProgress.flatMap(week => week.conceptsLearned).map((concept, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Financial Skill Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedProgress.skillDevelopment.map((skill, idx) => (
                      <div key={skill.skill} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{skill.skill}</h4>
                            <p className="text-sm text-gray-600">{skill.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getSkillColor(skill.level)}`}>
                              {skill.level}%
                            </span>
                            {skill.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                            {skill.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />}
                            {skill.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                          </div>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {selectedProgress.recentAchievements.map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {achievement.date.toLocaleDateString()}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {achievement.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-600" />
                    Recommended Activities
                  </CardTitle>
                  <CardDescription>
                    Age-appropriate activities to reinforce financial learning at home
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {selectedProgress.recommendedActivities.map(activity => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                              {getActivityIcon(activity.category)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                              <p className="text-sm text-gray-600">{activity.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{activity.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {activity.duration}
                            </span>
                            {activity.ageAppropriate && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Age appropriate
                              </span>
                            )}
                          </div>
                        </div>
                        {activity.materials.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-500 mb-1">Materials needed:</div>
                            <div className="flex flex-wrap gap-1">
                              {activity.materials.map((material, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}