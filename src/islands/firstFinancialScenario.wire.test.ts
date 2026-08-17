import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("first financial scenario wire", () => {
  it("IslandsApp applies real ledger footprint on Cove Take", () => {
    const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/applyCoveTakeLedgerFootprint/);
    expect(app).toMatch(/COVE_TAKE_KEY/);
    expect(app).toMatch(/coveTakeStanceFromChoiceId/);
  });

  it("scenario doc exists and forbids tutorial-only fake rules", () => {
    const doc = readFileSync(
      join(__dirname, "../../docs/ftue/FIRST_FINANCIAL_SCENARIO.md"),
      "utf8",
    );
    expect(doc).toMatch(/NOTICE/);
    expect(doc).toMatch(/TRY AGAIN/);
    expect(doc).toMatch(/No tutorial-only money/);
    expect(doc).toMatch(/EarnSpend/);
  });

  it("feedback audit wires: footprint strip, collect toast, clear-at, claim SFX, ledger words", () => {
    const audit = readFileSync(join(__dirname, "../../docs/ftue/FEEDBACK_AUDIT.md"), "utf8");
    expect(audit).toMatch(/Did that work/);
    expect(audit).toMatch(/Cash flow/);

    const shore = readFileSync(join(__dirname, "views/IslandShoreView.tsx"), "utf8");
    expect(shore).toMatch(/takeFootprintFeedbackLine/);
    expect(shore).toMatch(/footprintLine=/);

    const hush = readFileSync(join(__dirname, "views/TakeHushOverlay.tsx"), "utf8");
    expect(hush).toMatch(/take-cinema-footprint/);

    const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/Got \$\{item\.name\}/);
    expect(app).toMatch(/organ_coin/);
    expect(app).toMatch(/\+\$\{rewards\.coins\} coins/);

    const mg = readFileSync(join(__dirname, "minigames/ModularMinigame.tsx"), "utf8");
    expect(mg).toMatch(/minigame-clear-at/);
    expect(mg).toMatch(/Clear at/);

    const ashore = readFileSync(join(__dirname, "views/AshoreComprehensionTutorial.tsx"), "utf8");
    expect(ashore).toMatch(/playCapitalSfx\("walk_stop"\)/);

    const hud = readFileSync(join(__dirname, "views/VoyagerLedgerHud.tsx"), "utf8");
    expect(hud).toMatch(/keep \+/);
    expect(hud).toMatch(/drain −/);
    expect(hud).toMatch(/voyager-ledger-cf/);
    // Cashflow polarity must not rely on emerald/rose alone
    expect(hud).not.toMatch(/cfPositive \? "text-emerald/);
    expect(hud).not.toMatch(/cfPositive \? .*text-rose/);
  });
});
