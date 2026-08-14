/**
 * Layered secret architecture — rules generate mysteries; discovery is soft.
 * Levels: casual → curious → expert systems → community (local Family Room).
 * @see docs/GAME_DESIGN_SECRETS.md
 */

import type { IslandSaveV1 } from "./types";
import type { SoftBeatKind } from "./views/SoftBeatOverlay";
import {
  harborScarPlaques,
  scarOrganId,
  scarOrganName,
  type IrreversibleChoiceRecord,
} from "./worldMemory";
import { harborWeatherMood, type HarborWeatherMood } from "./harborWeather";
import { ensureLedger, netCashflow } from "./voyagerLedger";
import type { FamilyRoom } from "./familyRoom";

export type SecretLevel = 1 | 2 | 3 | 4;

export type SecretRewardKind =
  | "knowledge"
  | "capability"
  | "strategy"
  | "story"
  | "interaction"
  | "discovery";

export type SecretId =
  | "soft_beat_fork_vista"
  | "teller_cross_index"
  | "weather_organ"
  | "debt_fog_battlement"
  | "capsule_plaza"
  | "npc_affinity_shelf"
  | "deal_plaza_receipt"
  | "community_organ_shelf";

export type SoftBeatPeekRecord = {
  peekCount: number;
  lastAt: string;
  resourceClaimed?: boolean;
};

export type SecretInsight = {
  at: string;
  reward: SecretRewardKind;
  level: SecretLevel;
};

/** Soft discovery bag — never a completion score. */
export type CuriosityDiscoveryState = {
  softBeats?: Partial<Record<SoftBeatKind, SoftBeatPeekRecord>>;
  insights?: Partial<Record<SecretId, SecretInsight>>;
  weatherOrganDayKey?: string;
};

export type SecretDef = {
  id: SecretId;
  level: SecretLevel;
  /** What the player wonders */
  question: string;
  reward: SecretRewardKind;
  /** Rule-emergent investigation — not a collectible pin */
  emergesFrom: string;
};

export const SECRET_CATALOG: SecretDef[] = [
  {
    id: "soft_beat_fork_vista",
    level: 2,
    question: "What do I see from the lid / loft / wall after my Take?",
    reward: "discovery",
    emergesFrom: "Soft Beat + irreversibleChoices",
  },
  {
    id: "teller_cross_index",
    level: 2,
    question: "Can Memory name more than one organ at once?",
    reward: "story",
    emergesFrom: "Ledger Soft Beat + ≥2 plaques",
  },
  {
    id: "weather_organ",
    level: 3,
    question: "Is the sky my scar or my cashflow?",
    reward: "strategy",
    emergesFrom: "harborWeather × scar organ × ledger",
  },
  {
    id: "debt_fog_battlement",
    level: 3,
    question: "What was that interest-storm rumor about?",
    reward: "knowledge",
    emergesFrom: "debt_fog rumor → Score Battlement",
  },
  {
    id: "capsule_plaza",
    level: 3,
    question: "Does a capsule matter off the board?",
    reward: "capability",
    emergesFrom: "party items × Teller Soft Beat",
  },
  {
    id: "npc_affinity_shelf",
    level: 3,
    question: "Do locals remember my fork?",
    reward: "story",
    emergesFrom: "npcMemory.affinity × plaques",
  },
  {
    id: "deal_plaza_receipt",
    level: 3,
    question: "Did that deal leave a Harbor footprint?",
    reward: "strategy",
    emergesFrom: "ledger assets × plaza tips",
  },
  {
    id: "community_organ_shelf",
    level: 4,
    question: "What can only our household myth say?",
    reward: "interaction",
    emergesFrom: "Family Room ≥2 members + ≥2 plaques (local)",
  },
];

export function secretsAtLevel(level: SecretLevel): SecretDef[] {
  return SECRET_CATALOG.filter((s) => s.level === level);
}

export function ensureCuriosity(
  raw?: CuriosityDiscoveryState | null,
): CuriosityDiscoveryState {
  return {
    softBeats: { ...(raw?.softBeats ?? {}) },
    insights: { ...(raw?.insights ?? {}) },
    weatherOrganDayKey: raw?.weatherOrganDayKey,
  };
}

export function hasSecretInsight(save: IslandSaveV1, id: SecretId): boolean {
  return Boolean(save.curiosity?.insights?.[id]);
}

function markInsight(
  save: IslandSaveV1,
  id: SecretId,
  reward: SecretRewardKind,
  level: SecretLevel,
): IslandSaveV1 {
  if (hasSecretInsight(save, id)) return save;
  const curiosity = ensureCuriosity(save.curiosity);
  return {
    ...save,
    curiosity: {
      ...curiosity,
      insights: {
        ...curiosity.insights,
        [id]: { at: new Date().toISOString(), reward, level },
      },
    },
  };
}

/** Level 2 — fork-specific Soft Beat vista. */
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

/** Level 2 — Memory Teller cross-indexes organs. */
export function tellerCrossIndexLine(save: IslandSaveV1): string | null {
  const plaques = harborScarPlaques(save);
  if (plaques.length < 2) return null;
  const organs = [...new Set(plaques.map((p) => scarOrganName(scarOrganId(p))))];
  if (organs.length < 2) {
    return `Under glass: “${plaques.map((p) => p.label).join("” · “")}” — Memory keeps the shelf.`;
  }
  return `Under glass ${organs.join(" · ")} hum together — Memory cross-indexes your Takes.`;
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

/** Level 3 — weather names living-money organ when rules explain the sky. */
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
  if (organ && mood === "fair") {
    return `Fair weather · the ${organ} keeps “${latest!.label}” on the Plinth. Prices steady.`;
  }
  return weatherFallback(mood);
}

