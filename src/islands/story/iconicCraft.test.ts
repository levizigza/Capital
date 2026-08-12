import { describe, expect, it } from "vitest";
import {
  createDefaultHubGuidedIntro,
  advanceHubGuided,
} from "./hubGuidedIntro";
import {
  resolveHarborVisualBeats,
  SCAR_SPECTACLE_VISUAL_BEATS,
  PLINTH_GLOW_VISUAL_BEATS,
  HOMECOMING_VISUAL_BEATS,
  postHomecomingVisualBeats,
} from "./dialogueActionSync";
import { coinBagHarborTip } from "./coinBagBuddy";
import { piggyHomecomingGraph } from "./harborTalks";
import { pickDailyRumor, localDayKey } from "../harborRitual";
import { scarTriggersChapterQuiet, scarEchoAmbientLine } from "../worldMemory";
import { loadIslandsContent } from "../content/loader";
import type { IslandSaveV1 } from "../types";
import {
  MEMORY_PLINTH_ICON,
  MEMORY_PLINTH_SILHOUETTE_PARTS,
  harborMemoryPlinthHotspot,
} from "../harborIcon";

describe("iconic craft — first 20 min path", () => {
  it("Harbor Ashore critical path: Talk → voyage → done (no Outfitter gate)", () => {
    let g = createDefaultHubGuidedIntro();
    g = advanceHubGuided(g, "talked_guide");
    expect(g.step).toBe("to_dock");
    g = advanceHubGuided(g, "opened_map");
    expect(g.step).toBe("done");
    expect(g.didDock).toBe(true);
  });

  it("legacy Capsule gate still resolves to voyage", () => {
    let g = { version: 1 as const, step: "tiny_spend" as const };
    g = advanceHubGuided(g, "capsule_visit");
    expect(g.step).toBe("to_dock");
  });
});

describe("iconic craft — scar spectacle beats", () => {
  it("elevates Harbor visuals when spectacle is active", () => {
    const beats = resolveHarborVisualBeats({ scarSpectacleActive: true });
    expect(beats).toEqual(SCAR_SPECTACLE_VISUAL_BEATS);
    expect(beats.keeperEmote).toBe("cheer");
    expect(beats.pulseHotspot).toBe("memory");
  });

  it("keeps Memory Plinth pulsing in afterglow", () => {
    const beats = resolveHarborVisualBeats({ plinthGlowActive: true });
    expect(beats).toEqual(PLINTH_GLOW_VISUAL_BEATS);
    expect(beats.pulseHotspot).toBe("memory");
  });
});

describe("iconic craft — Piggy / Coin Bag bond", () => {
  it("strains when scars outpace homecomings", () => {
    const tip = coinBagHarborTip(null, { bondStrain: true });
    expect(tip.tip.toLowerCase()).toMatch(/quiet|care/);
    expect(tip.coach.toLowerCase()).toMatch(/repair|plaque/);
  });

  it("homecoming is Piggy presence, not a tutorial checklist tip", () => {
    const beats = resolveHarborVisualBeats({ homecomingPending: true });
    expect(beats).toEqual(HOMECOMING_VISUAL_BEATS);
    expect(beats.pulseHotspot).toBe("guide");
    expect(beats.bagTip.toLowerCase()).toMatch(/waiting|fountain|piggy/);
    expect(beats.bagTip.toLowerCase()).not.toMatch(/talk to piggy —/);
    const tip = coinBagHarborTip(null, {
      homecomingPending: true,
      homecomingMessage: "You earned coins and made a real choice.",
    });
    expect(tip.tip.toLowerCase()).toMatch(/waiting|fountain/);
    expect(tip.coach).toMatch(/You earned coins|changed/i);
  });

  it("points at Plinth memory when a scar exists", () => {
    const tip = coinBagHarborTip(null, {
      latestScarLabel: "Jar before treat",
      plinthGlow: true,
    });
    expect(tip.tip).toMatch(/Plinth|Jar before treat/);
    expect(tip.coach.toLowerCase()).toMatch(/harbor felt|share|plinth/);
  });

  it("deepens homecoming dialogue by bondBeat", () => {
    const first = piggyHomecomingGraph("You earned coins.", { bondBeat: 1, scars: [] });
    const third = piggyHomecomingGraph("You earned coins.", {
      bondBeat: 3,
      scars: [{ label: "Cove scar", islandId: "coincraft_cove" }],
    });
    const strain = piggyHomecomingGraph("Hard flight home.", {
      bondBeat: 0,
      scars: [
        { label: "A", islandId: "coincraft_cove" },
        { label: "B", islandId: "paycheck_peninsula" },
      ],
    });
    expect(first.nodes.some((n) => /Change beat|patched|proud|Memory keeps/i.test(n.text))).toBe(
      true,
    );
    expect(third.nodes.some((n) => /Three homecomings|family|trust/i.test(n.text))).toBe(true);
    expect(strain.nodes.some((n) => /worried|harder mark/i.test(n.text))).toBe(true);
  });

  it("names Clock / Spiral bonds — never Cove earn-fair on every homecoming", () => {
    const clock = piggyHomecomingGraph("Piggy Penny: The Clock shelters.", {
      scars: [
        {
          id: "pp_protector_plaque",
          islandId: "paycheck_peninsula",
          label: "Umbrella before glitter",
        },
      ],
    });
    const spiral = piggyHomecomingGraph("Piggy Penny: The Spiral withstands.", {
      scars: [
        {
          id: "credit_patience_plaque",
          islandId: "credit_kingdom",
          label: "Waited the spiral",
        },
      ],
    });
    expect(clock.nodes.some((n) => /Clock shelters beat/i.test(n.text))).toBe(true);
    expect(clock.nodes.some((n) => /earn fair, then choose/i.test(n.text))).toBe(false);
    expect(spiral.nodes.some((n) => /Spiral withstands beat/i.test(n.text))).toBe(true);
    expect(spiral.nodes.some((n) => /earn fair, then choose/i.test(n.text))).toBe(false);
  });

  it("post-homecoming points organ-aware next painting — no era-shore pitch", () => {
    const pay = postHomecomingVisualBeats("Paycheck Peninsula");
    const credit = resolveHarborVisualBeats({
      pointNextPainting: true,
      nextPaintingName: "Credit Kingdom",
    });
    expect(pay.bagTip).toMatch(/Carpet → Paycheck/);
    expect(pay.bagTip).not.toMatch(/side shores/i);
    expect(pay.keeperBubbleWhenNear).not.toMatch(/era shores/i);
    expect(credit.bagTip).toMatch(/Carpet → Credit/);
    expect(credit.keeperBubbleWhenNear).toMatch(/Credit is next/);
  });
});

