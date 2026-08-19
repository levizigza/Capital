import { LIFECYCLE_STAGES } from "./stages.js";

function reached(person, stage) {
  const v = person.stages?.[stage];
  return v !== undefined && v !== null && v !== false && v !== "";
}

export function countStages(people) {
  const counts = Object.fromEntries(LIFECYCLE_STAGES.map((s) => [s, 0]));
  for (const p of people) {
    for (const s of LIFECYCLE_STAGES) {
      if (reached(p, s)) counts[s] += 1;
    }
  }
  return counts;
}

export function conversionLadder(counts) {
  const steps = [];
  for (let i = 0; i < LIFECYCLE_STAGES.length - 1; i++) {
    const from = LIFECYCLE_STAGES[i];
    const to = LIFECYCLE_STAGES[i + 1];
    const fromCount = counts[from];
    const toCount = counts[to];
    steps.push({
      from,
      to,
      fromCount,
      toCount,
      rate: fromCount > 0 ? toCount / fromCount : null,
    });
  }
  return steps;
}

export function weakestStage(steps, minFrom = 1) {
  const eligible = steps.filter((s) => s.fromCount >= minFrom && s.rate !== null);
  if (!eligible.length) return null;
  return eligible.reduce((worst, s) =>
    (s.rate ?? 1) < (worst.rate ?? 1) ? s : worst,
  );
}

/**
 * Biggest funnel constraint: prefer starving outcomes over vanity upstream volume.
 * 10k visitors with 0 retained payers loses to 100 visitors with 10 retained payers.
 */
export function biggestConstraint(counts, steps) {
  if (counts.RETAINED > 0 && counts.PAID > 0) {
    const weak = weakestStage(steps, 3);
    if (weak) {
      return {
        stage: weak.to,
        reason: `Lowest conversion ${weak.from}→${weak.to} (${fmtPct(weak.rate)}) with volume upstream.`,
      };
    }
  }

  if (counts.PAID === 0) {
    let lastNonZero = "DISCOVERED";
    for (const s of LIFECYCLE_STAGES) {
      if (counts[s] > 0) lastNonZero = s;
    }
    if (counts.DISCOVERED === 0) {
      return {
        stage: "DISCOVERED",
        reason:
          "No discovered prospects recorded — cannot create retained revenue without a real pipeline.",
      };
    }
    const idx = LIFECYCLE_STAGES.indexOf(lastNonZero);
    const next =
      LIFECYCLE_STAGES[Math.min(idx + 1, LIFECYCLE_STAGES.length - 1)];
    return {
      stage: next,
      reason: `Pipeline stalls after ${lastNonZero} (${counts[lastNonZero]}). Zero PAID and zero RETAINED — do not scale traffic until this unlocks.`,
    };
  }

  if (counts.ACTIVATED === 0) {
    return {
      stage: "ACTIVATED",
      reason: "Customers paid but none activated — revenue without product value.",
    };
  }

  if (counts.RETAINED === 0) {
    return {
      stage: "RETAINED",
      reason: "Paid+activated but no retention — CAC cannot pay back.",
    };
  }

  return {
    stage: "RETAINED",
    reason: "Inspect retention and referrals for compounding.",
  };
}

export function fmtPct(rate) {
  if (rate === null || Number.isNaN(rate)) return "n/a";
  return `${(rate * 100).toFixed(1)}%`;
}

