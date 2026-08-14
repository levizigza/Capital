/**
 * First-session FTUE telemetry — measure teach beats without spoilers.
 * Canon: docs/ftue-interactive-teach.md
 */

import { analytics } from "./analytics";
import type { AnalyticsEvent } from "./types";

export const FTUE_STORAGE_COMPLETE = "capital_ftue_v1_complete";
export const FTUE_STORAGE_DISMISSED = "capital_ftue_v1_dismissed";
export const FTUE_CORE_LOOP_FLAG = "capital_ftue_core_loop_v1";

export type FtueStepId =
  | "goal"
  | "walk"
  | "economy"
  | "decision"
  | "consequence"
  | "reward"
  | "deeper";

export type FtueTeaches =
  | "fundamental_goal"
  | "primary_interaction"
  | "core_resource"
  | "meaningful_decision"
  | "consequence"
  | "reward"
  | "deeper_strategy_hint";

export const FTUE_STEPS: readonly {
  id: FtueStepId;
  teaches: FtueTeaches;
  label: string;
}[] = [
  { id: "goal", teaches: "fundamental_goal", label: "Goal" },
  { id: "walk", teaches: "primary_interaction", label: "Walk" },
  { id: "economy", teaches: "core_resource", label: "Economy" },
  { id: "decision", teaches: "meaningful_decision", label: "Decision" },
  { id: "consequence", teaches: "consequence", label: "Consequence" },
  { id: "reward", teaches: "reward", label: "Reward" },
  { id: "deeper", teaches: "deeper_strategy_hint", label: "Deeper" },
] as const;

export const FTUE_STEP_COUNT = FTUE_STEPS.length;

export function ftueStepMeta(id: FtueStepId) {
  return FTUE_STEPS.find((s) => s.id === id)!;
}

function readFlag(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

/** Experienced players / QA — skip explicit Ashore guidance. */
export function shouldSkipAshoreTeach(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("skipTeach") === "1") return true;
    if (params.get("skipIntro") === "1" && import.meta.env.VITE_QA === "1") return true;
  } catch {
    /* ignore */
  }
  return readFlag(FTUE_STORAGE_COMPLETE) || readFlag(FTUE_STORAGE_DISMISSED);
}

export function markFtueComplete(): void {
  writeFlag(FTUE_STORAGE_COMPLETE);
}

export function markFtueDismissed(): void {
  writeFlag(FTUE_STORAGE_DISMISSED);
}

export function hasRecordedCoreLoopSuccess(): boolean {
  return readFlag(FTUE_CORE_LOOP_FLAG);
}

export function markCoreLoopFirstSuccess(): void {
  writeFlag(FTUE_CORE_LOOP_FLAG);
}

/** Session-local step timing / retries for durationMs payloads. */
export class FtueSessionTracker {
  private startedAt = 0;
  private stepStartedAt = 0;
  private stepId: FtueStepId | null = null;
  private retries = 0;
  private index = -1;

  startSession(): void {
    this.startedAt = performance.now();
    void analytics.track("ftue_started", {
      stepCount: FTUE_STEP_COUNT,
      teachMode: "ftue-7",
    });
    void analytics.track("tutorial_started", { source: "ftue_7", teachMode: "ftue-7" });
  }

  startStep(stepId: FtueStepId, index: number): void {
    this.stepId = stepId;
    this.index = index;
    this.stepStartedAt = performance.now();
    this.retries = 0;
    const meta = ftueStepMeta(stepId);
    void analytics.track("ftue_step_started", {
      stepId,
      index,
      teaches: meta.teaches,
      label: meta.label,
    });
    void analytics.track("tutorial_step", {
      stepId,
      index,
      action: "started",
      teaches: meta.teaches,
    });
  }

  retryStep(reason?: string): void {
    if (!this.stepId) return;
    this.retries += 1;
    void analytics.track("ftue_step_retry", {
      stepId: this.stepId,
      index: this.index,
      retries: this.retries,
      reason: reason ?? "retry",
    });
  }

  completeStep(): void {
    if (!this.stepId) return;
    const durationMs = Math.round(performance.now() - this.stepStartedAt);
    const meta = ftueStepMeta(this.stepId);
    void analytics.track("ftue_step_completed", {
      stepId: this.stepId,
      index: this.index,
      teaches: meta.teaches,
      durationMs,
      retries: this.retries,
    });
    void analytics.track("tutorial_step", {
      stepId: this.stepId,
      index: this.index,
      action: "completed",
      durationMs,
      retries: this.retries,
      teaches: meta.teaches,
    });
  }

