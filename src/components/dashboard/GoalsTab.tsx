import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Target,
  Plus,
  CheckCircle,
  Circle,
  Calendar,
  Coins,
} from '@phosphor-icons/react'
import type { UserProfile } from '@/App'
import { useKV } from '@github/spark/hooks'

interface GoalsTabProps {
  userProfile: UserProfile
  language: 'en' | 'fr'
}

interface Goal {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  category: string
  deadline?: string
  completed: boolean
}

const translations = {
  en: {
    myGoals: 'My Financial Goals',
    activeGoals: 'Active Goals',
    completedGoals: 'Completed Goals',
    addNewGoal: 'Add New Goal',
    goalTitle: 'Goal Title',
    goalDescription: 'Description',
    targetValue: 'Target Value',
    currentValue: 'Current Value',
    unit: 'Unit',
    category: 'Category',
    deadline: 'Deadline (Optional)',
    createGoal: 'Create Goal',
    cancel: 'Cancel',
    markComplete: 'Mark Complete',
    noGoals: 'No goals yet. Create your first financial goal!',
    progress: 'Progress',
    daysLeft: 'days left',
    overdue: 'Overdue',
    budgeting: 'Budgeting',
    saving: 'Saving',
    investing: 'Investing',
    debtReduction: 'Debt Reduction',
  },
  fr: {
    myGoals: 'Mes Objectifs Financiers',
    activeGoals: 'Objectifs Actifs',
    completedGoals: 'Objectifs Complétés',
    addNewGoal: 'Ajouter un Objectif',
    goalTitle: 'Titre de l\'Objectif',
    goalDescription: 'Description',
    targetValue: 'Valeur Cible',
    currentValue: 'Valeur Actuelle',
    unit: 'Unité',
    category: 'Catégorie',
    deadline: 'Date Limite (Optionnelle)',
    createGoal: 'Créer l\'Objectif',
    cancel: 'Annuler',
    markComplete: 'Marquer Comme Complet',
    noGoals: 'Aucun objectif. Créez votre premier objectif financier!',
    progress: 'Progrès',
    daysLeft: 'jours restants',
    overdue: 'En retard',
    budgeting: 'Budgétisation',
    saving: 'Épargne',
    investing: 'Investissement',
    debtReduction: 'Réduction de la Dette',
  },
}

const DEFAULT_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    description: 'Build a 6-month emergency fund',
    targetValue: 10000,
    currentValue: 3500,
    unit: '$',
    category: 'Saving',
    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  },
  {
    id: '2',
    title: 'Investment Portfolio',
    description: 'Start investing with diversified portfolio',
    targetValue: 5000,
    currentValue: 2000,
    unit: '$',
    category: 'Investing',
    completed: false,
  },
]

export default function GoalsTab({ userProfile, language }: GoalsTabProps) {
  const t = translations[language]
  const [goals, setGoals] = useKV<Goal[]>('financial-goals', DEFAULT_GOALS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    targetValue: 0,
    currentValue: 0,
    unit: '$',
    category: 'Saving',
  })

  const activeGoals = useMemo(
    () => goals?.filter((goal) => !goal.completed) || [],
    [goals]
  )

  const completedGoals = useMemo(
    () => goals?.filter((goal) => goal.completed) || [],
    [goals]
  )

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.targetValue) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '',
      targetValue: newGoal.targetValue,
      currentValue: newGoal.currentValue || 0,
      unit: newGoal.unit || '$',
      category: newGoal.category || 'Saving',
      deadline: newGoal.deadline,
      completed: false,
    }

    setGoals((prev) => [...(prev || []), goal])
    setIsDialogOpen(false)
    setNewGoal({
      title: '',
      description: '',
      targetValue: 0,
      currentValue: 0,
      unit: '$',
      category: 'Saving',
    })
  }

  const handleMarkComplete = (goalId: string) => {
    setGoals((prev) =>
      (prev || []).map((goal) =>
        goal.id === goalId ? { ...goal, completed: true } : goal
      )
    )
  }

  const calculateDaysLeft = (deadline?: string) => {
    if (!deadline) return null
    const days = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Budgeting: 'oklch(0.35 0.12 240)',
      Saving: 'oklch(0.45 0.15 155)',
      Investing: 'oklch(0.65 0.15 65)',
      'Debt Reduction': 'oklch(0.58 0.15 25)',
    }
    return colors[category] || 'oklch(0.35 0.12 240)'
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target weight="fill" size={32} />
          {t.myGoals}
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus weight="bold" size={20} />
              {t.addNewGoal}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t.addNewGoal}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t.goalTitle}</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={t.goalTitle}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.goalDescription}</Label>
                <Input
                  id="description"
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={t.goalDescription}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">{t.targetValue}</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        targetValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current">{t.currentValue}</Label>
                  <Input
                    id="current"
                    type="number"
                    value={newGoal.currentValue}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        currentValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">{t.unit}</Label>
                  <Input
                    id="unit"
                    value={newGoal.unit}
                    onChange={(e) =>
                      setNewGoal((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    placeholder="$"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t.category}</Label>
                  <select
                    id="category"
                    value={newGoal.category}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Budgeting">{t.budgeting}</option>
                    <option value="Saving">{t.saving}</option>
                    <option value="Investing">{t.investing}</option>
                    <option value="Debt Reduction">{t.debtReduction}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">{t.deadline}</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={
                    newGoal.deadline
                      ? new Date(newGoal.deadline).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      deadline: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t.cancel}
              </Button>
              <Button onClick={handleCreateGoal}>{t.createGoal}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t.activeGoals} ({activeGoals.length})
        </h3>
        {activeGoals.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Target size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.noGoals}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const progressPercentage =
                (goal.currentValue / goal.targetValue) * 100
              const daysLeft = calculateDaysLeft(goal.deadline)

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Circle weight="regular" size={20} />
                          {goal.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {goal.description}
                        </p>
                      </div>
                      <Badge
                        style={{
                          backgroundColor: getCategoryColor(goal.category),
                          color: 'white',
                        }}
                      >
                        {goal.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t.progress}
                        </span>
                        <span className="font-medium">
                          {goal.currentValue}
                          {goal.unit} / {goal.targetValue}
                          {goal.unit}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="text-right text-sm text-primary font-medium">
                        {Math.round(progressPercentage)}%
                      </div>
                    </div>

                    {daysLeft !== null && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar weight="regular" size={16} />
                        {daysLeft > 0 ? (
                          <span>
                            {daysLeft} {t.daysLeft}
                          </span>
                        ) : (
                          <span className="text-destructive">{t.overdue}</span>
                        )}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleMarkComplete(goal.id)}
                    >
                      <CheckCircle weight="bold" size={16} />
                      {t.markComplete}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </motion.div>

      {completedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t.completedGoals} ({completedGoals.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="opacity-75">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle weight="fill" size={20} className="text-secondary" />
                    {goal.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {goal.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{goal.category}</Badge>
                    <span className="text-sm font-medium text-muted-foreground">
                      {goal.targetValue}
                      {goal.unit}
                    </span>
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
