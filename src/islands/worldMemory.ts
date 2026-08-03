/**
 * World memory — irreversible choices, Harbor scars, stance, light NPC recall.
 * Additive on IslandSaveV1 (version stays "1").
 * Wave 7 — cold retell: every plaque names its money organ.
 */

import type { IslandSaveV1 } from "./types";
import type { MoneyOrganId } from "./moneyOrgans";

export type HarborScarKind = "plaque" | "npc_tone" | "plaza_prop";

export type HarborScar = {
  id: string;
  islandId: string;
  choiceId: string;
  label: string;
  kind: HarborScarKind;
  createdAt: string;
};

export type IrreversibleChoiceRecord = {
  choiceId: string;
  label: string;
  islandId: string;
  at: string;
};

export type VoyagerStance = {
  saver: number;
  spender: number;
  risk: number;
};

export type StanceAxis = keyof VoyagerStance;

export type NpcMemoryEntry = {
  talks: number;
  lastChoiceIds: string[];
  affinity?: number;
  lastTalkAt?: string;
};

export const DEFAULT_STANCE: VoyagerStance = { saver: 0, spender: 0, risk: 0 };

export function ensureStance(stance?: VoyagerStance | null): VoyagerStance {
  return {
    saver: stance?.saver ?? 0,
    spender: stance?.spender ?? 0,
    risk: stance?.risk ?? 0,
  };
}

export function dominantStance(
  stance?: VoyagerStance | null,
): "saver" | "spender" | "risk" | "balanced" {
  const s = ensureStance(stance);
  const max = Math.max(s.saver, s.spender, s.risk);
  if (max <= 0) return "balanced";
  const leaders = (["saver", "spender", "risk"] as const).filter((k) => s[k] === max);
  return leaders.length === 1 ? leaders[0]! : "balanced";
}

export function applyStanceDelta(
  stance: VoyagerStance | null | undefined,
  axis: StanceAxis,
  delta: number,
): VoyagerStance {
  const next = ensureStance(stance);
  next[axis] = Math.max(0, next[axis] + delta);
  return next;
}

/** True if this decision key was already locked forever. */
export function hasIrreversible(save: IslandSaveV1, key: string): boolean {
  return Boolean(save.irreversibleChoices?.[key]);
}

export function recordIrreversible(
  save: IslandSaveV1,
  key: string,
  record: IrreversibleChoiceRecord,
): IslandSaveV1 {
  if (save.irreversibleChoices?.[key]) return save;
  return {
    ...save,
    irreversibleChoices: {
      ...(save.irreversibleChoices ?? {}),
      [key]: record,
    },
  };
}

export function addHarborScar(save: IslandSaveV1, scar: HarborScar): IslandSaveV1 {
  const existing = save.harborScars ?? [];
  if (existing.some((s) => s.id === scar.id)) return save;
  return {
    ...save,
    harborScars: [...existing, scar].slice(-24),
  };
}

export function recordNpcTalk(
  save: IslandSaveV1,
  npcId: string,
  choiceId?: string,
): IslandSaveV1 {
  const prev = save.npcMemory?.[npcId];
  const lastChoiceIds = [...(prev?.lastChoiceIds ?? [])];
  if (choiceId) {
    lastChoiceIds.push(choiceId);
    while (lastChoiceIds.length > 8) lastChoiceIds.shift();
  }
  return {
    ...save,
    npcMemory: {
      ...(save.npcMemory ?? {}),
      [npcId]: {
        talks: (prev?.talks ?? 0) + 1,
        lastChoiceIds,
        affinity: (prev?.affinity ?? 0) + (choiceId ? 1 : 0),
        lastTalkAt: new Date().toISOString(),
      },
    },
  };
}

/** Kid-facing plaque line for the oldest-to-newest scars (newest last). */
export function harborScarPlaques(save: IslandSaveV1): HarborScar[] {
  return (save.harborScars ?? []).filter((s) => s.kind === "plaque" || s.kind === "plaza_prop");
}

