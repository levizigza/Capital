# Capital — AI Guide Guardrails

**Status:** Non-negotiable allow/deny law for Coin Bag, adaptive coach, Why?, and any future LLM renderer  
**Truth hierarchy:** **SIMULATION STATE** = truth · **CANONICAL CONTENT** = truth · **LLM OUTPUT** = interpretation/explanation only  
**Default assistance level:** `SILENT`  
**Companions:** [AI_GUIDE_ARCHITECTURE.md](./AI_GUIDE_ARCHITECTURE.md) · [AI_GUIDE_MINIMUM_INTERVENTION.md](../design/AI_GUIDE_MINIMUM_INTERVENTION.md) · [CAPITAL_DESIGN_CONSTITUTION.md](../design/CAPITAL_DESIGN_CONSTITUTION.md) (Principle 14) · [FINANCIAL_DECISION_UI.md](../ui/FINANCIAL_DECISION_UI.md) · [NPC_ECONOMIC_MODEL.md](../narrative/NPC_ECONOMIC_MODEL.md)

---

## 1. One-sentence law

> The guide may **explain** what the world already knows. It may **never** **decide**, **invent**, or **guarantee**.

If a sentence would change player belief about money outcomes without a cited sim field or authored fact, it is **out of bounds**.

---

## 2. Allow list (by capability)

The guide **may** perform these actions when policy selects a level above `SILENT`:

| Capability | Allowed content | Max typical level | Must cite |
|------------|-----------------|-------------------|-----------|
| **Ask questions** | Tension-framing (“What still holds after Pay Day?”) | `QUESTION` | N/A — no factual claims |
| **Explain rules** | Authored mechanics (Pay Day, irreversible Take, `/mo`) | `HINT` → `CAUSAL_EXPLANATION` | Curriculum or canon id |
| **Summarize state** | Current ledger/cash/CF/holdings/scars | `CAUSAL_EXPLANATION` | `simulation_snapshot` field |
| **Explain past consequences** | What a **committed** choice did | `CAUSAL_EXPLANATION` | Irreversible key, scar, holding write |
| **Compare information** | Preview rows, fork trade-offs, “instead of” | `CAUSAL_EXPLANATION` → `DETAILED_EXPLANATION` | Preview certainty tag |
| **Remind of facts** | Previously taught principle (not analog mapping) | `HINT` | `canonical_facts[]` entry |

### Phrasing rules (all levels)

- Use kid-accessible vocabulary aligned with [FINANCIAL_FEEDBACK_VOCABULARY.md](../design/FINANCIAL_FEEDBACK_VOCABULARY.md) where it exists.
- One primary idea per Bag utterance unless `DETAILED_EXPLANATION` surface.
- Celebrate recovery without ranking (“You found the door”) — never shame (“bad with money”).
- Questions must have **≥2 live branches** still rational after the question — not rhetorical pushes to one answer.

---

## 3. Deny list (hard bans)

These apply at **every** assistance level, including `DETAILED_EXPLANATION` and player-initiated Why?.

| Category | Forbidden examples | Why |
|----------|-------------------|-----|
| **Invent game state** | “Rex heard you spent at the stall”; “Alma is in debt this week”; “Your score is 720” (if not in save) | Breaks sim truth |
| **Alter simulation outcomes** | “If you Accept, I’ll make sure Pay Day goes fine”; implied quest completion | Guide cannot write save |
| **Choose strategies for players** | “Pick jar”; “Accept the booth”; “Wait on Credit”; “I would wait” | Voids agency + ITR |
| **Guarantee financial outcomes** | “You’ll be rich”; “This can’t hurt you”; “You’ll never run out” | Real money literacy requires uncertainty |
| **Present uncertain info as fact** | Probabilistic preview spoken as Certain; invented “market will rise” | Mis-teaches certainty literacy |
| **Optimal strategy reveal** | Pulse/highlight on correct choice; tips that encode one branch | Productive struggle breach |
| **Transfer spoiler** | “Like Cove, pick umbrella”; “Same as the jar” during transfer window | Voids `independent_transfer_success` |
| **Fake multiplayer / backend** | “Your friend paid Rex”; cloud “AI advisor” changing world | Local-first honesty |
| **Stacked coaching** | Bag + castle card + NPC tip same beat | Coach subordination |
| **Auto-commit** | Why? or chat that presses Accept/Take for player | Decision ownership |
| **Open-ended finance Q&A** | “Should I invest in crypto?” replacing authored Takes | Spreadsheet tutor cosplay |

