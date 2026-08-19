/**
 * Value efficiency — the only optimization target for the operating loop.
 */

import type { LoopEvent, ValueEfficiency } from "./types";

const EPS = 1e-6;

/**
 * profitable customer value / $ / unit time / hour founder attention
 */
export function computeValueEfficiency(input: {
  value: number | null;
  cost: number | null;
  time_hours: number | null;
  founder_minutes: number | null;
}): ValueEfficiency | null {
  if (input.value == null || Number.isNaN(input.value)) return null;
  const cost = Math.max(input.cost ?? 0, 0);
  const time = Math.max(input.time_hours ?? 0, 0);
  const founderHours = Math.max((input.founder_minutes ?? 0) / 60, 0);

  const score =
    input.value /
    Math.max(cost, EPS) /
    Math.max(time, EPS) /
    Math.max(founderHours, EPS);

  return {
    value: input.value,
    cost,
    time_hours: time,
    founder_hours: founderHours,
    score: Math.round(score * 1e6) / 1e6,
    note: "Maximize this — not agent count, automations, or model usage",
  };
}

export function aggregateTraceEfficiency(events: LoopEvent[]): ValueEfficiency | null {
  let value = 0;
  let valueKnown = false;
  let cost = 0;
  let founderMin = 0;
  for (const e of events) {
    if (e.value_estimate != null) {
      value += e.value_estimate;
      valueKnown = true;
    }
    if (e.cost_estimate != null) cost += e.cost_estimate;
    if (e.founder_minutes != null) founderMin += e.founder_minutes;
  }
  if (!valueKnown) return null;
  // time ≈ span of events if timestamps parse
  const times = events.map((e) => Date.parse(e.at)).filter((t) => !Number.isNaN(t));
  let timeHours = 0;
  if (times.length >= 2) {
    timeHours = (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60);
  }
  return computeValueEfficiency({
    value,
    cost,
    time_hours: timeHours,
    founder_minutes: founderMin,
  });
}

/** Rank traces — higher efficiency first. Never rank by event/agent count. */
export function rankByValueEfficiency(traces: { efficiency: ValueEfficiency | null }[]): number[] {
  return traces
    .map((t, i) => ({ i, s: t.efficiency?.score ?? -Infinity }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.i);
}
