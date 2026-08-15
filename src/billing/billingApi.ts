/**
 * Browser client for Capital billing server.
 * Never send or store Stripe secret keys here.
 */

const base = () =>
  (import.meta.env.VITE_BILLING_API_BASE || "").replace(/\/$/, "");

export type AccessStatus = {
  email: string;
  entitlementActive: boolean;
  subscription_status: string;
  price_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  source: string;
};

export function billingConfigured(): boolean {
  return Boolean(base());
}

export async function createCheckoutSession(input: {
  offerKey?: string;
  customerEmail: string;
}): Promise<{ id: string; url: string }> {
  const res = await fetch(`${base()}/api/checkout/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      offerKey: input.offerKey || "founding_family",
      customerEmail: input.customerEmail,
    }),
  });
  if (!res.ok) {
    throw new Error(`checkout_session_failed:${res.status}`);
  }
  return res.json();
}

export async function createPortalSession(input: {
  customerEmail: string;
}): Promise<{ url: string }> {
  const res = await fetch(`${base()}/api/portal/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerEmail: input.customerEmail }),
  });
  if (!res.ok) {
    throw new Error(`portal_session_failed:${res.status}`);
  }
  return res.json();
}

export async function fetchAccess(email: string): Promise<AccessStatus> {
  const res = await fetch(
    `${base()}/api/access?email=${encodeURIComponent(email)}`,
  );
  if (!res.ok) {
    throw new Error(`access_failed:${res.status}`);
  }
  return res.json();
}
