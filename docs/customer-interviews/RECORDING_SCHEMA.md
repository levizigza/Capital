# Recording schema

Every interview writes these fields. Prefer **observed/stated behavior** over analyst spin.

| Field | What to capture | Example quality bar |
|-------|-----------------|---------------------|
| **pain** | Problem in their words + situation | “Kid melts down in Target checkout” not “needs finlit” |
| **frequency** | How often, in their units | “Weekly store trips”; “once a semester unit” |
| **urgency** | Why now / why not | “Starting allowance next month”; “No rush” |
| **existing_alternatives** | What they use or used | Greenlight, jars, YouTube, lectures, NGPF… |
| **money_currently_spent** | Actual $ or “$0 / unpaid time” | “$5/mo card”; “$0 — library books” |
| **decision_maker** | Who chooses / who pays | “I buy; partner vetoes subscriptions” |
| **switching_barriers** | What keeps them on status quo | Setup time, privacy, “kid won’t play,” district IT |
| **desired_outcome** | Future state they named | “Fewer fights about toys”; “unit I can check off” |
| **customer_language** | Verbatim phrases | Quote bank (3–10 short lines) |

Also store metadata:

| Meta | |
|------|--|
| `interview_id` | `I-YYYYMMDD-NN` |
| `participant_id` | `P-A1-01` (align recruitment) |
| `segment` | S1…S8 |
| `channel` | how recruited |
| `phases_completed` | `problem_only` \| `problem_and_product` |
| `hypotheses_touched` | H- / IH- ids |
| `evidence_strength` | single episode / pattern-in-life / paid-proof |
| `pii_note` | confirm no forbidden fields stored |

## Product reaction extras (only if phase ran)

| Field | |
|-------|--|
| `what_they_thought_it_was` | |
| `relevant_to_their_pain` | yes / partial / no — with quote |
| `ignored` | what they skipped |
| `unexpectedly_valued` | what they leaned into |
| `volunteered_wtp_language` | raw quote only; never prompted $ |

## Anti-fields (do not invent)

- `would_use_capital: true`  
- `score: 10/10 love it`  
- Canonical ICP rewrite notes inside a single interview file  

ICP changes go only through `ICP_UPDATE_GATE.md`.
