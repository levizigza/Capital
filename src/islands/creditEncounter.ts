/**
 * Pillar 6 — Credit canyon encounter routing.
 * Spiral skill tests: Inbox → Score Scanner → earned wait/haste Take.
 */

import { hasIrreversible } from "./worldMemory";
import type { IslandSaveV1 } from "./types";

export const CREDIT_REX_GRAPH_ID = "dlg_collector_rex";
export const CREDIT_SIGNAL_MINIGAME_ID = "mg_ck_signal";
export const CREDIT_ORDEAL_KEY = "credit_borrow_vs_wait";

/** Where Rex’s Talk Battle should open based on canyon progress. */
export function creditRexStartNodeId(save: IslandSaveV1 | null | undefined): string {
  if (!save) return "r1";
  if (hasIrreversible(save, CREDIT_ORDEAL_KEY)) return "r_remember";
  if ((save.completedMinigames ?? []).includes(CREDIT_SIGNAL_MINIGAME_ID)) return "r_fork";
  return "r1";
}
