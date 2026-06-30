// ---------------------------------------------------------------------------
// Learning Profiles — age-group tracks within the same islands
// ---------------------------------------------------------------------------
// Explorer  (kids):   simplified text, whole numbers, minimal penalties, frequent hints
// Apprentice (teens): moderate text, decimals, interest basics, moderate consequences
// Strategist (adults): richer text, APR/compounding, forecasts, stricter constraints
// ---------------------------------------------------------------------------

const PROFILE_KEY = "learning_profile_v1";

export type LearningProfileId = "explorer" | "apprentice" | "strategist";

export type LearningProfileDef = {
  id: LearningProfileId;
  label: string;
  ageRange: string;
  icon: string;
  description: string;
  /** Multiplier applied to negative effects (penalties). <1 = softer. */
  penaltyScale: number;
  /** Multiplier applied to positive effects (rewards). */
  rewardScale: number;
  /** Whether decimals / fractional values are shown. */
  showDecimals: boolean;
  /** Hint frequency: 0 = seldom, 1 = normal, 2 = frequent */
  hintFrequency: number;
  /** UI density: "simplified" or "dashboard" */
  hudMode: "simplified" | "dashboard";
  /** Max turns in modular minigames */
  maxTurns: number;
  /** Show interest/APR concepts in event copy */
  showInterestConcepts: boolean;
  /** Show forecasts / compounding notes in strategist UI */
  showForecasts: boolean;
};

export const PROFILES: Record<LearningProfileId, LearningProfileDef> = {
  explorer: {
    id: "explorer",
    label: "Explorer",
    ageRange: "Ages 6–10",
    icon: "🧒",
    description: "Simplified text, whole numbers, minimal penalties, and frequent hints.",
    penaltyScale: 0.5,
    rewardScale: 1.2,
    showDecimals: false,
    hintFrequency: 2,
    hudMode: "simplified",
    maxTurns: 14,
    showInterestConcepts: false,
    showForecasts: false,
  },
  apprentice: {
    id: "apprentice",
    label: "Apprentice",
    ageRange: "Ages 11–17",
    icon: "🎓",
    description: "Moderate text, decimals, interest basics, and balanced consequences.",
    penaltyScale: 1.0,
    rewardScale: 1.0,
    showDecimals: true,
    hintFrequency: 1,
    hudMode: "dashboard",
    maxTurns: 10,
    showInterestConcepts: true,
    showForecasts: false,
  },
  strategist: {
    id: "strategist",
    label: "Strategist",
    ageRange: "Ages 18+",
    icon: "📈",
    description: "Richer text, APR/compounding, forecasts, and stricter constraints.",
    penaltyScale: 1.5,
    rewardScale: 0.8,
    showDecimals: true,
    hintFrequency: 0,
    hudMode: "dashboard",
    maxTurns: 8,
    showInterestConcepts: true,
    showForecasts: true,
  },
};

export const PROFILE_IDS: LearningProfileId[] = ["explorer", "apprentice", "strategist"];

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export function loadLearningProfile(): LearningProfileId {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw && PROFILES[raw as LearningProfileId]) return raw as LearningProfileId;
  } catch { /* ignore */ }
  return "apprentice"; // default
}

export function persistLearningProfile(id: LearningProfileId): void {
  try {
    localStorage.setItem(PROFILE_KEY, id);
  } catch { /* ignore */ }
}

export function getProfileDef(id: LearningProfileId): LearningProfileDef {
  return PROFILES[id];
}

// ---------------------------------------------------------------------------
// Content resolvers — resolve per-profile variants in data
// ---------------------------------------------------------------------------

/**
 * Resolve a text field that may have per-profile variants.
 * Accepts either a plain string or an object { explorer, apprentice, strategist }.
 * Falls back through: exact profile → apprentice → first available string.
 */
export type ProfileText = string | Partial<Record<LearningProfileId, string>>;

export function resolveProfileText(
  field: ProfileText | undefined,
  profileId: LearningProfileId,
): string {
  if (field === undefined || field === null) return "";
  if (typeof field === "string") return field;
  return field[profileId] ?? field.apprentice ?? Object.values(field)[0] ?? "";
}

