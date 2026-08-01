import { describe, expect, it } from "vitest";
import {
  MEMORY_PLINTH_CINEMA_EYE,
  MEMORY_PLINTH_ICON,
  MEMORY_PLINTH_ID,
  MEMORY_PLINTH_LABEL,
  MEMORY_PLINTH_LOOK_AT,
  MEMORY_PLINTH_POSITION,
  MEMORY_PLINTH_SILHOUETTE_PARTS,
  drawMemoryPlinthSilhouette,
  harborMemoryPlinthHotspot,
} from "./harborIcon";

describe("one Harbor icon — Memory Plinth", () => {
  it("is always placeable as a plinth hotspot (empty or scarred)", () => {
    const empty = harborMemoryPlinthHotspot();
    expect(empty.id).toBe(MEMORY_PLINTH_ID);
    expect(empty.kind).toBe("plinth");
    expect(empty.label).toBe(MEMORY_PLINTH_LABEL);
    expect(empty.icon).toBe(MEMORY_PLINTH_ICON);
    expect(empty.icon).not.toBe("🪨");
    expect(MEMORY_PLINTH_ICON).toBe("📒");

    const scarred = harborMemoryPlinthHotspot({ scarCount: 2 });
    expect(scarred.label).toMatch(/Memory Plinth/);
    expect(scarred.label).toMatch(/2/);
  });

  it("names kid-drawable silhouette parts — ledger, not rock", () => {
    expect(MEMORY_PLINTH_SILHOUETTE_PARTS).toContain("terrace");
    expect(MEMORY_PLINTH_SILHOUETTE_PARTS).toContain("open ledger");
    expect(MEMORY_PLINTH_SILHOUETTE_PARTS).toContain("scar lamp");
  });

  it("exports a Plinth cinema eye + look-at above the terrace", () => {
    expect(MEMORY_PLINTH_LOOK_AT[0]).toBe(MEMORY_PLINTH_POSITION[0]);
    expect(MEMORY_PLINTH_LOOK_AT[2]).toBe(MEMORY_PLINTH_POSITION[2]);
    expect(MEMORY_PLINTH_LOOK_AT[1]).toBeGreaterThan(MEMORY_PLINTH_POSITION[1]);
    expect(MEMORY_PLINTH_CINEMA_EYE[1]).toBeGreaterThan(MEMORY_PLINTH_LOOK_AT[1]);
  });

  it("draws a plinth silhouette into a canvas context", () => {
    const calls: string[] = [];
    const ctx = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      beginPath: () => calls.push("begin"),
      moveTo: () => calls.push("move"),
      lineTo: () => calls.push("line"),
      closePath: () => calls.push("close"),
      fill: () => calls.push("fill"),
      stroke: () => calls.push("stroke"),
      arc: () => calls.push("arc"),
    } as unknown as CanvasRenderingContext2D;

    drawMemoryPlinthSilhouette(ctx, 100, 100, 1, true);
    expect(calls).toContain("fill");
    expect(calls).toContain("arc");
    expect(calls.filter((c) => c === "fill").length).toBeGreaterThanOrEqual(3);
  });
});
