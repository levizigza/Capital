import type { AnalyticsEvent } from "../../types";
import { groupEventsBySession } from "../funnel";
import { loadRetentionDays, localDayKey } from "./context";
import type { FtueMetricsSnapshot, FtuePrimaryMetricId } from "./types";
import { FTUE_PRIMARY_METRICS } from "./types";

function elapsed(e: AnalyticsEvent): number {
  const ms = e.payload?.elapsedMs;
  return typeof ms === "number" ? ms : 0;
}

function namesMatch(e: AnalyticsEvent, names: string[]): boolean {
  return names.includes(e.name);
}

function firstElapsed(events: AnalyticsEvent[], names: string[], via?: string): number | null {
  const hit = events.find((e) => {
    if (!namesMatch(e, names)) return false;
    if (via && e.payload?.via !== via) return false;
    return true;
  });
  return hit ? elapsed(hit) : null;
}

function countByNames(sess: AnalyticsEvent[], names: string[]): number {
  return sess.filter((e) => namesMatch(e, names)).length;
}

function rate(numer: number, denom: number): number | null {
  if (denom <= 0) return null;
  return Math.round((numer / denom) * 1000) / 1000;
}

function dayOffset(from: string, to: string): number {
  const a = Date.parse(`${from}T12:00:00`);
  const b = Date.parse(`${to}T12:00:00`);
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

/**
 * Retention from local day keys only (no account ids).
 * Cohort = first day in ledger; Dn = returned on a calendar day exactly n days later
 * when enough calendar time has elapsed; otherwise null (not yet measurable).
 */
export function computeRetentionRates(
  days: string[],
  targets: number[] = [1, 7, 30],
  today = localDayKey(),
): Record<string, number | null> {
  const sorted = [...new Set(days)].sort();
  const out: Record<string, number | null> = {};
  if (sorted.length === 0) {
    for (const n of targets) out[`d${n}_retention`] = null;
    return out;
  }
  const first = sorted[0]!;
  const elapsedDays = dayOffset(first, today);
  for (const n of targets) {
    if (Number.isNaN(elapsedDays) || elapsedDays < n) {
      out[`d${n}_retention`] = null;
      continue;
    }
    const hit = sorted.some((d) => dayOffset(first, d) === n);
    out[`d${n}_retention`] = hit ? 1 : 0;
  }
  return out;
}

/** Count locks only once — exclude first_meaningful_decision (duplicate of first select). */
const DECISION_EVENTS = ["decision_selected", "decision_committed"];
const FAILURE_EVENTS = ["failure", "failure_occurred"];
const RECOVERY_EVENTS = ["recovery", "retry_successful"];
const FREEPLAY_EVENTS = ["freeplay_started", "freeplay_entered"];
const COMPLETE_LOOP_EVENTS = ["first_complete_loop"];
const CONSEQUENCE_EVENTS = ["consequence_displayed", "first_complete_loop"];

/**
 * Aggregate learning metrics. Tutorial completion is reported as secondary only.
 * Never treat tutorial_completion_rate as the primary success measure.
 */
export function analyzeFtueMetrics(events: AnalyticsEvent[]): FtueMetricsSnapshot {
  const bySession = groupEventsBySession(events);
  const sessions = [...bySession.values()];
  const ftueStarts = events.filter((e) => e.name === "ftue_started").length;

  let sumAction = 0;
  let nAction = 0;
  let sumDecision = 0;
  let nDecision = 0;
  let sumConsequence = 0;
  let nConsequence = 0;
  let sumLoop = 0;
  let nLoop = 0;

  let guidedOk = 0;
  let guidedDenom = 0;
  let transferOk = 0;
  let transferDenom = 0;
  let hintSessions = 0;
  let practicedSessions = 0;
  let failures = 0;
  let recoveries = 0;
  let freeplay = 0;
  let tutorialDone = 0;

  const strategyIds = new Set<string>();
  let strategyDecisions = 0;

  for (const sess of sessions) {
    const a = firstElapsed(sess, ["first_control_received"]);
    if (a != null) {
      sumAction += a;
      nAction += 1;
    }
    const d =
      firstElapsed(sess, ["first_meaningful_decision"]) ??
      firstElapsed(sess, ["decision_selected", "decision_committed"]) ??
      firstElapsed(sess, ["decision_presented"], "first_decision_marker") ??
      firstElapsed(sess, ["decision_presented"]);
    if (d != null) {
      sumDecision += d;
      nDecision += 1;
    }
    const c =
      firstElapsed(sess, CONSEQUENCE_EVENTS, "first_consequence_marker") ??
      firstElapsed(sess, CONSEQUENCE_EVENTS);
    if (c != null) {
      sumConsequence += c;
      nConsequence += 1;
    }
    const loop =
      firstElapsed(sess, COMPLETE_LOOP_EVENTS) ??
      firstElapsed(sess, ["consequence_displayed"], "first_consequence_marker") ??
      firstElapsed(sess, ["consequence_displayed"]);
    if (loop != null) {
      sumLoop += loop;
      nLoop += 1;
    }

    const practiced = sess.filter((e) => e.name === "concept_practiced").length;
    const introduced = sess.filter((e) => e.name === "concept_introduced").length;
    if (introduced > 0 || practiced > 0) {
      guidedDenom += Math.max(introduced, practiced);
      guidedOk += practiced;
      practicedSessions += practiced > 0 ? 1 : 0;
    }

    const tStart = sess.filter((e) => e.name === "transfer_started").length;
    const tOk = sess.filter((e) => e.name === "transfer_success").length;
    if (tStart > 0 || tOk > 0) {
      transferDenom += Math.max(tStart, tOk);
      transferOk += tOk;
    }

    if (sess.some((e) => e.name === "hint_used" || e.name === "hint_requested")) {
      hintSessions += 1;
    }
    failures += countByNames(sess, FAILURE_EVENTS);
    recoveries += countByNames(sess, RECOVERY_EVENTS);

    // Prefer freeplay_started; count session once even if legacy also present.
    if (sess.some((e) => namesMatch(e, FREEPLAY_EVENTS))) freeplay += 1;
    if (sess.some((e) => e.name === "tutorial_completed" || e.name === "onboarding_completed")) {
      tutorialDone += 1;
    }

    for (const e of sess) {
      if (!namesMatch(e, DECISION_EVENTS)) continue;
      strategyDecisions += 1;
      const cid = e.payload?.choiceId;
      if (typeof cid === "string" && cid) strategyIds.add(cid);
    }
  }

  const retention = computeRetentionRates(loadRetentionDays());
  const sessionCount = sessions.length || 0;
  const loopMs = nLoop ? Math.round(sumLoop / nLoop) : null;

  return {
    tutorial_completion_rate: rate(tutorialDone, sessionCount),
    time_to_first_action_ms: nAction ? Math.round(sumAction / nAction) : null,
    time_to_first_decision_ms: nDecision ? Math.round(sumDecision / nDecision) : null,
    time_to_first_consequence_ms: nConsequence ? Math.round(sumConsequence / nConsequence) : null,
    time_to_first_core_loop_ms: loopMs,
    time_to_first_complete_loop_ms: loopMs,
    guided_success_rate: rate(guidedOk, guidedDenom),
    independent_transfer_rate: rate(transferOk, transferDenom),
    hint_dependency: rate(hintSessions, Math.max(practicedSessions, sessionCount)),
    failure_recovery_rate: rate(recoveries, failures),
    strategy_diversity: rate(strategyIds.size, strategyDecisions),
    freeplay_conversion: rate(freeplay, Math.max(ftueStarts, sessionCount)),
    d1_retention: retention.d1_retention ?? null,
    d7_retention: retention.d7_retention ?? null,
    d30_retention: retention.d30_retention ?? null,
    sessions: sessionCount,
    ftue_starts: ftueStarts,
  };
}

/** Segmented slice — filter events matching segment key/value then recompute. */
export function analyzeFtueMetricsBySegment(
  events: AnalyticsEvent[],
  segmentKey: keyof NonNullable<AnalyticsEvent["payload"]> | string,
  segmentValue: string,
): FtueMetricsSnapshot {
  const filtered = events.filter((e) => String(e.payload?.[segmentKey as string] ?? "") === segmentValue);
  return analyzeFtueMetrics(filtered.length ? filtered : []);
}

export function primaryMetricValues(snap: FtueMetricsSnapshot): Record<FtuePrimaryMetricId, number | null> {
  return {
    independent_transfer_rate: snap.independent_transfer_rate,
    time_to_first_decision: snap.time_to_first_decision_ms,
    time_to_first_complete_loop: snap.time_to_first_complete_loop_ms,
    failure_recovery_rate: snap.failure_recovery_rate,
    hint_dependency: snap.hint_dependency,
    strategy_diversity: snap.strategy_diversity,
    d1_retention: snap.d1_retention,
    d7_retention: snap.d7_retention,
    d30_retention: snap.d30_retention,
  };
}

export { FTUE_PRIMARY_METRICS };
