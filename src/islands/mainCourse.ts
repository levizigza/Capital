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
import { hasHarborFreedom, BOSS_ISLAND_ID } from "./progressGates";
import {
  HUB_ISLAND_ID,
  COVE_ISLAND_ID,
  PAYCHECK_PENINSULA_ID,
  PAYCHECK_CHANGE_QUEST_ID,
  CREDIT_ORDEAL_QUEST_ID,
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
    blurb: "Allocate a paycheck, then face the rainy-day Take — protect or spend.",
    placeId: PAYCHECK_PENINSULA_ID,
    paintingId: "mg_budget_split",
    done: (s) => Boolean(s.questStatus[PAYCHECK_CHANGE_QUEST_ID]?.completed),
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
    blurb: "Face The Debt Collector’s storm. Clear First Recovery — interest feeds on haste.",
    placeId: BOSS_ISLAND_ID,
    done: (s) => Boolean(s.questStatus[CREDIT_ORDEAL_QUEST_ID]?.completed),
  },
];

/** Explicitly optional — never gate the ending on these. */
export const SIDE_TOMFOOLERY: MainCourseStep[] = [
  {
    id: "cove_shell_want",
    track: "side",
    title: "Cove · Shell Want",
    blurb: "Shelly’s digression — need vs want with a Harbor gossip scar.",
    placeId: COVE_ISLAND_ID,
    done: (s) => Boolean(s.questStatus["q_cc_shell_want"]?.completed),
  },
  {
    id: "paycheck_inbox_storm",
    track: "side",
    title: "Paycheck · Inbox Storm",
    blurb: "Optional money-mail choices on Main Street — Clock practice without the Take.",
    placeId: PAYCHECK_PENINSULA_ID,
    done: (s) => Boolean(s.questStatus["q_pp_inbox_storm"]?.completed),
  },
  {
    id: "credit_collector_rumor",
    track: "side",
    title: "Credit · Collector Rumor",
    blurb: "Optional canyon digression — listen or lean into Bank haste; Harbor gossips either way.",
    placeId: BOSS_ISLAND_ID,
    done: (s) => Boolean(s.questStatus["q_ck_collector_rumor"]?.completed),
  },
  {
    id: "signal_reef_listen",
    track: "side",
    title: "Phosphor Reef · Listen",
    blurb: "Free-roam digression — listen or rush the blink; Harbor gossips either way.",
    placeId: "signal_city",
    done: (s) =>
      Boolean(
        (s.harborScars ?? []).some(
          (x) => x.id === "sc_signal_listen" || x.id === "sc_signal_rush",
        ),
      ),
  },
  {
    id: "venture_foundry_listen",
    track: "side",
    title: "Gridlock · Foundry Listen",
    blurb: "Free-roam digression — linger with makers or pitch cold; Harbor gossips either way.",
    placeId: "venture_foundry",
    done: (s) =>
      Boolean(
        (s.harborScars ?? []).some(
          (x) => x.id === "vf_foundry_listen" || x.id === "vf_foundry_rush",
        ),
      ),
  },
  {
    id: "financial_assets_peek",
    track: "side",
    title: "Budget Kart · Portfolio Peek",
    blurb: "Free-roam digression — peek boards or trade blind; Harbor gossips either way.",
    placeId: "financial_assets",
    done: (s) =>
      Boolean(
        (s.harborScars ?? []).some(
          (x) => x.id === "fa_portfolio_peek" || x.id === "fa_portfolio_rush",
        ),
      ),
  },
  {
    id: "digital_assets_listen",
    track: "side",
    title: "Digital Atoll · Wharf Listen",
    blurb: "Free-roam digression — listen or sign keys cold; Harbor gossips either way.",
    placeId: "digital_assets",
    done: (s) =>
      Boolean(
        (s.harborScars ?? []).some(
          (x) => x.id === "da_wharf_listen" || x.id === "da_wharf_rush",
        ),
      ),
  },
  {
    id: "business_assets_browse",
    track: "side",
    title: "Diversify Keep · Shop Browse",
    blurb: "Free-roam digression — browse floor or stock blind; Harbor gossips either way.",
    placeId: "business_assets",
    done: (s) =>
      Boolean(
        (s.harborScars ?? []).some(
          (x) => x.id === "ba_shop_browse" || x.id === "ba_shop_rush",
        ),
      ),
  },
  {
    id: "intangibles_glance",
    track: "side",
    title: "Intangible Isle · IP Glance",
    blurb: "Free-roam digression — glance gallery or file cold; Harbor gossips either way.",
    placeId: "intangibles",
    done: (s) =>
      Boolean(
        (s.harborScars ?? []).some(
          (x) => x.id === "in_ip_glance" || x.id === "in_ip_rush",
        ),
      ),
  },
  {
    id: "future_shores_look",
    track: "side",
    title: "Portfolio Skies · Scaffold Look",
    blurb: "Free-roam digression — study poles or claim cold; Harbor gossips either way.",
    placeId: "future_shores",
    done: (s) =>
      Boolean(
        (s.harborScars ?? []).some(
          (x) => x.id === "fs_scaffold_look" || x.id === "fs_scaffold_rush",
        ),
      ),
  },
  {
    id: "real_estate_watch",
    track: "side",
    title: "Real Estate Row · Auction Watch",
    blurb: "Free-roam digression — watch yard or bid cold; Harbor gossips either way.",
    placeId: "real_estate",
    done: (s) =>
      Boolean(
        (s.harborScars ?? []).some(
          (x) => x.id === "re_auction_watch" || x.id === "re_auction_rush",
        ),
      ),
  },
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
