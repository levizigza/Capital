/**
 * Game Data - Advanced scenarios, challenges, and content
 */

export interface GameScenario {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: 'life_simulation' | 'market_trading' | 'business_management' | 'crisis_management'
  estimatedTime: string
  prerequisites: string[]
  learningObjectives: string[]
  initialConditions: {
    cash: number
    income: number
    expenses: number
    assets: Array<{
      type: 'stocks' | 'bonds' | 'real_estate' | 'crypto' | 'business'
      name: string
      value: number
      risk: number
      returns: number
    }>
    liabilities: Array<{
      type: 'loan' | 'credit_card' | 'mortgage'
      name: string
      balance: number
      interestRate: number
      minimumPayment: number
    }>
  }
  events: GameEvent[]
  winConditions: WinCondition[]
  rewards: {
    xp: number
    coins: number
    achievements?: string[]
  }
}

export interface GameEvent {
  id: string
  trigger: 'time' | 'action' | 'condition' | 'random'
  triggerValue?: any
  probability?: number
  title: string
  description: string
  choices: Array<{
    text: string
    consequences: {
      cash?: number
      income?: number
      expenses?: number
      assets?: Array<{ type: string; change: number }>
      liabilities?: Array<{ type: string; change: number }>
      futureEvents?: string[]
    }
    learningNote: string
  }>
}

export interface WinCondition {
  type: 'net_worth' | 'cash_flow' | 'time_survival' | 'specific_goal'
  target: number
  description: string
}

export const advancedScenarios: GameScenario[] = [
  {
    id: 'young_professional',
    title: 'Young Professional Journey',
    description: 'Navigate your first job, apartment, and financial independence',
    difficulty: 'beginner',
    category: 'life_simulation',
    estimatedTime: '15-20 min',
    prerequisites: [],
    learningObjectives: [
      'Understanding salary vs take-home pay',
      'Managing first apartment costs',
      'Building credit history',
      'Starting retirement savings'
    ],
    initialConditions: {
      cash: 2000,
      income: 3500,
      expenses: 2800,
      assets: [],
      liabilities: [
        {
          type: 'credit_card',
          name: 'Student Credit Card',
          balance: 500,
          interestRate: 0.18,
          minimumPayment: 25
        }
      ]
    },
    events: [
      {
        id: 'first_paycheck',
        trigger: 'time',
        triggerValue: 30000, // 30 seconds
        title: 'First Paycheck Surprise',
        description: 'Your first paycheck is smaller than expected due to taxes, insurance, and 401k contributions.',
        choices: [
          {
            text: 'Reduce 401k contribution to increase take-home pay',
            consequences: { cash: 200, income: 150 },
            learningNote: 'Short-term gain but less retirement savings'
          },
          {
            text: 'Keep contributions and adjust budget',
            consequences: { expenses: -100 },
            learningNote: 'Better long-term strategy but requires discipline'
          }
        ]
      },
      {
        id: 'apartment_decision',
        trigger: 'time',
        triggerValue: 60000, // 1 minute
        title: 'Housing Decision',
        description: 'You need to choose between a nice apartment close to work or a cheaper place with a longer commute.',
        choices: [
          {
            text: 'Nice apartment ($1800/month, 10 min commute)',
            consequences: { expenses: 200 },
            learningNote: 'Higher housing costs but saves time and transportation'
          },
          {
            text: 'Budget apartment ($1200/month, 45 min commute)',
            consequences: { expenses: -400, cash: -150 },
            learningNote: 'Lower rent but higher transportation and time costs'
          }
        ]
      }
    ],
    winConditions: [
      {
        type: 'net_worth',
        target: 5000,
        description: 'Build a positive net worth of $5,000'
      },
      {
        type: 'cash_flow',
        target: 500,
        description: 'Maintain positive cash flow of $500/month'
      }
    ],
    rewards: {
      xp: 200,
      coins: 50,
      achievements: ['young_professional_complete']
    }
  },
  {
    id: 'stock_market_crash',
    title: 'Market Crash Survival',
    description: 'Navigate a major market crash while protecting your portfolio',
    difficulty: 'advanced',
    category: 'crisis_management',
    estimatedTime: '20-25 min',
    prerequisites: ['investment_basics'],
    learningObjectives: [
      'Understanding market volatility',
      'Risk management strategies',
      'Emotional discipline during crashes',
      'Opportunity recognition in downturns'
    ],
    initialConditions: {
      cash: 10000,
      income: 5000,
      expenses: 3500,
      assets: [
        {
          type: 'stocks',
          name: 'Diversified Portfolio',
          value: 50000,
          risk: 0.15,
          returns: 0.08
        },
        {
          type: 'bonds',
          name: 'Government Bonds',
          value: 20000,
          risk: 0.03,
          returns: 0.04
        }
      ],
      liabilities: [
        {
          type: 'mortgage',
          name: 'Home Mortgage',
          balance: 200000,
          interestRate: 0.035,
          minimumPayment: 1200
        }
      ]
    },
    events: [
      {
        id: 'market_crash_begins',
        trigger: 'time',
        triggerValue: 10000,
        title: 'Market Crash!',
        description: 'The stock market has dropped 25% in one week. Panic selling is everywhere.',
        choices: [
          {
            text: 'Sell everything to preserve capital',
            consequences: {
              assets: [{ type: 'stocks', change: -0.3 }],
              cash: 35000
            },
            learningNote: 'Locks in losses but provides cash safety'
          },
          {
            text: 'Hold steady and wait it out',
            consequences: {},
            learningNote: 'Requires emotional discipline but historically sound'
          },
          {
            text: 'Buy more while prices are low',
            consequences: {
              cash: -8000,
              assets: [{ type: 'stocks', change: 8000 }]
            },
            learningNote: 'Contrarian strategy that can pay off long-term'
          }
        ]
      }
    ],
    winConditions: [
      {
        type: 'net_worth',
        target: 100000,
        description: 'Maintain net worth above $100,000 after the crash'
      }
    ],
    rewards: {
      xp: 500,
      coins: 150,
      achievements: ['crisis_survivor']
    }
  },
  {
    id: 'startup_entrepreneur',
    title: 'Startup Entrepreneur',
    description: 'Launch and grow your own business from idea to profitability',
    difficulty: 'expert',
    category: 'business_management',
    estimatedTime: '25-30 min',
    prerequisites: ['entrepreneurship', 'investment_basics'],
    learningObjectives: [
      'Business planning and cash flow',
      'Investment and funding decisions',
      'Risk vs reward in entrepreneurship',
      'Scaling business operations'
    ],
    initialConditions: {
      cash: 50000,
      income: 0,
      expenses: 4000,
      assets: [
        {
          type: 'business',
          name: 'Tech Startup',
          value: 10000,
          risk: 0.4,
          returns: 0
        }
      ],
      liabilities: []
    },
    events: [
      {
        id: 'funding_opportunity',
        trigger: 'time',
        triggerValue: 45000,
        title: 'Venture Capital Offer',
        description: 'A VC firm offers $500k for 30% of your company. Your business is valued at $1.67M.',
        choices: [
          {
            text: 'Accept the investment',
            consequences: {
              cash: 500000,
              assets: [{ type: 'business', change: -0.3 }]
            },
            learningNote: 'Gives runway to grow but dilutes ownership'
          },
          {
            text: 'Negotiate for better terms',
            consequences: {
              cash: 400000,
              assets: [{ type: 'business', change: -0.25 }]
            },
            learningNote: 'Less money but better equity retention'
          },
          {
            text: 'Decline and bootstrap',
            consequences: {},
            learningNote: 'Maintains control but limits growth potential'
          }
        ]
      }
    ],
    winConditions: [
      {
        type: 'specific_goal',
        target: 1000000,
        description: 'Build a business worth $1M or achieve $100k annual profit'
      }
    ],
    rewards: {
      xp: 1000,
      coins: 300,
      achievements: ['entrepreneur_master']
    }
  }
]

