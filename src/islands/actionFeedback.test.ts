import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACTION_FEEDBACK,
  TOP_FREQUENT_ACTIONS,
  playActionFeedback,
  resetActionFeedbackThrottle,
  actionFeedbackIds,
} from "./actionFeedback";
import { triggerJuice } from "@/juice";
import { juiceSfx } from "@/juice/juiceSfx";
import { persistJuiceSettings } from "@/juice/settings";
import * as capitalSfx from "./audio/capitalSfx";

describe("actionFeedback architecture", () => {
  beforeEach(() => {
    resetActionFeedbackThrottle();
    persistJuiceSettings({ version: 1, level: "high" });
    vi.stubGlobal("window", {
      ...globalThis,
      innerWidth: 800,
      innerHeight: 600,
      matchMedia: () => ({ matches: false }),
      setTimeout: globalThis.setTimeout.bind(globalThis),
      AudioContext: undefined,
    });
    vi.stubGlobal("document", {
      querySelector: () => null,
      body: { appendChild: () => undefined },
      createElement: () => ({
        className: "",
        style: { setProperty: () => undefined, left: "", top: "" },
        textContent: "",
        setAttribute: () => undefined,
        remove: () => undefined,
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("catalog covers the top 10 frequent actions", () => {
    expect(TOP_FREQUENT_ACTIONS).toHaveLength(10);
    for (const id of TOP_FREQUENT_ACTIONS) {
      expect(ACTION_FEEDBACK[id]).toBeTruthy();
      expect(ACTION_FEEDBACK[id].chain.length).toBeGreaterThan(8);
      expect(["micro", "confirm", "economy", "progress", "signature"]).toContain(
        ACTION_FEEDBACK[id].importance,
      );
    }
    expect(actionFeedbackIds().length).toBeGreaterThanOrEqual(10);
  });

  it("never enables shake on frequent economy / confirm specs", () => {
    for (const id of TOP_FREQUENT_ACTIONS) {
      const spec = ACTION_FEEDBACK[id];
      // Catalog must not invite fail-shake for success paths
      expect(spec.juice).not.toBe("fail");
    }
  });

  it("mutes juice SFX when Capital SFX owns the ear (carpet land)", () => {
    const accept = vi.spyOn(juiceSfx, "playAccept");
    const complete = vi.spyOn(juiceSfx, "playComplete");
    const capital = vi.spyOn(capitalSfx, "playCapitalSfx");
    playActionFeedback("carpet_land");
    expect(capital).toHaveBeenCalledWith("harbor_cheer");
    expect(complete).not.toHaveBeenCalled(); // muted via layers.sfx=false
    // motion still allowed — complete was called through triggerJuice but sfx off
    // Actually triggerJuice is still called; playComplete gated by layers.sfx
    expect(accept).not.toHaveBeenCalled();
  });

  it("fires accept juice for talk_choice without Capital SFX", () => {
    const accept = vi.spyOn(juiceSfx, "playAccept");
    const capital = vi.spyOn(capitalSfx, "playCapitalSfx");
    playActionFeedback("talk_choice");
    expect(accept).toHaveBeenCalled();
    expect(capital).not.toHaveBeenCalled();
  });

  it("throttles near_enter micro feedback", () => {
    const accept = vi.spyOn(juiceSfx, "playAccept");
    expect(playActionFeedback("near_enter", { throttleKey: "near:arcade" })).toBe(true);
    expect(playActionFeedback("near_enter", { throttleKey: "near:arcade" })).toBe(false);
    expect(accept).toHaveBeenCalledTimes(1);
  });

  it("carpet_rail does not use scar_chime", () => {
    const capital = vi.spyOn(capitalSfx, "playCapitalSfx");
    playActionFeedback("carpet_rail");
    expect(capital).not.toHaveBeenCalled();
    expect(ACTION_FEEDBACK.carpet_rail.capitalSfx).toBeUndefined();
  });

  it("layer flag sfx:false skips juice beep", () => {
    const accept = vi.spyOn(juiceSfx, "playAccept");
    triggerJuice("accept", { layers: { sfx: false } });
    expect(accept).not.toHaveBeenCalled();
  });
});
