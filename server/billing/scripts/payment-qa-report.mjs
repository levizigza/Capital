#!/usr/bin/env node
/**
 * Runs Payment QA suites and prints a launch-gate report.
 * Exit 2 = SECURITY ISSUE or FINANCIAL RISK (block production).
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync(
  process.execPath,
  ["--test", "test/payment-qa/*.test.js"],
  {
    cwd: root,
    encoding: "utf8",
    shell: true,
  },
);

const out = `${result.stdout || ""}\n${result.stderr || ""}`;
process.stdout.write(out);

/** Map known failing contracts to severity for launch gate. */
const FINDINGS = [
  {
    match: /charge\.refunded did not revoke|FINANCIAL RISK: charge\.refunded/,
    id: "REFUND",
    verdict: "FINANCIAL RISK",
    detail:
      "No charge.refunded / refund.created handler — refunded customers can keep entitlement_active.",
  },
  {
    match:
      /late invoice\.paid resurrected|FINANCIAL RISK: late invoice\.paid/,
    id: "OUT-OF-ORDER WEBHOOK",
    verdict: "FINANCIAL RISK",
    detail:
      "invoice.paid after customer.subscription.deleted re-grants entitlement_active=true.",
  },
  {
    match:
      /unauthenticated \/api\/access discloses|SECURITY ISSUE: unauthenticated/,
    id: "ACCESS ORACLE",
    verdict: "SECURITY ISSUE",
    detail:
      "GET /api/access?email= discloses entitlement and Stripe ids with no auth.",
  },
];

const triggered = [];
for (const f of FINDINGS) {
  if (f.match.test(out)) triggered.push(f);
}

// Also detect via failed assertion messages in TAP
if (/FINANCIAL RISK: charge\.refunded did not revoke entitlement/.test(out)) {
  if (!triggered.find((t) => t.id === "REFUND")) {
    triggered.push(FINDINGS[0]);
  }
}
if (
  /FINANCIAL RISK: late invoice\.paid resurrected canceled subscription access/.test(
    out,
  )
) {
  if (!triggered.find((t) => t.id === "OUT-OF-ORDER WEBHOOK")) {
    triggered.push(FINDINGS[1]);
  }
}
if (
  /SECURITY ISSUE: unauthenticated \/api\/access discloses entitlement/.test(out)
) {
  if (!triggered.find((t) => t.id === "ACCESS ORACLE")) {
    triggered.push(FINDINGS[2]);
  }
}

const failCount = (out.match(/^# fail (\d+)/m) || [])[1];
const passCount = (out.match(/^# pass (\d+)/m) || [])[1];

console.log("\n======== CAPITAL PAYMENT QA LAUNCH GATE ========\n");
console.log(`Automated: pass=${passCount ?? "?"} fail=${failCount ?? "?"}`);
console.log("");

if (triggered.length === 0 && result.status === 0) {
  console.log("VERDICT: PASS (no SECURITY ISSUE / FINANCIAL RISK detected)");
  console.log("Production launch: NOT BLOCKED by Payment QA runner");
  process.exit(0);
}

for (const t of triggered) {
  console.log(`${t.verdict}: ${t.id}`);
  console.log(`  ${t.detail}`);
}

const blocking = triggered.filter(
  (t) => t.verdict === "SECURITY ISSUE" || t.verdict === "FINANCIAL RISK",
);

if (blocking.length) {
  console.log("\nPRODUCTION LAUNCH: BLOCKED");
  console.log(
    "Resolve SECURITY ISSUE and FINANCIAL RISK before live payments.",
  );
  process.exit(2);
}

console.log("\nPRODUCTION LAUNCH: BLOCKED (suite failures without mapped severity)");
process.exit(1);
