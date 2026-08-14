import { describe, expect, it } from "vitest";
import { join } from "node:path";
import {
  clustersToPatterns,
  findRecurringMomentClusters,
  synthesizeCycle,
} from "./synthesize";
import { renderPlaytestFindingsMarkdown } from "./renderFindings";
import { compileCycleFindings, loadSessionsFromDir } from "./compile";
import type { PlaytestSession } from "./types";

const sample = (id: string, overrides: Partial<PlaytestSession> = {}): PlaytestSession => ({
  id,
  cycleId: "cycle-test",
  date: "2026-08-14",
  facilitator: "t",
  playerLabel: id,
  playerProfile: "test",
  device: "desktop",
  reducedMotion: false,
  source: "desk_synthesis",
  startCondition: "fresh",
  goalPrompt: "test",
  moments: [
    {
      id: `${id}-m1`,
      momentCode: "soft_beat",
      attempted: "Walked past Soft Beat pad",
      believedWouldHappen: "Optional decoration",
      actuallyHappened: "Never climbed",
      reactions: ["ignored_intent"],
    },
    {
      id: `${id}-m2`,
      momentCode: "scar_spectacle",
      attempted: "Watched Plinth",
      believedWouldHappen: "Modal quest complete",
      actuallyHappened: "Plinth cinema",
      reactions: ["smile"],
    },
  ],
  sixQuestions: {},
  ...overrides,
});

describe("playtest synthesis", () => {
  it("requires recurrence across sessions before patterning", () => {
    const one = [sample("s1")];
    expect(findRecurringMomentClusters(one, 2)).toHaveLength(0);
    const two = [sample("s1"), sample("s2")];
    const clusters = findRecurringMomentClusters(two, 2);
    expect(clusters.some((c) => c.key.startsWith("soft_beat::"))).toBe(true);
  });

  it("keeps OBSERVATION / INTERPRETATION / PROPOSED FIX in rendered findings", () => {
    const sessions = [sample("s1"), sample("s2"), sample("s3")];
    const cycle = synthesizeCycle({
      id: "cycle-test",
      title: "Test cycle",
      startedAt: "2026-08-14",
      hypothesis: "Soft Beat is ignored when it reads as decoration.",
      sessions,
    });
    const md = renderPlaytestFindingsMarkdown(cycle, sessions);
    expect(md).toMatch(/#### OBSERVATION/);
    expect(md).toMatch(/#### INTERPRETATION/);
    expect(md).toMatch(/#### PROPOSED FIX/);
    expect(md).toMatch(/Do \*\*not\*\* fix every individual complaint/);
    expect(cycle.patterns.length).toBeGreaterThan(0);
    expect(clustersToPatterns(sessions)[0]?.proposedFix).toMatch(/not each quote/i);
  });

  it("loads cycle-00 baseline sessions from docs", () => {
    const dir = join(process.cwd(), "docs/playtest/sessions");
    const sessions = loadSessionsFromDir(dir, "cycle-00-baseline");
    expect(sessions.length).toBeGreaterThanOrEqual(3);
    const result = compileCycleFindings({
      repoRoot: process.cwd(),
      cycleId: "cycle-00-baseline",
      title: "Cycle 00 — framework baseline (desk synthesis)",
      hypothesis:
        "Quiet Harbor + Soft Beat discovery + post-Change goal clarity are the main first-loop frictions.",
    });
    expect(result.patternCount).toBeGreaterThan(0);
    expect(result.markdown).toMatch(/PLAYTEST_FINDINGS/);
    expect(result.markdown).toMatch(/soft_beat/);
  });
});
