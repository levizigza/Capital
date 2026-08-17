/**
 * Transfer task metrics — record guided vs transfer outcomes per concept_id.
 * Design: docs/ftue/TRANSFER_TASKS.md
 */

import type { IslandSaveV1 } from "../types";
import { buildConceptEvidence } from "./evidence";
import { evalPredicate } from "./predicates";
import { normalizeConceptProgress } from "./normalize";
import { listConceptIds } from "./registry";
import {
  getPrimaryTransferScenario,
  getTransferScenario,
  TRANSFER_SCENARIOS,
  type TransferScenarioDef,
} from "./transferTasks";
import type { ConceptRuntimeEntry, ConceptTransferMetrics } from "./types";

export type { ConceptTransferMetrics };

export function inferTransferStrategy(
  save: IslandSaveV1,
  scenario: TransferScenarioDef,
): string | undefined {
  const irr = save.irreversibleChoices ?? {};
  switch (scenario.concept_id) {
    case "save_vs_spend":
      return (
        irr.paycheck_protect_vs_spend?.choiceId ??
        irr.cove_save_vs_spend?.choiceId
      );
    case "protect_vs_spend":
      return irr.paycheck_protect_vs_spend?.choiceId;
    case "wait_vs_borrow":
    case "patience_vs_haste":
    case "debt":
    case "interest_compounds":
      return irr.credit_borrow_vs_wait?.choiceId;
    case "irreversible_take":
      if (irr.credit_borrow_vs_wait) return irr.credit_borrow_vs_wait.choiceId;
      if (irr.paycheck_protect_vs_spend) return irr.paycheck_protect_vs_spend.choiceId;
      return irr.cove_save_vs_spend?.choiceId;
    default:
      return undefined;
  }
}

export function exportConceptTransferMetrics(
  entry: ConceptRuntimeEntry,
  conceptId: string,
  save?: IslandSaveV1,
): ConceptTransferMetrics {
  const scenario = getPrimaryTransferScenario(conceptId);
  const pass = scenario ? save?.conceptTransferPasses?.[scenario.scenarioId] : undefined;
  const transferOk = entry.transferSuccess ?? Boolean(pass);
  return {
    concept_id: conceptId,
    guided_success: entry.guidedSuccess ?? false,
    guided_attempts: entry.guidedAttempts ?? entry.attempts,
    hints_used: entry.hintsUsed,
    transfer_success: transferOk,
    transfer_attempts: entry.transferAttempts ?? pass?.attempts ?? 0,
    transfer_time: entry.transferTimeMs ?? pass?.durationMs,
    strategy_selected: entry.strategySelected ?? pass?.strategy,
  };
}

/** Begin transfer window — call when entering REDUCED_GUIDANCE or first transfer try. */
export function noteTransferAttempt(
  save: IslandSaveV1,
  conceptId: string,
  now = new Date().toISOString(),
): IslandSaveV1 {
  const known = new Set(listConceptIds());
  const progress = normalizeConceptProgress(save.conceptProgress, known, now);
  const entry = progress.concepts[conceptId];
  if (!entry) return save;
  const scenario = getPrimaryTransferScenario(conceptId);
  const next: ConceptRuntimeEntry = {
    ...entry,
    transferAttempts: (entry.transferAttempts ?? 0) + 1,
    transferStartedAt: entry.transferStartedAt ?? now,
    transferScenarioId: scenario?.scenarioId,
    lastTransitionAt: now,
  };
  return {
    ...save,
    conceptProgress: {
      ...progress,
      concepts: { ...progress.concepts, [conceptId]: next },
    },
  };
}

/** Sync scenario passes from evidence; stamp strategy + duration on first pass. */
export function syncConceptTransferPasses(
  save: IslandSaveV1,
  now = new Date().toISOString(),
): IslandSaveV1 {
  const evidence = buildConceptEvidence(save);
  const passes = { ...(save.conceptTransferPasses ?? {}) };
  let changed = false;

  for (const scenario of TRANSFER_SCENARIOS) {
    if (passes[scenario.scenarioId]) continue;
    if (!evalPredicate(scenario.success_predicate, evidence)) continue;
    const strategy = inferTransferStrategy(save, scenario) ?? undefined;
    passes[scenario.scenarioId] = {
      passedAt: now,
      attempts: 1,
      strategy,
    };
    changed = true;
  }

  if (!changed) return save;
  return { ...save, conceptTransferPasses: passes, updatedAt: save.updatedAt };
}

export function hasTransferScenarioPassed(save: IslandSaveV1, scenarioId: string): boolean {
  return Boolean(save.conceptTransferPasses?.[scenarioId]);
}

export function finalizeTransferMetricsOnIndependent(
  entry: ConceptRuntimeEntry,
  save: IslandSaveV1,
  conceptId: string,
  now: string,
): ConceptRuntimeEntry {
  const scenario = getPrimaryTransferScenario(conceptId);
  if (!scenario) return entry;
  const pass = save.conceptTransferPasses?.[scenario.scenarioId];
  if (!pass) return entry;
  const started = entry.transferStartedAt ? Date.parse(entry.transferStartedAt) : NaN;
  const durationMs =
    Number.isFinite(started) && started > 0
      ? Math.max(0, Date.parse(now) - started)
      : undefined;
  return {
    ...entry,
    transferSuccess: true,
    transferTimeMs: durationMs ?? pass.durationMs,
    strategySelected: pass.strategy ?? entry.strategySelected,
    transferScenarioId: scenario.scenarioId,
  };
}

export function finalizeGuidedMetricsOnReduced(
  entry: ConceptRuntimeEntry,
  now: string,
): ConceptRuntimeEntry {
  return {
    ...entry,
    guidedSuccess: true,
    guidedAttempts: entry.attempts,
    transferStartedAt: entry.transferStartedAt ?? now,
    transferAttempts: entry.transferAttempts ?? 0,
  };
}

export function getTransferScenarioForConcept(conceptId: string): TransferScenarioDef | undefined {
  return getPrimaryTransferScenario(conceptId);
}

export function getTransferScenarioById(scenarioId: string): TransferScenarioDef | undefined {
  return getTransferScenario(scenarioId);
}
