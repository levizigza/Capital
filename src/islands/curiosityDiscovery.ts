/**
 * Curiosity discovery — provoke natural questions; reward investigation.
 * Soft state only (no forced checklist). See GAME_DESIGN_CURIOSITY.md.
 */

import type { IslandSaveV1 } from "./types";
import type { SoftBeatKind } from "./views/SoftBeatOverlay";
import {
  harborScarPlaques,
  scarOrganName,
  scarOrganId,
  type IrreversibleChoiceRecord,
} from "./worldMemory";
import { harborWeatherMood, type HarborWeatherMood } from "./harborWeather";
import { ensureLedger, netCashflow } from "./voyagerLedger";

export type CuriosityRewardKind =
  | "knowledge"
  | "capability"
  | "strategy"
  | "story"
  | "resource"
  | "discovery";

export type CuriosityHookId =
  | "soft_beat_fork_vista"
  | "teller_cross_index"
  | "weather_organ"
  | "debt_fog_battlement"
  | "capsule_plaza"
  | "npc_affinity_shelf"
  | "deal_plaza_receipt";

export type SoftBeatPeekRecord = {
  peekCount: number;
  lastAt: string;
  /** First peek coin thank-you already granted */
  resourceClaimed?: boolean;
};

export type CuriosityInsight = {
  at: string;
  reward: CuriosityRewardKind;
};

export type CuriosityDiscoveryState = {
  softBeats?: Partial<Record<SoftBeatKind, SoftBeatPeekRecord>>;
  insights?: Partial<Record<CuriosityHookId, CuriosityInsight>>;
  /** Day key when player first heard organ-named weather */
  weatherOrganDayKey?: string;
};

export type CuriosityHookDef = {
  id: CuriosityHookId;
  playerQuestion: string;
  reward: CuriosityRewardKind;
  howToInvestigate: string;
};

/** Registry — every mystery must list a real investigation + reward. */
export const CURIOSITY_HOOKS: CuriosityHookDef[] = [
  {
    id: "soft_beat_fork_vista",
    playerQuestion: "What happens if I peek from the lid / loft / wall?",
    reward: "discovery",
    howToInvestigate: "Climb a Soft Beat pad after a spine Take",
  },
  {
    id: "teller_cross_index",
    playerQuestion: "Can Coin, Clock, and Spiral talk through Memory?",
    reward: "story",
    howToInvestigate: "Teller Window Soft Beat with two or more plaques",
  },
  {
    id: "weather_organ",
    playerQuestion: "Why is the sky like this — is it my scar or my cashflow?",
    reward: "strategy",
    howToInvestigate: "Read Harbor weather after a Take or lean cashflow",
  },
  {
    id: "debt_fog_battlement",
    playerQuestion: "What’s that interest-storm rumor about?",
    reward: "knowledge",
    howToInvestigate: "Hear debt_fog rumor, then Score Battlement Soft Beat",
  },
  {
    id: "capsule_plaza",
    playerQuestion: "Does carrying a capsule matter on the plaza?",
    reward: "capability",
    howToInvestigate: "Own Emergency Ledger / Bailout; listen near Capsules",
  },
  {
    id: "npc_affinity_shelf",
    playerQuestion: "Do locals remember which fork I took?",
    reward: "story",
    howToInvestigate: "Talk Battle with the same local until affinity deepens",
  },
  {
    id: "deal_plaza_receipt",
    playerQuestion: "Did that deal leave a footprint at Harbor?",
    reward: "strategy",
    howToInvestigate: "Accept a board deal, then read Freedom / Piggy tips",
  },
];

export function ensureCuriosity(
  raw?: CuriosityDiscoveryState | null,
): CuriosityDiscoveryState {
  return {
    softBeats: { ...(raw?.softBeats ?? {}) },
    insights: { ...(raw?.insights ?? {}) },
    weatherOrganDayKey: raw?.weatherOrganDayKey,
  };
}

export function hasCuriosityInsight(
  save: IslandSaveV1,
  id: CuriosityHookId,
): boolean {
  return Boolean(save.curiosity?.insights?.[id]);
}

