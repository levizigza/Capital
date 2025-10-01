/**
 * Age Tier System - Adapts content complexity and visual design for different age groups
 * Elementary (6-10), Middle School (11-14), Adult (15+)
 */

export interface AgeTier {
  id: 'elementary' | 'middle' | 'adult'
  name: string
  ageRange: string
  description: string
  complexity: 'simple' | 'moderate' | 'complex'
  visualStyle: AgeVisualStyle
  contentAdaptations: AgeContentAdaptations
  gameplayFeatures: AgeGameplayFeatures
}

export interface AgeVisualStyle {
  colorScheme: 'bright' | 'balanced' | 'professional'
  animations: 'playful' | 'smooth' | 'minimal'
  iconStyle: 'cartoon' | 'friendly' | 'modern'
  typography: 'large' | 'medium' | 'compact'
  layout: 'simple' | 'structured' | 'dense'
  characters: 'mascot' | 'avatar' | 'none'
}

export interface AgeContentAdaptations {
  vocabulary: 'simple' | 'grade-level' | 'advanced'
  conceptComplexity: 'basic' | 'intermediate' | 'advanced'
  mathLevel: 'arithmetic' | 'pre-algebra' | 'algebra+'
  financialConcepts: string[]
  realWorldExamples: string[]
  attentionSpan: number // minutes
  sessionLength: number // minutes
}

export interface AgeGameplayFeatures {
  rewardFrequency: 'high' | 'medium' | 'low'
  challengeDifficulty: 'easy' | 'adaptive' | 'challenging'
  socialFeatures: boolean
  competitiveElements: boolean
  parentalControls: boolean
  dataCollection: 'minimal' | 'educational' | 'full'
  motionControls: 'encouraged' | 'optional' | 'advanced'
}

export class AgeTierSystem {
  private currentTier: AgeTier | null = null
  private userAge: number | null = null

  private tiers: AgeTier[] = [
    {
      id: 'elementary',
      name: 'Elementary Explorer',
      ageRange: '6-10 years',
      description: 'Fun, colorful introduction to money basics with friendly characters',
      complexity: 'simple',
      visualStyle: {
        colorScheme: 'bright',
        animations: 'playful',
        iconStyle: 'cartoon',
        typography: 'large',
        layout: 'simple',
        characters: 'mascot'
      },
      contentAdaptations: {
        vocabulary: 'simple',
        conceptComplexity: 'basic',
        mathLevel: 'arithmetic',
        financialConcepts: [
          'Counting money',
          'Needs vs wants',
          'Saving in a piggy bank',
          'Earning money through chores',
          'Shopping basics',
          'Sharing and giving'
        ],
        realWorldExamples: [
          'Buying a toy',
          'Saving for a bike',
          'Helping at a lemonade stand',
          'Going to the store with parents',
          'Getting allowance for chores'
        ],
        attentionSpan: 5,
        sessionLength: 10
      },
      gameplayFeatures: {
        rewardFrequency: 'high',
        challengeDifficulty: 'easy',
        socialFeatures: false,
        competitiveElements: false,
        parentalControls: true,
        dataCollection: 'minimal',
        motionControls: 'encouraged'
      }
    },
    {
      id: 'middle',
      name: 'Money Manager',
      ageRange: '11-14 years',
      description: 'Building practical money skills with real-world scenarios',
      complexity: 'moderate',
      visualStyle: {
        colorScheme: 'balanced',
        animations: 'smooth',
        iconStyle: 'friendly',
        typography: 'medium',
        layout: 'structured',
        characters: 'avatar'
      },
      contentAdaptations: {
        vocabulary: 'grade-level',
        conceptComplexity: 'intermediate',
        mathLevel: 'pre-algebra',
        financialConcepts: [
          'Budgeting basics',
          'Banking and accounts',
          'Interest and compound growth',
          'Smart shopping and comparison',
          'Entrepreneurship basics',
          'Credit and debt awareness',
          'Goal setting and planning'
        ],
        realWorldExamples: [
          'Managing a monthly allowance',
          'Saving for a gaming console',
          'Starting a small business',
          'Understanding bank accounts',
          'Planning for college expenses',
          'Part-time job earnings'
        ],
        attentionSpan: 15,
        sessionLength: 20
      },
      gameplayFeatures: {
        rewardFrequency: 'medium',
        challengeDifficulty: 'adaptive',
        socialFeatures: true,
        competitiveElements: true,
        parentalControls: true,
        dataCollection: 'educational',
        motionControls: 'optional'
      }
    },
    {
      id: 'adult',
      name: 'Financial Professional',
      ageRange: '15+ years',
      description: 'Comprehensive financial literacy with advanced tools and concepts',
      complexity: 'complex',
      visualStyle: {
        colorScheme: 'professional',
        animations: 'minimal',
        iconStyle: 'modern',
        typography: 'compact',
        layout: 'dense',
        characters: 'none'
      },
      contentAdaptations: {
        vocabulary: 'advanced',
        conceptComplexity: 'advanced',
        mathLevel: 'algebra+',
        financialConcepts: [
          'Advanced budgeting and cash flow',
          'Investment strategies and portfolios',
          'Tax planning and optimization',
          'Insurance and risk management',
          'Retirement planning',
          'Real estate and mortgages',
          'Business finance and entrepreneurship',
          'Credit management and building',
          'Economic principles and markets'
        ],
        realWorldExamples: [
          'Managing a full-time salary',
          'Investing in stocks and bonds',
          'Buying a first home',
          'Starting a business',
          'Planning for retirement',
          'Managing student loans',
          'Building an emergency fund',
          'Understanding taxes and deductions'
        ],
        attentionSpan: 30,
        sessionLength: 45
      },
      gameplayFeatures: {
        rewardFrequency: 'low',
        challengeDifficulty: 'challenging',
        socialFeatures: true,
        competitiveElements: true,
        parentalControls: false,
        dataCollection: 'full',
        motionControls: 'advanced'
      }
    }
  ]