/**
 * Resolve a numeric value that may have per-profile variants.
 * Accepts either a plain number or an object { explorer, apprentice, strategist }.
 */
export type ProfileNumber = number | Partial<Record<LearningProfileId, number>>;

export function resolveProfileNumber(
  field: ProfileNumber | undefined,
  profileId: LearningProfileId,
  fallback: number = 0,
): number {
  if (field === undefined || field === null) return fallback;
  if (typeof field === "number") return field;
  return field[profileId] ?? field.apprentice ?? fallback;
}

/**
 * Scale an effect amount according to the profile's penalty/reward multipliers.
 * Positive amounts use rewardScale, negative amounts use penaltyScale.
 */
export function scaleEffectAmount(
  amount: number,
  profileId: LearningProfileId,
): number {
  const def = PROFILES[profileId];
  if (amount >= 0) {
    return def.showDecimals ? Math.round(amount * def.rewardScale * 100) / 100 : Math.round(amount * def.rewardScale);
  }
  return def.showDecimals ? Math.round(amount * def.penaltyScale * 100) / 100 : Math.round(amount * def.penaltyScale);
}

/**
 * Format a number for display based on the profile's decimal setting.
 */
export function formatProfileNumber(value: number, profileId: LearningProfileId): string {
  const def = PROFILES[profileId];
  return def.showDecimals ? value.toFixed(2) : String(Math.round(value));
}

/** GameState overrides applied when starting a modular minigame session. */
export function profileGameOverrides(profileId: LearningProfileId): {
  maxTurns: number;
  learningProfileId: LearningProfileId;
} {
  return {
    maxTurns: PROFILES[profileId].maxTurns,
    learningProfileId: profileId,
  };
}

/** Whether a minigame score meets the profile-specific quest threshold. */
export function meetsScoreThreshold(
  score: number | undefined,
  threshold: ProfileNumber | undefined,
  profileId: LearningProfileId,
): boolean {
  if (threshold === undefined) return true;
  const min = resolveProfileNumber(threshold, profileId, 0);
  return (score ?? 0) >= min;
}

/** Resolve the display threshold for quest UI. */
export function formatScoreThreshold(
  threshold: ProfileNumber,
  profileId: LearningProfileId,
): string {
  return formatProfileNumber(resolveProfileNumber(threshold, profileId), profileId);
}

/**
 * Quest hint visibility by profile + failed attempts.
 * Explorer: hint visible as soon as quest starts.
 * Apprentice: after 1 failed minigame attempt.
 * Strategist: after 2 failed attempts.
 */
export function shouldShowQuestHint(
  failedAttempts: number,
  profileId: LearningProfileId,
  questStarted: boolean,
): boolean {
  const freq = PROFILES[profileId].hintFrequency;
  if (freq >= 2 && questStarted) return true;
  if (freq >= 1 && failedAttempts >= 1) return true;
  if (failedAttempts >= 2) return true;
  return false;
}

/** Whether to show the strong "try this next" hint line. */
export function shouldShowStrongHint(failedAttempts: number, profileId: LearningProfileId): boolean {
  const freq = PROFILES[profileId].hintFrequency;
  if (freq >= 2) return failedAttempts >= 1;
  return failedAttempts >= 2;
}

/** Resolve scenario event copy with per-profile variants. */
export function resolveScenarioEventCopy(
  event: {
    title: ProfileText;
    prompt: ProfileText;
    explanation: ProfileText;
  },
  profileId: LearningProfileId,
): { title: string; prompt: string; explanation: string } {
  return {
    title: resolveProfileText(event.title, profileId),
    prompt: resolveProfileText(event.prompt, profileId),
    explanation: resolveProfileText(event.explanation, profileId),
  };
}

/** Format money for HUD display ($whole or $decimal). */
export function formatProfileMoney(value: number, profileId: LearningProfileId): string {
  return `$${formatProfileNumber(value, profileId)}`;
}
