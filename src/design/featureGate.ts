/**
 * Capital feature gate — score before you ship.
 * @see docs/FEATURE_GATE.md
 */

export const VALUE_AXES = [
  "strengthensCoreFantasy",
  "strengthensCoreLoop",
  "createsMeaningfulDecisions",
  "interactsWithExistingSystems",
  "createsEmergentPossibilities",
  "improvesMastery",
  "improvesPlayerExpression",
  "improvesReplayability",
  "improvesSocialPossibility",
  "createsMemorableStories",
] as const;

export const COST_AXES = [
  "cognitiveComplexity",
  "uiComplexity",
  "technicalComplexity",
  "balanceRisk",
  "maintenanceBurden",
  "contentBurden",
] as const;

export type ValueAxis = (typeof VALUE_AXES)[number];
export type CostAxis = (typeof COST_AXES)[number];

/** Integer 0–5 inclusive */
export type GateScore = 0 | 1 | 2 | 3 | 4 | 5;

export type ValueScores = Record<ValueAxis, GateScore>;
export type CostScores = Record<CostAxis, GateScore>;

export type FeatureGateInput = {
  /** Short feature name */
  name: string;
  /** One-sentence pitch in Capital terms (Voyager / living money / Harbor loop) */
  pitch: string;
  /** Why now — must NOT be “other games have this” as the main reason */
  justification: string;
  /** Existing systems this deepens (Soft Beat, ledger, Plinth, Family Room, …) */
  systemsTouched: string[];
  value: ValueScores;
  cost: CostScores;
  /** Hard freeze violations? */
  widensMainQuestBeyondTriangle?: boolean;
  fakeMultiplayerBackend?: boolean;
  foreignIpMerge?: boolean;
};

export type GateVerdict = "accept" | "accept_with_conditions" | "park" | "reject";

export type FeatureGateResult = {
  name: string;
  valueScore: number;
  costScore: number;
  /** valueScore − costScore (normalized: value/10*30 style avoided — raw sums) */
  netScore: number;
  /** valueScore / max(costScore, 1) */
  valueCostRatio: number;
  systemsTouchedCount: number;
  multiSystemBonus: boolean;
  copycatJustification: boolean;
  freezeViolation: boolean;
  verdict: GateVerdict;
  reasons: string[];
  conditions: string[];
};

export const VALUE_AXIS_LABELS: Record<ValueAxis, string> = {
  strengthensCoreFantasy: "Strengthens core fantasy",
  strengthensCoreLoop: "Strengthens core loop",
  createsMeaningfulDecisions: "Creates meaningful decisions",
  interactsWithExistingSystems: "Interacts with existing systems",
  createsEmergentPossibilities: "Creates emergent possibilities",
  improvesMastery: "Improves mastery",
  improvesPlayerExpression: "Improves player expression",
  improvesReplayability: "Improves replayability",
  improvesSocialPossibility: "Improves social possibility",
  createsMemorableStories: "Creates memorable stories",
};

export const COST_AXIS_LABELS: Record<CostAxis, string> = {
  cognitiveComplexity: "Cognitive complexity",
  uiComplexity: "UI complexity",
  technicalComplexity: "Technical complexity",
  balanceRisk: "Balance risk",
  maintenanceBurden: "Maintenance burden",
  contentBurden: "Content burden",
};

const COPYCAT_PATTERNS = [
  /\bother games?\b/i,
  /\bevery(?:one|body) (?:has|does|expects)\b/i,
  /\bindustry standard\b/i,
  /\bcompetitors? (?:have|offer|ship)\b/i,
  /\blike (?:roblox|fortnite|genshin|monopoly|cashflow|stardew|animal crossing)\b/i,
  /\btable stakes\b/i,
  /\bmust[- ]have (?:because|since) (?:others|competitors)\b/i,
];

