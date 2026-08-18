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

export function resetFtueOnceGuards(): void {
  once.clear();
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
  if (name === "failure_occurred") noteFtueFailure();
  if (name === "ftue_started" || name === "return_session" || name === "session_ended") {
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
  const first = !hasFtueOnce("first_decision");
  if (first) {
    // mark without double-emitting
    await trackFtueOnce("first_decision", "decision_presented", {
      ...payload,
      via: "first_decision_marker",
    });
    return;
  }
  await trackFtue("decision_presented", payload);
}

export async function trackDecisionCommitted(payload: Record<string, unknown>): Promise<void> {
  await trackFtue("decision_committed", payload);
}

export async function trackConsequenceDisplayed(payload: Record<string, unknown>): Promise<void> {
  const first = !hasFtueOnce("first_consequence");
  if (first) {
    await trackFtueOnce("first_consequence", "consequence_displayed", {
      ...payload,
      via: "first_consequence_marker",
    });
    return;
  }
  await trackFtue("consequence_displayed", payload);
}

export async function trackFreeplayEntered(payload?: Record<string, unknown>): Promise<void> {
  await trackFtueOnce("freeplay", "freeplay_entered", payload);
}
