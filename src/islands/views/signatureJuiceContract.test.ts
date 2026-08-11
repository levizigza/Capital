import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Pillar 4 feel contract — Take → Plinth → share must fire juice beats.
 */
describe("Signature juice contract", () => {
  const take = readFileSync(join(__dirname, "TakeHushOverlay.tsx"), "utf8");
  const spectacle = readFileSync(join(__dirname, "ScarSpectacleOverlay.tsx"), "utf8");
  const share = readFileSync(join(__dirname, "HarborFeltShareOverlay.tsx"), "utf8");
  const fail = readFileSync(join(__dirname, "MinigameFailOverlay.tsx"), "utf8");
  const viewport = readFileSync(join(__dirname, "../../game-ui/GameViewport.tsx"), "utf8");

  it("wires juice into Take mark, Plinth peak, and share accept", () => {
    expect(take).toMatch(/triggerJuice\("reward"/);
    expect(spectacle).toMatch(/triggerJuice\("complete"/);
    expect(share).toMatch(/triggerJuice\("accept"/);
    expect(share).toMatch(/triggerJuice\("reward"/);
  });

  it("mounts the juice viewport and fail stinger", () => {
    expect(viewport).toMatch(/juice-viewport/);
    expect(viewport).toMatch(/juice\.css/);
    expect(fail).toMatch(/triggerJuice\("fail"/);
  });

  it("juices carpet rail start + land", () => {
    const carpet = readFileSync(
      join(__dirname, "../world3d/CarpetFlightView.tsx"),
      "utf8",
    );
    expect(carpet).toMatch(/triggerJuice\("accept"/);
    expect(carpet).toMatch(/triggerJuice\("complete"/);
    expect(carpet).toMatch(/playCapitalSfx\("harbor_cheer"\)/);
  });

  it("juices structure enter, Soft Beat, day-2, and structure exit", () => {
    const arrive = readFileSync(join(__dirname, "WorldArriveOverlay.tsx"), "utf8");
    const soft = readFileSync(join(__dirname, "SoftBeatOverlay.tsx"), "utf8");
    const day2 = readFileSync(join(__dirname, "Day2EchoOverlay.tsx"), "utf8");
    const interior = readFileSync(
      join(__dirname, "../world3d/MoneyStructureInteriorView.tsx"),
      "utf8",
    );
    expect(arrive).toMatch(/triggerJuice\("accept"/);
    expect(soft).toMatch(/triggerJuice\("accept"/);
    expect(day2).toMatch(/triggerJuice\("accept"/);
    expect(interior).toMatch(/triggerJuice\("complete"/);
    expect(interior).toMatch(/pointerSafeActivate/);
  });

  it("locks arrive blurbs to organ kid verbs — no stamps/weighs drift", () => {
    const arrive = readFileSync(join(__dirname, "WorldArriveOverlay.tsx"), "utf8");
    expect(arrive).toMatch(/coldOrganKidSentence/);
    expect(arrive).not.toMatch(/Clock stamps/);
    expect(arrive).not.toMatch(/Spiral weighs/);
  });
});
