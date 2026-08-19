# Capital — Player History System

**Status:** Design specification  
**Purpose:** Make each Capital playthrough tell a **personal money story** — readable after the fact, grounded in consequential decisions.  
**Law:** Record meaning, not noise. **Do not generate narrative for trivial actions.**  
**Companions:** `CAUSAL_TIME_SYSTEM.md` · `MECHANICS_NARRATIVE_MATRIX.md` · `DECISION_AUDIT.md` · `FINANCIAL_FEEDBACK_VOCABULARY.md` · `UI_LAYER_AUDIT.md` · existing `harborScars` / `irreversibleChoices` / ledger events / `decisionTimeline.ts`

**Player promise:** Open Memory (or Chronicle) and see *your* arc — not a dump of every coin tick.

**Prototype policy:** Spec only until approved; prefer extending Plinth/Memory over a new currency or XP log.

---

## 1. Design goals

1. **Personal story** — two saves with different Takes/deals/crises read as different lives.  
2. **Causal readability** — entries chain with BECAUSE links (`CAUSAL_TIME_SYSTEM.md`).  
3. **Myth voice** — kid-safe, organ-true lines; never debug ids in UI.  
4. **Trivial exclusion** — walking, poking toys, opening Settings, failed quiz retries, cosmetic pets do **not** mint history.  
5. **Layer 3 surface** — history is DETAIL_ON_DEMAND (Plinth / Chronicle), not plaza HUD spam (`UI_LAYER_AUDIT.md`).

---

## 2. What counts as history (include)

An action may mint a **History Event** only if it matches at least one **chapter kind** below **and** passes the meaning gate (§3).

| Kind | Player-facing chapter label | Capital sources (today / planned) |
|------|----------------------------|-----------------------------------|
| `major_purchase` | Major purchase | Harbor deal Accept (asset); plaza pass; **not** tortoise pet / cheap capsule unless cost ≥ threshold |
| `failed_venture` | Setback | Minigame fail that **costs lasting state** ( UNKNOWN rare); deal that immediately precedes streak break; treat Take when framed as venture — prefer scar + CF loss |
| `successful_venture` | Venture that held | Asset deal that survives N Pay Days; Cove jar Take; Soft Beat→strong Take (optional link) |
| `debt_crisis` | Debt pressure | Liability add (Debt Trap / treat tab); CF drain + storm band; Credit haste when weather tightens |
| `investment` | Investment | Interest Jar / booth / lemonade Accept; Cove jar hold |
| `career_change` | Path change | Spine Change clears (Cove / Paycheck / Credit Ordeal); Freedom Seal; **not** Outfitter look |
| `emergency` | Emergency | Bailout/shield use that blocked Collector; true EventDeck emergency if lasting; UNKNOWN until authored |
| `relationship` | Relationship | Piggy homecoming after scar; Family Witness stamp; **first** meaningful Talk that writes memory — not every chat |
| `financial_milestone` | Milestone | Freedom Seal; first $30 CF; Credit unlock sail; first Plinth scar; Change quest complete |
| `recovery` | Recovery | Streak resume after break; CF cross back to fair weather; liability offset by later asset; dignity path back to Take after fails |

Multiple kinds may tag one event (treat Take = `debt_crisis` + identity scar).

---

## 3. Meaning gate (exclude trivial)

Mint history **only if** ≥1 of:

| Gate | Example |
|------|---------|
| **Irreversible** | Spine Take key written |
| **Scar / plaque** | `addScar` with kind `plaque` (or digression scar if shelf-significant — see throttle) |
| **Ledger lasting** | Holding add/remove; Freedom escape; streak break or seal |
| **Chapter door** | Island Change complete; Credit unlocked |
| **Named crisis** | Liability forced; storm feedback loop from haste scar |
| **Human stamp** | Witness reaction; Piggy homecoming graph completed after pending |

**Never mint for:**