function markInsight(
  save: IslandSaveV1,
  id: CuriosityHookId,
  reward: CuriosityRewardKind,
): IslandSaveV1 {
  if (hasCuriosityInsight(save, id)) return save;
  const curiosity = ensureCuriosity(save.curiosity);
  return {
    ...save,
    curiosity: {
      ...curiosity,
      insights: {
        ...curiosity.insights,
        [id]: { at: new Date().toISOString(), reward },
      },
    },
  };
}

/** Fork-specific Soft Beat vista — answers “what happens if I do this?” */
export function softBeatForkVista(
  kind: SoftBeatKind,
  irreversible?: Record<string, IrreversibleChoiceRecord> | null,
): string | null {
  if (kind === "lookout") {
    const c = irreversible?.cove_save_vs_spend?.choiceId;
    if (c === "save") {
      return "From the lid the jar sits heavy — Cove chose jar before treat. Coin holds.";
    }
    if (c === "spend") {
      return "From the lid the jar looks thinner — Cove chose treat first. Coin still holds what remains.";
    }
    return null;
  }
  if (kind === "umbrella") {
    const c = irreversible?.paycheck_protect_vs_spend?.choiceId;
    if (c === "protect") {
      return "From the loft Main Street stays dry — umbrella before glitter. Clock shelters.";
    }
    if (c === "spend") {
      return "From the loft glitter still sparkles while gutters drip — Clock remembers the thin street.";
    }
    return null;
  }
  if (kind === "battlement") {
    const c = irreversible?.credit_borrow_vs_wait?.choiceId;
    if (c === "wait") {
      return "From the wall the coil cools — you waited the spiral. Spiral withstands.";
    }
    if (c === "borrow") {
      return "From the wall the coil tightens — haste fed the spiral. Fog still listens.";
    }
    return null;
  }
  return null;
}

/** Memory Teller names multiple organs when plaques exist. */
export function tellerCrossIndexLine(save: IslandSaveV1): string | null {
  const plaques = harborScarPlaques(save);
  if (plaques.length < 2) return null;
  const organs = [...new Set(plaques.map((p) => scarOrganName(scarOrganId(p))))];
  if (organs.length < 2) {
    return `Under glass: “${plaques.map((p) => p.label).join("” · “")}” — Memory keeps the shelf.`;
  }
  return `Under glass ${organs.join(" · ")} hum together — Memory cross-indexes your Takes.`;
}

/**
 * Weather line that names the living-money organ when scars/cashflow explain the sky.
 * Reward: strategy + knowledge.
 */
export function weatherOrganCoachLine(save: IslandSaveV1): string {
  const mood = harborWeatherMood(save);
  const cf = netCashflow(ensureLedger(save.voyagerLedger));
  const hasteScar = (save.harborScars ?? []).some(
    (s) => s.id.includes("haste") || s.id.includes("risk"),
  );
  const plaques = harborScarPlaques(save);
  const latest = plaques[plaques.length - 1];
  const organ = latest ? scarOrganName(scarOrganId(latest)) : null;

  if (mood === "storm" && hasteScar) {
    return `Spiral fog hugs the dock — haste still stains the sky. Shops cut prices; cashflow is ${cf}/mo.`;
  }
  if (mood === "storm") {
    return organ
      ? `Fog hugs the dock while the ${organ} waits on a lean ledger (${cf}/mo). Harbor softens prices.`
      : `Fog hugs the dock — cashflow ${cf}/mo. Harbor softens prices until the books brighten.`;
  }
  if (mood === "tight" && organ) {
    return `Grey sky · ${organ} hush. Locals soften prices while cashflow recovers (${cf}/mo).`;
  }
  if (mood === "boom" && organ) {
    return `Bright plaza · ${organ} still names “${latest!.label}.” Shops charge a little more — cashflow is strong.`;
  }
  // fair / fallback — keep base tone but allow organ whisper
  if (organ && mood === "fair") {
    return `Fair weather · the ${organ} keeps “${latest!.label}” on the Plinth. Prices steady.`;
  }
  return weatherFallback(mood);
}

function weatherFallback(mood: HarborWeatherMood): string {
  switch (mood) {
    case "boom":
      return "Harbor lights feel bright — cashflow is strong. Shops charge a little more.";
    case "fair":
      return "Fair weather on the plaza. Prices are steady.";
    case "tight":
      return "Sky’s a bit grey. Locals soften prices while cashflow recovers.";
    case "storm":
      return "Fog hugs the dock. Interest storms elsewhere — Harbor cuts prices to help.";
  }
}

