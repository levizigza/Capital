/**
 * Financial quest taxonomy — Main Quest (Story Circle spine) vs Side Quests (open world).
 *
 * Island quests carry an optional `track`. Missing track defaults to "main" (chapter spine).
 * Cross-island campaign beats live in mainCourse.ts (MAIN_COURSE / SIDE_TOMFOOLERY).
 */

import type { IslandQuest, QuestTrack } from "./types";

export function questTrack(quest: Pick<IslandQuest, "track">): QuestTrack {
  return quest.track ?? "main";
}

export function partitionIslandQuests(quests: IslandQuest[]): {
  main: IslandQuest[];
  side: IslandQuest[];
} {
  const main: IslandQuest[] = [];
  const side: IslandQuest[] = [];
  for (const q of quests) {
    if (questTrack(q) === "side") side.push(q);
    else main.push(q);
  }
  return { main, side };
}

export function trackLabel(track: QuestTrack): string {
  return track === "main" ? "Main Quest" : "Side Quest";
}

export function trackCoachPrefix(track: QuestTrack): string {
  return track === "main" ? "Main quest" : "Side quest";
}
