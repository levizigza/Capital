/**
 * Per-island human ecosystems + culture.
 * Each shore is its own world: layout shape, cast roles, families/loners/animals.
 */

import type { IslandDefinition } from "./types";
import type { IslandVisualStyle } from "./themes/islandThemes";
import { getIslandTheme } from "./themes/islandThemes";
import type { MoneyMascot, MoneyMascotId } from "./moneyCast";
import { MONEY_CAST, getMascot, castMascotForNpc } from "./moneyCast";

export type ShoreLayoutShape =
  | "crescent" // seaside cove
  | "radar" // wireframe grid rings
  | "strip" // neon boulevard
  | "cluster" // low-poly village clumps
  | "keep" // quest keep courtyard
  | "ruins" // cinematic canyon path
  | "floating" // painterly islands
  | "plaza"; // default round plaza

export type SocialKind = "family" | "pair" | "loner" | "animal";

export type IslandCulture = {
  id: string;
  /** Player-facing culture line */
  cultureName: string;
  vibe: string;
  layout: ShoreLayoutShape;
  /** Preferred mascot roles for this culture */
  roles: MoneyMascot["role"][];
  /** Landmark props bias */
  landmarks: Array<"stall" | "antenna" | "statue" | "garden" | "terminal" | "hut" | "tower">;
  /** Ambient ecosystem mix */
  ecosystem: { families: number; pairs: number; loners: number; animals: number };
  /** Signature animal vibe (visual only) */
  fauna: "gulls" | "phosphor_fish" | "neon_cats" | "poly_foxes" | "quest_birds" | "ruin_lizards" | "sky_whales" | "harbor_dogs";
};

const CULTURE_BY_STYLE: Partial<Record<IslandVisualStyle, Omit<IslandCulture, "id">>> = {
  "seaside-craft": {
    cultureName: "Craft Harbor Folk",
    vibe: "Cooperative artisans · families at market stalls · gulls overhead",
    layout: "crescent",
    roles: ["cash", "save", "spend", "trade"],
    landmarks: ["stall", "hut", "garden"],
    ecosystem: { families: 2, pairs: 1, loners: 1, animals: 3 },
    fauna: "gulls",
  },
  "vector-dawn": {
    cultureName: "Dotgraph Navigators",
    vibe: "Lone plotters and quiet pairs · constellation goats of thrift",
    layout: "radar",
    roles: ["plan", "save", "cash"],
    landmarks: ["antenna", "statue"],
    ecosystem: { families: 0, pairs: 2, loners: 3, animals: 2 },
    fauna: "phosphor_fish",
  },
  "wireframe-seas": {
    cultureName: "Phosphor Reef Traders",
    vibe: "Broker dens · rival analysts · glowing reef fish schools",
    layout: "radar",
    roles: ["invest", "credit", "trade", "plan"],
    landmarks: ["terminal", "antenna", "tower"],
    ecosystem: { families: 1, pairs: 2, loners: 2, animals: 4 },
    fauna: "phosphor_fish",
  },
  "neon-grid": {
    cultureName: "Foundry Night Crew",
    vibe: "Startup packs · night-shift loners · neon alley cats",
    layout: "strip",
    roles: ["spend", "invest", "plan", "cash"],
    landmarks: ["terminal", "stall", "tower"],
    ecosystem: { families: 1, pairs: 1, loners: 3, animals: 3 },
    fauna: "neon_cats",
  },
  "lowpoly-coast": {
    cultureName: "Kart Coast Kin",
    vibe: "Big families on the boardwalk · fox companions everywhere",
    layout: "cluster",
    roles: ["cash", "save", "spend", "protect"],
    landmarks: ["hut", "garden", "statue"],
    ecosystem: { families: 3, pairs: 1, loners: 1, animals: 4 },
    fauna: "poly_foxes",
  },
  "quest-keep": {
    cultureName: "Keep of Ledgers",
    vibe: "Quest guilds · mentor pairs · messenger birds",
    layout: "keep",
    roles: ["protect", "plan", "save", "trade"],
    landmarks: ["statue", "tower", "garden"],
    ecosystem: { families: 1, pairs: 2, loners: 2, animals: 3 },
    fauna: "quest_birds",
  },
  "ruin-realism": {
    cultureName: "Temple Credit Clans",
    vibe: "Scattered loners in ruins · cautious pairs · sun lizards",
    layout: "ruins",
    roles: ["credit", "protect", "plan"],
    landmarks: ["statue", "tower"],
    ecosystem: { families: 0, pairs: 2, loners: 4, animals: 3 },
    fauna: "ruin_lizards",
  },
  "painterly-skies": {
    cultureName: "Sky Isle Dreamers",
    vibe: "Floating family camps · dreamy loners · sky whales far out",
    layout: "floating",
    roles: ["invest", "save", "plan", "protect"],
    landmarks: ["garden", "tower", "hut"],
    ecosystem: { families: 2, pairs: 1, loners: 2, animals: 2 },
    fauna: "sky_whales",
  },
  "neon-metropolis": {
    cultureName: "Signal Block Neighbors",
    vibe: "Dense street families · night traders · alley cats",
    layout: "strip",
    roles: ["invest", "credit", "trade", "spend"],
    landmarks: ["terminal", "stall", "antenna"],
    ecosystem: { families: 2, pairs: 2, loners: 2, animals: 3 },
    fauna: "neon_cats",
  },
  "broker-classic": {
    cultureName: "Exchange Floor Guild",
    vibe: "Pairs of brokers · lone analysts · ticker sparrows",
    layout: "plaza",
    roles: ["invest", "trade", "plan"],
    landmarks: ["terminal", "statue"],
    ecosystem: { families: 0, pairs: 3, loners: 2, animals: 2 },
    fauna: "quest_birds",
  },
};

