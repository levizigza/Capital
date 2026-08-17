import {
  HARBOR_ESCAPE_STREAK,
  HARBOR_ESCAPE_TARGET,
  harborEscapeProgress,
  isSealChasing,
  netCashflow,
  totalExpenses,
  totalIncome,
  type VoyagerLedger,
} from "../voyagerLedger";

type Props = {
  ledger: VoyagerLedger;
  compact?: boolean;
};

/**
 * Cashflow statement HUD — north star after Cove Change.
 * Seal-chase chrome only when Freedom is actually in play (same gate as plaza chip).
 */
export function VoyagerLedgerHud({ ledger, compact }: Props) {
  const income = totalIncome(ledger);
  const expenses = totalExpenses(ledger);
  const cf = netCashflow(ledger);
  const cfPositive = cf >= 0;
  const escape = harborEscapeProgress(ledger);
  const chaseOn = isSealChasing(ledger);

  if (compact) {
    return (
      <div
        className="cap-card flex items-center gap-2 px-2.5 py-1.5"
        title={
          escape.escaped
            ? "Harbor escaped — cashflow goal cleared!"
            : chaseOn
              ? `Escape: $${HARBOR_ESCAPE_TARGET}+/mo for ${HARBOR_ESCAPE_STREAK} Pay Days (${escape.streak}/${escape.needed})`
              : "Cashflow — Seal chase opens after first deals or strong CF"
        }
        data-testid="voyager-ledger-hud"
        data-seal-chase={chaseOn ? "1" : "0"}
      >
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--cap-ink-soft)]">
          Cashflow
        </span>
        <span
          className="font-display text-base font-black text-[var(--cap-ink)]"
          aria-label={
            cfPositive
              ? `Cashflow keep plus ${cf} per month`
              : `Cashflow drain minus ${Math.abs(cf)} per month`
          }
          data-testid="voyager-ledger-cf"
        >
          {cfPositive ? "keep +" : "drain −"}
          {Math.abs(cf)}
          <span className="text-[0.65rem] font-bold text-[var(--cap-ink-soft)]">/mo</span>
        </span>
        {escape.escaped ? (
          <span className="text-[0.65rem] font-black text-[var(--cap-ink)]">Freed</span>
        ) : chaseOn ? (
          <span className="text-[0.6rem] font-bold text-[var(--cap-ink-soft)]">
            streak {escape.streak}/{escape.needed}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="cap-card min-w-[11rem] px-3 py-2"
      data-testid="voyager-ledger-hud"
      data-seal-chase={chaseOn ? "1" : "0"}
    >
      <div className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--cap-ink-soft)] mb-1">
        Voyager Ledger
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-xs font-semibold">
        <span className="text-[var(--cap-ink-soft)]">Income</span>
        <span className="text-[var(--cap-ink)]">+{income}/mo in</span>
        <span className="text-[var(--cap-ink-soft)]">Expenses</span>
        <span className="text-[var(--cap-ink)]">−{expenses}/mo out</span>
        <span className="font-black text-[var(--cap-ink)]">Cashflow</span>
        <span
          className="font-black text-[var(--cap-ink)]"
          data-testid="voyager-ledger-cf"
          aria-label={
            cfPositive
              ? `Cashflow keep plus ${cf} per month`
              : `Cashflow drain minus ${Math.abs(cf)} per month`
          }
        >
          {cfPositive ? "keep +" : "drain −"}
          {Math.abs(cf)}/mo
        </span>
      </div>
      {escape.escaped ? (
        <div className="mt-1.5 rounded-lg border border-[var(--cap-ink)]/10 bg-[var(--cap-paper)]/80 px-2 py-1 text-[0.65rem] font-semibold">
          <span className="text-[var(--cap-ink)]">Harbor escaped — cashflow is free</span>
        </div>
      ) : chaseOn ? (
        <div className="mt-1.5 rounded-lg border border-[var(--cap-ink)]/10 bg-[var(--cap-paper)]/80 px-2 py-1 text-[0.65rem] font-semibold">
          <span className="text-[var(--cap-ink-soft)]">
            Escape goal:{" "}
            <span className="font-black text-[var(--cap-ink)]">${HARBOR_ESCAPE_TARGET}+/mo</span> for{" "}
            {HARBOR_ESCAPE_STREAK} Pay Days · streak{" "}
            <span className="font-black text-[var(--cap-tide)]">
              {escape.streak}/{escape.needed}
            </span>
          </span>
        </div>
      ) : null}
      {ledger.holdings.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {ledger.holdings.slice(0, 4).map((h) => (
            <span
              key={h.id}
              className="rounded-md border border-[var(--cap-ink)]/15 bg-[var(--cap-paper)] px-1.5 py-0.5 text-[0.6rem] font-bold text-[var(--cap-ink)]"
              title={`${h.name}: ${h.kind === "asset" ? "keep +" : "drain −"}${h.monthlyAmount}/mo`}
            >
              {h.icon}{" "}
              {h.kind === "asset" ? `keep +${h.monthlyAmount}` : `drain −${h.monthlyAmount}`}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
