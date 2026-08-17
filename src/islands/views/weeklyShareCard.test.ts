import { describe, expect, it } from "vitest";
import { feltCardCopy, resolveFeltOrgan } from "./weeklyShareCard";

describe("Harbor felt share card copy", () => {
  it("puts kid sentence + plaque retell on each spine organ", () => {
    const coin = feltCardCopy({
      voyagerName: "Sam",
      scarLabel: "Jar before treat",
      chapter: "Coincraft Cove",
      scarId: "cove_saver_plaque",
      islandId: "coincraft_cove",
    });
    expect(coin.organ).toBe("coin");
    expect(coin.seal).toBe("COIN");
    expect(coin.brand).toBe("CAPITAL");
    expect(coin.kid).toMatch(/^The Coin holds/);
    expect(coin.retell).toMatch(/Jar before treat/);
    expect(coin.retell).toMatch(/Coin/);

    const clock = feltCardCopy({
      voyagerName: "Sam",
      scarLabel: "Umbrella before glitter",
      scarId: "pp_protector_plaque",
      islandId: "paycheck_peninsula",
    });
    expect(clock.organ).toBe("clock");
    expect(clock.seal).toBe("CLOCK");
    expect(clock.kid).toMatch(/^The Clock shelters/);

    const spiral = feltCardCopy({
      voyagerName: "Sam",
      scarLabel: "Waited the spiral",
      scarId: "credit_patience_plaque",
      islandId: "credit_kingdom",
    });
    expect(spiral.organ).toBe("spiral");
    expect(spiral.seal).toBe("SPIRAL");
    expect(spiral.kid).toMatch(/^The Spiral withstands/);
  });

  it("prefers explicit organId over fuzzy chapter", () => {
    expect(
      resolveFeltOrgan({
        voyagerName: "Sam",
        scarLabel: "x",
        chapter: "Mystery chapter",
        organId: "memory",
      }),
    ).toBe("memory");
  });
});
