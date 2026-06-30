export { PERF_BUDGETS, budgetStatus, budgetStatusInverse } from "./budgets";
export type { BudgetStatus, PerfBudgets } from "./budgets";

export {
  registerAsset,
  unregisterAsset,
  getAssetTotals,
  getTotalAssetBytes,
  getAssetCount,
  ingestResourceTimings,
  bootstrapStaticModules,
  scanDomImages,
} from "./assetTracker";
export type { AssetCategory, TrackedAsset } from "./assetTracker";

export { perfMonitor } from "./PerformanceMonitor";
export type {
  FrameMetrics,
  MemoryMetrics,
  AssetMetrics,
  BudgetViolations,
  PerfSnapshot,
} from "./PerformanceMonitor";

export { PerformanceOverlay } from "./PerformanceOverlay";
export { usePerformanceMetrics, usePerformanceOverlayVisible } from "./usePerformanceMetrics";
