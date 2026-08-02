/**
 * Capital Soundtrack — Fortune Archipelago score cues.
 *
 * Wave 6 — Organ Score: spine beds speak Memory · Coin · Clock · Spiral.
 * Genre-city cues remain for off-spine packs; player titles prefer organ language.
 *
 * Emotion first: warm Harbor courtyard, whimsical map, organ shores,
 * soft Talk Battle. Inspired by classic adventure-game *feel* only —
 * no Nintendo (or other franchise) audio is used.
 *
 * All bundled tracks are CC0 / Public Domain (see MANIFEST.json + CREDITS.txt).
 */

export type MusicCueId =
  | "harbor_haven"
  | "archipelago_map"
  | "voyage_carpet"
  | "solarpunk_cove"
  | "neon_sprawl"
  | "ai_undercity"
  | "scrap_coast"
  | "orbital_keep"
  | "credit_ruins"
  | "nocturne_void"
  | "talk_soft";

export type SoundtrackTrack = {
  id: MusicCueId;
  /** Player-facing Capital title (not the source track name) */
  title: string;
  /** One-line mood for credits / debug */
  mood: string;
  /** Path under public/ (joined with BASE_URL at runtime) */
  file: string;
  /** Default loop volume 0–1 before global music volume */
  gain?: number;
};

export const SOUNDTRACK: Record<MusicCueId, SoundtrackTrack> = {
  harbor_haven: {
    id: "harbor_haven",
    title: "Memory Courtyard",
    mood: "Memory organ — warm Ordinary World; plaza remembers what you did",
    file: "audio/soundtrack/harbor_haven.ogg",
    gain: 0.55,
  },
  archipelago_map: {
    id: "archipelago_map",
    title: "Fortune Thread Map",
    mood: "Whimsical chart room — Harbor · Cove · Paycheck · Credit wait like paintings",
    file: "audio/soundtrack/archipelago_map.ogg",
    gain: 0.5,
  },
  voyage_carpet: {
    id: "voyage_carpet",
    title: "Carpet Over the Ledger Sea",
    mood: "Crossing — wind, wonder, the threshold hum between organs",
    file: "audio/soundtrack/voyage_carpet.ogg",
    gain: 0.52,
  },
  solarpunk_cove: {
    id: "solarpunk_cove",
    title: "Coin Jar Morning",
    mood: "Coin organ — hold, Take, hush; gardens awake around the jar",
    file: "audio/soundtrack/solarpunk_cove.ogg",
    gain: 0.5,
  },
  neon_sprawl: {
    id: "neon_sprawl",
    title: "Wage-Neon Night",
    mood: "Off-spine pulse — chrome rush (not the Clock organ bed)",
    file: "audio/soundtrack/neon_sprawl.ogg",
    gain: 0.42,
  },
  ai_undercity: {
    id: "ai_undercity",
    title: "Clock Stamp Shift",
    mood: "Clock organ — earn, stamp, shelter; payday rhythm under the tower",
    file: "audio/soundtrack/ai_undercity.ogg",
    gain: 0.48,
  },
  scrap_coast: {
    id: "scrap_coast",
    title: "Salvage Budget Coast",
    mood: "Off-spine workshop — patched grit",
    file: "audio/soundtrack/scrap_coast.ogg",
    gain: 0.48,
  },
  orbital_keep: {
    id: "orbital_keep",
    title: "Colony Deed Horizon",
    mood: "Off-spine keep — portfolios in vacuum dust",
    file: "audio/soundtrack/orbital_keep.ogg",
    gain: 0.5,
  },
  credit_ruins: {
    id: "credit_ruins",
    title: "Spiral Interest Keep",
    mood: "Spiral organ — borrow, weigh, withstand; interest as gravity",
    file: "audio/soundtrack/credit_ruins.ogg",
    gain: 0.46,
  },
  nocturne_void: {
    id: "nocturne_void",
    title: "Mindcliff Nocturne",
    mood: "Off-spine void — patents, uploaded selves",
    file: "audio/soundtrack/nocturne_void.ogg",
    gain: 0.4,
  },
  talk_soft: {
    id: "talk_soft",
    title: "Talk Battle Soft",
    mood: "Intimate duel of words — just you and them",
    file: "audio/soundtrack/talk_soft.ogg",
    gain: 0.38,
  },
};

