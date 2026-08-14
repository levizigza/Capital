import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { shouldOpenCoreLoopPrototype } from "./CoreLoopPrototype";

describe("Core loop prototype", () => {
  const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
  const proto = readFileSync(join(__dirname, "CoreLoopPrototype.tsx"), "utf8");
  const loopDoc = readFileSync(join(__dirname, "../../../GAME_DESIGN_LOOP.md"), "utf8");

  it("opens from ?coreLoop=1 and wires App before boot stack", () => {
    expect(app).toMatch(/shouldOpenCoreLoopPrototype/);
    expect(app).toMatch(/CoreLoopPrototype/);
    expect(app).toMatch(/showCoreLoop/);
    expect(app).toMatch(/searchParams\.delete\(['"]coreLoop['"]\)/);
    expect(proto).toMatch(/export function shouldOpenCoreLoopPrototype/);
  });

  it("shouldOpenCoreLoopPrototype gates on coreLoop=1", () => {
    expect(proto).toMatch(/get\("coreLoop"\) === "1"/);
    expect(typeof shouldOpenCoreLoopPrototype).toBe("function");
    // Node test env has no window — helper must fail closed.
    expect(shouldOpenCoreLoopPrototype()).toBe(false);
  });

  it("keeps the isolated Commit → hush → mark → felt → between cycle", () => {
    expect(proto).toMatch(/data-testid="core-loop-prototype"/);
    expect(proto).toMatch(/data-loop-phase=\{phase\}/);
    expect(proto).toMatch(/"choose"/);
    expect(proto).toMatch(/"hush"/);
    expect(proto).toMatch(/"mark"/);
    expect(proto).toMatch(/"felt"/);
    expect(proto).toMatch(/"between"/);
    expect(proto).toMatch(/playCapitalSfx\("take_mark"\)/);
    expect(proto).toMatch(/playCapitalSfx\("harbor_felt"\)/);
    expect(proto).toMatch(/drawMemoryPlinthSilhouette/);
    expect(proto).toMatch(/coldSpectacleHeadline/);
    expect(proto).toMatch(/core-loop-fork-\$/);
    expect(proto).toMatch(/core-loop-next/);
    expect(proto).toMatch(/Look — Soft Beat breath/);
  });

  it("does not smuggle progression chrome into the prototype", () => {
    expect(proto).not.toMatch(/Freedom Seal|freedomSeal/i);
    expect(proto).not.toMatch(/setXp|gainXp|totalCoins/);
    expect(proto).not.toMatch(/AshoreComprehensionTutorial/);
    expect(proto).not.toMatch(/questTracks/);
    expect(loopDoc).toMatch(/Do not bolt on progression/);
    expect(loopDoc).toMatch(/PLAYER ACTION/);
    expect(loopDoc).toMatch(/\?coreLoop=1/);
  });

  it("cycles Coin → Clock → Spiral forks with plaque vocabulary", () => {
    expect(proto).toMatch(/Jar before treat/);
    expect(proto).toMatch(/Umbrella before glitter/);
    expect(proto).toMatch(/Waited the spiral/);
    expect(proto).toMatch(/organ: "coin"/);
    expect(proto).toMatch(/organ: "clock"/);
    expect(proto).toMatch(/organ: "spiral"/);
  });
});
