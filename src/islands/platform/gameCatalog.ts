import type { GameComplexity, GameGenre } from "../themes/islandThemes";
import type { IslandDefinition, IslandsContent } from "../types";
import { getIslandTheme } from "../themes/islandThemes";

export type MinigameVisualShell =
  | "arcade"
  | "neon"
  | "notebook"
  | "explore"
  | "retro"
  | "flat"
  | "broker";

export type CatalogGame = {
  minigameId: string;
  islandId: string;
  islandName: string;
  islandIcon: string;
  name: string;
  description: string;
  icon: string;
  componentId: string;
  genre: GameGenre;
  complexity: GameComplexity;
  visualShell: MinigameVisualShell;
  estimatedMinutes: number;
  /** Community-created level */
  isCommunity?: boolean;
  author?: string;
};

/** Per-component default presentation when not overridden in JSON */
const COMPONENT_META: Record<
  string,
  Pick<CatalogGame, "genre" | "complexity" | "visualShell" | "estimatedMinutes">
> = {
  CoinCatcherMinigame: { genre: "arcade", complexity: "easy", visualShell: "arcade", estimatedMinutes: 2 },
  ExplorablePuzzleGame: { genre: "exploration", complexity: "medium", visualShell: "explore", estimatedMinutes: 8 },
  ModularMinigame: { genre: "strategy", complexity: "medium", visualShell: "flat", estimatedMinutes: 5 },
  PaperTradingGame: { genre: "simulation", complexity: "hard", visualShell: "broker", estimatedMinutes: 15 },
  BondsVsStocksGame: { genre: "quiz", complexity: "medium", visualShell: "broker", estimatedMinutes: 5 },
  ETFDetectiveGame: { genre: "puzzle", complexity: "medium", visualShell: "broker", estimatedMinutes: 6 },
  SignalScannerGame: { genre: "quiz", complexity: "medium", visualShell: "neon", estimatedMinutes: 4 },
  BudgetSplitterGame: { genre: "puzzle", complexity: "easy", visualShell: "notebook", estimatedMinutes: 4 },
  StartupBudgetGame: { genre: "simulation", complexity: "hard", visualShell: "flat", estimatedMinutes: 10 },
  CashFlowSimGame: { genre: "simulation", complexity: "medium", visualShell: "retro", estimatedMinutes: 8 },
  MockExchangeGame: { genre: "simulation", complexity: "hard", visualShell: "neon", estimatedMinutes: 7 },
  PropertyAuctionGame: { genre: "strategy", complexity: "medium", visualShell: "flat", estimatedMinutes: 6 },
  IPScenarioGame: { genre: "puzzle", complexity: "medium", visualShell: "notebook", estimatedMinutes: 5 },
  BudgetBalancerGame: { genre: "puzzle", complexity: "easy", visualShell: "notebook", estimatedMinutes: 3 },
  BudgetBalancerMinigame: { genre: "puzzle", complexity: "easy", visualShell: "notebook", estimatedMinutes: 3 },
  CompoundSnowballGame: { genre: "simulation", complexity: "easy", visualShell: "retro", estimatedMinutes: 3 },
  DiversifyBasketsGame: { genre: "strategy", complexity: "easy", visualShell: "flat", estimatedMinutes: 4 },
  PriceItRightGame: { genre: "simulation", complexity: "easy", visualShell: "notebook", estimatedMinutes: 3 },
};

const ISLAND_SHELL_OVERRIDES: Partial<Record<string, MinigameVisualShell>> = {
  coincraft_cove: "retro",
  signal_city: "neon",
  paycheck_peninsula: "notebook",
};

export function buildGameCatalog(content: IslandsContent): CatalogGame[] {
  const games: CatalogGame[] = [];

  for (const island of content.islands) {
    const theme = getIslandTheme(island.id, island.themeId);
    const islandShell = ISLAND_SHELL_OVERRIDES[island.id];

    for (const mg of island.minigames ?? []) {
      const meta = COMPONENT_META[mg.componentId] ?? {
        genre: theme.genre,
        complexity: theme.complexity,
        visualShell: (islandShell ?? "flat") as MinigameVisualShell,
        estimatedMinutes: 5,
      };

      games.push({
        minigameId: mg.id,
        islandId: island.id,
        islandName: island.name,
        islandIcon: island.icon,
        name: mg.name,
        description: mg.description,
        icon: mg.icon,
        componentId: mg.componentId,
        genre: (mg.genre as GameGenre) ?? meta.genre,
        complexity: (mg.complexity as GameComplexity) ?? meta.complexity,
        visualShell: (mg.visualShell as MinigameVisualShell) ?? meta.visualShell,
        estimatedMinutes: mg.estimatedMinutes ?? meta.estimatedMinutes,
      });
    }
  }

  return games;
}

export function findCatalogGame(
  catalog: CatalogGame[],
  minigameId: string,
  islandId?: string,
): CatalogGame | undefined {
  return catalog.find(
    (g) => g.minigameId === minigameId && (islandId == null || g.islandId === islandId),
  );
}

export function catalogForIsland(catalog: CatalogGame[], islandId: string): CatalogGame[] {
  return catalog.filter((g) => g.islandId === islandId);
}

export function appendCommunityGames(catalog: CatalogGame[], community: CatalogGame[]): CatalogGame[] {
  return [...catalog, ...community];
}

export function islandFromCatalog(catalog: CatalogGame[], islandId: string): IslandDefinition | null {
  void catalog;
  void islandId;
  return null;
}
