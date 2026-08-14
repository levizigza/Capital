import { describe, expect, it } from "vitest";
import {
  COHORT_METRICS,
  RetentionCsMonitor,
  detectAnomalies,
  hasOpenRetentionDrop,
} from "./index";
import type { CohortObservation } from "./types";

function dims(over: Partial<CohortObservation["dimensions"]> = {}) {
  return {
    cohort_id: over.cohort_id ?? "2026-W32",
    acquisition_source: over.acquisition_source ?? "content",
    product_version: over.product_version ?? "1.4.0",
    customer_type: over.customer_type ?? ("parent" as const),
    onboarding_path: over.onboarding_path ?? "harbor_ashore_v2",
  };
}

function obs(
  partial: Partial<CohortObservation> &
    Pick<CohortObservation, "id" | "metric" | "value" | "observed_at">,
): CohortObservation {
  return {
    id: partial.id,
    metric: partial.metric,
    dimensions: partial.dimensions ?? dims(),
    value: partial.value,
    sample_size: partial.sample_size ?? 100,
    observed_at: partial.observed_at,
    usage: partial.usage,
    support: partial.support,
  };
}

describe("cohort catalog", () => {
  it("tracks all required cohort metrics", () => {
    expect(COHORT_METRICS).toEqual([
      "activation",
      "day_1",
      "day_7",
      "day_30",
      "month_2_plus",
      "paid_retention",
      "feature_adoption",
      "session_frequency",
      "learning_progression",
      "cancellations",
      "re_activation",
    ]);
  });
});

describe("anomaly detection", () => {
  it("flags day_7 retention drops", () => {
    const anomalies = detectAnomalies([
      obs({
        id: "o1",
        metric: "day_7",
        value: 0.42,
        observed_at: "2026-08-01T00:00:00.000Z",
      }),
      obs({
        id: "o2",
        metric: "day_7",
        value: 0.28,
        observed_at: "2026-08-08T00:00:00.000Z",
      }),
    ]);
    expect(anomalies.length).toBeGreaterThan(0);
    expect(anomalies[0]?.kind).toBe("drop");
    expect(anomalies[0]?.metric).toBe("day_7");
    expect(hasOpenRetentionDrop(anomalies)).toBe(true);
  });

  it("flags cancellation spikes", () => {
    const anomalies = detectAnomalies([
      obs({
        id: "c1",
        metric: "cancellations",
        value: 0.05,
        observed_at: "2026-08-01T00:00:00.000Z",
      }),
      obs({
        id: "c2",
        metric: "cancellations",
        value: 0.12,
        observed_at: "2026-08-08T00:00:00.000Z",
      }),
    ]);
    expect(anomalies[0]?.kind).toBe("spike");
  });
});

