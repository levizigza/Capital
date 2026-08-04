import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { COVE_COIN_JAR, HARBOR_LEDGER_BANK } from "./moneyStructures";
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
  });

  it("does not motif Harbor Safe Heart (shared vault minigame stays bank-true)", () => {
    const safe = HARBOR_LEDGER_BANK.parts.find((p) => p.id === "vault_safe")!;
    expect(resolvePartEnterMotif("bank", safe)).toBeNull();
  });

  it("ships jar architecture + Lid lower-third + part-enter overlay", () => {
    const jarArch = readFileSync(
      join(__dirname, "world3d/JarInteriorArchitecture.tsx"),
      "utf8",
    );
    expect(jarArch).toMatch(/Glass vertical ribs/);
    expect(jarArch).toMatch(/Cork shelf/);
    expect(jarArch).toMatch(/Coin slot/);

    const soft = readFileSync(join(__dirname, "views/SoftBeatOverlay.tsx"), "utf8");
    expect(soft).toMatch(/data-soft-beat-layout=\"lower-third\"/);
    expect(soft).toMatch(/Climb the lid/);

    const motif = readFileSync(join(__dirname, "views/PartEnterMotifOverlay.tsx"), "utf8");
    expect(motif).toMatch(/part-enter-motif/);
    expect(motif).toMatch(/part-enter-kid-sentence/);
  });
});
