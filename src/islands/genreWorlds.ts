/**
 * Genre worlds — chapter islands as original Fortune Archipelago biome cities.
 *
 * Genre families (cyberpunk, solarpunk, …) are *lenses*, not franchise remakes.
 * Shipped names, cast, and machines must stay Capital-original (see ip-safe-design.md).
 * Harbor Haven stays the Ordinary World (no genre overlay).
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
  /** Player-facing genre family (encyclopedia label) */
  label: string;
  /**
   * Original Capital canon name for this future — never a franchise title.
   * Prefer this over `label` in HUD hero copy.
   */
  canonName: string;
  /** Default city-scale name when no district override */
  cityLabel: string;
  tagline: string;
  moneyLesson: string;
  populace: string;
  machines: string;
  /** Signature Money-world roles kids can retell */
  signatureCast: string[];
  /** Signature machines / bots (original silhouettes only) */
  signatureMachines: string[];
  /** Internal hygiene — never ship these strings in dialogue/UI */
  forbiddenEchoes: string[];
  accentHint: string;
};

/** Per-island district of a genre city — keeps sister islands from feeling cloned. */
export type GenreDistrict = {
  islandId: string;
  genreId: GenreWorldId;
  /** District nickname on the map / shore */
  districtName: string;
  /** One-sentence place feel */
  feel: string;
  /** Who you meet first here */
  greeter: string;
  /** Local machine that defines the skyline */
  landmarkMachine: string;
};

export const GENRE_WORLDS: Record<GenreWorldId, GenreWorld> = {
  cyberpunk: {
    id: "cyberpunk",
    label: "Cyberpunk",
    canonName: "Ledgerlight Sprawl",
    cityLabel: "Wage-Neon Districts",
    tagline: "Tech races ahead — fairness lags behind",
    moneyLesson: "Debt, wages, and who owns the tools that own you",
    populace: "Night-shift brokers, street vendors, chrome-paycheck crews",
    machines: "Billboard drones, payday kiosks, corp-patrol carts",
    signatureCast: ["Chrome Cashier", "Overtime Owl", "Debt Neon Runner"],
    signatureMachines: ["Payday Kiosk", "Sky-Ad Drone", "Wage-Gate Turnstile"],
    forbiddenEchoes: [
      "night city",
      "blade runner",
      "cyberpunk 2077",
      "ghost in the shell",
      "replicants",
    ],
    accentHint: "#22d3ee",
  },
  solarpunk: {
    id: "solarpunk",
    label: "Solarpunk",
    canonName: "Verdant Shareholds",
    cityLabel: "Canopy Commons",
    tagline: "Tools that heal the garden they live in",
    moneyLesson: "Shared wealth, renewables, and community ownership",
    populace: "Garden guilds, co-op craftsfolk, canopy farmers",
    machines: "Solar harvesters, compost bots, wind-sail ferries",
    signatureCast: ["Seed Treasurer", "Canopy Weaver", "Commons Mayor"],
    signatureMachines: ["Leaf-Panel Tree", "Compost Cricket Bot", "Wind-Sail Ferry"],
    forbiddenEchoes: ["studio ghibli", "totoro", "howl", "nausicaa"],
    accentHint: "#4ade80",
  },
  biopunk: {
    id: "biopunk",
    label: "Biopunk",
    canonName: "Helix Harbor",
    cityLabel: "Living-Ledger Reef",
    tagline: "Life itself can be coded — and priced",
    moneyLesson: "Who owns living capital — DNA, health, and growth",
    populace: "Gene brokers, reef biologists, pulse-market clerks",
    machines: "Living archways, petri-drones, pulse incubators",
    signatureCast: ["Pulse Broker", "Reef Vet", "Clone-Coupon Clerk"],
    signatureMachines: ["Gene Pod Stack", "Petri Drone", "Pulse Incubator"],
    forbiddenEchoes: ["bioshock", "rapture", "gattaca", "orphan black", "plasmids"],
    accentHint: "#34d399",
  },
  posthuman: {
    id: "posthuman",
    label: "Posthuman",
    canonName: "Selfstock Archive",
    cityLabel: "Mindcliff Vaults",
    tagline: "Bodies rewrite — what still counts as you?",
    moneyLesson: "What is still yours when minds and bodies can be rewritten",
    populace: "Uploaded sages, hybrid librarians, patent-of-self advocates",
    machines: "Upload spires, chassis racks, consciousness relays",
    signatureCast: ["Selfstock Notary", "Chassis Tailor", "Echo Librarian"],
    signatureMachines: ["Upload Spire", "Chassis Rack", "Echo Relay"],
    forbiddenEchoes: ["altered carbon", "the culture", "transcendence", "sleeves"],
    accentHint: "#c084fc",
  },
  spacefaring: {
    id: "spacefaring",
    label: "Spacefaring",
    canonName: "Voidfolio Reach",
    cityLabel: "Orbital Deed Rings",
    tagline: "Fortune spreads past one sky",
    moneyLesson: "Colonies, supply lines, and diversifying across worlds",
    populace: "Dock officers, rock miners, void deed auctioneers",
    machines: "Orbital dishes, cargo drones, habitat scaffolds",
    signatureCast: ["Dock Dividend Officer", "Asteroid Claimant", "Habitat Auctioneer"],
    signatureMachines: ["Orbital Dish", "Cargo Hex-Drone", "Habitat Scaffold"],
    forbiddenEchoes: ["the expanse", "star trek", "dune", "spice", "belter"],
    accentHint: "#60a5fa",
  },
  post_apocalyptic: {
    id: "post_apocalyptic",
    label: "Post-Apocalyptic",
    canonName: "Afterledger Wastes",
    cityLabel: "Scrap-Budget Coasts",
    tagline: "After the fall — budgets from salvage",
    moneyLesson: "Rebuild budgets from salvage — credit scars and scarce trust",
    populace: "Kart scavengers, ruin clans, barter caravans",
    machines: "Jury-rigged bots, wreckage towers, patched generators",
    signatureCast: ["Scrap Treasurer", "Ruin Cartographer", "Barter Marshal"],
    signatureMachines: ["Patchwork Generator", "Wreckage Crane", "Jury Bot"],
    forbiddenEchoes: ["mad max", "fallout", "the last of us", "vault-tec", "fury road"],
    accentHint: "#fb923c",
  },
  ai_future: {
    id: "ai_future",
    label: "AI Future",
    canonName: "Mindwage Terminal",
    cityLabel: "Companion Ticker Floes",
    tagline: "New minds clock in beside us",
    moneyLesson: "Automation, wages, and who the new minds work for",
    populace: "Plotter guilds, companion AIs, silicon-rights advocates",
    machines: "Service androids, ticker AIs, cognisphere relays",
    signatureCast: ["Companion Ticker", "Rights Advocate Bit", "Plotter Steward"],
    signatureMachines: ["Service Android", "Ticker Relay", "Cognisphere Node"],
    forbiddenEchoes: ["westworld", "the matrix", "i, robot", "her (film)", "skynet"],
    accentHint: "#e2e8f0",
  },
};