export function isCopycatJustification(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  // Main justification is copycat if it matches and doesn't also name Capital systems.
  const hitsCopycat = COPYCAT_PATTERNS.some((re) => re.test(t));
  if (!hitsCopycat) return false;
  const namesCapital =
    /\b(harbor|cove|paycheck|credit|plinth|soft beat|piggy|voyager|ledger|organ|family room)\b/i.test(
      t,
    );
  // Still copycat if the Capital words are only garnish on “other games have X”
  if (/^[^.]*(other games?|everyone (?:has|does)|industry standard)/i.test(t) && !namesCapital) {
    return true;
  }
  return hitsCopycat && !namesCapital;
}

function clampScore(n: number): GateScore {
  const x = Math.round(n);
  if (x <= 0) return 0;
  if (x >= 5) return 5;
  return x as GateScore;
}

export function sumScores(scores: Record<string, number>): number {
  return Object.values(scores).reduce((a, b) => a + b, 0);
}

/**
 * Multi-system preference: touching ≥3 named existing systems is a positive signal.
 * Does not auto-accept — still must clear value/cost and anti-copycat rules.
 */
export function hasMultiSystemBonus(systemsTouched: string[]): boolean {
  const cleaned = systemsTouched.map((s) => s.trim()).filter(Boolean);
  return new Set(cleaned.map((s) => s.toLowerCase())).size >= 3;
}

export function evaluateFeatureGate(input: FeatureGateInput): FeatureGateResult {
  const valueScore = sumScores(input.value);
  const costScore = sumScores(input.cost);
  const netScore = valueScore - costScore;
  const valueCostRatio = valueScore / Math.max(costScore, 1);
  const systemsTouchedCount = input.systemsTouched.filter((s) => s.trim()).length;
  const multiSystemBonus = hasMultiSystemBonus(input.systemsTouched);
  const copycatJustification = isCopycatJustification(input.justification);
  const freezeViolation = Boolean(
    input.widensMainQuestBeyondTriangle ||
      input.fakeMultiplayerBackend ||
      input.foreignIpMerge,
  );

  const reasons: string[] = [];
  const conditions: string[] = [];
  let verdict: GateVerdict = "accept";

  if (freezeViolation) {
    verdict = "reject";
    if (input.widensMainQuestBeyondTriangle) {
      reasons.push("Freeze: widens main quest beyond Cove → Paycheck → Credit.");
    }
    if (input.fakeMultiplayerBackend) {
      reasons.push("Freeze: fake multiplayer backend — Family Room stays local.");
    }
    if (input.foreignIpMerge) {
      reasons.push("Freeze: foreign IP merge (Nathan / BMO / CBE) is disallowed.");
    }
  }

  if (copycatJustification) {
    verdict = "reject";
    reasons.push(
      'Reject: main justification reads as “other games have this.” Pitch it in Capital fantasy/loop terms instead.',
    );
  }

  // Value must clear cost on raw sums (value max 50, cost max 30).
  if (verdict !== "reject" && valueScore < costScore) {
    verdict = "reject";
    reasons.push(
      `Reject: VALUE SCORE (${valueScore}) is below COST SCORE (${costScore}). Prefer deepening several existing systems.`,
    );
  }

  // Thin value even if above cost — park rather than ship.
  if (verdict !== "reject" && valueScore < 20) {
    verdict = "park";
    reasons.push(
      `Park: VALUE SCORE ${valueScore}/50 is thin — unlikely to move fantasy or loop. Deepen Soft Beat / Plinth / Take first.`,
    );
  }

  // High cost with mediocre net — conditions or park
  if (verdict === "accept" && costScore >= 18 && netScore < 12) {
    verdict = "accept_with_conditions";
    conditions.push("Spike a thin vertical slice before full implementation.");
    conditions.push("Name which existing system absorbs the UI — no new hero chrome.");
  }

  if (verdict === "accept" && !multiSystemBonus && input.value.interactsWithExistingSystems <= 2) {
    verdict = "accept_with_conditions";
    conditions.push(
      "Prefer a design that improves ≥3 existing systems (e.g. ledger × Soft Beat × Plinth).",
    );
  }

  if (verdict === "accept" && multiSystemBonus) {
    reasons.push(
      `Prefer: touches ${systemsTouchedCount} systems — multi-system deepening beats isolated features.`,
    );
  }

  if (verdict === "accept" && netScore >= 15 && valueCostRatio >= 1.5) {
    reasons.push(
      `Clear: VALUE ${valueScore} vs COST ${costScore} (net ${netScore}, ratio ${valueCostRatio.toFixed(2)}).`,
    );
  }

  if (verdict === "accept_with_conditions" && reasons.length === 0) {
    reasons.push(
      `Conditional: VALUE ${valueScore} vs COST ${costScore} — ship only with listed conditions.`,
    );
  }

  return {
    name: input.name,
    valueScore,
    costScore,
    netScore,
    valueCostRatio,
    systemsTouchedCount,
    multiSystemBonus,
    copycatJustification,
    freezeViolation,
    verdict,
    reasons,
    conditions,
  };
}

