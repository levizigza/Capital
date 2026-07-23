/**
 * Per-island human + machine ecosystems + culture.
 * Each shore is its own genre-city world: layout, cast roles, families/loners/animals/bots.
 */

import type { IslandDefinition } from "./types";
import type { IslandVisualStyle } from "./themes/islandThemes";
import { getIslandTheme } from "./themes/islandThemes";
import type { MoneyMascot, MoneyMascotId } from "./moneyCast";
import { getMascot } from "./moneyCast";
import { getGenreWorld } from "./genreWorlds";
import { castPersonaMascot, type NpcPersona } from "./npcPersonas";
import { SHORE_WORLD_SCALE, shoreXZ } from "./world3d/ledgerlight";

export type ShoreLayoutShape =
  | "crescent" // seaside cove
  | "radar" // wireframe grid rings
  | "strip" // neon boulevard
  | "cluster" // low-poly village clumps
  | "keep" // quest keep courtyard
  | "ruins" // cinematic canyon path
  | "floating" // painterly islands
  | "plaza"; // default round plaza

export type SocialKind = "family" | "pair" | "loner" | "animal" | "machine";

export type FaunaKind =
  | "gulls"
  | "phosphor_fish"
  | "neon_cats"
  | "poly_foxes"
  | "quest_birds"
  | "ruin_lizards"
  | "sky_whales"
  | "harbor_dogs"
  /** Genre-city machines & critters */
  | "canopy_bots"
  | "service_drones"
  | "gene_critters"
  | "neon_androids"
  | "scrap_bots"
  | "orbital_probes"
  | "mind_wisps";

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
  /** Ambient ecosystem mix — machines = genre-city bots walking the plaza */
  ecosystem: {
    families: number;
    pairs: number;
    loners: number;
    animals: number;
    machines: number;
  };
  /** Signature animal / machine vibe (visual only) */
  fauna: FaunaKind;
};

