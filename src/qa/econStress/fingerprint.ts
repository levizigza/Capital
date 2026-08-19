/**
 * Economic stress — CoreResult normalizer + stable hash.
 * Spec: docs/qa/ECONOMIC_STRESS_TEST_PLAN.md §2
 */

import { createHash } from "node:crypto";

import type { IslandSaveV1 } from "@/islands/types";
import { ensureLedger } from "@/islands/voyagerLedger";
import { sanitizeIslandSave } from "@/islands/save";

export type CoreResultPayload = {
  voyagerLedger: {
    salaryIncome: number;
    livingExpenses: number;
    holdings: { id: string; kind: string; monthlyAmount: number }[];
    positivePaydayStreak: number;
    harborEscaped: boolean;
    masteryClears: string[];
  };
  pouch_coins: number;
  irreversibleChoices: Record<string, { choiceId: string }>;
  harborScars: { id: string; kind: string; choiceId?: string }[];
  questStatus: Record<string, { started?: boolean; completed?: boolean }>;
};

export type CoreResult = CoreResultPayload & { core_hash: string };

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

/** Strip UI/ephemeral fields — gameplay-authoritative slice only. */
export function extractCoreResult(
  save: IslandSaveV1,
  pouchCoins = 0,
): CoreResultPayload {
  const ledger = ensureLedger(save.voyagerLedger);
  return {
    voyagerLedger: {
      salaryIncome: ledger.salaryIncome,
      livingExpenses: ledger.livingExpenses,
      holdings: [...ledger.holdings]
        .map((h) => ({
          id: h.id,
          kind: h.kind,
          monthlyAmount: h.monthlyAmount,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
      positivePaydayStreak: ledger.positivePaydayStreak,
      harborEscaped: ledger.harborEscaped,
      masteryClears: [...(ledger.masteryClears ?? [])].sort(),
    },
    pouch_coins: pouchCoins,
    irreversibleChoices: Object.fromEntries(
      Object.entries(save.irreversibleChoices ?? {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, record]) => [key, { choiceId: record.choiceId }]),
    ),
    harborScars: (save.harborScars ?? []).map((s) => ({
      id: s.id,
      kind: s.kind,
      choiceId: s.choiceId,
    })),
    questStatus: Object.fromEntries(
      Object.entries(save.questStatus ?? {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([questId, status]) => [
          questId,
          { started: status.started, completed: status.completed },
        ]),
    ),
  };
}

export function coreHash(payload: CoreResultPayload): string {
  return createHash("sha256").update(stableStringify(payload)).digest("hex").slice(0, 16);
}

export function fingerprintSave(save: IslandSaveV1, pouchCoins = 0): CoreResult {
  const payload = extractCoreResult(save, pouchCoins);
  return { ...payload, core_hash: coreHash(payload) };
}

/** Save/load invariance — sanitize roundtrip must preserve core hash. */
export function assertSaveLoadCoreInvariant(
  save: IslandSaveV1,
  pouchCoins = 0,
): { before: string; after: string; pass: boolean } {
  const before = fingerprintSave(save, pouchCoins).core_hash;
  const roundtrip = sanitizeIslandSave(JSON.parse(JSON.stringify(save)));
  if (!roundtrip) {
    return { before, after: "", pass: false };
  }
  const after = fingerprintSave(roundtrip, pouchCoins).core_hash;
  return { before, after, pass: before === after };
}
