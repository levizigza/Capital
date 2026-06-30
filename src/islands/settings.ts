/**
 * Island game settings: accessibility, difficulty scaling, hint tracking.
 * Persisted to localStorage for cross-session survival.
 */

const SETTINGS_KEY = "island_settings_v1";
const PERF_KEY = "island_performance_v1";

// ── Accessibility Settings ──────────────────────────────────────────

export type TextSize = "normal" | "large" | "xl";

export type AccessibilitySettings = {
  textSize: TextSize;
  reducedMotion: boolean;
  highContrast: boolean;
};

const DEFAULT_A11Y: AccessibilitySettings = {
  textSize: "normal",
  reducedMotion: false,
  highContrast: false,
};

export function loadAccessibilitySettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_A11Y, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_A11Y };
}

export function persistAccessibilitySettings(s: AccessibilitySettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

/** Returns Tailwind text-size class for the root island container. */
export function textSizeClass(size: TextSize): string {
  if (size === "large") return "text-lg";
  if (size === "xl") return "text-xl";
  return "text-base";
}

// ── Performance / Difficulty Scaling ────────────────────────────────

export type DifficultyLevel = "easy" | "normal" | "hard";

export type MinigamePerformance = {
  attempts: number;
  successes: number;
  lastScore?: number;
  bestScore?: number;
  totalTimeMs: number;
};

export type PerformanceData = {
  minigames: Record<string, MinigamePerformance>;
  questFailedAttempts: Record<string, number>;
};

const DEFAULT_PERF: PerformanceData = {
  minigames: {},
  questFailedAttempts: {},
};

export function loadPerformanceData(): PerformanceData {
  try {
    const raw = localStorage.getItem(PERF_KEY);
    if (raw) return { ...DEFAULT_PERF, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_PERF };
}

export function persistPerformanceData(d: PerformanceData): void {
  try {
    localStorage.setItem(PERF_KEY, JSON.stringify(d));
  } catch { /* ignore */ }
}

/**
 * Record a minigame attempt and persist.
 * Returns the updated performance record for that minigame.
 */
export function recordMinigameAttempt(
  minigameId: string,
  success: boolean,
  score: number | undefined,
  durationMs: number
): MinigamePerformance {
  const data = loadPerformanceData();
  const prev: MinigamePerformance = data.minigames[minigameId] || {
    attempts: 0,
    successes: 0,
    totalTimeMs: 0,
  };
  const next: MinigamePerformance = {
    attempts: prev.attempts + 1,
    successes: prev.successes + (success ? 1 : 0),
    lastScore: score ?? prev.lastScore,
    bestScore: score !== undefined ? Math.max(score, prev.bestScore ?? 0) : prev.bestScore,
    totalTimeMs: prev.totalTimeMs + durationMs,
  };
  data.minigames[minigameId] = next;
  persistPerformanceData(data);
  return next;
}

/**
 * Increment failed-attempt counter for a quest's minigame objective.
 * Returns the new count.
 */
export function recordQuestFailedAttempt(questId: string): number {
  const data = loadPerformanceData();
  const count = (data.questFailedAttempts[questId] || 0) + 1;
  data.questFailedAttempts[questId] = count;
  persistPerformanceData(data);
  return count;
}

export function getQuestFailedAttempts(questId: string): number {
  const data = loadPerformanceData();
  return data.questFailedAttempts[questId] || 0;
}

/**
 * Soft difficulty scaling: adapts based on player's success rate for a minigame.
 * - ≤ 30% success rate → "easy" (more hints, relaxed win conditions)
 * - ≥ 70% success rate → "hard" (tighter margins, bonus challenges)
 * - otherwise → "normal"
 * First attempt is always "normal".
 */
export function getDifficultyForMinigame(minigameId: string): DifficultyLevel {
  const data = loadPerformanceData();
  const perf = data.minigames[minigameId];
  if (!perf || perf.attempts === 0) return "normal";
  const rate = perf.successes / perf.attempts;
  if (rate <= 0.3) return "easy";
  if (rate >= 0.7 && perf.attempts >= 2) return "hard";
  return "normal";
}

/**
 * Returns the hint level for a quest based on failed minigame attempts.
 * 0 = basic hint, 1 = medium hint (after 1 failure), 2+ = strong hint.
 */
export function getHintLevel(questId: string): number {
  return getQuestFailedAttempts(questId);
}
