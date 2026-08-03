import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Pillar 11 — mute test: eyes closed, Take → hush → Harbor felt that.
 * Distinct stingers (not Soft Beat / trailer cheer reuse).
 */
describe("Signature mute-test audio", () => {
  const views = join(__dirname, "../views");
  const sfx = readFileSync(join(__dirname, "capitalSfx.ts"), "utf8");

  it("defines take_mark, harbor_felt, and piggy_homecoming stingers", () => {
    expect(sfx).toMatch(/case "take_mark"/);
    expect(sfx).toMatch(/case "harbor_felt"/);
    expect(sfx).toMatch(/case "piggy_homecoming"/);
  });

  it("homecoming Talk fires piggy_homecoming", () => {
    const app = readFileSync(join(__dirname, "../IslandsApp.tsx"), "utf8");
    expect(app).toMatch(/piggy_homecoming/);
    expect(app).toMatch(/dlg_harbor_piggy_penny_homecoming/);
  });

  it("Take mark fires take_mark (not soft_beat)", () => {
    const take = readFileSync(join(views, "TakeHushOverlay.tsx"), "utf8");
    expect(take).toMatch(/playCapitalSfx\("take_mark"\)/);
    expect(take).toMatch(/playCapitalSfx\("scar_chime"\)/);
    expect(take).toMatch(/playOrganSfx/);
    // soft_beat stays Soft Beat lookout-only
    expect(take).not.toMatch(/playCapitalSfx\("soft_beat"\)/);
  });

  it("Spectacle reveal fires harbor_felt (not harbor_cheer)", () => {
    const spectacle = readFileSync(join(views, "ScarSpectacleOverlay.tsx"), "utf8");
    expect(spectacle).toMatch(/playCapitalSfx\("scar_chime"\)/);
    expect(spectacle).toMatch(/playCapitalSfx\("harbor_felt"\)/);
    expect(spectacle).toMatch(/playCapitalSfx\("plinth_hum"\)/);
    expect(spectacle).not.toMatch(/playCapitalSfx\("harbor_cheer"\)/);
  });

  it("Share lands harbor_felt + organ + plinth_hum", () => {
    const share = readFileSync(join(views, "HarborFeltShareOverlay.tsx"), "utf8");
    expect(share).toMatch(/playCapitalSfx\("harbor_felt"\)/);
    expect(share).toMatch(/playOrganSfx/);
    expect(share).toMatch(/playCapitalSfx\("plinth_hum"\)/);
  });

  it("Soft Beat lookout still owns soft_beat", () => {
    const soft = readFileSync(join(views, "SoftBeatOverlay.tsx"), "utf8");
    expect(soft).toMatch(/playCapitalSfx\(hushActive \? "scar_chime" : "soft_beat"\)/);
  });
});
