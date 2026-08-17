import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Pillar 1 — Cashflow ledger is not Harbor hero chrome before Cove Change. */
describe("harbor early fantasy chrome", () => {
  it("defers VoyagerLedgerHud until side magnets / Cove Change", () => {
    const hub = readFileSync(join(__dirname, "HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/VoyagerLedgerHud/);
    expect(hub).toMatch(/sideMagnetsOpen \? \(/);
    expect(hub).toMatch(/!simplified && !castleMode && sideMagnetsOpen/);
  });
});
