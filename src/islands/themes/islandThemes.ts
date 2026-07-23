/** Visual identity — each island is a financial world painted in a game-era language. */

import type { AnimationStyleId } from "../animationStyles";

export type IslandVisualStyle =
  | "seaside-craft"
  | "vector-dawn"
  | "wireframe-seas"
  | "neon-grid"
  | "lowpoly-coast"
  | "quest-keep"
  | "ruin-realism"
  | "painterly-skies"
  | "neon-metropolis"
  | "suburban-mainstreet"
  | "startup-garage"
  | "broker-classic"
  | "crypto-terminal"
  | "auction-yard"
  | "patent-library"
  | "storefront-sim"
  | "demo-vault";

export type GameComplexity = "easy" | "medium" | "hard";
export type GameGenre =
  | "arcade"
  | "puzzle"
  | "simulation"
  | "quiz"
  | "strategy"
  | "exploration"
  | "party";

export type IslandTheme = {
  id: string;
  name: string;
  visualStyle: IslandVisualStyle;
  /** Character morph + game-era badge on the voyage map */
  animationStyle: AnimationStyleId;
  /** CSS class applied to island viewport */
  skinClass: string;
  /** Hub / map background gradient */
  background: string;
  accent: string;
  accentMuted: string;
  fontFamily: string;
  /** Decorative particles / mood */
  mood: string;
  mapPinShape: "round" | "hex" | "diamond" | "square";
  complexity: GameComplexity;
  genre: GameGenre;
  /** Short financial world pitch */
  fortuneBlurb?: string;
};

