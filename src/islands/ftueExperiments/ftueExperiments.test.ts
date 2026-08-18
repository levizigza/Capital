import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  FTUE_VERSION,
  EXPERIMENT_PRIMARY_METRICS,
  validateFtueExperiment,
  evaluateShipReadiness,
  assertHumanReviewAllowsShip,
  createEmptyReviewGates,
  getFtueExperiment,
  listFtueExperiments,
  resolveFtueExperimentAssignment,
  clearFtueExperimentAssignmentForTests,
  ftueExperimentAnalyticsContext,
  type FtueExperimentDef,
  type FtueExperimentHumanReview,
} from "./index";

function validDraft(over: Partial<FtueExperimentDef> = {}): FtueExperimentDef {
  return {
    experiment_id: "test_transfer_boost",
    ftue_version: FTUE_VERSION,
    status: "draft",
    hypothesis: "A clearer Take hush will raise independent transfer without hurting recovery.",
    learning_problem: "Players finish Cove Take but fail Paycheck transfer of save-vs-spend.",
    target_behavior: "Players apply jar-before-treat framing on Paycheck protect-vs-spend.",
    control: { id: "control", description: "Current Cove Take hush and Harbor spectacle." },
    variant: {
      id: "hush_reframe",
      description: "One extra kid-line tying Take to next island without naming Paycheck.",
    },
    primary_metric: "independent_transfer_rate",
    guardrail_metrics: ["failure_recovery_rate", "d1_retention", "tutorial_completion_rate"],
    minimum_observation_policy: { min_sessions_per_arm: 5, require_usability_cohort: true },
    stop_condition: {
      on_observation_met: "pause_for_review",
      auto_ship: false,
      on_usability_blocker: "stop_and_fix",
    },
    interpretation_rules: {
      primary_direction: "increase",
      tutorial_completion: "diagnostic_secondary_only",
      require_human_review: true,
    },
    ...over,
  };
}

describe("FTUE experiment validation", () => {
  it("accepts a complete experiment contract", () => {
    expect(validateFtueExperiment(validDraft())).toEqual([]);
  });

  it("rejects tutorial completion as primary", () => {
    const issues = validateFtueExperiment(
      validDraft({
        primary_metric: "tutorial_completion_rate" as never,
      }),
    );
    expect(issues.some((i) => i.field === "primary_metric")).toBe(true);
  });

  it("rejects auto_ship true", () => {
    const issues = validateFtueExperiment(
      validDraft({
        stop_condition: {
          on_observation_met: "pause_for_review",
          auto_ship: true as never,
        },
      }),
    );
    expect(issues.some((i) => i.field === "stop_condition.auto_ship")).toBe(true);
  });

  it("requires human review in interpretation rules", () => {
    const issues = validateFtueExperiment(
      validDraft({
        interpretation_rules: {
          primary_direction: "increase",
          tutorial_completion: "diagnostic_secondary_only",
          require_human_review: false as never,
        },
      }),
    );
    expect(issues.some((i) => i.field.includes("require_human_review"))).toBe(true);
  });

  it("lists prioritized primary metrics without tutorial completion", () => {
    expect(EXPERIMENT_PRIMARY_METRICS).toContain("independent_transfer_rate");
    expect(EXPERIMENT_PRIMARY_METRICS).toContain("time_to_first_core_loop");
    expect(EXPERIMENT_PRIMARY_METRICS).toContain("freeplay_conversion");
    expect(EXPERIMENT_PRIMARY_METRICS).toContain("failure_recovery_rate");
    expect(EXPERIMENT_PRIMARY_METRICS).toContain("d1_retention");
    expect(EXPERIMENT_PRIMARY_METRICS as readonly string[]).not.toContain(
      "tutorial_completion_rate",
    );
  });
});

describe("human review ship gate", () => {
  function review(
    over: Partial<FtueExperimentHumanReview> = {},
  ): FtueExperimentHumanReview {
    return {
      experiment_id: "test_transfer_boost",
      ftue_version: FTUE_VERSION,
      gates: createEmptyReviewGates().map((g) => ({ ...g, status: "pass" as const })),
      decision: "ship_candidate",
      acknowledge_no_auto_ship: true,
      reviewer: "ftue-lead",
      reviewed_at: "2026-08-18T00:00:00.000Z",
      ...over,
    };
  }

  it("blocks ship when any gate is not reviewed", () => {
    const result = evaluateShipReadiness(review());
    expect(result.allowed).toBe(true);

    const incomplete = review({
      gates: createEmptyReviewGates(),
    });
    expect(evaluateShipReadiness(incomplete).allowed).toBe(false);
  });

  it("blocks ship when decision is not ship_candidate", () => {
    expect(evaluateShipReadiness(review({ decision: "iterate" })).allowed).toBe(false);
  });

  it("never provides an auto-ship path — assert throws without review", () => {
    expect(() =>
      assertHumanReviewAllowsShip(
        review({
          decision: "inconclusive",
        }),
      ),
    ).toThrow(/cannot ship/);
  });

  it("requires acknowledge_no_auto_ship", () => {
    const bad = review({ acknowledge_no_auto_ship: false as never });
    expect(evaluateShipReadiness(bad).allowed).toBe(false);
  });
});

describe("assignment + version stamp", () => {
  beforeEach(() => {
    clearFtueExperimentAssignmentForTests();
  });
  afterEach(() => {
    clearFtueExperimentAssignmentForTests();
  });

  it("defaults to baseline control with exact FTUE_VERSION", () => {
    const a = resolveFtueExperimentAssignment({ forceRefresh: true });
    expect(a.ftue_version).toBe(FTUE_VERSION);
    expect(a.experiment_id).toBe("ftue_baseline_control");
    expect(a.variant).toBe("control");
  });

  it("analytics context always includes exact ftue_version", () => {
    const ctx = ftueExperimentAnalyticsContext();
    expect(ctx.ftue_version).toBe(FTUE_VERSION);
    expect(ctx.experiment_id).toBeTruthy();
    expect(ctx.experiment_variant).toBeTruthy();
  });

  it("registry includes baseline and draft example", () => {
    expect(getFtueExperiment("ftue_baseline_control")?.status).toBe("shipped");
    expect(getFtueExperiment("ashore_coach_density_v1")?.status).toBe("draft");
    expect(listFtueExperiments().length).toBeGreaterThanOrEqual(2);
  });
});
