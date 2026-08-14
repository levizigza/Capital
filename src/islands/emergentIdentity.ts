/**
 * Emergent player identity — archetypes from behavior, not a menu.
 * See GAME_DESIGN_IDENTITY.md.
 */

import type { IslandSaveV1 } from "./types";
import {
  dominantStance,
  ensureStance,
  harborScarPlaques,
  type VoyagerStance,
} from "./worldMemory";
import {
  ensureLedger,
  isHarborEscaped,
  netCashflow,
  type VoyagerLedger,
} from "./voyagerLedger";
import type { SoftBeatKind } from "./views/SoftBeatOverlay";

export type EmergentArchetypeId =
  | "jar_keeper"
  | "glitter_runner"
  | "umbrella_steward"
  | "spiral_rusher"
  | "patience_coil"
  | "booth_builder"
  | "harbor_ghost"
  | "unsettled";

export type PlayStats = {
  dealsAccepted: number;
  dealsPassed: number;
};

export type EmergentIdentity = {
  id: EmergentArchetypeId;
  /** Kid-facing name Harbor uses */
  title: string;
  /** One-line philosophy */
  philosophy: string;
  /** Why this identity (debug / Plinth signals) */
  signals: string[];
  /** Confidence 0–1 — low early game */
  confidence: number;
  lines: {
    piggy: string;
    weather: string;
    softBeat: Partial<Record<SoftBeatKind, string>>;
    dealCounsel: string;
    plinth: string;
  };
};

export const DEFAULT_PLAY_STATS: PlayStats = {
  dealsAccepted: 0,
  dealsPassed: 0,
};

export function ensurePlayStats(raw?: PlayStats | null): PlayStats {
  return {
    dealsAccepted: Math.max(0, raw?.dealsAccepted ?? 0),
    dealsPassed: Math.max(0, raw?.dealsPassed ?? 0),
  };
}

export function recordDealAccepted(save: IslandSaveV1): IslandSaveV1 {
  const playStats = ensurePlayStats(save.playStats);
  return {
    ...save,
    playStats: { ...playStats, dealsAccepted: playStats.dealsAccepted + 1 },
  };
}

export function recordDealPassed(save: IslandSaveV1): IslandSaveV1 {
  const playStats = ensurePlayStats(save.playStats);
  return {
    ...save,
    playStats: { ...playStats, dealsPassed: playStats.dealsPassed + 1 },
  };
}

type Scores = Record<Exclude<EmergentArchetypeId, "unsettled">, number>;

function blankScores(): Scores {
  return {
    jar_keeper: 0,
    glitter_runner: 0,
    umbrella_steward: 0,
    spiral_rusher: 0,
    patience_coil: 0,
    booth_builder: 0,
    harbor_ghost: 0,
  };
}

function hasScar(save: IslandSaveV1, idPart: string): boolean {
  return (save.harborScars ?? []).some((s) => s.id.includes(idPart));
}

function choiceId(
  save: IslandSaveV1,
  key: string,
): string | undefined {
  return save.irreversibleChoices?.[key]?.choiceId;
}

/**
 * Derive behavioral archetype from save — pure, no menu.
 */