export function renderFeatureGateMarkdown(
  input: FeatureGateInput,
  result: FeatureGateResult,
): string {
  const lines: string[] = [];
  lines.push(`# Feature gate — ${input.name}`);
  lines.push("");
  lines.push(`**Pitch:** ${input.pitch}`);
  lines.push("");
  lines.push(`**Justification:** ${input.justification}`);
  lines.push("");
  lines.push(`**Systems touched:** ${input.systemsTouched.join(" · ") || "—"}`);
  lines.push("");
  lines.push(`## Value (0–5 each) → VALUE SCORE **${result.valueScore}/50**`);
  lines.push("");
  for (const axis of VALUE_AXES) {
    lines.push(`- ${VALUE_AXIS_LABELS[axis]}: **${input.value[axis]}**`);
  }
  lines.push("");
  lines.push(`## Costs (0–5 each) → COST SCORE **${result.costScore}/30**`);
  lines.push("");
  for (const axis of COST_AXES) {
    lines.push(`- ${COST_AXIS_LABELS[axis]}: **${input.cost[axis]}**`);
  }
  lines.push("");
  lines.push(`## Verdict`);
  lines.push("");
  lines.push(`- **VALUE SCORE:** ${result.valueScore}`);
  lines.push(`- **COST SCORE:** ${result.costScore}`);
  lines.push(`- **Net (value − cost):** ${result.netScore}`);
  lines.push(`- **Ratio (value / cost):** ${result.valueCostRatio.toFixed(2)}`);
  lines.push(`- **Multi-system bonus (≥3):** ${result.multiSystemBonus ? "yes" : "no"}`);
  lines.push(`- **Verdict:** \`${result.verdict}\``);
  lines.push("");
  if (result.reasons.length) {
    lines.push(`### Reasons`);
    lines.push("");
    for (const r of result.reasons) lines.push(`- ${r}`);
    lines.push("");
  }
  if (result.conditions.length) {
    lines.push(`### Conditions`);
    lines.push("");
    for (const c of result.conditions) lines.push(`- ${c}`);
    lines.push("");
  }
  lines.push(`> Reject features whose main justification is “other games have this.”`);
  lines.push(`> Prefer features that improve several existing systems simultaneously.`);
  lines.push("");
  return lines.join("\n");
}

/** Empty score card helper for templates */
export function emptyValueScores(fill: GateScore = 0): ValueScores {
  return Object.fromEntries(VALUE_AXES.map((a) => [a, fill])) as ValueScores;
}

export function emptyCostScores(fill: GateScore = 0): CostScores {
  return Object.fromEntries(COST_AXES.map((a) => [a, fill])) as CostScores;
}

export function assertScore(n: number): GateScore {
  if (!Number.isInteger(n) || n < 0 || n > 5) {
    throw new Error(`Gate scores must be integers 0–5 (got ${n})`);
  }
  return clampScore(n);
}
