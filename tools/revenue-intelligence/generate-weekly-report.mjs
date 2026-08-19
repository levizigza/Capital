import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LIFECYCLE_STAGES, STAGE_LABELS } from "./src/stages.js";
import {
  countStages,
  conversionLadder,
  biggestConstraint,
  weakestStage,
  allSourceMetrics,
  strongestSource,
  strongestSegment,
  strongestOffer,
  recommendExperiment,
  fmtPct,
  fmtMoney,
  scoreAcquisitionQuality,
} from "./src/metrics.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const ledgerPath = path.join(
  root,
  "docs/revenue-intelligence/data/ledger.json",
);
const outPath = path.join(
  root,
  "docs/revenue-intelligence/WEEKLY_REPORT.md",
);

function loadLedger() {
  return JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
}

function buildReport(ledger) {
  const counts = countStages(ledger.people || []);
  const steps = conversionLadder(counts);
  const constraint = biggestConstraint(counts, steps);
  const weak = weakestStage(steps, 1);
  const bySource = allSourceMetrics(ledger);
  const bestSource = strongestSource(bySource);
  const bestSeg = strongestSegment(ledger);
  const bestOffer = strongestOffer(ledger);
  const experiment = recommendExperiment({ counts, constraint });

  const vanityWorse =
    scoreAcquisitionQuality({ visitors: 10000, retainedPaying: 0 }) <
    scoreAcquisitionQuality({ visitors: 100, retainedPaying: 10 });

  const lines = [];
  lines.push(`# Capital Revenue Intelligence — Weekly Report`);
  lines.push("");
  lines.push(`**Week of:** ${ledger.weekOf}`);
  lines.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`**Currency:** ${ledger.currency || "USD"}`);
  lines.push("");
  lines.push(`## North star`);
  lines.push("");
  lines.push(
    `Optimize for **retained paying customers**, not isolated upstream volume.`,
  );
  lines.push(
    vanityWorse
      ? `Check: 100 visitors → 10 retained payers scores above 10,000 visitors → 0 retained. **PASS**`
      : `Check: ranking rule failed — investigate scoreAcquisitionQuality.`,
  );
  lines.push("");
  if (ledger.notes?.length) {
    lines.push(`## Data honesty`);
    lines.push("");
    for (const n of ledger.notes) lines.push(`- ${n}`);
    lines.push("");
  }

  lines.push(`## Lifecycle funnel`);
  lines.push("");
  lines.push(`| Stage | Count | → next | Conversion |`);
  lines.push(`|-------|------:|--------|------------|`);
  for (let i = 0; i < LIFECYCLE_STAGES.length; i++) {
    const stage = LIFECYCLE_STAGES[i];
    const step = steps[i];
    const next = step
      ? `${step.toCount}`
      : "—";
    const conv = step ? fmtPct(step.rate) : "—";
    lines.push(
      `| ${STAGE_LABELS[stage]} (\`${stage}\`) | ${counts[stage]} | ${next} | ${conv} |`,
    );
  }
  lines.push("");

  lines.push(`## Acquisition sources`);
  lines.push("");
  lines.push(
    `| Source | Prospects | Responses | Interviews | User tests | Qualified | Offers | Payments | Activation | Retention | Revenue | CPL | CAC | Rev/cust | Gross profit | Contrib. profit | CAC payback |`,
  );
  lines.push(
    `|--------|----------:|----------:|-----------:|-----------:|----------:|-------:|---------:|-----------:|----------:|--------:|----:|----:|---------:|-------------:|----------------:|------------:|`,
  );
  for (const m of bySource) {
    lines.push(
      `| ${m.label} | ${m.prospects} | ${m.responses} | ${m.interviews} | ${m.userTests} | ${m.qualified} | ${m.offers} | ${m.payments} | ${m.activation} | ${m.retention} | ${fmtMoney(m.revenue)} | ${fmtMoney(m.costPerLead)} | ${fmtMoney(m.cac)} | ${fmtMoney(m.revenuePerCustomer)} | ${fmtMoney(m.grossProfit)} | ${fmtMoney(m.contributionProfit)} | ${m.cacPayback == null ? "n/a" : m.cacPayback.toFixed(2)} |`,
    );
  }
  lines.push("");
  lines.push(
    `_n/a means insufficient data (e.g. CAC with zero payments and zero spend). Do not invent values._`,
  );
  lines.push("");

  lines.push(`## Weekly callouts`);
  lines.push("");
  lines.push(
    `| Callout | Result |`,
  );
  lines.push(`|---------|--------|`);
  lines.push(
    `| **Biggest funnel constraint** | \`${constraint.stage}\` — ${constraint.reason} |`,
  );
  lines.push(
    `| **Weakest stage** | ${weak ? `\`${weak.to}\` (${weak.from}→${weak.to} ${fmtPct(weak.rate)})` : "n/a (no conversion volume yet)"} |`,
  );
  lines.push(
    `| **Strongest segment** | ${bestSeg ? `${bestSeg.label} (interviewed=${bestSeg.interviewed}, paid=${bestSeg.paid}, retained=${bestSeg.retained})` : "n/a — no segment has interviews/payments yet"} |`,
  );
  lines.push(
    `| **Strongest acquisition source** | ${bestSource ? `${bestSource.label} (retained=${bestSource.retention}, paid=${bestSource.payments}, interviewed=${bestSource.interviews})` : "n/a — ranked empty; do not pick a winner on zero outcomes"} |`,
  );
  lines.push(
    `| **Strongest offer** | ${bestOffer ? `${bestOffer.label} (paid=${bestOffer.paid}, retained=${bestOffer.retained}, revenue=${fmtMoney(bestOffer.revenue)})` : "n/a — no paid offer performance yet (`OFFER_FOUNDING_FAMILY` not approved/sold)"} |`,
  );
  lines.push("");

  lines.push(`## ONE highest-priority revenue experiment`);
  lines.push("");
  lines.push(`**ID:** \`${experiment.id}\``);
  lines.push("");
  lines.push(`**Experiment:** ${experiment.title}`);
  lines.push("");
  lines.push(`**Why (constraint-linked):** ${experiment.why}`);
  lines.push("");
  lines.push(`**Success metric:** ${experiment.successMetric}`);
  lines.push("");
  lines.push(`**Anti-metric (do not optimize):** ${experiment.antiMetric}`);
  lines.push("");
  lines.push(`> Run only this experiment until the weekly report replaces it.`);
  lines.push("");

  lines.push(`## How to update`);
  lines.push("");
  lines.push(`1. Edit \`docs/revenue-intelligence/data/ledger.json\` (people stages, costs, offers).`);
  lines.push(`2. Run \`npm run revenue:report\`.`);
  lines.push(`3. Commit the regenerated \`WEEKLY_REPORT.md\`.`);
  lines.push("");

  return {
    markdown: lines.join("\n"),
    experiment,
    constraint,
    counts,
  };
}

const ledger = loadLedger();
const { markdown } = buildReport(ledger);
fs.writeFileSync(outPath, markdown);
console.log(`Wrote ${path.relative(root, outPath)}`);
