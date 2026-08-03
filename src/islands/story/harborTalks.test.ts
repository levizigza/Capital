import { describe, expect, it } from "vitest";
import {
  HARBOR_NPCS,
  HARBOR_DIALOGUES,
  piggyGuidedGraph,
  piggyHomecomingGraph,
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

  it("serves Piggy homecoming graph after Cove Change", () => {
    const g = resolveHarborDialogue("piggy_penny", {
      guidedStep: "done",
      homecoming: {
        pending: true,
        celebrated: false,
        piggyTalked: false,
        message: "Piggy Penny: You came home different.",
      },
    });
    expect(g?.id).toBe("dlg_harbor_piggy_penny_homecoming");
    expect(g?.nodes[0]?.text).toMatch(/came home different/i);

    const afterTalk = resolveHarborDialogue("piggy_penny", {
      homecoming: { pending: false, celebrated: true, piggyTalked: true },
    });
    expect(afterTalk?.id).toBe("dlg_harbor_piggy_penny");
  });

  it("names Coin holds + Paycheck unlock after Cove scar homecoming", () => {
    const g = piggyHomecomingGraph(
      "Piggy Penny: The Coin holds — save a little; the jar still waits.",
      {
        scars: [
          {
            id: "cove_saver_plaque",
            islandId: "coincraft_cove",
            label: "Jar before treat",
          },
        ],
      },
    );
    expect(g.nodes.find((n) => n.id === "h1")?.text).toMatch(/Coin holds/);
    expect(g.nodes.find((n) => n.id === "h2")?.text).toMatch(
      /The Coin holds — save a little/,
    );
    expect(g.nodes.find((n) => n.id === "h2")?.text).toMatch(/Coin holds · Jar before treat/);
    expect(g.nodes.find((n) => n.id === "h3")?.text).toMatch(/Paycheck Peninsula/);
    expect(g.nodes.find((n) => n.id === "h3")?.text).toMatch(/Memory keeps/);
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

  it("does not steal island quest NPCs with scar memory graphs", () => {
    const scars = [
      {
        id: "cove_saver_plaque",
        islandId: "coincraft_cove",
        label: "Jar before treat",
      },
    ];
    expect(resolveHarborDialogue("npc_vendor_vee", { scars })).toBeUndefined();
    expect(resolveHarborDialogue("npc_artisan_alma", { scars })).toBeUndefined();
    expect(resolveHarborDialogue("coiny", { scars })?.id).toMatch(/scar|harbor/);
  });
});
