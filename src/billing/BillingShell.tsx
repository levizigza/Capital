import { useEffect, useMemo, useState } from "react";
import {
  billingConfigured,
  fetchAccess,
  type AccessStatus,
} from "./billingApi";
import {
  parseBillingHash,
  type BillingRoute,
} from "./parseBillingHash";

export { parseBillingHash, type BillingRoute };

function sessionIdFromHash(hash: string): string | null {
  const q = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
  const params = new URLSearchParams(q);
  return params.get("session_id");
}

function leaveBilling() {
  window.location.hash = "";
  window.location.reload();
}

/**
 * Explicit success / cancel / portal-return surfaces.
 * Paid access is never granted here — only messaging + optional status poll.
 */
export function BillingShell({ route }: { route: Exclude<BillingRoute, null> }) {
  const sessionId = useMemo(
    () => sessionIdFromHash(window.location.hash),
    [],
  );
  const [email, setEmail] = useState("");
  const [access, setAccess] = useState<AccessStatus | null>(null);
  const [pollNote, setPollNote] = useState<string | null>(null);

  useEffect(() => {
    if (route !== "success" || !billingConfigured() || !email.trim()) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const status = await fetchAccess(email.trim());
        if (!cancelled) {
          setAccess(status);
          setPollNote(
            status.entitlementActive
              ? "Access confirmed from Stripe webhook state."
              : "Waiting for Stripe webhook confirmation…",
          );
        }
      } catch {
        if (!cancelled) {
          setPollNote("Could not reach billing API yet.");
        }
      }
    };
    void tick();
    const id = window.setInterval(tick, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [route, email]);

  const title =
    route === "success"
      ? "Payment received"
      : route === "cancel"
        ? "Checkout canceled"
        : "Billing portal";

  const body =
    route === "success"
      ? "Thanks — unlocking when Stripe confirms payment. Reaching this page alone does not grant paid access."
      : route === "cancel"
        ? "No charge was completed. You can return to Harbor and try again when ready."
        : "Welcome back from the Stripe customer portal. Subscription changes apply after Stripe webhooks update your account.";

  return (
    <div className="min-h-screen flex items-center justify-center cap-surface px-6">
      <div className="max-w-md w-full space-y-5 text-center">
        <p className="text-sm uppercase tracking-wide text-[var(--cap-ink-soft)]">
          Capital billing
        </p>
        <h1 className="text-3xl font-semibold text-[var(--cap-ink)]">{title}</h1>
        <p className="text-[var(--cap-ink-soft)] leading-relaxed">{body}</p>
        {sessionId && route === "success" ? (
          <p className="text-xs text-[var(--cap-ink-soft)] break-all">
            Session reference: {sessionId}
          </p>
        ) : null}
        {route === "success" && billingConfigured() ? (
          <div className="space-y-2 text-left">
            <label className="block text-sm text-[var(--cap-ink-soft)]">
              Email used at checkout (to check webhook entitlement)
              <input
                type="email"
                className="mt-1 w-full rounded border border-[var(--cap-ink-soft)]/30 bg-transparent px-3 py-2 text-[var(--cap-ink)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            {pollNote ? (
              <p className="text-sm text-[var(--cap-ink)]">{pollNote}</p>
            ) : null}
            {access ? (
              <p className="text-xs text-[var(--cap-ink-soft)]">
                status={access.subscription_status} · active=
                {String(access.entitlementActive)} · source={access.source}
              </p>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={leaveBilling}
          className="inline-flex items-center justify-center rounded-md bg-[var(--cap-ink)] text-[var(--cap-surface,white)] px-4 py-2 text-sm font-medium"
        >
          Back to Harbor
        </button>
      </div>
    </div>
  );
}
