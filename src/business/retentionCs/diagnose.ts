/**
 * Root-cause hypotheses from anomalies + observation context.
 */

import type {
  CohortObservation,
  HypothesisDimension,
  RetentionAnomaly,
  RootCauseHypothesis,
} from "./types";

function newId(): string {
  return `hyp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function clamp01(n: number): number {
  return Math.round(Math.min(1, Math.max(0, n)) * 1000) / 1000;
}

function findLatestObs(
  anomaly: RetentionAnomaly,
  observations: CohortObservation[],
): CohortObservation | null {
  const matches = observations.filter(
    (o) =>
      o.metric === anomaly.metric &&
      o.dimensions.cohort_id === anomaly.dimensions.cohort_id &&
      o.dimensions.acquisition_source === anomaly.dimensions.acquisition_source &&
      o.dimensions.product_version === anomaly.dimensions.product_version &&
      o.dimensions.customer_type === anomaly.dimensions.customer_type &&
      o.dimensions.onboarding_path === anomaly.dimensions.onboarding_path,
  );
  if (!matches.length) return null;
  return matches.sort((a, b) => Date.parse(b.observed_at) - Date.parse(a.observed_at))[0]!;
}

function hyp(
  anomalyId: string,
  dimension: HypothesisDimension,
  statement: string,
  evidence: string[],
  confidence: number,
): RootCauseHypothesis {
  return {
    id: newId(),
    anomaly_id: anomalyId,
    dimension,
    statement,
    evidence,
    confidence: clamp01(confidence),
  };
}

/**
 * Generate hypotheses across required dimensions.
 */
export function generateHypotheses(
  anomalies: RetentionAnomaly[],
  observations: CohortObservation[],
): RootCauseHypothesis[] {
  const out: RootCauseHypothesis[] = [];

  for (const a of anomalies) {
    const obs = findLatestObs(a, observations);
    const d = a.dimensions;

    out.push(
      hyp(
        a.id,
        "cohort",
        `Cohort ${d.cohort_id} shows ${a.metric} ${a.kind} (${a.baseline_value.toFixed(3)}→${a.current_value.toFixed(3)}).`,
        [...a.evidence],
        a.severity === "critical" ? 0.75 : a.severity === "high" ? 0.65 : 0.55,
      ),
    );

    out.push(
      hyp(
        a.id,
        "acquisition_source",
        `Acquisition source “${d.acquisition_source}” may be delivering weaker-fit users affecting ${a.metric}.`,
        [
          `source=${d.acquisition_source}`,
          `metric=${a.metric}`,
          `sample_size=${a.sample_size}`,
        ],
        d.acquisition_source === "paid_social" || d.acquisition_source === "paid_search"
          ? 0.6
          : 0.45,
      ),
    );

    out.push(
      hyp(
        a.id,
        "product_version",
        `Product version ${d.product_version} may have introduced a regression impacting ${a.metric}.`,
        [`product_version=${d.product_version}`, ...a.evidence.slice(0, 2)],
        /rc|beta|0\./i.test(d.product_version) ? 0.58 : 0.5,
      ),
    );

    out.push(
      hyp(
        a.id,
        "customer_type",
        `Customer type “${d.customer_type}” segment may be disproportionately affected.`,
        [`customer_type=${d.customer_type}`, `cohort=${d.cohort_id}`],
        d.customer_type === "unknown" ? 0.35 : 0.5,
      ),
    );

    out.push(
      hyp(
        a.id,
        "onboarding_path",
        `Onboarding path “${d.onboarding_path}” may fail to reach activation/retention moments (e.g. Soft Beat / Cove Change).`,
        [`onboarding_path=${d.onboarding_path}`, `metric=${a.metric}`],
        a.metric === "activation" || a.metric === "day_1" ? 0.62 : 0.48,
      ),
    );

    const usageEvidence: string[] = [];
    let usageConf = 0.4;
    if (obs?.usage) {
      usageEvidence.push(
        `median_sessions_7d=${obs.usage.median_sessions_7d}`,
        `features=${obs.usage.feature_flags_used.join(",") || "none"}`,
      );
      if (obs.usage.stalled_at_step) {
        usageEvidence.push(`stalled_at_step=${obs.usage.stalled_at_step}`);
        usageConf = 0.7;
      }
      if (obs.usage.median_sessions_7d < 1) usageConf = Math.max(usageConf, 0.65);
    } else {
      usageEvidence.push("No usage behavior summary attached — collect session traces");
      usageConf = 0.3;
    }
    out.push(
      hyp(
        a.id,
        "usage_behavior",
        `Usage behavior suggests reduced engagement or a stall before the signature teach moment.`,
        usageEvidence,
        usageConf,
      ),
    );

    const supportEvidence: string[] = [];
    let supportConf = 0.35;
    if (obs?.support) {
      supportEvidence.push(
        `tickets_30d=${obs.support.tickets_30d}`,
        `themes=${obs.support.top_themes.join(",") || "none"}`,
      );
      if (obs.support.tickets_30d >= 5) supportConf = 0.68;
      if (obs.support.csat != null && obs.support.csat < 0.7) {
        supportEvidence.push(`csat=${obs.support.csat}`);
        supportConf = Math.max(supportConf, 0.72);
      }
    } else {
      supportEvidence.push("No support history slice — pull VoC/tickets for this cohort");
    }
    out.push(
      hyp(
        a.id,
        "support_history",
        `Support history may reveal friction themes tied to the ${a.metric} ${a.kind}.`,
        supportEvidence,
        supportConf,
      ),
    );
  }

  return out.sort((a, b) => b.confidence - a.confidence);
}