/** Chapter shelf name for Memory Plinth grouping. */
export function scarChapterTitle(scar: HarborScar): string {
  const id = `${scar.id} ${scar.islandId}`.toLowerCase();
  if (id.includes("cove") || scar.islandId === "coincraft_cove") return "Coincraft Cove";
  if (id.includes("pp_") || id.includes("paycheck") || scar.islandId === "paycheck_peninsula") {
    return "Paycheck Peninsula";
  }
  if (id.includes("credit") || scar.islandId === "credit_kingdom") return "Credit Kingdom";
  return "Harbor memory";
}

/** Wave 7 — which organ a plaque belongs to (cold retell). */
export function scarOrganId(scar: Pick<HarborScar, "id" | "islandId">): MoneyOrganId {
  const ch = scarChapterTitle(scar as HarborScar);
  if (ch === "Paycheck Peninsula") return "clock";
  if (ch === "Credit Kingdom") return "spiral";
  if (ch === "Coincraft Cove") return "coin";
  return "memory";
}

export function scarOrganName(organ: MoneyOrganId): string {
  if (organ === "coin") return "Coin";
  if (organ === "clock") return "Clock";
  if (organ === "spiral") return "Spiral";
  return "Memory";
}

/**
 * Suit verb that must survive Take → Harbor (Pillar 5 progression).
 * Coin holds · Clock shelters · Spiral withstands · Memory keeps.
 */
export function organSuitVerb(organ: MoneyOrganId): string {
  if (organ === "clock") return "shelters";
  if (organ === "spiral") return "withstands";
  if (organ === "memory") return "keeps";
  return "holds";
}

/** Short organ+verb chip — “Coin holds”. */
export function organVerbChip(organ: MoneyOrganId): string {
  return `${scarOrganName(organ)} ${organSuitVerb(organ)}`;
}

/**
 * After a spine Take lands at Harbor — what painting is newly boardable?
 * Ability/story/space progression kids can point at without opening a ledger.
 */
export function nextPaintingAfterScar(
  scar: Pick<HarborScar, "id" | "islandId">,
): string | null {
  const organ = scarOrganId(scar);
  if (organ === "coin") return "Paycheck Peninsula";
  if (organ === "clock") return "Credit Kingdom";
  return null;
}

/**
 * Plaque-free kid sentence per organ (Pillar 12).
 * One mythology — suit verb only; never Harmon jargon as organ names.
 */
export function coldOrganKidSentence(organ: MoneyOrganId): string {
  if (organ === "clock") {
    return "The Clock shelters — wait under the umbrella before glitter.";
  }
  if (organ === "spiral") {
    return "The Spiral withstands — wait beats haste on the interest wall.";
  }
  if (organ === "memory") {
    return "Memory keeps — Harbor remembers your Take on the Plinth.";
  }
  return "The Coin holds — save a little; the jar still waits.";
}

/** One kid-facing sentence after a cold play — organ verb + plaque. */
export function coldRetellLine(scar: Pick<HarborScar, "id" | "islandId" | "label">): string {
  const organ = scarOrganId(scar);
  return `The ${organVerbChip(organ)} — Harbor remembered: “${scar.label}.”`;
}

/** Plinth billboard / modal row — organ verb first so the suit sticks. */
export function plaqueShelfLine(scar: Pick<HarborScar, "id" | "islandId" | "label">): string {
  const organ = scarOrganId(scar);
  return `${organVerbChip(organ)} · ${scar.label}`;
}

/**
 * Spectacle headline — same suit-verb mythology as cold retell.
 * Never “Coin Change” vs “Clock Take” (that invents a second cosmos).
 */
export function coldSpectacleHeadline(scar: Pick<HarborScar, "id" | "islandId" | "label">): string {
  const organ = scarOrganId(scar);
  return `Harbor felt that — the ${organVerbChip(organ)}`;
}

/** Suit-verb hush after Take — Coin holds · Clock shelters · Spiral withstands. */
export function organTakeHushLine(organ: MoneyOrganId): string {
  if (organ === "clock") return "The Clock shelters. Harbor is already listening.";
  if (organ === "spiral") return "The Spiral withstands. Harbor is already listening.";
  if (organ === "memory") return "Memory keeps the mark. Harbor is already listening.";
  return "The Coin holds. Harbor is already listening.";
}

