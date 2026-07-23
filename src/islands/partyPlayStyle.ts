/**
 * Mario Party–style play classification.
 * Kinesthetic / movement games come first on the shore; quizzes prove mastery after.
 */

export type PartyPlayKind = "kinesthetic" | "quiz" | "sim";

const KINESTHETIC = new Set([
  "CoinCatcherMinigame",
  "ExplorablePuzzleGame",
  "PasaranMarketGame",
  "MancalaCompoundGame",
  "PartyDashMinigame",
  "PartyArenaMinigame",
]);

const QUIZ = new Set([
  "SignalScannerGame",
  "LifeForkGame",
  "BondsVsStocksGame",
  "ETFDetectiveGame",
  "BudgetSplitterGame",
  "BudgetBalancerGame",
  "BudgetBalancerMinigame",
  "IPScenarioGame",
  "PriceItRightGame",
]);

export function partyPlayKind(componentId: string): PartyPlayKind {
  if (KINESTHETIC.has(componentId)) return "kinesthetic";
  if (QUIZ.has(componentId)) return "quiz";
  return "sim";
}

export function isKinestheticComponent(componentId: string): boolean {
  return partyPlayKind(componentId) === "kinesthetic";
}

/** Virtual Party Dash id injected when an island lacks a movement opener. */
export function partyDashIdForIsland(islandId: string): string {
  return `mg_party_dash_${islandId}`;
}
