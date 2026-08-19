import { describe, expect, it } from "vitest";

import { createDefaultIslandSave } from "@/islands/save";
import {
  applySpineTakeLedgerFootprint,
  PAYCHECK_TAKE_KEY,
} from "@/islands/spineTakeFootprints";
import {
  assertSaveLoadCoreInvariant,
  coreHash,
  extractCoreResult,
  fingerprintSave,
} from "./fingerprint";

describe("econStress fingerprint", () => {
  it("produces identical core_hash for identical saves", () => {
    const save = createDefaultIslandSave();
    const a = fingerprintSave(save, 42);
    const b = fingerprintSave(save, 42);
    expect(a.core_hash).toBe(b.core_hash);
    expect(a.core_hash).toHaveLength(16);
  });

  it("changes hash when spine Take mutates ledger", () => {
    const base = createDefaultIslandSave();
    const before = fingerprintSave(base).core_hash;
    const afterTake = applySpineTakeLedgerFootprint(base, PAYCHECK_TAKE_KEY, "protect");
    const after = fingerprintSave(afterTake).core_hash;
    expect(after).not.toBe(before);
  });

  it("save/load roundtrip preserves core_hash", () => {
    const save = applySpineTakeLedgerFootprint(
      createDefaultIslandSave(),
      PAYCHECK_TAKE_KEY,
      "spend",
    );
    const result = assertSaveLoadCoreInvariant(save, 25);
    expect(result.pass).toBe(true);
    expect(result.before).toBe(result.after);
  });

  it("stableStringify ordering — holdings order does not affect hash", () => {
    const save = applySpineTakeLedgerFootprint(
      createDefaultIslandSave(),
      PAYCHECK_TAKE_KEY,
      "protect",
    );
    const payload = extractCoreResult(save);
    const shuffled = {
      ...payload,
      voyagerLedger: {
        ...payload.voyagerLedger,
        holdings: [...payload.voyagerLedger.holdings].reverse(),
      },
    };
    expect(coreHash(payload)).toBe(coreHash(shuffled));
  });
});
