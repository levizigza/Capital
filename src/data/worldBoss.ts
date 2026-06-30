import type { Boss } from '@/components/PokemonWorldMap'

/** Boss metadata aligned with `PokemonWorld3D` locations (no Three.js import). */
const BOSS_BY_LOCATION: Record<
  string,
  { name: string; emoji: string; difficulty: 'easy' | 'medium' | 'hard' | 'boss' }
> = {
  'budget-boulevard': { name: 'Budget Beast', emoji: '🐉', difficulty: 'easy' },
  'savings-summit': { name: 'Savings Serpent', emoji: '🐍', difficulty: 'medium' },
  'investment-island': { name: 'Investment Iguana', emoji: '🦎', difficulty: 'hard' },
  'credit-castle': { name: 'Credit King', emoji: '👑', difficulty: 'hard' },
  'entrepreneur-empire': { name: 'Emperor of Enterprise', emoji: '🦅', difficulty: 'boss' },
  'bank-of-wisdom': { name: 'Grand Master of Finance', emoji: '🧙', difficulty: 'boss' },
}

export function buildBossForNeighborhood(neighborhoodId: string): Boss {
  const b = BOSS_BY_LOCATION[neighborhoodId] ?? {
    name: 'Finance Guardian',
    emoji: '👹',
    difficulty: 'medium' as const,
  }
  const health =
    b.difficulty === 'boss' ? 220 : b.difficulty === 'hard' ? 160 : b.difficulty === 'medium' ? 130 : 100
  const difficulty: Boss['difficulty'] =
    b.difficulty === 'boss' ? 'Epic' : b.difficulty === 'hard' ? 'Hard' : b.difficulty === 'medium' ? 'Medium' : 'Easy'

  return {
    id: `boss-${neighborhoodId}`,
    name: b.name,
    title: 'Area Boss',
    icon: b.emoji,
    description: `Defeat ${b.name} with your financial knowledge!`,
    health,
    difficulty,
    requiredGamesCompleted: 0,
    rewards: { coins: 120, xp: 80, specialItem: '🏆 Boss Badge' },
  }
}
