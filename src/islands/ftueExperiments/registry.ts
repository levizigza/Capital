import { FTUE_VERSION, type FtueExperimentDef } from "./types";
import { assertValidFtueExperiment, validateFtueExperiment } from "./validate";

/**
 * Versioned FTUE experiment registry.
 * Only `status: "running"` experiments participate in assignment.
 * Shipping a winner is a human PR after review — never automatic.
 */
export const FTUE_EXPERIMENT_REGISTRY: FtueExperimentDef[] = [
  {
    experiment_id: "ftue_baseline_control",
    ftue_version: FTUE_VERSION,
    status: "shipped",
    hypothesis:
      "The current Ashore→Harbor→Cove Take path teaches earn-then-decide without a competing experiment arm.",
    learning_problem:
      "Need a named control arm so every analytics event can cite an exact FTUE version and experiment id.",
    target_behavior:
      "New players complete first control, first Take consequence, and enter freeplay with recoverable failures.",
    control: {
      id: "control",
      description: "Production Ashore teach + Harbor coach + Cove Take (ashore_v1).",
    },
    variant: {
      id: "control",
      description: "Baseline is control-only; variant id mirrors control and is not assigned separately.",
    },
    primary_metric: "independent_transfer_rate",
    guardrail_metrics: [
      "failure_recovery_rate",
      "d1_retention",
      "freeplay_conversion",
      "tutorial_completion_rate",
    ],
    minimum_observation_policy: {
      min_sessions_per_arm: 3,
      require_usability_cohort: true,
    },
    stop_condition: {
      on_observation_met: "pause_for_review",
      on_usability_blocker: "stop_and_fix",
      auto_ship: false,
    },
    interpretation_rules: {
      primary_direction: "increase",
      tutorial_completion: "diagnostic_secondary_only",
      require_human_review: true,
      notes: "Baseline reference — not an A/B. Use as control description for future experiments.",
    },
    variant_weight: 0,
    owner: "ftue",
    created_at: "2026-08-18",
  },
  {
    experiment_id: "ashore_coach_density_v1",
    ftue_version: FTUE_VERSION,
    status: "draft",
    hypothesis:
      "Reducing Harbor castle coach copy for players who already cleared Ashore Teach will raise freeplay_conversion without hurting independent_transfer_rate or failure_recovery_rate.",
    learning_problem:
      "Some players treat coach banners as a checklist and delay authentic freeplay after Piggy.",
    target_behavior:
      "After Ashore + Piggy meet, players open the map / board carpet without waiting for another coach prompt, then still succeed on Cove Take transfer later.",
    control: {
      id: "control",
      description: "Full castle coach during meet_guide → to_dock.",
    },
    variant: {
      id: "reduced_coach",
      description: "Suppress non-escalated castle coach after Ashore complete; Bag tips only on failure.",
    },
    primary_metric: "freeplay_conversion",
    guardrail_metrics: [
      "independent_transfer_rate",
      "failure_recovery_rate",
      "d1_retention",
      "time_to_first_core_loop",
      "tutorial_completion_rate",
    ],
    minimum_observation_policy: {
      min_sessions_per_arm: 5,
      require_usability_cohort: true,
      max_calendar_days: 14,
    },
    stop_condition: {
      on_observation_met: "pause_for_review",
      guardrail_max_relative_drop: 0.15,
      on_usability_blocker: "stop_and_fix",
      auto_ship: false,
    },
    interpretation_rules: {
      primary_direction: "increase",
      tutorial_completion: "diagnostic_secondary_only",
      require_human_review: true,
      notes:
        "If freeplay rises but transfer or recovery falls beyond guardrail, reject. Human review must cover autonomy and accessibility.",
    },
    variant_weight: 0.5,
    owner: "ftue",
    created_at: "2026-08-18",
  },
];

export function listFtueExperiments(): FtueExperimentDef[] {
  return FTUE_EXPERIMENT_REGISTRY.slice();
}

export function getFtueExperiment(id: string): FtueExperimentDef | undefined {
  return FTUE_EXPERIMENT_REGISTRY.find((e) => e.experiment_id === id);
}

export function listRunningFtueExperiments(): FtueExperimentDef[] {
  return FTUE_EXPERIMENT_REGISTRY.filter((e) => {
    if (e.status !== "running") return false;
    return validateFtueExperiment(e).length === 0;
  });
}

/** Validate entire registry — baseline may use mirrored control/variant ids. */
export function validateFtueExperimentRegistry(): ReturnType<typeof validateFtueExperiment>[] {
  return FTUE_EXPERIMENT_REGISTRY.map((e) => {
    if (e.experiment_id === "ftue_baseline_control") {
      // Baseline is control-only; skip variant≠control check by cloning description validation only.
      const clone: FtueExperimentDef = {
        ...e,
        variant: { id: "baseline_mirror", description: e.variant.description },
      };
      return validateFtueExperiment(clone).filter((i) => i.field !== "variant.id");
    }
    return validateFtueExperiment(e);
  });
}

export function assertRegistryHealthy(): void {
  for (const exp of FTUE_EXPERIMENT_REGISTRY) {
    if (exp.status === "running") assertValidFtueExperiment(exp);
  }
  const issues = validateFtueExperimentRegistry();
  const bad = issues.find((list) => list.length > 0);
  if (bad && bad.length > 0) {
    // Drafts may have intentional incomplete notes — only throw for running.
  }
}
