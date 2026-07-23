import { describe, expect, it } from "vitest";
import { approachBlend, eraDimension, shellForEra } from "./eraMorph";
import { lerpEraLook3D, getEraLook3D } from "./world3d/eraLooks";

describe("eraMorph", () => {
  it("maps early decades to screen2d and later to world3d", () => {
    expect(eraDimension("era-1960s")).toBe("screen2d");
    expect(eraDimension("era-1970s")).toBe("screen2d");
    expect(eraDimension("era-1980s")).toBe("world3d");
    expect(eraDimension("era-2020s")).toBe("world3d");
    expect(eraDimension("capital-default")).toBe("world3d");
  });

  it("picks decade chrome shells for each island lens", () => {
    expect(shellForEra("era-1960s")).toBe("arcade");
    expect(shellForEra("era-1970s")).toBe("retro");
    expect(shellForEra("era-1980s")).toBe("neon");
    expect(shellForEra("era-1990s")).toBe("arcade");
    expect(shellForEra("era-2010s")).toBe("broker");
  });

  it("smoothsteps approach blend from far → dock", () => {
    expect(approachBlend(120)).toBe(0);
    expect(approachBlend(90)).toBe(0);
    expect(approachBlend(16)).toBe(1);
    expect(approachBlend(10)).toBe(1);
    const mid = approachBlend(53);
    expect(mid).toBeGreaterThan(0.4);
    expect(mid).toBeLessThan(0.6);
  });

  it("lerps sky/sea and snaps shading after halfway", () => {
    const from = getEraLook3D("capital-default");
    const to = getEraLook3D("era-1960s");
    const early = lerpEraLook3D(from, to, 0.2);
    const late = lerpEraLook3D(from, to, 0.8);
    expect(early.shading).toBe("harbor");
    expect(late.shading).toBe("vector");
    expect(early.skyTop).not.toBe(from.skyTop);
    expect(late.id).toBe("era-1960s");
  });
});
