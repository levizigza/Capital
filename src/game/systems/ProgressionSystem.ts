/**
 * Progression System - Manages player advancement, achievements, and skill trees
 */

import { GameSystem, GameEntity } from '../GameEngine'

export interface SkillNode {
  id: string
  name: string
  description: string
  category: 'saving' | 'investing' | 'budgeting' | 'entrepreneurship' | 'risk_management'
  requiredLevel: number
  prerequisites: string[]
  unlocked: boolean
  mastered: boolean
  xpRequired: number
  bonuses: {
    incomeBoost?: number
    expenseReduction?: number
    investmentReturns?: number
    riskTolerance?: number
  }
}

export interface Achievement {
  id: string
  name: string
  description: string
  category: 'milestone' | 'skill' | 'challenge' | 'social' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  progress: number
  maxProgress: number
  rewards: {
    xp?: number
    coins?: number
    title?: string
    skillPoints?: number
  }
  conditions: (entity: GameEntity) => boolean
}

export class ProgressionSystem implements GameSystem {
  name = 'ProgressionSystem'
  requiredComponents = ['progression', 'stats']

  private skillTree: Map<string, SkillNode> = new Map()
  private achievements: Map<string, Achievement> = new Map()

  constructor() {
    this.initializeSkillTree()
    this.initializeAchievements()
  }

  update(entities: GameEntity[], deltaTime: number): void {
    entities.forEach(entity => {
      const progression = entity.components.get('progression')
      const stats = entity.components.get('stats')

      if (progression && stats) {
        // Check for level ups
        this.checkLevelUp(entity, progression, stats)
        
        // Update skill tree availability
        this.updateSkillTree(entity, progression)
        
        // Check achievement progress
        this.updateAchievements(entity, progression, stats)
        
        // Apply skill bonuses to stats
        this.applySkillBonuses(entity, progression, stats)
      }
    })
  }

  private checkLevelUp(entity: GameEntity, progression: any, stats: any): void {
    const xpForNextLevel = this.calculateXPRequirement(progression.level)
    
    if (progression.xp >= xpForNextLevel) {
      progression.level += 1
      progression.skillPoints += 2
      progression.xp -= xpForNextLevel

      // Emit level up event
      window.dispatchEvent(new CustomEvent('levelUp', {
        detail: {
          entityId: entity.id,
          newLevel: progression.level,
          skillPointsGained: 2
        }
      }))
    }
  }

  private calculateXPRequirement(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }

  private updateSkillTree(entity: GameEntity, progression: any): void {
    for (const [skillId, skill] of this.skillTree) {
      if (!skill.unlocked && progression.level >= skill.requiredLevel) {
        // Check prerequisites
        const prerequisitesMet = skill.prerequisites.every(prereqId => {
          const prereq = this.skillTree.get(prereqId)
          return prereq?.mastered || false
        })

        if (prerequisitesMet) {
          skill.unlocked = true
          
          window.dispatchEvent(new CustomEvent('skillUnlocked', {
            detail: { skillId, skill }
          }))
        }
      }
    }
  }

  private updateAchievements(entity: GameEntity, progression: any, stats: any): void {
    for (const [achievementId, achievement] of this.achievements) {
      if (!achievement.unlocked && achievement.conditions(entity)) {
        achievement.progress = Math.min(achievement.progress + 1, achievement.maxProgress)
        
        if (achievement.progress >= achievement.maxProgress) {
          achievement.unlocked = true
          
          // Award achievement rewards
          if (achievement.rewards.xp) {
            progression.xp += achievement.rewards.xp
          }
          if (achievement.rewards.coins) {
            stats.totalCoins += achievement.rewards.coins
          }
          if (achievement.rewards.skillPoints) {
            progression.skillPoints += achievement.rewards.skillPoints
          }

          window.dispatchEvent(new CustomEvent('achievementUnlocked', {
            detail: { achievementId, achievement }
          }))
        }
      }
    }
  }

  private applySkillBonuses(entity: GameEntity, progression: any, stats: any): void {
    let totalBonuses = {
      incomeBoost: 0,
      expenseReduction: 0,
      investmentReturns: 0,
      riskTolerance: 0
    }

    for (const [skillId, skill] of this.skillTree) {
      if (skill.mastered && skill.bonuses) {
        totalBonuses.incomeBoost += skill.bonuses.incomeBoost || 0
        totalBonuses.expenseReduction += skill.bonuses.expenseReduction || 0
        totalBonuses.investmentReturns += skill.bonuses.investmentReturns || 0
        totalBonuses.riskTolerance += skill.bonuses.riskTolerance || 0
      }
    }

    stats.bonuses = totalBonuses
  }

