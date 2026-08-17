import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Pillar 4/10 — Soft Beat crown readable from shore before enter. */
describe("shore Soft Beat distance beacon", () => {
  it("wires ShoreSoftBeatBeacon on jar · tower · keep landmarks", () => {
    const beacon = readFileSync(join(__dirname, "ShoreSoftBeatBeacon.tsx"), "utf8");
    const jar = readFileSync(join(__dirname, "CoinJarLandmark.tsx"), "utf8");
    const tower = readFileSync(join(__dirname, "PayrollTowerLandmark.tsx"), "utf8");
    const keep = readFileSync(join(__dirname, "InterestKeepLandmark.tsx"), "utf8");
    expect(beacon).toMatch(/shore-soft-beat-beacon/);
    expect(jar).toMatch(/ShoreSoftBeatBeacon/);
    expect(tower).toMatch(/ShoreSoftBeatBeacon/);
    expect(keep).toMatch(/ShoreSoftBeatBeacon/);
    expect(jar).toMatch(/Soft Beat lid/);
  });
});
