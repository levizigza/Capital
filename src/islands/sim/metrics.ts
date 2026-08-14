/**
 * Aggregate metrics + dominance flags. Never auto-rebalances rules.
 */

import type {
  AgentStrategyId,
  DominanceFlag,
  ImbalanceFinding,
  SimBatchReport,
  SimCondition,
  SimConfig,
  SimGameResult,
  StrategyConditionStats,
} from "./types";

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function summarize(
  strategy: AgentStrategyId,
  conditionId: string,
  games: SimGameResult[],
): StrategyConditionStats {
  const wins = games.filter((g) => g.won);
  const freedomTurns = wins
    .map((g) => g.freedomTurn)
    .filter((t): t is number => typeof t === "number");
  return {
    strategy,
    conditionId,
    games: games.length,
    winRate: games.length ? wins.length / games.length : 0,
    meanFinalCoins: mean(games.map((g) => g.finalCoins)),
    meanFinalCashflow: mean(games.map((g) => g.finalCashflow)),
    meanFreedomTurn: freedomTurns.length ? mean(freedomTurns) : null,
    meanSeals: mean(games.map((g) => g.seals)),
    meanDealsAccepted: mean(games.map((g) => g.dealsAccepted)),
    scarcityRate: mean(games.map((g) => g.scarcityTurns / Math.max(1, g.turns))),
    deadlockRate: games.filter((g) => g.deadlock).length / Math.max(1, games.length),
    collapseRate: games.filter((g) => g.collapse).length / Math.max(1, games.length),
    runawayRate: games.filter((g) => g.runawayLeader).length / Math.max(1, games.length),
    assetAdoptionRate:
      games.filter((g) => g.finalAssets > 0).length / Math.max(1, games.length),
  };
}

function topStrategy(
  rows: StrategyConditionStats[],
  conditionId: string,
): StrategyConditionStats | null {
  const slice = rows.filter((r) => r.conditionId === conditionId);
  if (slice.length === 0) return null;
  return [...slice].sort((a, b) => {
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    return b.meanFinalCashflow - a.meanFinalCashflow;
  })[0]!;
}

export function flagDominance(
  rows: StrategyConditionStats[],
  conditions: SimCondition[],
  config: Pick<SimConfig, "dominanceConditionShare" | "dominanceWinGapPp">,
): DominanceFlag[] {
  const gapLeaders = new Map<AgentStrategyId, string[]>();
  const frequentLeaders = new Map<AgentStrategyId, string[]>();

  for (const c of conditions) {
    const ranked = rows
      .filter((r) => r.conditionId === c.id)
      .sort((a, b) => b.winRate - a.winRate || b.meanFinalCashflow - a.meanFinalCashflow);
    if (ranked.length === 0) continue;
    const best = ranked[0]!;
    const second = ranked[1];
    const gapPp = second ? (best.winRate - second.winRate) * 100 : 100;

    const freq = frequentLeaders.get(best.strategy) ?? [];
    freq.push(c.id);
    frequentLeaders.set(best.strategy, freq);

    if (gapPp >= config.dominanceWinGapPp || !second) {
      const list = gapLeaders.get(best.strategy) ?? [];
      list.push(c.id);
      gapLeaders.set(best.strategy, list);
    }
  }

  const flags: DominanceFlag[] = [];
  const seen = new Set<AgentStrategyId>();

  for (const [strategy, topped] of gapLeaders) {
    const share = topped.length / Math.max(1, conditions.length);
    if (share < config.dominanceConditionShare) continue;
    seen.add(strategy);
    const rates = rows.filter((r) => r.strategy === strategy).map((r) => r.winRate);
    flags.push({
      strategy,
      toppedConditionIds: topped,
      shareOfConditions: share,
      meanWinRate: mean(rates),
      reason:
        `${strategy} led win rate (gap ≥ ${config.dominanceWinGapPp}pp vs #2) in ` +
        `${topped.length}/${conditions.length} conditions (${(share * 100).toFixed(0)}%). ` +
        `This is a flag for designers to investigate — not an auto-rebalance trigger.`,
    });
  }

  // Frequent #1 across conditions even with thin margins — still a dominance smell.
  for (const [strategy, topped] of frequentLeaders) {
    if (seen.has(strategy)) continue;
    const share = topped.length / Math.max(1, conditions.length);
    if (share < config.dominanceConditionShare) continue;
    const rates = rows.filter((r) => r.strategy === strategy).map((r) => r.winRate);
    flags.push({
      strategy,
      toppedConditionIds: topped,
      shareOfConditions: share,
      meanWinRate: mean(rates),
      reason:
        `${strategy} was the #1 Freedom strategy in ${topped.length}/${conditions.length} ` +
        `conditions (${(share * 100).toFixed(0)}%), even where win gaps were thin. ` +
        `Investigate whether its deal/ROI policy overfits the CF≥30×3 escape rule. ` +
        `Do not auto-rebalance from this flag.`,
    });
  }

  return flags.sort((a, b) => b.shareOfConditions - a.shareOfConditions);
}