export function fmtMoney(n, currency = "USD") {
  if (n === null || n === undefined || Number.isNaN(n)) return "n/a";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

export function metricsForSource(ledger, sourceId) {
  const source = ledger.sources.find((s) => s.id === sourceId);
  const people = ledger.people.filter((p) => p.sourceId === sourceId);
  const counts = countStages(people);
  const spendUsd = ledger.costs
    .filter((c) => c.sourceId === sourceId)
    .reduce((sum, c) => sum + (c.amountUsd || 0), 0);
  const revenue = people.reduce((sum, p) => sum + (p.revenueUsd || 0), 0);
  const payments = counts.PAID;
  const variable = ledger.variableCostPerPaidUsd ?? 0;
  const cogs = payments * variable;
  const grossProfit = payments > 0 || revenue > 0 ? revenue - cogs : null;
  const contributionProfit =
    grossProfit === null ? null : grossProfit - spendUsd;

  const costPerLead =
    counts.DISCOVERED > 0 ? spendUsd / counts.DISCOVERED : spendUsd > 0 ? null : 0;
  const cacRaw = payments > 0 ? spendUsd / payments : spendUsd > 0 ? Infinity : null;
  const revenuePerCustomer = payments > 0 ? revenue / payments : null;
  const retentionRateOfPaid =
    payments > 0 ? counts.RETAINED / payments : null;

  let cacPayback = null;
  if (
    cacRaw !== null &&
    cacRaw !== Infinity &&
    revenuePerCustomer &&
    revenuePerCustomer > 0
  ) {
    const contributionPerCustomer = revenuePerCustomer - variable;
    cacPayback =
      contributionPerCustomer > 0 ? cacRaw / contributionPerCustomer : Infinity;
  } else if (cacRaw === Infinity) {
    cacPayback = Infinity;
  }

  return {
    sourceId,
    label: source?.label || sourceId,
    prospects: counts.DISCOVERED,
    responses: counts.REPLIED,
    interviews: counts.INTERVIEWED,
    userTests: counts.USER_TEST,
    qualified: counts.QUALIFIED,
    offers: counts.OFFERED,
    checkoutStarted: counts.CHECKOUT_STARTED,
    payments,
    activation: counts.ACTIVATED,
    retention: counts.RETAINED,
    referred: counts.REFERRED,
    revenue,
    spendUsd,
    costPerLead: costPerLead === Infinity ? null : costPerLead,
    cac: cacRaw === Infinity ? null : cacRaw,
    revenuePerCustomer,
    grossProfit,
    contributionProfit,
    cacPayback: cacPayback === Infinity ? null : cacPayback,
    retentionRateOfPaid,
  };
}

export function allSourceMetrics(ledger) {
  return ledger.sources.map((s) => metricsForSource(ledger, s.id));
}

export function strongestSource(metrics) {
  if (!metrics.length) return null;
  const scored = [...metrics].sort((a, b) => {
    if (b.retention !== a.retention) return b.retention - a.retention;
    if (b.payments !== a.payments) return b.payments - a.payments;
    if (b.activation !== a.activation) return b.activation - a.activation;
    if (b.qualified !== a.qualified) return b.qualified - a.qualified;
    if (b.interviews !== a.interviews) return b.interviews - a.interviews;
    return b.prospects - a.prospects;
  });
  const best = scored[0];
  if (
    best.retention === 0 &&
    best.payments === 0 &&
    best.interviews === 0 &&
    best.prospects === 0
  ) {
    return null;
  }
  return best;
}

export function strongestSegment(ledger) {
  const bySeg = new Map();
  for (const p of ledger.people) {
    const cur = bySeg.get(p.segmentId) || {
      retained: 0,
      paid: 0,
      interviewed: 0,
    };
    if (reached(p, "RETAINED")) cur.retained += 1;
    if (reached(p, "PAID")) cur.paid += 1;
    if (reached(p, "INTERVIEWED")) cur.interviewed += 1;
    bySeg.set(p.segmentId, cur);
  }
  const ranked = [...bySeg.entries()].sort((a, b) => {
    if (b[1].retained !== a[1].retained) return b[1].retained - a[1].retained;
    if (b[1].paid !== a[1].paid) return b[1].paid - a[1].paid;
    return b[1].interviewed - a[1].interviewed;
  });
  if (!ranked.length) return null;
  const [segmentId, stats] = ranked[0];
  if (stats.retained === 0 && stats.paid === 0 && stats.interviewed === 0) {
    return null;
  }
  const label =
    ledger.segments?.find((s) => s.id === segmentId)?.label || segmentId;
  return { segmentId, label, ...stats };
}

export function strongestOffer(ledger) {
  const byOffer = new Map();
  for (const p of ledger.people) {
    if (!p.offerId) continue;
    const cur = byOffer.get(p.offerId) || { paid: 0, retained: 0, revenue: 0 };
    if (reached(p, "PAID")) cur.paid += 1;
    if (reached(p, "RETAINED")) cur.retained += 1;
    cur.revenue += p.revenueUsd || 0;
    byOffer.set(p.offerId, cur);
  }
  const ranked = [...byOffer.entries()].sort((a, b) => {
    if (b[1].retained !== a[1].retained) return b[1].retained - a[1].retained;
    if (b[1].paid !== a[1].paid) return b[1].paid - a[1].paid;
    return b[1].revenue - a[1].revenue;
  });
  if (!ranked.length) return null;
  const [offerId, stats] = ranked[0];
  if (stats.paid === 0 && stats.retained === 0) return null;
  const label = ledger.offers.find((o) => o.id === offerId)?.label || offerId;
  return { offerId, label, ...stats };
}

/** Exactly one highest-priority revenue experiment. */
export function recommendExperiment({
  counts,
  constraint,
}) {
  if (counts.DISCOVERED === 0 || counts.INTERVIEWED === 0) {
    return {
      id: "EXP_INTERVIEW_5_S1",
      title:
        "Complete 5 problem interviews with S1 family caregivers (kids ~6–11) before any paid acquisition scale",
      why: `Constraint is ${constraint.stage}: ${constraint.reason} Zero interviewed→paid evidence means traffic experiments would optimize an upstream vanity number.`,
      successMetric:
        "5 interviewed; ≥3 qualified; documented WTP signal; 0 requirement to increase visitors",
      antiMetric:
        "Do not celebrate impressions, clicks, or GH Pages traffic alone",
    };
  }

  if (counts.USER_TEST === 0 && counts.INTERVIEWED > 0) {
    return {
      id: "EXP_UT_HARBOR_LOOP",
      title:
        "Run 3 moderated user tests of Harbor → Cove Take → scar/share loop with interviewed families",
      why: "Interviews exist but no user tests — cannot qualify activation before offering payment.",
      successMetric:
        "3 user tests; ≥2 reach scar/share without facilitator rescue; activation criteria written",
      antiMetric: "Do not expand ad spend or blast outreach lists",
    };
  }

  if (counts.OFFERED === 0 && counts.QUALIFIED > 0) {
    return {
      id: "EXP_OFFER_FOUNDING",
      title:
        "Present Founding Family offer to qualified users only (sandbox Checkout), measure checkout→paid",
      why: "Qualified demand without offers cannot produce CAC/payback learning.",
      successMetric:
        "≥3 offered; track CHECKOUT_STARTED and PAID; no live mode",
      antiMetric: "Do not offer to cold traffic or un-interviewed prospects",
    };
  }

  if (counts.PAID > 0 && counts.RETAINED === 0) {
    return {
      id: "EXP_RETENTION_D7",
      title:
        "Day-7 retention check for every paid account (activation + return visit)",
      why: constraint.reason,
      successMetric:
        "100% of paid contacted; RETAINED defined as return + Harbor/Cove activity by D7",
      antiMetric: "Do not buy more leads until one paid user retains",
    };
  }

  return {
    id: "EXP_CONSTRAINT_FOCUS",
    title: `Single experiment unlocking ${constraint.stage}`,
    why: constraint.reason,
    successMetric: `Move ≥3 people into ${constraint.stage} with retained-paying path in view`,
    antiMetric: "No isolated upstream KPI optimization",
  };
}

/**
 * Ranking proof: fewer visitors with retained payers beat empty mega-funnels.
 */
export function scoreAcquisitionQuality({ visitors, retainedPaying }) {
  if (retainedPaying > 0) return retainedPaying * 1000 + visitors;
  return -Math.max(visitors, 1);
}
