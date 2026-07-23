/**
 * Progression gates that keep Harbor → eras → boss coherent.
 * Original Capital IP — no franchise locks.
 */

import type { IslandDefinition, IslandSaveV1 } from "./types";
import { ensureLedger } from "./voyagerLedger";
import { hasCompletedCoveChange } from "./chapterLoop";
import {
  HUB_ISLAND_ID,
  isHubIslandId,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";

/** Inventory flag granted on Harbor escape — also used for carpet/plaza rewards */
export const HARBOR_FREEDOM_ITEM = "harbor_freedom_seal";

/** Boss island — locked until Harbor escape + enough mastery clears */
export const BOSS_ISLAND_ID = "credit_kingdom";

/** How many all-correct mastery gates needed to open the boss island */
export const BOSS_MASTERY_REQUIRED = 3;

/** Plaza free-roam rooms on Harbor Haven */
export type PlazaRoomId = "plaza" | "market" | "dock" | "pavilion";

export const PLAZA_ROOMS: Array<{
  id: PlazaRoomId;
  label: string;
  icon: string;
  blurb: string;
  /** Requires Harbor escape */
  requiresFreedom?: boolean;
}> = [
  {
    id: "plaza",
    label: "Main Plaza",
    icon: "🏛️",
    blurb: "Outfitter, Arcade, Capsules — your Harbor Haven hub street.",
  },
  {
    id: "market",
    label: "Pasaran Lane",
    icon: "🧺",
    blurb: "A lively market lane — fair trade practice plus money-culture locals with safe pop winks.",
  },
  {
    id: "dock",
    label: "Carpet Dock",
    icon: "🪄",
    blurb: "Where your money magic carpet waits to float between islands.",
  },
  {
    id: "pavilion",
    label: "Freedom Pavilion",
    icon: "🏆",
    blurb: "Unlocked when you escape paycheck-to-paycheck — carpet upgrades live here.",
    requiresFreedom: true,
  },
];

export function hasHarborFreedom(save: IslandSaveV1): boolean {
  const ledger = ensureLedger(save.voyagerLedger);
  return ledger.harborEscaped || save.inventory.includes(HARBOR_FREEDOM_ITEM);
}

export function bossUnlockProgress(save: IslandSaveV1): {
  escaped: boolean;
  mastery: number;
  needed: number;
  unlocked: boolean;
} {
  const ledger = ensureLedger(save.voyagerLedger);
  const mastery = ledger.masteryClears.length;
  const escaped = hasHarborFreedom(save);
  return {
    escaped,
    mastery,
    needed: BOSS_MASTERY_REQUIRED,
    unlocked: escaped && mastery >= BOSS_MASTERY_REQUIRED,
  };
}

/**
 * Island lock check — inventory keys + boss progression + Island 2 after Cove Change.
 * Hub is never locked.
 */
export function isIslandProgressLocked(island: IslandDefinition, save: IslandSaveV1): boolean {
  if (isHubIslandId(island.id)) return false;

  const missingItems = (island.requiredItems || []).some((id) => !save.inventory.includes(id));
  if (missingItems) return true;

  // Island 2 opens after Cove “save or spend” Change beat.
  if (island.id === PAYCHECK_PENINSULA_ID && !hasCompletedCoveChange(save)) {
    return true;
  }

  if (island.id === BOSS_ISLAND_ID) {
    return !bossUnlockProgress(save).unlocked;
  }

  return false;
}

/** Grant freedom rewards once when escape first triggers */
export function withHarborFreedomRewards(save: IslandSaveV1): IslandSaveV1 {
  if (!ensureLedger(save.voyagerLedger).harborEscaped) return save;
  if (save.inventory.includes(HARBOR_FREEDOM_ITEM)) return save;
  return {
    ...save,
    inventory: [...save.inventory, HARBOR_FREEDOM_ITEM],
    harborHomecoming: {
      ...(save.harborHomecoming ?? {}),
      pending: true,
      chapterIslandId: HUB_ISLAND_ID,
      questId: "harbor_freedom",
      message: "Freedom seal earned — visit the Freedom Pavilion!",
    },
  };
}
