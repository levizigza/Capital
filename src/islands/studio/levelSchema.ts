import { z } from "zod";

/** User-authored level definitions for VibeCode Studio */

export const VibeLevelCellSchema = z.object({
  type: z.enum(["wall", "floor", "coin", "chest", "npc", "exit"]),
  label: z.string().optional(),
  value: z.number().optional(),
});

export const VibeLevelSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  author: z.string(),
  template: z.enum(["explorable-puzzle", "coin-catcher", "quiz-signals", "budget-split"]),
  icon: z.string().default("🎮"),
  /** Grid rows for explorable-puzzle template */
  grid: z.array(z.array(VibeLevelCellSchema)).optional(),
  /** Quiz questions for quiz-signals template */
  questions: z
    .array(
      z.object({
        prompt: z.string(),
        answer: z.string(),
        wrong: z.array(z.string()).min(1).max(3),
      }),
    )
    .optional(),
  /** Expense cards for budget-split */
  expenses: z
    .array(
      z.object({
        label: z.string(),
        amount: z.number(),
        bucket: z.enum(["needs", "wants", "savings"]),
      }),
    )
    .optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  plays: z.number().default(0),
  likes: z.number().default(0),
});

export type VibeLevel = z.infer<typeof VibeLevelSchema>;

export const VIBE_TEMPLATES = [
  {
    id: "explorable-puzzle" as const,
    name: "Treasure Vault Explorer",
    icon: "🗺️",
    description: "Grid rooms with coins, NPCs, and puzzle chests — like an explorable puzzle game.",
    starterPrompt:
      "Create a 5x5 treasure vault with walls around the edge. Put 3 coins, 2 puzzle chests about needs vs wants, one friendly NPC, and an exit door.",
  },
  {
    id: "coin-catcher" as const,
    name: "Coin Catcher Arcade",
    icon: "🕹️",
    description: "Fast arcade game — catch coins, dodge expenses.",
    starterPrompt:
      "Make a 60-second coin catcher where elementary kids catch pennies and nickels but avoid candy expenses.",
  },
  {
    id: "quiz-signals" as const,
    name: "Signal Quiz",
    icon: "📡",
    description: "Neon quiz cards — decode money signals.",
    starterPrompt:
      "Write 4 quiz questions about credit scores and saving habits. Each question has one correct answer and two silly wrong answers.",
  },
  {
    id: "budget-split" as const,
    name: "Budget Splitter",
    icon: "📊",
    description: "Sort expenses into needs, wants, and savings buckets.",
    starterPrompt:
      "Create 6 expense cards for teens: rent, groceries, streaming, savings, bus pass, and concert tickets.",
  },
];

export const PROMPT_TIPS_FOR_KIDS = [
  {
    title: "Be specific",
    tip: 'Say WHAT happens, not just "make a game." Example: "A harbor where kids sort coins into jars."',
  },
  {
    title: "Describe the vibe",
    tip: 'Use mood words: "sunny beach", "neon city", "cozy notebook", "retro arcade".',
  },
  {
    title: "Set the difficulty",
    tip: 'Say "easy for ages 7" or "harder for teens" so the game feels right.',
  },
  {
    title: "One idea at a time",
    tip: "Start small — one room, three NPCs, one puzzle. Add more after it works!",
  },
  {
    title: "Teach something",
    tip: "Every great FinanceQuest level teaches ONE money skill: saving, budgeting, credit, etc.",
  },
];

export function createStarterLevel(template: VibeLevel["template"], author: string): VibeLevel {
  const base = {
    id: `community_${Date.now()}`,
    author,
    createdAt: new Date().toISOString(),
    plays: 0,
    likes: 0,
    tags: ["community"],
  };

  switch (template) {
    case "explorable-puzzle":
      return VibeLevelSchema.parse({
        ...base,
        template,
        title: "My Treasure Vault",
        description: "Explore, collect coins, solve money puzzles!",
        icon: "🗺️",
        grid: [
          [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
          [{ type: "wall" }, { type: "floor" }, { type: "coin", value: 10, label: "Dime" }, { type: "floor" }, { type: "wall" }],
          [{ type: "wall" }, { type: "chest", label: "Save first?" }, { type: "floor" }, { type: "npc", label: "Guide" }, { type: "wall" }],
          [{ type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "exit", label: "Exit" }, { type: "wall" }],
          [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
        ],
      });
    case "quiz-signals":
      return VibeLevelSchema.parse({
        ...base,
        template,
        title: "My Signal Quiz",
        description: "Decode money signals!",
        icon: "📡",
        questions: [
          {
            prompt: "Paying bills on time helps your…",
            answer: "Credit score",
            wrong: ["Video game rank", "Shoe size"],
          },
        ],
      });
    case "budget-split":
      return VibeLevelSchema.parse({
        ...base,
        template,
        title: "My Budget Split",
        description: "Sort expenses into buckets!",
        icon: "📊",
        expenses: [
          { label: "Rent", amount: 800, bucket: "needs" },
          { label: "Snacks", amount: 30, bucket: "wants" },
          { label: "Savings", amount: 100, bucket: "savings" },
        ],
      });
    default:
      return VibeLevelSchema.parse({
        ...base,
        template: "coin-catcher",
        title: "My Coin Catcher",
        description: "Catch coins, dodge expenses!",
        icon: "🕹️",
      });
  }
}
