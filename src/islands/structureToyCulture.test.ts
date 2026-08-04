import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COVE_COIN_JAR,
  CREDIT_INTEREST_KEEP,
  HARBOR_LEDGER_BANK,
  PAYCHECK_PAYROLL_TOWER,
} from "./moneyStructures";
import { scarChapterTitle, scarTriggersChapterQuiet } from "./worldMemory";

describe("money structure toy culture contract", () => {
  it("gives each spine structure three pokeable parts", () => {
    for (const s of [COVE_COIN_JAR, HARBOR_LEDGER_BANK, PAYCHECK_PAYROLL_TOWER, CREDIT_INTEREST_KEEP]) {
      expect(s.parts).toHaveLength(3);
      expect(new Set(s.parts.map((p) => p.id)).size).toBe(3);
    }
  });

  it("uses distinct themes for organ interiors", () => {
    expect(COVE_COIN_JAR.theme).toBe("jar");
    expect(HARBOR_LEDGER_BANK.theme).toBe("bank");
    expect(PAYCHECK_PAYROLL_TOWER.theme).toBe("tower");
    expect(CREDIT_INTEREST_KEEP.theme).toBe("keep");
  });

  it("gives Cove Jar cork + spring toys (not a stray bank stamp)", () => {
    const toys = readFileSync(join(__dirname, "world3d/StructureInteriorToys.tsx"), "utf8");
    const jarBlock = toys.slice(toys.lastIndexOf("// jar"));
    expect(jarBlock).toMatch(/ToyCork/);
    expect(jarBlock).toMatch(/ToySpringCoil/);
    expect(jarBlock).not.toMatch(/ToyStamp/);
  });

  it("mounts jar-true architecture inside the Coin Jar interior", () => {
    const interior = readFileSync(
      join(__dirname, "world3d/MoneyStructureInteriorView.tsx"),
      "utf8",
    );
    expect(interior).toMatch(/JarInteriorArchitecture/);
    expect(interior).toMatch(/theme === \"jar\"/);
  });

  it("gives Ledger Bank vault dial + teller glass (not jar cork)", () => {
    const toys = readFileSync(join(__dirname, "world3d/StructureInteriorToys.tsx"), "utf8");
    const culture = toys.slice(toys.indexOf("export function StructureToyCulture"));
    const bankBlock = culture.slice(
      culture.indexOf('theme === "bank"'),
      culture.lastIndexOf("// jar"),
    );
    expect(bankBlock).toMatch(/ToyVaultDial/);
    expect(bankBlock).toMatch(/ToyTellerGlass/);
    expect(bankBlock).toMatch(/ToyStamp/);
    expect(bankBlock).not.toMatch(/ToyCork/);
  });

  it("gives Payroll Tower buckets + umbrella (not jar spring)", () => {
    const toys = readFileSync(join(__dirname, "world3d/StructureInteriorToys.tsx"), "utf8");
    const culture = toys.slice(toys.indexOf("export function StructureToyCulture"));
    const towerBlock = culture.slice(
      culture.indexOf('theme === "tower"'),
      culture.indexOf('theme === "keep"'),
    );
    expect(towerBlock).toMatch(/ToyBucketStack/);
    expect(towerBlock).toMatch(/ToyUmbrellaFold/);
    expect(towerBlock).toMatch(/ToyClockFace/);
    expect(towerBlock).not.toMatch(/ToySpringCoil/);
  });
});

describe("clock + spiral harbor quiet parity", () => {
  it("quiet-triggers paycheck and credit scars like Cove", () => {
    expect(scarTriggersChapterQuiet("cove_save_plaque")).toBe(true);
    expect(scarTriggersChapterQuiet("pp_rainy_protect")).toBe(true);
    expect(scarTriggersChapterQuiet("credit_haste_plaque")).toBe(true);
  });

  it("chapters map to organ share titles", () => {
    expect(
      scarChapterTitle({
        id: "pp_rainy",
        islandId: "paycheck_peninsula",
        choiceId: "x",
        label: "Protected the loft",
        kind: "plaque",
        createdAt: "2026-07-30",
      }),
    ).toBe("Paycheck Peninsula");
    expect(
      scarChapterTitle({
        id: "credit_haste",
        islandId: "credit_kingdom",
        choiceId: "x",
        label: "Paid on time",
        kind: "plaque",
        createdAt: "2026-07-30",
      }),
    ).toBe("Credit Kingdom");
  });
});