export function deriveEmergentIdentity(save: IslandSaveV1): EmergentIdentity {
  const stance = ensureStance(save.stance);
  const dom = dominantStance(stance);
  const ledger = ensureLedger(save.voyagerLedger);
  const cf = netCashflow(ledger);
  const assets = ledger.holdings.filter((h) => h.kind === "asset").length;
  const liabilities = ledger.holdings.filter((h) => h.kind === "liability").length;
  const plaques = harborScarPlaques(save);
  const bond = save.piggyBondHomecomings ?? 0;
  const stats = ensurePlayStats(save.playStats);
  const dealLean =
    stats.dealsAccepted + stats.dealsPassed > 0
      ? stats.dealsAccepted / (stats.dealsAccepted + stats.dealsPassed)
      : assets > 0
        ? 0.65
        : 0.35;

  const scores = blankScores();
  const signals: string[] = [];

  // --- Stance & Takes ---
  if (dom === "saver") {
    scores.jar_keeper += 2;
    scores.umbrella_steward += 1;
    scores.patience_coil += 1;
    signals.push("saver stance");
  }
  if (dom === "spender") {
    scores.glitter_runner += 3;
    signals.push("spender stance");
  }
  if (dom === "risk") {
    scores.spiral_rusher += 3;
    signals.push("risk stance");
  }

  const cove = choiceId(save, "cove_save_vs_spend");
  if (cove === "save") {
    scores.jar_keeper += 3;
    signals.push("jar before treat");
  }
  if (cove === "spend") {
    scores.glitter_runner += 3;
    signals.push("treat before jar");
  }

  const pay = choiceId(save, "paycheck_protect_vs_spend");
  if (pay === "protect") {
    scores.umbrella_steward += 3;
    scores.jar_keeper += 1;
    signals.push("umbrella before glitter");
  }
  if (pay === "spend") {
    scores.glitter_runner += 2;
    signals.push("glitter ate the umbrella");
  }

  const credit = choiceId(save, "credit_borrow_vs_wait");
  if (credit === "wait") {
    scores.patience_coil += 4;
    signals.push("waited the spiral");
  }
  if (credit === "borrow") {
    scores.spiral_rusher += 4;
    signals.push("haste fed the spiral");
  }

  if (hasScar(save, "haste") || hasScar(save, "risk")) {
    scores.spiral_rusher += 1;
  }
  if (hasScar(save, "patience") || hasScar(save, "protector") || hasScar(save, "saver")) {
    scores.jar_keeper += 0.5;
    scores.umbrella_steward += 0.5;
    scores.patience_coil += 0.5;
  }

  // --- Assets / business model ---
  if (assets >= 2) {
    scores.booth_builder += 3;
    signals.push(`${assets} income assets`);
  }
  if (assets >= 1 && (isHarborEscaped(ledger) || cf >= 25)) {
    scores.booth_builder += 2;
    scores.umbrella_steward += 1;
  }
  if (liabilities === 0 && assets >= 1) {
    scores.jar_keeper += 1;
  }
  if (liabilities >= 1) {
    scores.spiral_rusher += 1;
    scores.glitter_runner += 0.5;
    signals.push(`${liabilities} liabilities`);
  }

  // --- Deal philosophy ---
  if (stats.dealsPassed > stats.dealsAccepted && stats.dealsPassed >= 1) {
    scores.jar_keeper += 2;
    scores.patience_coil += 1;
    signals.push("more deals passed than taken");
  }
  if (dealLean >= 0.6 && stats.dealsAccepted + assets >= 2) {
    scores.booth_builder += 2;
    scores.glitter_runner += 0.5;
    signals.push("acquisitive deal lean");
  }

  // --- Relationships ---
  // Ghost overrides when memory outruns relationship (day-5 sameness fix).
  if (plaques.length >= 2 && bond < Math.max(1, plaques.length - 1)) {
    scores.harbor_ghost += 8;
    signals.push("scars outpace Piggy bond");
  }
  if (bond >= 2) {
    scores.harbor_ghost = Math.max(0, scores.harbor_ghost - 5);
    scores.patience_coil += 0.5;
    scores.umbrella_steward += 0.5;
  }

  // --- Freedom / CF ---
  if (isHarborEscaped(ledger) || cf >= 30) {
    scores.booth_builder += 1;
    scores.umbrella_steward += 1;
  }
  if (cf < 10 && dom === "spender") {
    scores.glitter_runner += 1;
  }

  const takes =
    Number(Boolean(cove)) + Number(Boolean(pay)) + Number(Boolean(credit));
  const evidence =
    takes + plaques.length + assets + (stats.dealsAccepted + stats.dealsPassed > 0 ? 1 : 0);

  if (evidence < 1 && dom === "balanced") {
    return unsettledIdentity(stance);
  }

  let best: Exclude<EmergentArchetypeId, "unsettled"> = "jar_keeper";
  let bestScore = -1;
  for (const [id, score] of Object.entries(scores) as Array<
    [Exclude<EmergentArchetypeId, "unsettled">, number]
  >) {
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }

  if (bestScore < 2) {
    return unsettledIdentity(stance, signals);
  }

  const confidence = Math.min(1, bestScore / 8 + takes * 0.08);
  return buildIdentity(best, signals, confidence, ledger);
}

