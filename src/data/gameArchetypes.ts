export interface ArchetypeProfile {
  id: 'navigator' | 'strategist' | 'creator' | 'guardian';
  name: string;
  description: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  varkBias: {
    visual: number;
    aural: number;
    readWrite: number;
    kinesthetic: number;
  };
  learningPreferences: {
    pace: 'fast' | 'moderate' | 'steady' | 'flexible';
    feedback: 'immediate' | 'detailed' | 'encouraging' | 'systematic';
    rewards: 'frequent' | 'milestone' | 'breakthrough' | 'consistent';
    social: 'high' | 'low' | 'moderate' | 'optional';
  };
  strengths: string[];
  growthZones: string[];
}

export const ARCHETYPES: Record<string, ArchetypeProfile> = {
  navigator: {
    id: 'navigator',
    name: 'Navigator',
    description: 'The Social Connector - Network-focused, collaborative, quick decision maker',
    colorTheme: {
      primary: 'oklch(0.65 0.15 45)',
      secondary: 'oklch(0.75 0.12 30)',
      accent: 'oklch(0.60 0.18 60)'
    },
    varkBias: {
      visual: 25,
      aural: 40,
      readWrite: 15,
      kinesthetic: 20
    },
    learningPreferences: {
      pace: 'fast',
      feedback: 'immediate',
      rewards: 'frequent',
      social: 'high'
    },
    strengths: ['Quick decision-making', 'Relationship building', 'Persuasive communication', 'Team collaboration'],
    growthZones: ['Patience for analysis', 'Systematic tracking', 'Slowing down for complex decisions', 'Individual focus']
  },
  strategist: {
    id: 'strategist',
    name: 'Strategist',
    description: 'The Analytical Planner - Detail-oriented, data-driven, systematic',
    colorTheme: {
      primary: 'oklch(0.50 0.12 230)',
      secondary: 'oklch(0.60 0.10 220)',
      accent: 'oklch(0.45 0.15 240)'
    },
    varkBias: {
      visual: 30,
      aural: 10,
      readWrite: 45,
      kinesthetic: 15
    },
    learningPreferences: {
      pace: 'steady',
      feedback: 'detailed',
      rewards: 'milestone',
      social: 'low'
    },
    strengths: ['Attention to detail', 'Systematic approach', 'Data-driven decisions', 'Long-term planning'],
    growthZones: ['Comfort with uncertainty', 'Social collaboration', 'Creative experimentation', 'Risk tolerance']
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    description: 'The Innovative Builder - Creative, big-picture, entrepreneurial',
    colorTheme: {
      primary: 'oklch(0.60 0.15 290)',
      secondary: 'oklch(0.70 0.12 280)',
      accent: 'oklch(0.55 0.18 300)'
    },
    varkBias: {
      visual: 40,
      aural: 15,
      readWrite: 15,
      kinesthetic: 30
    },
    learningPreferences: {
      pace: 'flexible',
      feedback: 'encouraging',
      rewards: 'breakthrough',
      social: 'moderate'
    },
    strengths: ['Creative problem-solving', 'Big-picture thinking', 'Innovation', 'Comfort with ambiguity'],
    growthZones: ['Operational details', 'Consistent execution', 'Valuing proven methods', 'Routine establishment']
  },
  guardian: {
    id: 'guardian',
    name: 'Guardian',
    description: 'The Steady Protector - Consistent, disciplined, risk-aware',
    colorTheme: {
      primary: 'oklch(0.55 0.12 145)',
      secondary: 'oklch(0.65 0.10 135)',
      accent: 'oklch(0.50 0.15 155)'
    },
    varkBias: {
      visual: 25,
      aural: 20,
      readWrite: 30,
      kinesthetic: 25
    },
    learningPreferences: {
      pace: 'moderate',
      feedback: 'encouraging',
      rewards: 'consistent',
      social: 'optional'
    },
    strengths: ['Consistency', 'Reliable execution', 'Risk management', 'Long-term perspective'],
    growthZones: ['Calculated risks', 'Adaptability', 'Creative thinking', 'Quick decision-making']
  }
};

export interface GameArchetypeAlignment {
  primaryArchetypes: ('navigator' | 'strategist' | 'creator' | 'guardian')[];
  secondaryArchetypes?: ('navigator' | 'strategist' | 'creator' | 'guardian')[];
  varkOptimization: {
    visual: number;
    aural: number;
    readWrite: number;
    kinesthetic: number;
  };
  learningStyle: 'competitive' | 'analytical' | 'creative' | 'foundational';
  socialAspect: 'required' | 'optional' | 'individual';
  complexity: 'simple' | 'moderate' | 'complex' | 'adaptive';
}

