import { describe, expect, it } from "vitest";

import { centerOffset, computeIntegerScale, scaledSize } from "./scaling";

describe("computeIntegerScale", () => {
  it("returns largest integer fit without fractional scale", () => {
    expect(computeIntegerScale(640, 360, { nativeWidth: 320, nativeHeight: 180 })).toBe(2);
    expect(computeIntegerScale(500, 300, { nativeWidth: 320, nativeHeight: 180 })).toBe(1);
    expect(computeIntegerScale(960, 540, { nativeWidth: 320, nativeHeight: 180 })).toBe(3);
  });

  it("never returns fractional values", () => {
    const scale = computeIntegerScale(333, 187, { nativeWidth: 320, nativeHeight: 180 });
    expect(Number.isInteger(scale)).toBe(true);
    expect(scale).toBe(1);
  });

  it("respects maxScale cap", () => {
    expect(
      computeIntegerScale(4000, 3000, { nativeWidth: 32, nativeHeight: 32, maxScale: 4 })
    ).toBe(4);
  });
});

describe("scaledSize", () => {
  it("multiplies native dimensions by integer scale", () => {
    expect(scaledSize(32, 32, 4)).toEqual({ width: 128, height: 128 });
  });
});

describe("centerOffset", () => {
  it("centers content in container", () => {
    expect(centerOffset(200, 100, 128, 64)).toEqual({ x: 36, y: 18 });
  });
});
