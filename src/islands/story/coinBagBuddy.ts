/**
 * Coin Bag — lifelong journey buddy.
 * Stays beside the Voyager; tips say WHO to talk to and WHERE to go.
 * Never claims “I’m running ahead” — the bag points, you walk together.
 */

import {
  isHubGuidedComplete,
  normalizeHubGuidedIntro,
  type HubGuidedIntroState,
  type HubGuidedStepId,
} from "./storyBible";
import type { IslandDefinition, IslandSaveV1, QuestTrack } from "../types";
import { islandMainQuestsComplete, nextIncompleteObjective } from "../chapterLoop";
import { questTrack, trackCoachPrefix } from "../questTracks";
import { hasHarborFreedom } from "../progressGates";
import { isRoomUnlocked } from "../harborShop";
import { HUB_ISLAND_ID, isHubIslandId } from "../islandIds";

export type CoinBagBuddyTip = {
  /** Short line for 3D bubble / HUD */
  tip: string;
  /** Slightly longer coach line (optional HUD) */
  coach?: string;
  /** Main vs side when tip comes from a quest */
  track?: QuestTrack;
  /** Medium horizon — next painting / organ island */
  painting?: string | null;
  /** Long horizon — Freedom Seal / Spiral mastery */
  seal?: string | null;
};

/** Voyage tip — shared by to_dock + demoted legacy gate ids. */
const VOYAGE_TIP: CoinBagBuddyTip = {
  tip: "Money Carpet → Coincraft Cove",
  coach: "Board the carpet with me. First painting!",
};

const TUTORIAL_TIPS: Record<HubGuidedStepId, CoinBagBuddyTip> = {
  meet_guide: {
    tip: "Talk to Piggy Penny — soft gold ring by the fountain",
    coach: "I’m Coin Bag. Stay with me — we’ll walk to Piggy together.",
  },
  // DEMOTED — Ashore remaps these onto voyage; copy stays Outfitter-free.
  walk_outfitter: VOYAGE_TIP,
  become_you: VOYAGE_TIP,
  tiny_spend: VOYAGE_TIP,
  practice_optional: VOYAGE_TIP,
  to_dock: VOYAGE_TIP,
  first_island: VOYAGE_TIP,
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
    /** After Cove Change + Piggy welcome — name the next painting */
    nextPaintingHint?: string | null;
    /** Relationship strain tip when scars outpace homecomings */
    bondStrain?: boolean;
    /** Latest plaque label — Coin Bag points at memory */
    latestScarLabel?: string | null;
    /** After spectacle / share — walk the Plinth */
    plinthGlow?: boolean;
    /** Day-2 rumor still naming the scar */
    day2Echo?: boolean;
    /** Freedom Seal carpet tier label (plaza read) */
    carpetTierLabel?: string | null;
    /** Credit Kingdom unlock progress — plaza never silent-locks Spiral */
    creditMastery?: { mastery: number; needed: number; escaped: boolean; unlocked: boolean } | null;
    /** Soft Beat lookout arm whisper (multiplicative chemistry) */
    softBeatArmWhisper?: string | null;
    /** Incomplete digression rumor count for curiosity shelf */
    digressionGaps?: number | null;
  },
): CoinBagBuddyTip {
  const tip = coinBagHarborTipRaw(guided, opts);
  return attachCoinBagHorizons(tip, opts);
}

