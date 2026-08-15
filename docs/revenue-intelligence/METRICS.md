# Metrics

Computed per acquisition `sourceId` when data permits; otherwise `n/a`.

| Metric | Formula |
|--------|---------|
| Prospects | count `DISCOVERED` |
| Responses | count `REPLIED` |
| Interviews | count `INTERVIEWED` |
| User tests | count `USER_TEST` |
| Qualified | count `QUALIFIED` |
| Offers | count `OFFERED` |
| Payments | count `PAID` |
| Activation | count `ACTIVATED` |
| Retention | count `RETAINED` |
| Revenue | sum `revenueUsd` |
| Cost per lead (CPL) | spend / prospects |
| CAC | spend / payments |
| Revenue per customer | revenue / payments |
| Gross profit | revenue − (payments × variableCostPerPaidUsd) |
| Contribution profit | gross profit − acquisition spend |
| CAC payback | CAC / (revenuePerCustomer − variableCostPerPaid) |
| Retention (of paid) | retained / payments |

**Spend** comes from `ledger.costs[]` for that source (same `weekOf` window as the report).

## Ranking policy

Sources / segments / offers sort by:

1. `RETAINED`
2. `PAID`
3. `ACTIVATED`
4. `QUALIFIED` / interviews  
…never by prospects alone.
