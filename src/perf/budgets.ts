// ---------------------------------------------------------------------------
// Performance budgets — targets for frame time, memory, and asset sizes
// ---------------------------------------------------------------------------
// Violations surface immediately in the profiling overlay (red badges).
// Tune these per platform tier as the app grows.

export type BudgetStatus = "ok" | "warn" | "over";

export type PerfBudgets = {
  /** Target frame time for 60fps (ms) */
  frameTimeMs: number;
  /** Warn when frame time exceeds this (ms) — ~45fps */
  frameTimeWarnMs: number;
  /** Hard cap on estimated JS heap (MB) */
  memoryMb: number;
  /** Warn below this headroom threshold (MB) */
  memoryWarnMb: number;
  /** Max estimated draw calls per frame (DOM + WebGL) */
  drawCallsPerFrame: number;
  /** Asset size budgets (KB) */
  assets: {
    totalKb: number;
    imageKb: number;
    audioKb: number;
    jsonKb: number;
    otherKb: number;
  };
};

export const PERF_BUDGETS: PerfBudgets = {
  frameTimeMs: 16.67,
  frameTimeWarnMs: 22,
  memoryMb: 128,
  memoryWarnMb: 96,
  drawCallsPerFrame: 24,
  assets: {
    totalKb: 8_192,
    imageKb: 4_096,
    audioKb: 2_048,
    jsonKb: 1_024,
    otherKb: 512,
  },
};

export function budgetStatus(value: number, warnAt: number, maxAt: number): BudgetStatus {
  if (value <= warnAt) return "ok";
  if (value <= maxAt) return "warn";
  return "over";
}

export function budgetStatusInverse(value: number, warnAt: number, minAt: number): BudgetStatus {
  // For FPS-style metrics where higher is better
  if (value >= warnAt) return "ok";
  if (value >= minAt) return "warn";
  return "over";
}
