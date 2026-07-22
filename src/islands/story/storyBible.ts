/**
 * Runtime mirror of docs/story-bible.md — whole-game Story Circle + Harbor Castle Grounds.
 * Content authors: keep docs as canon; this module drives guided play.
 */

export const STORY_BIBLE_VERSION = 1;

/** Dan Harmon 8-beat ids — used for whole game AND per-island chapters. */
export type StoryBeatId =
  | "you"
  | "need"
  | "go"
  | "search"
  | "find"
  | "take"
  | "return"
  | "change";

export const STORY_BEATS: Array<{
  id: StoryBeatId;
  label: string;
  kidLine: string;
  campbell: string;
}> = [
  { id: "you", label: "You", kidLine: "This is home.", campbell: "Ordinary World" },
  { id: "need", label: "Need", kidLine: "You need a first seal.", campbell: "Call to Adventure" },
  { id: "go", label: "Go", kidLine: "Let’s go!", campbell: "Crossing the Threshold" },
  { id: "search", label: "Search", kidLine: "Try, learn, try again.", campbell: "Trials & Allies" },
  { id: "find", label: "Find", kidLine: "You did it!", campbell: "Ordeal / Reward" },
  { id: "take", label: "Take", kidLine: "Choices have prices.", campbell: "Price / Responsibility" },
  { id: "return", label: "Return", kidLine: "Back to Harbor.", campbell: "Road Back" },
  { id: "change", label: "Change", kidLine: "You’re different now.", campbell: "Master of Two Worlds" },
];

/** Harbor Keeper — Castle Grounds Lakitu. */
export const HARBOR_KEEPER_MASCOT_ID = "piggy_penny" as const;

/**
 * Castle Grounds guided first hour — one verb at a time (SM64 yard).
 * Advances when the Voyager completes the action, not when they skip text.
 */
export type HubGuidedStepId =
  | "meet_guide"
  | "walk_outfitter"
  | "become_you"
  | "tiny_spend"
  | "practice_optional"
  | "to_dock"
  | "first_island"
  | "done";

export type HubGuidedIntroState = {
  version: typeof STORY_BIBLE_VERSION;
  step: HubGuidedStepId;
  /** Outfitter look saved at least once this run */
  didOutfitter?: boolean;
  /** Bought something at Capsule OR explicitly skipped after seeing the stall */
  didSpendLesson?: boolean;
  /** Opened practice board once (optional beat) */
  didPractice?: boolean;
  /** Opened travel map / dock with intent to leave */
  didDock?: boolean;
};