function unsettledIdentity(
  stance: VoyagerStance,
  signals: string[] = [],
): EmergentIdentity {
  const dom = dominantStance(stance);
  return {
    id: "unsettled",
    title: "Unsettled Voyager",
    philosophy: "Harbor has not read a clear money temperament yet.",
    signals: signals.length ? signals : ["still forming"],
    confidence: 0.15,
    lines: {
      piggy:
        dom === "balanced"
          ? "Piggy Penny: Come walk the plaza — your money story is still blank ink."
          : `Piggy Penny: I see a ${dom} lean already — keep choosing and Harbor will name it.`,
      weather: "Sky follows your books — identity comes after a few hard choices.",
      softBeat: {},
      dealCounsel: "Take or pass — both teach Harbor who you are.",
      plinth: "Memory Plinth waits for a Take it can keep.",
    },
  };
}

function buildIdentity(
  id: Exclude<EmergentArchetypeId, "unsettled">,
  signals: string[],
  confidence: number,
  ledger: VoyagerLedger,
): EmergentIdentity {
  const cf = netCashflow(ledger);
  const catalog: Record<
    Exclude<EmergentArchetypeId, "unsettled">,
    Omit<EmergentIdentity, "signals" | "confidence">
  > = {
    jar_keeper: {
      id: "jar_keeper",
      title: "Jar Keeper",
      philosophy: "Hold first — treat later. The pouch is a promise.",
      lines: {
        piggy: "Piggy Penny: Jar Keeper — you put the pouch before the glitter. I’m proud.",
        weather: "Fair books for a Jar Keeper — locals tip quieter stalls toward you.",
        softBeat: {
          lookout: "From the lid the jar sits heavy — Cove’s hold still shapes the shore.",
          ledger: "Under glass the jar line is bold — Memory keeps a Keeper’s books.",
        },
        dealCounsel: "Jar Keeper tip: pass is still a win if the runway stays thick.",
        plinth: "Harbor reads you as a Jar Keeper — Coin holds.",
      },
    },
    glitter_runner: {
      id: "glitter_runner",
      title: "Glitter Runner",
      philosophy: "Spend the sparkle now — rebuild the jar if you must.",
      lines: {
        piggy: "Piggy Penny: Glitter Runner — stalls still talk about your bright day.",
        weather: "Market lights chase a Glitter Runner — prices dance when cashflow swings.",
        softBeat: {
          lookout: "From the lid the jar looks thinner — treat-first still glints below.",
          umbrella: "From the loft Main Street still sparkles — and the gutters remember.",
        },
        dealCounsel: "Glitter Runner tip: a cooling-off pass can save tomorrow’s Pay Day.",
        plinth: "Harbor reads you as a Glitter Runner — sparkle with a bill attached.",
      },
    },
    umbrella_steward: {
      id: "umbrella_steward",
      title: "Umbrella Steward",
      philosophy: "Shelter the month before the sale. Clock over glitter.",
      lines: {
        piggy: "Piggy Penny: Umbrella Steward — you kept something dry when the sky cracked.",
        weather:
          cf >= 30
            ? "Bright plaza for an Umbrella Steward — Clock shelters a strong month."
            : "Grey edges, but your umbrella habit softens Harbor’s mood.",
        softBeat: {
          umbrella: "From the loft Main Street stays dry — protect-first still holds.",
          ledger: "Payday stamps under glass — Steward months remember the loft.",
        },
        dealCounsel: "Steward tip: buy when runway clears — rainy-day first.",
        plinth: "Harbor reads you as an Umbrella Steward — Clock shelters.",
      },
    },
    spiral_rusher: {
      id: "spiral_rusher",
      title: "Spiral Rusher",
      philosophy: "Speed has a price — interest listens for haste.",
      lines: {
        piggy: "Piggy Penny: Spiral Rusher — the fog knows your name. We can still rebuild.",
        weather: "Spiral fog hugs the dock — haste still stains the sky when books lean.",
        softBeat: {
          battlement: "From the wall the coil tightens — haste still hums in the stone.",
          ledger: "Marble ticks faster for a Rusher — Memory keeps the hard mark.",
        },
        dealCounsel: "Rusher tip: skip loan-shaped deals — don’t feed the spiral twice.",
        plinth: "Harbor reads you as a Spiral Rusher — Spiral withstands… if you let it.",
      },
    },
    patience_coil: {
      id: "patience_coil",
      title: "Patience Coil",
      philosophy: "Wait the spiral — on-time history beats haste.",
      lines: {
        piggy: "Piggy Penny: Patience Coil — you waited when the canyon pulled. Trust grows.",
        weather: "Even grey skies cool for a Patience Coil — interest storms look farther.",
        softBeat: {
          battlement: "From the wall the coil cools — wait-first still steadies the Keep.",
          ledger: "Under glass the wait line is clear — Memory keeps patience.",
        },
        dealCounsel: "Coil tip: waiting on a glitter deal is still cashflow skill.",
        plinth: "Harbor reads you as a Patience Coil — Spiral withstands.",
      },
    },
    booth_builder: {
      id: "booth_builder",
      title: "Booth Builder",
      philosophy: "Income assets compound — Freedom is a path of booths.",
      lines: {
        piggy: "Piggy Penny: Booth Builder — your cashflow path is getting loud on the dock.",
        weather: "Strong books for a Booth Builder — Harbor charges a little more in the light.",
        softBeat: {
          ledger: "Under glass booths and jars hum — Memory keeps a builder’s shelf.",
          lookout: "From the lid the shore looks busy — income you planted still works.",
        },
        dealCounsel: "Builder tip: another clean asset feeds the Seal chase — if pouch allows.",
        plinth: "Harbor reads you as a Booth Builder — cashflow is your craft.",
      },
    },
    harbor_ghost: {
      id: "harbor_ghost",
      title: "Harbor Ghost",
      philosophy: "The Plinth remembers — Piggy still waits for a real homecoming.",
      lines: {
        piggy: "Piggy Penny: Harbor Ghost — the plaques know you. Come talk. Don’t only leave scars.",
        weather: "Fog or fair, the plaza names your plaque — relationship still owes a visit.",
        softBeat: {
          ledger: "Under glass the plaques outnumber the hugs — Memory asks you home.",
        },
        dealCounsel: "Ghost tip: deals can wait — Piggy’s Talk Battle is the missing beat.",
        plinth: "Harbor reads you as a Harbor Ghost — memory without repair.",
      },
    },
  };

  const base = catalog[id];
  return {
    ...base,
    signals,
    confidence,
  };
}