- WASD / walk pad / camera  
- Soft Beat dismiss alone  
- Shop browse without buy  
- Cosmetic Outfitter / cast recolor  
- Capsule buys below **major_purchase threshold** (suggest: cost &lt; 40 **or** non-CF items — tune in prototype)  
- Mastery quiz wrong answers / retries  
- Map open / Esc / mute toggle  
- FTUE practice fork (no save irreversible)  
- Every Pay Day with no state novelty (use milestone/recovery only on streak edge or seal)  
- Series-lead Talk with no scar/CF reference  

**Throttle digression scars:** at most one `npc_tone` history line per island chapter unless it pairs into digression shelf completion (then one “curiosity closed” milestone).

---

## 4. History event schema (internal)

```text
HistoryEvent {
  id: string                    // stable
  at: ISO | payday_index
  kind: HistoryKind | HistoryKind[]
  decision_id?: string          // CausalDecision / irreversible key
  label_kid: string             // Plinth-safe title
  summary_kid: string           // one sentence
  organ?: coin|clock|spiral|memory
  certainty_of_links: CERTAIN|ESTIMATED  // for because edges shown
  state_snapshot_light?: {      // optional, for chronicle math
    cf?: number
    pouch?: number
    streak?: number
    weather?: string
  }
  because_of?: string[]         // prior HistoryEvent ids
  led_to?: string[]             // filled when later events resolve
  themes?: (relationship|conflict|opportunity|loss|recovery|status|identity)[]
  surface: plinth|chronicle|share_footnote|piggy_only
}
```

Align `label_kid` with scar labels / deal names already in content.

---

## 5. Event chains → readable player history

### 5.1 Chain assembly

History is not a flat chat log. The system builds **arcs**:

```
Event A (decision) ──led_to──► Event B (world/Pay Day) ──led_to──► Event C (Piggy/milestone)
```

Examples:

1. **Jar arc:** Cove jar Take → CF +5 → Pay Days → Freedom streak tick → Seal milestone → Piggy change beat  
2. **Treat recovery:** Treat Take → obligation → storm EST. → Wait + small jar deal → streak resume → recovery entry  
3. **Booth arc:** Accept booth → major_purchase/investment → Pay Day cites booth → successful_venture after 3 Pay Days  

`led_to` edges come from causal SCHEDULES/FIRES/BECAUSE (`CAUSAL_TIME_SYSTEM.md`), not from an LLM.

### 5.2 Readable chronicle format (player-facing)

**Chronicle view** (Layer 3 — Memory Plinth tab or “Your Fortune Thread”):

```
Your Fortune Thread
────────────────────
Chapter · Coin
  “Jar before treat.”
  Harbor kept it. Monthly keep rose.
  ↓
  Pay Days grew quieter.
  ↓
  Freedom Seal — you escaped the grind.

Chapter · Clock
  …

Still open
  Treat tab still owes each month.   (obligation, if active)
```

Rules:

- Group by **organ chapter** or **time** (player toggle) — default organ for mural law.  
- Show **summary_kid** only; collapse `state_snapshot` behind “Numbers” DETAIL.  
- Active obligations appear under **Still open** until cleared.  
- Max ~12 headline events on first screen; older arcs accordion.

### 5.3 Voice

Templates (data, not free generation):

| Pattern | Template |
|---------|----------|
| Take | “You chose “{label}.” Harbor kept it.” |
| Deal | “You bought {name}. It holds +{n}/mo.” |
| Crisis | “Debt pressed — {label}. The sky tightened.” |
| Recovery | “You climbed back — keep returned to fair.” |
| Milestone | “Milestone: {label}.” |
| Relationship | “Piggy named “{scar}.” / “{Witness} stamped {reaction}.” |
| Because | “This followed “{prior_label}.” |

**No generative novelization.** If a template can’t fill, don’t invent prose — omit or use UNKNOWN-honest “Harbor hasn’t finished this line.”

---

## 6. Mapping user categories → Capital