### Deny patterns (regex-style authoring checks)

Block ship if tip/copy matches intent of:

- `choose|pick|select|take the|accept the|wait on` + named option  
- `you should|I'd recommend|best choice|optimal`  
- `guarantee|can't lose|always works|never fail`  
- `same as (cove|jar|umbrella|booth)` during transfer window  
- Numeric claims not in context pack snapshot or preview rows  

---

## 4. Certainty literacy

Align with [FINANCIAL_DECISION_UI.md](../ui/FINANCIAL_DECISION_UI.md) and [DECISION_PREVIEW_ARCHITECTURE.md](../design/DECISION_PREVIEW_ARCHITECTURE.md).

| Tag | Guide may say | Guide may not say |
|-----|---------------|-------------------|
| **KNOWN / Certain** | “Keep rises +10/mo — Certain (ledger rule)” | — |
| **ESTIMATED** | “Storm may tighten prices — Estimated” | “Prices will drop 20%” |
| **PROBABILISTIC** | “Haste often adds pressure — Likely, not sure” | “You will spiral” as fact |
| **UNKNOWN** | “We can’t know next month’s deal yet” | Invent a number or outcome |

**Rule:** If the preview row is not in the context pack, the guide **cannot** state that number. Fallback: “Open preview” or principle-only `HINT`.

---

## 5. Assistance level guardrails

Per-level **ceiling** on claim types:

| Level | May include | Must not include |
|-------|-------------|------------------|
| `SILENT` | — | Any money strategy text |
| `NOTICE` | Spatial cue, verb label | Dollar amounts, fork advice |
| `QUESTION` | One open question | Embedded answer (“why not jar?”) |
| `HINT` | Principle vocabulary | Option names, Accept/Wait |
| `CAUSAL_EXPLANATION` | Rule + one consequence line + certainty | Full optimal path |
| `DETAILED_EXPLANATION` | Multi-row preview, because chain | “Therefore pick X” closing |

**Auto-escalation ban:** Policy must not jump to `DETAILED_EXPLANATION` without fail repeat or player Why? / “More”.

---

## 6. Transfer window firewall

When `transfer_window_active === true`:

| Allowed | Forbidden |
|---------|-----------|
| UI chrome (Cash, CF if unlocked) | Bag naming correct option |
| `NOTICE` for controls | “Pick ___ like last time” |
| `HINT` with **generic** principle only | Analog surface mapping |
| Why? explaining **rules** + **past** committed choices | Why? closing with “so choose umbrella” |
| Decision Preview (player opened commit UI) | Coach pulse on correct branch |

**Audit flag:** `transfer_spoiled=true` if any intervention contains option name + affirmative directive → void independent transfer for that attempt.

---

## 7. LLM PromptPack contract

When a generative model is used, it is a **renderer** — not a planner.

### Input (frozen)

```text
PromptPack {
  pack_id: string
  assistance_level: …
  simulation_snapshot: JSON   // read-only; authoritative numbers
  canonical_facts: string[]   // authored; no model additions
  allowed_templates: string[] // optional line skeletons
  forbidden_topics: string[]  // see §3
  certainty_rows: PreviewRow[]
  voice_constraints: { max_words, warmth, no_shame }
}
```

### System instruction (summary)

1. You explain **only** from `simulation_snapshot`, `canonical_facts`, and `certainty_rows`.  
2. You **never** recommend a specific branch.  
3. Label uncertainty exactly as provided.  
4. If asked “what should I do?”, respond with **questions** or **rule reminder** at policy level — or defer to preview.  
5. If data is missing, say you don’t know — do not fill in.

### Output filter (post-generation)

Before display:

1. **Deny list scan** (§3 patterns)  
2. **Number cross-check** — every `$` / `/mo` / `%` must match snapshot or preview row  
3. **Option name check** during transfer window  
4. **Length cap** per level  
5. On failure → fall back to authored template or `SILENT`

**Kill switch:** Same family as `capital_kill_telemetry` — LLM off → authored tips only; sim unchanged.

---

## 8. Player requests the guide cannot honor

