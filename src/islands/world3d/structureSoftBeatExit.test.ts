import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Structure Soft Beat → exit must keep the host plaza/shore mounted
 * (visibility hide, not unmount). Guards iconicCraftCadence structure_exit.
 */
describe("structure Soft Beat exit remount contract", () => {
  it("Harbor bank stays mounted under Ledger Soft Beat", () => {
    const hub = readFileSync(join(__dirname, "../views/HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/Keep Harbor mounted under the bank/);
    expect(hub).toMatch(/visibility:\s*"hidden"/);
    expect(hub).toMatch(/data-testid="harbor-home-hub"/);
    expect(hub).toMatch(/capital:qa-structure/);
    expect(hub).toMatch(/setBankSoftBeat\("ledger"\)/);
  });

  it("Shore Money Structure stays mounted under Soft Beat", () => {
    const shore = readFileSync(join(__dirname, "../views/IslandShoreView.tsx"), "utf8");
    expect(shore).toMatch(/data-testid="island-shore-view"/);
    expect(shore).toMatch(/visibility:\s*"hidden"/);
    expect(shore).toMatch(/capital:qa-structure/);
    expect(shore).toMatch(/softBeat === "lookout"/);
  });

  it("Soft Beat overlay exposes leave + organ retell hooks", () => {
    const soft = readFileSync(join(__dirname, "../views/SoftBeatOverlay.tsx"), "utf8");
    expect(soft).toMatch(/data-testid="soft-beat-overlay"/);
    expect(soft).toMatch(/data-testid="soft-beat-leave"/);
    expect(soft).toMatch(/data-testid="soft-beat-retell"/);
  });
});
