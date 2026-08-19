import { describe, it, expect } from "vitest";
import { parseBillingHash } from "./parseBillingHash";

describe("billing hash routes", () => {
  it("parses success cancel and portal-return", () => {
    expect(parseBillingHash("#/billing/success?session_id=cs_x")).toBe("success");
    expect(parseBillingHash("#/billing/cancel")).toBe("cancel");
    expect(parseBillingHash("#/billing/portal-return")).toBe("portal-return");
    expect(parseBillingHash("#/harbor")).toBe(null);
  });
});
