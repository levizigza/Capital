import {
  ENDGAME_VILLAIN_MASCOT_ID,
  SERIES_LEAD_MASCOT_IDS,
  type MoneyMascotId,
} from "../../islands/moneyCast";

/** Series leads + endgame villain that have dedicated sheet art. */
export const SHEET_ART_IDS: readonly MoneyMascotId[] = [
  ...SERIES_LEAD_MASCOT_IDS,
  ENDGAME_VILLAIN_MASCOT_ID,
] as const;

export function hasSheetArtId(id: string | null | undefined): boolean {
  return Boolean(id && (SHEET_ART_IDS as readonly string[]).includes(id));
}

/** Optional drop-in PNG under `public/cast/{id}.png` — exact uploaded sheets. */
export function castSheetPngUrl(id: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}cast/${id}.png`;
}

export type SeriesSheetSpec = {
  id: MoneyMascotId;
  /** Primary coat / gown fill */
  coat: string;
  /** Coin metal */
  coin: string;
  /** Accent (gold trim, jewels) */
  accent: string;
  /** Eye fill */
  eye: string;
  /** Silhouette hook for the sheet recreation */
  hook: string;
};

export const SERIES_SHEET_SPECS: Record<string, SeriesSheetSpec> = {
  cashwell: {
    id: "cashwell",
    coat: "#14532d",
    coin: "#f4b942",
    accent: "#fde68a",
    eye: "#14532d",
    hook: "Tall green top hat · mustache · $ cane · frock + gold waistcoat",
  },
  cashmere: {
    id: "cashmere",
    coat: "#0a0a0a",
    coin: "#f4b942",
    accent: "#f5f5f4",
    eye: "#1c1917",
    hook: "Blonde waves · cocktail hat + veil · pearls · black cape · $ staff",
  },
  peso_pedro: {
    id: "peso_pedro",
    coat: "#166534",
    coin: "#f4b942",
    accent: "#fde68a",
    eye: "#14532d",
    hook: "Wide sombrero · forehead P · mustache · P-cane",
  },
  fortuna_fernanda: {
    id: "fortuna_fernanda",
    coat: "#047857",
    coin: "#f4b942",
    accent: "#b91c1c",
    eye: "#1c1917",
    hook: "Rose crown · dark curls · bill fan · P-cane · cape",
  },
  billionaire_bao: {
    id: "billionaire_bao",
    coat: "#052e16",
    coin: "#f4b942",
    accent: "#fde68a",
    eye: "#78350f",
    hook: "BB crest · swept hair · forest jacket · lion cane · fan",
  },
  jade_fortune: {
    id: "jade_fortune",
    coat: "#065f46",
    coin: "#f4b942",
    accent: "#10b981",
    eye: "#065f46",
    hook: "Square-hole coin · updo + pins · black cape · jade-disc staff",
  },
  sultan_stacks: {
    id: "sultan_stacks",
    coat: "#064e3b",
    coin: "#f4b942",
    accent: "#f5f0e1",
    eye: "#064e3b",
    hook: "Turban · crescent · feather · kaftan · coin scepter",
  },
  dinar_dahlia: {
    id: "dinar_dahlia",
    coat: "#0b3d2e",
    coin: "#f4b942",
    accent: "#10b981",
    eye: "#0b3d2e",
    hook: "DD crest · dark waves · crown · cape · medallion staff",
  },
  mansa_moneybaggs: {
    id: "mansa_moneybaggs",
    coat: "#1b4332",
    coin: "#f4b942",
    accent: "#f5f0e1",
    eye: "#1b4332",
    hook: "Gold mask · beard · white-gold turban · sunburst staff · moneybag",
  },
  kandake_kash: {
    id: "kandake_kash",
    coat: "#0f1412",
    coin: "#f4b942",
    accent: "#10b981",
    eye: "#b45309",
    hook: "Braided crown · forest cape · $ orb staff · cash clutch",
  },
  moneybagg_bro: {
    id: "moneybagg_bro",
    coat: "#171717",
    coin: "#f4b942",
    accent: "#14532d",
    eye: "#14532d",
    hook: "Durag · mini $ crown · MB vest · $ cane · cash phone · chain",
  },
  mula_mami: {
    id: "mula_mami",
    coat: "#1c1917",
    coin: "#f4b942",
    accent: "#fde68a",
    eye: "#14532d",
    hook: "Bun + headscarf · $ hoops · cropped vest · cash fan · quilted bag",
  },
  debt_collector: {
    id: "debt_collector",
    coat: "#3f3f46",
    coin: "#a8a29e",
    accent: "#14532d",
    eye: "#0c1622",
    hook: "Vault pediment head · bank torso · staff · ledger · chains",
  },
};