describe("RetentionCsMonitor", () => {
  it("prioritizes diagnosis and blocks paid acquisition when retention falls", () => {
    const mon = new RetentionCsMonitor();
    mon.recordObservation(
      obs({
        id: "d7a",
        metric: "day_7",
        value: 0.45,
        observed_at: "2026-08-01T00:00:00.000Z",
        usage: {
          median_sessions_7d: 0.4,
          feature_flags_used: ["harbor"],
          stalled_at_step: "soft_beat_hush",
        },
        support: { tickets_30d: 12, top_themes: ["confused_at_hush"], csat: 0.55 },
      }),
    );
    mon.recordObservation(
      obs({
        id: "d7b",
        metric: "day_7",
        value: 0.3,
        observed_at: "2026-08-08T00:00:00.000Z",
        usage: {
          median_sessions_7d: 0.3,
          feature_flags_used: ["harbor"],
          stalled_at_step: "soft_beat_hush",
        },
        support: { tickets_30d: 18, top_themes: ["confused_at_hush"], csat: 0.5 },
      }),
    );

    const report = mon.runDiagnosis();
    expect(report.paid_acquisition_deferred).toBe(true);
    expect(report.anomalies.length).toBeGreaterThan(0);

    const kinds = report.recommendations.map((r) => r.kind);
    expect(kinds[0]).toBe("diagnose");
    expect(kinds).toContain("investigate");
    expect(kinds.indexOf("diagnose")).toBeLessThan(kinds.indexOf("acquisition"));

    const acq = report.recommendations.find((r) => r.kind === "acquisition")!;
    expect(acq.blocked).toBe(true);
    expect(acq.block_reason).toMatch(/diagnosis required/i);
    expect(acq.evidence.some((e) => /diagnose_before_paid_acquisition/i.test(e))).toBe(true);
    expect(acq.confidence).toBeGreaterThan(0.5);

    // Every recommendation has evidence + confidence
    for (const r of report.recommendations) {
      expect(r.evidence.length).toBeGreaterThan(0);
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("generates hypotheses across all required dimensions", () => {
    const mon = new RetentionCsMonitor();
    mon.recordObservation(
      obs({
        id: "act1",
        metric: "activation",
        value: 0.55,
        observed_at: "2026-07-01T00:00:00.000Z",
        dimensions: dims({ acquisition_source: "paid_social", product_version: "1.5.0-rc1" }),
      }),
    );
    mon.recordObservation(
      obs({
        id: "act2",
        metric: "activation",
        value: 0.35,
        observed_at: "2026-07-08T00:00:00.000Z",
        dimensions: dims({ acquisition_source: "paid_social", product_version: "1.5.0-rc1" }),
        usage: {
          median_sessions_7d: 0.2,
          feature_flags_used: [],
          stalled_at_step: "cove_change",
        },
      }),
    );
    const report = mon.runDiagnosis();
    const dimsFound = new Set(report.hypotheses.map((h) => h.dimension));
    expect(dimsFound.has("cohort")).toBe(true);
    expect(dimsFound.has("acquisition_source")).toBe(true);
    expect(dimsFound.has("product_version")).toBe(true);
    expect(dimsFound.has("customer_type")).toBe(true);
    expect(dimsFound.has("onboarding_path")).toBe(true);
    expect(dimsFound.has("usage_behavior")).toBe(true);
    expect(dimsFound.has("support_history")).toBe(true);
    for (const h of report.hypotheses) {
      expect(h.evidence.length).toBeGreaterThan(0);
      expect(h.confidence).toBeGreaterThan(0);
    }
  });

  it("allows acquisition only with human override while drop open", () => {
    const mon = new RetentionCsMonitor();
    mon.recordObservation(
      obs({
        id: "paid_ret_1",
        metric: "paid_retention",
        value: 0.8,
        observed_at: "2026-08-01T00:00:00.000Z",
      }),
    );
    mon.recordObservation(
      obs({
        id: "paid_ret_2",
        metric: "paid_retention",
        value: 0.55,
        observed_at: "2026-08-08T00:00:00.000Z",
      }),
    );
    const blocked = mon.runDiagnosis();
    expect(blocked.recommendations.find((r) => r.kind === "acquisition")?.blocked).toBe(true);

    const overridden = mon.runDiagnosis({ humanOverrideAcquisition: true });
    expect(overridden.paid_acquisition_deferred).toBe(false);
    expect(overridden.recommendations.find((r) => r.kind === "acquisition")?.blocked).toBe(
      false,
    );
  });

  it("records all cohort metric types without error", () => {
    const mon = new RetentionCsMonitor();
    for (const metric of COHORT_METRICS) {
      mon.recordObservation(
        obs({
          id: `x_${metric}_a`,
          metric,
          value: metric === "session_frequency" ? 3 : 0.5,
          observed_at: "2026-08-01T00:00:00.000Z",
        }),
      );
      mon.recordObservation(
        obs({
          id: `x_${metric}_b`,
          metric,
          value: metric === "session_frequency" ? 2 : 0.5,
          observed_at: "2026-08-08T00:00:00.000Z",
        }),
      );
    }
    expect(mon.listObservations()).toHaveLength(COHORT_METRICS.length * 2);
    const snap = mon.serialize();
    expect(snap.policy).toBe("diagnose_before_paid_acquisition");
  });
});
