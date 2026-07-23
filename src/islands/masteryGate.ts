/**
 * Mastery Gates — kinesthetic win is not enough.
 * You must ace an all-correct quiz to unlock the next portion.
 */

export type MasteryQuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explainCorrect: string;
};

export type MasteryGateDef = {
  id: string;
  /** Minigame id this gate is attached to */
  minigameId: string;
  title: string;
  bossLabel: string;
  requirementCopy: string;
  questions: MasteryQuizQuestion[];
};

export const MASTERY_GATES: MasteryGateDef[] = [
  {
    id: "gate_coin_catcher",
    minigameId: "mg_coin_catcher",
    title: "Impulse Dodge Quiz",
    bossLabel: "Arcade Boss",
    requirementCopy:
      "You finished the kinesthetic run — but to clear this block you must answer EVERY question correctly. No partial credit.",
    questions: [
      {
        id: "q1",
        prompt: "In Coin Catcher, catching coins while dodging impulse buys teaches you to…",
        choices: [
          "Spend every coin the moment you earn it",
          "Separate earning from impulsive spending",
          "Ignore prices entirely",
          "Only buy what glows on screen",
        ],
        correctIndex: 1,
        explainCorrect: "Needs vs wants: earn first, then choose — don’t grab every shiny spend.",
      },
      {
        id: "q2",
        prompt: "If your monthly expenses are higher than your income, your cashflow is…",
        choices: ["Positive", "Zero", "Negative", "Undefined"],
        correctIndex: 2,
        explainCorrect: "Negative cashflow means you’re losing ground each month — the Harbor Grind trap.",
      },
      {
        id: "q3",
        prompt: "An emergency fund is most like which Fortune Capsule idea?",
        choices: ["Fee Writ", "Inflation Fog", "Emergency Ledger (shield)", "Twin Tallies"],
        correctIndex: 2,
        explainCorrect: "A shield against surprise bills — cash set aside before you need it.",
      },
    ],
  },
  {
    id: "gate_coin_sort",
    minigameId: "mg_coin_sort",
    title: "Change-Making Mastery",
    bossLabel: "Harbor Boss",
    requirementCopy:
      "Sorting coins isn’t enough — prove you understand value and change. All answers must be correct to pass.",
    questions: [
      {
        id: "q1",
        prompt: "Making exact change matters because…",
        choices: [
          "It wastes time on purpose",
          "It trains you to count money accurately before you spend",
          "Cashiers never need help",
          "Coins have no real value",
        ],
        correctIndex: 1,
        explainCorrect: "Accuracy with money is a skill — kinesthetic practice builds it.",
      },
      {
        id: "q2",
        prompt: "A need is something you…",
        choices: [
          "Want because it looks cool",
          "Require for basic living (food, shelter, tools for work)",
          "Buy only during a boom economy",
          "Never budget for",
        ],
        correctIndex: 1,
        explainCorrect: "Needs before wants keeps your ledger seaworthy.",
      },
      {
        id: "q3",
        prompt: "Buying a small income asset (like a craft booth) should…",
        choices: [
          "Only increase your debt forever",
          "Add to monthly income on your ledger",
          "Delete your salary",
          "Stop all quizzes",
        ],
        correctIndex: 1,
        explainCorrect: "Assets feed cashflow — that’s how you escape paycheck-to-paycheck.",
      },
    ],
  },
  {
    id: "gate_treasure_vault",
    minigameId: "mg_treasure_vault",
    title: "Needs vs Wants Vault Quiz",
    bossLabel: "Lighthouse Boss",
    requirementCopy:
      "You explored the vault — now prove you know needs from wants. Every answer must be correct.",
    questions: [
      {
        id: "q1",
        prompt: "A need is something you…",
        choices: [
          "Buy because a friend has it",
          "Require to live and function (food, shelter, tools for work)",
          "Only purchase during sales",
          "Never put in a budget",
        ],
        correctIndex: 1,
        explainCorrect: "Needs keep you seaworthy; wants are optional upgrades.",
      },
      {
        id: "q2",
        prompt: "Saving coins before a big want teaches you to…",
        choices: [
          "Ignore prices forever",
          "Delay gratification so your ledger stays healthy",
          "Spend twice as fast later",
          "Avoid all fun purchases",
        ],
        correctIndex: 1,
        explainCorrect: "Waiting and saving protects cashflow — the Harbor Grind’s real skill.",
      },
      {
        id: "q3",
        prompt: "If you clear the vault but still buy every shiny want, your cashflow will…",
        choices: [
          "Automatically go up",
          "Likely shrink because spending outruns income",
          "Become undefined",
          "Delete your liabilities",
        ],
        correctIndex: 1,
        explainCorrect: "Skill practice only sticks when your real spending matches the lesson.",
      },
    ],
  },
  {
    id: "gate_news_shocks",
    minigameId: "mg_news_shocks",
    title: "Surprise Expense Quiz",
    bossLabel: "Market Crier Boss",
    requirementCopy:
      "Island news hit hard — show you can handle shocks. All answers must be correct to clear the block.",
    questions: [
      {
        id: "q1",
        prompt: "An emergency fund is mainly for…",
        choices: [
          "Buying more snacks on impulse",
          "Covering surprise bills without wrecking your plan",
          "Paying rivals’ Ledger Seals",
          "Skipping every quiz forever",
        ],
        correctIndex: 1,
        explainCorrect: "Cash set aside turns news shocks into bumps — not wipeouts.",
      },
      {
        id: "q2",
        prompt: "A windfall (lucky money) is safest when you…",
        choices: [
          "Spend it all the same day",
          "Decide needs vs wants, then save or invest part of it",
          "Hide it from your ledger",
          "Use it only for liabilities",
        ],
        correctIndex: 1,
        explainCorrect: "Windfalls are chance — your plan decides whether they grow cashflow.",
      },
      {
        id: "q3",
        prompt: "Negative cashflow plus a surprise bill means you should…",
        choices: [
          "Ignore both and roll dice faster",
          "Cut wants, protect needs, and rebuild an emergency cushion",
          "Take every liability deal",
          "Stop tracking income",
        ],
        correctIndex: 1,
        explainCorrect: "Stabilize the ledger first — then chase bigger deals.",
      },
    ],
  },
  {
    id: "gate_compound_snowball",
    minigameId: "mg_compound_snowball",
    title: "Compound Growth Quiz",
    bossLabel: "Snowball Boss",
    requirementCopy:
      "You watched the snowball roll — prove you understand compounding. No partial credit.",
    questions: [
      {
        id: "q1",
        prompt: "Compound growth means your earnings…",
        choices: [
          "Stay flat every year",
          "Earn returns on both principal and prior returns",
          "Only work for liabilities",
          "Reset to zero each Pay Day",
        ],
        correctIndex: 1,
        explainCorrect: "Interest on interest — that’s why early savings snowball.",
      },
      {
        id: "q2",
        prompt: "Starting to save earlier usually beats waiting because…",
        choices: [
          "Time gives compounding more turns to grow",
          "Banks refuse late savers",
          "Coins expire after one year",
          "Quizzes get harder later",
        ],
        correctIndex: 0,
        explainCorrect: "Time in the market (or the jar) is a huge cashflow ally.",
      },
      {
        id: "q3",
        prompt: "On the Voyager Ledger, a small income asset is similar to compounding because it…",
        choices: [
          "Only costs coins once and never helps again",
          "Adds recurring monthly income that can fund more growth",
          "Deletes your salary",
          "Raises living expenses automatically",
        ],
        correctIndex: 1,
        explainCorrect: "Assets that pay you each month stack like a gentle snowball.",
      },
    ],
  },
  {
    id: "gate_pasaran_market",
    minigameId: "mg_pasaran_market",
    title: "Fair Market Quiz",
    bossLabel: "Stall Boss",
    requirementCopy: "You traded at the pasaran — now prove fair prices and exact change. All correct required.",
    questions: [
      {
        id: "q1",
        prompt: "Making exact change matters because…",
        choices: [
          "It slows buyers on purpose",
          "It trains accurate money counting before you spend",
          "Sellers never need math",
          "Coins have no value",
        ],
        correctIndex: 1,
        explainCorrect: "Accuracy at the stall is the same skill as budgeting at home.",
      },
      {
        id: "q2",
        prompt: "A fair price in a market is closest to…",
        choices: [
          "Whatever you feel like yelling",
          "A price both buyer and seller can accept without trapping either",
          "Always the lowest possible forever",
          "Ignoring costs entirely",
        ],
        correctIndex: 1,
        explainCorrect: "Trade works when both sides leave with value.",
      },
      {
        id: "q3",
        prompt: "Overpaying wildly for a want teaches…",
        choices: [
          "Great cashflow habits",
          "How impulse can hurt your pouch",
          "That bills disappear",
          "That liabilities are free",
        ],
        correctIndex: 1,
        explainCorrect: "Mindful tendering protects your ledger.",
      },
    ],
  },
  {
    id: "gate_mancala_compound",
    minigameId: "mg_mancala_compound",
    title: "Sow & Save Quiz",
    bossLabel: "Seed Boss",
    requirementCopy: "You sowed the pits — prove you understand compounding. All answers must be correct.",
    questions: [
      {
        id: "q1",
        prompt: "In Mancala Compound, the store is most like…",
        choices: [
          "A liability you must feed",
          "A savings jar that grows when seeds loop home",
          "A fee raid on rivals",
          "A random dice roll",
        ],
        correctIndex: 1,
        explainCorrect: "The store is your compound savings — deposits that keep working.",
      },
      {
        id: "q2",
        prompt: "Compound growth means…",
        choices: [
          "Earnings can earn more earnings over time",
          "Money only works once",
          "You should spend every seed",
          "Stores never grow",
        ],
        correctIndex: 0,
        explainCorrect: "Interest on interest — or seeds on seeds.",
      },
      {
        id: "q3",
        prompt: "Leaving seeds in play longer is like…",
        choices: [
          "Panic spending",
          "Giving savings more time to compound",
          "Deleting your salary",
          "Skipping all bills forever",
        ],
        correctIndex: 1,
        explainCorrect: "Time in the jar (or pits) is a cashflow ally.",
      },
    ],
  },
  {
    id: "gate_life_fork",
    minigameId: "mg_life_fork",
    title: "Life Path Quiz",
    bossLabel: "Compass Boss",
    requirementCopy: "You chose your forks — prove you know which paths grow cashflow. All correct.",
    questions: [
      {
        id: "q1",
        prompt: "Paying for skills that raise future income is best described as…",
        choices: [
          "A pure waste",
          "Investing in human capital (an asset mindset)",
          "A liability with no upside",
          "Ignoring Pay Day",
        ],
        correctIndex: 1,
        explainCorrect: "Education and skills can lift monthly income — like an asset.",
      },
      {
        id: "q2",
        prompt: "A small insurance premium is often worth it because…",
        choices: [
          "It deletes all fun",
          "It turns huge surprise bills into planned expenses",
          "It raises your liabilities forever with no benefit",
          "Banks forbid it",
        ],
        correctIndex: 1,
        explainCorrect: "Protection keeps one storm from sinking the ledger.",
      },
      {
        id: "q3",
        prompt: "With a windfall, a strong habit is…",
        choices: [
          "Spend 100% immediately",
          "Split: save/emergency first, then enjoy a portion",
          "Hide it from your ledger forever",
          "Only buy liabilities",
        ],
        correctIndex: 1,
        explainCorrect: "Pay yourself first — then celebrate without wrecking cashflow.",
      },
    ],
  },
];

