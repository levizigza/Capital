import { getAnimationStyle } from "../animationStyles";
import { getIslandTheme } from "../themes/islandThemes";
import { moneyStructureForIsland } from "../moneyStructures";
import {
  COVE_ISLAND_ID,
  CREDIT_KINGDOM_ID,
  PAYCHECK_PENINSULA_ID,
} from "../islandIds";
import type { ArchipelagoNode } from "../worldMapLayout";

/** Player-facing era nicknames on the voyage map (organ names lead on spine). */
const SPINE_ERA_NICKNAME: Partial<Record<string, string>> = {
  paycheck_peninsula: "Vector Dawn",
  coincraft_cove: "Solarpunk Cove",
  credit_kingdom: "Credit Ruins",
};

/** Structure chip for map nameplates (Jar · Tower · Keep · Bank). */
export function mapStructurePin(islandId: string): string {
  const theme = moneyStructureForIsland(islandId)?.theme;
  if (theme === "jar") return "Jar";
  if (theme === "tower") return "Tower";
  if (theme === "keep") return "Keep";
  if (theme === "bank") return "Bank";
  return "Shore";
}

/** Spine islands — era decade + landmark nickname + structure pin. */
export function mapSpineSubtitle(
  islandId: string,
  opts: { locked: boolean; current: boolean },
): string {
  const theme = getIslandTheme(islandId);
  const era = getAnimationStyle(theme.animationStyle);
  const pin = mapStructurePin(islandId);
  const nick = SPINE_ERA_NICKNAME[islandId];
  if (opts.current) return "Here";
  if (opts.locked) return nick ? `${era.decade} · ${nick} · Locked` : `${era.decade} · Locked`;
  return nick ? `${era.decade} · ${nick} · ${pin}` : `${era.decade} · ${pin}`;
}

/** Lift nameplates when side shores crowd a spine slot (north Cove / forward Cove). */
export function mapLabelOffsetY(node: ArchipelagoNode): number {
  if (node.island.id === PAYCHECK_PENINSULA_ID) return 0.55;
  if (node.island.id === COVE_ISLAND_ID) return 0.35;
  if (node.island.id === CREDIT_KINGDOM_ID) return 0.25;
  if (node.ring === "spine") return 0.18;
  return 0;
}

/** Html z-index band — spine above side so labels never disappear behind neighbors. */
export function mapLabelZIndex(ring: ArchipelagoNode["ring"]): [number, number] {
  if (ring === "spine" || ring === "hub") return [48, 0];
  return [24, 0];
}
