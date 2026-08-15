import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { countStages } from "../revenue-intelligence/src/metrics.js";
import { LIFECYCLE_STAGES } from "../revenue-intelligence/src/stages.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const ledgerPath = path.join(
  root,
  "docs/revenue-intelligence/data/ledger.json",
);
const statePath = path.join(
  root,
  "docs/first-revenue/data/orchestrator-state.json",
);
const outPath = path.join(root, "docs/FIRST_REVENUE_DASHBOARD.md");

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function money(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function openEscalations(state) {
  return (state.founderEscalations || []).filter((e) => e.status === "open");
}

function deriveCurrentStep(state, counts) {
  // Prefer explicit state; otherwise infer earliest incomplete step.
  if (state.currentStep) return state.currentStep;
  if (counts.INTERVIEWED < 5) return "TALK";
  if (counts.USER_TEST < 5) return "TEST";
  if (counts.PAID === 0) return "OFFER";
  if (counts.ACTIVATED < counts.PAID) return "ACTIVATE";
  if (counts.RETAINED < counts.PAID) return "RETAIN";
  return "REPEAT";
}

export function buildDashboard({ ledger, state }) {
  const people = ledger.people || [];
  const counts = countStages(people);
  const revenue = people.reduce((s, p) => s + (p.revenueUsd || 0), 0);
  const hyp = state.activeHypothesis;
  const exp = state.nextExperiment;
  const esc = openEscalations(state);
  const step = deriveCurrentStep(state, counts);
  const learning = state.learning || {};

  const lines = [];
  lines.push(`# First Revenue Dashboard`);
  lines.push(``);
  lines.push(`**Objective:** repeatable real customer payments from customers who remain.`);
  lines.push(`**Success metric:** paying retained customers — not leads, traffic, followers, free accounts, or “AI company finished.”`);
  lines.push(`**Updated:** ${new Date().toISOString().slice(0, 10)}`);
  lines.push(``);
  if (state.milestoneNow) {
    lines.push(`## Milestone now`);
    lines.push(``);
    lines.push(`> ${state.milestoneNow}`);
    lines.push(``);
  }
  if (state.leanStack?.length) {
    lines.push(`## Lean stack (build/use first)`);
    lines.push(``);
    lines.push(
      state.leanStack.map((s, i) => `${i + 1}. \`${s}\``).join(" · "),
    );
    lines.push(``);
    lines.push(
      `Full loop: find ~20 → interview handful → test ~5 → fix largest friction → offer → **Payment Link** → pay → return → repeat. See \`docs/first-revenue/LEAN_PATH.md\`.`,
    );
    lines.push(``);
  }
  lines.push(`## Customer hypothesis`);
  lines.push(``);
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Active | **${hyp.label}** (\`${hyp.id}\`) |`);
  lines.push(`| Status | ${hyp.status} · confidence **${hyp.confidence}** |`);
  lines.push(`| Why | ${hyp.whyStrongest} |`);
  lines.push(``);

  lines.push(`## Pipeline (measured)`);
  lines.push(``);
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|------:|`);
  lines.push(`| Interviews completed | ${counts.INTERVIEWED} |`);
  lines.push(`| Tests completed | ${counts.USER_TEST} |`);
  lines.push(`| Qualified prospects | ${counts.QUALIFIED} |`);
  lines.push(`| Offers made | ${counts.OFFERED} |`);
  lines.push(`| Payments | ${counts.PAID} |`);
  lines.push(`| Revenue | ${money(revenue)} |`);
  lines.push(`| Activation | ${counts.ACTIVATED} |`);
  lines.push(`| Retention | ${counts.RETAINED} |`);
  lines.push(``);

  lines.push(`## Learning`);
  lines.push(``);
  lines.push(`| Signal | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(
    `| Top objection | ${learning.topObjection ?? "_insufficient evidence_"} |`,
  );
  lines.push(`| Top pain | ${learning.topPain ?? "_insufficient evidence_"} |`);
  lines.push(
    `| Top product friction | ${learning.topProductFriction ?? "_insufficient evidence_"} |`,
  );
  lines.push(``);

  lines.push(`## Next experiment (exactly one)`);
  lines.push(``);
  lines.push(`- **ID:** \`${exp.id}\``);
  lines.push(`- **Experiment:** ${exp.title}`);
  lines.push(`- **Orchestrator step focus:** \`${step}\``);
  lines.push(``);
  lines.push(
    `> Do not start a second experiment until this one is measured. Do not scale acquisition before retention is understood.`,
  );
  lines.push(``);

  lines.push(`## Operating position`);
  lines.push(``);
  lines.push(`| Step | Status |`);
  lines.push(`|------|--------|`);
  for (const [name, meta] of Object.entries(state.steps || {})) {
    const note = meta.note ? ` — ${meta.note}` : "";
    const target = meta.target != null ? ` (target ${meta.target})` : "";
    lines.push(`| ${name} | ${meta.status}${target}${note} |`);
  }
  lines.push(``);

  lines.push(`## Founder escalations (open)`);
  lines.push(``);
  if (!esc.length) {
    lines.push(`_None open._`);
  } else {
    for (const e of esc) {
      lines.push(`### ${e.id}`);
      lines.push(``);
      lines.push(`- **Summary:** ${e.summary}`);
      lines.push(`- **Decision needed:** ${e.decisionNeeded}`);
      lines.push(`- **Status:** ${e.status}`);
      lines.push(``);
    }
  }

  lines.push(`## Definitions`);
  lines.push(``);
  lines.push(`- **Activation:** ${state.activationDefinition}`);
  lines.push(`- **Retention:** ${state.retentionDefinition}`);
  lines.push(
    `- **Collect path:** ${state.paymentPath?.preferred} (liveAllowed=${state.paymentPath?.liveAllowed})`,
  );
  lines.push(
    `- **Approved offer id:** ${state.approvedOfferId ?? "_none — escalate ESC_APPROVE_OFFER_"}`,
  );
  if (state.stripeCanadaCash) {
    lines.push(
      `- **Canada cash (Stripe docs):** initial settlement ${state.stripeCanadaCash.initialSettlement}; subsequent default ${state.stripeCanadaCash.defaultSubsequentSettlement}; first payout commonly ${state.stripeCanadaCash.firstPayoutCommon}. Source: ${state.stripeCanadaCash.source}`,
    );
  }
  lines.push(``);

  lines.push(`## Hard rules`);
  lines.push(``);
  for (const r of state.hardRules || []) lines.push(`- ${r}`);
  lines.push(``);

  lines.push(`## Lifecycle snapshot`);
  lines.push(``);
  lines.push(
    LIFECYCLE_STAGES.map((s) => `${s}=${counts[s]}`).join(" · "),
  );
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(
    `_Generated by \`npm run first-revenue:dashboard\` from ledger + orchestrator state. Edit evidence in JSON; do not hand-edit counts in this file._`,
  );
  lines.push(``);

  return {
    markdown: lines.join("\n"),
    counts,
    revenue,
    step,
    openEscalationIds: esc.map((e) => e.id),
  };
}

function isMain() {
  const entry = process.argv[1] && path.resolve(process.argv[1]);
  return entry === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const ledger = loadJson(ledgerPath);
  const state = loadJson(statePath);
  const { markdown } = buildDashboard({ ledger, state });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, markdown);
  console.log(`Wrote ${path.relative(root, outPath)}`);
}
