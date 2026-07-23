/**
 * NPC personas — variety within the existing 30 Money Mascots.
 * Tribal/folk, business, artists, models, scouts, scholars, scrap crews, tech crews.
 * No new body forms; casting + gear + coat make the vibe readable.
 */

import type { MoneyMascotId, MoneyMascot } from "./moneyCast";
import { MONEY_CAST, getMascot, mascotToCharacter, type MascotCharacterLook } from "./moneyCast";
import type { GenreWorldId } from "./genreWorlds";
import { GENRE_BY_ISLAND } from "./genreWorlds";

export type NpcPersona =
  | "folk_clan" // tribal / craft clans
  | "business" // brokers, clerks, officers
  | "artist" // makers, performers
  | "model" // glam / runway fortune
  | "scout" // explorers, kart racers
  | "scholar" // librarians, plotters
  | "scrap_crew" // salvage / rebuild
  | "tech_crew"; // chrome / AI / gene techs

export type PersonaKit = {
  id: NpcPersona;
  label: string;
  /** Preferred mascot ids from the 30 */
  mascotIds: MoneyMascotId[];
  accessories: string[];
  colors: string[];
};

export const PERSONA_KITS: Record<NpcPersona, PersonaKit> = {
  folk_clan: {
    id: "folk_clan",
    label: "Folk / clan",
    mascotIds: ["baggy_bucks", "wallet_walt", "tip_jar_tom", "coiny", "piggy_penny", "safe_sally"],
    accessories: ["bandana", "lantern", "scarf", "sash"],
    colors: ["marigold", "seafoam", "coral"],
  },
  business: {
    id: "business",
    label: "Business",
    mascotIds: ["budget_bot", "receipt_rita", "tax_tally", "vault_vince", "trade_buddy", "dividend_dan"],
    accessories: ["vest", "headset", "cap", "goggles"],
    colors: ["ink", "ledger", "tide"],
  },
  artist: {
    id: "artist",
    label: "Artist",
    mascotIds: ["coupon_cutie", "spendy_sue", "tip_jar_tom", "saver_star", "cash_stack_jack"],
    accessories: ["sash", "scarf", "lantern", "cape"],
    colors: ["coral", "marigold", "seafoam"],
  },
  model: {
    id: "model",
    label: "Model / glam",
    mascotIds: ["goldie_bar", "market_money", "saver_star", "euro_ella", "pound_pal"],
    accessories: ["cape", "goggles", "sash", "cap"],
    colors: ["coral", "tide", "marigold"],
  },
  scout: {
    id: "scout",
    label: "Scout / explorer",
    mascotIds: ["dollar_dash", "risk_rocket", "coiny", "wallet_walt", "yen_yogi"],
    accessories: ["goggles", "bandana", "cap", "lantern"],
    colors: ["seafoam", "tide", "ink"],
  },
  scholar: {
    id: "scholar",
    label: "Scholar",
    mascotIds: ["budget_bot", "future_fund", "receipt_rita", "trade_buddy", "tax_tally"],
    accessories: ["goggles", "scarf", "headset", "vest"],
    colors: ["ledger", "ink", "tide"],
  },
  scrap_crew: {
    id: "scrap_crew",
    label: "Scrap crew",
    mascotIds: ["debt_cloud", "loan_ranger", "safe_sally", "vault_vince", "baggy_bucks"],
    accessories: ["vest", "bandana", "headset", "lantern"],
    colors: ["ink", "marigold", "coral"],
  },
  tech_crew: {
    id: "tech_crew",
    label: "Tech crew",
    mascotIds: ["crypto_coin", "budget_bot", "risk_rocket", "market_money", "tax_tally"],
    accessories: ["headset", "goggles", "cape", "vest"],
    colors: ["ink", "tide", "seafoam"],
  },
};

/** Genre city → persona mix (weights by list order / repetition). */
export const PERSONAS_BY_GENRE: Record<GenreWorldId, NpcPersona[]> = {
  cyberpunk: ["business", "tech_crew", "model", "scout", "business", "tech_crew"],
  solarpunk: ["folk_clan", "artist", "folk_clan", "scholar", "artist", "scout"],
  biopunk: ["tech_crew", "scholar", "business", "tech_crew", "artist"],
  posthuman: ["scholar", "model", "tech_crew", "scholar", "artist"],
  spacefaring: ["business", "scout", "scholar", "business", "tech_crew"],
  post_apocalyptic: ["scrap_crew", "folk_clan", "scout", "scrap_crew", "business"],
  ai_future: ["tech_crew", "scholar", "business", "tech_crew", "model"],
};

const HARBOR_PERSONAS: NpcPersona[] = ["folk_clan", "business", "artist", "scout"];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function personasForIsland(islandId: string): NpcPersona[] {
  if (islandId === "harbor_haven") return HARBOR_PERSONAS;
  const genre = GENRE_BY_ISLAND[islandId];
  return genre ? PERSONAS_BY_GENRE[genre] : HARBOR_PERSONAS;
}

export function pickPersona(islandId: string, seed: string): NpcPersona {
  const list = personasForIsland(islandId);
  return list[hashStr(seed) % list.length]!;
}

export function pickMascotForPersona(persona: NpcPersona, seed: string): MoneyMascot {
  const kit = PERSONA_KITS[persona];
  const id = kit.mascotIds[hashStr(seed) % kit.mascotIds.length]!;
  return getMascot(id);
}

/** Culture-aware outfit — persona gear instead of global roulette. */
export function varyMascotForPersona(
  mascotId: string,
  persona: NpcPersona,
  seed: string,
): MascotCharacterLook {
  const mascot = getMascot(mascotId);
  const kit = PERSONA_KITS[persona];
  const h = hashStr(seed);
  return mascotToCharacter(mascot, {
    name: mascot.name,
    color: kit.colors[h % kit.colors.length],
    accessory: kit.accessories[(h >> 2) % kit.accessories.length],
    companion: h % 6 === 0 ? "finch" : h % 6 === 3 ? "otter" : "none",
  });
}

/** Cast ambient / NPC using island persona mix (still within the 30). */
export function castPersonaMascot(islandId: string, seed: string): {
  mascot: MoneyMascot;
  persona: NpcPersona;
  look: MascotCharacterLook;
} {
  const persona = pickPersona(islandId, seed);
  const mascot = pickMascotForPersona(persona, seed + ":body");
  const look = varyMascotForPersona(mascot.id, persona, seed + ":look");
  return { mascot, persona, look };
}

/** Sanity: every persona id resolves to real cast members. */
export function allPersonaMascotsValid(): boolean {
  for (const kit of Object.values(PERSONA_KITS)) {
    for (const id of kit.mascotIds) {
      if (!MONEY_CAST.some((m) => m.id === id)) return false;
    }
  }
  return true;
}