describe("iconic signature — Cove quiet + day-2 echo", () => {
  it("hushes Cove Takes like later chapters", () => {
    expect(scarTriggersChapterQuiet("cove_saver_plaque")).toBe(true);
  });

  it("names plaques in ambient echo lines", () => {
    const line = scarEchoAmbientLine("Spendy Sue", "Saver plaque", "later");
    expect(line).toMatch(/Saver plaque/);
    expect(line).toMatch(/footprints|Plinth/i);
  });

  it("Cove Take plaques use signature retell labels", () => {
    const content = loadIslandsContent();
    const cove = content.islands.find((i) => i.id === "coincraft_cove");
    const dlg = cove?.dialogues?.find((d) => d.id === "dlg_keeper_kira");
    const take = dlg?.nodes.find((n) => n.id === "kk1");
    const labels = (take?.choices ?? [])
      .flatMap((c) => c.effects ?? [])
      .filter((e) => e.type === "addScar")
      .map((e) => (e.type === "addScar" ? e.label : ""));
    expect(labels).toContain("Jar before treat");
    expect(labels).toContain("Treat before jar");
    expect(take?.text).toMatch(/Take/i);
  });

  it("uses day-after echo rumor when scar is from a prior day", () => {
    const save = {
      version: "1",
      updatedAt: new Date().toISOString(),
      inventory: [],
      questStatus: {},
      completedMinigames: [],
      discovered: { npcs: [], items: [], areas: [], islands: [] },
      harborScars: [
        {
          id: "cove_saver_plaque",
          islandId: "coincraft_cove",
          choiceId: "save",
          label: "Jar before treat",
          kind: "plaque" as const,
          createdAt: "2026-07-20T12:00:00.000Z",
        },
      ],
    } satisfies IslandSaveV1;
    const rumor = pickDailyRumor(save, localDayKey(new Date(2026, 6, 28)));
    expect(rumor.id).toMatch(/^scar_echo_/);
    expect(rumor.text).toMatch(/Day-after echo|did not forget|Jar before treat/i);
    expect(rumor.text).toMatch(/Coin/);
  });

  it("Paycheck and Credit plaques use short organ-retell labels", () => {
    const content = loadIslandsContent();
    const pay = content.islands.find((i) => i.id === "paycheck_peninsula");
    const credit = content.islands.find((i) => i.id === "credit_kingdom");
    const payLabels = (pay?.dialogues ?? [])
      .flatMap((d) => d.nodes)
      .flatMap((n) => n.choices ?? [])
      .flatMap((c) => c.effects ?? [])
      .filter((e) => e.type === "addScar")
      .map((e) => (e.type === "addScar" ? e.label : ""));
    const creditLabels = (credit?.dialogues ?? [])
      .flatMap((d) => d.nodes)
      .flatMap((n) => n.choices ?? [])
      .flatMap((c) => c.effects ?? [])
      .filter((e) => e.type === "addScar")
      .map((e) => (e.type === "addScar" ? e.label : ""));
    expect(payLabels).toContain("Umbrella before glitter");
    expect(payLabels).toContain("Glitter ate the umbrella");
    expect(creditLabels).toContain("Waited the spiral");
    expect(creditLabels).toContain("Haste fed the spiral");
  });

  it("ships one Harbor icon — Memory Plinth ledger silhouette always placeable", () => {
    const hotspot = harborMemoryPlinthHotspot({ scarCount: 0 });
    expect(hotspot.kind).toBe("plinth");
    expect(hotspot.icon).toBe(MEMORY_PLINTH_ICON);
    expect(MEMORY_PLINTH_SILHOUETTE_PARTS.join(" ")).toMatch(/ledger/);
    expect(PLINTH_GLOW_VISUAL_BEATS.pulseHotspot).toBe("memory");
  });
});
