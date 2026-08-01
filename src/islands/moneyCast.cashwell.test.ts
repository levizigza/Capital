import { describe, expect, it } from "vitest";
import {
  HARBOR_LOCAL_CAST,
  MONEY_CAST,
  SERIES_LEAD_MASCOT_ID,
  getMascot,
  varyMascot,
} from "./moneyCast";
import { colorHex } from "./character";
import { HARBOR_NPCS } from "./story/harborTalks";

describe("Cashwell series lead", () => {
  it("registers Cashwell as series lead with locked sheet look", () => {
    expect(SERIES_LEAD_MASCOT_ID).toBe("cashwell");
    const m = getMascot("cashwell");
    expect(m.name).toBe("Cashwell");
    expect(m.form).toBe("coin");
    expect(m.glyph).toBe("$");
    expect(m.accessory).toBe("cap");
    expect(m.color).toBe("cashwell");
    expect(colorHex(m.color)).toBe("#14532d");
    expect(MONEY_CAST.some((c) => c.id === "cashwell")).toBe(true);
  });

  it("stands on Harbor Memory Courtyard side, never Piggy’s fountain slot", () => {
    const piggy = HARBOR_LOCAL_CAST.find((s) => s.mascotId === "piggy_penny");
    const cashwell = HARBOR_LOCAL_CAST.find((s) => s.mascotId === "cashwell");
    expect(piggy).toBeTruthy();
    expect(cashwell).toBeTruthy();
    expect(cashwell!.pos[0]).toBeGreaterThan(4);
    expect(cashwell!.pos[0]).not.toBe(piggy!.pos[0]);
    expect(HARBOR_NPCS.some((n) => n.id === "cashwell")).toBe(true);
  });

  it("does not randomize Cashwell’s coat or hat", () => {
    const a = varyMascot("cashwell", "harbor:cashwell:morning");
    const b = varyMascot("cashwell", "harbor:cashwell:evening");
    expect(a.color).toBe("cashwell");
    expect(b.color).toBe("cashwell");
    expect(a.accessory).toBe("cap");
    expect(b.accessory).toBe("cap");
    expect(a.name).toBe("Cashwell");
  });
});
