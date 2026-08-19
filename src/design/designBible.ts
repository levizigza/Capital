/**
 * Design Bible — runtime enforcement hooks.
 * Canon: docs/CAPITAL_DESIGN_BIBLE.md
 *
 * Player-facing laws encoded here so tests (and Harbor chrome) stay honest.
 * Prefer amending the bible doc + this module together.
 */

/** Final ship question every feature must answer. */
export const DESIGN_BIBLE_SHIP_QUESTION =
  "Does this help Capital generate a more interesting player story?";

export const DESIGN_BIBLE_PATH = "docs/CAPITAL_DESIGN_BIBLE.md";

/** Player-visible laws this pass wires into Capital. */
export const BIBLE_RUNTIME_LAWS = {
  /** Hide Islands XP from reward chrome — Memory/scars are progress, not XP. */
  hideIslandsXpChrome: true,
  /** Do not award Islands XP on the product path (pouch + CF only). */
  cutIslandsXpAwards: true,
  /** Unmount skill-stats RPG panel from island play. */
  hideSkillStatsPanel: true,
  /** Arcade / Vibe Studio / Ritual magnets only after Cove Change. */
  demoteSideMagnetsUntilCoveChange: true,
  /**
   * Party board “seal” spaces buy Cashflow Claims (ledger), not star counters.
   * Freedom Seal stays unique; rival star race is flavor, not campaign progress.
   */
  partyPrizeIsCashflowClaim: true,
  /** Tip NPC Talk: no hollow yes/later fake choice. */
  tipTalkSingleContinue: true,
  /** Memory modal omits stance build chrome — organs + plaques only. */
  memoryModalOrgansOnly: true,
  /** Soft Beat lines deepen with scar fork vocabulary when present. */
  softBeatScarVista: true,
  /** Local Family Challenge + Share Witness (no fake MMO). */
  localFamilyChallengeAndWitness: true,
  /** Digression Plinth shows heard myths only — never fill-% checklists. */
  mythShelfNotCollectionPct: true,
  /** Legacy Structured/Creative achievement dashboards stay off the product path. */
  hideAchievementDashboardsOnProductPath: true,
} as const;

export type BibleRuntimeLaw = keyof typeof BIBLE_RUNTIME_LAWS;

/** @deprecated Prefer Cashflow Claim — kept for rival flavor / old saves. */
export const BOARD_STAR_LABEL = "Board Star";

/** Party board seal prize — pouch → monthly CF. */
export const BOARD_CASHFLOW_CLAIM_LABEL = "Cashflow Claim";

/**
 * Soft Beat fork vista — same pad, scar-aware weather (longevity without new meters).
 */
export function softBeatScarVistaLine(
  kind: "lookout" | "umbrella" | "battlement" | "ledger",
  scarLabel: string | null | undefined,
): string | null {
  if (!scarLabel?.trim()) return null;
  const s = scarLabel.toLowerCase();
  const hold = /hold|save|jar|cork|keep/.test(s);
  const spend = /spend|glitter|splash|buy/.test(s);
  const wait = /wait|umbrella|shelter|rain/.test(s);
  const haste = /haste|rush|risk|borrow|now/.test(s);

  if (kind === "lookout") {
    if (hold) return `From the lid you feel the weight you kept — “${scarLabel}” still settles in the jar.`;
    if (spend) return `From the lid the jar looks lighter — “${scarLabel}” spent glitter Harbor still names.`;
    if (/foundry|rush|signal|news|market|digression|inbox/.test(s)) {
      return `From the lid a digression rumor still ticks — “${scarLabel}” keeps the jar curious.`;
    }
  }
  if (kind === "umbrella") {
    if (wait) return `From the loft Main Street stays dry — “${scarLabel}” taught the Clock to shelter.`;
    if (haste || spend) return `From the loft the street looks thin — “${scarLabel}” still ticks in the rain.`;
    if (/tip|inbox|paycheck|plan/.test(s)) {
      return `From the loft a Paycheck digression still shades the street — “${scarLabel}.”`;
    }
  }
  if (kind === "battlement") {
    if (wait) return `From the wall the coil cools — “${scarLabel}” withstood the rush.`;
    if (haste) return `From the wall the spiral still pulls — “${scarLabel}” left gravity in the Keep.`;
    if (/credit|ordeal|score|signal/.test(s)) {
      return `From the wall Credit gossip still coils — “${scarLabel}” keeps the Keep honest.`;
    }
  }
  if (kind === "ledger") {
    return `Under glass Harbor keeps “${scarLabel}” — Memory, not a tip sheet.`;
  }
  return `Harbor still hums “${scarLabel}” from here — look, then leave.`;
}