export type SoftBeatCuriosityView = {
  vistaLine: string | null;
  crossIndexLine: string | null;
  strategyHint: string | null;
  foreshadowLine: string | null;
  isReturnPeek: boolean;
  peekCount: number;
};

export function resolveSoftBeatCuriosity(
  save: IslandSaveV1,
  kind: SoftBeatKind,
): SoftBeatCuriosityView {
  const peekCount = save.curiosity?.softBeats?.[kind]?.peekCount ?? 0;
  const vistaLine = softBeatForkVista(kind, save.irreversibleChoices);
  const crossIndexLine = kind === "ledger" ? tellerCrossIndexLine(save) : null;

  let strategyHint: string | null = null;
  if (vistaLine && kind === "lookout") {
    strategyHint =
      save.irreversibleChoices?.cove_save_vs_spend?.choiceId === "save"
        ? "Strategy whisper: jar-first affinity still hums on Harbor deals."
        : "Strategy whisper: treat-first leaves a thinner jar — Freedom needs runway.";
  } else if (vistaLine && kind === "umbrella") {
    strategyHint =
      save.irreversibleChoices?.paycheck_protect_vs_spend?.choiceId === "protect"
        ? "Strategy whisper: rainy-day loft softens the next grey sky."
        : "Strategy whisper: glitter days spend pouch — Soft Beat before Pay Day helps.";
  } else if (vistaLine && kind === "battlement") {
    strategyHint =
      save.irreversibleChoices?.credit_borrow_vs_wait?.choiceId === "wait"
        ? "Strategy whisper: patience cools interest storms on the plaza."
        : "Strategy whisper: haste fog is yours — Emergency Ledger counters Debt Traps.";
  }

  const debtFogRumor =
    save.harborRitual?.today.rumorId === "debt_fog" &&
    Boolean(save.harborRitual?.today.rumorSeen);
  const heardDebtFog =
    debtFogRumor ||
    hasCuriosityInsight(save, "debt_fog_battlement") ||
    (save.harborScars ?? []).some((s) => s.id.includes("haste"));

  let foreshadowLine: string | null = null;
  if (kind === "battlement" && !vistaLine && heardDebtFog) {
    foreshadowLine =
      "Interest-storm rumor was real — the Spiral waits in Credit Kingdom. Climb answers the fog.";
  } else if (kind === "battlement" && !vistaLine) {
    foreshadowLine =
      "The wall listens for a Credit Take. Until then it only hums about far fog.";
  }

  if (kind === "ledger") {
    const hasCapsule = Object.values(save.partyBoard ?? {}).some((b) =>
      (b.items ?? []).some((id) => id === "shield_ledger" || id === "bailout_buoy"),
    );
    if (hasCapsule && !strategyHint) {
      strategyHint =
        "Capsule on the books — Emergency Ledger can swallow a Debt Trap on the board.";
    }
  }

  return {
    vistaLine,
    crossIndexLine,
    strategyHint,
    foreshadowLine,
    isReturnPeek: peekCount > 0,
    peekCount,
  };
}

export type SoftBeatRecordResult = {
  save: IslandSaveV1;
  /** First peek of this pad — grant a tiny pouch thank-you */
  resourceCoins: number;
  /** Human toast blurb */
  discoveryNote: string | null;
};

/**
 * Record a Soft Beat peek — soft discovery, optional first-peek resource.
 * Never gates story progress.
 */
