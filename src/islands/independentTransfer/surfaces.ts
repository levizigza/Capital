/**
 * Live Independent Transfer surfaces on the iconic spine.
 * Training happens once (Cove). The analogous problem must not re-teach the mapping.
 * Design: docs/ftue/NORTH_STAR.md · docs/ftue/TRANSFER_TASKS.md
 */

import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";

export type SpineTransferSurface = {
  concept_id: string;
  scenarioId: string;
  /** Island where the unguided analogous problem lives */
  islandId: string;
  /** Irreversible Take that proves transfer */
  irreversibleKey: string;
  /** Training proof that must already exist */
  taughtByKey: string;
  taughtOnIslandId: string;
};

export const SPINE_TRANSFER_SURFACES: readonly SpineTransferSurface[] = [
  {
    concept_id: "save_vs_spend",
    scenarioId: "ts_save_spend_pp_umbrella",
    islandId: PAYCHECK_PENINSULA_ID,
    irreversibleKey: "paycheck_protect_vs_spend",
    taughtByKey: "cove_save_vs_spend",
    taughtOnIslandId: COVE_ISLAND_ID,
  },
  {
    concept_id: "money_is_alive",
    scenarioId: "ts_money_alive_pp_take",
    islandId: PAYCHECK_PENINSULA_ID,
    irreversibleKey: "paycheck_protect_vs_spend",
    taughtByKey: "cove_save_vs_spend",
    taughtOnIslandId: COVE_ISLAND_ID,
  },
  {
    concept_id: "irreversible_take",
    scenarioId: "ts_irreversible_credit",
    islandId: CREDIT_KINGDOM_ID,
    irreversibleKey: "credit_borrow_vs_wait",
    taughtByKey: "cove_save_vs_spend",
    taughtOnIslandId: COVE_ISLAND_ID,
  },
  {
    concept_id: "protect_vs_spend",
    scenarioId: "ts_protect_spend_pp",
    islandId: CREDIT_KINGDOM_ID,
    irreversibleKey: "credit_borrow_vs_wait",
    taughtByKey: "paycheck_protect_vs_spend",
    taughtOnIslandId: PAYCHECK_PENINSULA_ID,
  },
];

export function transferSurfacesOnIsland(islandId: string): SpineTransferSurface[] {
  return SPINE_TRANSFER_SURFACES.filter((s) => s.islandId === islandId);
}
