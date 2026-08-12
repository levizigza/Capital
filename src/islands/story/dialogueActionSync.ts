/**
 * Dialogue ↔ action sync for Harbor.
 * Law: never claim an emote/action in copy unless the 3D world performs it.
 */

export type NpcEmote = "idle" | "wave" | "talk" | "nod" | "cheer" | "point";

export type GuidedVisualBeats = {
  /** Piggy Penny (Harbor Keeper) body language */
  keeperEmote: NpcEmote;
  /** Shown above Piggy when player is near her */
  keeperBubbleWhenNear: string;
  /** Coin Bag billboard tip — must match hop target */
  bagTip: string;
  /** Hotspot that should pulse / glow */
  pulseHotspot?:
    | "outfitter"
    | "capsule"
    | "travel"
    | "arcade"
    | "practice"
    | "guide"
    | "market"
    | "memory";
};

/** Map guided step id → what the player must SEE. */
export const GUIDED_VISUAL_BEATS: Record<string, GuidedVisualBeats> = {
  meet_guide: {
    keeperEmote: "wave",
    keeperBubbleWhenNear: "Piggy Penny: Want to talk? Press E when you’re ready.",
    bagTip: "Piggy’s waving by the fountain — walk over when you want",
    pulseHotspot: "guide",
  },
  // DEMOTED legacy gates — Ashore remaps onto voyage; beats stay Outfitter-free.
  walk_outfitter: {
    keeperEmote: "point",
    keeperBubbleWhenNear:
      "Piggy Penny: Coin Bag points at the Money Carpet — Coincraft Cove is waiting!",
    bagTip: "Money Carpet → Coincraft Cove",
    pulseHotspot: "travel",
  },
  become_you: {
    keeperEmote: "point",
    keeperBubbleWhenNear:
      "Piggy Penny: Coin Bag points at the Money Carpet — Coincraft Cove is waiting!",
    bagTip: "Money Carpet → Coincraft Cove",
    pulseHotspot: "travel",
  },
  tiny_spend: {
    keeperEmote: "point",
    keeperBubbleWhenNear:
      "Piggy Penny: Coin Bag points at the Money Carpet — Coincraft Cove is waiting!",
    bagTip: "Money Carpet → Coincraft Cove",
    pulseHotspot: "travel",
  },
  practice_optional: {
    keeperEmote: "point",
    keeperBubbleWhenNear:
      "Piggy Penny: Coin Bag points at the Money Carpet — Coincraft Cove is waiting!",
    bagTip: "Money Carpet → Coincraft Cove",
    pulseHotspot: "travel",
  },
  to_dock: {
    keeperEmote: "point",
    keeperBubbleWhenNear:
      "Piggy Penny: Coin Bag points at the Money Carpet — Coincraft Cove is waiting!",
    bagTip: "Money Carpet → Coincraft Cove",
    pulseHotspot: "travel",
  },
  first_island: {
    keeperEmote: "point",
    keeperBubbleWhenNear:
      "Piggy Penny: Coin Bag points at the Money Carpet — Coincraft Cove is waiting!",
    bagTip: "Money Carpet → Coincraft Cove",
    pulseHotspot: "travel",
  },
  done: {
    keeperEmote: "wave",
    keeperBubbleWhenNear: "Piggy Penny: Harbor is yours. Coin Bag stays your buddy — I’ll wave when you come home.",
    bagTip: "I’m still with you!",
  },
};

/** Harbor welcome-back after a chapter Change (e.g. Cove save-or-spend). */
export const HOMECOMING_VISUAL_BEATS: GuidedVisualBeats = {
  keeperEmote: "cheer",
  keeperBubbleWhenNear:
    "Piggy Penny: You came home different. I’m here by the fountain — when you’re ready.",
  // Presence, not a checklist objective strip.
  bagTip: "Piggy’s waiting by the fountain",
  pulseHotspot: "guide",
};

/** After Piggy’s welcome-back — point the next spine painting (era shores stay map-only). */
export function postHomecomingVisualBeats(nextPainting: string): GuidedVisualBeats {
  const short =
    nextPainting === "Paycheck Peninsula"
      ? "Paycheck"
      : nextPainting === "Credit Kingdom"
        ? "Credit"
        : nextPainting;
  return {
    keeperEmote: "point",
    keeperBubbleWhenNear: `Piggy Penny: Carpet Dock that way — ${short} is next.`,
    bagTip: `Carpet → ${short}`,
    pulseHotspot: "travel",
  };
}

/** @deprecated Prefer postHomecomingVisualBeats(nextPainting) — Cove→Paycheck default. */
export const POST_HOMECOMING_VISUAL_BEATS: GuidedVisualBeats =
  postHomecomingVisualBeats("Paycheck Peninsula");

/** Plaza reacts when a new scar lands — money is alive. */
export const SCAR_SPECTACLE_VISUAL_BEATS: GuidedVisualBeats = {
  keeperEmote: "cheer",
  keeperBubbleWhenNear: "Piggy Penny: Harbor felt that! The Memory Plinth is glowing!",
  bagTip: "Memory Plinth — it’s glowing!",
  pulseHotspot: "memory",
};

/** Brief afterglow — keep the Plinth pulsing so the glow claim is true. */
export const PLINTH_GLOW_VISUAL_BEATS: GuidedVisualBeats = {
  keeperEmote: "point",
  keeperBubbleWhenNear: "Piggy Penny: Touch the Memory Plinth — your choice lives there.",
  bagTip: "Tap the glowing Memory Plinth",
  pulseHotspot: "memory",
};

export function guidedVisualBeats(stepId?: string | null): GuidedVisualBeats {
  if (stepId && GUIDED_VISUAL_BEATS[stepId]) return GUIDED_VISUAL_BEATS[stepId]!;
  return {
    keeperEmote: "idle",
    keeperBubbleWhenNear: "",
    bagTip: "This way!",
  };
}

export function resolveHarborVisualBeats(opts: {
  guidedStepId?: string | null;
  homecomingPending?: boolean;
  /** Spine Take done, Piggy already talked — nudge next painting */
  pointNextPainting?: boolean;
  /** Organ-aware next painting name (Paycheck / Credit) */
  nextPaintingName?: string | null;
  scarSpectacleActive?: boolean;
  /** Memory Plinth still pulsing after spectacle */
  plinthGlowActive?: boolean;
}): GuidedVisualBeats {
  if (opts.guidedStepId && opts.guidedStepId !== "done") {
    return guidedVisualBeats(opts.guidedStepId);
  }
  if (opts.scarSpectacleActive) return SCAR_SPECTACLE_VISUAL_BEATS;
  if (opts.plinthGlowActive) return PLINTH_GLOW_VISUAL_BEATS;
  if (opts.homecomingPending) return HOMECOMING_VISUAL_BEATS;
  if (opts.pointNextPainting) {
    return postHomecomingVisualBeats(opts.nextPaintingName || "Paycheck Peninsula");
  }
  return guidedVisualBeats(opts.guidedStepId);
}