export const HUB_GUIDED_STEPS: Array<{
  id: HubGuidedStepId;
  storyBeat: StoryBeatId;
  /** Single HUD sentence — age ~5 */
  coach: string;
  /** Guide line when near Piggy Penny */
  guideLine: string;
  verb: string;
  highlight?: "outfitter" | "capsule" | "travel" | "practice" | "guide";
}> = [
  {
    id: "meet_guide",
    storyBeat: "you",
    coach: "Coin Bag hops to Piggy Penny — she’s waving! Walk over and talk.",
    guideLine:
      "Piggy Penny: Welcome ashore! I’m your Harbor Keeper. Coin Bag hops ahead — follow him!",
    verb: "Walk · Talk",
    highlight: "guide",
  },
  {
    id: "walk_outfitter",
    storyBeat: "you",
    coach: "Piggy points the way — follow Coin Bag to the Outfitter.",
    guideLine: "Piggy Penny: Become YOU first — the Outfitter door is ahead. Coin Bag’s hopping there!",
    verb: "Walk",
    highlight: "outfitter",
  },
  {
    id: "become_you",
    storyBeat: "you",
    coach: "Outfitter door is glowing — go inside and style Body · Coat · Gear.",
    guideLine: "Piggy Penny: Go inside! Body · Coat · Gear on the live mirror.",
    verb: "Enter · Style",
    highlight: "outfitter",
  },
  {
    id: "tiny_spend",
    storyBeat: "need",
    coach: "Coin Bag hops to Capsule Stall — Piggy nods when you peek.",
    guideLine: "Piggy Penny: Coins aren’t for staring. Peek the Capsule Stall — I’ll nod when you do.",
    verb: "Spend (or peek)",
    highlight: "capsule",
  },
  {
    id: "practice_optional",
    storyBeat: "need",
    coach: "Optional: practice board, or skip — Coin Bag waits at your choice.",
    guideLine: "Piggy Penny: Practice board is optional — or skip to the carpet!",
    verb: "Play or Skip",
    highlight: "practice",
  },
  {
    id: "to_dock",
    storyBeat: "go",
    coach: "Piggy points — follow Coin Bag to the Carpet Dock.",
    guideLine: "Piggy Penny: The Fortune Thread starts at the Carpet Dock!",
    verb: "Walk",
    highlight: "travel",
  },
  {
    id: "first_island",
    storyBeat: "go",
    coach: "Dock is glowing — open the map for Coincraft Cove!",
    guideLine: "Piggy Penny: Open the map — Coincraft Cove is your first painting!",
    verb: "Go",
    highlight: "travel",
  },
  {
    id: "done",
    storyBeat: "change",
    coach: "Harbor is yours. Piggy waves goodbye for now.",
    guideLine: "Piggy Penny: Harbor is yours. I’ll wave when you come home.",
    verb: "Explore",
  },
];

export function createDefaultHubGuidedIntro(): HubGuidedIntroState {
  return { version: STORY_BIBLE_VERSION, step: "meet_guide" };
}

export function getHubGuidedStep(state?: HubGuidedIntroState | null) {
  const stepId = state?.step ?? "meet_guide";
  return HUB_GUIDED_STEPS.find((s) => s.id === stepId) ?? HUB_GUIDED_STEPS[0]!;
}

export function isHubGuidedComplete(state?: HubGuidedIntroState | null): boolean {
  return state?.step === "done";
}

export type HubGuidedEvent =
  | "talked_guide"
  | "near_outfitter"
  | "saved_outfitter"
  | "capsule_visit"
  | "capsule_bought"
  | "practice_opened"
  | "skip_practice"
  | "near_dock"
  | "opened_map";

/** Advance helpers — called from Harbor UI when verbs complete. */
export function advanceHubGuided(
  state: HubGuidedIntroState,
  event: HubGuidedEvent,
): HubGuidedIntroState {
  const next = { ...state };
  switch (event) {
    case "talked_guide":
      if (next.step === "meet_guide") next.step = "walk_outfitter";
      break;
    case "near_outfitter":
      if (next.step === "walk_outfitter") next.step = "become_you";
      break;
    case "saved_outfitter":
      next.didOutfitter = true;
      if (next.step === "become_you" || next.step === "walk_outfitter") next.step = "tiny_spend";
      break;
    case "capsule_visit":
      if (next.step === "tiny_spend") {
        next.didSpendLesson = true;
        next.step = "practice_optional";
      }
      break;
    case "capsule_bought":
      next.didSpendLesson = true;
      if (next.step === "tiny_spend") next.step = "practice_optional";
      break;
    case "practice_opened":
      next.didPractice = true;
      if (next.step === "practice_optional") next.step = "to_dock";
      break;
    case "skip_practice":
      if (next.step === "practice_optional") next.step = "to_dock";
      break;
    case "near_dock":
      if (next.step === "to_dock") next.step = "first_island";
      break;
    case "opened_map":
      next.didDock = true;
      if (next.step === "first_island" || next.step === "to_dock") next.step = "done";
      break;
    default:
      break;
  }
  return next;
}

/** Whole-game beat order for analytics / debug. */
export function wholeGameBeatIndex(id: StoryBeatId): number {
  return STORY_BEATS.findIndex((b) => b.id === id);
}
