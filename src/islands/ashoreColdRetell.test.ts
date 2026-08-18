import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ASHORE_VOYAGE_STEP } from "./harborAshore";
import { advanceHubGuided, createDefaultHubGuidedIntro } from "./story/storyBible";
import { piggyHomecomingGraph } from "./story/harborTalks";
import { coldOrganKidSentence } from "./worldMemory";

/**
 * Cold Ashore → Cove → Harbor retell — Talk → Carpet → Cove,
 * then Piggy names the kid organ sentence on homecoming.
 */
describe("Ashore → Cove cold retell", () => {
  it("keeps Ashore critical path Talk → voyage (Carpet), not Outfitter gate", () => {
    let g = createDefaultHubGuidedIntro();
    g = advanceHubGuided(g, "talked_guide");
    expect(g.step).toBe(ASHORE_VOYAGE_STEP);
    g = advanceHubGuided(g, "opened_map");
    expect(g.step).toBe("done");
  });

  it("Piggy homecoming recites the Coin holds kid sentence after Cove", () => {
    const kid = coldOrganKidSentence("coin");
    const g = piggyHomecomingGraph(`Piggy Penny: ${kid}`, {
      scars: [
        {
          id: "cove_saver_plaque",
          islandId: "coincraft_cove",
          label: "Jar before treat",
        },
      ],
    });
    expect(g.nodes.find((n) => n.id === "h1")?.text).toMatch(/Coin holds/);
    expect(g.nodes.find((n) => n.id === "h2")?.text).toContain(kid);
    expect(g.nodes.find((n) => n.id === "h3")?.text).toMatch(/Paycheck Peninsula/);
    expect(g.nodes.find((n) => n.id === "h3")?.text).toMatch(/Memory keeps/);
  });

  it("wires kid sentences into IslandsApp Cove / Paycheck / Credit homecoming", () => {
    const app = readFileSync(join(__dirname, "IslandsApp.tsx"), "utf8");
    expect(app).toContain(coldOrganKidSentence("coin"));
    // Paycheck homecoming is choice-true — names what Harbor kept, not the exam answer.
    expect(app).toMatch(/The Clock kept the loft dry when the sky cracked/);
    expect(app).toMatch(/The Clock still names the rain gossip/);
    expect(app).toContain(coldOrganKidSentence("spiral"));
  });
});
