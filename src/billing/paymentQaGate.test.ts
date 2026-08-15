import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Payment QA launch gate artifacts", () => {
  it("documents BLOCKED production when SECURITY or FINANCIAL RISK exist", () => {
    const report = readFileSync(
      join(__dirname, "../../docs/PAYMENT_QA_REPORT.md"),
      "utf8",
    );
    expect(report).toMatch(/BLOCKED/);
    expect(report).toMatch(/FINANCIAL RISK/);
    expect(report).toMatch(/SECURITY ISSUE/);
    expect(report).toMatch(/No test[\s\S]*real card data/i);
  });

  it("success URL copy does not claim unlock without Stripe confirmation", () => {
    const shell = readFileSync(join(__dirname, "BillingShell.tsx"), "utf8");
    expect(shell).toMatch(/does not grant paid access/i);
  });
});
