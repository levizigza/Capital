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

/** Harbor Keeper — Castle Grounds guide. */
export const HARBOR_KEEPER_MASCOT_ID = "piggy_penny" as const;

/**
 * Harbor Ashore guided first hour — one verb at a time (Portal chambers).
 * Live critical path: meet_guide → to_dock → done.
 * Legacy step ids remain for old saves; normalizeHubGuidedIntro remaps them.
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

/** Steps retired from the critical path — still valid in old saves. */
export const ASHORE_LEGACY_GATE_STEPS: readonly HubGuidedStepId[] = [
  "walk_outfitter",
  "become_you",
  "tiny_spend",
  "practice_optional",
  "first_island",
] as const;

/** Critical path after Talk: voyage to Cove. */
export const ASHORE_VOYAGE_STEP: HubGuidedStepId = "to_dock";

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
    // Presence CTA carries this — keep coach short for any leftover surface.
    coach: "Talk to Piggy Penny.",
    guideLine: "Piggy Penny: Welcome ashore! I’m your Harbor Keeper.",
    verb: "Talk",
    highlight: "guide",
  },
  // DEMOTED legacy gates — normalizeHubGuidedIntro remaps onto to_dock.
  // Copy stays voyage-safe so raw table reads cannot re-hero Outfitter.
  {
    id: "walk_outfitter",
    storyBeat: "go",
    coach: "Board the Money Carpet — Coincraft Cove is your first painting.",
    guideLine:
      "Piggy Penny: Coin Bag points at the Money Carpet — open the map for Coincraft Cove!",
    verb: "Board carpet",
    highlight: "travel",
  },
  {
    id: "become_you",
    storyBeat: "go",
    coach: "Board the Money Carpet — Coincraft Cove is your first painting.",
    guideLine:
      "Piggy Penny: Coin Bag points at the Money Carpet — open the map for Coincraft Cove!",
    verb: "Board carpet",
    highlight: "travel",
  },
  {
    id: "tiny_spend",
    storyBeat: "go",
    coach: "Board the Money Carpet — Coincraft Cove is your first painting.",
    guideLine:
      "Piggy Penny: Coin Bag points at the Money Carpet — open the map for Coincraft Cove!",
    verb: "Board carpet",
    highlight: "travel",
  },
  {
    id: "practice_optional",
    storyBeat: "go",
    coach: "Board the Money Carpet — Coincraft Cove is your first painting.",
    guideLine:
      "Piggy Penny: Coin Bag points at the Money Carpet — open the map for Coincraft Cove!",
    verb: "Board carpet",
    highlight: "travel",
  },
  {
    id: "to_dock",
    storyBeat: "go",
    // Critical path after Talk (Harbor Ashore) — one voyage verb.
    coach: "Board the Money Carpet — Coincraft Cove is your first painting.",
    guideLine:
      "Piggy Penny: Coin Bag points at the Money Carpet — open the map for Coincraft Cove!",
    verb: "Board carpet",
    highlight: "travel",
  },
  {
    id: "first_island",
    storyBeat: "go",
    coach: "Board the Money Carpet — Coincraft Cove is your first painting.",
    guideLine:
      "Piggy Penny: Coin Bag points at the Money Carpet — open the map for Coincraft Cove!",
    verb: "Board carpet",
    highlight: "travel",
  },
  {
    id: "done",
    storyBeat: "change",
    coach: "Harbor is yours. Coin Bag stays your journey buddy.",
    guideLine: "Piggy Penny: Harbor is yours. Coin Bag stays your buddy — I’ll wave when you come home.",
    verb: "Explore",
  },
];

export function createDefaultHubGuidedIntro(): HubGuidedIntroState {
  return { version: STORY_BIBLE_VERSION, step: "meet_guide" };
}

/** Normalize mid-save legacy Outfitter/Capsule gates onto the voyage step. */
export function normalizeHubGuidedIntro(
  state?: HubGuidedIntroState | null,
): HubGuidedIntroState {
  const base = state ?? createDefaultHubGuidedIntro();
  if (isHubGuidedComplete(base)) return base;
  if ((ASHORE_LEGACY_GATE_STEPS as readonly string[]).includes(base.step)) {
    return { ...base, step: ASHORE_VOYAGE_STEP };
  }
  return base;
}

/** Live coach step — always Ashore-normalized (never Outfitter-gate hero). */
export function getHubGuidedStep(state?: HubGuidedIntroState | null) {
  const stepId = normalizeHubGuidedIntro(state).step;
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

/**
 * Advance helpers — called from Harbor UI when verbs complete.
 *
 * Harbor Ashore redesign (docs/harbor-ashore.md): critical path is
 * Talk Piggy → Money Carpet → Cove. Outfitter / Capsule / practice are
 * plaza discoveries, not gates (legacy mid-saves still advance if stuck).
 */
export function advanceHubGuided(
  state: HubGuidedIntroState,
  event: HubGuidedEvent,
): HubGuidedIntroState {
  const next = { ...normalizeHubGuidedIntro(state) };
  switch (event) {
    case "talked_guide":
      // One teach → voyage (Portal-style: next chamber is leave home).
      if (next.step === "meet_guide") next.step = ASHORE_VOYAGE_STEP;
      break;
    case "near_outfitter":
      if (next.step === "walk_outfitter") next.step = "become_you";
      break;
    case "saved_outfitter":
      next.didOutfitter = true;
      if (
        next.step === "become_you" ||
        next.step === "walk_outfitter" ||
        next.step === "to_dock"
      ) {
        // Discovery save during voyage — stay on voyage; don't bounce to Capsule gate.
        if (next.step !== "to_dock") next.step = "to_dock";
      }
      break;
    case "capsule_visit":
      if (next.step === "tiny_spend") {
        next.didSpendLesson = true;
        next.step = "to_dock";
      }
      break;
    case "capsule_bought":
      next.didSpendLesson = true;
      if (next.step === "tiny_spend") next.step = "to_dock";
      break;
    case "practice_opened":
      next.didPractice = true;
      if (next.step === "practice_optional") next.step = "to_dock";
      break;
    case "skip_practice":
      if (next.step === "practice_optional") next.step = "to_dock";
      break;
    case "near_dock":
      // Voyage is already to_dock — stay; map open completes.
      break;
    case "opened_map":
      next.didDock = true;
      if (
        next.step === "first_island" ||
        next.step === "to_dock" ||
        next.step === "meet_guide" ||
        next.step === "tiny_spend" ||
        next.step === "practice_optional" ||
        next.step === "walk_outfitter" ||
        next.step === "become_you"
      ) {
        next.step = "done";
      }
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
