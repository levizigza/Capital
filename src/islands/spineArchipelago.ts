/**
 * Fortune Archipelago — two travel lanes.
 * Spine = main quest (Harbor · Cove → Paycheck → Credit).
 * Side shores = restored era / genre islands with their own music cues.
 * Demo Key Cove stays parked off the map.
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

/** Frozen main-course travel order — hub first, then triangle spine. */
export const SPINE_TRAVEL_IDS = [
  HARBOR_HAVEN_ID,
  COVE_ISLAND_ID,
  PAYCHECK_PENINSULA_ID,
  CREDIT_KINGDOM_ID,
] as const;

export type SpineTravelId = (typeof SPINE_TRAVEL_IDS)[number];

/**
 * Inner-ring map placement (clockwise from north).
 * Cove sits forward-right toward the camera; Paycheck holds the north landmark
 * with 1960s vector dawn — strip / quest order stays SPINE_TRAVEL_IDS.
 */
export const SPINE_MAP_RING_IDS = [
  PAYCHECK_PENINSULA_ID,
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
] as const;

/**
 * Discoverable era side shores — Capital-framed chapters with per-shore soundtrack.
 * Outer map ring; soft-locked until Paycheck Change.
 */
export const SIDE_SHORE_TRAVEL_IDS = [
  "signal_city",
  "venture_foundry",
  "intangibles",
  "digital_assets",
  "business_assets",
  "financial_assets",
  "future_shores",
  "real_estate",
] as const;

export type SideShoreTravelId = (typeof SIDE_SHORE_TRAVEL_IDS)[number];

/** Full carpet / diorama surface = spine ∪ side shores (never demo Key Cove). */
export const ARCHIPELAGO_MAP_TRAVEL_IDS = [
  ...SPINE_TRAVEL_IDS,
  ...SIDE_SHORE_TRAVEL_IDS,
] as const;

export function isSpineTravelId(id: string | null | undefined): boolean {
  return Boolean(id && (SPINE_TRAVEL_IDS as readonly string[]).includes(id));
}

export function isSideShoreTravelId(id: string | null | undefined): boolean {
  return Boolean(id && (SIDE_SHORE_TRAVEL_IDS as readonly string[]).includes(id));
}

export function isArchipelagoMapTravelId(id: string | null | undefined): boolean {
  return Boolean(id && (ARCHIPELAGO_MAP_TRAVEL_IDS as readonly string[]).includes(id));
}

function pickOrdered(
  islands: IslandDefinition[],
  ids: readonly string[],
): IslandDefinition[] {
  const byId = new Map(islands.map((i) => [i.id, i]));
  return ids.map((id) => byId.get(id)).filter((i): i is IslandDefinition => Boolean(i));
}

/**
 * Main-course chips for the travel strip — Harbor + triangle only.
 */
export function islandsForSpineTravel(islands: IslandDefinition[]): IslandDefinition[] {
  return pickOrdered(islands, SPINE_TRAVEL_IDS);
}

/**
 * Full archipelago for 3D map + carpet voyage (spine + era side shores).
 */
export function islandsForArchipelagoMap(islands: IslandDefinition[]): IslandDefinition[] {
  return pickOrdered(islands, ARCHIPELAGO_MAP_TRAVEL_IDS);
}
