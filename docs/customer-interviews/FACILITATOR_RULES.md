# Facilitator rules

## Do

- Ask about **specific past episodes** (“the last time…”, “walk me through…”).  
- Stay in **PROBLEM DISCOVERY** until the guide says you may open PRODUCT REACTION.  
- Capture **customer language** verbatim (short quotes).  
- Record decision-maker and who pays separately.  
- Update the **Customer Evidence** DB the same day (`evidence/`).

## Do not

- Pitch Capital’s features, fantasy, or roadmap.  
- Ask leading questions (“Wouldn’t this be useful?”, “Would you use Capital?”, “Would you pay $10?”).  
- Anchor price (“Our price is… would you pay that?”).  
- Defend or explain the product during PROBLEM DISCOVERY.  
- Update `docs/game-pillars.md` ICP tables from a single interview.  
- Store child legal names, school IDs, income exact figures, or addresses.

## Allowed clarifiers

| OK | Not OK |
|----|--------|
| “What did you do next?” | “Did you wish you had a game like Capital?” |
| “What made that hard?” | “Don’t you hate lectures?” |
| “What have you already tried?” | “Have you tried Greenlight? It’s worse, right?” |
| “What did that cost you — time, money, stress?” | “Would you pay $40/year?” |
| “Who decided to buy that?” | “You’re the buyer, right?” |

## Session shape (45 min default)

| Block | Time | Mode |
|-------|------|------|
| Warm + consent | 3 min | — |
| **PROBLEM DISCOVERY** | 25–30 min | No Capital |
| Break / optional | 2 min | — |
| **PRODUCT REACTION** (optional) | 10–15 min | Only if scheduled; still no pitch |
| Thanks + incentive | 2 min | — |

If time is short: **cut PRODUCT REACTION**, never cut discovery.

## Same-day closeout

1. Fill `INTERVIEW_NOTES_TEMPLATE.md` → save as `evidence/I-YYYYMMDD-NN.md`.  
2. Append row to `evidence/EVIDENCE_INDEX.md`.  
3. Add structured record via `src/business/customerEvidence` seed update **or** JSON entry in `evidence/records.jsonl`.  
4. Check `ICP_UPDATE_GATE.md` — almost always **no ICP change**.
