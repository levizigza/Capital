# Revenue Intelligence (Capital)

Connects the full customer lifecycle and refuses vanity optimization.

```
DISCOVERED → CONTACTED → REPLIED → INTERVIEWED → USER_TEST → QUALIFIED
  → OFFERED → CHECKOUT_STARTED → PAID → ACTIVATED → RETAINED → REFERRED
```

**North star:** retained paying customers.  
Example rule encoded in code: *100 visitors → 10 retained payers* beats *10,000 visitors → 0 retained*.

## Quick start

```bash
npm run revenue:test
npm run revenue:report
```

Edit `docs/revenue-intelligence/data/ledger.json`, then regenerate `WEEKLY_REPORT.md`.

## Documents

| Doc | Purpose |
|-----|---------|
| [LIFECYCLE.md](./LIFECYCLE.md) | Stage definitions |
| [METRICS.md](./METRICS.md) | CPL, CAC, payback formulas |
| [WEEKLY_REPORT.md](./WEEKLY_REPORT.md) | Generated weekly callouts + **one** experiment |
| [data/ledger.json](./data/ledger.json) | Observed pipeline (no invented revenue) |

## Rules

1. Never optimize an upstream stage in isolation.
2. Only **one** highest-priority revenue experiment per week.
3. Missing data → `n/a`, not guesses.
4. Stripe amounts stay in Stripe/price ids — ledger may store observed `revenueUsd` after paid events only.
