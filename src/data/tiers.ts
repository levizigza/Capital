export interface Quest {
  id: string
  name: string
  description: string
  financialKPI: {
    description: string
    type: 'expense-tracking' | 'budget-creation' | 'savings-goal' | 'investment' | 'debt-payment' | 'income-tracking' | 'net-worth' | 'community-action'
    target: number
    current: number
  }
  softSkillKPI: {
    description: string
    type: 'teaching' | 'sharing' | 'reflection' | 'planning' | 'research' | 'community' | 'mentoring' | 'advocacy'
    completed: boolean
  }
  financeXP: number
  lineXPReward: number
  completed: boolean
}

export interface Tier {
  id: number
  name: string
  theme: string
  color: string
  gradient: string
  description: string
  focus: string
  quests: Quest[]
  unlocked: boolean
  completed: boolean
}

export const SKILL_LINES = {
  cognition: {
    name: 'Cognition',
    description: 'Analytical thinking and financial problem-solving',
    color: 'oklch(0.55 0.20 250)',
    icon: '🧠'
  },
  values: {
    name: 'Values',
    description: 'Understanding financial priorities and trade-offs',
    color: 'oklch(0.65 0.20 30)',
    icon: '⚖️'
  },
  morals: {
    name: 'Morals',
    description: 'Ethical money decisions and social impact',
    color: 'oklch(0.55 0.18 145)',
    icon: '💚'
  },
  faith: {
    name: 'Faith',
    description: 'Long-term vision and financial wisdom',
    color: 'oklch(0.60 0.20 280)',
    icon: '✨'
  }
} as const

export type SkillLine = keyof typeof SKILL_LINES

