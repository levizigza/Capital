/**
 * Known digression scar pairs — incomplete collection shelf (pattern #28).
 * Empty slots = curiosity; never gates Credit.
 */

import type { IslandSaveV1 } from "./types";

/** Pair forks count as one filled shelf slot if either branch is present. */
const DIGRESSION_PAIRS: [string, string][] = [
  ["cc_shell_patience", "cc_shell_impulse"],
  ["pp_tip_plan", "pp_tip_rush"],
  ["ck_collector_rumor", "ck_collector_lean"],
  ["sc_signal_listen", "sc_signal_rush"],
  ["vf_foundry_listen", "vf_foundry_rush"],
  ["fa_portfolio_peek", "fa_portfolio_rush"],
  ["da_wharf_listen", "da_wharf_rush"],
  ["ba_shop_browse", "ba_shop_rush"],
  ["in_ip_glance", "in_ip_rush"],
  ["fs_scaffold_look", "fs_scaffold_rush"],
  ["re_auction_watch", "re_auction_rush"],
];

/** How many digression rumor slots remain empty (incomplete set). */
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
