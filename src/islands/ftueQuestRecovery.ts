/**
 * FTUE quest recovery — proof-based backfill for out-of-order player paths.
 * Never rewinds choices or forces Alma-before-Kira; completes quests from evidence.
 * Design: docs/ftue/FTUE_RED_TEAM.md
 */

import { objectiveKey, hasCompletedCoveChange } from "./chapterLoop";
import {
  COVE_CHANGE_QUEST_ID,
  COVE_ISLAND_ID,
} from "./islandIds";
import { COVE_TAKE_KEY } from "./firstFinancialScenario";
import type { IslandSaveV1, QuestObjective } from "./types";
import { nextPaintingAfterScar, plaqueShelfLine, type HarborScar } from "./worldMemory";

const COVE_CHANGE_OBJECTIVES: QuestObjective[] = [
  { type: "talkToNpc", npcId: "npc_artisan_alma" },
  { type: "talkToNpc", npcId: "npc_keeper_kira" },
  { type: "collectItem", itemId: "cc_savings_jar" },
];

const COVE_CHANGE_KEYS = COVE_CHANGE_OBJECTIVES.map(objectiveKey);

function coveTakeProof(save: IslandSaveV1): boolean {
  return Boolean(save.irreversibleChoices?.[COVE_TAKE_KEY]);
}

function latestCoveScar(save: IslandSaveV1): HarborScar | undefined {
  const scars = save.harborScars ?? [];
  for (let i = scars.length - 1; i >= 0; i--) {
    if (scars[i]!.islandId === COVE_ISLAND_ID) return scars[i];
  }
  return undefined;
}

/**
 * Backfill Cove Change objectives from Take proof — valid when player skipped Alma
 * or never started the quest before committing Kira's irreversible Take.
 */
export function backfillCoveChangeObjectives(save: IslandSaveV1): IslandSaveV1 {
  if (!coveTakeProof(save)) return save;

  const questId = COVE_CHANGE_QUEST_ID;
  const existing = save.questStatus[questId];
  if (existing?.completed) return save;

  const takeAt = save.irreversibleChoices![COVE_TAKE_KEY]!.at;
  let status = existing;
  if (!status?.started) {
    status = {
      started: true,
      completed: false,
      completedObjectives: [],
      startedAt: takeAt,
    };
  }

  const backfill = new Set(status.completedObjectives ?? []);
  backfill.add(objectiveKey({ type: "talkToNpc", npcId: "npc_keeper_kira" }));
  if (save.inventory.includes("cc_savings_jar") || coveTakeProof(save)) {
    backfill.add(objectiveKey({ type: "collectItem", itemId: "cc_savings_jar" }));
  }
  // Take proof waives Alma gate — out-of-order Kira-first is valid.
  backfill.add(objectiveKey({ type: "talkToNpc", npcId: "npc_artisan_alma" }));

  return {
    ...save,
    questStatus: {
      ...save.questStatus,
      [questId]: {
        ...status,
        completedObjectives: COVE_CHANGE_KEYS.filter((k) => backfill.has(k)),
      },
    },
  };
}

/** True when backfill satisfies every objective but quest is not marked complete yet. */
export function coveChangeReadyToComplete(save: IslandSaveV1): boolean {
  const status = save.questStatus[COVE_CHANGE_QUEST_ID];
  if (!status?.started || status.completed) return false;
  const have = new Set(status.completedObjectives ?? []);
  return COVE_CHANGE_KEYS.every((k) => have.has(k));
}

/**
 * Repair homecoming when Cove Change completed (or completable) but celebration never armed —
 * e.g. save/load after out-of-order Take before maybeCompleteQuest ran.
 */
export function reconcileCoveHomecoming(save: IslandSaveV1): IslandSaveV1 {
  if (!hasCompletedCoveChange(save)) return save;
  const hc = save.harborHomecoming;
  if (hc?.pending || hc?.celebrated) return save;

  const lastScar = latestCoveScar(save) ?? (save.harborScars ?? []).at(-1);
  if (!lastScar) return save;

  const scarBit = plaqueShelfLine(lastScar);
  const next = nextPaintingAfterScar(lastScar) ?? "Paycheck Peninsula";

  return {
    ...save,
    harborHomecoming: {
      pending: true,
      celebrated: false,
      piggyTalked: false,
      quietPending: true,
      chapterIslandId: COVE_ISLAND_ID,
      questId: COVE_CHANGE_QUEST_ID,
      message: `Piggy Penny: The Coin holds — save a little; the jar still waits. ${scarBit}. ${next} is newly open on the Carpet.`,
    },
  };
}

/** Run all proof-based FTUE quest repairs (pure — safe every save tick). */
export function reconcileFtueQuestProofs(save: IslandSaveV1): IslandSaveV1 {
  let next = backfillCoveChangeObjectives(save);
  next = reconcileCoveHomecoming(next);
  return next;
}