export type SoftBeatSecretView = {
  vistaLine: string | null;
  crossIndexLine: string | null;
  strategyHint: string | null;
  foreshadowLine: string | null;
  isReturnPeek: boolean;
  peekCount: number;
};

export function resolveSoftBeatSecrets(
  save: IslandSaveV1,
  kind: SoftBeatKind,
): SoftBeatSecretView {
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
    hasSecretInsight(save, "debt_fog_battlement") ||
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
  resourceCoins: number;
  discoveryNote: string | null;
};

export const SOFT_BEAT_FIRST_PEEK_COINS = 5;

/** Record Soft Beat peek — soft discovery; never gates story. */
export function recordSoftBeatPeek(
  save: IslandSaveV1,
  kind: SoftBeatKind,
): SoftBeatRecordResult {
  const curiosity = ensureCuriosity(save.curiosity);
  const prev = curiosity.softBeats?.[kind];
  const peekCount = (prev?.peekCount ?? 0) + 1;
  const first = peekCount === 1;
  const resourceCoins = first && !prev?.resourceClaimed ? SOFT_BEAT_FIRST_PEEK_COINS : 0;

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

  const view = resolveSoftBeatSecrets(save, kind);
  let discoveryNote: string | null = null;

  if (view.vistaLine) {
    next = markInsight(next, "soft_beat_fork_vista", "discovery", 2);
    if (first) discoveryNote = "Fork vista — the Soft Beat showed your Take.";
  }
  if (view.crossIndexLine) {
    next = markInsight(next, "teller_cross_index", "story", 2);
    if (first || !hasSecretInsight(save, "teller_cross_index")) {
      discoveryNote =
        discoveryNote ?? "Teller cross-index — Memory named more than one organ.";
    }
  }
  if (kind === "battlement" && (view.foreshadowLine || view.vistaLine)) {
    if (
      save.harborRitual?.today.rumorId === "debt_fog" ||
      view.foreshadowLine ||
      view.vistaLine
    ) {
      next = markInsight(next, "debt_fog_battlement", "knowledge", 3);
    }
  }
  if (kind === "ledger" && view.strategyHint?.includes("Capsule")) {
    next = markInsight(next, "capsule_plaza", "capability", 3);
  }
  if (first && !discoveryNote) {
    discoveryNote = "Soft Beat peeked — climb again after Takes; vistas deepen.";
  } else if (view.isReturnPeek && view.vistaLine) {
    discoveryNote = discoveryNote ?? "Return peek — the vista still names your fork.";
  }

  return { save: next, resourceCoins, discoveryNote };
}

export function recordWeatherOrganInsight(
  save: IslandSaveV1,
  dayKey: string,
): IslandSaveV1 {
  if (save.curiosity?.weatherOrganDayKey === dayKey) return save;
  const mood = harborWeatherMood(save);
  if (mood === "fair" && harborScarPlaques(save).length === 0) return save;
  let next = markInsight(save, "weather_organ", "strategy", 3);
  const curiosity = ensureCuriosity(next.curiosity);
  return {
    ...next,
    curiosity: { ...curiosity, weatherOrganDayKey: dayKey },
  };
}

export function affinityShelfLine(save: IslandSaveV1, npcId: string): string | null {
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
  return markInsight(save, "npc_affinity_shelf", "story", 3);
}

export function dealPlazaReceiptTip(save: IslandSaveV1): string | null {
  const holdings = ensureLedger(save.voyagerLedger).holdings.filter((h) => h.kind === "asset");
  if (holdings.length === 0) return null;
  const newest = holdings[holdings.length - 1]!;
  return `${newest.icon} ${newest.name} still pays the plaza (+$${newest.monthlyAmount}/mo) — Freedom listens.`;
}

export function markDealReceiptInsight(save: IslandSaveV1): IslandSaveV1 {
  const holdings = ensureLedger(save.voyagerLedger).holdings.filter((h) => h.kind === "asset");
  if (holdings.length === 0) return save;
  return markInsight(save, "deal_plaza_receipt", "strategy", 3);
}

/**
 * Level 4 — community-scale mystery (local Family Room only).
 * Needs two plaques (system knowledge) + two household names (shared myth).
 */
export function communityOrganShelfLine(
  save: IslandSaveV1,
  room: FamilyRoom | null | undefined,
): string | null {
  if (!room || room.members.length < 2) return null;
  const plaques = harborScarPlaques(save);
  if (plaques.length < 2) return null;
  const organs = [...new Set(plaques.map((p) => scarOrganName(scarOrganId(p))))];
  const names = room.members
    .slice(0, 3)
    .map((m) => m.name)
    .join(" · ");
  if (organs.length >= 2) {
    return `Household shelf — ${organs.join(" · ")} across ${names}. Only local myth holds this.`;
  }
  return `Household shelf — “${plaques[0]!.label}” · “${plaques[1]!.label}” remembered by ${names}.`;
}

export function markCommunityShelfInsight(
  save: IslandSaveV1,
  room: FamilyRoom | null | undefined,
): IslandSaveV1 {
  if (!communityOrganShelfLine(save, room)) return save;
  return markInsight(save, "community_organ_shelf", "interaction", 4);
}

/** Open questions — never scoreboard chrome (debug / ?secrets=1). */
export function openSecretQuestions(save: IslandSaveV1): string[] {
  return SECRET_CATALOG.filter((s) => !hasSecretInsight(save, s.id)).map((s) => s.question);
}

export function secretsUiEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("secrets") === "1";
  } catch {
    return false;
  }
}