const CULTURE_BY_STYLE: Partial<Record<IslandVisualStyle, Omit<IslandCulture, "id">>> = {
  "seaside-craft": {
    cultureName: "Craft Harbor Folk",
    vibe: "Cooperative artisans · families at market stalls · gulls overhead",
    layout: "crescent",
    roles: ["cash", "save", "spend", "trade"],
    landmarks: ["stall", "hut", "garden"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 2, machines: 0 },
    fauna: "gulls",
  },
  "vector-dawn": {
    cultureName: "Cognisphere Plotters",
    vibe: "Human–AI pairs · quiet androids · scoreboard goats of thrift",
    layout: "radar",
    roles: ["plan", "save", "cash"],
    landmarks: ["antenna", "statue", "terminal"],
    ecosystem: { families: 0, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "service_drones",
  },
  "wireframe-seas": {
    cultureName: "Gene Reef Brokers",
    vibe: "Living-capital traders · rival biologists · pulse schools",
    layout: "radar",
    roles: ["invest", "credit", "trade", "plan"],
    landmarks: ["terminal", "antenna", "tower"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "gene_critters",
  },
  "neon-grid": {
    cultureName: "Corp Sprawl Night Crew",
    vibe: "Wage packs · chrome loners · alley androids under neon",
    layout: "strip",
    roles: ["spend", "invest", "plan", "cash"],
    landmarks: ["terminal", "stall", "tower"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "neon_androids",
  },
  "lowpoly-coast": {
    cultureName: "Scrap Coast Caravans",
    vibe: "Salvage families · kart kin · jury-rigged scrap bots",
    layout: "cluster",
    roles: ["cash", "save", "spend", "protect"],
    landmarks: ["hut", "garden", "statue"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "scrap_bots",
  },
  "quest-keep": {
    cultureName: "Orbital Ledger Keep",
    vibe: "Colony guilds · supply mentors · probe escorts",
    layout: "keep",
    roles: ["protect", "plan", "save", "trade"],
    landmarks: ["statue", "tower", "garden"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "orbital_probes",
  },
  "ruin-realism": {
    cultureName: "Credit Ruin Clans",
    vibe: "Scattered scavengers · cautious pairs · scrap sentries",
    layout: "ruins",
    roles: ["credit", "protect", "plan"],
    landmarks: ["statue", "tower"],
    ecosystem: { families: 0, pairs: 1, loners: 2, animals: 1, machines: 2 },
    fauna: "scrap_bots",
  },
  "painterly-skies": {
    cultureName: "Sky Garden Commons",
    vibe: "Floating co-ops · dreamy loners · canopy bots on wind rails",
    layout: "floating",
    roles: ["invest", "save", "plan", "protect"],
    landmarks: ["garden", "tower", "hut"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "canopy_bots",
  },
  "neon-metropolis": {
    cultureName: "Signal Block Neighbors",
    vibe: "Dense street families · night traders · alley cats",
    layout: "strip",
    roles: ["invest", "credit", "trade", "spend"],
    landmarks: ["terminal", "stall", "antenna"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "neon_cats",
  },
  "broker-classic": {
    cultureName: "Exchange Floor Guild",
    vibe: "Pairs of brokers · lone analysts · ticker sparrows",
    layout: "plaza",
    roles: ["invest", "trade", "plan"],
    landmarks: ["terminal", "statue"],
    ecosystem: { families: 0, pairs: 1, loners: 1, animals: 1, machines: 1 },
    fauna: "quest_birds",
  },
};

const DEFAULT_CULTURE: Omit<IslandCulture, "id"> = {
  cultureName: "Archipelago Locals",
  vibe: "Mixed money folk · open plaza life",
  layout: "plaza",
  roles: ["cash", "save", "spend", "trade"],
  landmarks: ["stall", "garden"],
  ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 1 },
  fauna: "harbor_dogs",
};

/** Island-id overrides — genre-city identity even when visualStyle is shared. */
const CULTURE_BY_ISLAND: Record<string, Partial<Omit<IslandCulture, "id">>> = {
  coincraft_cove: {
    cultureName: "Canopy Craft Guild",
    vibe: "Solarpunk lagoon · earn · choose · shared gardens",
    layout: "crescent",
    roles: ["cash", "save", "spend", "trade"],
    landmarks: ["stall", "hut", "garden"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "canopy_bots",
  },
  starter_key_cove: {
    cultureName: "Starter Cay Co-op",
    vibe: "Sparse solar dunes · practice keys · quiet bots",
    layout: "crescent",
    roles: ["cash", "save", "plan"],
    landmarks: ["hut", "garden"],
    ecosystem: { families: 0, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "canopy_bots",
  },
  future_shores: {
    cultureName: "Aurora Commons",
    vibe: "Sky gardens · renewable portfolios · hopeful machines",
    layout: "floating",
    roles: ["invest", "save", "plan", "protect"],
    landmarks: ["garden", "tower", "hut"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "canopy_bots",
  },
  paycheck_peninsula: {
    cultureName: "Dotgraph Cognisphere",
    vibe: "AI Future floe · wages vs automation · companion minds",
    layout: "radar",
    roles: ["plan", "save", "cash"],
    landmarks: ["antenna", "terminal", "statue"],
    ecosystem: { families: 0, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "service_drones",
  },
  digital_assets: {
    cultureName: "Terminal Mind Nomads",
    vibe: "AI undercity · token traders · rights for silicon",
    layout: "strip",
    roles: ["trade", "invest", "plan"],
    landmarks: ["terminal", "antenna", "tower"],
    ecosystem: { families: 0, pairs: 1, loners: 2, animals: 1, machines: 2 },
    fauna: "service_drones",
  },
  signal_city: {
    cultureName: "Phosphor Gene Reef",
    vibe: "Biopunk brokers · living architecture · pulse schools",
    layout: "radar",
    roles: ["invest", "credit", "trade", "plan"],
    landmarks: ["terminal", "antenna", "tower"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "gene_critters",
  },
  venture_foundry: {
    cultureName: "Gridlock Corp Sprawl",
    vibe: "Cyberpunk inequality · debt neon · chrome wage packs",
    layout: "strip",
    roles: ["spend", "invest", "credit", "cash"],
    landmarks: ["terminal", "stall", "tower"],
    ecosystem: { families: 1, pairs: 1, loners: 2, animals: 1, machines: 2 },
    fauna: "neon_androids",
  },
  financial_assets: {
    cultureName: "Budget Scrap Racers",
    vibe: "Post-apoc kart coast · salvage budgets · patched bots",
    layout: "cluster",
    roles: ["cash", "save", "spend", "protect"],
    landmarks: ["hut", "statue", "garden"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "scrap_bots",
  },
  credit_kingdom: {
    cultureName: "Temple Credit Ruinfolk",
    vibe: "Collapsed credit · scarce trust · scrap sentries",
    layout: "ruins",
    roles: ["credit", "protect", "plan"],
    landmarks: ["statue", "tower"],
    ecosystem: { families: 0, pairs: 1, loners: 2, animals: 1, machines: 2 },
    fauna: "scrap_bots",
  },
  business_assets: {
    cultureName: "Diversify Orbital Keep",
    vibe: "Spacefaring portfolios · colony supply · probe escorts",
    layout: "keep",
    roles: ["protect", "plan", "save", "trade"],
    landmarks: ["statue", "tower", "garden"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "orbital_probes",
  },
  real_estate: {
    cultureName: "Colony Deed Auctioneers",
    vibe: "Orbital lots · habitat bids · vacuum dust",
    layout: "keep",
    roles: ["trade", "spend", "plan"],
    landmarks: ["statue", "terminal", "tower"],
    ecosystem: { families: 1, pairs: 1, loners: 1, animals: 1, machines: 2 },
    fauna: "orbital_probes",
  },
  intangibles: {
    cultureName: "Mindcliff Archivists",
    vibe: "Posthuman patents · uploaded selves · what still counts as you",
    layout: "floating",
    roles: ["plan", "protect", "invest"],
    landmarks: ["tower", "statue", "garden"],
    ecosystem: { families: 0, pairs: 1, loners: 2, animals: 1, machines: 2 },
    fauna: "mind_wisps",
  },
  demo: {
    cultureName: "Sandbox Gene Testers",
    vibe: "Biopunk chalk reef · lab buoys · try anything living",
    layout: "plaza",
    roles: ["plan", "cash", "save"],
    landmarks: ["terminal", "garden"],
    ecosystem: { families: 0, pairs: 0, loners: 1, animals: 1, machines: 2 },
    fauna: "gene_critters",
  },
};

export function getIslandCulture(island: IslandDefinition): IslandCulture {
  const theme = getIslandTheme(island.id, island.themeId);
  const base = CULTURE_BY_STYLE[theme.visualStyle] ?? DEFAULT_CULTURE;
  const override = CULTURE_BY_ISLAND[island.id] ?? {};
  const culture = { id: island.id, ...base, ...override };
  // Soft genre enrichment when vibe was not overridden
  const genre = getGenreWorld(island.id);
  if (genre && !CULTURE_BY_ISLAND[island.id]?.vibe) {
    culture.vibe = `${genre.label} · ${genre.tagline}`;
  }
  return culture;
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
  const S = SHORE_WORLD_SCALE;
  const scale = (a: ShoreAnchors): ShoreAnchors => ({
    pier: shoreXZ(a.pier[0], a.pier[2], a.pier[1]),
    party: shoreXZ(a.party[0], a.party[2], a.party[1]),
    journal: shoreXZ(a.journal[0], a.journal[2], a.journal[1]),
    padRadius: a.padRadius * S,
    npcRadius: a.npcRadius * S,
    itemRadius: a.itemRadius * S,
    npcAngle0: a.npcAngle0,
    npcCluster: a.npcCluster,
  });

  switch (culture.layout) {
    case "crescent":
      return scale({
        pier: [0, 0, 12.2],
        party: [-9.2, 0, 1.5],
        journal: [9.2, 0, 1.5],
        padRadius: 5.4,
        npcRadius: 8.4,
        itemRadius: 3.8,
        npcAngle0: -0.4,
        npcCluster: true,
      });
    case "radar":
      return scale({
        pier: [0, 0, 12.5],
        party: [-7.2, 0, -5.5],
        journal: [7.2, 0, -5.5],
        padRadius: 4.8,
        npcRadius: 9.6,
        itemRadius: 3.2,
        npcAngle0: Math.PI / 6,
        npcCluster: false,
      });
    case "strip":
      return scale({
        pier: [0, 0, 11.8],
        party: [-10.5, 0, -1],
        journal: [10.5, 0, -1],
        padRadius: 3.5,
        npcRadius: 6.5,
        itemRadius: 2.4,
        npcAngle0: 0,
        npcCluster: false,
      });
    case "cluster":
      return scale({
        pier: [2, 0, 11.5],
        party: [-8, 0, -4],
        journal: [8.5, 0, -3.5],
        padRadius: 6.8,
        npcRadius: 7.5,
        itemRadius: 4.5,
        npcAngle0: 0.8,
        npcCluster: true,
      });
    case "keep":
      return scale({
        pier: [0, 0, 12],
        party: [-6, 0, 6],
        journal: [6, 0, 6],
        padRadius: 5.0,
        npcRadius: 8.0,
        itemRadius: 3.5,
        npcAngle0: Math.PI,
        npcCluster: false,
      });
    case "ruins":
      return scale({
        pier: [-1.5, 0, 12.4],
        party: [-9.5, 0, -3],
        journal: [5.5, 0, -7],
        padRadius: 6.0,
        npcRadius: 10.0,
        itemRadius: 4.0,
        npcAngle0: 1.2,
        npcCluster: true,
      });
    case "floating":
      return scale({
        pier: [0, 0, 11],
        party: [-7.5, 0, 3],
        journal: [7.5, 0, 3],
        padRadius: 5.8,
        npcRadius: 9.0,
        itemRadius: 3.6,
        npcAngle0: -1,
        npcCluster: true,
      });
    default:
      return scale({
        pier: [0, 0, 11.5],
        party: [-8.5, 0, -2],
        journal: [8.5, 0, -2],
        padRadius: 6.2,
        npcRadius: 9.2,
        itemRadius: 4.4,
        npcAngle0: -Math.PI / 2,
        npcCluster: false,
      });
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
  /** Folk / business / artist / model / … within the 30 */
  persona?: NpcPersona;
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Non-interactive ambient life — families, loners, animals, genre machines.
 */
export function buildAmbientEcosystem(island: IslandDefinition): AmbientResident[] {
  const culture = getIslandCulture(island);
  const anchors = shoreAnchorsForCulture(culture);
  const out: AmbientResident[] = [];
  let n = 0;

  const place = (social: SocialKind, household: number | undefined, i: number, ring: number) => {
    const ang = culture.layout === "strip"
      ? (i - 2) * 0.55
      : anchors.npcAngle0 + (i / 8) * Math.PI * 2 + (household ?? 0) * 0.15;
    const r = ring + (hashStr(`${island.id}:${social}:${i}`) % 10) * 0.12;
    const x = culture.layout === "strip" ? (i % 2 === 0 ? -r : r) : Math.cos(ang) * r;
    const z = culture.layout === "strip" ? -2 + i * 1.4 : Math.sin(ang) * r;
    const seed = `${island.id}:${social}:${i}`;
    const cast = castPersonaMascot(island.id, seed);
    const scale =
      social === "animal"
        ? 0.45
        : social === "machine"
          ? 0.55
          : social === "family" && i % 3 === 2
            ? 0.65
            : 0.9;
    out.push({
      id: `ambient_${social}_${n++}`,
      social,
      mascotId: cast.mascot.id,
      position: [x, 0, z],
      scale,
      household,
      yaw: ang + Math.PI,
      persona: cast.persona,
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
  for (let m = 0; m < (culture.ecosystem.machines ?? 0); m++) {
    place("machine", undefined, m + 60, anchors.npcRadius + 0.8 + (m % 4) * 0.35);
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
  return castPersonaMascot(island.id, `${island.id}:${npcId}`).mascot;
}