export const ISLAND_THEMES: Record<string, IslandTheme> = {
  /** Harbor Haven — Castle Grounds hub (always capital-default look) */
  harbor_haven: {
    id: "harbor_haven",
    name: "Harbor Haven",
    visualStyle: "seaside-craft",
    animationStyle: "capital-default",
    skinClass: "island-theme-seaside",
    background: "linear-gradient(180deg, #7dd3fc 0%, #a7f3d0 45%, #fde68a 100%)",
    accent: "#0ea5e9",
    accentMuted: "#bae6fd",
    fontFamily: "'Fraunces', 'Georgia', serif",
    mood: "🏝️ castle grounds · home",
    mapPinShape: "round",
    complexity: "easy",
    genre: "exploration",
    fortuneBlurb: "Walk with Coin Bag, talk to Piggy, then float to your first painting.",
  },
  /** Island 1 — Coincraft Cove chapter */
  coincraft_cove: {
    id: "coincraft_cove",
    name: "Coincraft Cove",
    visualStyle: "seaside-craft",
    animationStyle: "capital-default",
    skinClass: "island-theme-seaside",
    background: "linear-gradient(180deg, #7dd3fc 0%, #a7f3d0 45%, #fde68a 100%)",
    accent: "#0ea5e9",
    accentMuted: "#bae6fd",
    fontFamily: "'Fraunces', 'Georgia', serif",
    mood: "⚓ first painting · earn · choose",
    mapPinShape: "round",
    complexity: "easy",
    genre: "exploration",
    fortuneBlurb: "Earn coins, then choose save or spend — Captain Penny’s cove.",
  },
  /** 1960s Vector Dawn — savings graphs */
  paycheck_peninsula: {
    id: "paycheck_peninsula",
    name: "Dotgraph Atoll",
    visualStyle: "vector-dawn",
    animationStyle: "era-1960s",
    skinClass: "island-theme-vector",
    background: "radial-gradient(circle at 50% 40%, #1a1a1a 0%, #000 70%)",
    accent: "#e8e8e8",
    accentMuted: "#888",
    fontFamily: "'Courier New', monospace",
    mood: "⬛ vector · dots · SCORE",
    mapPinShape: "square",
    complexity: "easy",
    genre: "party",
    fortuneBlurb: "Connect-the-dots savings graphs under oscilloscope stars.",
  },
  /** 1970s Wireframe — inflation navigation */
  signal_city: {
    id: "signal_city",
    name: "Phosphor Reef",
    visualStyle: "wireframe-seas",
    animationStyle: "era-1970s",
    skinClass: "island-theme-wireframe",
    background: "linear-gradient(180deg, #001100 0%, #003300 40%, #000 100%)",
    accent: "#33ff66",
    accentMuted: "#1a8c3a",
    fontFamily: "'Courier New', monospace",
    mood: "🟢 wireframe · FUEL · inflation spikes",
    mapPinShape: "diamond",
    complexity: "medium",
    genre: "party",
    fortuneBlurb: "Steer a glowing skiff through inflation spikes and cashflow fuel.",
  },
  /** 1980s Neon — debt traps / retirement race */
  venture_foundry: {
    id: "venture_foundry",
    name: "Gridlock Galleria",
    visualStyle: "neon-grid",
    animationStyle: "era-1980s",
    skinClass: "island-theme-neon-grid",
    background:
      "linear-gradient(180deg, #2b0a3d 0%, #6b21a8 35%, #f472b6 70%, #22d3ee 100%)",
    accent: "#f0abfc",
    accentMuted: "#c026d3",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    mood: "🌆 synthwave · STAGE · debt traps",
    mapPinShape: "hex",
    complexity: "hard",
    genre: "party",
    fortuneBlurb: "Neon race toward retirement — dodge debt traps on the infinite grid.",
  },
  /** 1990s Low-poly — budgeting baselines */
  financial_assets: {
    id: "financial_assets",
    name: "Budget Kart Coast",
    visualStyle: "lowpoly-coast",
    animationStyle: "era-1990s",
    skinClass: "island-theme-lowpoly",
    background: "linear-gradient(180deg, #38bdf8 0%, #4ade80 45%, #fbbf24 100%)",
    accent: "#ea580c",
    accentMuted: "#fdba74",
    fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
    mood: "🦊 low-poly · hearts · LAP",
    mapPinShape: "square",
    complexity: "medium",
    genre: "party",
    fortuneBlurb: "Chunky kart coasts where budgeting baselines win the race.",
  },
  /** 2000s Quest — diversification gems */
  business_assets: {
    id: "business_assets",
    name: "Diversify Keep",
    visualStyle: "quest-keep",
    animationStyle: "era-2000s",
    skinClass: "island-theme-quest",
    background: "linear-gradient(180deg, #0369a1 0%, #16a34a 50%, #fef3c7 100%)",
    accent: "#eab308",
    accentMuted: "#fde68a",
    fontFamily: "'Fraunces', Georgia, serif",
    mood: "🏰 gems · gold · companion quests",
    mapPinShape: "hex",
    complexity: "medium",
    genre: "party",
    fortuneBlurb: "Collect gem asset classes — stocks, bonds, cash — to diversify the keep.",
  },
  /** 2010s Realism — credit ruins */
  credit_kingdom: {
    id: "credit_kingdom",
    name: "Credit Ruins",
    visualStyle: "ruin-realism",
    animationStyle: "era-2010s",
    skinClass: "island-theme-ruins",
    background: "linear-gradient(180deg, #1c1917 0%, #3f6212 40%, #78716c 100%)",
    accent: "#a8a29e",
    accentMuted: "#57534e",
    fontFamily: "'Georgia', serif",
    mood: "🗿 cinematic · compass · credit artifacts",
    mapPinShape: "diamond",
    complexity: "hard",
    genre: "party",
    fortuneBlurb: "Explore overgrown ruins to recover lost credit-history artifacts.",
  },
  /** New Gen Painterly — portfolio weather */
  future_shores: {
    id: "future_shores",
    name: "Portfolio Skies",
    visualStyle: "painterly-skies",
    animationStyle: "era-2020s",
    skinClass: "island-theme-painterly",
    background:
      "linear-gradient(160deg, #312e81 0%, #7c3aed 35%, #f472b6 65%, #fde68a 100%)",
    accent: "#fbbf24",
    accentMuted: "#c4b5fd",
    fontFamily: "'Fraunces', Georgia, serif",
    mood: "🎨 floating isles · market weather · parchment",
    mapPinShape: "round",
    complexity: "hard",
    genre: "party",
    fortuneBlurb: "Floating isles where market weather reshapes your modern portfolio.",
  },
  digital_assets: {
    id: "digital_assets",
    name: "Digital Asset Atoll",
    visualStyle: "crypto-terminal",
    animationStyle: "era-1980s",
    skinClass: "island-theme-crypto",
    background: "linear-gradient(180deg, #042f2e 0%, #134e4a 50%, #064e3b 100%)",
    accent: "#34d399",
    accentMuted: "#6ee7b7",
    fontFamily: "'JetBrains Mono', monospace",
    mood: "💾 terminal · tokens · blocks",
    mapPinShape: "hex",
    complexity: "hard",
    genre: "simulation",
    fortuneBlurb: "Terminal glow — digital assets with neon-era UI.",
  },
  real_estate: {
    id: "real_estate",
    name: "Real Estate Row",
    visualStyle: "auction-yard",
    animationStyle: "era-2000s",
    skinClass: "island-theme-auction",
    background: "linear-gradient(180deg, #78350f 0%, #b45309 45%, #fde68a 100%)",
    accent: "#dc2626",
    accentMuted: "#fca5a5",
    fontFamily: "'Times New Roman', serif",
    mood: "🏠 bids · deeds · renovation",
    mapPinShape: "diamond",
    complexity: "medium",
    genre: "strategy",
  },
  intangibles: {
    id: "intangibles",
    name: "Intangible Isle",
    visualStyle: "patent-library",
    animationStyle: "era-2020s",
    skinClass: "island-theme-library",
    background: "linear-gradient(180deg, #4c1d95 0%, #6b21a8 50%, #ddd6fe 100%)",
    accent: "#a855f7",
    accentMuted: "#e9d5ff",
    fontFamily: "'Palatino Linotype', serif",
    mood: "📚 patents · ideas · law",
    mapPinShape: "round",
    complexity: "medium",
    genre: "puzzle",
  },
  demo: {
    id: "demo",
    name: "Demo Vault",
    visualStyle: "demo-vault",
    animationStyle: "capital-default",
    skinClass: "island-theme-demo",
    background: "linear-gradient(180deg, #0ea5e9 0%, #a7f3d0 100%)",
    accent: "#0ea5e9",
    accentMuted: "#bae6fd",
    fontFamily: "system-ui, sans-serif",
    mood: "🧪 sandbox · tutorial",
    mapPinShape: "round",
    complexity: "easy",
    genre: "arcade",
  },
  starter_key_cove: {
    id: "starter_key_cove",
    name: "Key Cove",
    visualStyle: "seaside-craft",
    animationStyle: "capital-default",
    skinClass: "island-theme-seaside",
    background: "linear-gradient(180deg, #7dd3fc 0%, #a7f3d0 45%, #fde68a 100%)",
    accent: "#0ea5e9",
    accentMuted: "#bae6fd",
    fontFamily: "'Fraunces', Georgia, serif",
    mood: "⚓ dock · keys · tutorial",
    mapPinShape: "round",
    complexity: "easy",
    genre: "exploration",
  },
};

const DEFAULT_THEME: IslandTheme = {
  id: "default",
  name: "Unknown Island",
  visualStyle: "demo-vault",
  animationStyle: "capital-default",
  skinClass: "island-theme-demo",
  background: "linear-gradient(180deg, #0ea5e9 0%, #a7f3d0 100%)",
  accent: "#0ea5e9",
  accentMuted: "#bae6fd",
  fontFamily: "system-ui, sans-serif",
  mood: "✨ adventure awaits",
  mapPinShape: "round",
  complexity: "medium",
  genre: "exploration",
};

export function getIslandTheme(islandId: string, themeIdOverride?: string): IslandTheme {
  const key = themeIdOverride ?? islandId;
  return ISLAND_THEMES[key] ?? DEFAULT_THEME;
}

export function themeCssVars(theme: IslandTheme): Record<string, string> {
  return {
    "--island-accent": theme.accent,
    "--island-accent-muted": theme.accentMuted,
    "--island-bg": theme.background,
    "--island-font": theme.fontFamily,
  };
}
