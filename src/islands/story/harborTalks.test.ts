import { describe, expect, it } from "vitest";
import {
  HARBOR_NPCS,
  HARBOR_DIALOGUES,
  piggyGuidedGraph,
  resolveHarborDialogue,
  findHarborNpc,
  harborTipPreview,
} from "./harborTalks";
import { resolveProfileText } from "../learningProfile";

describe("harborTalks", () => {
  it("covers every Harbor local with a dialogue graph", () => {
    expect(HARBOR_NPCS.length).toBeGreaterThan(3);
    for (const npc of HARBOR_NPCS) {
      const g = resolveHarborDialogue(npc.id);
      expect(g?.id).toBe(`dlg_harbor_${npc.id}`);
      expect(g?.nodes.length).toBeGreaterThan(0);
    }
    expect(HARBOR_DIALOGUES.length).toBeGreaterThanOrEqual(HARBOR_NPCS.length);
  });

  it("builds guided Piggy graphs for Castle Grounds steps", () => {
    const g = piggyGuidedGraph("meet_guide");
    expect(g.startNodeId).toBe("g1");
    expect(g.nodes[0]?.speaker).toMatch(/Piggy/i);
    expect(resolveHarborDialogue("piggy_penny", "to_dock")?.id).toContain("guided");
    expect(findHarborNpc("piggy_penny")?.name).toMatch(/Piggy/);
  });

  it("gives distinct tip beats per mascot role", () => {
    const piggy = resolveProfileText(harborTipPreview("piggy_penny"), "apprentice");
    const spendy = resolveProfileText(harborTipPreview("spendy_sue"), "apprentice");
    const vault = resolveProfileText(harborTipPreview("vault_vince"), "apprentice");
    expect(piggy).not.toEqual(spendy);
    expect(spendy).not.toEqual(vault);
    expect(piggy.toLowerCase()).toMatch(/save|pay yourself/);
    expect(spendy.toLowerCase()).toMatch(/impulse|wait|24/);
  });
});
