import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertNoStrategySpoiler,
  discoveriesByTier,
  failHypothesisFor,
  knowledgeFailHint,
  KNOWLEDGE_DISCOVERIES,
} from "../knowledgeProgression";
import { minigameFailCopy } from "../minigameFail";
import { shouldOpenKnowledgeLiteracyPrototype } from "./KnowledgeLiteracyPrototype";

describe("Knowledge progression — literacy as the meter", () => {
  const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
  const proto = readFileSync(join(__dirname, "KnowledgeLiteracyPrototype.tsx"), "utf8");
  const doc = readFileSync(join(__dirname, "../../../GAME_DESIGN_KNOWLEDGE.md"), "utf8");
  const catalog = readFileSync(join(__dirname, "../knowledgeProgression.ts"), "utf8");

  it("documents all six discovery tiers", () => {
    expect(doc).toMatch(/BASIC RULES/);
    expect(doc).toMatch(/INTERMEDIATE PATTERNS/);
    expect(doc).toMatch(/ADVANCED STRATEGIES/);
    expect(doc).toMatch(/SYSTEM INTERACTIONS/);
    expect(doc).toMatch(/EDGE CASES/);
    expect(doc).toMatch(/META STRATEGIES/);
    expect(doc).toMatch(/FAIL/);
    expect(doc).toMatch(/Do \*\*not\*\* use XP/);
    expect(doc).toMatch(/\?knowledge=1/);
  });

  it("catalogs discoveries across every tier", () => {
    expect(discoveriesByTier("basic").length).toBeGreaterThanOrEqual(5);
    expect(discoveriesByTier("intermediate").length).toBeGreaterThanOrEqual(5);
    expect(discoveriesByTier("advanced").length).toBeGreaterThanOrEqual(4);
    expect(discoveriesByTier("system").length).toBeGreaterThanOrEqual(4);
    expect(discoveriesByTier("edge").length).toBeGreaterThanOrEqual(4);
    expect(discoveriesByTier("meta").length).toBeGreaterThanOrEqual(4);
    expect(KNOWLEDGE_DISCOVERIES.length).toBeGreaterThanOrEqual(30);
  });

  it("fail hypotheses give observation + question without spoilers", () => {
    for (const organ of ["coin", "clock", "spiral", "memory"] as const) {
      const h = failHypothesisFor({ organId: organ });
      expect(h.observation.length).toBeGreaterThan(10);
      expect(h.question).toMatch(/\?$/);
      expect(assertNoStrategySpoiler(h.observation)).toBe(true);
      expect(assertNoStrategySpoiler(h.question)).toBe(true);
    }
    const soft = failHypothesisFor({ source: "soft_beat" });
    expect(soft.question.toLowerCase()).not.toMatch(/always|optimal|correct answer/);
    expect(assertNoStrategySpoiler("Always choose jar before treat")).toBe(false);
  });

  it("minigame fail hints teach via hypothesis, not strategy spoilers", () => {
    const copy = minigameFailCopy({
      reason: "score_below_threshold",
      minigameName: "Coin Spring",
      score: 10,
      scoreThreshold: 40,
      source: "structure",
      organId: "coin",
    });
    expect(copy.hint).toMatch(/10/);
    expect(copy.hint).toMatch(/40/);
    expect(copy.hint).toMatch(/\?/);
    expect(assertNoStrategySpoiler(copy.hint)).toBe(true);
    expect(copy.walkLabel).toMatch(/structure/i);

    const plain = knowledgeFailHint({ organId: "spiral" });
    expect(plain).toMatch(/coil|weigh/i);
    expect(plain).toMatch(/\?/);
  });

  it("wires ?knowledge=1 prototype before boot stack", () => {
    expect(app).toMatch(/shouldOpenKnowledgeLiteracyPrototype/);
    expect(app).toMatch(/KnowledgeLiteracyPrototype/);
    expect(app).toMatch(/showKnowledge/);
    expect(app).toMatch(/searchParams\.delete\(['"]knowledge['"]\)/);
    expect(proto).toMatch(/FAIL → UNDERSTAND → ADAPT → RETRY/);
    expect(proto).toMatch(/knowledge-fail-card/);
    expect(proto).toMatch(/knowledge-retell-shelf/);
    expect(proto).not.toMatch(/gainXp|MasteryQuiz|totalCoins\s*\+/);
    expect(proto).toMatch(/no XP/);
    expect(typeof shouldOpenKnowledgeLiteracyPrototype).toBe("function");
    expect(shouldOpenKnowledgeLiteracyPrototype()).toBe(false);
  });

  it("keeps Freedom Seal / quizzes out of the literacy catalog as mastery", () => {
    expect(catalog).toMatch(/freedom_is_economy/);
    expect(catalog).toMatch(/not organ mastery/);
    expect(doc).toMatch(/freedom_is_economy/);
  });
});
