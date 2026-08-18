/**
 * Known digression scar pairs — myth gossip shelf (pattern #28).
 * Heard scars = named plaza rumors. Never a collection %; never gates Credit.
 */

import type { IslandSaveV1 } from "./types";

/** Pair forks count as one heard myth if either branch is present. */
export const DIGRESSION_SHELF_SLOTS: {
  a: string;
  b: string;
  label: string;
}[] = [
  { a: "cc_shell_patience", b: "cc_shell_impulse", label: "Cove · Shell Want" },
  { a: "pp_tip_plan", b: "pp_tip_rush", label: "Paycheck · Tip Fork" },
  { a: "pp_inbox_storm", b: "pp_inbox_storm", label: "Paycheck · Inbox Storm" },
  { a: "ck_collector_rumor", b: "ck_collector_lean", label: "Credit · Collector" },
  { a: "sc_signal_listen", b: "sc_signal_rush", label: "Phosphor Reef · Listen" },
  { a: "vf_foundry_listen", b: "vf_foundry_rush", label: "Gridlock · Foundry" },
  { a: "fa_portfolio_peek", b: "fa_portfolio_rush", label: "Budget Kart · Boards" },
  { a: "da_wharf_listen", b: "da_wharf_rush", label: "Digital Atoll · Wharf" },
  { a: "ba_shop_browse", b: "ba_shop_rush", label: "Diversify Keep · Shop" },
  { a: "in_ip_glance", b: "in_ip_rush", label: "Intangible Isle · IP" },
  { a: "fs_scaffold_look", b: "fs_scaffold_rush", label: "Portfolio Skies · Scaffold" },
  { a: "re_auction_watch", b: "re_auction_rush", label: "Real Estate · Auction" },
];

const DIGRESSION_PAIRS: [string, string][] = DIGRESSION_SHELF_SLOTS.map((s) => [s.a, s.b]);

/** How many digression rumor slots remain unheard (analytics / family challenge only). */
export function digressionScarGaps(save: IslandSaveV1): number {
  const have = new Set((save.harborScars ?? []).map((s) => s.id));
  let gaps = 0;
  for (const [a, b] of DIGRESSION_PAIRS) {
    if (!have.has(a) && !have.has(b)) gaps += 1;
  }
  return gaps;
}

export function digressionShelfFilled(save: IslandSaveV1): number {
  return DIGRESSION_PAIRS.length - digressionScarGaps(save);
}

export function digressionShelfTotal(): number {
  return DIGRESSION_PAIRS.length;
}

export type DigressionShelfRow = {
  label: string;
  filled: boolean;
  scarId: string | null;
  scarLabel: string | null;
};

/** All pair rows — prefer `digressionHeardMyths` for player UI (no empty checklist). */
export function digressionShelfRows(save: IslandSaveV1): DigressionShelfRow[] {
  const scars = save.harborScars ?? [];
  const byId = new Map(scars.map((s) => [s.id, s]));
  return DIGRESSION_SHELF_SLOTS.map((slot) => {
    const hit = byId.get(slot.a) ?? byId.get(slot.b) ?? null;
    return {
      label: slot.label,
      filled: Boolean(hit),
      scarId: hit?.id ?? null,
      scarLabel: hit?.label ?? null,
    };
  });
}

/** Player-facing Plinth myths — named gossip only, never empty-slot collection UI. */
export function digressionHeardMyths(save: IslandSaveV1): DigressionShelfRow[] {
  return digressionShelfRows(save).filter((r) => r.filled);
}
