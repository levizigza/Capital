import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ASHORE_FTUE_STEP_IDS,
  ASHORE_SPINE_PAINTING_PLACES,
  ASHORE_TEACH_STEP_COUNT,
} from "./AshoreComprehensionTutorial";
import {
  analyzeFtueFunnel,
  FTUE_STEP_COUNT,
  shouldSkipAshoreTeach,
} from "../ftueTelemetry";
import type { AnalyticsEvent } from "../types";

describe("Ashore FTUE-7 interactive teach", () => {
  const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
  const teach = readFileSync(
    join(__dirname, "AshoreComprehensionTutorial.tsx"),
    "utf8",
  );
  const pad = readFileSync(
    join(__dirname, "../world3d/VoyagerWalkPracticeStage.tsx"),
    "utf8",
  );
  const show = readFileSync(join(__dirname, "AshoreTeachShowcases.tsx"), "utf8");
  const ftueDoc = readFileSync(
    join(__dirname, "../../../docs/ftue-interactive-teach.md"),
    "utf8",
  );

  it("boots title → cast → teach → carpet (experienced checkbox can skip teach)", () => {
    expect(app).toMatch(/bootPhase.*"teach"/);
    expect(app).toMatch(/AshoreComprehensionTutorial/);
    expect(app).toMatch(/character=\{bootCharacter/);
    expect(app).toMatch(/opts\?\.experiencedPlayer/);
    expect(app).toMatch(/setBootPhase\(skipTeach \? "carpet" : "teach"\)/);
    expect(app).toMatch(/setBootPhase\("carpet"\)/);
  });

  it("teaches seven prove-it beats — one concept each", () => {
    expect(ASHORE_TEACH_STEP_COUNT).toBe(7);
    expect(FTUE_STEP_COUNT).toBe(7);
    expect(ASHORE_FTUE_STEP_IDS).toEqual([
      "goal",
      "walk",
      "economy",
      "decision",
      "consequence",
      "reward",
      "deeper",
    ]);
    expect(teach).toMatch(/data-teach-mode="ftue-7"/);
    expect(teach).not.toMatch(/"paycheck"/);
    expect(teach).not.toMatch(/"credit"/);
    expect(teach).not.toMatch(/PaintingLessonShowcase/);
    expect(teach).not.toMatch(/ShareCardShowcase/);
    expect(teach).not.toMatch(/MURAL_THESIS/);
  });

  it("requires performing actions — not continue-only dumps", () => {
    expect(teach).toMatch(/GoalPlinthClaim/);
    expect(teach).toMatch(/VoyagerWalkPracticeStage/);
    expect(teach).toMatch(/FantasyOrganToys/);
    expect(teach).toMatch(/DecisionForkShowcase/);
    expect(teach).toMatch(/ConsequenceHushShowcase/);
    expect(teach).toMatch(/RewardPlinthShowcase/);
    expect(teach).toMatch(/DeeperStrategyShowcase/);
    expect(pad).toMatch(/onClaimMarker/);
    expect(show).toMatch(/ashore-goal-plinth/);
    expect(show).toMatch(/ashore-decision-fork/);
    expect(show).toMatch(/ashore-consequence-hush/);
    expect(show).toMatch(/ashore-reward-plinth/);
    expect(show).toMatch(/ashore-deeper-soft-beat/);
  });

  it("keeps Leave · Esc skip for experienced players", () => {
    expect(teach).toMatch(/Leave · Esc/);
    expect(teach).toMatch(/finish\("leave"\)/);
    expect(typeof shouldSkipAshoreTeach).toBe("function");
    expect(ftueDoc).toMatch(/skipTeach/);
  });

  it("instruments FTUE steps for funnel metrics", () => {
    expect(teach).toMatch(/FtueSessionTracker/);
    expect(teach).toMatch(/startSession|startStep|completeStep|abandon/);
    const hub = readFileSync(join(__dirname, "HomeHubView.tsx"), "utf8");
    expect(hub).toMatch(/trackCoreLoopFirstSuccess/);

    const events: AnalyticsEvent[] = [
      {
        id: "1",
        ts: "2026-01-01T00:00:00.000Z",
        name: "ftue_started",
        payload: {},
      },
      {
        id: "2",
        ts: "2026-01-01T00:00:01.000Z",
        name: "ftue_step_started",
        payload: { stepId: "goal" },
      },
      {
        id: "3",
        ts: "2026-01-01T00:00:05.000Z",
        name: "ftue_step_completed",
        payload: { stepId: "goal", durationMs: 4000, retries: 0 },
      },
      {
        id: "4",
        ts: "2026-01-01T00:01:00.000Z",
        name: "ftue_completed",
        payload: {},
      },
      {
        id: "5",
        ts: "2026-01-01T00:10:00.000Z",
        name: "core_loop_first_success",
        payload: {},
      },
    ];
    const analysis = analyzeFtueFunnel(events);
    expect(analysis.started).toBe(1);
    expect(analysis.completed).toBe(1);
    expect(analysis.completionRate).toBe(100);
    expect(analysis.coreLoopFirstSuccess).toBe(1);
    expect(analysis.steps.find((s) => s.stepId === "goal")?.avgDurationMs).toBe(4000);
  });

  it("names Harbor then Cove as first voyage without triangle glossary", () => {
    expect(ASHORE_SPINE_PAINTING_PLACES).toEqual([
      "Harbor Haven",
      "Coincraft Cove",
      "Paycheck Peninsula",
      "Credit Kingdom",
    ]);
    expect(teach).toMatch(/ashore-teach-route/);
    expect(teach).toMatch(/Coincraft Cove/);
    expect(show).toMatch(/ashore-carpet-board-cove/);
  });

  it("keeps opening music bed and organ stingers", () => {
    expect(teach).toMatch(/playPlace\(\{\s*kind:\s*"opening"/);
    expect(teach).toMatch(/playOrganSfx|playCapitalSfx/);
  });
});