/** Shared mastery quiz after any island Party Dash (kinesthetic → quiz). */
export const PARTY_DASH_MASTERY_GATE: MasteryGateDef = {
  id: "gate_party_dash",
  minigameId: "mg_party_dash",
  title: "Party Pad Mastery Quiz",
  bossLabel: "Play-Pad Boss",
  requirementCopy:
    "You cleared the kinesthetic Party Dash. Ace every question to prove the lesson stuck — Mario Party style.",
  questions: [
    {
      id: "pd1",
      prompt: "Why do play pads come before quizzes in Fortune Archipelago?",
      choices: [
        "Quizzes are more fun than moving",
        "You learn by doing first, then prove you understood",
        "Movement games don’t teach anything",
        "So you can skip financial literacy",
      ],
      correctIndex: 1,
      explainCorrect: "Kinesthetic play builds the feel; the quiz locks in the literacy.",
    },
    {
      id: "pd2",
      prompt: "Catching value and dodging impulse spends is most like…",
      choices: [
        "Spending every coin the second you earn it",
        "Separating earning from impulsive buying",
        "Ignoring your budget forever",
        "Only saving what glows on screen",
      ],
      correctIndex: 1,
      explainCorrect: "Earn first, then choose — needs before shiny wants.",
    },
    {
      id: "pd3",
      prompt: "If expenses keep beating income, your cashflow is…",
      choices: ["Positive", "Balanced", "Negative", "A type of investment"],
      correctIndex: 2,
      explainCorrect: "Negative cashflow means you’re losing ground each month.",
    },
  ],
};

export function getMasteryGateForMinigame(minigameId: string): MasteryGateDef | undefined {
  const exact = MASTERY_GATES.find((g) => g.minigameId === minigameId);
  if (exact) return exact;
  if (minigameId.startsWith("mg_party_dash_")) return PARTY_DASH_MASTERY_GATE;
  return undefined;
}

export function gradeMasteryQuiz(
  gate: MasteryGateDef,
  answers: Record<string, number>,
): { allCorrect: boolean; wrongIds: string[] } {
  const wrongIds: string[] = [];
  for (const q of gate.questions) {
    if (answers[q.id] !== q.correctIndex) wrongIds.push(q.id);
  }
  return { allCorrect: wrongIds.length === 0, wrongIds };
}
