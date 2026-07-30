import { describe, expect, it } from "vitest";
import { scarTriggersChapterQuiet } from "./worldMemory";

describe("priority iconic fixes — organ quiet parity", () => {
  it("quiet-triggers all three spine Takes", () => {
    expect(scarTriggersChapterQuiet("cove_saver_plaque")).toBe(true);
    expect(scarTriggersChapterQuiet("pp_protector_plaque")).toBe(true);
    expect(scarTriggersChapterQuiet("pp_spender_plaque")).toBe(true);
    expect(scarTriggersChapterQuiet("credit_patience_plaque")).toBe(true);
    expect(scarTriggersChapterQuiet("credit_haste_plaque")).toBe(true);
  });
});
