import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  disposeMoneyCarpetTexture,
  getMoneyCarpetTexture,
} from "./moneyCarpetTexture";

describe("moneyCarpetTexture", () => {
  const fillText = vi.fn();
  const stroke = vi.fn();
  const fill = vi.fn();
  const fillRect = vi.fn();
  const strokeRect = vi.fn();

  beforeEach(() => {
    disposeMoneyCarpetTexture();
    fillText.mockClear();
    const ctx = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      font: "",
      textAlign: "left",
      textBaseline: "alphabetic",
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
      createRadialGradient: () => ({ addColorStop: vi.fn() }),
      fillRect,
      strokeRect,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke,
      fill,
      arc: vi.fn(),
      ellipse: vi.fn(),
      fillText,
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ctx,
    };
    vi.stubGlobal("document", {
      createElement: (tag: string) => {
        if (tag !== "canvas") throw new Error(`unexpected element ${tag}`);
        return canvas;
      },
    });
  });

  afterEach(() => {
    disposeMoneyCarpetTexture();
    vi.unstubAllGlobals();
  });

  it("paints Fortune banknote labels and caches the texture", () => {
    const tex = getMoneyCarpetTexture();
    expect(tex).toBeTruthy();
    expect(getMoneyCarpetTexture()).toBe(tex);

    const labels = fillText.mock.calls.map((c) => String(c[0]));
    expect(labels.some((t) => t.includes("MONEY CARPET"))).toBe(true);
    expect(labels.some((t) => t.includes("FORTUNE"))).toBe(true);
    expect(labels.filter((t) => t === "$").length).toBeGreaterThanOrEqual(2);
    expect(labels).toContain("1");
  });
});
