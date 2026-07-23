/**
 * Each Capital game island is modeled on a real Galápagos island —
 * endemic wildlife, volcanic terrain, and ecological character.
 */

export type GalapagosTerrain = "lush-highlands" | "shield-volcano" | "young-lava" | "arid-coast" | "bird-cliffs" | "red-beach";

export type GalapagosProfile = {
  galapagosName: string;
  endemicIcon: string;
  endemicName: string;
  terrain: GalapagosTerrain;
  lava: string;
  vegetation: string;
  shore: string;
  tagline: string;
  ecology: string;
};

const DEFAULT_PROFILE: GalapagosProfile = {
  galapagosName: "Uncharted Isle",
  endemicIcon: "🦎",
  endemicName: "Marine iguana",
  terrain: "arid-coast",
  lava: "#3f3f46",
  vegetation: "#4d7c0f",
  shore: "#d6d3d1",
  tagline: "Volcanic shores of the archipelago",
  ecology: "Each island evolves its own lesson in adaptation.",
};

export const GALAPAGOS_PROFILES: Record<string, GalapagosProfile> = {
  harbor_haven: {
    galapagosName: "Santa Cruz",
    endemicIcon: "🐢",
    endemicName: "Giant tortoise",
    terrain: "lush-highlands",
    lava: "#52525b",
    vegetation: "#65a30d",
    shore: "#e7e5e4",
    tagline: "Highland forests & the main settlement",
    ecology: "The archipelago hub — tortoises, research, and calm lagoons.",
  },
  coincraft_cove: {
    galapagosName: "Santa Cruz",
    endemicIcon: "🐢",
    endemicName: "Giant tortoise",
    terrain: "lush-highlands",
    lava: "#52525b",
    vegetation: "#65a30d",
    shore: "#e7e5e4",
    tagline: "Craft coves off the main settlement",
    ecology: "First painting — earn, choose, return changed.",
  },
  financial_assets: {
    galapagosName: "Isabela",
    endemicIcon: "🐧",
    endemicName: "Galápagos penguin",
    terrain: "shield-volcano",
    lava: "#27272a",
    vegetation: "#3f6212",
    shore: "#a8a29e",
    tagline: "Six volcanoes — the largest island",
    ecology: "Diverse markets like diverse habitats on one vast shield.",
  },
  signal_city: {
    galapagosName: "Genovesa",
    endemicIcon: "🦅",
    endemicName: "Red-footed booby",
    terrain: "bird-cliffs",
    lava: "#44403c",
    vegetation: "#365314",
    shore: "#fafaf9",
    tagline: "Bird Island — cliffs full of signals",
    ecology: "Frigatebirds and boobies crowd the rim like data on a chart.",
  },
  paycheck_peninsula: {
    galapagosName: "San Cristóbal",
    endemicIcon: "🦭",
    endemicName: "Sea lion",
    terrain: "arid-coast",
    lava: "#57534e",
    vegetation: "#4d7c0f",
    shore: "#fde68a",
    tagline: "Provincial capital & sea-lion beaches",
    ecology: "Where paychecks meet the tide — practical life on the coast.",
  },
  business_assets: {
    galapagosName: "Santiago",
    endemicIcon: "🦎",
    endemicName: "Marine iguana",
    terrain: "young-lava",
    lava: "#1c1917",
    vegetation: "#3f6212",
    shore: "#d6d3d1",
    tagline: "Lava fields & fur-seal grottos",
    ecology: "Raw rock and business hustle — assets forged in volcanic soil.",
  },
  digital_assets: {
    galapagosName: "Fernandina",
    endemicIcon: "🐦",
    endemicName: "Flightless cormorant",
    terrain: "young-lava",
    lava: "#18181b",
    vegetation: "#14532d",
    shore: "#78716c",
    tagline: "Youngest island — still cooling",
    ecology: "The newest lava flows; volatile ground for volatile markets.",
  },
  real_estate: {
    galapagosName: "Floreana",
    endemicIcon: "🦩",
    endemicName: "Flamingo",
    terrain: "arid-coast",
    lava: "#57534e",
    vegetation: "#65a30d",
    shore: "#fcd34d",
    tagline: "Post Office Bay & pink lagoon",
    ecology: "Stories of settlement — who owns the shore?",
  },
  venture_foundry: {
    galapagosName: "Bartolomé",
    endemicIcon: "🦈",
    endemicName: "Galápagos shark",
    terrain: "shield-volcano",
    lava: "#3f3f46",
    vegetation: "#166534",
    shore: "#fef3c7",
    tagline: "Pinnacle Rock & pioneer spirit",
    ecology: "Iconic spire — startups climbing from the sea.",
  },
  intangibles: {
    galapagosName: "Española",
    endemicIcon: "🐦",
    endemicName: "Waved albatross",
    terrain: "bird-cliffs",
    lava: "#44403c",
    vegetation: "#3f6212",
    shore: "#ffffff",
    tagline: "Endemic albatross dances",
    ecology: "Ideas you can't touch — species found nowhere else on Earth.",
  },
  future_shores: {
    galapagosName: "Darwin",
    endemicIcon: "🐢",
    endemicName: "Giant tortoise",
    terrain: "lush-highlands",
    lava: "#3f3f46",
    vegetation: "#15803d",
    shore: "#e5e5e5",
    tagline: "Remote northern frontier",
    ecology: "Unfinished shores for the next generation to shape.",
  },
  starter_key_cove: {
    galapagosName: "North Seymour",
    endemicIcon: "🦎",
    endemicName: "Land iguana",
    terrain: "arid-coast",
    lava: "#52525b",
    vegetation: "#4d7c0f",
    shore: "#fde68a",
    tagline: "Flat scrub & nesting boobies",
    ecology: "A gentle first landing — learn the ropes ashore.",
  },
  credit_kingdom: {
    galapagosName: "Rábida",
    endemicIcon: "🦭",
    endemicName: "Sea lion",
    terrain: "red-beach",
    lava: "#7f1d1d",
    vegetation: "#365314",
    shore: "#dc2626",
    tagline: "Famous red sand beach",
    ecology: "Distinctive shores — credit stands out like iron-rich sand.",
  },
};

export function getGalapagosProfile(islandId: string): GalapagosProfile {
  return GALAPAGOS_PROFILES[islandId] ?? { ...DEFAULT_PROFILE, galapagosName: islandId.replace(/_/g, " ") };
}

export const GALAPAGOS_ARCHIPELAGO_NAME = "Galápagos Archipelago";
export const GALAPAGOS_HUB_LABEL = "Santa Cruz · Main Island";