function coinBagHarborTipRaw(
  guided: HubGuidedIntroState | null | undefined,
  opts?: Parameters<typeof coinBagHarborTip>[1],
): CoinBagBuddyTip {
  if (guided && !isHubGuidedComplete(guided)) {
    const live = normalizeHubGuidedIntro(guided);
    return TUTORIAL_TIPS[live.step] ?? TUTORIAL_TIPS.meet_guide;
  }

  if (opts?.softBeatArmWhisper) {
    return {
      tip: opts.softBeatArmWhisper,
      coach: "Soft Beat armed your next Talk — organ chemistry, not a toast.",
    };
  }

  if (opts?.homecomingPending) {
    return {
      tip: "Piggy’s waiting by the fountain",
      coach:
        opts.homecomingMessage ||
        "You came home changed. Walk to her when you’re ready — no checklist.",
    };
  }

  if (opts?.bondStrain) {
    return {
      tip: "Piggy’s quiet — she still cares",
      coach: "Hard plaques sting. Walk to her. Repair is a money skill too.",
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
      coach: hasScarMemory(opts)
        ? `They’ll name “${opts.latestScarLabel}”. Locals are living receipts.`
        : `Locals know Harbor secrets. I’m listening too.`,
    };
  }

  if (opts?.plinthGlow && opts?.latestScarLabel) {
    return {
      tip: `Plinth glows — “${opts.latestScarLabel}”`,
      coach: "Harbor felt that. Share the card, then find Piggy — she’ll name what’s newly open on the Carpet.",
    };
  }

  if (opts?.day2Echo && opts?.latestScarLabel) {
    return {
      tip: `Locals still say “${opts.latestScarLabel}”`,
      coach: "Day two and the plaza remembers. Talk to Piggy or a local — they’re living receipts.",
    };
  }

  if (opts?.latestScarLabel) {
    return {
      tip: `Ask a local about “${opts.latestScarLabel}”`,
      coach: "Plaza folk name your plaque. Piggy too. Money is people here.",
    };
  }

  if (opts?.nextPaintingHint) {
    return {
      tip: `Next painting: ${opts.nextPaintingHint}`,
      coach: "Money Carpet opens the Archipelago map. I’ll hop with you.",
    };
  }

  const credit = opts?.creditMastery;
  if (credit && credit.escaped && !credit.unlocked) {
    return {
      tip: `Credit Kingdom · mastery ${credit.mastery}/${credit.needed}`,
      coach:
        "Spiral opens after Freedom plus three mastery clears. Clear Soft Beats / quizzes — then Interest Keep waits.",
      track: "main",
    };
  }
  if (credit && !credit.escaped && !opts?.nextPaintingHint) {
    return {
      tip: "Freedom Seal first — then Spiral",
      coach: "Credit Kingdom stays locked until Harbor escape. Finish Paycheck Change, come home.",
      track: "main",
    };
  }

  if (opts?.hasFreedom && opts?.pavilionUnlocked !== false) {
    const tier = opts.carpetTierLabel?.trim();
    return {
      tip: tier
        ? `Freedom Seal · ${tier} ready`
        : "Freedom Pavilion is open — this way!",
      coach: tier
        ? `Your seal unlocked the Pavilion — and the ${tier} on the Carpet. Let’s peek together.`
        : "Your seal unlocked a new wing. Let’s peek together.",
    };
  }
  if (opts?.hasFreedom) {
    const tier = opts.carpetTierLabel?.trim();
    return {
      tip: tier ? `Freedom Seal · sail the ${tier}` : "Map’s open — pick your next island",
      coach: "Freedom Seal earned. Carpet Dock is yours — where should we sail?",
    };
  }
  if (opts?.currentIslandId && !isHubIslandId(opts.currentIslandId)) {
    return {
      tip: "Resume your voyage when ready",
      coach: "Our island adventure is paused — resume anytime.",
    };
  }
  if (opts?.digressionGaps && opts.digressionGaps > 0 && opts.hasFreedom) {
    return {
      tip: `Plaza still holds ${opts.digressionGaps} unheard rumor${opts.digressionGaps === 1 ? "" : "s"}`,
      coach: "Side shores leave gossip footprints. Stray when you want — spine stays open.",
      track: "side",
    };
  }
  return {
    tip: "Ledger Bank — walk into the vault!",
    coach:
      "That brass bank is a money machine. Stamp and safe open arcade worlds; the teller is a quiet peek.",
  };
}

/** Attach Now · Painting · Seal horizons without stacking a dashboard. */
export function attachCoinBagHorizons(
  tip: CoinBagBuddyTip,
  opts?: Parameters<typeof coinBagHarborTip>[1],
): CoinBagBuddyTip {
  const painting =
    tip.painting ??
    (opts?.nextPaintingHint && !tip.tip.includes(opts.nextPaintingHint)
      ? opts.nextPaintingHint
      : null);
  const credit = opts?.creditMastery;
  let seal = tip.seal ?? null;
  if (!seal) {
    if (credit && credit.escaped && !credit.unlocked) {
      seal = `Spiral · mastery ${credit.mastery}/${credit.needed}`;
    } else if (opts?.hasFreedom) {
      seal = opts.carpetTierLabel?.trim()
        ? `Freedom · ${opts.carpetTierLabel.trim()}`
        : "Freedom Seal";
    } else if (credit && !credit.escaped) {
      seal = "Someday · Freedom Seal";
    }
  }
  return { ...tip, painting: painting || null, seal };
}

function hasScarMemory(opts?: { latestScarLabel?: string | null }): boolean {
  return Boolean(opts?.latestScarLabel);
}

