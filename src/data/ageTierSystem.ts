export type AgeTier = 'elementary' | 'middle-school' | 'high-school' | 'adult'

export interface AgeTierConfig {
  id: AgeTier
  name: string
  ageRange: string
  description: string
  visualTheme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    cardStyle: string
    buttonStyle: string
    iconStyle: 'emoji' | 'outlined' | 'filled' | '3d'
    animationStyle: 'bouncy' | 'smooth' | 'minimal' | 'professional'
  }
  gameComplexity: {
    minComplexity: number // 1-10 scale
    maxComplexity: number
    readingLevel: string
    attentionSpan: string // average session length
    abstractionLevel: 'concrete' | 'mixed' | 'abstract'
  }
  learningFocus: {
    primary: string[]
    secondary: string[]
    realWorldConnections: 'direct' | 'guided' | 'independent'
  }
  parentalFeatures: {
    progressTracking: boolean
    detailedReports: boolean
    achievementSharing: boolean
    recommendedActivities: boolean
  }
  storyThemes: string[]
  gameThemes: string[]
}

export const AGE_TIER_CONFIGS: Record<AgeTier, AgeTierConfig> = {
  elementary: {
    id: 'elementary',
    name: 'Young Explorers',
    ageRange: '6-11 years',
    description: 'Building foundational financial habits through play and storytelling',
    visualTheme: {
      primaryColor: '#10B981', // Green - growth
      secondaryColor: '#F59E0B', // Yellow - energy
      backgroundColor: 'from-green-50 via-blue-50 to-purple-50',
      cardStyle: 'rounded-2xl shadow-lg border-2 border-green-200',
      buttonStyle: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      iconStyle: 'emoji',
      animationStyle: 'bouncy'
    },
    gameComplexity: {
      minComplexity: 1,
      maxComplexity: 4,
      readingLevel: 'Grades 1-4',
      attentionSpan: '10-15 minutes',
      abstractionLevel: 'concrete'
    },
    learningFocus: {
      primary: ['Saving habits', 'Basic budgeting', 'Needs vs wants', 'Sharing'],
      secondary: ['Delayed gratification', 'Goal setting', 'Counting money'],
      realWorldConnections: 'direct'
    },
    parentalFeatures: {
      progressTracking: true,
      detailedReports: true,
      achievementSharing: true,
      recommendedActivities: true
    },
    storyThemes: ['Adventure', 'Friendship', 'Discovery', 'Helping others'],
    gameThemes: ['Animals', 'Space', 'Fantasy', 'Everyday heroes', 'Nature']
  },
  'middle-school': {
    id: 'middle-school',
    name: 'Financial Adventurers',
    ageRange: '11-14 years',
    description: 'Exploring more complex financial concepts through strategic gaming',
    visualTheme: {
      primaryColor: '#8B5CF6', // Purple - creativity
      secondaryColor: '#EC4899', // Pink - expression
      backgroundColor: 'from-purple-50 via-pink-50 to-blue-50',
      cardStyle: 'rounded-xl shadow-xl border border-purple-300',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      iconStyle: 'outlined',
      animationStyle: 'smooth'
    },
    gameComplexity: {
      minComplexity: 3,
      maxComplexity: 7,
      readingLevel: 'Grades 5-8',
      attentionSpan: '20-30 minutes',
      abstractionLevel: 'mixed'
    },
    learningFocus: {
      primary: ['Budget management', 'Investment basics', 'Entrepreneurship', 'Digital banking'],
      secondary: ['Interest and compound growth', 'Credit concepts', 'Career planning'],
      realWorldConnections: 'guided'
    },
    parentalFeatures: {
      progressTracking: true,
      detailedReports: true,
      achievementSharing: true,
      recommendedActivities: false
    },
    storyThemes: ['Mystery', 'Competition', 'Innovation', 'Social impact'],
    gameThemes: ['Retro gaming', 'Minecraft-like building', 'Among Us deduction', 'Strategy games']
  },
  'high-school': {
    id: 'high-school',
    name: 'Wealth Builders',
    ageRange: '14-18 years',
    description: 'Mastering advanced financial concepts through real-world simulation',
    visualTheme: {
      primaryColor: '#3B82F6', // Blue - professionalism
      secondaryColor: '#6366F1', // Indigo - knowledge
      backgroundColor: 'from-blue-50 via-indigo-50 to-gray-50',
      cardStyle: 'rounded-lg shadow-2xl border border-blue-400',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      iconStyle: 'filled',
      animationStyle: 'minimal'
    },
    gameComplexity: {
      minComplexity: 6,
      maxComplexity: 9,
      readingLevel: 'Grades 9-12',
      attentionSpan: '30-45 minutes',
      abstractionLevel: 'abstract'
    },
    learningFocus: {
      primary: ['Investment strategies', 'Tax planning', 'Credit management', 'Financial independence'],
      secondary: ['Risk management', 'Advanced budgeting', 'Retirement planning', 'Entrepreneurship'],
      realWorldConnections: 'independent'
    },
    parentalFeatures: {
      progressTracking: true,
      detailedReports: true,
      achievementSharing: true,
      recommendedActivities: false
    },
    storyThemes: ['Drama', 'Strategy', 'Competition', 'Real-world impact', 'Future planning'],
    gameThemes: ['Worldbuilding', 'Business simulation', 'Market trading', 'Life simulation']
  },
  adult: {
    id: 'adult',
    name: 'Financial Masters',
    ageRange: '18+ years',
    description: 'Comprehensive financial mastery for real-world application',
    visualTheme: {
      primaryColor: '#1F2937', // Gray - sophistication
      secondaryColor: '#059669', // Emerald - success
      backgroundColor: 'from-gray-50 to-emerald-50',
      cardStyle: 'rounded-md shadow-lg border border-gray-300',
      buttonStyle: 'bg-gradient-to-r from-gray-700 to-emerald-700 hover:from-gray-800 hover:to-emerald-800',
      iconStyle: '3d',
      animationStyle: 'professional'
    },
    gameComplexity: {
      minComplexity: 7,
      maxComplexity: 10,
      readingLevel: 'College level',
      attentionSpan: '45-60 minutes',
      abstractionLevel: 'abstract'
    },
    learningFocus: {
      primary: ['Advanced investing', 'Estate planning', 'Tax optimization', 'Retirement strategies'],
      secondary: ['Business finance', 'Real estate', 'Insurance planning', 'Legacy building'],
      realWorldConnections: 'independent'
    },
    parentalFeatures: {
      progressTracking: false,
      detailedReports: false,
      achievementSharing: true,
      recommendedActivities: false
    },
    storyThemes: ['Professional drama', 'Market psychology', 'Economic systems', 'Legacy building'],
    gameThemes: ['Complex simulations', 'Real data integration', 'Professional scenarios', 'Strategic planning']
  }
}

export function getAgeTierConfig(age: number): AgeTierConfig {
  if (age <= 11) return AGE_TIER_CONFIGS.elementary
  if (age <= 14) return AGE_TIER_CONFIGS['middle-school']
  if (age <= 18) return AGE_TIER_CONFIGS['high-school']
  return AGE_TIER_CONFIGS.adult
}

export function getAgeTierFromId(id: AgeTier): AgeTierConfig {
  return AGE_TIER_CONFIGS[id]
}