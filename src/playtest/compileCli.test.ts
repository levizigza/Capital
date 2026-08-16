import { describe, expect, it } from "vitest";
import { compileCycleFindings } from "./compile";

const isCli = process.env.PLAYTEST_COMPILE === "1";

describe.runIf(isCli)("playtest findings CLI", () => {
  it("writes cycle + latest PLAYTEST_FINDINGS.md", () => {
    const cycleId = process.env.PLAYTEST_CYCLE ?? "cycle-00-baseline";
    const result = compileCycleFindings({
      repoRoot: process.cwd(),
      cycleId,
      title: process.env.PLAYTEST_TITLE ?? `Playtest ${cycleId}`,
      hypothesis:
        process.env.PLAYTEST_HYPOTHESIS ??
        "Recurring first-loop frictions around quiet Harbor, Soft Beat, and post-Change goals.",
    });
    // eslint-disable-next-line no-console
    console.log(result.markdown);
    expect(result.patternCount).toBeGreaterThan(0);
  });
});

describe.runIf(!isCli)("playtest findings CLI (idle)", () => {
  it("skips unless PLAYTEST_COMPILE=1", () => {
    expect(true).toBe(true);
  });
});
