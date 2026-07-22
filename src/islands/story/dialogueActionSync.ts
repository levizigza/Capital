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
  pulseHotspot?: "outfitter" | "capsule" | "travel" | "arcade" | "guide";
};

/** Map guided step id → what the player must SEE. */
export const GUIDED_VISUAL_BEATS: Record<string, GuidedVisualBeats> = {
  meet_guide: {
    keeperEmote: "wave",
    keeperBubbleWhenNear:
      "Piggy Penny: Welcome ashore! I’m your Harbor Keeper. Coin Bag stays by your side — walk with him to me!",
    bagTip: "Talk to Piggy Penny — she’s waving!",
    pulseHotspot: "guide",
  },
  walk_outfitter: {
    keeperEmote: "point",
    keeperBubbleWhenNear:
      "Piggy Penny: Become YOU first. Coin Bag will point at the Outfitter — walk together!",
    bagTip: "Outfitter door — walk with me",
    pulseHotspot: "outfitter",
  },
  become_you: {
    keeperEmote: "cheer",
    keeperBubbleWhenNear: "Piggy Penny: Go inside! Body · Coat · Gear on the live mirror.",
    bagTip: "Go inside the Outfitter",
    pulseHotspot: "outfitter",
  },
  tiny_spend: {
    keeperEmote: "nod",
    keeperBubbleWhenNear: "Piggy Penny: Coins aren’t for staring. Peek the Capsule Stall — I’ll nod when you do.",
    bagTip: "Capsule Stall — I’ll point",
    pulseHotspot: "capsule",
  },
  practice_optional: {
    keeperEmote: "talk",
    keeperBubbleWhenNear: "Piggy Penny: Practice board is optional — or skip to the carpet!",
    bagTip: "Practice, or skip to dock",
    pulseHotspot: "arcade",
  },
  to_dock: {
    keeperEmote: "point",
    keeperBubbleWhenNear: "Piggy Penny: The Fortune Thread starts at the Carpet Dock!",
    bagTip: "Carpet Dock this way",
    pulseHotspot: "travel",
  },
  first_island: {
    keeperEmote: "cheer",
    keeperBubbleWhenNear: "Piggy Penny: Open the map — Coincraft Cove is your first painting!",
    bagTip: "Open the map → Cove",
    pulseHotspot: "travel",
  },
  done: {
    keeperEmote: "wave",
    keeperBubbleWhenNear: "Piggy Penny: Harbor is yours. Coin Bag stays your buddy — I’ll wave when you come home.",
    bagTip: "I’m still with you!",
  },
};

export function guidedVisualBeats(stepId?: string | null): GuidedVisualBeats {
  if (stepId && GUIDED_VISUAL_BEATS[stepId]) return GUIDED_VISUAL_BEATS[stepId]!;
  return {
    keeperEmote: "idle",
    keeperBubbleWhenNear: "",
    bagTip: "This way!",
  };
}