/**
 * Island → genre city. Harbor omitted (Ordinary World).
 * Sister islands are *districts* of the same future, not clones.
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

export const GENRE_DISTRICTS: Record<string, GenreDistrict> = {
  coincraft_cove: {
    islandId: "coincraft_cove",
    genreId: "solarpunk",
    districtName: "Lagoon Sharehold",
    feel: "First painting — co-op docks where earn/choose/save still smell like salt and citrus",
    greeter: "Seed Treasurer Cap’n Penny",
    landmarkMachine: "Wind-Sail Ferry buoy",
  },
  starter_key_cove: {
    islandId: "starter_key_cove",
    genreId: "solarpunk",
    districtName: "Practice Cay",
    feel: "Quiet solar dunes for first keys — bots nap between tutorials",
    greeter: "Commons Tutor Finch",
    landmarkMachine: "Tiny Leaf-Panel Tree",
  },
  future_shores: {
    islandId: "future_shores",
    genreId: "solarpunk",
    districtName: "Aurora Terrace",
    feel: "Sky gardens where portfolios weather like climate — hopeful machines on wind rails",
    greeter: "Canopy Weaver Lumen",
    landmarkMachine: "Floating compost cricket choir",
  },
  paycheck_peninsula: {
    islandId: "paycheck_peninsula",
    genreId: "ai_future",
    districtName: "Dotgraph Floe",
    feel: "Oscilloscope ice where companion tickers plot thrift constellations",
    greeter: "Plotter Steward Dot",
    landmarkMachine: "Cognisphere Node iceberg",
  },
  digital_assets: {
    islandId: "digital_assets",
    genreId: "ai_future",
    districtName: "Token Undercity",
    feel: "Obsidian vents — silicon rights meetings beside glowing ledgers",
    greeter: "Rights Advocate Bit",
    landmarkMachine: "Service Android queue",
  },
  signal_city: {
    islandId: "signal_city",
    genreId: "biopunk",
    districtName: "Phosphor Gene Ring",
    feel: "Living architecture that trades pulse fuel like inflation tides",
    greeter: "Pulse Broker Reef",
    landmarkMachine: "Gene Pod Stack mangrove",
  },
  demo: {
    islandId: "demo",
    genreId: "biopunk",
    districtName: "Chalk Petri Yard",
    feel: "Sandbox lab buoys — try any living ledger safely",
    greeter: "Reef Vet Scratch",
    landmarkMachine: "Petri Drone carousel",
  },
  venture_foundry: {
    islandId: "venture_foundry",
    genreId: "cyberpunk",
    districtName: "Gridlock Galleria Strip",
    feel: "Wage-neon boulevard — retirement race under debt billboards",
    greeter: "Chrome Cashier Vex",
    landmarkMachine: "Sky-Ad Drone swarm",
  },
  financial_assets: {
    islandId: "financial_assets",
    genreId: "post_apocalyptic",
    districtName: "Kart Salvage Coast",
    feel: "Scrap budgets on patched wheels — hearts still count as currency of care",
    greeter: "Scrap Treasurer Kart",
    landmarkMachine: "Jury Bot pit crew",
  },
  credit_kingdom: {
    islandId: "credit_kingdom",
    genreId: "post_apocalyptic",
    districtName: "Temple Afterledger",
    feel: "Collapsed credit ziggurats — scarce trust, scarred scores",
    greeter: "Ruin Cartographer Moss",
    landmarkMachine: "Wreckage Crane idol",
  },
  business_assets: {
    islandId: "business_assets",
    genreId: "spacefaring",
    districtName: "Diversify Orbital Keep",
    feel: "Gem asset classes shipped between colony rings",
    greeter: "Dock Dividend Officer Quill",
    landmarkMachine: "Orbital Dish keep tower",
  },
  real_estate: {
    islandId: "real_estate",
    genreId: "spacefaring",
    districtName: "Deed Auction Mesa",
    feel: "Habitat lots bid in vacuum dust — deeds as star maps",
    greeter: "Habitat Auctioneer Lot",
    landmarkMachine: "Habitat Scaffold crane",
  },
  intangibles: {
    islandId: "intangibles",
    genreId: "posthuman",
    districtName: "Mindcliff Patent Library",
    feel: "Mist vaults for ideas you can’t touch — and selves you might rewrite",
    greeter: "Selfstock Notary Echo",
    landmarkMachine: "Upload Spire colonnade",
  },
};

export function getGenreWorld(islandId: string): GenreWorld | null {
  if (islandId === "harbor_haven") return null;
  const id = GENRE_BY_ISLAND[islandId];
  return id ? GENRE_WORLDS[id] : null;
}

export function getGenreDistrict(islandId: string): GenreDistrict | null {
  if (islandId === "harbor_haven") return null;
  return GENRE_DISTRICTS[islandId] ?? null;
}

/** Shore / map subtitle — canon world + district when available. */
export function genreHudLine(islandId: string): string | null {
  const g = getGenreWorld(islandId);
  if (!g) return null;
  const d = getGenreDistrict(islandId);
  if (d) return `${g.canonName} · ${d.districtName}`;
  return `${g.canonName} · ${g.cityLabel}`;
}

/** Longer coach blurb for shore HUD (IP-safe original copy only). */
export function genreShoreBlurb(islandId: string): string | null {
  const g = getGenreWorld(islandId);
  const d = getGenreDistrict(islandId);
  if (!g) return null;
  if (d) {
    return `${g.tagline} · Meet ${d.greeter} · Landmark: ${d.landmarkMachine}`;
  }
  return `${g.tagline} · ${g.machines}`;
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

/** True if text accidentally echoes a forbidden franchise phrase. */
export function textHasForbiddenGenreEcho(text: string): boolean {
  const lower = text.toLowerCase();
  for (const world of Object.values(GENRE_WORLDS)) {
    for (const echo of world.forbiddenEchoes) {
      if (lower.includes(echo.toLowerCase())) return true;
    }
  }
  return false;
}
