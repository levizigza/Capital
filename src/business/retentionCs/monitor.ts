/**
 * Retention & CS monitoring engine.
 */

import { detectAnomalies, hasOpenRetentionDrop } from "./anomalies";
import { generateHypotheses } from "./diagnose";
import { buildRecommendations } from "./recommend";
import { RetentionCsError, validateObservation } from "./validate";
import type {
  AnomalyThresholds,
  CohortObservation,
  DiagnosisReport,
  RetentionAnomaly,
  RetentionCsSnapshot,
} from "./types";
import { DEFAULT_THRESHOLDS } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newReportId(): string {
  return `rpt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export class RetentionCsMonitor {
  private observations: CohortObservation[] = [];
  private anomalies: RetentionAnomaly[] = [];
  private reports: DiagnosisReport[] = [];
  private thresholds: AnomalyThresholds;

  constructor(thresholds: AnomalyThresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
  }

  recordObservation(obs: CohortObservation): CohortObservation {
    const v = validateObservation(obs);
    if (!v.ok) {
      throw new RetentionCsError(v.issues.map((i) => i.message).join("; "), v.issues);
    }
    this.observations.push(structuredClone(obs));
    return structuredClone(obs);
  }

  listObservations(): CohortObservation[] {
    return this.observations.map((o) => structuredClone(o));
  }

  listAnomalies(): RetentionAnomaly[] {
    return this.anomalies.map((a) => structuredClone(a));
  }

  /**
   * Run anomaly detection + diagnosis-first recommendations.
   */
  runDiagnosis(opts: { humanOverrideAcquisition?: boolean } = {}): DiagnosisReport {
    const detected = detectAnomalies(this.observations, this.thresholds);
    this.anomalies = detected;
    const hypotheses = generateHypotheses(detected, this.observations);
    const recommendations = buildRecommendations(detected, hypotheses, opts);
    const paidDeferred =
      hasOpenRetentionDrop(detected) && !opts.humanOverrideAcquisition;

    // Sanity: acquisition rec must be blocked when deferred
    const acq = recommendations.find((r) => r.kind === "acquisition");
    if (paidDeferred && acq && !acq.blocked) {
      throw new RetentionCsError("Invariant violated: acquisition must be blocked while retention drop open");
    }

    const report: DiagnosisReport = {
      id: newReportId(),
      created_at: nowIso(),
      anomalies: structuredClone(detected),
      hypotheses: structuredClone(hypotheses),
      recommendations: structuredClone(recommendations),
      paid_acquisition_deferred: paidDeferred,
    };
    this.reports.push(report);
    return structuredClone(report);
  }

  latestReport(): DiagnosisReport | null {
    if (!this.reports.length) return null;
    return structuredClone(this.reports[this.reports.length - 1]!);
  }

  serialize(): RetentionCsSnapshot {
    return {
      schema_version: "1",
      policy: "diagnose_before_paid_acquisition",
      observations: this.listObservations(),
      anomalies: this.listAnomalies(),
      reports: this.reports.map((r) => structuredClone(r)),
      updated_at: nowIso(),
    };
  }

  hydrate(snap: RetentionCsSnapshot): void {
    this.observations = snap.observations.map((o) => structuredClone(o));
    this.anomalies = snap.anomalies.map((a) => structuredClone(a));
    this.reports = snap.reports.map((r) => structuredClone(r));
  }
}
