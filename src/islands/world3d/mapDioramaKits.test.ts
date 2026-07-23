import { describe, expect, it } from "vitest";
import { getMapDioramaKit } from "./mapDioramaKits";

describe("mapDioramaKits", () => {
  it("keeps Harbor as meadow cottages + palms", () => {
    const kit = getMapDioramaKit("harbor_haven");
    expect(kit.arch).toBe("harbor_cottages");
    expect(kit.ecology).toBe("meadow_palms");
  });

  it("gives genre cities distinct architecture and ecology", () => {
    expect(getMapDioramaKit("venture_foundry").arch).toBe("neon_slabs");
    expect(getMapDioramaKit("venture_foundry").ecology).toBe("neon_pylons");
    expect(getMapDioramaKit("coincraft_cove").arch).toBe("solar_domes");
    expect(getMapDioramaKit("signal_city").ecology).toBe("gene_mangrove");
    expect(getMapDioramaKit("credit_kingdom").arch).toBe("scrap_shacks");
    expect(getMapDioramaKit("business_assets").arch).toBe("orbital_habitats");
    expect(getMapDioramaKit("intangibles").arch).toBe("upload_spires");
    expect(getMapDioramaKit("paycheck_peninsula").arch).toBe("ai_terminals");
  });

  it("does not clone the same kit across primary genre islands", () => {
    const kits = [
      "venture_foundry",
      "coincraft_cove",
      "signal_city",
      "intangibles",
      "business_assets",
      "credit_kingdom",
      "paycheck_peninsula",
    ].map((id) => getMapDioramaKit(id));
    const arch = new Set(kits.map((k) => k.arch));
    const eco = new Set(kits.map((k) => k.ecology));
    expect(arch.size).toBe(7);
    expect(eco.size).toBe(7);
  });
});