/** Prefer archetype piggy line; fall back to stance greeting. */
export function identityGreetingLine(save: IslandSaveV1): string | null {
  const id = deriveEmergentIdentity(save);
  if (id.id === "unsettled" && id.confidence < 0.2) {
    return null;
  }
  return id.lines.piggy;
}

export function identityWeatherLine(
  save: IslandSaveV1,
  baseMoodLine: string,
): string {
  const id = deriveEmergentIdentity(save);
  if (id.id === "unsettled" || id.confidence < 0.35) return baseMoodLine;
  return `${baseMoodLine} ${id.lines.weather}`;
}

export function identitySoftBeatLine(
  save: IslandSaveV1,
  kind: SoftBeatKind,
): string | null {
  const id = deriveEmergentIdentity(save);
  if (id.confidence < 0.3) return null;
  return id.lines.softBeat[kind] ?? null;
}

export function identityDealCounsel(save: IslandSaveV1): string {
  return deriveEmergentIdentity(save).lines.dealCounsel;
}

export function identityPlinthLine(save: IslandSaveV1): string | null {
  const id = deriveEmergentIdentity(save);
  if (id.id === "unsettled") return id.lines.plinth;
  return `${id.lines.plinth} (${Math.round(id.confidence * 100)}% settled)`;
}