| Requested record | Capital mint rule |
|------------------|-------------------|
| major purchases | Asset deal Accept; high-cost shop with lasting unlock (plaza pass); thresholded |
| failed ventures | Streak break after spend Take or bad CF; optional failed lasting minigame; **not** every Retry |
| successful ventures | Asset held through N Pay Days; jar Take; Change clear |
| debt crises | Liability add; multi-Pay-Day drain + storm; Credit haste feedback |
| investments | Same as CF-positive asset accepts + jar |
| career changes | Spine Change + Freedom + Ordeal clear |
| emergencies | Authored emergency EventDeck lasting effects; Collector blocked by bailout |
| relationships | Piggy homecoming; Witness; (future) NPC memory only when scar-tied |
| financial milestones | Seal, first strong CF, doors unlocked, first plaque |
| recoveries | Explicit recovery detection (CF/weather/streak edge) |

---

## 7. Surfaces

| Surface | Role | Class |
|---------|------|-------|
| **Memory Plinth** | Primary: plaques already; add Chronicle tab / “Thread” | DETAIL_ON_DEMAND |
| **Piggy Talk** | Speaks latest arc sentence — not full history | CONTEXTUAL |
| **Share card footnote** | Optional one scar + one milestone | Social |
| **Family Room** | Household sees shared milestones (local) | Local social |
| **Settings export** | JSON history for parents/teachers — privacy safe ids | ADVANCED |
| Plaza HUD | **Never** dump history | — |

---

## 8. Integration with existing save data

| Existing | Role in history |
|----------|-----------------|
| `harborScars` | Seed events (`plaque` → identity/milestone; tone → throttled) |
| `irreversibleChoices` | Spine Take decisions |
| `voyagerLedger.holdings` + `recentEvents` | Investment/purchase/obligation; **filter** trivial coin spam from recentEvents |
| `harborEscaped` / streak | Milestones + recovery |
| `decisionTimeline` | Minigame session “why” — link into history only if lasting scar/CF |
| CausalDecision graph | Authoritative BECAUSE / led_to |

**Do not** dual-write conflicting stories. History **projects** from these sources + a small `playerHistory: HistoryEvent[]` ring (cap ~40) for derived arcs (successful_venture after N Pay Days).

---

## 9. Derivation jobs (internal, quiet)

Run on triggers — never as a player-visible “processing” story:

| Trigger | May append |
|---------|------------|
| `addScar` / irreversible | Take / relationship seed |
| `acceptDeal` | major_purchase / investment |
| Liability add | debt_crisis |
| Pay Day | milestone/recovery/venture-success counter; skip boring Pay Days |
| Freedom escape | financial_milestone |
| Weather band cross | optional crisis/recovery footnote (ESTIMATED voice) |
| Piggy homecoming complete | relationship |
| Witness stamp | relationship |
| Change quest complete | career_change |

---

## 10. Anti-patterns

| Anti-pattern | Why |
|--------------|-----|
| Log every coin | Drowns personal story |
| LLM autobiography | Unreliable; anti “AI for AI’s sake” |
| History as XP timeline | Wrong fantasy |
| Auto-open Chronicle after every deal | Breaks presence / cinema |
| Recording Outfitter as career_change | Lies |
| Quiz pass as financial_milestone | School STOP (`MECHANICS_NARRATIVE_MATRIX`) |

---

## 11. Phased delivery

| Phase | Deliverable |
|-------|-------------|
| **A** | Spec bind: map scars + irreversibles + Freedom → chronicle read model (docs + pure functions) |
| **B** | Plinth “Fortune Thread” UI reading existing scars/Seals only |
| **C** | Deal + liability + streak recovery events |
| **D** | led_to chains + Still open obligations + export |

Align A–B with Memory Plinth deepen; C with Living Cashflow Commit.

---

## 12. Success criteria

1. Two playthroughs (jar vs treat) produce visibly different Threads.  
2. Cold player can retell their story from Chronicle in &lt;1 minute.  
3. Walk/poke/mute leave **zero** new entries.  
4. Every headline event answers: which decision, what changed, who/what answered (Harbor/Piggy/sky).  
5. No generative filler sentences.

---

## 13. Open questions

- Exact `major_purchase` coin threshold  
- N Pay Days to promote investment → successful_venture  
- Whether digression scars appear in Thread by default or under “Side footprints”  
- Teacher export format vs Family Room share