export const TIER_DATA: Omit<Tier, 'unlocked' | 'completed'>[] = [
  {
    id: 1,
    name: 'Survive',
    theme: 'Basic Needs',
    color: 'oklch(0.58 0.20 25)',
    gradient: 'from-red-600 to-rose-700',
    description: 'Master the fundamentals of meeting basic financial needs',
    focus: 'Basic needs budgeting and expense awareness',
    quests: [
      {
        id: 'survive-1',
        name: 'Track Your Daily Expenses',
        description: 'Record every expense for 7 consecutive days',
        financialKPI: {
          description: 'Log expenses for 7 days',
          type: 'expense-tracking',
          target: 7,
          current: 0
        },
        softSkillKPI: {
          description: 'Write a reflection on your spending patterns',
          type: 'reflection',
          completed: false
        },
        financeXP: 100,
        lineXPReward: 50,
        completed: false
      },
      {
        id: 'survive-2',
        name: 'Create Your First Budget',
        description: 'Build a basic monthly budget covering essential expenses',
        financialKPI: {
          description: 'Create a budget with at least 5 categories',
          type: 'budget-creation',
          target: 5,
          current: 0
        },
        softSkillKPI: {
          description: 'Share your budgeting approach with a friend or family member',
          type: 'sharing',
          completed: false
        },
        financeXP: 150,
        lineXPReward: 75,
        completed: false
      },
      {
        id: 'survive-3',
        name: 'Identify Fixed vs Variable Costs',
        description: 'Categorize your expenses into fixed and variable costs',
        financialKPI: {
          description: 'Categorize at least 15 expenses',
          type: 'expense-tracking',
          target: 15,
          current: 0
        },
        softSkillKPI: {
          description: 'Explain the difference to someone who doesn\'t know',
          type: 'teaching',
          completed: false
        },
        financeXP: 120,
        lineXPReward: 60,
        completed: false
      }
    ]
  },
  {
    id: 2,
    name: 'Connect',
    theme: 'Shared Finances',
    color: 'oklch(0.55 0.20 290)',
    gradient: 'from-purple-600 to-violet-700',
    description: 'Learn to manage finances with others and build family budgets',
    focus: 'Shared finances and family budgeting',
    quests: [
      {
        id: 'connect-1',
        name: 'Family Budget Summit',
        description: 'Create a shared budget with family members or roommates',
        financialKPI: {
          description: 'Create a shared budget tracking at least 3 shared expenses',
          type: 'budget-creation',
          target: 3,
          current: 0
        },
        softSkillKPI: {
          description: 'Hold a budget discussion with your household members',
          type: 'community',
          completed: false
        },
        financeXP: 200,
        lineXPReward: 100,
        completed: false
      },
      {
        id: 'connect-2',
        name: 'Help a Friend Budget',
        description: 'Assist someone else in creating their first budget',
        financialKPI: {
          description: 'Review and provide feedback on someone\'s budget',
          type: 'budget-creation',
          target: 1,
          current: 0
        },
        softSkillKPI: {
          description: 'Mentor someone through their budgeting journey',
          type: 'mentoring',
          completed: false
        },
        financeXP: 180,
        lineXPReward: 90,
        completed: false
      },
      {
        id: 'connect-3',
        name: 'Split Expenses Fairly',
        description: 'Create a system for fairly splitting shared costs',
        financialKPI: {
          description: 'Track and split at least 10 shared expenses',
          type: 'expense-tracking',
          target: 10,
          current: 0
        },
        softSkillKPI: {
          description: 'Facilitate a conversation about fair expense sharing',
          type: 'community',
          completed: false
        },
        financeXP: 160,
        lineXPReward: 80,
        completed: false
      },
      {
        id: 'connect-4',
        name: 'Financial Communication',
        description: 'Practice healthy money conversations with loved ones',
        financialKPI: {
          description: 'Document 5 financial discussions',
          type: 'expense-tracking',
          target: 5,
          current: 0
        },
        softSkillKPI: {
          description: 'Write about what you learned from these conversations',
          type: 'reflection',
          completed: false
        },
        financeXP: 140,
        lineXPReward: 70,
        completed: false
      }
    ]
  },
  {
    id: 3,
    name: 'Control',
    theme: 'Self-Discipline',
    color: 'oklch(0.45 0.18 240)',
    gradient: 'from-blue-600 to-indigo-700',
    description: 'Build emergency funds and develop financial self-discipline',
    focus: 'Self-discipline and emergency funds',
    quests: [
      {
        id: 'control-1',
        name: 'Start Emergency Fund',
        description: 'Save your first $500 for emergencies',
        financialKPI: {
          description: 'Save $500 in emergency fund',
          type: 'savings-goal',
          target: 500,
          current: 0
        },
        softSkillKPI: {
          description: 'Write about why emergency funds matter to you',
          type: 'reflection',
          completed: false
        },
        financeXP: 250,
        lineXPReward: 125,
        completed: false
      },
      {
        id: 'control-2',
        name: 'No-Spend Challenge',
        description: 'Complete a 7-day no discretionary spending challenge',
        financialKPI: {
          description: 'Track 7 days with zero discretionary spending',
          type: 'expense-tracking',
          target: 7,
          current: 0
        },
        softSkillKPI: {
          description: 'Reflect on your relationship with spending',
          type: 'reflection',
          completed: false
        },
        financeXP: 220,
        lineXPReward: 110,
        completed: false
      },
      {
        id: 'control-3',
        name: 'Automate Savings',
        description: 'Set up automatic transfers to savings',
        financialKPI: {
          description: 'Complete 4 automatic savings transfers',
          type: 'savings-goal',
          target: 4,
          current: 0
        },
        softSkillKPI: {
          description: 'Share your automation strategy with others',
          type: 'teaching',
          completed: false
        },
        financeXP: 200,
        lineXPReward: 100,
        completed: false
      },
      {
        id: 'control-4',
        name: 'Track Net Worth',
        description: 'Calculate and track your net worth monthly',
        financialKPI: {
          description: 'Record net worth for 3 consecutive months',
          type: 'net-worth',
          target: 3,
          current: 0
        },
        softSkillKPI: {
          description: 'Analyze your net worth trends and set goals',
          type: 'planning',
          completed: false
        },
        financeXP: 240,
        lineXPReward: 120,
        completed: false
      }
    ]
  },
  {
    id: 4,
    name: 'Achieve',
    theme: 'Goal-Setting',
    color: 'oklch(0.68 0.18 45)',
    gradient: 'from-orange-600 to-amber-600',
    description: 'Set financial goals and start your investment journey',
    focus: 'Goal-setting and investments',
    quests: [
      {
        id: 'achieve-1',
        name: 'Define Financial Goals',
        description: 'Create 3 SMART financial goals (short, medium, long-term)',
        financialKPI: {
          description: 'Document 3 specific financial goals with timelines',
          type: 'budget-creation',
          target: 3,
          current: 0
        },
        softSkillKPI: {
          description: 'Share your goals with an accountability partner',
          type: 'sharing',
          completed: false
        },
        financeXP: 280,
        lineXPReward: 140,
        completed: false
      },
      {
        id: 'achieve-2',
        name: 'First Investment',
        description: 'Make your first investment (stocks, funds, or retirement)',
        financialKPI: {
          description: 'Invest at least $100',
          type: 'investment',
          target: 100,
          current: 0
        },
        softSkillKPI: {
          description: 'Research and document why you chose this investment',
          type: 'research',
          completed: false
        },
        financeXP: 300,
        lineXPReward: 150,
        completed: false
      },
      {
        id: 'achieve-3',
        name: 'Increase Income Stream',
        description: 'Create or identify a new source of income',
        financialKPI: {
          description: 'Earn $100 from a new income source',
          type: 'income-tracking',
          target: 100,
          current: 0
        },
        softSkillKPI: {
          description: 'Share your side income journey with others',
          type: 'teaching',
          completed: false
        },
        financeXP: 320,
        lineXPReward: 160,
        completed: false
      },
      {
        id: 'achieve-4',
        name: 'Quarterly Review',
        description: 'Complete a comprehensive financial review',
        financialKPI: {
          description: 'Review 3 months of financial data',
          type: 'net-worth',
          target: 3,
          current: 0
        },
        softSkillKPI: {
          description: 'Write insights and adjust your strategy',
          type: 'reflection',
          completed: false
        },
        financeXP: 260,
        lineXPReward: 130,
        completed: false
      }
    ]
  },
  {
    id: 5,
    name: 'Belong',
    theme: 'Community',
    color: 'oklch(0.55 0.18 145)',
    gradient: 'from-green-600 to-emerald-700',
    description: 'Contribute to community financial wellness and support others',
    focus: 'Community financial wellness',
    quests: [
      {
        id: 'belong-1',
        name: 'Teach Financial Literacy',
        description: 'Host a workshop or teach a financial concept to others',
        financialKPI: {
          description: 'Teach at least 3 people a financial concept',
          type: 'community-action',
          target: 3,
          current: 0
        },
        softSkillKPI: {
          description: 'Lead a financial literacy session',
          type: 'teaching',
          completed: false
        },
        financeXP: 350,
        lineXPReward: 175,
        completed: false
      },
      {
        id: 'belong-2',
        name: 'Support Local Business',
        description: 'Consciously support local economy with mindful spending',
        financialKPI: {
          description: 'Make 10 purchases from local businesses',
          type: 'expense-tracking',
          target: 10,
          current: 0
        },
        softSkillKPI: {
          description: 'Reflect on the impact of local economic support',
          type: 'reflection',
          completed: false
        },
        financeXP: 300,
        lineXPReward: 150,
        completed: false
      },
      {
        id: 'belong-3',
        name: 'Community Investment',
        description: 'Invest in community projects or social impact investments',
        financialKPI: {
          description: 'Invest $200 in community-focused assets',
          type: 'investment',
          target: 200,
          current: 0
        },
        softSkillKPI: {
          description: 'Research and advocate for community investment',
          type: 'advocacy',
          completed: false
        },
        financeXP: 380,
        lineXPReward: 190,
        completed: false
      },
      {
        id: 'belong-4',
        name: 'Financial Peer Group',
        description: 'Form or join a financial accountability group',
        financialKPI: {
          description: 'Participate in 4 group financial discussions',
          type: 'community-action',
          target: 4,
          current: 0
        },
        softSkillKPI: {
          description: 'Build a supportive financial community',
          type: 'community',
          completed: false
        },
        financeXP: 320,
        lineXPReward: 160,
        completed: false
      },
      {
        id: 'belong-5',
        name: 'Charitable Giving Plan',
        description: 'Create a structured approach to charitable giving',
        financialKPI: {
          description: 'Donate $100 to causes you care about',
          type: 'expense-tracking',
          target: 100,
          current: 0
        },
        softSkillKPI: {
          description: 'Reflect on the values driving your giving',
          type: 'reflection',
          completed: false
        },
        financeXP: 340,
        lineXPReward: 170,
        completed: false
      }
    ]
  },
  {
    id: 6,
    name: 'Understand',
    theme: 'Complex Systems',
    color: 'oklch(0.75 0.18 85)',
    gradient: 'from-yellow-500 to-amber-500',
    description: 'Master complex financial systems and advanced concepts',
    focus: 'Complex financial systems',
    quests: [
      {
        id: 'understand-1',
        name: 'Tax Strategy Mastery',
        description: 'Optimize your tax situation and understand tax-advantaged accounts',
        financialKPI: {
          description: 'Maximize contributions to 2 tax-advantaged accounts',
          type: 'investment',
          target: 2,
          current: 0
        },
        softSkillKPI: {
          description: 'Research and document your tax optimization strategy',
          type: 'research',
          completed: false
        },
        financeXP: 420,
        lineXPReward: 210,
        completed: false
      },
      {
        id: 'understand-2',
        name: 'Portfolio Rebalancing',
        description: 'Learn and execute portfolio rebalancing strategy',
        financialKPI: {
          description: 'Rebalance portfolio quarterly for 2 quarters',
          type: 'investment',
          target: 2,
          current: 0
        },
        softSkillKPI: {
          description: 'Explain your rebalancing philosophy',
          type: 'teaching',
          completed: false
        },
        financeXP: 450,
        lineXPReward: 225,
        completed: false
      },
      {
        id: 'understand-3',
        name: 'Economic Indicator Tracking',
        description: 'Track key economic indicators and understand their impact',
        financialKPI: {
          description: 'Track 5 economic indicators for 6 months',
          type: 'expense-tracking',
          target: 30,
          current: 0
        },
        softSkillKPI: {
          description: 'Analyze how indicators affect your finances',
          type: 'research',
          completed: false
        },
        financeXP: 400,
        lineXPReward: 200,
        completed: false
      },
      {
        id: 'understand-4',
        name: 'Estate Planning Basics',
        description: 'Create basic estate planning documents',
        financialKPI: {
          description: 'Complete will, beneficiaries, and power of attorney',
          type: 'budget-creation',
          target: 3,
          current: 0
        },
        softSkillKPI: {
          description: 'Have estate planning conversations with family',
          type: 'community',
          completed: false
        },
        financeXP: 480,
        lineXPReward: 240,
        completed: false
      }
    ]
  },
  {
    id: 7,
    name: 'Harmonize',
    theme: 'Integration',
    color: 'oklch(0.60 0.18 190)',
    gradient: 'from-teal-600 to-cyan-600',
    description: 'Integrate all aspects of money management into a cohesive system',
    focus: 'Integrated money management',
    quests: [
      {
        id: 'harmonize-1',
        name: 'Holistic Financial Dashboard',
        description: 'Create a comprehensive view of all your finances',
        financialKPI: {
          description: 'Track 10+ financial metrics in one system',
          type: 'net-worth',
          target: 10,
          current: 0
        },
        softSkillKPI: {
          description: 'Share your integrated financial system with others',
          type: 'teaching',
          completed: false
        },
        financeXP: 520,
        lineXPReward: 260,
        completed: false
      },
      {
        id: 'harmonize-2',
        name: 'Life-Goals Alignment',
        description: 'Align financial plans with life purpose and values',
        financialKPI: {
          description: 'Document 5 life goals with financial plans',
          type: 'budget-creation',
          target: 5,
          current: 0
        },
        softSkillKPI: {
          description: 'Reflect deeply on purpose-driven finances',
          type: 'reflection',
          completed: false
        },
        financeXP: 550,
        lineXPReward: 275,
        completed: false
      },
      {
        id: 'harmonize-3',
        name: 'Multi-Generational Planning',
        description: 'Create financial plans that benefit multiple generations',
        financialKPI: {
          description: 'Set up 529 plan, trust, or multi-generational investment',
          type: 'investment',
          target: 1,
          current: 0
        },
        softSkillKPI: {
          description: 'Facilitate multi-generational money conversations',
          type: 'community',
          completed: false
        },
        financeXP: 580,
        lineXPReward: 290,
        completed: false
      },
      {
        id: 'harmonize-4',
        name: 'Financial Advisor Relationship',
        description: 'Work with a professional to optimize your strategy',
        financialKPI: {
          description: 'Complete comprehensive financial plan review',
          type: 'budget-creation',
          target: 1,
          current: 0
        },
        softSkillKPI: {
          description: 'Synthesize professional advice with personal values',
          type: 'research',
          completed: false
        },
        financeXP: 500,
        lineXPReward: 250,
        completed: false
      }
    ]
  },
  {
    id: 8,
    name: 'Sanctify',
    theme: 'Wisdom Mastery',
    color: 'oklch(0.65 0.20 200)',
    gradient: 'from-cyan-500 to-teal-500',
    description: 'Achieve financial wisdom and mentor the next generation',
    focus: 'Financial wisdom mastery',
    quests: [
      {
        id: 'sanctify-1',
        name: 'Mentor Program',
        description: 'Mentor 3 people through their financial journey',
        financialKPI: {
          description: 'Help 3 people improve their financial situation',
          type: 'community-action',
          target: 3,
          current: 0
        },
        softSkillKPI: {
          description: 'Develop and share your mentoring philosophy',
          type: 'mentoring',
          completed: false
        },
        financeXP: 650,
        lineXPReward: 325,
        completed: false
      },
      {
        id: 'sanctify-2',
        name: 'Financial Philosophy',
        description: 'Write and share your comprehensive financial philosophy',
        financialKPI: {
          description: 'Document your complete financial worldview',
          type: 'budget-creation',
          target: 1,
          current: 0
        },
        softSkillKPI: {
          description: 'Publish or present your financial philosophy',
          type: 'advocacy',
          completed: false
        },
        financeXP: 700,
        lineXPReward: 350,
        completed: false
      },
      {
        id: 'sanctify-3',
        name: 'Legacy Creation',
        description: 'Build systems that create lasting financial impact',
        financialKPI: {
          description: 'Create endowment, trust, or lasting financial structure',
          type: 'investment',
          target: 1,
          current: 0
        },
        softSkillKPI: {
          description: 'Articulate the values driving your legacy',
          type: 'reflection',
          completed: false
        },
        financeXP: 750,
        lineXPReward: 375,
        completed: false
      },
      {
        id: 'sanctify-4',
        name: 'Community Financial Leader',
        description: 'Lead systemic change in community financial wellness',
        financialKPI: {
          description: 'Impact 20+ people through financial education',
          type: 'community-action',
          target: 20,
          current: 0
        },
        softSkillKPI: {
          description: 'Lead a community financial wellness initiative',
          type: 'advocacy',
          completed: false
        },
        financeXP: 800,
        lineXPReward: 400,
        completed: false
      },
      {
        id: 'sanctify-5',
        name: 'Wisdom Integration',
        description: 'Demonstrate mastery across all financial domains',
        financialKPI: {
          description: 'Maintain financial health for 12 consecutive months',
          type: 'net-worth',
          target: 12,
          current: 0
        },
        softSkillKPI: {
          description: 'Reflect on your complete financial transformation journey',
          type: 'reflection',
          completed: false
        },
        financeXP: 1000,
        lineXPReward: 500,
        completed: false
      }
    ]
  }
]
