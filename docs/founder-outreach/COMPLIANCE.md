# Compliance (including Canadian CEM)

## Never auto-send

This agent does not transmit email, SMS, LinkedIn, or form posts.

## CASL (Canada’s Anti-Spam Legislation)

For **commercial electronic messages (CEM)** sent to or from Canada, or to Canadian recipients:

| Situation | Flag |
|-----------|------|
| Recipient is a Canadian org/person, or message is CEM under CASL | **`CASL_REVIEW_REQUIRED`** before send |
| US-only published `info@` with no known Canadian recipient, sender outside Canada | **`CASL_LIKELY_N/A`** — still do a quick counsel/self-check if founder is in Canada |
| Express consent already on file for this CEM type | **`CASL_CONSENT_ON_FILE`** (document proof) |
| Research interview ask with no sell CTA (still may be CEM if promotes business) | **`CASL_REVIEW_REQUIRED`** — do not assume “research” is exempt |

**Founder action:** Before any send marked `CASL_REVIEW_REQUIRED`, confirm consent basis (express/implied under CASL) or use non-CEM channel (e.g. in-person, posted form that isn’t email CEM).

This file is **not legal advice**.

## Other

- Use only **published** org contacts from lead cards.  
- No purchased lists.  
- No exaggerated product claims.
