/**
 * World memory — irreversible choices, Harbor scars, stance, light NPC recall.
 * Additive on IslandSaveV1 (version stays "1").
 */

import type { IslandSaveV1 } from "./types";

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
