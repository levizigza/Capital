import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Target, Award, TrendingUp, Shield, CheckCircle } from '@/lib/lucide';
import { motion, AnimatePresence } from 'framer-motion';

interface HabitBuilderProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void;
  onExit: () => void;
  userTier?: 'elementary' | 'middle' | 'adult';
}

interface FinancialHabit {
  id: string;
  name: string;
  description: string;
  category: 'saving' | 'investing' | 'budgeting' | 'credit';
  difficulty: 'easy' | 'medium' | 'hard';
  dailyImpact: number;
  weeklyTarget: number;
  icon: string;
  benefits: string[];
  color: string;
}

interface HabitProgress {
  habitId: string;
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  weeklyProgress: number;
  lastCompleted: number | null;
}

interface DayResult {
  day: number;
  completedHabits: string[];
  totalSavings: number;
  bonuses: string[];
}

const financialHabits: FinancialHabit[] = [
  {
    id: 'daily-saving',
    name: 'Daily Savings Deposit',
    description: 'Set aside a small amount every day to build consistent saving habits',
    category: 'saving',
    difficulty: 'easy',
    dailyImpact: 5,
    weeklyTarget: 35,
    icon: '💰',
    benefits: ['Builds emergency fund', 'Develops discipline', 'Compound growth'],
    color: 'bg-green-500'
  },
  {
    id: 'expense-tracking',
    name: 'Track All Expenses',
    description: 'Record every expense to understand spending patterns',
    category: 'budgeting',
    difficulty: 'medium',
    dailyImpact: 8,
    weeklyTarget: 56,
    icon: '📝',
    benefits: ['Spending awareness', 'Budget optimization', 'Reduces impulse buys'],
    color: 'bg-blue-500'
  },
  {
    id: 'no-spend-day',
    name: 'No-Spend Day',
    description: 'Choose one day per week with zero discretionary spending',
    category: 'budgeting',
    difficulty: 'medium',
    dailyImpact: 12,
    weeklyTarget: 12,
    icon: '🚫',
    benefits: ['Resets spending habits', 'Saves money', 'Mindful consumption'],
    color: 'bg-purple-500'
  },
  {
    id: 'investment-review',
    name: 'Weekly Investment Review',
    description: 'Review and rebalance investments every Sunday',
    category: 'investing',
    difficulty: 'hard',
    dailyImpact: 15,
    weeklyTarget: 15,
    icon: '📈',
    benefits: ['Optimizes returns', 'Risk management', 'Long-term focus'],
    color: 'bg-orange-500'
  },
  {
    id: 'bill-automation',
    name: 'Automate Bill Payments',
    description: 'Set up automatic payments for all recurring bills',
    category: 'credit',
    difficulty: 'easy',
    dailyImpact: 10,
    weeklyTarget: 10,
    icon: '⚙️',
    benefits: ['Avoids late fees', 'Protects credit score', 'Peace of mind'],
    color: 'bg-teal-500'
  }
];

