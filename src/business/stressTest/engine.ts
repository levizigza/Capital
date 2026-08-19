/**
 * Business Stress-Test Engine.
 */

import { computeAllImpacts } from "./impact";
import { assertCoreCutGuard, generateStressResponses } from "./responses";
import { StressTestError, validateBaseline } from "./validate";
import type { StressBaselineInputs, StressTestReport } from "./types";

export type RunStressTestOptions = {
  include_indiscriminate_core_cut_attempt?: boolean;
  core_cut_with_consequences?: {
    title: string;
    rationale: string;
    long_term_consequences: string;
  } | null;
};

export function runStressTest(
  baseline: StressBaselineInputs,
  opts: RunStressTestOptions = {},
): StressTestReport {
  const v = validateBaseline(baseline);
  if (!v.ok) {
    throw new StressTestError(v.issues.map((i) => i.message).join("; "), v.issues);
  }

  const impacts = computeAllImpacts(baseline);
  const responses = generateStressResponses(impacts, opts);
  assertCoreCutGuard(responses);

  return {
    schema_version: "1",
    policy: "no_indiscriminate_core_product_cuts",
    baseline: structuredClone(baseline),
    impacts,
    responses,
    generated_at: new Date().toISOString(),
  };
}

export class BusinessStressTestEngine {
  run(baseline: StressBaselineInputs, opts?: RunStressTestOptions): StressTestReport {
    return runStressTest(baseline, opts);
  }
}
