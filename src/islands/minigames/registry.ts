import { lazy, type ComponentType } from "react";
import type { MinigameProps } from "../types";

const MINIGAME_COMPONENTS: Record<string, () => Promise<{ default: ComponentType<MinigameProps> }>> = {
  PaperTradingGame: () => import("./PaperTradingGame"),
  BondsVsStocksGame: () => import("./BondsVsStocksGame"),
  ETFDetectiveGame: () => import("./ETFDetectiveGame"),
  ModularMinigame: () => import("./ModularMinigame"),
  CoinCatcherMinigame: () => import("./CoinCatcherMinigame"),
  ExplorablePuzzleGame: () => import("./ExplorablePuzzleGame"),
  SignalScannerGame: () => import("./SignalScannerGame"),
  BudgetSplitterGame: () => import("./BudgetSplitterGame"),
  StartupBudgetGame: () => import("./StartupBudgetGame"),
  CashFlowSimGame: () => import("./CashFlowSimGame"),
  MockExchangeGame: () => import("./MockExchangeGame"),
  PropertyAuctionGame: () => import("./PropertyAuctionGame"),
  IPScenarioGame: () => import("./IPScenarioGame"),
  BudgetBalancerGame: () => import("./BudgetBalancerMinigame"),
};

export function getMinigameComponent(componentId: string): ComponentType<MinigameProps> | null {
  const loader = MINIGAME_COMPONENTS[componentId];
  if (!loader) return null;
  return lazy(loader);
}

export function listRegisteredMinigameComponents(): string[] {
  return Object.keys(MINIGAME_COMPONENTS);
}
