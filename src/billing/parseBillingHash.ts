export type BillingRoute = "success" | "cancel" | "portal-return" | null;

/** Parse `/#/billing/success?...` style hashes for GH Pages. */
export function parseBillingHash(hash: string): BillingRoute {
  const raw = hash.replace(/^#/, "");
  const path = raw.split("?")[0] || "";
  if (path === "/billing/success" || path === "billing/success") return "success";
  if (path === "/billing/cancel" || path === "billing/cancel") return "cancel";
  if (path === "/billing/portal-return" || path === "billing/portal-return") {
    return "portal-return";
  }
  return null;
}