export interface EnhancedGameData {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'savings' | 'investing' | 'credit' | 'business' | 'planning' | 'risk';
  difficulty: 'elementary' | 'middle' | 'adult';
  duration: number; // in minutes
  archetypeAlignment: GameArchetypeAlignment;
  learningObjectives: string[];
  skills: string[];
  features: {
    hasMultiplayer?: boolean;
    hasAnalytics?: boolean;
    hasCreativeMode?: boolean;
    hasProgressTracking?: boolean;
    hasAdaptiveDifficulty?: boolean;
  };
  scenarios?: string[]; // Different scenarios or modes
}

export const ENHANCED_GAME_REGISTRY: EnhancedGameData[] = [
  // Existing Games with Enhanced Archetype Data
  {
    id: 'coin-catcher',
    title: 'Coin Catcher',
    description: 'Fast-paced arcade game for building quick saving reflexes',
    emoji: '🪙',
    category: 'savings',
    difficulty: 'elementary',
    duration: 3,
    archetypeAlignment: {
      primaryArchetypes: ['navigator', 'guardian'],
      secondaryArchetypes: ['creator'],
      varkOptimization: { visual: 40, aural: 20, readWrite: 10, kinesthetic: 30 },
      learningStyle: 'competitive',
      socialAspect: 'individual',
      complexity: 'simple'
    },
    learningObjectives: ['Quick decision making', 'Active saving habits', 'Distinguishing valuable vs wasteful spending'],
    skills: ['reflexes', 'pattern recognition', 'quick judgment'],
    features: {
      hasProgressTracking: true,
      hasAdaptiveDifficulty: true
    }
  },
  {
    id: 'credit-defender',
    title: 'Credit Defender',
    description: 'Strategic credit management through real-world scenarios',
    emoji: '💳',
    category: 'credit',
    difficulty: 'middle',
    duration: 5,
    archetypeAlignment: {
      primaryArchetypes: ['strategist', 'guardian'],
      secondaryArchetypes: ['navigator'],
      varkOptimization: { visual: 30, aural: 25, readWrite: 30, kinesthetic: 15 },
      learningStyle: 'analytical',
      socialAspect: 'individual',
      complexity: 'moderate'
    },
    learningObjectives: ['Credit score management', 'Payment strategy', 'Credit utilization', 'Financial decision making'],
    skills: ['planning', 'risk assessment', 'strategic thinking'],
    features: {
      hasProgressTracking: true,
      hasAnalytics: true
    }
  },
  {
    id: 'business-builder',
    title: 'Business Builder',
    description: 'Entrepreneurial simulation with investment decisions and risk management',
    emoji: '🏪',
    category: 'business',
    difficulty: 'adult',
    duration: 8,
    archetypeAlignment: {
      primaryArchetypes: ['creator', 'navigator'],
      secondaryArchetypes: ['strategist'],
      varkOptimization: { visual: 35, aural: 20, readWrite: 20, kinesthetic: 25 },
      learningStyle: 'creative',
      socialAspect: 'individual',
      complexity: 'complex'
    },
    learningObjectives: ['Business investment', 'Risk management', 'Strategic planning', 'Resource allocation'],
    skills: ['entrepreneurship', 'risk management', 'strategic planning'],
    features: {
      hasProgressTracking: true,
      hasAnalytics: true,
      hasAdaptiveDifficulty: true
    }
  },
  {
    id: 'budget-balancer',
    title: 'Budget Balancer',
    description: 'Interactive budget categorization and optimization',
    emoji: '📊',
    category: 'planning',
    difficulty: 'middle',
    duration: 6,
    archetypeAlignment: {
      primaryArchetypes: ['strategist', 'guardian'],
      secondaryArchetypes: ['creator'],
      varkOptimization: { visual: 35, aural: 15, readWrite: 35, kinesthetic: 15 },
      learningStyle: 'analytical',
      socialAspect: 'individual',
      complexity: 'moderate'
    },
    learningObjectives: ['Budget categorization', 'Expense tracking', 'Resource allocation', 'Financial planning'],
    skills: ['organization', 'categorization', 'planning'],
    features: {
      hasProgressTracking: true,
      hasAnalytics: true
    }
  },
  {
    id: 'investment-climber',
    title: 'Investment Climber',
    description: 'Portfolio management with diversification strategies',
    emoji: '📈',
    category: 'investing',
    difficulty: 'adult',
    duration: 7,
    archetypeAlignment: {
      primaryArchetypes: ['strategist', 'creator'],
      varkOptimization: { visual: 40, aural: 10, readWrite: 35, kinesthetic: 15 },
      learningStyle: 'analytical',
      socialAspect: 'individual',
      complexity: 'complex'
    },
    learningObjectives: ['Portfolio diversification', 'Risk assessment', 'Long-term planning', 'Market dynamics'],
    skills: ['analysis', 'long-term thinking', 'risk management'],
    features: {
      hasProgressTracking: true,
      hasAnalytics: true
    }
  },
  {
    id: 'lemonade-boss',
    title: 'Lemonade Boss',
    description: 'Business simulation with pricing strategy and supply management',
    emoji: '🍋',
    category: 'business',
    difficulty: 'middle',
    duration: 5,
    archetypeAlignment: {
      primaryArchetypes: ['creator', 'navigator'],
      secondaryArchetypes: ['guardian'],
      varkOptimization: { visual: 35, aural: 25, readWrite: 15, kinesthetic: 25 },
      learningStyle: 'creative',
      socialAspect: 'individual',
      complexity: 'moderate'
    },
    learningObjectives: ['Pricing strategy', 'Supply management', 'Profit optimization', 'Market dynamics'],
    skills: ['business acumen', 'quick thinking', 'adaptability'],
    features: {
      hasProgressTracking: true,
      hasAdaptiveDifficulty: true
    }
  },
  {
    id: 'collect-game-2d',
    title: 'Juice Collector',
    description: 'Quick collection game with progression and timing challenges',
    emoji: '🧃',
    category: 'savings',
    difficulty: 'elementary',
    duration: 2,
    archetypeAlignment: {
      primaryArchetypes: ['navigator', 'guardian'],
      varkOptimization: { visual: 45, aural: 20, readWrite: 10, kinesthetic: 25 },
      learningStyle: 'competitive',
      socialAspect: 'individual',
      complexity: 'simple'
    },
    learningObjectives: ['Quick collection', 'Time management', 'Pattern recognition', 'Goal setting'],
    skills: ['reflexes', 'timing', 'focus'],
    features: {
      hasProgressTracking: true
    }
  }
];

