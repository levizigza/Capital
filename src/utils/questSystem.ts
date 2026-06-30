import { Tier, Quest, TIER_DATA, SkillLine } from '@/data/tiers'
import type { UserProfile } from '@/App'

export interface QuestProgress {
  questId: string
  tierId: number
  financialKPIProgress: number
  softSkillCompleted: boolean
  started: boolean
  completed: boolean
  startedAt?: Date
  completedAt?: Date
  reflection?: string
  evidence?: string[]
}

export interface TierProgress {
  tierId: number
  unlocked: boolean
  completed: boolean
  startedAt?: Date
  completedAt?: Date
  questProgress: Record<string, QuestProgress>
}

export interface UserQuestState {
  currentTier: number
  overallProgress: number
  tiers: Record<number, TierProgress>
  skillLineXP: Record<SkillLine, number>
  achievements: Achievement[]
  learningPath: LearningPathRecommendation[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  category: 'quest' | 'skill' | 'streak' | 'mastery' | 'community'
  unlockedAt: Date
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface LearningPathRecommendation {
  questId: string
  tierId: number
  priority: 'high' | 'medium' | 'low'
  reason: string
  estimatedTime: number
  skillFocus: SkillLine[]
}

export class QuestSystem {
  static initializeQuestState(userProfile: UserProfile): UserQuestState {
    const tiers: Record<number, TierProgress> = {}

    // Initialize all tiers
    TIER_DATA.forEach(tier => {
      const questProgress: Record<string, QuestProgress> = {}
      tier.quests.forEach(quest => {
        questProgress[quest.id] = {
          questId: quest.id,
          tierId: tier.id,
          financialKPIProgress: 0,
          softSkillCompleted: false,
          started: false,
          completed: false
        }
      })

      tiers[tier.id] = {
        tierId: tier.id,
        unlocked: tier.id === 1, // Only first tier is unlocked initially
        completed: false,
        questProgress
      }
    })

    return {
      currentTier: 1,
      overallProgress: 0,
      tiers,
      skillLineXP: {
        cognition: 0,
        values: 0,
        morals: 0,
        faith: 0
      },
      achievements: [],
      learningPath: this.generateLearningPath(1, tiers[1].questProgress)
    }
  }

  static startQuest(questState: UserQuestState, questId: string): UserQuestState {
    const newState = { ...questState }

    // Find the quest and mark as started
    Object.keys(newState.tiers).forEach(tierId => {
      const tier = newState.tiers[parseInt(tierId)]
      if (tier.questProgress[questId]) {
        tier.questProgress[questId] = {
          ...tier.questProgress[questId],
          started: true,
          startedAt: new Date()
        }

        // Mark tier as started if not already
        if (!tier.startedAt) {
          tier.startedAt = new Date()
        }
      }
    })

    // Update learning path recommendations
    newState.learningPath = this.generateLearningPath(newState.currentTier, newState.tiers[newState.currentTier].questProgress)

    return newState
  }

  static updateQuestProgress(
    questState: UserQuestState,
    questId: string,
    financialProgress: number,
    softSkillCompleted = false,
    reflection?: string,
    evidence?: string[]
  ): UserQuestState {
    const newState = structuredClone(questState)
    let nextState = newState

    let questUpdated = false
    let questCompleted = false
    let tierId = 0

    // Find and update the quest
    Object.keys(nextState.tiers).forEach(key => {
      const tier = nextState.tiers[parseInt(key)]
      if (tier.questProgress[questId]) {
        tierId = parseInt(key)
        const quest = tier.questProgress[questId]
        const originalQuest = TIER_DATA[tierId - 1].quests.find(q => q.id === questId)

        if (originalQuest) {
          // Update financial KPI progress
          quest.financialKPIProgress = Math.min(financialProgress, originalQuest.financialKPI.target)

          // Update soft skill completion
          if (softSkillCompleted && !quest.softSkillCompleted) {
            quest.softSkillCompleted = true
          }

          // Add reflection and evidence
          if (reflection) quest.reflection = reflection
          if (evidence) quest.evidence = evidence

          // Check if quest is complete
          const isFinancialComplete = quest.financialKPIProgress >= originalQuest.financialKPI.target
          const isSoftSkillComplete = quest.softSkillCompleted

          if (isFinancialComplete && isSoftSkillComplete && !quest.completed) {
            quest.completed = true
            quest.completedAt = new Date()
            questCompleted = true
            questUpdated = true
          }
        }
      }
    })

    // If a quest was completed, update tier progress and check for achievements
    if (questCompleted && tierId > 0) {
      nextState = this.checkTierCompletion(nextState, tierId)
      nextState = this.checkAchievements(nextState)
      nextState = this.updateSkillLineXP(nextState, questId)
    }

    // Update learning path
    nextState.learningPath = this.generateLearningPath(nextState.currentTier, nextState.tiers[nextState.currentTier].questProgress)

    return nextState
  }

  static completeQuest(questState: UserQuestState, questId: string): UserQuestState {
    const quest = this.findQuest(questState, questId)
    if (quest) {
      const originalQuest = TIER_DATA[quest.tierId - 1].quests.find(q => q.id === questId)
      if (originalQuest) {
        return this.updateQuestProgress(
          questState,
          questId,
          originalQuest.financialKPI.target,
          true
        )
      }
    }
    return questState
  }

  private static findQuest(questState: UserQuestState, questId: string): QuestProgress | null {
    for (const tier of Object.values(questState.tiers)) {
      if (tier.questProgress[questId]) {
        return tier.questProgress[questId]
      }
    }
    return null
  }

  private static checkTierCompletion(questState: UserQuestState, tierId: number): UserQuestState {
    const tier = questState.tiers[tierId]
    const originalTier = TIER_DATA[tierId - 1]

    const allQuestsCompleted = originalTier.quests.every(quest =>
      tier.questProgress[quest.id].completed
    )

    if (allQuestsCompleted && !tier.completed) {
      tier.completed = true
      tier.completedAt = new Date()

      // Unlock next tier if available
      if (tierId < TIER_DATA.length) {
        questState.tiers[tierId + 1].unlocked = true
        if (questState.currentTier === tierId) {
          questState.currentTier = tierId + 1
        }
      }

      // Calculate overall progress
      const totalTiers = TIER_DATA.length
      const completedTiers = Object.values(questState.tiers).filter(t => t.completed).length
      questState.overallProgress = Math.round((completedTiers / totalTiers) * 100)
    }

    return questState
  }

  private static updateSkillLineXP(questState: UserQuestState, questId: string): UserQuestState {
    const quest = this.findQuest(questState, questId)
    if (quest) {
      const originalQuest = TIER_DATA[quest.tierId - 1].quests.find(q => q.id === questId)
      if (originalQuest) {
        // Distribute line XP across skill lines based on quest type
        const skillDistribution = this.getSkillLineDistribution(originalQuest)

        Object.entries(skillDistribution).forEach(([skillLine, percentage]) => {
          const xpGained = Math.round(originalQuest.lineXPReward * percentage)
          questState.skillLineXP[skillLine as SkillLine] += xpGained
        })
      }
    }
    return questState
  }

  private static getSkillLineDistribution(quest: Quest): Record<string, number> {
    // Based on quest characteristics, determine which skill lines get XP
    const distribution: Record<string, number> = {
      cognition: 0.25,  // Default distribution
      values: 0.25,
      morals: 0.25,
      faith: 0.25
    }

    // Adjust based on quest type
    if (quest.financialKPI.type.includes('investment')) {
      distribution.cognition = 0.5
      distribution.faith = 0.3
      distribution.values = 0.2
      distribution.morals = 0.0
    } else if (quest.financialKPI.type.includes('community')) {
      distribution.morals = 0.4
      distribution.values = 0.3
      distribution.faith = 0.2
      distribution.cognition = 0.1
    } else if (quest.financialKPI.type.includes('budget')) {
      distribution.values = 0.4
      distribution.cognition = 0.3
      distribution.morals = 0.2
      distribution.faith = 0.1
    } else if (quest.softSkillKPI.type.includes('reflection')) {
      distribution.faith = 0.5
      distribution.values = 0.3
      distribution.morals = 0.2
      distribution.cognition = 0.0
    }

    return distribution
  }

  private static checkAchievements(questState: UserQuestState): UserQuestState {
    const achievements: Achievement[] = [...questState.achievements]

    // First quest completed
    const completedQuests = Object.values(questState.tiers)
      .flatMap(tier => Object.values(tier.questProgress))
      .filter(q => q.completed)

    if (completedQuests.length === 1 && !achievements.find(a => a.id === 'first_quest')) {
      achievements.push({
        id: 'first_quest',
        title: 'First Steps',
        description: 'Complete your first quest',
        category: 'quest',
        unlockedAt: new Date(),
        icon: '🎯',
        rarity: 'common'
      })
    }

    // Complete a tier
    const completedTiers = Object.values(questState.tiers).filter(t => t.completed)
    if (completedTiers.length === 1 && !achievements.find(a => a.id === 'first_tier')) {
      achievements.push({
        id: 'first_tier',
        title: 'Foundation Builder',
        description: 'Complete your first learning tier',
        category: 'mastery',
        unlockedAt: new Date(),
        icon: '🏗️',
        rarity: 'rare'
      })
    }

    // Skill line mastery
    Object.entries(questState.skillLineXP).forEach(([skillLine, xp]) => {
      if (xp >= 500 && !achievements.find(a => a.id === `${skillLine}_master`)) {
        const skillNames = {
          cognition: 'Cognition Master',
          values: 'Values Guardian',
          morals: 'Morals Champion',
          faith: 'Faith Leader'
        }
        achievements.push({
          id: `${skillLine}_master`,
          title: skillNames[skillLine as SkillLine],
          description: `Master the ${skillLine} skill line`,
          category: 'skill',
          unlockedAt: new Date(),
          icon: '🏆',
          rarity: 'epic'
        })
      }
    })

    questState.achievements = achievements
    return questState
  }

  private static generateLearningPath(
    currentTier: number,
    questProgress: Record<string, QuestProgress>
  ): LearningPathRecommendation[] {
    const recommendations: LearningPathRecommendation[] = []
    const tier = TIER_DATA[currentTier - 1]

    // Analyze current quest progress and recommend next steps
    tier.quests.forEach(quest => {
      const progress = questProgress[quest.id]

      if (!progress.completed) {
        let priority: 'high' | 'medium' | 'low' = 'medium'
        let reason = ''

        // High priority: quests that build foundational skills
        if (quest.id.includes('1') || quest.financialKPI.type.includes('budget')) {
          priority = 'high'
          reason = 'Builds foundational financial skills'
        }
        // Medium priority: skill development quests
        else if (quest.softSkillKPI.type.includes('teaching') || quest.softSkillKPI.type.includes('sharing')) {
          priority = 'medium'
          reason = 'Develops important soft skills'
        }
        // Low priority: advanced or specialization quests
        else if (quest.financialKPI.type.includes('investment') || quest.financialKPI.target >= 500) {
          priority = 'low'
          reason = 'Advanced skill development'
        }

        // Adjust priority based on current progress
        if (progress.started && !progress.completed) {
          priority = 'high'
          reason = 'Continue your current quest'
        }

        // Estimate time to complete (in minutes)
        let estimatedTime = 30 // Base time
        if (quest.financialKPI.type.includes('tracking')) {
          estimatedTime = 60 // Tracking takes longer
        } else if (quest.softSkillKPI.type.includes('community')) {
          estimatedTime = 45 // Community activities take moderate time
        } else if (quest.financialKPI.type.includes('investment')) {
          estimatedTime = 90 // Investment research takes time
        }

        // Determine skill focus
        const skillFocus: SkillLine[] = []
        if (quest.financialKPI.type.includes('investment') || quest.financialKPI.type.includes('budget')) {
          skillFocus.push('cognition')
        }
        if (quest.softSkillKPI.type.includes('reflection') || quest.softSkillKPI.type.includes('planning')) {
          skillFocus.push('faith')
        }
        if (quest.softSkillKPI.type.includes('community') || quest.softSkillKPI.type.includes('teaching')) {
          skillFocus.push('morals')
        }
        if (quest.financialKPI.type.includes('savings') || quest.financialKPI.type.includes('goal')) {
          skillFocus.push('values')
        }

        recommendations.push({
          questId: quest.id,
          tierId: currentTier,
          priority,
          reason,
          estimatedTime,
          skillFocus: skillFocus.length > 0 ? skillFocus : ['cognition'] // Default
        })
      }
    })

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  static getInsights(questState: UserQuestState): string[] {
    const insights: string[] = []

    // Analyze current progress and provide personalized insights
    const completedQuests = Object.values(questState.tiers)
      .flatMap(tier => Object.values(tier.questProgress))
      .filter(q => q.completed)

    const inProgressQuests = Object.values(questState.tiers)
      .flatMap(tier => Object.values(tier.questProgress))
      .filter(q => q.started && !q.completed)

    // Progress insights
    if (completedQuests.length === 0) {
      insights.push("Start your first quest to begin your financial literacy journey!")
    } else if (completedQuests.length < 3) {
      insights.push("You're building great momentum! Keep completing quests to unlock new tiers.")
    } else if (completedQuests.length >= 10) {
      insights.push("You're becoming a financial literacy expert! Consider mentoring others.")
    }

    // Streak insights
    if (inProgressQuests.length > 3) {
      insights.push("You have multiple quests in progress. Focus on completing one at a time for better results.")
    }

    // Skill line insights
    const topSkillLine = Object.entries(questState.skillLineXP)
      .sort(([, a], [, b]) => b - a)[0]

    if (topSkillLine[1] > 200) {
      const skillNames = {
        cognition: 'analytical thinking',
        values: 'financial priorities',
        morals: 'ethical money decisions',
        faith: 'long-term financial vision'
      }
      insights.push(`You're excelling in ${skillNames[topSkillLine[0] as SkillLine]}! This is a valuable strength.`)
    }

    // Tier-specific insights
    const currentTier = questState.tiers[questState.currentTier]
    if (currentTier && currentTier.completed) {
      insights.push("You've mastered this tier! A new tier of challenges awaits you.")
    }

    return insights
  }

  static getNextRecommendedQuest(questState: UserQuestState): LearningPathRecommendation | null {
    return questState.learningPath[0] || null
  }
}

export default QuestSystem