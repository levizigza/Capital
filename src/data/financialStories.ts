import { AgeTier } from './ageTierSystem'

export interface FinancialStory {
  id: string
  title: string
  ageTier: AgeTier
  summary: string
  moral: string
  keyConcepts: string[]
  characters: StoryCharacter[]
  chapters: StoryChapter[]
  visualTheme: {
    background: string
    characterStyle: string
    environment: string
  }
  interactiveElements: InteractiveElement[]
  relatedGames: string[]
  estimatedReadingTime: number // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface StoryCharacter {
  name: string
  role: string
  personality: string
  visualDescription: string
  age: number
  avatar: string
  catchphrase: string
}

export interface StoryChapter {
  id: string
  title: string
  content: string
  illustration: string
  moral: string
  interactiveMoment?: {
    type: 'choice' | 'calculation' | 'reflection' | 'prediction'
    question: string
    options?: string[]
    correctAnswer?: string | number
    explanation: string
  }
  financialConcept: string
  realWorldConnection: string
}

export interface InteractiveElement {
  type: 'calculator' | 'simulation' | 'choice' | 'reflection' | 'game'
  title: string
  description: string
  data: any
}

// Elementary School Stories (Ages 6-11)
export const ELEMENTARY_STORIES: FinancialStory[] = [
  {
    id: 'penny-piggy-adventure',
    title: 'Penny the Piggy\'s Great Adventure',
    ageTier: 'elementary',
    summary: 'Follow Penny, a curious pink piggy bank, as she learns the power of saving and helping friends reach their dreams.',
    moral: 'Saving a little bit every day can make big dreams come true.',
    keyConcepts: ['Saving', 'Goal setting', 'Patience', 'Helping others'],
    characters: [
      {
        name: 'Penny',
        role: 'Hero',
        personality: 'Curious, generous, patient',
        visualDescription: 'Sparkling pink piggy bank with big blue eyes and a golden coin slot',
        age: 8,
        avatar: '🐷',
        catchphrase: 'Every coin tells a story!'
      },
      {
        name: 'Sunny',
        role: 'Best friend',
        personality: 'Energetic, impulsive, creative',
        visualDescription: 'Golden squirrel with a fluffy tail and acorn backpack',
        age: 7,
        avatar: '🐿️',
        catchphrase: 'Let\'s go on an adventure!'
      },
      {
        name: 'Wise Old Owl',
        role: 'Mentor',
        personality: 'Calm, wise, encouraging',
        visualDescription: 'Large brown owl with round glasses and a branch perch',
        age: 100,
        avatar: '🦉',
        catchphrase: 'The best time to plant a tree was yesterday. The second best time is now.'
      }
    ],
    chapters: [
      {
        id: 'chapter-1',
        title: 'The Empty Feeling',
        content: 'Penny the piggy bank felt sad. She was beautiful and shiny, but her tummy was empty. "Why am I here if I don\'t hold any coins?" she wondered.',
        illustration: 'A sad pink piggy bank sitting alone on a shelf',
        moral: 'Everyone needs a purpose to feel happy.',
        interactiveMoment: {
          type: 'reflection',
          question: 'What makes you feel happy when you help others?',
          explanation: 'Helping others gives us purpose and makes both people feel good!'
        },
        financialConcept: 'Purpose of saving',
        realWorldConnection: 'Why we save money in banks instead of keeping it all at home'
      },
      {
        id: 'chapter-2',
        title: 'Sunny\'s Big Dream',
        content: 'Sunny the squirrel zoomed into Penny\'s room, waving a leaf wildly. "Penny! I found the biggest, juiciest acorn garden in the forest, but it\'s too far away! I need a scooter to get there!"',
        illustration: 'Excited squirrel showing a map to a distant garden',
        moral: 'Having clear goals helps us make better choices.',
        interactiveMoment: {
          type: 'choice',
          question: 'What should Sunny do to get a scooter?',
          options: ['Borrow one', 'Save up coins', 'Find a closer garden', 'Ask parents'],
          correctAnswer: 'Save up coins',
          explanation: 'Saving helps us buy things we need without borrowing or depending on others!'
        },
        financialConcept: 'Goal setting',
        realWorldConnection: 'Setting savings goals for things we want to buy'
      },
      {
        id: 'chapter-3',
        title: 'The First Coin',
        content: 'The next morning, a little girl named Lily found a shiny quarter on the sidewalk. "This can go in my piggy bank!" she said, dropping it into Penny with a happy *clink*. Penny felt a warm feeling inside.',
        illustration: 'Girl dropping a coin into piggy bank with sparkles',
        moral: 'Every small step counts toward big goals.',
        interactiveMoment: {
          type: 'calculation',
          question: 'If a scooter costs 100 coins and Sunny has 1 coin, how many more coins does he need?',
          correctAnswer: 99,
          explanation: 'Sunny needs 99 more coins to reach his goal of 100 coins!'
        },
        financialConcept: 'Saving progress',
        realWorldConnection: 'How to track progress toward savings goals'
      },
      {
        id: 'chapter-4',
        title: 'The Savings Team',
        content: 'Word spread about the scooter fund. Friends started helping! Rabbit brought carrots to sell, Bear made honey cookies, and Robin offered worm delivery services. Everyone worked together!',
        illustration: 'Animal friends working together at a market stall',
        moral: 'Teamwork makes big goals easier to achieve.',
        interactiveMoment: {
          type: 'prediction',
          question: 'If 5 friends each save 10 coins every week, how many weeks to reach 100 coins?',
          correctAnswer: 2,
          explanation: 'With teamwork, they reach the goal in just 2 weeks instead of 20!'
        },
        financialConcept: 'Team saving',
        realWorldConnection: 'Family savings goals and working together'
      },
      {
        id: 'chapter-5',
        title: 'Dream Come True',
        content: 'Finally! The scooter jingled with 100 coins. Sunny zoomed around on it, visiting the acorn garden every day. But he always came back to share acorns with Penny, who was now full and happy.',
        illustration: 'Happy squirrel on scooter with baskets full of acorns',
        moral: 'Achieving goals is sweeter when we share our success.',
        interactiveMoment: {
          type: 'reflection',
          question: 'How would you celebrate reaching a big goal?',
          explanation: 'Celebrating achievements helps us stay motivated for future goals!'
        },
        financialConcept: 'Achieving goals',
        realWorldConnection: 'Using saved money wisely and celebrating success'
      }
    ],
    visualTheme: {
      background: 'Enchanted forest with magical colors',
      characterStyle: 'Cute cartoon animals with big expressive eyes',
      environment: 'Cozy woodland homes and magical markets'
    },
    interactiveElements: [
      {
        type: 'calculator',
        title: 'Savings Calculator',
        description: 'See how long it takes to reach your savings goal',
        data: { goalAmount: 100, weeklySaving: 5 }
      }
    ],
    relatedGames: ['CollectGame2D', 'CoinCatcherGame'],
    estimatedReadingTime: 15,
    difficulty: 'beginner'
  },

  {
    id: 'crystal-spending-cave',
    title: 'The Crystal Spending Cave',
    ageTier: 'elementary',
    summary: 'Maya and Leo discover a magical cave where crystals teach them the difference between needs and wants, and how to make smart choices with limited resources.',
    moral: 'Being smart with your choices helps you get more of what you really need.',
    keyConcepts: ['Needs vs wants', 'Budgeting', 'Making choices', 'Opportunity cost'],
    characters: [
      {
        name: 'Maya',
        role: 'Thoughtful planner',
        personality: 'Careful, smart, kind',
        visualDescription: 'Girl with glasses and a notebook, wearing a green backpack',
        age: 9,
        avatar: '👧',
        catchphrase: 'Let\'s think about this first!'
      },
      {
        name: 'Leo',
        role: 'Excitable explorer',
        personality: 'Energetic, curious, sometimes impulsive',
        visualDescription: 'Boy with a red cape and explorer boots, always carrying a magnifying glass',
        age: 8,
        avatar: '👦',
        catchphrase: 'Adventure awaits!'
      },
      {
        name: 'Crystal Guardian',
        role: 'Guide',
        personality: 'Ancient, wise, mysterious',
        visualDescription: 'Floating crystal that changes colors and speaks in riddles',
        age: 1000,
        avatar: '💎',
        catchphrase: 'The clearest path is not always the most obvious.'
      }
    ],
    chapters: [
      {
        id: 'chapter-1',
        title: 'The Hidden Cave',
        content: 'Maya and Leo were exploring when they found a cave entrance covered in glowing crystals. "Wow!" shouted Leo. "Treasure!" But Maya noticed something strange – the crystals glowed different colors.',
        illustration: 'Two kids discovering a cave with colorful crystal formations',
        moral: 'Sometimes the most valuable discoveries need careful observation.',
        interactiveMoment: {
          type: 'reflection',
          question: 'What would you do if you found a mysterious cave?',
          explanation: 'Being curious but careful helps us discover amazing things safely!'
        },
        financialConcept: 'Discovery and exploration',
        realWorldConnection: 'Being curious about money and finance'
      },
      {
        id: 'chapter-2',
        title: 'Red Crystals: Wants',
        content: 'Inside, red crystals showed amazing things: video games, toys, candy mountains! Leo reached for everything. "Wait," said Maya, pointing to a sign. "Red shows what we want, not what we need."',
        illustration: 'Crystal showing images of toys and games',
        moral: 'Wants are exciting, but they\'re not always what we need most.',
        interactiveMoment: {
          type: 'choice',
          question: 'Which of these is a want?',
          options: ['Food', 'Water', 'New video game', 'Medicine'],
          correctAnswer: 'New video game',
          explanation: 'Video games are fun, but we don\'t need them to live healthy lives!'
        },
        financialConcept: 'Understanding wants',
        realWorldConnection: 'Recognizing wants in everyday life'
      },
      {
        id: 'chapter-3',
        title: 'Blue Crystals: Needs',
        content: 'Blue crystals showed different things: warm clothes, healthy food, books for learning, a safe home. "These are what help us grow strong and smart," said the Crystal Guardian.',
        illustration: 'Crystal showing essential items like food, books, and shelter',
        moral: 'Needs are the things that help us be healthy and grow.',
        interactiveMoment: {
          type: 'choice',
          question: 'Which of these is a need?',
          options: ['Ice cream', 'New bicycle', 'Breakfast', 'TV time'],
          correctAnswer: 'Breakfast',
          explanation: 'Food gives us energy to learn and play – that\'s why it\'s a need!'
        },
        financialConcept: 'Understanding needs',
        realWorldConnection: 'Identifying basic needs in daily life'
      },
      {
        id: 'chapter-4',
        title: 'The Choice Challenge',
        content: 'The Crystal Guardian gave them 10 crystal coins. "You can buy whatever you want, but choose wisely. Some choices help you grow, others just make you happy for a moment."',
        illustration: 'Children holding crystal coins, looking at different crystal displays',
        moral: 'Every choice has consequences, so think before you decide.',
        interactiveMoment: {
          type: 'calculation',
          question: 'If a warm coat costs 3 coins and a toy costs 7 coins, which leaves you more coins for other needs?',
          correctAnswer: 'Warm coat',
          explanation: 'The coat costs 3 coins, leaving you 7 coins for other important things!'
        },
        financialConcept: 'Making smart choices',
        realWorldConnection: 'Budgeting and prioritizing spending'
      },
      {
        id: 'chapter-5',
        title: 'Growing Wisdom',
        content: 'Maya chose warm clothes and a book. Leo chose a toy but later wished he\'d picked something more useful. The next time, they made choices together, helping each other think through what was best.',
        illustration: 'Children sharing what they learned, with rainbow crystals around them',
        moral: 'Learning from our choices makes us smarter for the future.',
        interactiveMoment: {
          type: 'reflection',
          question: 'What\'s something you learned about making good choices?',
          explanation: 'Every choice teaches us something valuable for the future!'
        },
        financialConcept: 'Learning from experience',
        realWorldConnection: 'How we get better at money decisions over time'
      }
    ],
    visualTheme: {
      background: 'Magical crystal cave with rainbow light reflections',
      characterStyle: 'Modern kids with adventure gear',
      environment: 'Underground crystal palace with glowing pathways'
    },
    interactiveElements: [
      {
        type: 'simulation',
        title: 'Needs vs Wants Sorter',
        description: 'Sort items into needs and wants categories',
        data: { items: ['apple', 'toy car', 'shoes', 'candy'] }
      }
    ],
    relatedGames: ['BudgetBalancerGame', 'CreditDefender2D'],
    estimatedReadingTime: 18,
    difficulty: 'beginner'
  }
]