/** Shore quiet badge after irreversible Take — suit verb, never “Coin Take”. */
export function organQuietBadge(organ: MoneyOrganId): string {
  return `Quiet — ${organVerbChip(organ)}`;
}

/** Day-2 cinema body — lead with suit verb so cold kids can retell. */
export function day2EchoBody(scarLabel: string, organ: MoneyOrganId): string {
  const chip = organVerbChip(organ);
  if (organ === "clock") {
    return `The ${chip} — locals still stamp “${scarLabel}.” Yesterday sticks as today’s weather.`;
  }
  if (organ === "spiral") {
    return `The ${chip} — locals still weigh “${scarLabel}.” Yesterday sticks as today’s weather.`;
  }
  if (organ === "memory") {
    return `${chip} — locals still name “${scarLabel}” on the Plinth. Yesterday sticks as today’s weather.`;
  }
  return `The ${chip} — locals still tip their jars about “${scarLabel}.” Yesterday sticks as today’s weather.`;
}

/** Daily Harbor rumor that carries the organ word. */
export function scarRumorLine(
  scar: Pick<HarborScar, "id" | "islandId" | "label">,
  kind: "same" | "later",
): string {
  const organ = scarOrganName(scarOrganId(scar));
  if (kind === "later") {
    return `Day-after echo: the ${organ} still names “${scar.label}.” The Plinth did not forget overnight.`;
  }
  return `Memory Plinth rumor: the ${organ} — “${scar.label}” — still shapes how locals greet you.`;
}

export function groupScarsByChapter(
  scars: HarborScar[],
): { chapter: string; scars: HarborScar[] }[] {
  const order = ["Coincraft Cove", "Paycheck Peninsula", "Credit Kingdom", "Harbor memory"];
  const map = new Map<string, HarborScar[]>();
  for (const s of scars) {
    const ch = scarChapterTitle(s);
    const list = map.get(ch) ?? [];
    list.push(s);
    map.set(ch, list);
  }
  return order
    .filter((ch) => map.has(ch))
    .map((ch) => ({ chapter: ch, scars: map.get(ch)! }));
}

/** True if this scar should trigger an in-chapter quiet beat. */
export function scarTriggersChapterQuiet(scarId: string): boolean {
  return (
    scarId.startsWith("cove_") ||
    scarId.startsWith("pp_") ||
    scarId.startsWith("credit_")
  );
}

/** Ambient plaza line when Harbor still carries yesterday’s plaque. */
export function scarEchoAmbientLine(
  mascotName: string,
  scarLabel: string,
  dayOffset: "same" | "later",
  organ: MoneyOrganId = "memory",
): string {
  const organWord = scarOrganName(organ);
  if (dayOffset === "later") {
    return `${mascotName}: Still thinking about the ${organWord} — “${scarLabel}.” Money left footprints.`;
  }
  return `${mascotName}: The Plinth just got a ${organWord} mark — “${scarLabel}.” Harbor felt that.`;
}

/** Piggy always names the scar — living conscience, not a prop. */
export function piggyScarMemoryLine(
  scarLabel: string,
  dayOffset: "same" | "later",
  organ: MoneyOrganId = "memory",
): string {
  const chip = organVerbChip(organ);
  if (dayOffset === "later") {
    return `Piggy Penny: Still here — the ${chip} did not wash out. “${scarLabel}.”`;
  }
  return `Piggy Penny: Harbor felt that — the ${chip}. “${scarLabel}.” I’m proud you came home changed.`;
}

/** True when this local should name the scar (dense plaza memory, not sparse). */
export function localNamesScarEcho(mascotId: string, hourKey: string): boolean {
  if (mascotId === "piggy_penny") return true;
  // ~2/3 of locals + hour drift so the plaza feels haunted by choice
  return (mascotId.charCodeAt(0) + hourKey.length) % 3 !== 0;
}

export function stanceGreetingHint(
  stance?: VoyagerStance | null,
): string | null {
  switch (dominantStance(stance)) {
    case "saver":
      return "Locals tip their jars to you — word travels that you keep a pouch.";
    case "spender":
      return "Market stalls light up when you walk by — they remember a glitter day.";
    case "risk":
      return "The dock wind feels sharper — Harbor knows you sometimes rush the Thread.";
    default:
      return null;
  }
}
