/**
 * Coin Bag — lifelong journey buddy.
 * Stays beside the Voyager; tips say WHO to talk to and WHERE to go.
 * Never claims “I’m running ahead” — the bag points, you walk together.
 */

import type { HubGuidedStepId } from "./storyBible";
import { isHubGuidedComplete, type HubGuidedIntroState } from "./storyBible";
import type { IslandDefinition, IslandSaveV1 } from "../types";
import { nextIncompleteObjective } from "../chapterLoop";
import { hasHarborFreedom } from "../progressGates";
import { isRoomUnlocked } from "../harborShop";
import { HUB_ISLAND_ID, isHubIslandId } from "../islandIds";

export type CoinBagBuddyTip = {
  /** Short line for 3D bubble / HUD */
  tip: string;
  /** Slightly longer coach line (optional HUD) */
  coach?: string;
};

const TUTORIAL_TIPS: Record<HubGuidedStepId, CoinBagBuddyTip> = {
  meet_guide: {
    tip: "Talk to Piggy Penny — she’s waving!",
    coach: "I’m Coin Bag. Stay with me — we’ll walk to Piggy together.",
  },
  walk_outfitter: {
    tip: "Next stop: the Outfitter door",
    coach: "Piggy said become YOU. I’ll point at the Outfitter — walk that way.",
  },
  become_you: {
    tip: "Go inside the Outfitter",
    coach: "Body · Coat · Gear on the mirror. I’ll wait right here with you.",
  },
  tiny_spend: {
    tip: "Visit Capsule Stall with me",
    coach: "Coins can buy help. Peek the stall — Piggy will nod.",
  },
  practice_optional: {
    tip: "Practice board, or skip to the dock",
    coach: "Your call. I’ll point at practice — or we head to the carpet.",
  },
  to_dock: {
    tip: "Carpet Dock this way",
    coach: "The Fortune Thread starts at the dock. Stick with me.",
  },
  first_island: {
    tip: "Open the map → Coincraft Cove",
    coach: "First painting! I’ll be with you on every island.",
  },
  done: {
    tip: "Harbor is yours — I’m still here",
    coach: "Whenever you’re stuck, look at me. I’ll point the next good step.",
  },
};

/** Post-tutorial Harbor tips from save state. */
export function coinBagHarborTip(
  guided: HubGuidedIntroState | null | undefined,
  opts?: {
    nearStoreLabel?: string | null;
    nearNpcName?: string | null;
    hasFreedom?: boolean;
    currentIslandId?: string | null;
    homecomingPending?: boolean;
    homecomingMessage?: string | null;
    pavilionUnlocked?: boolean;
  },
): CoinBagBuddyTip {
  if (guided && !isHubGuidedComplete(guided)) {
    return TUTORIAL_TIPS[guided.step] ?? TUTORIAL_TIPS.meet_guide;
  }

  if (opts?.homecomingPending) {
    return {
      tip: opts.homecomingMessage || "Talk to Piggy — she noticed!",
      coach: "You came home changed. Piggy has a welcome-back for you.",
    };
  }

  if (opts?.nearStoreLabel) {
    return {
      tip: `Enter ${opts.nearStoreLabel}`,
      coach: `Door’s close — press Enter. I’ve got your back.`,
    };
  }
  if (opts?.nearNpcName) {
    return {
      tip: `Hear ${opts.nearNpcName} out`,
      coach: `Locals know Harbor secrets. I’m listening too.`,
    };
  }
  if (opts?.hasFreedom && opts?.pavilionUnlocked !== false) {
    return {
      tip: "Freedom Pavilion is open — this way!",
      coach: "Your seal unlocked a new wing. Let’s peek together.",
    };
  }
  if (opts?.hasFreedom) {
    return {
      tip: "Map’s open — pick your next island",
      coach: "Freedom seal earned. Where should we sail?",
    };
  }
  if (opts?.currentIslandId && !isHubIslandId(opts.currentIslandId)) {
    return {
      tip: "Resume your voyage when ready",
      coach: "Our island adventure is paused — resume anytime.",
    };
  }
  return {
    tip: "Explore Harbor — or open the map",
    coach: "I’m your buddy for the whole journey. Ask Piggy, shop, or sail.",
  };
}

/** Quest-aware tip while playing an island chapter / board. */
export function coinBagIslandTip(
  save: IslandSaveV1,
  island?: IslandDefinition | string | null,
): CoinBagBuddyTip {
  const name =
    typeof island === "string"
      ? island
      : island && typeof island === "object"
        ? island.name
        : "this island";

  if (island && typeof island === "object") {
    const next = nextIncompleteObjective(island, save);
    if (next) {
      return {
        tip: next.label,
        coach: `Quest “${next.questTitle}” — I’m pointing the next step.`,
      };
    }
    if (island.quests.some((q) => save.questStatus[q.id]?.completed)) {
      return {
        tip: `Chapter clear on ${name} — fly home`,
        coach: "Harbor will notice. Carpet Dock / Hub when you’re ready.",
      };
    }
  }

  if (!save.hubGuidedIntro || !isHubGuidedComplete(save.hubGuidedIntro)) {
    return {
      tip: `Learn the ropes on ${name}`,
      coach: "Talk, earn, choose — then we go home changed.",
    };
  }
  return {
    tip: `Keep going on ${name}`,
    coach: "I’m beside you. Finish the chapter, then Harbor will notice.",
  };
}

/** Convenience for Harbor post-freedom pavilion pointing. */
export function coinBagShouldPointPavilion(save: IslandSaveV1): boolean {
  return hasHarborFreedom(save) && isRoomUnlocked(save, "pavilion");
}

export function coinBagHubId(): string {
  return HUB_ISLAND_ID;
}
