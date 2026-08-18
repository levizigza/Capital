import type {
  ExperienceModeSegment,
  FailurePatternSegment,
  FtueSegmentContext,
  HintUsageSegment,
  PlatformSegment,
  SkipStatusSegment,
} from "./types";
import { ftueExperimentAnalyticsContext } from "../../ftueExperiments";

const RETENTION_DAYS_KEY = "capital_ftue_retention_days_v1";

type MutableSessionStats = {
  hintsUsed: number;
  failures: number;
  experienceMode: ExperienceModeSegment;
  skipStatus: SkipStatusSegment;
};

const stats: MutableSessionStats = {
  hintsUsed: 0,
  failures: 0,
  experienceMode: "new",
  skipStatus: "none",
};

export function setFtueExperienceMode(mode: ExperienceModeSegment): void {
  stats.experienceMode = mode;
}

export function setFtueSkipStatus(status: SkipStatusSegment): void {
  stats.skipStatus = status;
}

export function noteFtueHintUsed(): void {
  stats.hintsUsed += 1;
}

export function noteFtueFailure(): void {
  stats.failures += 1;
}

export function resetFtueSessionStats(): void {
  stats.hintsUsed = 0;
  stats.failures = 0;
  stats.experienceMode = "new";
  stats.skipStatus = "none";
}

export function resolvePlatform(): PlatformSegment {
  if (import.meta.env.VITE_QA === "1") return "qa";
  try {
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
    const narrow = window.matchMedia?.("(max-width: 768px)")?.matches;
    if (coarse || narrow) return "mobile_web";
  } catch {
    /* ignore */
  }
  return "web";
}

function hintUsageSegment(): HintUsageSegment {
  if (stats.hintsUsed <= 0) return "none";
  if (stats.hintsUsed <= 2) return "low";
  return "high";
}

function failurePatternSegment(): FailurePatternSegment {
  if (stats.failures <= 0) return "none";
  if (stats.failures === 1) return "single";
  return "repeated";
}

export function buildFtueSegmentContext(
  overrides?: Partial<FtueSegmentContext>,
): FtueSegmentContext {
  const exp = ftueExperimentAnalyticsContext();
  return {
    ftue_version: exp.ftue_version,
    experiment_id: exp.experiment_id,
    experiment_variant: exp.experiment_variant,
    platform: resolvePlatform(),
    experience_mode: stats.experienceMode,
    skip_status: stats.skipStatus,
    hint_usage: hintUsageSegment(),
    failure_pattern: failurePatternSegment(),
    ...overrides,
  };
}

/** Local day key YYYY-MM-DD — no account id. */
export function localDayKey(ms = Date.now()): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function recordRetentionDay(ms = Date.now()): string[] {
  const key = localDayKey(ms);
  let days: string[] = [];
  try {
    const raw = localStorage.getItem(RETENTION_DAYS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        days = parsed.filter((x): x is string => typeof x === "string");
      }
    }
  } catch {
    days = [];
  }
  if (!days.includes(key)) {
    days = [...days, key].sort().slice(-90);
    try {
      localStorage.setItem(RETENTION_DAYS_KEY, JSON.stringify(days));
    } catch {
      /* ignore */
    }
  }
  return days;
}

export function loadRetentionDays(): string[] {
  try {
    const raw = localStorage.getItem(RETENTION_DAYS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function clearRetentionDaysForTests(): void {
  try {
    localStorage.removeItem(RETENTION_DAYS_KEY);
  } catch {
    /* ignore */
  }
}