export const dailyChallenges = [
  {
    id: 'budget_challenge',
    name: 'Budget Master',
    description: 'Live on $50 for the day while meeting all obligations',
    difficulty: 'intermediate',
    timeLimit: 300000, // 5 minutes
    rules: [
      'Start with $50',
      'Must pay for meals, transportation, and unexpected expenses',
      'End with positive balance'
    ],
    rewards: { xp: 100, coins: 25 }
  },
  {
    id: 'investment_timing',
    name: 'Market Timer',
    description: 'Make profitable trades in a volatile market',
    difficulty: 'advanced',
    timeLimit: 600000, // 10 minutes
    rules: [
      'Start with $1000 to invest',
      'Market prices change every 30 seconds',
      'Achieve 10% return'
    ],
    rewards: { xp: 200, coins: 50 }
  }
]

export const multiplayerChallenges = [
  {
    id: 'family_budget',
    name: 'Family Financial Planning',
    description: 'Work together to manage a family budget for one year',
    players: '2-4',
    difficulty: 'intermediate',
    duration: '15-20 min',
    roles: ['Primary Earner', 'Secondary Earner', 'Budget Manager', 'Investment Advisor'],
    objective: 'Maximize family savings while meeting all needs and wants'
  },
  {
    id: 'business_partners',
    name: 'Business Partnership',
    description: 'Co-found and grow a business together',
    players: '2-3',
    difficulty: 'expert',
    duration: '20-30 min',
    roles: ['CEO', 'CFO', 'COO'],
    objective: 'Build a profitable business with fair equity distribution'
  }
]