# Lifecycle stages

Ordered. A person “reaches” a stage when `ledger.people[].stages[STAGE]` is set (ISO timestamp or `true`).

| Stage | Meaning |
|-------|---------|
| `DISCOVERED` | Identified as a prospect (list, intro, inbound) |
| `CONTACTED` | Outbound or reply-ready touch sent |
| `REPLIED` | Human response received |
| `INTERVIEWED` | Problem/discovery interview completed |
| `USER_TEST` | Moderated or structured product test |
| `QUALIFIED` | Fits ICP + problem/urgency/WTP signal |
| `OFFERED` | Concrete offer presented |
| `CHECKOUT_STARTED` | Stripe Checkout session opened |
| `PAID` | Trusted payment (webhook-backed when billing live) |
| `ACTIVATED` | Hit product activation (e.g. Harbor→Cove signature moment) |
| `RETAINED` | Return engagement per policy (e.g. D7) |
| `REFERRED` | Brought another prospect |

Conversion is measured **between consecutive stages**. Outcome stages (`PAID`, `ACTIVATED`, `RETAINED`) outrank top-of-funnel volume when ranking sources/segments/offers.
