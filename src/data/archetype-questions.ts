export type ArchetypeId = 'navigator' | 'strategist' | 'creator' | 'guardian'

export interface ArchetypeWeights {
  navigator: number
  strategist: number
  creator: number
  guardian: number
}

export interface ArchetypeQuestion {
  id: string
  question: string
  situation: string
  answers: {
    text: string
    weights: ArchetypeWeights
  }[]
}

export const ARCHETYPE_QUESTIONS: ArchetypeQuestion[] = [
  {
    id: 'q1',
    question: 'You receive an unexpected $500 bonus. What is your first instinct?',
    situation: 'Financial windfall decision',
    answers: [
      {
        text: 'Invest in a promising new opportunity or startup',
        weights: { navigator: 2, strategist: 0, creator: 3, guardian: 0 }
      },
      {
        text: 'Put it straight into savings and research the best account rates',
        weights: { navigator: 0, strategist: 3, creator: 0, guardian: 2 }
      },
      {
        text: 'Split it: some for fun, some for bills, tracked carefully',
        weights: { navigator: 0, strategist: 2, creator: 1, guardian: 3 }
      },
      {
        text: 'Share it with friends for a group experience or investment',
        weights: { navigator: 3, strategist: 0, creator: 1, guardian: 1 }
      }
    ]
  },
  {
    id: 'q2',
    question: 'When making a major purchase decision, you rely most on:',
    situation: 'Purchase decision-making process',
    answers: [
      {
        text: 'Detailed spreadsheets comparing every spec and price',
        weights: { navigator: 0, strategist: 3, creator: 1, guardian: 1 }
      },
      {
        text: 'Recommendations from trusted friends and reviews',
        weights: { navigator: 3, strategist: 1, creator: 0, guardian: 2 }
      },
      {
        text: 'How innovative or unique the product is',
        weights: { navigator: 1, strategist: 0, creator: 3, guardian: 0 }
      },
      {
        text: 'Whether it is practical, reliable, and within budget',
        weights: { navigator: 0, strategist: 2, creator: 0, guardian: 3 }
      }
    ]
  },
  {
    id: 'q3',
    question: 'Your ideal learning environment for financial topics is:',
    situation: 'Learning style preference',
    answers: [
      {
        text: 'Interactive workshops with group discussions',
        weights: { navigator: 3, strategist: 0, creator: 2, guardian: 1 }
      },
      {
        text: 'Self-paced online courses with detailed modules',
        weights: { navigator: 0, strategist: 3, creator: 1, guardian: 2 }
      },
      {
        text: 'Creative simulations and hands-on experiments',
        weights: { navigator: 1, strategist: 0, creator: 3, guardian: 1 }
      },
      {
        text: 'Structured step-by-step guides I can follow consistently',
        weights: { navigator: 0, strategist: 2, creator: 0, guardian: 3 }
      }
    ]
  },
  {
    id: 'q4',
    question: 'When facing financial uncertainty, you:',
    situation: 'Stress response pattern',
    answers: [
      {
        text: 'Talk it through with others and seek collaborative solutions',
        weights: { navigator: 3, strategist: 1, creator: 1, guardian: 1 }
      },
      {
        text: 'Analyze data to find the optimal logical path forward',
        weights: { navigator: 0, strategist: 3, creator: 1, guardian: 2 }
      },
      {
        text: 'Brainstorm creative alternatives and pivot if needed',
        weights: { navigator: 1, strategist: 0, creator: 3, guardian: 0 }
      },
      {
        text: 'Return to proven strategies that have worked before',
        weights: { navigator: 0, strategist: 2, creator: 0, guardian: 3 }
      }
    ]
  },
  {
    id: 'q5',
    question: 'Your approach to financial goals is best described as:',
    situation: 'Goal-setting methodology',
    answers: [
      {
        text: 'Social and competitive—I thrive on shared challenges',
        weights: { navigator: 3, strategist: 0, creator: 1, guardian: 1 }
      },
      {
        text: 'Data-driven with specific metrics and milestones',
        weights: { navigator: 0, strategist: 3, creator: 1, guardian: 2 }
      },
      {
        text: 'Big-picture visionary with room for creative adaptation',
        weights: { navigator: 1, strategist: 1, creator: 3, guardian: 0 }
      },
      {
        text: 'Steady and incremental, building habits over time',
        weights: { navigator: 0, strategist: 2, creator: 0, guardian: 3 }
      }
    ]
  },
  {
    id: 'q6',
    question: 'How do you feel about financial risk?',
    situation: 'Risk tolerance assessment',
    answers: [
      {
        text: 'Exciting when shared—calculated risks with partners',
        weights: { navigator: 3, strategist: 0, creator: 2, guardian: 0 }
      },
      {
        text: 'Only acceptable when thoroughly analyzed and managed',
        weights: { navigator: 0, strategist: 3, creator: 1, guardian: 1 }
      },
      {
        text: 'Essential for innovation—I embrace uncertainty',
        weights: { navigator: 1, strategist: 0, creator: 3, guardian: 0 }
      },
      {
        text: 'Prefer to minimize—I value stability and consistency',
        weights: { navigator: 0, strategist: 2, creator: 0, guardian: 3 }
      }
    ]
  },
  {
    id: 'q7',
    question: 'Your budgeting style is:',
    situation: 'Budget management approach',
    answers: [
      {
        text: 'Flexible—I negotiate and adjust with my circle',
        weights: { navigator: 3, strategist: 0, creator: 2, guardian: 1 }
      },
      {
        text: 'Precise—every dollar tracked in detailed categories',
        weights: { navigator: 0, strategist: 3, creator: 0, guardian: 2 }
      },
      {
        text: 'Experimental—I try new systems and optimize constantly',
        weights: { navigator: 1, strategist: 1, creator: 3, guardian: 0 }
      },
      {
        text: 'Routine-based—same categories, same amounts monthly',
        weights: { navigator: 0, strategist: 2, creator: 0, guardian: 3 }
      }
    ]
  },
  {
    id: 'q8',
    question: 'When researching investments, you prefer:',
    situation: 'Investment research method',
    answers: [
      {
        text: 'Social proof—what are successful people buying?',
        weights: { navigator: 3, strategist: 0, creator: 1, guardian: 1 }
      },
      {
        text: 'Financial statements, ratios, and historical data',
        weights: { navigator: 0, strategist: 3, creator: 1, guardian: 2 }
      },
      {
        text: 'Future potential and disruptive innovation stories',
        weights: { navigator: 1, strategist: 1, creator: 3, guardian: 0 }
      },
      {
        text: 'Proven dividend stocks with consistent track records',
        weights: { navigator: 0, strategist: 2, creator: 0, guardian: 3 }
      }
    ]
  },
  {
    id: 'q9',
    question: 'Your ideal financial dashboard would show:',
    situation: 'Information visualization preference',
    answers: [
      {
        text: 'Community benchmarks and collaborative goals',
        weights: { navigator: 3, strategist: 0, creator: 1, guardian: 1 }
      },
      {
        text: 'Detailed charts, trends, and analytical breakdowns',
        weights: { navigator: 0, strategist: 3, creator: 1, guardian: 2 }
      },
      {
        text: 'Big-picture patterns and future projections',
        weights: { navigator: 1, strategist: 1, creator: 3, guardian: 1 }
      },
      {
        text: 'Simple progress bars and streak trackers',
        weights: { navigator: 0, strategist: 2, creator: 0, guardian: 3 }
      }
    ]
  },
  {
    id: 'q10',
    question: 'When teaching others about money, you emphasize:',
    situation: 'Teaching and communication style',
    answers: [
      {
        text: 'Stories, examples, and learning from each other',
        weights: { navigator: 3, strategist: 0, creator: 2, guardian: 1 }
      },
      {
        text: 'Facts, principles, and logical frameworks',
        weights: { navigator: 0, strategist: 3, creator: 1, guardian: 2 }
      },
      {
        text: 'Creative metaphors and innovative perspectives',
        weights: { navigator: 1, strategist: 1, creator: 3, guardian: 1 }
      },
      {
        text: 'Practical steps and reliable habits',
        weights: { navigator: 0, strategist: 2, creator: 1, guardian: 3 }
      }
    ]
  }
]