/** Quest-aware tip while playing an island chapter / board. Prefers Main Quest. */
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
    if (save.chapterQuietPending) {
      return {
        tip: "Carpet home — Harbor felt that",
        coach:
          island.id === "coincraft_cove"
            ? "One verb left: board the Money Carpet. Piggy will feel the Take."
            : island.id === "paycheck_peninsula"
            ? "One verb left: carpet home. Harbor is listening for the Clock Take."
            : island.id === "credit_kingdom"
              ? "One verb left: carpet home. Interest stays quiet until Harbor."
              : "One verb left: carpet home — Harbor felt that.",
        track: "main",
      };
    }

    if (island.id === "paycheck_peninsula") {
      const rainy = save.questStatus["q_pp_rainy_day"];
      const basics = save.questStatus["q_pp_budget_basics"];
      const anyStarted = Object.values(save.questStatus ?? {}).some((q) => q?.started);
      if (!anyStarted) {
        return {
          tip: "Payroll Tower — climb the chute!",
          coach:
            "That glowing tower is a money machine. Bucket press and time clock open arcade worlds; umbrella loft is a quiet peek.",
          track: "main",
        };
      }
      if (rainy?.started && !rainy.completed) {
        const have = rainy.completedObjectives ?? [];
        if (!have.includes("talk:npc_coach_carlos")) {
          return {
            tip: "Rainy Day Park — Coach Carlos",
            coach: "Surprises love empty pouches. Carlos will set the challenge.",
            track: "main",
          };
        }
        if (!have.includes("talk:npc_vendor_vee") || !have.includes("item:pp_rainy_day_fund")) {
          return {
            tip: "Vendor Vee — fountain vs glitter",
            coach: "This is the Take. Umbrella before glitter, or glitter ate the umbrella. Harbor will remember.",
            track: "main",
          };
        }
      }
      if (basics?.started && !basics.completed) {
        return {
          tip: "Budget Bureau — needs, wants, savings",
          coach: "Paycheck runs on buckets. Priya's whiteboard is waiting.",
          track: "main",
        };
      }
      if (!basics?.started) {
        return {
          tip: "Main Street — Payroll Pat has your check",
          coach: "First paycheck energy! Grab it, then we plan — not panic.",
          track: "main",
        };
      }
    }

    if (island.id === "credit_kingdom") {
      const anyStarted = Object.values(save.questStatus ?? {}).some((q) => q?.started);
      if (!anyStarted) {
        return {
          tip: "Interest Keep — spiral the gate!",
          coach:
            "That ruined keep is a money machine. Anvil and dispatch open arcade worlds; battlement is a quiet peek.",
          track: "main",
        };
      }
    }

    if (island.id === "coincraft_cove") {
      const anyStarted = Object.values(save.questStatus ?? {}).some((q) => q?.started);
      if (!anyStarted) {
        return {
          tip: "Captain Penny — First Coins",
          coach:
            "Talk to Captain Penny at the harbor. Earn fair coins, then the Giant Coin Jar Take waits.",
          track: "main",
        };
      }
    }

    const next = nextIncompleteObjective(island, save, { preferTrack: "main" });
    if (next) {
      const title =
        typeof next.questTitle === "string"
          ? next.questTitle
          : next.questTitle.apprentice || next.questTitle.explorer || "quest";
      return {
        tip: next.label,
        coach: `${trackCoachPrefix(next.track)} “${title}” — I’m pointing the next step.`,
        track: next.track,
      };
    }
    if (islandMainQuestsComplete(island, save)) {
      const sideLeft = island.quests.some(
        (q) => questTrack(q) === "side" && !save.questStatus[q.id]?.completed,
      );
      if (sideLeft) {
        return {
          tip: `Main clear on ${name} — try a side quest, or fly home`,
          coach: "Story Circle beat done. Side quests are optional tomfoolery — or Harbor will notice.",
          track: "side",
        };
      }
      return {
        tip: `Chapter clear on ${name} — fly home`,
        coach: "Harbor will notice. Money Carpet / Hub when you’re ready.",
        track: "main",
      };
    }
  }

  if (!save.hubGuidedIntro || !isHubGuidedComplete(save.hubGuidedIntro)) {
    return {
      tip: `Learn the ropes on ${name}`,
      coach: "Talk, earn, choose — then we go home changed.",
      track: "main",
    };
  }
  return {
    tip: `Keep going on ${name}`,
    coach: "I’m beside you. Finish the Main Quest, then Harbor will notice.",
    track: "main",
  };
}

/** Convenience for Harbor post-freedom pavilion pointing. */
export function coinBagShouldPointPavilion(save: IslandSaveV1): boolean {
  return hasHarborFreedom(save) && isRoomUnlocked(save, "pavilion");
}

export function coinBagHubId(): string {
  return HUB_ISLAND_ID;
}
