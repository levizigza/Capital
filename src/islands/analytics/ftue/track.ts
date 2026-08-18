import { analytics } from "../../analytics";
import type { AnalyticsEventName } from "../../types";
import {
  buildFtueSegmentContext,
  noteFtueFailure,
  noteFtueHintUsed,
  recordRetentionDay,
} from "./context";
import { sanitizeFtuePayload } from "./privacy";
import type { FtueEventName, FtueSegmentContext } from "./types";

/** Once-per-session guards so first_* events fire only once. */
const once = new Set<string>();

/** Wall clock when current decision surface was presented (for decision_time). */
let decisionPresentedAtMs: number | null = null;
/** Last selected choice on the open decision surface (for decision_changed). */
let lastDecisionChoiceId: string | null = null;
/** Last adaptive coach intervention id (dedupe render churn). */
let lastAiInterventionId: string | null = null;

export function resetFtueOnceGuards(): void {
  once.clear();
  decisionPresentedAtMs = null;
  lastDecisionChoiceId = null;
  lastAiInterventionId = null;
}

export function hasFtueOnce(key: string): boolean {
  return once.has(key);
}

async function emitFtue(
  name: FtueEventName,
  payload?: Record<string, unknown>,
  segmentOverrides?: Partial<FtueSegmentContext>,
): Promise<void> {
  const segments = buildFtueSegmentContext(segmentOverrides);
  const safe = sanitizeFtuePayload({
    ...segments,
    ...payload,
  });
  await analytics.track(name as AnalyticsEventName, safe);
}

export async function trackFtue(
  name: FtueEventName,
  payload?: Record<string, unknown>,
  segmentOverrides?: Partial<FtueSegmentContext>,
): Promise<void> {
  if (name === "hint_used" || name === "hint_requested") noteFtueHintUsed();
  if (name === "failure" || name === "failure_occurred") noteFtueFailure();
  if (
    name === "ftue_started" ||
    name === "return_session" ||
    name === "session_end" ||
    name === "session_ended"
  ) {
    recordRetentionDay();
  }
  await emitFtue(name, payload, segmentOverrides);
}

/** Fire at most once per session for milestone events. */
export async function trackFtueOnce(
  key: string,
  name: FtueEventName,
  payload?: Record<string, unknown>,
  segmentOverrides?: Partial<FtueSegmentContext>,
): Promise<boolean> {
  if (once.has(key)) return false;
  once.add(key);
  await trackFtue(name, payload, segmentOverrides);
  return true;
}

export async function trackFirstControlReceived(source: string): Promise<void> {
  await trackFtueOnce("first_control", "first_control_received", { source });
}

export async function trackFirstMeaningfulAction(source: string): Promise<void> {
  await trackFtueOnce("first_meaningful", "first_meaningful_action", { source });
}

export async function trackDecisionPresented(payload: Record<string, unknown>): Promise<void> {
  decisionPresentedAtMs = Date.now();
  lastDecisionChoiceId = null;
  const first = !hasFtueOnce("first_decision_presented");
  if (first) {
    await trackFtueOnce("first_decision_presented", "decision_presented", {
      ...payload,
      via: "first_decision_marker",
    });
    return;
  }
  await trackFtue("decision_presented", payload);
}

/**
 * Player locked a consequential choice.
 * Emits decision_selected + decision_time; once: first_meaningful_decision.
 * Also emits legacy decision_committed for older exports.
 */
export async function trackDecisionSelected(payload: Record<string, unknown>): Promise<void> {
  const choiceId = typeof payload.choiceId === "string" ? payload.choiceId : null;
  if (choiceId && lastDecisionChoiceId && lastDecisionChoiceId !== choiceId) {
    await trackFtue("decision_changed", {
      ...payload,
      fromChoiceId: lastDecisionChoiceId,
      toChoiceId: choiceId,
    });
  }
  if (choiceId) lastDecisionChoiceId = choiceId;

  const dwellMs =
    decisionPresentedAtMs != null ? Math.max(0, Date.now() - decisionPresentedAtMs) : undefined;
  await trackFtue("decision_time", { ...payload, dwellMs });
  await trackFtue("decision_selected", payload);
  await trackFtueOnce("first_meaningful_decision", "first_meaningful_decision", payload);
}

/** @deprecated Prefer trackDecisionSelected — kept for call-site compat. */
export async function trackDecisionCommitted(payload: Record<string, unknown>): Promise<void> {
  await trackDecisionSelected(payload);
}

export async function trackDecisionChanged(payload: Record<string, unknown>): Promise<void> {
  await trackFtue("decision_changed", payload);
}

export async function trackConsequenceDisplayed(payload: Record<string, unknown>): Promise<void> {
  const first = !hasFtueOnce("first_consequence");
  if (first) {
    await trackFtueOnce("first_consequence", "consequence_displayed", {
      ...payload,
      via: "first_consequence_marker",
    });
    await trackFtueOnce("first_complete_loop", "first_complete_loop", payload);
    return;
  }
  await trackFtue("consequence_displayed", payload);
}

export async function trackFreeplayStarted(payload?: Record<string, unknown>): Promise<void> {
  await trackFtueOnce("freeplay", "freeplay_started", payload);
}

/** @deprecated Prefer trackFreeplayStarted */
export async function trackFreeplayEntered(payload?: Record<string, unknown>): Promise<void> {
  await trackFreeplayStarted(payload);
}

export async function trackFailure(payload?: Record<string, unknown>): Promise<void> {
  await trackFtue("failure", payload);
}

export async function trackRecovery(payload?: Record<string, unknown>): Promise<void> {
  await trackFtue("recovery", payload);
}

export async function trackSessionEnd(payload?: Record<string, unknown>): Promise<void> {
  await trackFtue("session_end", payload);
}

export async function trackAiIntervention(payload: Record<string, unknown>): Promise<void> {
  const via = typeof payload.via === "string" ? payload.via : null;
  if (via && via === lastAiInterventionId) return;
  if (via) lastAiInterventionId = via;
  await trackFtue("ai_intervention", payload);
}

export async function trackReflectionStarted(payload?: Record<string, unknown>): Promise<void> {
  await trackFtue("reflection_started", payload);
}

export async function trackReflectionCompleted(payload?: Record<string, unknown>): Promise<void> {
  await trackFtue("reflection_completed", payload);
}