export interface Archetype {
  id: ArchetypeId
  name: string
  tagline: string
  description: string
  strengths: string[]
  growthZones: string[]
  preferredLearning: string[]
  idealQuests: string[]
  color: {
    primary: string
    secondary: string
    accent: string
  }
  uiPreferences: {
    dashboardLayout: 'social-first' | 'analytics-first' | 'visual-first' | 'simple-first'
    chartPreference: 'minimal' | 'detailed' | 'predictive' | 'progress-bars'
    rewardFrequency: 'high' | 'balanced' | 'milestone' | 'steady'
    narrativeTone: 'energetic' | 'professional' | 'inspirational' | 'calm'
  }
  varkBias: {
    visual: number
    aural: number
    readWrite: number
    kinesthetic: number
  }
  difficultyPacing: 'fast' | 'adaptive' | 'exploratory' | 'gradual'
  motto: string
  icon: string
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  navigator: {
    id: 'navigator',
    name: 'Navigator',
    tagline: 'The Social Connector',
    description: 'You thrive on relationships and teamwork. Financial success for you is about building networks, collaborative ventures, and shared financial goals.',
    strengths: [
      'Quick decision-making in dynamic situations',
      'Natural networking and relationship building',
      'Persuasive communication and negotiation',
      'Thrives under social pressure and competition'
    ],
    growthZones: [
      'Developing patience for long-term analysis',
      'Building systematic tracking habits',
      'Learning to slow down for complex decisions',
      'Balancing social enthusiasm with data review'
    ],
    preferredLearning: [
      'Interactive group challenges',
      'Competitive leaderboards',
      'Social trading simulations',
      'Collaborative savings goals',
      'Negotiation mini-games'
    ],
    idealQuests: [
      'Team savings challenges',
      'Group investment competitions',
      'Social trading tournaments',
      'Collaborative budget projects',
      'Community financial goals'
    ],
    color: {
      primary: 'oklch(0.65 0.20 30)',
      secondary: 'oklch(0.70 0.18 45)',
      accent: 'oklch(0.75 0.16 60)'
    },
    uiPreferences: {
      dashboardLayout: 'social-first',
      chartPreference: 'minimal',
      rewardFrequency: 'high',
      narrativeTone: 'energetic'
    },
    varkBias: {
      visual: 0.25,
      aural: 0.40,
      readWrite: 0.15,
      kinesthetic: 0.20
    },
    difficultyPacing: 'fast',
    motto: 'Together we thrive, alone we survive',
    icon: '🔥'
  },
  strategist: {
    id: 'strategist',
    name: 'Strategist',
    tagline: 'The Analytical Planner',
    description: 'You excel at detailed analysis and systematic planning. Financial mastery for you means understanding every number, building robust systems, and making data-driven decisions.',
    strengths: [
      'Exceptional attention to detail and accuracy',
      'Systematic approach to complex problems',
      'Data-driven decision making',
      'Long-term strategic planning ability'
    ],
    growthZones: [
      'Developing comfort with uncertainty',
      'Learning to act without perfect information',
      'Building social collaboration skills',
      'Embracing creative experimentation'
    ],
    preferredLearning: [
      'Detailed analytics dashboards',
      'Structured progression paths',
      'Data visualization tools',
      'Self-paced deep dives',
      'Optimization puzzles'
    ],
    idealQuests: [
      'Portfolio optimization challenges',
      'Budget efficiency puzzles',
      'Risk analysis scenarios',
      'Financial forecasting exercises',
      'System design projects'
    ],
    color: {
      primary: 'oklch(0.50 0.18 230)',
      secondary: 'oklch(0.55 0.16 220)',
      accent: 'oklch(0.60 0.14 240)'
    },
    uiPreferences: {
      dashboardLayout: 'analytics-first',
      chartPreference: 'detailed',
      rewardFrequency: 'milestone',
      narrativeTone: 'professional'
    },
    varkBias: {
      visual: 0.30,
      aural: 0.10,
      readWrite: 0.45,
      kinesthetic: 0.15
    },
    difficultyPacing: 'adaptive',
    motto: 'Measure twice, invest once',
    icon: '🛡️'
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    tagline: 'The Innovative Builder',
    description: 'You see possibilities where others see problems. Financial success for you is about creative problem-solving, innovation, and building something new from the ground up.',
    strengths: [
      'Creative problem-solving and innovation',
      'Big-picture strategic thinking',
      'Comfort with ambiguity and change',
      'Entrepreneurial mindset and initiative'
    ],
    growthZones: [
      'Developing attention to operational details',
      'Building consistent execution habits',
      'Learning to value proven methods',
      'Balancing innovation with stability'
    ],
    preferredLearning: [
      'Creative simulations',
      'Innovation laboratories',
      'Entrepreneurship challenges',
      'Design thinking exercises',
      'Future-focused scenarios'
    ],
    idealQuests: [
      'Business building simulations',
      'Investment innovation challenges',
      'Financial product design',
      'Startup funding scenarios',
      'Market disruption games'
    ],
    color: {
      primary: 'oklch(0.60 0.22 290)',
      secondary: 'oklch(0.65 0.20 280)',
      accent: 'oklch(0.70 0.18 300)'
    },
    uiPreferences: {
      dashboardLayout: 'visual-first',
      chartPreference: 'predictive',
      rewardFrequency: 'milestone',
      narrativeTone: 'inspirational'
    },
    varkBias: {
      visual: 0.40,
      aural: 0.15,
      readWrite: 0.15,
      kinesthetic: 0.30
    },
    difficultyPacing: 'exploratory',
    motto: 'Build the future, one bold idea at a time',
    icon: '⚡'
  },
  guardian: {
    id: 'guardian',
    name: 'Guardian',
    tagline: 'The Steady Protector',
    description: 'You value consistency, stability, and steady progress. Financial success for you is about building reliable systems, maintaining discipline, and achieving sustainable growth.',
    strengths: [
      'Exceptional consistency and discipline',
      'Reliable execution of proven methods',
      'Patient long-term perspective',
      'Strong risk management instincts'
    ],
    growthZones: [
      'Exploring calculated risks for growth',
      'Developing comfort with change',
      'Building adaptability skills',
      'Expanding creative thinking'
    ],
    preferredLearning: [
      'Routine-based challenges',
      'Streak rewards and habits',
      'Progressive difficulty paths',
      'Consistent micro-learning',
      'Stability simulations'
    ],
    idealQuests: [
      'Savings habit builders',
      'Compound growth trackers',
      'Emergency fund challenges',
      'Debt reduction marathons',
      'Retirement planning scenarios'
    ],
    color: {
      primary: 'oklch(0.55 0.18 145)',
      secondary: 'oklch(0.60 0.16 135)',
      accent: 'oklch(0.65 0.14 155)'
    },
    uiPreferences: {
      dashboardLayout: 'simple-first',
      chartPreference: 'progress-bars',
      rewardFrequency: 'steady',
      narrativeTone: 'calm'
    },
    varkBias: {
      visual: 0.25,
      aural: 0.20,
      readWrite: 0.30,
      kinesthetic: 0.25
    },
    difficultyPacing: 'gradual',
    motto: 'Slow and steady builds lasting wealth',
    icon: '🌱'
  }
}