  setUserAge(age: number) {
    this.userAge = age
    this.currentTier = this.determineTierByAge(age)
  }

  setTier(tierId: 'elementary' | 'middle' | 'adult') {
    this.currentTier = this.tiers.find(tier => tier.id === tierId) || null
  }

  private determineTierByAge(age: number): AgeTier {
    if (age <= 10) {
      return this.tiers.find(t => t.id === 'elementary')!
    } else if (age <= 14) {
      return this.tiers.find(t => t.id === 'middle')!
    } else {
      return this.tiers.find(t => t.id === 'adult')!
    }
  }

  getCurrentTier(): AgeTier | null {
    return this.currentTier
  }

  getAllTiers(): AgeTier[] {
    return this.tiers
  }

  adaptContent(baseContent: any): any {
    if (!this.currentTier) return baseContent

    const tier = this.currentTier
    const adaptations = tier.contentAdaptations

    return {
      ...baseContent,
      vocabulary: adaptations.vocabulary,
      complexity: adaptations.conceptComplexity,
      mathLevel: adaptations.mathLevel,
      concepts: adaptations.financialConcepts,
      examples: adaptations.realWorldExamples,
      sessionLength: adaptations.sessionLength * 1000, // Convert to milliseconds
      attentionBreaks: Math.floor(adaptations.sessionLength / adaptations.attentionSpan)
    }
  }

  adaptVisualStyle(): any {
    if (!this.currentTier) return {}

    const style = this.currentTier.visualStyle

    return {
      colorScheme: style.colorScheme,
      animations: style.animations,
      iconStyle: style.iconStyle,
      typography: style.typography,
      layout: style.layout,
      showCharacters: style.characters !== 'none',
      characterStyle: style.characters
    }
  }

  adaptGameplay(): any {
    if (!this.currentTier) return {}

    const gameplay = this.currentTier.gameplayFeatures

    return {
      rewardFrequency: gameplay.rewardFrequency,
      challengeDifficulty: gameplay.challengeDifficulty,
      enableSocialFeatures: gameplay.socialFeatures,
      enableCompetition: gameplay.competitiveElements,
      requireParentalControls: gameplay.parentalControls,
      dataCollectionLevel: gameplay.dataCollection,
      motionControlStyle: gameplay.motionControls
    }
  }