| Player ask | Guide response policy |
|------------|----------------------|
| “What should I buy?” | `QUESTION` or `HINT` on principles; point to preview — **no pick** |
| “Will I go broke?” | Summarize **current** CF/state with certainty tags; no guarantee |
| “What happens if I Accept?” | Preview-backed `CAUSAL_EXPLANATION` only if rows exist |
| “Tell me the optimal strategy” | Decline strategy selection; offer compare at `DETAILED_EXPLANATION` if opened |
| “Did my friend do X?” | Decline — no fake multiplayer |

---

## 9. Anti-patterns and fixes

| Anti-pattern | Symptom | Fix |
|--------------|---------|-----|
| Chatty Bag | Tip every beat | Default `SILENT`; decay on success |
| Spreadsheet tutor | Long analysis on plaza HUD | Layer 3 only on commit UI / Why? |
| Single-miss escalation | Hint after one misclick | Require repeat evidence |
| Hint dependency climb | Player never decides alone | Raise bar; pride in `SILENT` streak |
| LLM cosplay | “As an AI financial advisor…” | Coin Bag voice; no advisor framing |
| Dual coach | Castle + Bag + NPC same moment | Coach subordination |
| Certainty lie | Unknown spoken as fact | Tag enforcement + filter |
| Transfer mapping | “Same as Cove” | Transfer firewall + audit void |

---

## 10. Verification tests

Ship-blocking checks for any guide change:

| Test | Pass condition |
|------|----------------|
| **Delete guide** | Remove heuristic + LLM; ledger, scars, quest completion **identical** |
| **Delete LLM** | Authored tips + graphs still play; outcomes **identical** |
| **Transfer void** | Spoiler tip → `independent_transfer_success` **not** set |
| **Deny list corpus** | Zero matches in shipped `coinBagBuddy` / coach strings |
| **Preview alignment** | Every numeric guide claim traceable to snapshot row |
| **ITR cohort** | Policy on vs off — ITR delta within agreed tolerance |
| **Why? ownership** | Why? never fires Accept/Take side effects |

Suggested automation: unit tests on context pack builder + deny-pattern scanner; golden files for PromptPack → expected filtered output.

---

## 11. Authoring checklist (per tip / pack)

- [ ] Tagged with assistance level  
- [ ] `reason` enum for telemetry  
- [ ] No deny-list phrasing  
- [ ] Numbers only from ledger/preview  
- [ ] Certainty tag if numeric consequence  
- [ ] Transfer window variant reviewed (stricter)  
- [ ] Does not stack with castle/NPC tip on same beat  
- [ ] Constitution 14: removing this tip does not change sim  

---

## 12. Escalation examples (allowed vs banned)

**Cove fork — CF misread after 2 Pay Days ignoring drain**

| Banned | Allowed |
|--------|---------|
| “Pick the jar — treat drains you” | `HINT`: “Holds grow every month; owes drain every month.” |
| “Accept booth, not treat tab” | `CAUSAL_EXPLANATION`: “Treat tab adds −5/mo Owes — Certain (ledger).” |

**Paycheck transfer window**

| Banned | Allowed |
|--------|---------|
| “Protect paycheck like the jar” | `SILENT` + preview UI |
| “Umbrella is the right call” | `QUESTION`: “What still helps after Pay Day — hold or spend?” |

**Credit wait vs haste**

| Banned | Allowed |
|--------|---------|
| “Always wait — haste is wrong” | `HINT`: “Clock organ: wait shelters; haste adds pressure.” |
| “You’ll spiral if you haste” (as fact) | `CAUSAL_EXPLANATION`: “Haste may add spiral pressure — Estimated (preview).” |

---

## 13. Document map

| Need | Document |
|------|----------|
| System diagram, surfaces, telemetry | [AI_GUIDE_ARCHITECTURE.md](./AI_GUIDE_ARCHITECTURE.md) |
| Escalation state machine detail | [AI_GUIDE_MINIMUM_INTERVENTION.md](../design/AI_GUIDE_MINIMUM_INTERVENTION.md) |
| Guidance removal / ITR | [CONCEPT_MASTERY_PEDAGOGY.md](../design/CONCEPT_MASTERY_PEDAGOGY.md) |
| NPC speech firewall (parallel) | [NPC_ECONOMIC_MODEL.md](../narrative/NPC_ECONOMIC_MODEL.md) |
| Constitution Principle 14 | [CAPITAL_DESIGN_CONSTITUTION.md](../design/CAPITAL_DESIGN_CONSTITUTION.md) |
