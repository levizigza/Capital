import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { SOUNDTRACK, cueForIsland } from "../audio/soundtrackCatalog";

describe("Money Structure interiors + soundtrack permanence", () => {
  it("mounts jar · bank · tower · keep architecture", () => {
    const view = readFileSync(
      join(__dirname, "MoneyStructureInteriorView.tsx"),
      "utf8",
    );
    expect(view).toMatch(/JarInteriorArchitecture/);
    expect(view).toMatch(/BankInteriorArchitecture/);
    expect(view).toMatch(/TowerInteriorArchitecture/);
    expect(view).toMatch(/KeepInteriorArchitecture/);
  });

  it("keeps Wave 6 organ soundtrack files and island cue map", () => {
    expect(cueForIsland("harbor_haven")).toBe("harbor_haven");
    expect(cueForIsland("coincraft_cove")).toBe("solarpunk_cove");
    expect(cueForIsland("paycheck_peninsula")).toBe("ai_undercity");
    expect(cueForIsland("credit_kingdom")).toBe("credit_ruins");
    for (const track of Object.values(SOUNDTRACK)) {
      const abs = join(__dirname, "../../../public", track.file);
      expect(existsSync(abs), track.file).toBe(true);
    }
  });
});