export function getRecommendedGames(
  userArchetype: string,
  userVark?: { visual: number; aural: number; readWrite: number; kinesthetic: number },
  difficulty?: 'elementary' | 'middle' | 'adult'
): EnhancedGameData[] {
  const archetype = ARCHETYPES[userArchetype];
  if (!archetype) return [];

  return ENHANCED_GAME_REGISTRY
    .filter(game => {
      // Filter by difficulty if specified
      if (difficulty && game.difficulty !== difficulty) return false;

      // Check if archetype matches
      const isPrimaryMatch = game.archetypeAlignment.primaryArchetypes.includes(userArchetype as any);
      const isSecondaryMatch = game.archetypeAlignment.secondaryArchetypes?.includes(userArchetype as any);

      return isPrimaryMatch || isSecondaryMatch;
    })
    .map(game => {
      // Calculate compatibility score
      let score = 0;

      // Primary archetype match gets higher score
      if (game.archetypeAlignment.primaryArchetypes.includes(userArchetype as any)) {
        score += 100;
      } else if (game.archetypeAlignment.secondaryArchetypes?.includes(userArchetype as any)) {
        score += 50;
      }

      // VARK compatibility bonus
      if (userVark) {
        const varkDiff = Math.abs(game.archetypeAlignment.varkOptimization.visual - userVark.visual) +
                        Math.abs(game.archetypeAlignment.varkOptimization.aural - userVark.aural) +
                        Math.abs(game.archetypeAlignment.varkOptimization.readWrite - userVark.readWrite) +
                        Math.abs(game.archetypeAlignment.varkOptimization.kinesthetic - userVark.kinesthetic);
        score += Math.max(0, 50 - varkDiff);
      }

      return { game, compatibilityScore: score };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .map(item => item.game);
}

export function getArchetypeColorTheme(archetypeId: string): ArchetypeProfile['colorTheme'] {
  return ARCHETYPES[archetypeId]?.colorTheme || ARCHETYPES.strategist.colorTheme;
}

export function getGrowthZoneGames(archetypeId: string): EnhancedGameData[] {
  const archetype = ARCHETYPES[archetypeId];
  if (!archetype) return [];

  // Find games that target this archetype's growth zones
  const growthZoneKeywords = archetype.growthZones.map(zone => zone.toLowerCase());

  return ENHANCED_GAME_REGISTRY.filter(game =>
    game.learningObjectives.some(objective =>
      growthZoneKeywords.some(keyword => objective.toLowerCase().includes(keyword))
    )
  );
}