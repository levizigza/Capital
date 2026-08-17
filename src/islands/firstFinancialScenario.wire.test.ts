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
});
