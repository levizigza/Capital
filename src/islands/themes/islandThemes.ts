/** Visual identity presets — each island feels like its own world (Poptropica-style). */

export type IslandVisualStyle =
  | "seaside-craft"
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
  | "exploration";

export type IslandTheme = {
  id: string;
  name: string;
  visualStyle: IslandVisualStyle;
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
};

export const ISLAND_THEMES: Record<string, IslandTheme> = {
  coincraft_cove: {
    id: "coincraft_cove",
    name: "Coincraft Cove",
    visualStyle: "seaside-craft",
    skinClass: "island-theme-seaside",
    background: "linear-gradient(180deg, #7dd3fc 0%, #a7f3d0 45%, #fde68a 100%)",
    accent: "#0ea5e9",
    accentMuted: "#bae6fd",
    fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
    mood: "🏖️ sunny · crafty · friendly",
    mapPinShape: "round",
    complexity: "easy",
    genre: "exploration",
  },
  paycheck_peninsula: {
    id: "paycheck_peninsula",
    name: "Paycheck Peninsula",
    visualStyle: "suburban-mainstreet",
    skinClass: "island-theme-mainstreet",
    background: "linear-gradient(180deg, #fcd34d 0%, #fdba74 50%, #86efac 100%)",
    accent: "#ea580c",
    accentMuted: "#fed7aa",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    mood: "🏘️ cozy · practical · teen-friendly",
    mapPinShape: "square",
    complexity: "medium",
    genre: "strategy",
  },
  signal_city: {
    id: "signal_city",
    name: "Signal City",
    visualStyle: "neon-metropolis",
    skinClass: "island-theme-neon",
    background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #0f172a 100%)",
    accent: "#22d3ee",
    accentMuted: "#67e8f9",
    fontFamily: "'Courier New', monospace",
    mood: "🌃 neon · signals · cyber",
    mapPinShape: "diamond",
    complexity: "medium",
    genre: "quiz",
  },
  venture_foundry: {
    id: "venture_foundry",
    name: "Venture Foundry",
    visualStyle: "startup-garage",
    skinClass: "island-theme-garage",
    background: "linear-gradient(180deg, #475569 0%, #78716c 50%, #a8a29e 100%)",
    accent: "#f97316",
    accentMuted: "#fdba74",
    fontFamily: "'Inter', system-ui, sans-serif",
    mood: "🔧 maker · startup · hustle",
    mapPinShape: "hex",
    complexity: "hard",
    genre: "simulation",
  },
  financial_assets: {
    id: "financial_assets",
    name: "Financial Assets Isle",
    visualStyle: "broker-classic",
    skinClass: "island-theme-broker",
    background: "linear-gradient(180deg, #1e3a5f 0%, #334155 60%, #64748b 100%)",
    accent: "#eab308",
    accentMuted: "#fef08a",
    fontFamily: "'Georgia', serif",
    mood: "📈 markets · charts · analysis",
    mapPinShape: "square",
    complexity: "hard",
    genre: "simulation",
  },
  digital_assets: {
    id: "digital_assets",
    name: "Digital Assets District",
    visualStyle: "crypto-terminal",
    skinClass: "island-theme-crypto",
    background: "linear-gradient(180deg, #042f2e 0%, #134e4a 50%, #064e3b 100%)",
    accent: "#34d399",
    accentMuted: "#6ee7b7",
    fontFamily: "'JetBrains Mono', monospace",
    mood: "💾 terminal · tokens · blocks",
    mapPinShape: "hex",
    complexity: "hard",
    genre: "simulation",
  },
  real_estate: {
    id: "real_estate",
    name: "Real Estate Row",
    visualStyle: "auction-yard",
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
    name: "Intangibles Institute",
    visualStyle: "patent-library",
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
  business_assets: {
    id: "business_assets",
    name: "Business Assets Bay",
    visualStyle: "storefront-sim",
    skinClass: "island-theme-storefront",
    background: "linear-gradient(180deg, #0369a1 0%, #0284c7 50%, #e0f2fe 100%)",
    accent: "#2563eb",
    accentMuted: "#93c5fd",
    fontFamily: "'Verdana', sans-serif",
    mood: "🏪 cash flow · inventory · ops",
    mapPinShape: "square",
    complexity: "medium",
    genre: "simulation",
  },
  demo: {
    id: "demo",
    name: "Demo Vault",
    visualStyle: "demo-vault",
    skinClass: "island-theme-demo",
    background: "linear-gradient(180deg, #6366f1 0%, #a78bfa 100%)",
    accent: "#8b5cf6",
    accentMuted: "#c4b5fd",
    fontFamily: "system-ui, sans-serif",
    mood: "🧪 sandbox · tutorial",
    mapPinShape: "round",
    complexity: "easy",
    genre: "arcade",
  },
};

const DEFAULT_THEME: IslandTheme = {
  id: "default",
  name: "Unknown Island",
  visualStyle: "demo-vault",
  skinClass: "island-theme-demo",
  background: "linear-gradient(180deg, #6366f1 0%, #a78bfa 100%)",
  accent: "#8b5cf6",
  accentMuted: "#c4b5fd",
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
