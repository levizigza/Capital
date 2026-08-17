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
      organ: "coin",
    });
    expect(pose.line).toMatch(/Jar before treat/);
    expect(pose.line).toMatch(/Piggy/);
    expect(pose.line).toMatch(/Coin/);

    const naming = lives.filter((l) => localNamesScarEcho(l.mascotId, "midday"));
    expect(naming.length).toBeGreaterThanOrEqual(Math.floor(lives.length * 0.5));
  });

  it("rotates living ambient lines for plaza locals when scar echo exists", () => {
    const lives = buildHarborNpcLives();
    const coiny = lives.find((l) => l.mascotId === "coiny")!;
    const morning = harborNpcPose(coiny, "morning", null, {
      label: "Jar before treat",
      dayOffset: "same",
      organ: "coin",
    });
    const evening = harborNpcPose(coiny, "evening", null, {
      label: "Jar before treat",
      dayOffset: "same",
      organ: "coin",
    });
    expect(morning.line).toMatch(/Jar before treat/);
    expect(evening.line).toMatch(/Jar before treat/);
    expect(morning.line).not.toEqual(evening.line);
  });

  it("gives tip-hat series leads a short ambientNear when no scar", () => {
    const lives = buildHarborNpcLives();
    const cashwell = lives.find((l) => l.mascotId === "cashwell")!;
    expect(cashwell.ambientNear).toMatch(/Tip the hat|Plinth/i);
    const pose = harborNpcPose(cashwell, "midday", null, null);
    expect(pose.line).toBe(cashwell.ambientNear);
    expect(pose.line.length).toBeLessThan(90);
  });

  it("keeps more plaza locals dynamic so streets feel populated", () => {
    const lives = buildHarborNpcLives().filter((l) => l.mascotId !== "piggy_penny");
    const dynamic = lives.filter((l) => l.motion === "dynamic");
    expect(dynamic.length).toBeGreaterThanOrEqual(4);
  });

  it("gives Piggy a free-roam memory talk when plaques exist", () => {
    const g = piggyMemoryGraph([{ label: "Jar before treat", islandId: "coincraft_cove", id: "cove_saver_plaque" }]);
    expect(g.nodes[0]?.text).toMatch(/Jar before treat/);
    expect(g.nodes[0]?.text).toMatch(/Coin/);
    const resolved = resolveHarborDialogue("piggy_penny", {
      guidedStep: "done",
      scars: [{ label: "Jar before treat", islandId: "coincraft_cove", id: "cove_saver_plaque" }],
    });
    expect(resolved?.id).toBe("dlg_harbor_piggy_penny_memory");
  });

  it("makes plaza locals open Talk Battle on the scar", () => {
    const g = resolveHarborDialogue("coiny", {
      scars: [{ label: "Jar before treat", islandId: "coincraft_cove", id: "cove_saver_plaque" }],
    });
    expect(g?.id).toMatch(/scar_memory/);
    expect(g?.nodes[0]?.text).toMatch(/Jar before treat/);
    expect(g?.nodes[0]?.text).toMatch(/Coin/);
  });

  it("keeps Piggy scar lines distinct for same-day vs later", () => {
    expect(piggyScarMemoryLine("X", "same", "coin")).toMatch(/felt/);
    expect(piggyScarMemoryLine("X", "same", "coin")).toMatch(/Coin holds/);
    expect(piggyScarMemoryLine("X", "later", "clock")).toMatch(/Still here/i);
    expect(piggyScarMemoryLine("X", "later", "clock")).toMatch(/Clock shelters/);
  });

  it("names Clock and Spiral in Talk Battle openers", () => {
    const clock = resolveHarborDialogue("coiny", {
      scars: [{ label: "Umbrella before glitter", islandId: "paycheck_peninsula", id: "pp_protector_plaque" }],
    });
    expect(clock?.nodes[0]?.text).toMatch(/Clock/);
    const spiral = resolveHarborDialogue("coiny", {
      scars: [{ label: "Waited the spiral", islandId: "credit_kingdom", id: "credit_patience_plaque" }],
    });
    expect(spiral?.nodes[0]?.text).toMatch(/Spiral/);
  });

  it("names digression scars in Talk Battle without falling into tip lists", () => {
    const g = resolveHarborDialogue("coiny", {
      scars: [
        {
          id: "cc_shell_impulse",
          islandId: "coincraft_cove",
          label: "Bought Shelly’s shell want",
          kind: "npc_tone",
        },
      ],
    });
    expect(g?.id).toMatch(/scar_memory/);
    expect(String(g?.nodes[0]?.text)).toMatch(/Shelly|shell want/i);
    expect(g?.nodes.some((n) => String(n.text).match(/Count your coins before you spend/i))).toBe(
      false,
    );
  });
});
