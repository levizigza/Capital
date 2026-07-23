/**
 * Capital Soundtrack — Fortune Archipelago score cues.
 *
 * Emotion first: warm Harbor courtyard, whimsical map, genre shores,
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
    title: "Harbor Courtyard",
    mood: "Warm Ordinary World — safe plaza, Coin Bag beside you",
    file: "audio/soundtrack/harbor_haven.ogg",
    gain: 0.55,
  },
  archipelago_map: {
    id: "archipelago_map",
    title: "Fortune Thread Map",
    mood: "Whimsical chart room — islands wait like paintings",
    file: "audio/soundtrack/archipelago_map.ogg",
    gain: 0.5,
  },
  voyage_carpet: {
    id: "voyage_carpet",
    title: "Carpet Over the Ledger Sea",
    mood: "Crossing — wind, wonder, the threshold hum",
    file: "audio/soundtrack/voyage_carpet.ogg",
    gain: 0.52,
  },
  solarpunk_cove: {
    id: "solarpunk_cove",
    title: "Canopy Craft Morning",
    mood: "Solarpunk lagoon — earn, share, gardens awake",
    file: "audio/soundtrack/solarpunk_cove.ogg",
    gain: 0.5,
  },
  neon_sprawl: {
    id: "neon_sprawl",
    title: "Wage-Neon Night",
    mood: "Cyber sprawl pulse — debt lights, chrome rush",
    file: "audio/soundtrack/neon_sprawl.ogg",
    gain: 0.42,
  },
  ai_undercity: {
    id: "ai_undercity",
    title: "Terminal Undercurrent",
    mood: "AI undercity hush — rights for silicon, quiet servers",
    file: "audio/soundtrack/ai_undercity.ogg",
    gain: 0.48,
  },
  scrap_coast: {
    id: "scrap_coast",
    title: "Salvage Budget Coast",
    mood: "Post-apoc workshop — patched bots, thrifty grit",
    file: "audio/soundtrack/scrap_coast.ogg",
    gain: 0.48,
  },
  orbital_keep: {
    id: "orbital_keep",
    title: "Colony Deed Horizon",
    mood: "Orbital keep — portfolios in vacuum dust",
    file: "audio/soundtrack/orbital_keep.ogg",
    gain: 0.5,
  },
  credit_ruins: {
    id: "credit_ruins",
    title: "Temple of Scarce Trust",
    mood: "Credit ruins — still air, careful steps",
    file: "audio/soundtrack/credit_ruins.ogg",
    gain: 0.46,
  },
  nocturne_void: {
    id: "nocturne_void",
    title: "Mindcliff Nocturne",
    mood: "Posthuman void — patents, uploaded selves",
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

export type MusicPlace =
  | { kind: "harbor" }
  | { kind: "map" }
  | { kind: "voyage" }
  | { kind: "talk" }
  | { kind: "shore"; islandId: string; genreId?: string | null }
  | { kind: "silence" };

export function cueForPlace(place: MusicPlace): MusicCueId | null {
  switch (place.kind) {
    case "harbor":
      return "harbor_haven";
    case "map":
      return "archipelago_map";
    case "voyage":
      return "voyage_carpet";
    case "talk":
      return "talk_soft";
    case "shore":
      return cueForIsland(place.islandId, place.genreId);
    case "silence":
      return null;
  }
}