export function calculateArchetypeScores(answers: number[][]): Record<ArchetypeId, number> {
  const scores: Record<ArchetypeId, number> = {
    navigator: 0,
    strategist: 0,
    creator: 0,
    guardian: 0
  }

  answers.forEach((answerIndices, questionIndex) => {
    answerIndices.forEach(answerIndex => {
      const question = ARCHETYPE_QUESTIONS[questionIndex]
      const answer = question.answers[answerIndex]
      
      if (answer) {
        scores.navigator += answer.weights.navigator
        scores.strategist += answer.weights.strategist
        scores.creator += answer.weights.creator
        scores.guardian += answer.weights.guardian
      }
    })
  })

  return scores
}

export function getDominantArchetype(scores: Record<ArchetypeId, number>): ArchetypeId {
  let maxScore = -1
  let dominant: ArchetypeId = 'guardian'

  Object.entries(scores).forEach(([id, score]) => {
    if (score > maxScore) {
      maxScore = score
      dominant = id as ArchetypeId
    }
  })

  return dominant
}

export function getSecondaryArchetype(scores: Record<ArchetypeId, number>, primaryId: ArchetypeId): ArchetypeId | null {
  let maxScore = -1
  let secondary: ArchetypeId | null = null

  Object.entries(scores).forEach(([id, score]) => {
    if (id !== primaryId && score > maxScore && score > 0) {
      maxScore = score
      secondary = id as ArchetypeId
    }
  })

  return secondary
}
