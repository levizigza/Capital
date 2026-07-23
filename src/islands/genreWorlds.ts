/**
 * Genre worlds — each chapter island is a biome city from a distinct future.
 * Harbor Haven stays the Ordinary World (no genre overlay).
 *
 * Financial literacy stays the lesson; the genre is the world you practice it in.
 */

export type GenreWorldId =
  | "cyberpunk"
  | "solarpunk"
  | "biopunk"
  | "posthuman"
  | "spacefaring"
  | "post_apocalyptic"
  | "ai_future";

export type GenreWorld = {
  id: GenreWorldId;
  /** Short label for HUD / map */
  label: string;
  /** City-scale name used on shores */
  cityLabel: string;
  tagline: string;
  /** What money-feeling this future teaches */
  moneyLesson: string;
  /** Who lives here besides Money Mascots */
  populace: string;
  /** Machines / robots flavor line */
  machines: string;
  accentHint: string;
};

export const GENRE_WORLDS: Record<GenreWorldId, GenreWorld> = {
  cyberpunk: {
    id: "cyberpunk",
    label: "Cyberpunk",
    cityLabel: "Neon Corp Sprawl",
    tagline: "Technology without equality",
    moneyLesson: "Debt, wages, and who owns the tools that own you",
    populace: "Night-shift brokers, street vendors, chrome-augmented workers",
    machines: "Surveillance drones, payday kiosks, corp mechs on patrol",
    accentHint: "#22d3ee",
  },
  solarpunk: {
    id: "solarpunk",
    label: "Solarpunk",
    cityLabel: "Canopy Commons",
    tagline: "Technology in harmony with nature",
    moneyLesson: "Shared wealth, renewables, and community ownership",
    populace: "Garden guilds, co-op craftsfolk, canopy farmers",
    machines: "Solar harvesters, compost bots, wind-sail ferries",
    accentHint: "#4ade80",
  },
  biopunk: {
    id: "biopunk",
    label: "Biopunk",
    cityLabel: "Gene Reef City",
    tagline: "Biology becomes programmable",
    moneyLesson: "Who owns living capital — DNA, health, and growth",
    populace: "Gene brokers, reef biologists, clone-market clerks",
    machines: "Living architecture, petri-drones, pulse incubators",
    accentHint: "#34d399",
  },
  posthuman: {
    id: "posthuman",
    label: "Posthuman",
    cityLabel: "Mindcliff Archive",
    tagline: "Humanity evolves beyond humanity",
    moneyLesson: "What is still yours when minds and bodies can be rewritten",
    populace: "Uploaded sages, hybrid librarians, patent-of-self advocates",
    machines: "Upload spires, body-chassis racks, consciousness relays",
    accentHint: "#c084fc",
  },
  spacefaring: {
    id: "spacefaring",
    label: "Spacefaring",
    cityLabel: "Orbital Portfolio Keep",
    tagline: "Civilization expands beyond Earth",
    moneyLesson: "Colonies, supply lines, and diversifying across worlds",
    populace: "Dock officers, asteroid miners, deed auctioneers of the void",
    machines: "Orbital dishes, cargo drones, habitat scaffolds",
    accentHint: "#60a5fa",
  },
  post_apocalyptic: {
    id: "post_apocalyptic",
    label: "Post-Apocalyptic",
    cityLabel: "Scrap Coast Ruins",
    tagline: "Civilization after collapse",
    moneyLesson: "Rebuild budgets from salvage — credit scars and scarce trust",
    populace: "Kart scavengers, ruin clans, barter caravans",
    machines: "Jury-rigged bots, wreckage towers, patched generators",
    accentHint: "#fb923c",
  },
  ai_future: {
    id: "ai_future",
    label: "AI Future",
    cityLabel: "Cognisphere Terminal",
    tagline: "Humanity shares the world with new minds",
    moneyLesson: "Automation, wages, and who the new minds work for",
    populace: "Plotter guilds, companion AIs, rights advocates for silicon",
    machines: "Service androids, ticker AIs, cognisphere relays",
    accentHint: "#e2e8f0",
  },
};

/**
 * Island → genre city. Harbor omitted on purpose (Ordinary World).
 * Sister islands share a genre as districts of the same future.
 */
export const GENRE_BY_ISLAND: Record<string, GenreWorldId> = {
  coincraft_cove: "solarpunk",
  starter_key_cove: "solarpunk",
  future_shores: "solarpunk",
  paycheck_peninsula: "ai_future",
  digital_assets: "ai_future",
  signal_city: "biopunk",
  demo: "biopunk",
  venture_foundry: "cyberpunk",
  financial_assets: "post_apocalyptic",
  credit_kingdom: "post_apocalyptic",
  business_assets: "spacefaring",
  real_estate: "spacefaring",
  intangibles: "posthuman",
};

export function getGenreWorld(islandId: string): GenreWorld | null {
  if (islandId === "harbor_haven") return null;
  const id = GENRE_BY_ISLAND[islandId];
  return id ? GENRE_WORLDS[id] : null;
}

/** One-line shore / map subtitle. */
export function genreHudLine(islandId: string): string | null {
  const g = getGenreWorld(islandId);
  if (!g) return null;
  return `${g.label} · ${g.cityLabel}`;
}

export function allGenreWorldsPresent(): boolean {
  const needed: GenreWorldId[] = [
    "cyberpunk",
    "solarpunk",
    "biopunk",
    "posthuman",
    "spacefaring",
    "post_apocalyptic",
    "ai_future",
  ];
  const present = new Set(Object.values(GENRE_BY_ISLAND));
  return needed.every((id) => present.has(id));
}
