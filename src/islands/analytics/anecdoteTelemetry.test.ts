import { describe, expect, it, vi, beforeEach } from "vitest";
import { analytics } from "../analytics";
import { trackAnecdoteOnSaveChange } from "./anecdoteTelemetry";
import { createDefaultIslandSave } from "../save";
import { PAYCHECK_PENINSULA_ID } from "../islandIds";
import { applySpineTakeLedgerFootprint, PAYCHECK_TAKE_KEY } from "../spineTakeFootprints";

describe("anecdoteTelemetry", () => {
  beforeEach(() => {
    vi.spyOn(analytics, "track").mockResolvedValue(undefined);
  });

  it("fires transfer_window_open when Paycheck transfer stamps", () => {
    const before = createDefaultIslandSave();
    const after = {
      ...before,
      currentIslandId: PAYCHECK_PENINSULA_ID,
      conceptProgress: {
        concepts: {
          save_vs_spend: { transferAttempts: 1, phase: "REDUCED" as const },
        },
      },
    };
    trackAnecdoteOnSaveChange(before, after);
    expect(analytics.track).toHaveBeenCalledWith(
      "anecdote_emerged",
      expect.objectContaining({ anecdote_class: "transfer_window_open" }),
    );
  });

  it("fires systemic_interaction on Paycheck Take commit", () => {
    const before = createDefaultIslandSave();
    const after = applySpineTakeLedgerFootprint(before, PAYCHECK_TAKE_KEY, "protect");
    trackAnecdoteOnSaveChange(before, after);
    expect(analytics.track).toHaveBeenCalledWith(
      "anecdote_emerged",
      expect.objectContaining({
        anecdote_class: "systemic_interaction",
        anecdote_id: "paycheck_take_protect",
      }),
    );
  });
});
