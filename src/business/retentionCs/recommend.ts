/**
 * Recommendations — diagnosis before paid acquisition.
 */

import { hasOpenRetentionDrop } from "./anomalies";
import type {
  RecommendationKind,
  RetentionAnomaly,
  RetentionRecommendation,
  RootCauseHypothesis,
} from "./types";

function newId(): string {
  return `rec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function rec(input: Omit<RetentionRecommendation, "id">): RetentionRecommendation {
  return { id: newId(), ...input };
}

/**
 * Build ordered recommendations. Paid acquisition is blocked while
 * medium+ retention anomalies are open (unless humanOverride).
 */
export function buildRecommendations(
  anomalies: RetentionAnomaly[],
  hypotheses: RootCauseHypothesis[],
  opts: { humanOverrideAcquisition?: boolean } = {},
): RetentionRecommendation[] {
  const recommendations: RetentionRecommendation[] = [];
  const openDrop = hasOpenRetentionDrop(anomalies);
  const topHyps = hypotheses.slice(0, 8);
  const anomalyIds = anomalies.map((a) => a.id);

  if (anomalies.length === 0) {
    return [
      rec({
        kind: "diagnose",
        title: "No retention anomalies — continue monitoring",
        rationale: "Cohorts within thresholds; keep weekly retention review.",
        evidence: ["No medium+ drops/spikes detected"],
        confidence: 0.7,
        anomaly_ids: [],
        hypothesis_ids: [],
        blocked: false,
      }),
    ];
  }

  // 1. Always diagnose first
  recommendations.push(
    rec({
      kind: "diagnose",
      title: "Prioritize diagnosis of retention drop",
      rationale:
        "Retention fell — diagnose cohort/source/version/path/usage/support before spending more on acquisition.",
      evidence: anomalies.flatMap((a) => a.evidence).slice(0, 6),
      confidence: 0.9,
      anomaly_ids: anomalyIds,
      hypothesis_ids: topHyps.map((h) => h.id),
      blocked: false,
    }),
  );

  recommendations.push(
    rec({
      kind: "investigate",
      title: "Investigate top root-cause hypotheses",
      rationale: "Validate highest-confidence hypotheses with product analytics + VoC.",
      evidence: topHyps.slice(0, 3).map((h) => `${h.dimension}: ${h.statement} (conf=${h.confidence})`),
      confidence: clamp(avg(topHyps.slice(0, 3).map((h) => h.confidence)) || 0.55),
      anomaly_ids: anomalyIds,
      hypothesis_ids: topHyps.slice(0, 3).map((h) => h.id),
      blocked: false,
    }),
  );

  // Dimension-specific fixes
  const byDim = groupHyps(topHyps);
  if (byDim.onboarding_path?.length || anomalies.some((a) => a.metric === "activation" || a.metric === "day_1")) {
    const h = byDim.onboarding_path?.[0];
    recommendations.push(
      rec({
        kind: "onboarding_fix",
        title: "Fix onboarding path friction",
        rationale: "Early retention metrics implicate onboarding — repair path before buying traffic.",
        evidence: h?.evidence ?? ["activation/day_1 anomaly present"],
        confidence: h?.confidence ?? 0.55,
        anomaly_ids: anomalyIds,
        hypothesis_ids: h ? [h.id] : [],
        blocked: false,
      }),
    );
  }

  if (byDim.product_version?.length || anomalies.some((a) => a.severity === "high" || a.severity === "critical")) {
    const h = byDim.product_version?.[0];
    recommendations.push(
      rec({
        kind: "product_fix",
        title: "Review product version / signature loop regressions",
        rationale: "Check Soft Beat → Plinth → share path regressions on the flagged version.",
        evidence: h?.evidence ?? anomalies[0]!.evidence.slice(0, 2),
        confidence: h?.confidence ?? 0.5,
        anomaly_ids: anomalyIds,
        hypothesis_ids: h ? [h.id] : [],
        blocked: false,
      }),
    );
  }

  if (byDim.support_history?.some((h) => h.confidence >= 0.6)) {
    const h = byDim.support_history![0]!;
    recommendations.push(
      rec({
        kind: "support_intervention",
        title: "Address support themes for affected cohort",
        rationale: "Elevated tickets/low CSAT align with retention drop.",
        evidence: h.evidence,
        confidence: h.confidence,
        anomaly_ids: anomalyIds,
        hypothesis_ids: [h.id],
        blocked: false,
      }),
    );
  }

  if (anomalies.some((a) => a.metric === "re_activation" || a.metric === "cancellations")) {
    recommendations.push(
      rec({
        kind: "reactivation_campaign",
        title: "Consider re-activation for churned cohort (after diagnosis)",
        rationale: "Only after confirming root cause — win-back messaging tied to evidence.",
        evidence: anomalies
          .filter((a) => a.metric === "cancellations" || a.metric === "re_activation")
          .flatMap((a) => a.evidence)
          .slice(0, 3),
        confidence: 0.45,
        anomaly_ids: anomalyIds,
        hypothesis_ids: [],
        blocked: false,
      }),
    );
  }

  // Acquisition last — blocked while open retention drop
  const acqBlocked = openDrop && !opts.humanOverrideAcquisition;
  recommendations.push(
    rec({
      kind: "acquisition",
      title: "Additional paid acquisition",
      rationale: acqBlocked
        ? "Blocked: retention anomalies are open — diagnose and fix retention before buying more traffic."
        : opts.humanOverrideAcquisition
          ? "Human override enabled — acquisition allowed despite open anomalies."
          : "No open medium+ retention anomalies — acquisition may be considered.",
      evidence: openDrop
        ? [
            "Policy: diagnose_before_paid_acquisition",
            ...anomalies.slice(0, 2).flatMap((a) => a.evidence.slice(0, 1)),
          ]
        : ["No blocking retention anomalies"],
      confidence: acqBlocked ? 0.95 : 0.4,
      anomaly_ids: anomalyIds,
      hypothesis_ids: [],
      blocked: acqBlocked,
      block_reason: acqBlocked
        ? "Retention drop open — diagnosis required before paid acquisition"
        : undefined,
    }),
  );

  // Ensure diagnose/investigate precede acquisition in list order
  return sortRecs(recommendations);
}

function sortRecs(recs: RetentionRecommendation[]): RetentionRecommendation[] {
  const order: Record<RecommendationKind, number> = {
    diagnose: 0,
    investigate: 1,
    onboarding_fix: 2,
    product_fix: 3,
    support_intervention: 4,
    reactivation_campaign: 5,
    acquisition: 6,
  };
  return [...recs].sort((a, b) => order[a.kind] - order[b.kind]);
}

function groupHyps(
  hyps: RootCauseHypothesis[],
): Partial<Record<RootCauseHypothesis["dimension"], RootCauseHypothesis[]>> {
  const m: Partial<Record<RootCauseHypothesis["dimension"], RootCauseHypothesis[]>> = {};
  for (const h of hyps) {
    const list = m[h.dimension] ?? [];
    list.push(h);
    m[h.dimension] = list;
  }
  return m;
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp(n: number): number {
  return Math.round(Math.min(1, Math.max(0, n)) * 1000) / 1000;
}