  // Skill management
  unlockSkill(skillId: string, entityId: string): boolean {
    const skill = this.skillTree.get(skillId)
    if (!skill || !skill.unlocked) return false

    // Check if entity has enough skill points
    const entity = this.getEntityById(entityId)
    if (!entity) return false

    const progression = entity.components.get('progression')
    if (progression.skillPoints <= 0) return false

    progression.skillPoints -= 1
    skill.mastered = true

    window.dispatchEvent(new CustomEvent('skillMastered', {
      detail: { skillId, skill }
    }))

    return true
  }

  private getEntityById(entityId: string): GameEntity | undefined {
    // This would typically be provided by the game engine
    // For now, we'll emit an event to request the entity
    let foundEntity: GameEntity | undefined
    
    window.dispatchEvent(new CustomEvent('requestEntity', {
      detail: { 
        entityId,
        callback: (entity: GameEntity) => { foundEntity = entity }
      }
    }))
    
    return foundEntity
  }

  private initializeSkillTree(): void {
    const skills: SkillNode[] = [
      {
        id: 'basic_saving',
        name: 'Basic Saving',
        description: 'Learn fundamental saving strategies',
        category: 'saving',
        requiredLevel: 1,
        prerequisites: [],
        unlocked: true,
        mastered: false,
        xpRequired: 50,
        bonuses: { expenseReduction: 0.05 }
      },
      {
        id: 'emergency_fund',
        name: 'Emergency Fund',
        description: 'Build and maintain emergency savings',
        category: 'saving',
        requiredLevel: 3,
        prerequisites: ['basic_saving'],
        unlocked: false,
        mastered: false,
        xpRequired: 100,
        bonuses: { riskTolerance: 0.1 }
      },
      {
        id: 'budgeting_101',
        name: 'Budgeting Basics',
        description: 'Master the art of budgeting',
        category: 'budgeting',
        requiredLevel: 2,
        prerequisites: [],
        unlocked: false,
        mastered: false,
        xpRequired: 75,
        bonuses: { expenseReduction: 0.1 }
      },
      {
        id: 'investment_basics',
        name: 'Investment Fundamentals',
        description: 'Learn basic investment principles',
        category: 'investing',
        requiredLevel: 5,
        prerequisites: ['emergency_fund', 'budgeting_101'],
        unlocked: false,
        mastered: false,
        xpRequired: 150,
        bonuses: { investmentReturns: 0.15 }
      },
      {
        id: 'entrepreneurship',
        name: 'Business Mindset',
        description: 'Develop entrepreneurial thinking',
        category: 'entrepreneurship',
        requiredLevel: 7,
        prerequisites: ['investment_basics'],
        unlocked: false,
        mastered: false,
        xpRequired: 200,
        bonuses: { incomeBoost: 0.2 }
      }
    ]

    skills.forEach(skill => {
      this.skillTree.set(skill.id, skill)
    })
  }

  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      {
        id: 'first_dollar',
        name: 'First Dollar',
        description: 'Earn your first dollar',
        category: 'milestone',
        rarity: 'common',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rewards: { xp: 25, coins: 10 },
        conditions: (entity) => {
          const stats = entity.components.get('stats')
          return stats?.totalCoins >= 1
        }
      },
      {
        id: 'penny_pincher',
        name: 'Penny Pincher',
        description: 'Save $100 without spending',
        category: 'challenge',
        rarity: 'rare',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rewards: { xp: 100, skillPoints: 1 },
        conditions: (entity) => {
          const stats = entity.components.get('stats')
          return stats?.savings >= 100
        }
      },
      {
        id: 'level_master',
        name: 'Level Master',
        description: 'Reach level 10',
        category: 'milestone',
        rarity: 'epic',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rewards: { xp: 500, coins: 100, title: 'Financial Scholar' },
        conditions: (entity) => {
          const progression = entity.components.get('progression')
          return progression?.level >= 10
        }
      }
    ]

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement)
    })
  }

  getSkillTree(): Map<string, SkillNode> {
    return new Map(this.skillTree)
  }

  getAchievements(): Map<string, Achievement> {
    return new Map(this.achievements)
  }
}