const DEFAULT_CULTURE: Omit<IslandCulture, "id"> = {
  cultureName: "Archipelago Locals",
  vibe: "Mixed money folk · open plaza life",
  layout: "plaza",
  roles: ["cash", "save", "spend", "trade"],
  landmarks: ["stall", "garden"],
  ecosystem: { families: 1, pairs: 1, loners: 2, animals: 2 },
  fauna: "harbor_dogs",
};

export function getIslandCulture(island: IslandDefinition): IslandCulture {
  const theme = getIslandTheme(island.id, island.themeId);
  const base = CULTURE_BY_STYLE[theme.visualStyle] ?? DEFAULT_CULTURE;
  return { id: island.id, ...base };
}

/** Anchor positions for pier / board / journal / plaza center by layout. */
export type ShoreAnchors = {
  pier: [number, number, number];
  party: [number, number, number];
  journal: [number, number, number];
  padRadius: number;
  npcRadius: number;
  itemRadius: number;
  /** Rotate NPC ring start angle */
  npcAngle0: number;
  /** Cluster NPCs instead of even ring */
  npcCluster: boolean;
};

export function shoreAnchorsForCulture(culture: IslandCulture): ShoreAnchors {
  switch (culture.layout) {
    case "crescent":
      return {
        pier: [0, 0, 12.2],
        party: [-9.2, 0, 1.5],
        journal: [9.2, 0, 1.5],
        padRadius: 5.4,
        npcRadius: 8.4,
        itemRadius: 3.8,
        npcAngle0: -0.4,
        npcCluster: true,
      };
    case "radar":
      return {
        pier: [0, 0, 12.5],
        party: [-7.2, 0, -5.5],
        journal: [7.2, 0, -5.5],
        padRadius: 4.8,
        npcRadius: 9.6,
        itemRadius: 3.2,
        npcAngle0: Math.PI / 6,
        npcCluster: false,
      };
    case "strip":
      return {
        pier: [0, 0, 11.8],
        party: [-10.5, 0, -1],
        journal: [10.5, 0, -1],
        padRadius: 3.5,
        npcRadius: 6.5,
        itemRadius: 2.4,
        npcAngle0: 0,
        npcCluster: false,
      };
    case "cluster":
      return {
        pier: [2, 0, 11.5],
        party: [-8, 0, -4],
        journal: [8.5, 0, -3.5],
        padRadius: 6.8,
        npcRadius: 7.5,
        itemRadius: 4.5,
        npcAngle0: 0.8,
        npcCluster: true,
      };
    case "keep":
      return {
        pier: [0, 0, 12],
        party: [-6, 0, 6],
        journal: [6, 0, 6],
        padRadius: 5.0,
        npcRadius: 8.0,
        itemRadius: 3.5,
        npcAngle0: Math.PI,
        npcCluster: false,
      };
    case "ruins":
      return {
        pier: [-1.5, 0, 12.4],
        party: [-9.5, 0, -3],
        journal: [5.5, 0, -7],
        padRadius: 6.0,
        npcRadius: 10.0,
        itemRadius: 4.0,
        npcAngle0: 1.2,
        npcCluster: true,
      };
    case "floating":
      return {
        pier: [0, 0, 11],
        party: [-7.5, 0, 3],
        journal: [7.5, 0, 3],
        padRadius: 5.8,
        npcRadius: 9.0,
        itemRadius: 3.6,
        npcAngle0: -1,
        npcCluster: true,
      };
    default:
      return {
        pier: [0, 0, 11.5],
        party: [-8.5, 0, -2],
        journal: [8.5, 0, -2],
        padRadius: 6.2,
        npcRadius: 9.2,
        itemRadius: 4.4,
        npcAngle0: -Math.PI / 2,
        npcCluster: false,
      };
  }
}

