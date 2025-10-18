import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, CheckCircle, Target, TrendUp, Sparkle, 
  UserCircle, Fire, Trophy, Lightning, Users,
  BookOpen, Heart, Path, Star
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Tier, Quest, SkillLine } from '@/data/tiers'
import { SKILL_LINES, TIER_DATA } from '@/data/tiers'
import { cn } from '@/lib/utils'

interface TierProgressionViewProps {
  userTiers: Tier[]
  currentTierId: number
  skillLines: Record<SkillLine, number>
  onQuestComplete: (tierId: number, questId: string) => void
  onAllocateLineXP: (line: SkillLine, amount: number) => void
  availableLineXP: number
}

export function TierProgressionView({
  userTiers,
  currentTierId,
  skillLines,
  onQuestComplete,
  onAllocateLineXP,
  availableLineXP
}: TierProgressionViewProps) {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [activeTab, setActiveTab] = useState<'ladder' | 'skills'>('ladder')

  const currentTier = userTiers.find(t => t.id === currentTierId)
  const completedQuests = currentTier?.quests.filter(q => q.completed).length || 0
  const totalQuests = currentTier?.quests.length || 0
  const progressToNextTier = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0

  const getSkillLineLevel = (xp: number) => Math.floor(xp / 100) + 1
  const getSkillLineProgress = (xp: number) => (xp % 100)

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" weight="fill" />
                Tier Progression System
              </CardTitle>
              <CardDescription className="mt-2">
                Complete quests to advance through 8 tiers of financial mastery
              </CardDescription>
            </div>
            {availableLineXP > 0 && (
              <Badge variant="default" className="text-lg px-4 py-2">
                <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                {availableLineXP} Line XP Available
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ladder' | 'skills')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ladder" className="flex items-center gap-2">
            <Path className="w-4 h-4" />
            Tier Ladder
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Skill Lines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ladder" className="space-y-6">
          {currentTier && (
            <Card className="border-primary shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTier.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg`}
                      >
                        {currentTier.id}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{currentTier.name}</CardTitle>
                        <CardDescription className="text-base">{currentTier.theme}</CardDescription>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{currentTier.description}</p>
                  </div>
                  <Badge 
                    style={{ background: currentTier.color }}
                    className="text-white px-4 py-2"
                  >
                    Current Tier
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress to Next Tier</span>
                      <span className="text-sm font-bold">{completedQuests}/{totalQuests} Quests</span>
                    </div>
                    <Progress value={progressToNextTier} className="h-3" />
                  </div>

                  <div className="grid gap-3 mt-6">
                    {currentTier.quests.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onSelect={() => setSelectedQuest(quest)}
                        onComplete={() => onQuestComplete(currentTier.id, quest.id)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Path className="w-5 h-5" />
              Your Journey
            </h3>
            <div className="space-y-3">
              {userTiers.map((tier, index) => {
                const isUnlocked = tier.unlocked
                const isCurrent = tier.id === currentTierId
                const isCompleted = tier.completed
                
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={cn(
                        "cursor-pointer transition-all duration-300 hover:shadow-lg",
                        isCurrent && "border-primary ring-2 ring-primary/20",
                        !isUnlocked && "opacity-50",
                        isCompleted && "bg-green-50 dark:bg-green-950/20"
                      )}
                      onClick={() => isUnlocked && setSelectedTier(tier)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-white relative`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-8 h-8" weight="fill" />
                            ) : !isUnlocked ? (
                              <Lock className="w-8 h-8" weight="fill" />
                            ) : (
                              <span className="text-2xl font-bold">{tier.id}</span>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-bold">{tier.name}</h4>
                              {isCurrent && (
                                <Badge variant="default" className="text-xs">
                                  <Fire className="w-3 h-3 mr-1" weight="fill" />
                                  Active
                                </Badge>
                              )}
                              {isCompleted && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{tier.theme} - {tier.focus}</p>
                            {isUnlocked && !isCompleted && (
                              <div className="mt-2">
                                <Progress 
                                  value={(tier.quests.filter(q => q.completed).length / tier.quests.length) * 100} 
                                  className="h-1.5"
                                />
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-medium text-muted-foreground">
                              {tier.quests.length} quests
                            </div>
                            {isUnlocked && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {tier.quests.filter(q => q.completed).length} completed
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Skill Lines
              </CardTitle>
              <CardDescription>
                Level up four dimensions of financial wisdom by allocating your earned Line XP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(Object.keys(SKILL_LINES) as SkillLine[]).map((lineKey) => {
                const line = SKILL_LINES[lineKey]
                const xp = skillLines[lineKey]
                const level = getSkillLineLevel(xp)
                const progress = getSkillLineProgress(xp)
                
                const icon = {
                  cognition: <BookOpen className="w-6 h-6" weight="fill" />,
                  values: <Target className="w-6 h-6" weight="fill" />,
                  morals: <Heart className="w-6 h-6" weight="fill" />,
                  faith: <Sparkle className="w-6 h-6" weight="fill" />
                }[lineKey]

                return (
                  <Card key={lineKey} className="border-2" style={{ borderColor: line.color + '40' }}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-white"
                          style={{ background: line.color }}
                        >
                          {icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-xl font-bold flex items-center gap-2">
                                {line.icon} {line.name}
                                <Badge variant="outline" className="ml-2">Level {level}</Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">{line.description}</p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{xp} XP</span>
                              <span className="text-muted-foreground">
                                {progress}/100 to Level {level + 1}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {availableLineXP >= 10 && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onAllocateLineXP(lineKey, 10)}
                                disabled={availableLineXP < 10}
                              >
                                <Lightning className="w-4 h-4 mr-1" weight="fill" />
                                +10 XP
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onAllocateLineXP(lineKey, 50)}
                                disabled={availableLineXP < 50}
                              >
                                <Lightning className="w-4 h-4 mr-1" weight="fill" />
                                +50 XP
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onAllocateLineXP(lineKey, 100)}
                                disabled={availableLineXP < 100}
                              >
                                <Lightning className="w-4 h-4 mr-1" weight="fill" />
                                +100 XP
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={selectedTier !== null} onOpenChange={() => setSelectedTier(null)}>
        <DialogContent className="max-w-3xl">
          {selectedTier && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedTier.gradient} flex items-center justify-center text-white text-xl font-bold`}
                  >
                    {selectedTier.id}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedTier.name}</DialogTitle>
                    <DialogDescription className="text-base">{selectedTier.theme}</DialogDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground pt-2">{selectedTier.description}</p>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-3 pr-4">
                  {selectedTier.quests.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onSelect={() => setSelectedQuest(quest)}
                      onComplete={() => {
                        onQuestComplete(selectedTier.id, quest.id)
                        setSelectedTier(null)
                      }}
                      detailed
                    />
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={selectedQuest !== null} onOpenChange={() => setSelectedQuest(null)}>
        <DialogContent>
          {selectedQuest && <QuestDetailView quest={selectedQuest} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function QuestCard({ 
  quest, 
  onSelect, 
  onComplete,
  detailed = false 
}: { 
  quest: Quest
  onSelect: () => void
  onComplete: () => void
  detailed?: boolean
}) {
  const financialProgress = (quest.financialKPI.current / quest.financialKPI.target) * 100
  const allComplete = financialProgress >= 100 && quest.softSkillKPI.completed

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-md",
        quest.completed && "bg-green-50 dark:bg-green-950/20 border-green-300",
        allComplete && !quest.completed && "border-primary ring-2 ring-primary/20"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold">{quest.name}</h4>
              {quest.completed && (
                <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{quest.description}</p>

            {(detailed || !quest.completed) && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-blue-600">💰 Financial KPI</span>
                    <span className="text-muted-foreground">
                      {quest.financialKPI.current}/{quest.financialKPI.target}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{quest.financialKPI.description}</p>
                  <Progress value={financialProgress} className="h-1.5" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-purple-600">🤝 Soft Skill KPI</span>
                    {quest.softSkillKPI.completed && (
                      <CheckCircle className="w-4 h-4 text-green-600" weight="fill" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{quest.softSkillKPI.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Rewards</div>
            <div className="space-y-1">
              <Badge variant="secondary" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" weight="fill" />
                {quest.financeXP} XP
              </Badge>
              <Badge variant="outline" className="text-xs block">
                <Sparkle className="w-3 h-3 mr-1" weight="fill" />
                {quest.lineXPReward} Line
              </Badge>
            </div>
            {allComplete && !quest.completed && (
              <Button 
                size="sm" 
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation()
                  onComplete()
                }}
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuestDetailView({ quest }: { quest: Quest }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {quest.completed && <CheckCircle className="w-6 h-6 text-green-600" weight="fill" />}
          {quest.name}
        </DialogTitle>
        <DialogDescription>{quest.description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              💰 Financial KPI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{quest.financialKPI.description}</p>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Progress</span>
                <span className="font-bold">
                  {quest.financialKPI.current}/{quest.financialKPI.target}
                </span>
              </div>
              <Progress 
                value={(quest.financialKPI.current / quest.financialKPI.target) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              🤝 Soft Skill KPI
              {quest.softSkillKPI.completed && (
                <CheckCircle className="w-5 h-5 text-green-600 ml-auto" weight="fill" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{quest.softSkillKPI.description}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-base">Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Finance XP</span>
              <Badge>
                <Trophy className="w-3 h-3 mr-1" weight="fill" />
                {quest.financeXP}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Skill Line XP</span>
              <Badge variant="outline">
                <Sparkle className="w-3 h-3 mr-1" weight="fill" />
                {quest.lineXPReward}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
