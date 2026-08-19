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

    const withMath = piggyHomecomingGraph("Piggy Penny: Home.", {
      scars: [
        {
          id: "cove_saver_plaque",
          islandId: "coincraft_cove",
          label: "Jar before treat",
        },
      ],
      footprintLine: "Monthly keep +$5/mo · Cove Jar Hold",
    });
    expect(withMath.nodes.find((n) => n.id === "h2")?.text).toMatch(
      /Monthly keep \+\$5\/mo · Cove Jar Hold/,
    );
  });

  it("gives distinct tip beats per mascot role", () => {
    const piggy = resolveProfileText(harborTipPreview("piggy_penny"), "apprentice");
    const spendy = resolveProfileText(harborTipPreview("spendy_sue"), "apprentice");
    const vault = resolveProfileText(harborTipPreview("vault_vince"), "apprentice");
    expect(piggy).not.toEqual(spendy);
    expect(spendy).not.toEqual(vault);
    expect(piggy.toLowerCase()).toMatch(/coin holds|memory keeps|organ/);
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

  it("plaza locals vividly name digression scars (alive streets, not tip lists)", () => {
    const patience = resolveHarborDialogue("coiny", {
      scars: [
        {
          id: "cc_shell_patience",
          islandId: "coincraft_cove",
          label: "Left Shelly’s shell on the stall",
          kind: "npc_tone",
        },
      ],
    });
    expect(patience?.id).toMatch(/scar_memory/);
    const p0 = String(patience?.nodes[0]?.text ?? "");
    expect(p0).toMatch(/Shelly/);
    expect(p0).toMatch(/Left Shelly/);
    expect(p0).not.toMatch(/Count your coins before you spend/i);

    const impulse = resolveHarborDialogue("spendy_sue", {
      scars: [
        {
          id: "cc_shell_impulse",
          islandId: "coincraft_cove",
          label: "Bought Shelly’s shell want",
          kind: "npc_tone",
        },
      ],
    });
    expect(String(impulse?.nodes[0]?.text ?? "")).toMatch(/shell want|Bought Shelly/i);

    const rumor = resolveHarborDialogue("tip_jar_tom", {
      scars: [
        {
          id: "ck_collector_rumor",
          islandId: "credit_kingdom",
          label: "Heard the Bank of Obligation pitch",
          kind: "npc_tone",
        },
      ],
    });
    expect(String(rumor?.nodes[0]?.text ?? "")).toMatch(/Collector|canyon|Bank of Obligation/i);
  });

  it("tip-hat series leads name digression scars with vivid free-roam receipts", () => {
    const scars = [
      {
        id: "cc_shell_impulse",
        islandId: "coincraft_cove",
        label: "Bought Shelly’s shell want",
        kind: "npc_tone" as const,
      },
    ];
    for (const id of ["cashmere", "mula_mami", "jade_fortune"] as const) {
      const g = resolveHarborDialogue(id, { scars });
      expect(g?.id).toMatch(/scar_memory/);
      const mid = String(g?.nodes.find((n) => n.id === "s1")?.text ?? "");
      expect(mid).toMatch(/Bought Shelly|shell want|digression|side/i);
      expect(mid).not.toMatch(/Pay yourself first/i);
      expect(mid).not.toMatch(/Automate a savings/i);
    }
  });

  it("series leads name spine plaques as living receipts, not tip lists", () => {
    const g = resolveHarborDialogue("cashwell", {
      scars: [
        {
          id: "cove_saver_plaque",
          islandId: "coincraft_cove",
          label: "Jar before treat",
        },
      ],
    });
    expect(g?.id).toMatch(/scar_memory/);
    expect(String(g?.nodes[0]?.text ?? "")).toMatch(/Jar before treat/);
    expect(String(g?.nodes.find((n) => n.id === "s1")?.text ?? "")).toMatch(/Plinth|Coin|receipt/i);
    expect(String(g?.nodes.find((n) => n.id === "s1")?.text ?? "")).not.toMatch(
      /Always up — after you face the Take/i,
    );
  });

  it("Piggy free-roam names digression scars with weight, not a lecture", () => {
    const g = resolveHarborDialogue("piggy_penny", {
      guidedStep: "done",
      scars: [
        {
          id: "cc_shell_patience",
          islandId: "coincraft_cove",
          label: "Left Shelly’s shell on the stall",
          kind: "npc_tone",
        },
      ],
    });
    expect(g?.id).toBe("dlg_harbor_piggy_penny_memory");
    const t = String(g?.nodes[0]?.text ?? "");
    expect(t).toMatch(/Shelly/);
    expect(t).toMatch(/Left Shelly/);
    expect(t).not.toMatch(/Automate a savings transfer/i);
    expect(t).not.toMatch(/Pay yourself first/i);
  });
});