export default function HabitBuilder({ onComplete, onExit, userTier = 'middle' }: HabitBuilderProps) {
  const [gameState, setGameState] = useState<'ready' | 'planning' | 'building' | 'reviewing' | 'ended'>('ready');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [habitProgress, setHabitProgress] = useState<Record<string, HabitProgress>>({});
  const [dayResults, setDayResults] = useState<DayResult[]>([]);
  const [score, setScore] = useState(0);
  const [streakBonus, setStreakBonus] = useState(1);
  const [totalSavings, setTotalSavings] = useState(0);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState(100);

  const initializeHabitProgress = (habitIds: string[]) => {
    const progress: Record<string, HabitProgress> = {};
    habitIds.forEach(habitId => {
      progress[habitId] = {
        habitId,
        currentStreak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        weeklyProgress: 0,
        lastCompleted: null
      };
    });
    setHabitProgress(progress);
  };

  const startHabitBuilding = () => {
    if (selectedHabits.length === 0) return;

    setGameState('building');
    setCurrentWeek(1);
    setCurrentDay(1);
    setTotalSavings(0);
    setScore(0);
    setDayResults([]);
    setCompletedActions([]);

    // Calculate weekly goal based on selected habits
    const goal = selectedHabits.reduce((sum, habitId) => {
      const habit = financialHabits.find(h => h.id === habitId);
      return sum + (habit?.weeklyTarget || 0);
    }, 0);
    setWeeklyGoal(goal);

    initializeHabitProgress(selectedHabits);
  };

  const completeHabit = useCallback((habitId: string) => {
    if (!selectedHabits.includes(habitId) || completedActions.includes(`${currentWeek}-${currentDay}-${habitId}`)) return;

    const habit = financialHabits.find(h => h.id === habitId);
    if (!habit) return;

    const newCompletedActions = [...completedActions, `${currentWeek}-${currentDay}-${habitId}`];
    setCompletedActions(newCompletedActions);

    // Update habit progress
    setHabitProgress(prev => {
      const updated = { ...prev };
      if (updated[habitId]) {
        const progress = updated[habitId];
        const lastDayCompleted = progress.lastCompleted;
        const today = currentWeek * 7 + currentDay;

        // Check if streak continues
        if (lastDayCompleted && today - lastDayCompleted === 1) {
          progress.currentStreak += 1;
        } else if (lastDayCompleted && today - lastDayCompleted > 1) {
          progress.currentStreak = 1;
        } else {
          progress.currentStreak = 1;
        }

        progress.bestStreak = Math.max(progress.bestStreak, progress.currentStreak);
        progress.totalCompleted += 1;
        progress.weeklyProgress += habit.dailyImpact;
        progress.lastCompleted = today;
      }
      return updated;
    });

    // Update score and savings
    const baseScore = habit.dailyImpact;
    const streakMultiplier = Math.min(3, 1 + (habitProgress[habitId]?.currentStreak || 0) * 0.1);
    const points = Math.round(baseScore * streakMultiplier);

    setScore(prev => prev + points);
    setTotalSavings(prev => prev + habit.dailyImpact);

    // Update day results
    setDayResults(prev => {
      const newResults = [...prev];
      const dayIndex = newResults.findIndex(d => d.day === currentWeek * 7 + currentDay);

      if (dayIndex >= 0) {
        newResults[dayIndex].completedHabits.push(habitId);
        newResults[dayIndex].totalSavings += habit.dailyImpact;
      } else {
        newResults.push({
          day: currentWeek * 7 + currentDay,
          completedHabits: [habitId],
          totalSavings: habit.dailyImpact,
          bonuses: []
        });
      }

      return newResults;
    });
  }, [selectedHabits, completedActions, currentWeek, currentDay, habitProgress]);

  const nextDay = () => {
    if (currentDay < 7) {
      setCurrentDay(prev => prev + 1);
      setCompletedActions([]);
    } else {
      // End of week
      setCurrentWeek(prev => prev + 1);
      setCurrentDay(1);
      setCompletedActions([]);

      // Reset weekly progress and calculate bonuses
      setHabitProgress(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(habitId => {
          updated[habitId].weeklyProgress = 0;
        });
        return updated;
      });
    }
  };

  const calculateFinalScore = () => {
    let finalScore = score;

    // Streak bonuses
    Object.values(habitProgress).forEach(progress => {
      if (progress.bestStreak >= 7) finalScore += 50;
      else if (progress.bestStreak >= 5) finalScore += 30;
      else if (progress.bestStreak >= 3) finalScore += 15;
    });

    // Completion bonuses
    const totalPossibleHabits = selectedHabits.length * 4 * 7; // 4 weeks, 7 days
    const completionRate = completedActions.length / totalPossibleHabits;
    if (completionRate >= 0.9) finalScore += 100;
    else if (completionRate >= 0.8) finalScore += 75;
    else if (completionRate >= 0.7) finalScore += 50;

    // Savings bonus
    if (totalSavings >= weeklyGoal * 4) finalScore += 75;
    else if (totalSavings >= weeklyGoal * 3) finalScore += 50;
    else if (totalSavings >= weeklyGoal * 2) finalScore += 25;

    return finalScore;
  };

  const endGame = () => {
    const finalScore = calculateFinalScore();
    setGameState('ended');
    onComplete(finalScore, {
      weeksCompleted: currentWeek,
      habitsTracked: selectedHabits.length,
      totalSavings,
      averageStreak: Object.values(habitProgress).reduce((sum, p) => sum + p.bestStreak, 0) / selectedHabits.length,
      completionRate: completedActions.length / (selectedHabits.length * 4 * 7)
    });
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-8">
        <div className="w-full max-w-4xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">🗓️</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Habit Builder!</h2>
          <p className="text-xl text-muted-foreground mb-8 text-center max-w-2xl">
            Build powerful financial habits through consistent daily practice! Track your progress,
            maintain streaks, and watch small actions compound into significant financial growth.
          </p>
          <div className="bg-green-100 p-4 rounded-lg border border-green-300">
            <p className="text-sm text-green-800">
              <strong>Guardian Special:</strong> Perfect for disciplined builders who value consistency and long-term growth!
            </p>
          </div>

          <div className="w-full max-w-3xl">
            <h3 className="text-2xl font-semibold mb-6 text-center">Choose Your Habits (Select 2-4):</h3>
            <div className="grid gap-4">
              {financialHabits.map(habit => (
                <div
                  key={habit.id}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedHabits.includes(habit.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 bg-white'
                  }`}
                  onClick={() => {
                    setSelectedHabits(prev => {
                      if (prev.includes(habit.id)) {
                        return prev.filter(id => id !== habit.id);
                      } else if (prev.length < 4) {
                        return [...prev, habit.id];
                      }
                      return prev;
                    });
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <h4 className="font-semibold">{habit.name}</h4>
                        <p className="text-sm text-gray-600">{habit.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        habit.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        habit.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {habit.difficulty}
                      </span>
                      {selectedHabits.includes(habit.id) && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">
                      💪 Daily: ${habit.dailyImpact} | 🎯 Weekly: ${habit.weeklyTarget}
                    </div>
                    <div className="text-sm text-gray-600">
                      Category: {habit.category}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div className="font-medium mb-1">Benefits:</div>
                    <div className="flex flex-wrap gap-1">
                      {habit.benefits.map((benefit, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Selected: {selectedHabits.length}/4 habits
                {selectedHabits.length < 2 && ' (Select at least 2 to continue)'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={startHabitBuilding}
                  disabled={selectedHabits.length < 2}
                  className="game-arcade-btn text-lg px-8"
                >
                  Start Building Habits
                </Button>
                <Button onClick={onExit} variant="outline" className="text-lg px-8 border-2">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Exit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const completionRate = completedActions.length / (selectedHabits.length * 4 * 7);
    const averageStreak = selectedHabits.length > 0
      ? Object.values(habitProgress).reduce((sum, p) => sum + p.bestStreak, 0) / selectedHabits.length
      : 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-8">
        <div className="w-full max-w-4xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">
            {completionRate >= 0.9 ? '🏆' : completionRate >= 0.8 ? '⭐' : '🛡️'}
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Habit Building Complete!
          </h2>

          <div className="text-center space-y-4">
            <div className="text-3xl font-bold text-green-600">Final Score: {calculateFinalScore()}</div>
            <div className="text-xl text-muted-foreground">
              Completion Rate: {Math.round(completionRate * 100)}%
            </div>
            <div className="text-lg text-muted-foreground">
              Weeks Completed: {currentWeek} | Total Saved: ${totalSavings}
            </div>
            <div className="text-lg font-medium text-blue-600">
              Average Best Streak: {averageStreak.toFixed(1)} days
            </div>
          </div>

          <div className="bg-green-100 p-4 rounded-lg border border-green-300">
            <p className="text-sm text-green-800 text-center">
              {completionRate >= 0.9 ? 'Outstanding consistency! You\'ve mastered habit building!' :
               completionRate >= 0.8 ? 'Great discipline! You\'re building powerful financial habits!' :
               completionRate >= 0.7 ? 'Good foundation! Keep practicing for better consistency!' :
               'Habit building takes time. Stay committed and you\'ll see amazing results!'}
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setGameState('ready')} className="game-arcade-btn px-8 py-3 text-lg">
              Try Different Habits
            </Button>
            <Button onClick={onExit} variant="outline" className="px-8 py-3 text-lg border-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedHabitData = selectedHabits.map(id => financialHabits.find(h => h.id === id)).filter(Boolean) as FinancialHabit[];
  const weeklyProgress = selectedHabitData.reduce((sum, habit) =>
    sum + (habitProgress[habit.id]?.weeklyProgress || 0), 0);

  return (
    <div className="game-arcade-container">
      <div className="game-arcade-header flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-5xl">🗓️</span>
          <div>
            <h2 className="text-2xl font-bold">Habit Builder</h2>
            <p className="text-sm text-muted-foreground">
              Week {currentWeek} - Day {currentDay} | Progress: {Math.round((weeklyProgress / weeklyGoal) * 100)}%
            </p>
          </div>
        </div>
      </div>

      <div className="game-arcade-stats">
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-green-600">{score}</div>
          <div className="text-xs text-muted-foreground">Total Score</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-blue-600">${totalSavings}</div>
          <div className="text-xs text-muted-foreground">Total Saved</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-purple-600">{weeklyProgress}/${weeklyGoal}</div>
          <div className="text-xs text-muted-foreground">Weekly Goal</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-orange-600">{completedActions.length}</div>
          <div className="text-xs text-muted-foreground">Habits Completed</div>
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Weekly Progress</span>
          <span>{Math.round((weeklyProgress / weeklyGoal) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
            style={{ width: `${Math.min(100, (weeklyProgress / weeklyGoal) * 100)}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (weeklyProgress / weeklyGoal) * 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="game-arcade-content">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Today's Habits
        </h3>
        <div className="grid gap-4 mb-6">
          {selectedHabitData.map(habit => {
            const isCompleted = completedActions.includes(`${currentWeek}-${currentDay}-${habit.id}`);
            const progress = habitProgress[habit.id];

            return (
              <div
                key={habit.id}
                className={`p-4 rounded-lg border-2 ${
                  isCompleted
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                } transition-all`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{habit.icon}</span>
                    <div>
                      <h4 className="font-semibold">{habit.name}</h4>
                      <p className="text-sm text-gray-600">{habit.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Completed</span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="font-bold text-lg">${habit.dailyImpact}</div>
                        <div className="text-sm text-gray-600">daily value</div>
                      </div>
                    )}
                  </div>
                </div>

                {!isCompleted && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Current streak: {progress?.currentStreak || 0} days |
                      Best: {progress?.bestStreak || 0} days
                    </div>
                    <Button
                      onClick={() => completeHabit(habit.id)}
                      size="sm"
                      className={`${habit.color} hover:opacity-90`}
                    >
                      Complete Today
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Streak Bonuses */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            Streak Achievements
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {selectedHabitData.map(habit => {
              const progress = habitProgress[habit.id];
              const streakLevel = progress?.bestStreak || 0;

              return (
                <div key={habit.id} className="bg-white p-3 rounded-lg border-2 border-orange-200 text-center">
                  <div className="text-xl mb-1">{habit.icon}</div>
                  <div className="text-sm font-medium">{streakLevel} day streak</div>
                  {streakLevel >= 7 && <div className="text-xs text-green-600 mt-1">🔥 Master!</div>}
                  {streakLevel >= 5 && streakLevel < 7 && <div className="text-xs text-blue-600 mt-1">⭐ Strong!</div>}
                  {streakLevel >= 3 && streakLevel < 5 && <div className="text-xs text-yellow-600 mt-1">💪 Building!</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="game-arcade-actions">
        <button onClick={nextDay} className="game-arcade-btn bg-blue-500 hover:bg-blue-600">
          {currentDay < 7 ? 'Next Day' : 'Next Week'}
        </button>
        {currentWeek >= 4 && (
          <button onClick={endGame} className="game-arcade-btn bg-green-500 hover:bg-green-600">
            Complete Challenge
          </button>
        )}
        <button onClick={onExit} className="game-arcade-btn bg-gray-500 hover:bg-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </button>
      </div>
    </div>
  );
}