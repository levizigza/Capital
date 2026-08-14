import { describe, expect, it } from "vitest";
import {
  deriveEmergentIdentity,
  recordDealAccepted,
  recordDealPassed,
  identitySoftBeatLine,
  identityDealCounsel,
} from "./emergentIdentity";
import { createDefaultIslandSave } from "./save";
import { createDefaultVoyagerLedger, HARBOR_DEALS } from "./voyagerLedger";

describe("emergentIdentity", () => {
  it("stays unsettled with an empty save", () => {
    const id = deriveEmergentIdentity(createDefaultIslandSave());
    expect(id.id).toBe("unsettled");
    expect(id.confidence).toBeLessThan(0.4);
  });

  it("names Jar Keeper from cove save Take + saver stance", () => {
    let save = createDefaultIslandSave();
    save.irreversibleChoices = {
      cove_save_vs_spend: {
        choiceId: "save",
        label: "Jar before treat",
        islandId: "coincraft_cove",
        at: "",
      },
    };
    save.stance = { saver: 3, spender: 0, risk: 0 };
    save.harborScars = [
      {
        id: "cove_saver_plaque",
        islandId: "coincraft_cove",
        choiceId: "save",
        label: "Jar before treat",
        kind: "plaque",
        createdAt: "",
      },
    ];
    const id = deriveEmergentIdentity(save);
    expect(id.id).toBe("jar_keeper");
    expect(id.lines.plinth).toMatch(/Jar Keeper/);
    expect(identitySoftBeatLine(save, "lookout")).toMatch(/heavy|jar/i);
  });

  it("names Spiral Rusher from credit haste + risk", () => {
    let save = createDefaultIslandSave();
    save.irreversibleChoices = {
      credit_borrow_vs_wait: {
        choiceId: "borrow",
        label: "Haste fed the spiral",
        islandId: "credit_kingdom",
        at: "",
      },
    };
    save.stance = { saver: 0, spender: 0, risk: 4 };
    save.harborScars = [
      {
        id: "credit_haste_plaque",
        islandId: "credit_kingdom",
        choiceId: "borrow",
        label: "Haste fed the spiral",
        kind: "plaza_prop",
        createdAt: "",
      },
    ];
    const id = deriveEmergentIdentity(save);
    expect(id.id).toBe("spiral_rusher");
    expect(identityDealCounsel(save)).toMatch(/spiral|loan/i);
  });

  it("names Booth Builder from multiple assets + Freedom path", () => {
    let save = createDefaultIslandSave();
    const jar = HARBOR_DEALS.find((d) => d.id === "asset_savings_jar")!;
    const shell = HARBOR_DEALS.find((d) => d.id === "asset_shell_booth")!;
    save.voyagerLedger = {
      ...createDefaultVoyagerLedger(),
      holdings: [jar, shell],
      positivePaydayStreak: 2,
    };
    save = recordDealAccepted(save);
    save = recordDealAccepted(save);
    const id = deriveEmergentIdentity(save);
    expect(id.id).toBe("booth_builder");
  });

  it("names Harbor Ghost when scars outpace Piggy bond", () => {
    let save = createDefaultIslandSave();
    save.harborScars = [
      {
        id: "cove_saver_plaque",
        islandId: "coincraft_cove",
        choiceId: "save",
        label: "Jar before treat",
        kind: "plaque",
        createdAt: "",
      },
      {
        id: "pp_protector_plaque",
        islandId: "paycheck_peninsula",
        choiceId: "protect",
        label: "Umbrella before glitter",
        kind: "plaque",
        createdAt: "",
      },
    ];
    save.piggyBondHomecomings = 0;
    save.irreversibleChoices = {
      cove_save_vs_spend: {
        choiceId: "save",
        label: "Jar",
        islandId: "coincraft_cove",
        at: "",
      },
      paycheck_protect_vs_spend: {
        choiceId: "protect",
        label: "Umbrella",
        islandId: "paycheck_peninsula",
        at: "",
      },
    };
    const id = deriveEmergentIdentity(save);
    expect(id.id).toBe("harbor_ghost");
    expect(id.lines.piggy).toMatch(/Ghost|talk/i);
  });

  it("deal pass counters lean toward patience identities", () => {
    let save = createDefaultIslandSave();
    save.stance = { saver: 2, spender: 0, risk: 0 };
    save.irreversibleChoices = {
      cove_save_vs_spend: {
        choiceId: "save",
        label: "Jar",
        islandId: "coincraft_cove",
        at: "",
      },
    };
    save = recordDealPassed(save);
    save = recordDealPassed(save);
    save = recordDealPassed(save);
    const id = deriveEmergentIdentity(save);
    expect(["jar_keeper", "patience_coil", "umbrella_steward"]).toContain(id.id);
  });
});
