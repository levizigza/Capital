/**
 * Anomaly detection for retention cohorts.
 */

import type {
  AnomalyKind,
  AnomalySeverity,
  AnomalyThresholds,
  CohortObservation,
  RetentionAnomaly,
} from "./types";
import { DEFAULT_THRESHOLDS, HIGHER_IS_BETTER } from "./types";

function dimKey(obs: CohortObservation): string {
  const d = obs.dimensions;
  return [
    obs.metric,
    d.cohort_id,
    d.acquisition_source,
    d.product_version,
    d.customer_type,
    d.onboarding_path,
  ].join("|");
}

function severityFor(deltaAbs: number, relative: number, metric: string): AnomalySeverity {
  if (metric === "cancellations") {
    if (relative >= 0.5 || deltaAbs >= 0.15) return "critical";
    if (relative >= 0.3 || deltaAbs >= 0.08) return "high";
    if (relative >= 0.2) return "medium";
    return "low";
  }
  if (relative >= 0.35 || deltaAbs >= 0.15) return "critical";
  if (relative >= 0.22 || deltaAbs >= 0.1) return "high";
  if (relative >= 0.12 || deltaAbs >= 0.05) return "medium";
  return "low";
}

function newId(): string {
  return `anom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Pair latest observation with prior baseline for same dimension key.
 */
export function detectAnomalies(
  observations: CohortObservation[],
  thresholds: AnomalyThresholds = DEFAULT_THRESHOLDS,
): RetentionAnomaly[] {
  const byKey = new Map<string, CohortObservation[]>();
  for (const obs of observations) {
    const k = dimKey(obs);
    const list = byKey.get(k) ?? [];
    list.push(obs);
    byKey.set(k, list);
  }

  const anomalies: RetentionAnomaly[] = [];

  for (const [, list] of byKey) {
    const sorted = [...list].sort(
      (a, b) => Date.parse(a.observed_at) - Date.parse(b.observed_at),
    );
    if (sorted.length < 2) continue;
    const current = sorted[sorted.length - 1]!;
    const baseline = sorted[sorted.length - 2]!;
    if (current.sample_size < thresholds.min_sample) continue;

    const higherBetter = HIGHER_IS_BETTER[current.metric];
    const delta = current.value - baseline.value;
    const baselineSafe = Math.abs(baseline.value) < 1e-6 ? 1e-6 : baseline.value;
    const relative = Math.abs(delta / baselineSafe);

    let kind: AnomalyKind | null = null;

    if (current.metric === "cancellations") {
      if (
        delta > 0 &&
        (relative >= thresholds.spike_relative || delta >= thresholds.drop_absolute)
      ) {
        kind = "spike";
      }
    } else if (higherBetter) {
      if (
        delta < 0 &&
        (relative >= thresholds.drop_relative || Math.abs(delta) >= thresholds.drop_absolute)
      ) {
        kind = "drop";
      } else if (
        Math.abs(delta) < thresholds.drop_absolute * 0.3 &&
        baseline.value < 0.4 &&
        current.metric === "activation"
      ) {
        // chronically low activation
        kind = "stagnation";
      }
    } else {
      // lower is better but not cancellations — treat rise as spike
      if (delta > 0 && relative >= thresholds.spike_relative) kind = "spike";
    }

    if (!kind) continue;

    const severity = severityFor(Math.abs(delta), relative, current.metric);
    const evidence = [
      `${current.metric} ${kind}: ${baseline.value.toFixed(3)} → ${current.value.toFixed(3)} (Δ=${delta.toFixed(3)}, rel=${(relative * 100).toFixed(1)}%)`,
      `cohort=${current.dimensions.cohort_id} source=${current.dimensions.acquisition_source} version=${current.dimensions.product_version}`,
      `customer_type=${current.dimensions.customer_type} onboarding=${current.dimensions.onboarding_path}`,
      `sample_size=${current.sample_size} at ${current.observed_at}`,
    ];
    if (current.usage?.stalled_at_step) {
      evidence.push(`usage stalled_at_step=${current.usage.stalled_at_step}`);
    }
    if (current.support && current.support.tickets_30d > 0) {
      evidence.push(
        `support tickets_30d=${current.support.tickets_30d} themes=${current.support.top_themes.join(",") || "none"}`,
      );
    }

    anomalies.push({
      id: newId(),
      metric: current.metric,
      kind,
      severity,
      dimensions: { ...current.dimensions },
      current_value: current.value,
      baseline_value: baseline.value,
      delta,
      sample_size: current.sample_size,
      detected_at: current.observed_at,
      evidence,
    });
  }

  return anomalies.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function severityRank(s: AnomalySeverity): number {
  switch (s) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    default:
      return 1;
  }
}

export function hasOpenRetentionDrop(anomalies: RetentionAnomaly[]): boolean {
  return anomalies.some(
    (a) =>
      (a.kind === "drop" || a.kind === "spike") &&
      (a.severity === "medium" || a.severity === "high" || a.severity === "critical") &&
      (a.metric === "day_1" ||
        a.metric === "day_7" ||
        a.metric === "day_30" ||
        a.metric === "month_2_plus" ||
        a.metric === "paid_retention" ||
        a.metric === "activation" ||
        a.metric === "cancellations" ||
        a.metric === "re_activation" ||
        a.metric === "learning_progression" ||
        a.metric === "feature_adoption" ||
        a.metric === "session_frequency"),
  );
}