export type AmbientResident = {
  id: string;
  social: SocialKind;
  mascotId: MoneyMascotId;
  position: [number, number, number];
  scale: number;
  /** Family members share a household offset index */
  household?: number;
  yaw: number;
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickFromRoles(roles: MoneyMascot["role"][], seed: string): MoneyMascot {
  const role = roles[hashStr(seed) % roles.length]!;
  const pool = MONEY_CAST.filter((m) => m.role === role);
  if (!pool.length) return castMascotForNpc(seed);
  return pool[hashStr(seed + role) % pool.length]!;
}

/**
 * Non-interactive ambient life — families, loners, animals — seeded per island.
 */
export function buildAmbientEcosystem(island: IslandDefinition): AmbientResident[] {
  const culture = getIslandCulture(island);
  const anchors = shoreAnchorsForCulture(culture);
  const out: AmbientResident[] = [];
  let n = 0;

  const place = (social: SocialKind, household: number | undefined, i: number, ring: number) => {
    const ang = culture.layout === "strip"
      ? (i - 2) * 0.55
      : anchors.npcAngle0 + (i / 8) * Math.PI * 2 + household! * 0.15;
    const r = ring + (hashStr(`${island.id}:${social}:${i}`) % 10) * 0.12;
    const x = culture.layout === "strip" ? (i % 2 === 0 ? -r : r) : Math.cos(ang) * r;
    const z = culture.layout === "strip" ? -2 + i * 1.4 : Math.sin(ang) * r;
    const mascot = pickFromRoles(culture.roles, `${island.id}:${social}:${i}`);
    out.push({
      id: `ambient_${social}_${n++}`,
      social,
      mascotId: mascot.id,
      position: [x, 0, z],
      scale: social === "animal" ? 0.45 : social === "family" && i % 3 === 2 ? 0.65 : 0.9,
      household,
      yaw: ang + Math.PI,
    });
  };

  for (let f = 0; f < culture.ecosystem.families; f++) {
    // Parent, parent, kid
    place("family", f, f * 3, anchors.npcRadius + 1.2);
    place("family", f, f * 3 + 1, anchors.npcRadius + 1.2);
    place("family", f, f * 3 + 2, anchors.npcRadius + 1.2);
  }
  for (let p = 0; p < culture.ecosystem.pairs; p++) {
    place("pair", 100 + p, p * 2, anchors.npcRadius - 0.5);
    place("pair", 100 + p, p * 2 + 1, anchors.npcRadius - 0.5);
  }
  for (let l = 0; l < culture.ecosystem.loners; l++) {
    place("loner", undefined, l + 20, anchors.npcRadius + 2.4);
  }
  for (let a = 0; a < culture.ecosystem.animals; a++) {
    place("animal", undefined, a + 40, anchors.itemRadius + 1.5 + (a % 3));
  }

  return out;
}

/** Resolve dialogue NPC to a culture-appropriate mascot (honors mascotId when set). */
export function castForIslandNpc(
  island: IslandDefinition,
  npcId: string,
  mascotId?: string | null,
): MoneyMascot {
  if (mascotId) return getMascot(mascotId);
  const culture = getIslandCulture(island);
  return pickFromRoles(culture.roles, `${island.id}:${npcId}`);
}