export function recordSoftBeatPeek(
  save: IslandSaveV1,
  kind: SoftBeatKind,
): SoftBeatRecordResult {
  const curiosity = ensureCuriosity(save.curiosity);
  const prev = curiosity.softBeats?.[kind];
  const peekCount = (prev?.peekCount ?? 0) + 1;
  const first = peekCount === 1;
  const resourceCoins = first && !prev?.resourceClaimed ? 5 : 0;

  let next: IslandSaveV1 = {
    ...save,
    curiosity: {
      ...curiosity,
      softBeats: {
        ...curiosity.softBeats,
        [kind]: {
          peekCount,
          lastAt: new Date().toISOString(),
          resourceClaimed: Boolean(prev?.resourceClaimed) || resourceCoins > 0,
        },
      },
    },
  };

  const view = resolveSoftBeatCuriosity(save, kind);
  let discoveryNote: string | null = null;

  if (view.vistaLine) {
    next = markInsight(next, "soft_beat_fork_vista", "discovery");
    if (first) discoveryNote = "Fork vista unlocked — the Soft Beat showed your Take.";
  }
  if (view.crossIndexLine) {
    next = markInsight(next, "teller_cross_index", "story");
    if (first || !hasCuriosityInsight(save, "teller_cross_index")) {
      discoveryNote = discoveryNote ?? "Teller cross-index — Memory named more than one organ.";
    }
  }
  if (kind === "battlement" && (view.foreshadowLine || view.vistaLine)) {
    if (save.harborRitual?.today.rumorId === "debt_fog" || view.foreshadowLine) {
      next = markInsight(next, "debt_fog_battlement", "knowledge");
    }
  }
  if (kind === "ledger" && view.strategyHint?.includes("Capsule")) {
    next = markInsight(next, "capsule_plaza", "capability");
  }
  if (first && !discoveryNote) {
    discoveryNote = "Soft Beat peeked — climb again later; vistas deepen after Takes.";
  } else if (view.isReturnPeek && view.vistaLine) {
    discoveryNote = discoveryNote ?? "Return peek — the vista still names your fork.";
  }

  return { save: next, resourceCoins, discoveryNote };
}

/** Mark weather organ understanding once per day (soft). */
export function recordWeatherOrganInsight(
  save: IslandSaveV1,
  dayKey: string,
): IslandSaveV1 {
  if (save.curiosity?.weatherOrganDayKey === dayKey) return save;
  const mood = harborWeatherMood(save);
  if (mood === "fair" && harborScarPlaques(save).length === 0) return save;
  let next = markInsight(save, "weather_organ", "strategy");
  const curiosity = ensureCuriosity(next.curiosity);
  return {
    ...next,
    curiosity: { ...curiosity, weatherOrganDayKey: dayKey },
  };
}

/** Affinity shelf line when a local remembers a fork. */
export function affinityShelfLine(
  save: IslandSaveV1,
  npcId: string,
): string | null {
  const mem = save.npcMemory?.[npcId];
  if (!mem || (mem.affinity ?? 0) < 3) return null;
  const last = mem.lastChoiceIds[mem.lastChoiceIds.length - 1];
  const plaques = harborScarPlaques(save);
  const plaque = plaques[plaques.length - 1];
  if (plaque) {
    return `They still tip their jar about “${plaque.label}” — affinity heard your fork.`;
  }
  if (last) {
    return `They remember you chose “${last.replace(/_/g, " ")}.” Talk again anytime.`;
  }
  return null;
}

export function markAffinityShelfInsight(save: IslandSaveV1): IslandSaveV1 {
  const deep = Object.values(save.npcMemory ?? {}).some((m) => (m.affinity ?? 0) >= 3);
  if (!deep) return save;
  return markInsight(save, "npc_affinity_shelf", "story");
}

/** Deal receipt — light plaza tip after holdings exist. */
export function dealPlazaReceiptTip(save: IslandSaveV1): string | null {
  const holdings = ensureLedger(save.voyagerLedger).holdings.filter((h) => h.kind === "asset");
  if (holdings.length === 0) return null;
  const newest = holdings[holdings.length - 1]!;
  return `${newest.icon} ${newest.name} still pays the plaza (+$${newest.monthlyAmount}/mo) — Freedom listens.`;
}

export function markDealReceiptInsight(save: IslandSaveV1): IslandSaveV1 {
  const holdings = ensureLedger(save.voyagerLedger).holdings.filter((h) => h.kind === "asset");
  if (holdings.length === 0) return save;
  return markInsight(save, "deal_plaza_receipt", "strategy");
}

/** Open questions this save can still answer — never a completion score. */
export function openCuriosityQuestions(save: IslandSaveV1): string[] {
  const open: string[] = [];
  for (const hook of CURIOSITY_HOOKS) {
    if (!hasCuriosityInsight(save, hook.id)) {
      open.push(hook.playerQuestion);
    }
  }
  return open;
}

export function curiosityUiEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("curiosity") === "1";
  } catch {
    return false;
  }
}

/** First Soft Beat peek pouch thank-you. */
export const SOFT_BEAT_FIRST_PEEK_COINS = 5;
