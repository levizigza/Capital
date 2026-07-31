/**
 * Wave 4 identity freeze — Fortune Archipelago spine only on the map.
 * Harbor + Cove live; Paycheck + Credit as ghosts until unlocked.
 * Genre / asset islands stay off the travel surface (content may still load).
 */

import type { IslandDefinition } from "./types";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  HARBOR_HAVEN_ID,
  PAYCHECK_PENINSULA_ID,
} from "./islandIds";

/** Singular player-facing world name (Capital = product; Fortune = archipelago). */
export const FORTUNE_ARCHIPELAGO_NAME = "Fortune Archipelago";

/** Frozen travel surface order — hub first, then triangle spine. */
export const SPINE_TRAVEL_IDS = [
  HARBOR_HAVEN_ID,
  COVE_ISLAND_ID,
  PAYCHECK_PENINSULA_ID,
  CREDIT_KINGDOM_ID,
] as const;

export type SpineTravelId = (typeof SPINE_TRAVEL_IDS)[number];

export function isSpineTravelId(id: string | null | undefined): boolean {
  return Boolean(id && (SPINE_TRAVEL_IDS as readonly string[]).includes(id));
}

/**
 * Islands shown on Travel Map + Carpet voyage.
 * Drops genre cities / asset packs until the freeze lifts.
 */
export function islandsForSpineTravel(islands: IslandDefinition[]): IslandDefinition[] {
  const byId = new Map(islands.map((i) => [i.id, i]));
  return SPINE_TRAVEL_IDS.map((id) => byId.get(id)).filter(
    (i): i is IslandDefinition => Boolean(i),
  );
}
