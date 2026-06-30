import type { GameInstruction } from '@/components/GameInstructionBox'

// Pre-defined instructions for all games
export const GAME_INSTRUCTIONS: Record<string, GameInstruction> = {
  'coin-catcher': {
    title: 'Coin Catcher',
    emoji: '🪙',
    objective: 'Catch as many falling coins as possible while avoiding the red expenses!',
    howToPlay: [
      'Move your basket left and right to catch falling coins',
      'Gold coins are worth more than silver coins',
      'AVOID the red "expense" items - they take away points!',
      'The game gets faster as you score more points'
    ],
    controls: [
      { key: '← →', action: 'Move basket' },
      { key: 'Mouse', action: 'Click to move' },
      { key: 'Touch', action: 'Tap sides to move' }
    ],
    scoring: [
      { action: 'Gold coin', points: '+10' },
      { action: 'Silver coin', points: '+5' },
      { action: 'Diamond', points: '+25' },
      { action: 'Red expense', points: '-15' }
    ],
    tips: [
      'Focus on the valuable gold coins and diamonds',
      "It's okay to miss some coins - avoiding expenses is more important!",
      'Watch the shadows to predict where coins will land'
    ]
  },
  
  'budget-balance': {
    title: 'Budget Balance',
    emoji: '⚖️',
    objective: 'Balance your monthly budget by allocating money to needs, wants, and savings!',
    howToPlay: [
      'You have a set amount of money each month',
      'Drag and drop expenses into the correct category',
      'NEEDS: Things you must have (food, rent, utilities)',
      'WANTS: Nice to have but not essential (games, treats)',
      'SAVINGS: Money for the future',
      'Try to follow the 50/30/20 rule!'
    ],
    scoring: [
      { action: 'Correct category', points: '+10' },
      { action: 'Perfect balance', points: '+50 bonus' },
      { action: 'Wrong category', points: '-5' }
    ],
    tips: [
      'Remember: 50% needs, 30% wants, 20% savings',
      'Food and shelter are always NEEDS',
      'Entertainment and toys are usually WANTS'
    ]
  },
  
  'investment-tower': {
    title: 'Investment Tower',
    emoji: '🏗️',
    objective: 'Build the tallest investment tower by making smart investment choices!',
    howToPlay: [
      'Each block represents an investment type (stocks, bonds, savings)',
      'Stack blocks carefully - they must balance!',
      'Riskier investments (stocks) give more height but are harder to balance',
      'Safer investments (savings) are easier but give less height',
      'Your tower falls if blocks are too unbalanced!'
    ],
    controls: [
      { key: '← →', action: 'Move block' },
      { key: 'Space/↓', action: 'Drop block' },
      { key: 'Click', action: 'Drop at position' }
    ],
    scoring: [
      { action: 'Stock block placed', points: '+30 height' },
      { action: 'Bond block placed', points: '+20 height' },
      { action: 'Savings block placed', points: '+10 height' },
      { action: 'Perfect placement', points: '+10 bonus' }
    ],
    tips: [
      'Start with a stable base of savings blocks',
      'Mix different investment types for balance',
      "Don't be too greedy - a stable tower beats a fallen one!"
    ]
  },
  
  'savings-sprint': {
    title: 'Savings Sprint',
    emoji: '🏃',
    objective: 'Run and collect coins while avoiding obstacles to reach your savings goal!',
    howToPlay: [
      'Your character runs automatically',
      'Jump over obstacles and gaps',
      'Collect coins and power-ups along the way',
      'Reach the piggy bank at the end with enough coins!'
    ],
    controls: [
      { key: 'Space/↑', action: 'Jump' },
      { key: 'Click/Tap', action: 'Jump' },
      { key: 'Double tap', action: 'Double jump' }
    ],
    scoring: [
      { action: 'Coin collected', points: '+5' },
      { action: 'Star collected', points: '+20' },
      { action: 'Reach goal', points: '+100' },
      { action: 'Hit obstacle', points: '-10' }
    ],
    tips: [
      'Time your jumps carefully',
      'Some coins require risky jumps - decide if they are worth it!',
      'Look ahead to plan your path'
    ]
  },
  
  'debt-dungeon': {
    title: 'Debt Dungeon',
    emoji: '🏰',
    objective: 'Defeat debt monsters by answering financial questions correctly!',
    howToPlay: [
      'Face off against debt monsters in turn-based battles',
      'Answer money questions to attack the monster',
      'Correct answers deal damage, wrong answers hurt you',
      'Defeat all monsters to escape the dungeon!'
    ],
    scoring: [
      { action: 'Correct answer', points: 'Deal damage' },
      { action: 'Fast answer', points: 'Bonus damage' },
      { action: 'Monster defeated', points: '+50' },
      { action: 'Wrong answer', points: 'Take damage' }
    ],
    tips: [
      'Read questions carefully before answering',
      'Some monsters are weak to certain question types',
      'Save your power-ups for boss monsters!'
    ]
  },
  
  'stock-market': {
    title: 'Stock Market Simulator',
    emoji: '📈',
    objective: 'Buy low, sell high! Grow your portfolio by trading stocks wisely.',
    howToPlay: [
      'Watch the stock prices change over time',
      'Buy stocks when prices are low',
      'Sell stocks when prices are high',
      'Diversify - don\'t put all your money in one stock!',
      'Reach the target portfolio value to win'
    ],
    controls: [
      { key: 'Click BUY', action: 'Purchase stock' },
      { key: 'Click SELL', action: 'Sell stock' },
      { key: '+/-', action: 'Adjust quantity' }
    ],
    scoring: [
      { action: 'Profitable trade', points: 'Earn money' },
      { action: 'Reach goal', points: '+100 bonus' },
      { action: 'Diversified portfolio', points: '+50 bonus' }
    ],
    tips: [
      'Don\'t panic sell when prices drop temporarily',
      'Watch for patterns in price movements',
      'Keep some cash ready for good opportunities'
    ]
  },
  
  'money-maze': {
    title: 'Money Maze',
    emoji: '🌀',
    objective: 'Navigate through the maze collecting coins while managing your time!',
    howToPlay: [
      'Find your way through the maze to the exit',
      'Collect coins along the way',
      'Avoid dead ends - they waste time!',
      'Some paths have more coins but take longer'
    ],
    controls: [
      { key: '↑↓←→', action: 'Move character' },
      { key: 'WASD', action: 'Alternative movement' },
      { key: 'Swipe', action: 'Touch movement' }
    ],
    scoring: [
      { action: 'Coin collected', points: '+10' },
      { action: 'Fast completion', points: 'Time bonus' },
      { action: 'All coins collected', points: '+100 bonus' }
    ],
    tips: [
      'Sometimes the shortest path isn\'t the most valuable',
      'Remember paths you\'ve already explored',
      'Plan your route before moving'
    ]
  },
  
  'market-rally': {
    title: 'Market Rally',
    emoji: '📈',
    objective: 'Grow your $1,000 starting cash into the biggest portfolio by trading stocks over 12 rounds!',
    howToPlay: [
      'You start with $1,000 in cash and 6 stocks to trade',
      'Each round, buy or sell shares using the +/- buttons',
      'End the round to advance — prices will shift based on volatility and news',
      'Breaking news events can boost or crash entire sectors',
      'After 12 rounds the market closes and your net worth is tallied'
    ],
    controls: [
      { key: '+/-', action: 'Adjust share quantity' },
      { key: 'Buy', action: 'Purchase shares' },
      { key: 'Sell', action: 'Sell owned shares' },
      { key: 'End Round', action: 'Advance to next round' }
    ],
    scoring: [
      { action: 'Net worth > $1,000', points: 'You win!' },
      { action: 'Positive return %', points: 'Higher is better' },
      { action: 'Diversified portfolio', points: 'Lower risk' }
    ],
    tips: [
      'Diversify across sectors — don\'t put all your money in one stock',
      'News events are temporary, so don\'t panic sell',
      'Keep some cash on hand for buying opportunities after a dip',
      'High-volatility stocks can earn big but also lose big'
    ]
  },

  'budget-maze': {
    title: 'Budget Maze',
    emoji: '🧩',
    objective: 'Navigate a maze of financial decisions, collect coins, answer quizzes, and reach the exit with your budget intact!',
    howToPlay: [
      'Move your character through the maze toward the exit 🚪',
      'Collect coins 🪙 and treasures 💎 to grow your budget',
      'Avoid traps ⚠️ that drain your money and health',
      'Answer quiz questions ❓ correctly for cash rewards',
      'Visit the shop 🏪 to spend money and heal',
      'Clear all 3 levels to become a Budget Master!'
    ],
    controls: [
      { key: 'WASD / Arrows', action: 'Move character' },
      { key: 'D-Pad', action: 'Touch/click controls' },
      { key: '1-4', action: 'Answer quiz options' }
    ],
    scoring: [
      { action: 'Coin collected', points: '+$25' },
      { action: 'Treasure found', points: '+$75' },
      { action: 'Quiz correct', points: '+$40-70' },
      { action: 'Trap hit', points: '-$20 & -1❤️' },
      { action: 'Level cleared', points: 'Budget + moves bonus' }
    ],
    tips: [
      'Plan your route — fewer moves means a higher score',
      'Quizzes are worth the most money, so seek them out',
      'Save health by avoiding traps; the shop costs $50 to heal',
      'You lose if your health hits 0 or budget drops below -$100'
    ]
  },

  'boss-battle': {
    title: 'Boss Battle',
    emoji: '👹',
    objective: 'Defeat the financial boss by demonstrating your money knowledge!',
    howToPlay: [
      'Choose an attack type to start a knowledge round',
      'Answer money questions correctly to damage the boss',
      'Wrong answers cost you health — heal by playing carefully',
      'Defeat the boss before your health runs out!'
    ],
    scoring: [
      { action: 'Correct answer', points: 'Deal 20 damage' },
      { action: 'Streak bonus', points: '+10 per streak' },
      { action: 'Boss defeated', points: '+200' }
    ],
    tips: [
      'Read each question fully before you tap an answer',
      'Mix safe and strong attacks if you\u2019re low on health',
      'Boss difficulty matches the area you came from'
    ]
  },

  'compound-growth': {
    title: 'Compound Growth Lab',
    emoji: '📊',
    objective: 'See how saving and interest make money grow over time — hit the lesson goals to win!',
    howToPlay: [
      'Adjust sliders for how much you save and how long you invest',
      'Watch the chart update as compound interest kicks in',
      'Reach the target amount before time runs out'
    ],
    tips: [
      'Starting earlier beats saving more later',
      'Even small regular deposits add up with compound growth'
    ]
  },

  'credit-card-memory': {
    title: 'Credit Card Memory',
    emoji: '💳',
    objective: 'Match each card type to its correct feature and learn how real credit products work.',
    howToPlay: [
      'Tap two tiles to flip them',
      'Match a card to its matching description',
      'Clear the board with as few flips as possible'
    ],
    tips: [
      'Read APR, fees, and rewards carefully — they affect real money'
    ]
  },

  'expense-escape': {
    title: 'Expense Express',
    emoji: '🚂',
    objective: 'Keep your budget safe as spending "trains" roll in — only let the good stuff through!',
    howToPlay: [
      'Watch lanes of incoming expenses',
      'Approve needs and smart spends, block wasteful ones',
      'Don\u2019t let your budget hit zero'
    ],
    tips: [
      'When in doubt, ask: is this a need, a want, or a trap?'
    ]
  },

  'lemonade-stand': {
    title: 'Lemonade Boss',
    emoji: '🍋',
    objective: 'Run a lemonade stand: buy supplies, set a price, and serve customers for profit!',
    howToPlay: [
      'Buy lemons and sugar when you can afford them',
      'Set a fair price customers will pay',
      'Serve customers before they leave the line'
    ],
    tips: [
      'Higher price isn\u2019t always better — empty cups mean lost sales'
    ]
  },

  'business-builder': {
    title: 'Business Builder',
    emoji: '🏗️',
    objective: 'Grow a simple business by balancing upgrades, staff, and revenue.',
    howToPlay: [
      'Invest in upgrades that increase income',
      'Watch costs so you don\u2019t go broke',
      'Complete the scenario objectives shown in-game'
    ],
    tips: [
      'Reinvest profits slowly — one bad over-spend can end the run'
    ]
  },

  'piggy-bank-puzzle': {
    title: 'Piggy Bank Collector',
    emoji: '🐷',
    objective: 'Collect as many "juice" savings tokens as you can before the timer ends!',
    howToPlay: [
      'Tap Collect when you\u2019re ready each round',
      'Build your score across multiple rounds',
      'End the game when you\u2019re happy with your total'
    ],
    tips: [
      'Quick taps add up — stay focused for the full timer'
    ]
  },

  'final-challenge': {
    title: 'Portfolio Master Challenge',
    emoji: '🏦',
    objective: 'Balance a portfolio across stocks, bonds, and more to hit return goals without too much risk.',
    howToPlay: [
      'Read each scenario\u2019s goals and constraints',
      'Adjust allocations until you meet targets',
      'Submit when the optimizer score looks strong'
    ],
    tips: [
      'Diversification usually smooths out wild swings',
      'Match risk level to the scenario — "all in one stock" rarely wins twice'
    ]
  }
}
