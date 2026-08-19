/**
 * Progression gates that keep Harbor → eras → boss coherent.
 * Original Capital IP — no franchise locks.
 */

import type { IslandDefinition, IslandSaveV1 } from "./types";
import { ensureLedger } from "./voyagerLedger";
import { hasCompletedCoveChange, hasCompletedPaycheckChange } from "./chapterLoop";
import {
  HUB_ISLAND_ID,
  isHubIslandId,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";
import { isSideShoreTravelId } from "./spineArchipelago";

/** Inventory flag granted on Harbor escape — also used for carpet/plaza rewards */
export const HARBOR_FREEDOM_ITEM = "harbor_freedom_seal";

/** Boss island — locked until Freedom Seal + Paycheck Change (transfer proof). */
export const BOSS_ISLAND_ID = "credit_kingdom";

/**
 * @deprecated Quiz clears no longer gate Credit. Kept for digression / analytics only.
 * Prefer Freedom + Paycheck Change (independent transfer surface).
 */
export const BOSS_MASTERY_REQUIRED = 0;

/**
 * Playtest: open every island so shores can be cold-checked for playability.
 * Flip to `false` before shipping gated progression again.
 */
export const PLAYTEST_UNLOCK_ALL_ISLANDS = false;

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
  /** True when Paycheck Change completed — Independent Transfer surface passed. */
  transferProof: boolean;
  mastery: number;
  needed: number;
  unlocked: boolean;
} {
  const ledger = ensureLedger(save.voyagerLedger);
  const mastery = ledger.masteryClears.length;
  const escaped = hasHarborFreedom(save);
  const transferProof = hasCompletedPaycheckChange(save);
  return {
    escaped,
    transferProof,
    mastery,
    needed: BOSS_MASTERY_REQUIRED,
    // Literacy is gameplay: Freedom (sim) + Paycheck Change (transfer), not quiz count.
    unlocked: PLAYTEST_UNLOCK_ALL_ISLANDS || (escaped && transferProof),
  };
}

/**
 * Island lock check — inventory keys + boss progression + Island 2 after Cove Change.
 * Hub is never locked.
 */
export function isIslandProgressLocked(island: IslandDefinition, save: IslandSaveV1): boolean {
  if (isHubIslandId(island.id)) return false;
  if (PLAYTEST_UNLOCK_ALL_ISLANDS) return false;

  const missingItems = (island.requiredItems || []).some((id) => !save.inventory.includes(id));
  if (missingItems) return true;

  // Paycheck opens after Cove Change — transfer test assumes Coin Hold first.
  if (island.id === PAYCHECK_PENINSULA_ID && !hasCompletedCoveChange(save)) {
    return true;
  }

  // Era side shores after Paycheck Change — do not compete with Clock transfer.
  if (isSideShoreTravelId(island.id) && !hasCompletedPaycheckChange(save)) {
    return true;
  }

  if (island.id === BOSS_ISLAND_ID) {
    return !bossUnlockProgress(save).unlocked;
  }

  return false;
}

/** Short player-facing reason an island chip is locked */
export function islandLockHint(island: IslandDefinition, save: IslandSaveV1): string | null {
  if (!isIslandProgressLocked(island, save)) return null;
  if ((island.requiredItems || []).some((id) => !save.inventory.includes(id))) {
    return "Need a key item";
  }
  if (island.id === PAYCHECK_PENINSULA_ID && !hasCompletedCoveChange(save)) {
    return "Finish Cove Change — then Clock opens on Paycheck";
  }
  if (isSideShoreTravelId(island.id) && !hasCompletedPaycheckChange(save)) {
    return "Finish Paycheck Change — then outer-ring shores open";
  }
  if (island.id === BOSS_ISLAND_ID) {
    const prog = bossUnlockProgress(save);
    if (!prog.escaped) {
      return "Clock Pay Days can earn Freedom — then Spiral can open";
    }
    if (!prog.transferProof) {
      return "Finish Paycheck Change — then Spiral opens";
    }
    return "Spiral locked";
  }
  return "Locked";
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
      message:
        "Clock Pay Days earned Freedom — the Pavilion opens. Credit Kingdom still waits on Spiral.",
    },
  };
}