  abandon(reason: "leave" | "esc" | "unknown" = "leave"): void {
    const durationMs = Math.round(performance.now() - this.startedAt);
    const stepDurationMs = this.stepId
      ? Math.round(performance.now() - this.stepStartedAt)
      : 0;
    void analytics.track("ftue_abandoned", {
      stepId: this.stepId,
      index: this.index,
      reason,
      durationMs,
      stepDurationMs,
      retries: this.retries,
    });
    markFtueDismissed();
  }

  skip(reason: "veteran" | "query" | "leave"): void {
    void analytics.track("ftue_skipped", { reason, stepId: this.stepId, index: this.index });
    if (reason === "leave") markFtueDismissed();
  }

  completeSession(): void {
    const durationMs = Math.round(performance.now() - this.startedAt);
    void analytics.track("ftue_completed", {
      durationMs,
      stepCount: FTUE_STEP_COUNT,
      teachMode: "ftue-7",
    });
    void analytics.track("tutorial_completed", {
      source: "ftue_7",
      durationMs,
      teachMode: "ftue-7",
    });
    markFtueComplete();
  }
}

/** Track first successful signature loop (Harbor felt that) once per profile device. */
export function trackCoreLoopFirstSuccess(payload?: Record<string, unknown>): void {
  if (hasRecordedCoreLoopSuccess()) return;
  markCoreLoopFirstSuccess();
  void analytics.track("core_loop_first_success", {
    ...payload,
  });
}

export type FtueStepStats = {
  stepId: FtueStepId;
  started: number;
  completed: number;
  retries: number;
  abandoned: number;
  avgDurationMs: number;
  completionRate: number;
};

export type FtueFunnelAnalysis = {
  started: number;
  completed: number;
  skipped: number;
  abandoned: number;
  completionRate: number;
  coreLoopFirstSuccess: number;
  steps: FtueStepStats[];
  abandonmentPoints: { stepId: string; count: number }[];
};

/** Offline / export analysis of FTUE events. */
export function analyzeFtueFunnel(events: AnalyticsEvent[]): FtueFunnelAnalysis {
  const started = events.filter((e) => e.name === "ftue_started").length;
  const completed = events.filter((e) => e.name === "ftue_completed").length;
  const skipped = events.filter((e) => e.name === "ftue_skipped").length;
  const abandonedEvents = events.filter((e) => e.name === "ftue_abandoned");
  const coreLoopFirstSuccess = events.filter((e) => e.name === "core_loop_first_success").length;

  const abandonCounts = new Map<string, number>();
  for (const e of abandonedEvents) {
    const id = String(e.payload?.stepId ?? "unknown");
    abandonCounts.set(id, (abandonCounts.get(id) ?? 0) + 1);
  }

  const steps: FtueStepStats[] = FTUE_STEPS.map((step) => {
    const stepStarts = events.filter(
      (e) => e.name === "ftue_step_started" && e.payload?.stepId === step.id,
    );
    const stepCompletes = events.filter(
      (e) => e.name === "ftue_step_completed" && e.payload?.stepId === step.id,
    );
    const stepRetries = events.filter(
      (e) => e.name === "ftue_step_retry" && e.payload?.stepId === step.id,
    );
    const stepAbandon = abandonedEvents.filter((e) => e.payload?.stepId === step.id);
    const durations = stepCompletes
      .map((e) => e.payload?.durationMs)
      .filter((n): n is number => typeof n === "number");
    const avgDurationMs =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
    const startedN = stepStarts.length;
    const completedN = stepCompletes.length;
    return {
      stepId: step.id,
      started: startedN,
      completed: completedN,
      retries: stepRetries.length,
      abandoned: stepAbandon.length,
      avgDurationMs,
      completionRate: startedN > 0 ? Math.round((completedN / startedN) * 100) : 0,
    };
  });

  return {
    started,
    completed,
    skipped,
    abandoned: abandonedEvents.length,
    completionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
    coreLoopFirstSuccess,
    steps,
    abandonmentPoints: [...abandonCounts.entries()]
      .map(([stepId, count]) => ({ stepId, count }))
      .sort((a, b) => b.count - a.count),
  };
}