  getRecommendedGames(): string[] {
    if (!this.currentTier) return []

    switch (this.currentTier.id) {
      case 'elementary':
        return [
          'coin-counting',
          'piggy-bank-saver',
          'needs-vs-wants',
          'lemonade-stand',
          'simple-budget'
        ]
      case 'middle':
        return [
          'budget-balance',
          'savings-goals',
          'compound-interest',
          'smart-shopper',
          'bank-account-sim',
          'entrepreneur-challenge'
        ]
      case 'adult':
        return [
          'investment-tower',
          'credit-optimizer',
          'tax-planning',
          'retirement-planner',
          'real-estate-investor',
          'business-simulator',
          'market-trader'
        ]
      default:
        return []
    }
  }

  shouldShowConcept(concept: string): boolean {
    if (!this.currentTier) return false
    return this.currentTier.contentAdaptations.financialConcepts.includes(concept)
  }

  getMaxSessionTime(): number {
    return this.currentTier?.contentAdaptations.sessionLength || 20
  }

  getAttentionSpan(): number {
    return this.currentTier?.contentAdaptations.attentionSpan || 10
  }

  requiresParentalConsent(): boolean {
    return this.currentTier?.gameplayFeatures.parentalControls ?? false
  }

  getAllowedDataCollection(): 'minimal' | 'educational' | 'full' {
    return this.currentTier?.gameplayFeatures.dataCollection ?? 'minimal'
  }

  getMotionControlPreference(): 'encouraged' | 'optional' | 'advanced' {
    return this.currentTier?.gameplayFeatures.motionControls ?? 'optional'
  }

  // CSS classes based on age tier
  getThemeClasses(): string[] {
    if (!this.currentTier) return []

    const baseClasses = [`tier-${this.currentTier.id}`]
    const style = this.currentTier.visualStyle

    baseClasses.push(`color-${style.colorScheme}`)
    baseClasses.push(`animation-${style.animations}`)
    baseClasses.push(`icon-${style.iconStyle}`)
    baseClasses.push(`text-${style.typography}`)
    baseClasses.push(`layout-${style.layout}`)

    return baseClasses
  }

  // Generate age-appropriate currency formatting
  formatCurrency(amount: number): string {
    if (!this.currentTier) return `$${amount.toFixed(2)}`

    switch (this.currentTier.id) {
      case 'elementary':
        // Simple dollar amounts, no cents for small amounts
        if (amount < 1) {
          return `${Math.round(amount * 100)}¢`
        }
        return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`
      
      case 'middle':
        // Standard currency formatting
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      
      case 'adult':
        // Professional formatting with thousands separators
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      
      default:
        return `$${amount.toFixed(2)}`
    }
  }

  // Generate age-appropriate explanations
  explainConcept(concept: string): string {
    if (!this.currentTier) return concept

    const explanations: { [key: string]: { [key: string]: string } } = {
      'interest': {
        elementary: 'When you save money, the bank gives you extra money as a thank you!',
        middle: 'Interest is extra money you earn when you save, or extra money you pay when you borrow.',
        adult: 'Interest is the cost of borrowing money or the reward for lending/saving money, calculated as a percentage.'
      },
      'budget': {
        elementary: 'A budget is a plan for how to spend your money on things you need and want.',
        middle: 'A budget helps you plan how much money to spend on different things so you don\'t run out.',
        adult: 'A budget is a financial plan that helps you allocate income across expenses, savings, and investments.'
      },
      'investment': {
        elementary: 'Investing means using your money to buy something that might be worth more later.',
        middle: 'Investing is putting money into stocks, bonds, or other things that can grow in value over time.',
        adult: 'Investment involves allocating capital with the expectation of generating income or appreciation over time.'
      }
    }

    return explanations[concept]?.[this.currentTier.id] || concept
  }
}