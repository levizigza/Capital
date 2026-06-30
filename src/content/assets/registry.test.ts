import { describe, it, expect } from "vitest";

import { AssetRegistryEntrySchema } from "./schema";
import { formatCreditsTxt, formatThirdPartyLicensesTxt } from "./formatCredits";

describe("asset registry", () => {
  it("rejects entries missing attributionText", () => {
    const result = AssetRegistryEntrySchema.safeParse({
      id: "bad-asset",
      name: "Test",
      type: "image",
      source: "opengameart",
      sourceUrl: "https://opengameart.org/content/test",
      author: "Author",
      license: "CC0-1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionText: "",
      modifications: "None",
    });
    expect(result.success).toBe(false);
  });

  it("requires gameDevMarket block for gamedevmarket source", () => {
    const result = AssetRegistryEntrySchema.safeParse({
      id: "gdm-asset",
      name: "GDM Pack",
      type: "sprite",
      source: "gamedevmarket",
      sourceUrl: "https://www.gamedevmarket.net/asset/test",
      author: "Studio",
      license: "Commercial",
      licenseUrl: "https://www.gamedevmarket.net/terms",
      attributionText: "Pack by Studio.",
      modifications: "None",
    });
    expect(result.success).toBe(false);
  });

  it("formats export text with attribution", () => {
    const entry = {
      id: "test",
      name: "Test Asset",
      type: "image" as const,
      source: "opengameart" as const,
      sourceUrl: "https://opengameart.org/content/test",
      author: "Alice",
      license: "CC0-1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionText: "Test Asset by Alice, CC0.",
      modifications: "None",
    };
    expect(formatCreditsTxt([entry])).toContain("Test Asset by Alice");
    expect(formatThirdPartyLicensesTxt([entry])).toContain("[test]");
  });
});
