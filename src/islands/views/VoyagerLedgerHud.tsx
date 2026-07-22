import {
  HARBOR_ESCAPE_STREAK,
  HARBOR_ESCAPE_TARGET,
  harborEscapeProgress,
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
 * Cashflow statement HUD — the north star of Fortune Grind.
 */
export function VoyagerLedgerHud({ ledger, compact }: Props) {
  const income = totalIncome(ledger);
  const expenses = totalExpenses(ledger);
  const cf = netCashflow(ledger);
  const cfPositive = cf >= 0;
  const escape = harborEscapeProgress(ledger);

  if (compact) {
    return (
      <div
        className="cap-card flex items-center gap-2 px-2.5 py-1.5"
        title={
          escape.escaped
            ? "Harbor escaped — cashflow goal cleared!"
            : `Escape: $${HARBOR_ESCAPE_TARGET}+/mo for ${HARBOR_ESCAPE_STREAK} Pay Days (${escape.streak}/${escape.needed})`
        }
        data-testid="voyager-ledger-hud"
      >
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--cap-ink-soft)]">
          Cashflow
        </span>
        <span
          className={`font-display text-base font-black ${cfPositive ? "text-emerald-700" : "text-rose-700"}`}
        >
          {cfPositive ? "+" : ""}
          {cf}
          <span className="text-[0.65rem] font-bold text-[var(--cap-ink-soft)]">/mo</span>
        </span>
        {escape.escaped ? (
          <span className="text-[0.65rem] font-black text-emerald-700">Freed!</span>
        ) : (
          <span className="text-[0.6rem] font-bold text-[var(--cap-ink-soft)]">
            🎯{escape.streak}/{escape.needed}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="cap-card min-w-[11rem] px-3 py-2" data-testid="voyager-ledger-hud">
      <div className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--cap-ink-soft)] mb-1">
        Voyager Ledger
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-xs font-semibold">
        <span className="text-[var(--cap-ink-soft)]">Income</span>
        <span className="text-emerald-700">+{income}/mo</span>
        <span className="text-[var(--cap-ink-soft)]">Expenses</span>
        <span className="text-rose-700">−{expenses}/mo</span>
        <span className="font-black text-[var(--cap-ink)]">Cashflow</span>
        <span className={`font-black ${cfPositive ? "text-emerald-700" : "text-rose-700"}`}>
          {cfPositive ? "+" : ""}
          {cf}/mo
        </span>
      </div>
      <div className="mt-1.5 rounded-lg border border-[var(--cap-ink)]/10 bg-[var(--cap-paper)]/80 px-2 py-1 text-[0.65rem] font-semibold">
        {escape.escaped ? (
          <span className="text-emerald-700">🏆 Harbor escaped — cashflow is free!</span>
        ) : (
          <span className="text-[var(--cap-ink-soft)]">
            Escape goal:{" "}
            <span className="font-black text-[var(--cap-ink)]">${HARBOR_ESCAPE_TARGET}+/mo</span> for{" "}
            {HARBOR_ESCAPE_STREAK} Pay Days · streak{" "}
            <span className="font-black text-[var(--cap-tide)]">
              {escape.streak}/{escape.needed}
            </span>
          </span>
        )}
      </div>
      {ledger.holdings.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {ledger.holdings.slice(0, 4).map((h) => (
            <span
              key={h.id}
              className="rounded-full border border-[var(--cap-ink)]/15 bg-[var(--cap-paper)] px-1.5 text-[0.6rem] font-bold"
              title={`${h.name}: ${h.kind === "asset" ? "+" : "−"}${h.monthlyAmount}/mo`}
            >
              {h.icon}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