export function detectImbalances(
  games: SimGameResult[],
  rows: StrategyConditionStats[],
  dominanceFlags: DominanceFlag[],
  conditions: SimCondition[],
): ImbalanceFinding[] {
  const findings: ImbalanceFinding[] = [];

  for (const flag of dominanceFlags) {
    findings.push({
      kind: "strategy_dominance",
      severity: "alert",
      title: `Dominant strategy: ${flag.strategy}`,
      why:
        `${flag.strategy} keeps winning across varied starting coins, turn budgets, and macro biases. ` +
        `Likely causes: its deal/ROI policy matches the Freedom CF≥30×3 Pay Day rule more reliably than spendy or hoarding policies; ` +
        `board deal pool (jar/booth/lemonade) rewards early asset adoption; seal/shop sinks punish aggressive spenders before escape.`,
      evidence: [
        flag.reason,
        `Mean win rate ${(flag.meanWinRate * 100).toFixed(1)}%`,
        `Topped: ${flag.toppedConditionIds.join(", ")}`,
      ],
      strategies: [flag.strategy],
    });
  }

  const meanEndCoins = mean(games.map((g) => g.finalCoins));
  const meanStart = mean(conditions.map((c) => c.startingCoins));
  if (meanEndCoins > meanStart * 2.5) {
    findings.push({
      kind: "resource_inflation",
      severity: "watch",
      title: "Pouch inflation vs start",
      why:
        `Average ending pouch (${meanEndCoins.toFixed(0)}) is >> starting stake (~${meanStart.toFixed(0)}). ` +
        `Pay Day cashflow credits compound after assets; shop sinks may be too rare or too weak relative to CF income. ` +
        `Investigate pass-start + payday double-credit density on the Harbor pattern.`,
      evidence: [
        `meanFinalCoins=${meanEndCoins.toFixed(1)}`,
        `meanStartingCoins=${meanStart.toFixed(1)}`,
      ],
    });
  }

  const scarcity = mean(rows.map((r) => r.scarcityRate));
  if (scarcity > 0.35) {
    findings.push({
      kind: "resource_scarcity",
      severity: "watch",
      title: "Widespread pouch scarcity",
      why:
        `Players spend a large share of turns below 10 coins. Bills, collector, liabilities, and seal costs compete with deal purchase costs (20–48). ` +
        `Hoarder/conservative policies may stall Freedom by refusing deals while still eating liabilities.`,
      evidence: [`mean scarcityRate=${(scarcity * 100).toFixed(1)}% of turns`],
    });
  }

  const runaway = mean(rows.map((r) => r.runawayRate));
  if (runaway > 0.2) {
    findings.push({
      kind: "runaway_leaders",
      severity: "alert",
      title: "Early Freedom runaway",
      why:
        `>20% of runs escape in the first quarter of the turn budget. Jar (+$5) + Booth (+$10) on base CF 15 reaches exactly 30 — ` +
        `two affordable assets + 3 qualifying Pay Days can finish the grind before sinks matter. ` +
        `This is the known Freedom path; dominance here means the path is too short for the turn budget, not that agents are “skilled.”`,
      evidence: [`mean runawayRate=${(runaway * 100).toFixed(1)}%`],
    });
  }

  const deadlock = mean(rows.map((r) => r.deadlockRate));
  if (deadlock > 0.05) {
    findings.push({
      kind: "deadlocks",
      severity: "alert",
      title: "Deadlock loops detected",
      why:
        `Some runs stay broke with negative CF and zero deals accepted. Liability landings without assets create a CF trap; ` +
        `policies that refuse all spends (hoarder) or miss deal affordances cannot recover. ` +
        `Investigate liability density vs deal density on the cashflow board pattern.`,
      evidence: [`mean deadlockRate=${(deadlock * 100).toFixed(1)}%`],
    });
  }

  const collapse = mean(rows.map((r) => r.collapseRate));
  if (collapse > 0.05) {
    findings.push({
      kind: "economic_collapse",
      severity: "alert",
      title: "Economic collapse runs",
      why:
        `Sustained negative CF and repeated bankruptcy indicate liability + bill pressure exceeding income without asset adoption. ` +
        `Sticky recession income multipliers amplify shortfalls on Pay Day.`,
      evidence: [`mean collapseRate=${(collapse * 100).toFixed(1)}%`],
    });
  }

  // Feedback: deal acceptance correlates with win rate across strategies
  const withDeals = rows.filter((r) => r.meanDealsAccepted >= 1);
  const lowDeals = rows.filter((r) => r.meanDealsAccepted < 0.5);
  if (withDeals.length && lowDeals.length) {
    const winWith = mean(withDeals.map((r) => r.winRate));
    const winLow = mean(lowDeals.map((r) => r.winRate));
    if (winWith - winLow > 0.2) {
      findings.push({
        kind: "feedback_loop",
        severity: "watch",
        title: "Asset adoption ↔ Freedom feedback",
        why:
          `Strategies that accept ~1+ deals average much higher Freedom win rates than deal-averse ones ` +
          `(${(winWith * 100).toFixed(0)}% vs ${(winLow * 100).toFixed(0)}%). ` +
          `Positive feedback: assets raise CF → more Pay Day coins → more deals → Freedom streak. ` +
          `Negative feedback for hoarders: pouch grows slowly from base CF 15 while liabilities still land.`,
        evidence: [
          `winRate|deals≥1=${(winWith * 100).toFixed(1)}%`,
          `winRate|deals<0.5=${(winLow * 100).toFixed(1)}%`,
        ],
      });
    }
  }

  // Milestone skew: freedom turn variance by strategy
  const freedomMeans = rows
    .filter((r) => r.meanFreedomTurn != null)
    .map((r) => ({ s: r.strategy, t: r.meanFreedomTurn! }));
  if (freedomMeans.length >= 2) {
    const fastest = [...freedomMeans].sort((a, b) => a.t - b.t)[0]!;
    const slowest = [...freedomMeans].sort((a, b) => b.t - a.t)[0]!;
    if (slowest.t - fastest.t >= 10) {
      findings.push({
        kind: "milestone_skew",
        severity: "info",
        title: "Progression velocity skew",
        why:
          `Mean Freedom turn differs by ≥10 between ${fastest.s} (~${fastest.t.toFixed(1)}) and ${slowest.s} (~${slowest.t.toFixed(1)}). ` +
          `Optimizer/investor paths front-load CF assets; collectors/hoarders delay the streak clock.`,
        evidence: [
          `fastest=${fastest.s}@${fastest.t.toFixed(1)}`,
          `slowest=${slowest.s}@${slowest.t.toFixed(1)}`,
        ],
        strategies: [fastest.s, slowest.s],
      });
    }
  }

  // Always note if no dominance — still useful
  if (dominanceFlags.length === 0) {
    findings.push({
      kind: "strategy_dominance",
      severity: "info",
      title: "No cross-condition dominant strategy",
      why:
        `No policy led with a ≥${/* placeholder */ 0}pp gap across the dominance share threshold. ` +
        `Relative balance does not prove enjoyment — still playtest human paths.`,
      evidence: conditions.map((c) => {
        const top = topStrategy(rows, c.id);
        return top
          ? `${c.id}: ${top.strategy} @ ${(top.winRate * 100).toFixed(0)}%`
          : `${c.id}: n/a`;
      }),
    });
  }

  return findings;
}

