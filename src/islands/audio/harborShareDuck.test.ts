import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Pillar 11 — share/spectacle must duck Memory bed so Harbor-felt reads. */
describe("harbor share audio duck", () => {
  it("HomeHub ducks Memory bed while spectacle or share is open", () => {
    const hub = readFileSync(join(__dirname, "../views/HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/spectacleOpen \|\| feltShareOpen/);
    expect(hub).toMatch(/capitalMusic\.playPlace\(\{ kind: "harbor", hush \}\)/);
  });

  it("share fires harbor_felt + organ + plinth_hum", () => {
    const share = readFileSync(
      join(__dirname, "../views/HarborFeltShareOverlay.tsx"),
      "utf8",
    );
    expect(share).toMatch(/playCapitalSfx\("harbor_felt"\)/);
    expect(share).toMatch(/playOrganSfx/);
    expect(share).toMatch(/playCapitalSfx\("plinth_hum"\)/);
  });
});