// Middle School Stories (Ages 11-14)
export const MIDDLE_SCHOOL_STORIES: FinancialStory[] = [
  {
    id: 'pixel-investors',
    title: 'The Pixel Investors Club',
    ageTier: 'middle-school',
    summary: 'A group of friends discover that their Minecraft server economy teaches real investment principles as they build virtual businesses and face market challenges.',
    moral: 'The principles of smart investing work whether you\'re building with pixels or real dollars.',
    keyConcepts: ['Investment basics', 'Risk and return', 'Diversification', 'Market timing'],
    characters: [
      {
        name: 'Alex',
        role: 'Strategic thinker',
        personality: 'Analytical, patient, research-oriented',
        visualDescription: 'Character with glasses and a tablet, wearing a hoodie with circuit patterns',
        age: 13,
        avatar: '👨‍💻',
        catchphrase: 'Let me check the data on this.'
      },
      {
        name: 'Sam',
        role: 'Risk taker',
        personality: 'Bold, energetic, sometimes impatient',
        visualDescription: 'Character with vibrant hair and gaming headset, always ready for action',
        age: 12,
        avatar: '👩‍🎤',
        catchphrase: 'Let\'s go big or go home!'
      },
      {
        name: 'Jordan',
        role: 'Balanced investor',
        personality: 'Calm, thoughtful, good listener',
        visualDescription: 'Character with a backpack full of tools and a calming presence',
        age: 13,
        avatar: '🧑‍🔧',
        catchphrase: 'Let\'s find the smart middle ground.'
      }
    ],
    chapters: [
      {
        id: 'chapter-1',
        title: 'The Server Economy',
        content: 'The friends logged into their favorite Minecraft server and noticed something new: players were trading diamonds for emeralds, building shops, and creating an entire economy. "This is just like the real world!" Alex realized.',
        illustration: 'Minecraft-style world with player shops and trading areas',
        moral: 'Virtual economies can teach us real financial principles.',
        interactiveMoment: {
          type: 'reflection',
          question: 'Have you ever seen trading in a game you play?',
          explanation: 'Games often have economies that work like real ones, just simpler!'
        },
        financialConcept: 'Economic principles in gaming',
        realWorldConnection: 'How real-world markets work'
      },
      {
        id: 'chapter-2',
        title: 'The Diamond Dilemma',
        content: 'Sam found 64 diamonds and wanted to trade them all for the rarest items immediately. But Alex suggested researching prices first. "Sometimes holding valuable items makes them worth more later," Alex explained.',
        illustration: 'Player surrounded by diamonds, choosing between quick trades and waiting',
        moral: 'Research before you invest, and sometimes patience pays off.',
        interactiveMoment: {
          type: 'choice',
          question: 'If you have something valuable, should you sell it immediately or wait?',
          options: ['Sell immediately', 'Wait and research', 'Ask friends', 'Sell half now, half later'],
          correctAnswer: 'Wait and research',
          explanation: 'Research helps you make smarter decisions about when to buy or sell!'
        },
        financialConcept: 'Market research and timing',
        realWorldConnection: 'Stock market research and investment timing'
      },
      {
        id: 'chapter-3',
        title: 'Diversification Discovery',
        content: 'Jordan suggested they split their investments: some in rare items, some in building materials, some in tools. "Don\'t put all your diamonds in one chest," Jordan advised.',
        illustration: 'Inventory screen showing different types of valuable items organized separately',
        moral: 'Spreading investments reduces risk.',
        interactiveMoment: {
          type: 'calculation',
          question: 'If you have 100 diamonds and invest in 4 different things equally, how many diamonds per investment?',
          correctAnswer: 25,
          explanation: 'Diversifying means spreading your investment across different options!'
        },
        financialConcept: 'Diversification',
        realWorldConnection: 'Diversifying investment portfolios'
      },
      {
        id: 'chapter-4',
        title: 'Market Crash Warning',
        content: 'The server announced a big update that would change item values dramatically. Some players panicked and sold everything cheaply. The friends stayed calm and made smart decisions based on the update details.',
        illustration: 'Players reacting to server announcement with different emotions',
        moral: 'Stay calm during market changes and make informed decisions.',
        interactiveMoment: {
          type: 'prediction',
          question: 'When markets change dramatically, what\'s usually the best approach?',
          options: ['Sell everything', 'Buy more', 'Panic', 'Research and decide carefully'],
          correctAnswer: 'Research and decide carefully',
          explanation: 'Panicky decisions often lead to losses. Stay calm and informed!'
        },
        financialConcept: 'Market volatility',
        realWorldConnection: 'Handling market fluctuations in real investments'
      },
      {
        id: 'chapter-5',
        title: 'Virtual Success, Real Knowledge',
        content: 'By the end of the month, the friends had built successful virtual businesses and earned enough to buy rare items. More importantly, they understood investing principles they could use in real life.',
        illustration: 'Friends celebrating their virtual and real achievements',
        moral: 'Practice in safe environments builds skills for real challenges.',
        interactiveMoment: {
          type: 'reflection',
          question: 'What investment lesson from this story could help you in real life?',
          explanation: 'The principles of investing apply whether you\'re using virtual currency or real money!'
        },
        financialConcept: 'Transferable financial skills',
        realWorldConnection: 'Applying gaming lessons to real money management'
      }
    ],
    visualTheme: {
      background: 'Retro gaming aesthetic with pixel art and neon colors',
      characterStyle: 'Anime-inspired gaming avatars with customizable gear',
      environment: 'Digital landscapes with HUD elements and data visualizations'
    },
    interactiveElements: [
      {
        type: 'simulation',
        title: 'Portfolio Builder',
        description: 'Build a diversified investment portfolio',
        data: { availableAssets: ['stocks', 'bonds', 'real estate', 'crypto'] }
      }
    ],
    relatedGames: ['InvestmentClimberGame', 'BusinessBuilder2D'],
    estimatedReadingTime: 25,
    difficulty: 'intermediate'
  }
]

// Export all stories by age tier
export const FINANCIAL_STORIES = {
  elementary: ELEMENTARY_STORIES,
  'middle-school': MIDDLE_SCHOOL_STORIES,
  'high-school': [], // To be implemented
  adult: [] // To be implemented
}

export function getStoriesForAgeTier(ageTier: AgeTier): FinancialStory[] {
  return FINANCIAL_STORIES[ageTier] || []
}

export function getStoryById(storyId: string): FinancialStory | null {
  for (const tierStories of Object.values(FINANCIAL_STORIES)) {
    const story = tierStories.find(s => s.id === storyId)
    if (story) return story
  }
  return null
}