export function buildStats(
  games: SimGameResult[],
  strategies: AgentStrategyId[],
  conditions: SimCondition[],
): StrategyConditionStats[] {
  const rows: StrategyConditionStats[] = [];
  for (const strategy of strategies) {
    for (const condition of conditions) {
      const slice = games.filter(
        (g) => g.strategy === strategy && g.conditionId === condition.id,
      );
      rows.push(summarize(strategy, condition.id, slice));
    }
  }
  return rows;
}

export function renderReportMarkdown(report: Omit<SimBatchReport, "markdown">): string {
  const lines: string[] = [];
  lines.push(`# Economy simulation report`);
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Total games: ${report.totalGames}`);
  lines.push(`Seed: ${report.config.seed}`);
  lines.push("");
  lines.push(`> Metrics identify where to investigate. **Do not auto-rebalance from this report.**`);
  lines.push("");
  lines.push(`## Win rates by strategy × condition`);
  lines.push("");
  lines.push(`| Strategy | Condition | Win% | Mean CF | Mean Freedom turn | Deals | Deadlock% | Collapse% |`);
  lines.push(`|----------|-----------|------|---------|-------------------|-------|-----------|-----------|`);
  for (const r of report.byStrategyCondition) {
    lines.push(
      `| ${r.strategy} | ${r.conditionId} | ${(r.winRate * 100).toFixed(1)} | ${r.meanFinalCashflow.toFixed(1)} | ${r.meanFreedomTurn?.toFixed(1) ?? "—"} | ${r.meanDealsAccepted.toFixed(2)} | ${(r.deadlockRate * 100).toFixed(1)} | ${(r.collapseRate * 100).toFixed(1)} |`,
    );
  }
  lines.push("");
  lines.push(`## Dominance flags`);
  lines.push("");
  if (report.dominanceFlags.length === 0) {
    lines.push(`None — no strategy cleared the cross-condition dominance threshold.`);
  } else {
    for (const f of report.dominanceFlags) {
      lines.push(`- **${f.strategy}**: ${f.reason}`);
    }
  }
  lines.push("");
  lines.push(`## Findings (WHY imbalance emerged)`);
  lines.push("");
  for (const finding of report.findings) {
    lines.push(`### [${finding.severity}] ${finding.title}`);
    lines.push("");
    lines.push(finding.why);
    lines.push("");
    lines.push(`Evidence:`);
    for (const e of finding.evidence) lines.push(`- ${e}`);
    lines.push("");
  }
  lines.push(`## Measured instruments`);
  lines.push("");
  lines.push(`- Win rates (Harbor Freedom)`);
  lines.push(`- Wealth distribution (final coins / CF / assets / liabilities)`);
  lines.push(`- Strategy dominance flags`);
  lines.push(`- Resource inflation / scarcity`);
  lines.push(`- Time to progression milestones`);
  lines.push(`- Runaway leaders / deadlocks / collapse`);
  lines.push(`- Feedback loops (deals ↔ Freedom)`);
  lines.push("");
  return lines.join("\n");
}

/** Fix the placeholder in no-dominance finding — patch after config known */
export function finalizeFindings(
  findings: ImbalanceFinding[],
  config: SimConfig,
): ImbalanceFinding[] {
  return findings.map((f) => {
    if (f.title === "No cross-condition dominant strategy") {
      return {
        ...f,
        why:
          `No policy led with a ≥${config.dominanceWinGapPp}pp gap across ` +
          `≥${(config.dominanceConditionShare * 100).toFixed(0)}% of conditions. ` +
          `Relative balance does not prove enjoyment — still playtest human paths.`,
      };
    }
    return f;
  });
}
