/**
 * Main Course vs Side Tomfoolery — castle-grounds structure for Capital.
 *
 * SM64 pattern we follow:
 * - Harbor = Castle Grounds (safe hub, practice verbs)
 * - Each island shore = painting room / course lobby
 * - Painting portals = dive into self-contained 3D game worlds
 * - Main course = required seals/stars to progress the Story Circle
 * - Side tomfoolery = optional board, arcade, secret pads — never required
 *
 * Fortune Party pattern for the worlds inside paintings:
 * - Stick = move, Action = jump/grab/shove
 * - Short timed arenas with clear verbs, then mastery quiz
 */

import type { IslandSaveV1, QuestTrack } from "./types";
import { hasCompletedCoveChange } from "./chapterLoop";
import { hasHarborFreedom, BOSS_ISLAND_ID, BOSS_MASTERY_REQUIRED } from "./progressGates";
import { ensureLedger } from "./voyagerLedger";
import {
  HUB_ISLAND_ID,
  COVE_ISLAND_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";

/** Same taxonomy as island quests — campaign painting spine vs optional digressions. */
export type CourseTrack = QuestTrack;

export type MainCourseStep = {
  id: string;
  track: CourseTrack;
  title: string;
  blurb: string;
  /** Island / hub id where this beat lives */
  placeId: string;
  /** Optional painting / play-pad minigame id */
  paintingId?: string;
  /** How to know this beat is done */
  done: (save: IslandSaveV1) => boolean;
};

/** Ordered Story Circle main path — the “complete the game” spine. */
export const MAIN_COURSE: MainCourseStep[] = [
  {
    id: "harbor_grounds",
    track: "main",
    title: "Harbor Haven · Castle Grounds",
    blurb: "Walk, talk, become you — learn the verbs before any painting.",
    placeId: HUB_ISLAND_ID,
    done: (s) => !!s.onboardingComplete && !!s.character,
  },
  {
    id: "first_painting",
    track: "main",
    title: "Coincraft Cove · First Painting",
    blurb: "Dive the first course world. Earn fair. Choose save or spend.",
    placeId: COVE_ISLAND_ID,
    paintingId: "mg_coin_catcher",
    done: (s) => hasCompletedCoveChange(s),
  },
  {
    id: "second_painting",
    track: "main",
    title: "Paycheck Peninsula · Budget Course",
    blurb: "Open yet linear — climb the budget mountain, side paths welcome.",
    placeId: PAYCHECK_PENINSULA_ID,
    paintingId: "mg_treasure_hunt",
    done: (s) => (s.completedMinigames ?? []).includes("mg_treasure_hunt") || (s.completedMinigames ?? []).includes("mg_budget_split"),
  },
  {
    id: "freedom_seal",
    track: "main",
    title: "Freedom Seal · Return Changed",
    blurb: "Come home with proof — Harbor opens the Pavilion.",
    placeId: HUB_ISLAND_ID,
    done: (s) => hasHarborFreedom(s),
  },
  {
    id: "boss_ordeal",
    track: "main",
    title: "Credit Kingdom · Ordeal",
    blurb: "Late-game storm. Needs mastery clears — like a Big Star Door.",
    placeId: BOSS_ISLAND_ID,
    done: (s) => (s.discovered?.islands ?? []).includes(BOSS_ISLAND_ID) && (ensureLedger(s.voyagerLedger).masteryClears?.length ?? 0) >= BOSS_MASTERY_REQUIRED,
  },
];

/** Explicitly optional — never gate the ending on these. */
export const SIDE_TOMFOOLERY: MainCourseStep[] = [
  {
    id: "party_plaza",
    track: "side",
    title: "Fortune Party Plaza",
    blurb: "Fortune Party board — roll, land, play. Pure tomfoolery.",
    placeId: "*",
    done: () => false,
  },
  {
    id: "harbor_arcade",
    track: "side",
    title: "Harbor Arcade",
    blurb: "Replay any cleared game for fun — Mini-Game House energy.",
    placeId: HUB_ISLAND_ID,
    done: () => false,
  },
  {
    id: "practice_board",
    track: "side",
    title: "Harbor Practice Board",
    blurb: "Optional dice warm-up on Castle Grounds.",
    placeId: HUB_ISLAND_ID,
    done: () => false,
  },
];

export function nextMainCourseStep(save: IslandSaveV1): MainCourseStep | null {
  for (const step of MAIN_COURSE) {
    if (!step.done(save)) return step;
  }
  return null;
}

export function mainCourseProgress(save: IslandSaveV1): { done: number; total: number; pct: number } {
  const done = MAIN_COURSE.filter((s) => s.done(save)).length;
  const total = MAIN_COURSE.length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function isMainCoursePainting(minigameId: string): boolean {
  return MAIN_COURSE.some((s) => s.paintingId === minigameId);
}

/** Kinesthetic / arena components that dive into a 3D course world (painting). */
export const COURSE_WORLD_COMPONENTS = new Set([
  "PartyArenaMinigame",
  "PartyDashMinigame",
  "CoinCatcherMinigame",
]);

export function usesCourseWorld(componentId: string): boolean {
  return COURSE_WORLD_COMPONENTS.has(componentId);
}

/** World-level optional digressions for the Financial Quest Journal. */
export function worldSideQuests(): MainCourseStep[] {
  return SIDE_TOMFOOLERY;
}