/** Island id → shore cue (genre-city identity) */
const ISLAND_CUE: Record<string, MusicCueId> = {
  harbor_haven: "harbor_haven",
  coincraft_cove: "solarpunk_cove",
  starter_key_cove: "solarpunk_cove",
  future_shores: "solarpunk_cove",
  paycheck_peninsula: "ai_undercity",
  digital_assets: "ai_undercity",
  signal_city: "solarpunk_cove", // biopunk pulse — living gardens of capital
  venture_foundry: "neon_sprawl",
  financial_assets: "scrap_coast",
  credit_kingdom: "credit_ruins",
  business_assets: "orbital_keep",
  real_estate: "orbital_keep",
  intangibles: "nocturne_void",
  demo: "solarpunk_cove",
};

/** Genre family → default shore cue when island not listed */
const GENRE_CUE: Record<string, MusicCueId> = {
  solarpunk: "solarpunk_cove",
  cyberpunk: "neon_sprawl",
  biopunk: "solarpunk_cove",
  ai_future: "ai_undercity",
  post_apocalyptic: "scrap_coast",
  spacefaring: "orbital_keep",
  posthuman: "nocturne_void",
};

export function cueForIsland(islandId: string, genreId?: string | null): MusicCueId {
  if (ISLAND_CUE[islandId]) return ISLAND_CUE[islandId]!;
  if (genreId && GENRE_CUE[genreId]) return GENRE_CUE[genreId]!;
  return "solarpunk_cove";
}

export type StructureOrganPlace = "memory" | "coin" | "clock" | "spiral";

export type MusicPlace =
  | {
      kind: "harbor";
      /** Spectacle / share — duck Memory bed so Harbor-felt stingers read */
      hush?: boolean;
    }
  | { kind: "map" }
  | { kind: "voyage" }
  | { kind: "talk" }
  | { kind: "opening" }
  | {
      kind: "shore";
      islandId: string;
      genreId?: string | null;
      /** After irreversible Take — organ bed ducks into hush */
      hush?: boolean;
    }
  /** Inside a Money Structure — organ bed, ducked quieter than shore/plaza */
  | { kind: "structure"; organ: StructureOrganPlace }
  | { kind: "silence" };

/** Organ interior beds — same spine cues, ducked at play time. */
const STRUCTURE_ORGAN_CUE: Record<StructureOrganPlace, MusicCueId> = {
  memory: "harbor_haven",
  coin: "solarpunk_cove",
  clock: "ai_undercity",
  spiral: "credit_ruins",
};

/** Player-facing organ bed titles for the frozen spine (Wave 6). */
export const SPINE_ORGAN_CUE: Record<StructureOrganPlace, MusicCueId> = {
  ...STRUCTURE_ORGAN_CUE,
};

export function cueForPlace(place: MusicPlace): MusicCueId | null {
  switch (place.kind) {
    case "harbor":
      return "harbor_haven";
    case "map":
      return "archipelago_map";
    case "voyage":
      return "voyage_carpet";
    case "opening":
      /** Title mural — same wonder cue as carpet threshold (brand invitation). */
      return "voyage_carpet";
    case "talk":
      return "talk_soft";
    case "shore":
      return cueForIsland(place.islandId, place.genreId);
    case "structure":
      return STRUCTURE_ORGAN_CUE[place.organ];
    case "silence":
      return null;
  }
}

/** Structure interiors + post-Take / spectacle hush duck so stingers read. */
export function gainScaleForPlace(place: MusicPlace): number {
  if (place.kind === "structure") return 0.58;
  if (place.kind === "shore" && place.hush) return 0.32;
  if (place.kind === "harbor" && place.hush) return 0.36;
  return 1;
}
