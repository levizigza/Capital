# Tracking & rejection taxonomy

## Events to log (every offer exposure)

| Field | |
|-------|--|
| `offer_id` | e.g. OFFER_FOUNDING_FAMILY |
| `offer_shown` | yes + channel (call, email, page) |
| `segment` | S1 / S2 / S3 / … |
| `price` | amount + currency shown |
| `payment_structure` | founding / one-time / monthly / annual / paid_pilot |
| `conversion` | paid \| committed_pilot \| declined \| deferred |
| `rejection_reason` | code below (required if not paid) |
| `retention` | day-2 return / still active at day 14 / 30 |
| `refund` | yes/no + reason |
| `usage` | activated signature loop? islands touched |
| `gross_margin` | price − incentives − refunds − payment fees (approx OK early) |

Log in `RESULTS.md` and/or `src` event append (jsonl).

---

## Rejection reason codes

When someone declines, assign **one primary** code using evidence — not vibe.

| Code | Use when |
|------|----------|
| **NO_NEED** | No recurring money-teaching problem; “we’re fine” |
| **LOW_TRUST** | Skeptical of product/company/privacy; wants proof, references, certifications |
| **WRONG_CUSTOMER** | Not the buyer; kid-only; teacher without budget; wants adult fintech |
| **WRONG_OFFER** | Wants rails, LMS, multiplayer, or different bundle — price secondary |
| **PRICE_TOO_HIGH** | Value understood, alternatives compared, still won’t pay at this number |
| **UNCLEAR_VALUE** | Doesn’t get what they receive / outcome; confused after pitch or play |
| **NO_URGENCY** | Agrees it might help “someday”; no trigger to buy now |

### Hard rule

**Never** conclude `PRICE_TOO_HIGH` solely because somebody says no.

Require at least one of:

- They articulate the outcome correctly **and** still refuse the number, or  
- They compare to a paid alternative’s price, or  
- They accept the offer shape but ask for a lower number while affirming need/urgency  

If they say “too expensive” but also “I don’t get what it does,” code **UNCLEAR_VALUE** (or dual-tag secondary).

---

## Conversion definitions

| conversion | Meaning |
|------------|---------|
| paid | Money captured via approved mechanism |
| committed_pilot | Signed pilot scope + payment terms (invoice OK) |
| declined | Explicit no |
| deferred | Follow-up date set |

---

## Learning questions (review weekly)

1. Which rejection code dominates?  
2. Did founding users activate + retain?  
3. Is margin positive after incentives/refunds?  
4. Ready to promote an offer to sales-copilot `APPROVED_SKUS`?  
