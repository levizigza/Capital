import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COVE_COIN_JAR,
  HARBOR_LEDGER_BANK,
  PAYCHECK_PAYROLL_TOWER,
} from "./moneyStructures";
import { resolvePartEnterMotif } from "./structurePartEnter";
import { coldOrganKidSentence } from "./worldMemory";

describe("structure part enter motifs", () => {
  it("gives Cove Jar cork-pop and spring-fling before arcade dump", () => {
    const cork = resolvePartEnterMotif("jar", COVE_COIN_JAR.parts[0]!);
    const spring = resolvePartEnterMotif("jar", COVE_COIN_JAR.parts[1]!);
    expect(cork?.id).toBe("cork-pop");
    expect(spring?.id).toBe("spring-fling");
    expect(cork?.kidSentence).toBe(coldOrganKidSentence("coin"));
    expect(spring?.durationMs).toBeGreaterThan(0);
    expect(cork?.organ).toBe("coin");
  });

  it("gives Ledger Bank dial-spin and stamp-press before arcade dump", () => {
    const safe = HARBOR_LEDGER_BANK.parts.find((p) => p.id === "vault_safe")!;
    const stamp = HARBOR_LEDGER_BANK.parts.find((p) => p.id === "stamp_press")!;
    const dial = resolvePartEnterMotif("bank", safe);
    const press = resolvePartEnterMotif("bank", stamp);
    expect(dial?.id).toBe("dial-spin");
    expect(press?.id).toBe("stamp-press");
    expect(dial?.kidSentence).toBe(coldOrganKidSentence("memory"));
    expect(dial?.organ).toBe("memory");
  });

  it("does not motif Paycheck tower pads yet (next deepen)", () => {
    const bucket = PAYCHECK_PAYROLL_TOWER.parts[0]!;
    expect(resolvePartEnterMotif("tower", bucket)).toBeNull();
  });

  it("ships jar + bank architecture and Soft Beat lower-thirds", () => {
    const jarArch = readFileSync(
      join(__dirname, "world3d/JarInteriorArchitecture.tsx"),
      "utf8",
    );
    expect(jarArch).toMatch(/Glass vertical ribs/);
    const bankArch = readFileSync(
      join(__dirname, "world3d/BankInteriorArchitecture.tsx"),
      "utf8",
    );
    expect(bankArch).toMatch(/Brass columns/);
    expect(bankArch).toMatch(/Vault door/);

    const soft = readFileSync(join(__dirname, "views/SoftBeatOverlay.tsx"), "utf8");
    expect(soft).toMatch(/data-soft-beat-layout=\"lower-third\"/);
    expect(soft).toMatch(/kind === \"lookout\" \|\| kind === \"ledger\"/);

    const motif = readFileSync(join(__dirname, "views/PartEnterMotifOverlay.tsx"), "utf8");
    expect(motif).toMatch(/part-enter-motif/);
    expect(motif).toMatch(/motif\.organ/);
  });
});
