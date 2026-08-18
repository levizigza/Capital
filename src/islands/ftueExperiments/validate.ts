import type { FtueExperimentDef } from "./types";
import { EXPERIMENT_PRIMARY_METRICS } from "./types";

const ID = /^[a-z][a-z0-9_-]{1,63}$/;

export type ExperimentValidationIssue = {
  field: string;
  message: string;
};

/**
 * Every experiment must contain the required contract fields.
 * Invalid experiments must not be marked running.
 */
export function validateFtueExperiment(def: FtueExperimentDef): ExperimentValidationIssue[] {
  const issues: ExperimentValidationIssue[] = [];

  const requireString = (field: keyof FtueExperimentDef | string, value: unknown) => {
    if (typeof value !== "string" || value.trim().length < 8) {
      issues.push({ field: String(field), message: "must be a non-trivial string (≥8 chars)" });
    }
  };

  if (!ID.test(def.experiment_id)) {
    issues.push({ field: "experiment_id", message: "must match /^[a-z][a-z0-9_-]{1,63}$/" });
  }
  if (!def.ftue_version || typeof def.ftue_version !== "string") {
    issues.push({ field: "ftue_version", message: "exact FTUE version required" });
  }

  requireString("hypothesis", def.hypothesis);
  requireString("learning_problem", def.learning_problem);
  requireString("target_behavior", def.target_behavior);

  if (!def.control?.id || !ID.test(def.control.id)) {
    issues.push({ field: "control.id", message: "valid control id required" });
  }
  requireString("control.description", def.control?.description);

  if (!def.variant?.id || !ID.test(def.variant.id)) {
    issues.push({ field: "variant.id", message: "valid variant id required" });
  }
  requireString("variant.description", def.variant?.description);

  if (def.control?.id && def.variant?.id && def.control.id === def.variant.id) {
    issues.push({ field: "variant.id", message: "variant id must differ from control" });
  }

  if (!EXPERIMENT_PRIMARY_METRICS.includes(def.primary_metric)) {
    issues.push({
      field: "primary_metric",
      message: `must be one of ${EXPERIMENT_PRIMARY_METRICS.join(", ")} — not tutorial_completion`,
    });
  }

  if (String(def.primary_metric).includes("tutorial")) {
    issues.push({
      field: "primary_metric",
      message: "tutorial completion cannot be primary",
    });
  }

  if (!Array.isArray(def.guardrail_metrics) || def.guardrail_metrics.length === 0) {
    issues.push({ field: "guardrail_metrics", message: "at least one guardrail required" });
  }

  const pol = def.minimum_observation_policy;
  if (!pol || typeof pol.min_sessions_per_arm !== "number" || pol.min_sessions_per_arm < 3) {
    issues.push({
      field: "minimum_observation_policy.min_sessions_per_arm",
      message: "require ≥3 sessions per arm (small-cohort friendly floor)",
    });
  }

  const stop = def.stop_condition;
  if (!stop || stop.auto_ship !== false) {
    issues.push({
      field: "stop_condition.auto_ship",
      message: "must be explicitly false — never auto-ship",
    });
  }
  if (stop?.on_observation_met !== "pause_for_review") {
    issues.push({
      field: "stop_condition.on_observation_met",
      message: "must pause_for_review",
    });
  }

  const rules = def.interpretation_rules;
  if (!rules || rules.require_human_review !== true) {
    issues.push({
      field: "interpretation_rules.require_human_review",
      message: "must be true",
    });
  }
  if (rules?.tutorial_completion !== "diagnostic_secondary_only") {
    issues.push({
      field: "interpretation_rules.tutorial_completion",
      message: "must be diagnostic_secondary_only",
    });
  }
  if (rules?.primary_direction !== "increase" && rules?.primary_direction !== "decrease") {
    issues.push({
      field: "interpretation_rules.primary_direction",
      message: "must be increase or decrease",
    });
  }

  if (def.status === "running") {
    const blocking = issues.filter((i) => i.field !== "status");
    if (blocking.length > 0) {
      issues.push({
        field: "status",
        message: "cannot be running while other validation issues exist",
      });
    }
  }

  return issues;
}

export function assertValidFtueExperiment(def: FtueExperimentDef): void {
  const issues = validateFtueExperiment(def);
  if (issues.length > 0) {
    throw new Error(
      `Invalid FTUE experiment ${def.experiment_id}: ${issues.map((i) => `${i.field}: ${i.message}`).join("; ")}`,
    );
  }
}

export function isExperimentRunnable(def: FtueExperimentDef): boolean {
  return def.status === "running" && validateFtueExperiment(def).length === 0;
}
