/**
 * QA / cold-play seed: Cove training done, Paycheck analogous Take not yet faced.
 */

import { applyConceptSync } from "../conceptProgression/engine";
import { createDefaultIslandSave } from "../save";
import { STORY_BIBLE_VERSION } from "../story/storyBible";
import {
  COVE_CHANGE_QUEST_ID,
  COVE_ISLAND_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";
import { stampIndependentTransferWindows } from "./stamp";
import type { IslandSaveV1 } from "../types";

export function buildIndependentTransferSave(now = new Date()): IslandSaveV1 {
  const at = now.toISOString();
  const base = createDefaultIslandSave();
  const trained: IslandSaveV1 = {
    ...base,
    onboardingComplete: true,
    currentIslandId: PAYCHECK_PENINSULA_ID,
    hubGuidedIntro: {
      version: STORY_BIBLE_VERSION,
      step: "done",
      didDock: true,
      didMeetGuide: true,
    },
    questStatus: {
      q_cc_first_coins: { started: true, completed: true, completedAt: at },
      [COVE_CHANGE_QUEST_ID]: {
        started: true,
        completed: true,
        completedObjectives: ["talk:npc_keeper_kira"],
        completedAt: at,
      },
    },
    completedMinigames: ["mg_coin_sort"],
    discovered: {
      npcs: [],
      items: [],
      areas: [],
      islands: [HARBOR_HAVEN_ID, COVE_ISLAND_ID, PAYCHECK_PENINSULA_ID],
    },
    irreversibleChoices: {
      cove_save_vs_spend: {
        choiceId: "save",
        label: "Jar before treat",
        islandId: COVE_ISLAND_ID,
        at,
      },
    },
    harborScars: [
      {
        id: "cove_saver_plaque",
        label: "Jar before treat",
        kind: "plaque",
        islandId: COVE_ISLAND_ID,
        choiceId: "save",
        createdAt: at,
      },
    ],
    harborHomecoming: {
      pending: false,
      celebrated: true,
      piggyTalked: true,
      quietPending: false,
      chapterIslandId: COVE_ISLAND_ID,
      questId: COVE_CHANGE_QUEST_ID,
    },
  };
  return stampIndependentTransferWindows(applyConceptSync(trained, at), at);
}
