import { describe, expect, it } from "vitest";
import { buildHarborNpcLives, harborNpcPose } from "./harborNpcLives";
import {
  localNamesScarEcho,
  piggyScarMemoryLine,
} from "./worldMemory";
import { piggyMemoryGraph, resolveHarborDialogue } from "./story/harborTalks";

describe("cast-as-memory", () => {
  it("makes Piggy and most locals name the scar in ambient lines", () => {
    const lives = buildHarborNpcLives();
    const piggy = lives.find((l) => l.mascotId === "piggy_penny")!;
    const pose = harborNpcPose(piggy, "midday", null, {
      label: "Jar before treat",
      dayOffset: "same",
    });
    expect(pose.line).toMatch(/Jar before treat/);
    expect(pose.line).toMatch(/Piggy/);

    const naming = lives.filter((l) => localNamesScarEcho(l.mascotId, "midday"));
    expect(naming.length).toBeGreaterThanOrEqual(Math.floor(lives.length * 0.5));
  });

  it("gives Piggy a free-roam memory talk when plaques exist", () => {
    const g = piggyMemoryGraph([{ label: "Jar before treat", islandId: "coincraft_cove", id: "cove_saver_plaque" }]);
    expect(g.nodes[0]?.text).toMatch(/Jar before treat/);
    const resolved = resolveHarborDialogue("piggy_penny", {
      guidedStep: "done",
      scars: [{ label: "Jar before treat", islandId: "coincraft_cove", id: "cove_saver_plaque" }],
    });
    expect(resolved?.id).toBe("dlg_harbor_piggy_penny_memory");
  });

  it("makes plaza locals open Talk Battle on the scar", () => {
    const g = resolveHarborDialogue("coiny", {
      scars: [{ label: "Jar before treat", islandId: "coincraft_cove" }],
    });
    expect(g?.id).toMatch(/scar_memory/);
    expect(g?.nodes[0]?.text).toMatch(/Jar before treat/);
  });

  it("keeps Piggy scar lines distinct for same-day vs later", () => {
    expect(piggyScarMemoryLine("X", "same")).toMatch(/felt/);
    expect(piggyScarMemoryLine("X", "later")).toMatch(/tide|Still here/i);
  });
});
