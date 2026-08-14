# Capital — Complexity vs Depth

**Companion to:** [GAME_DESIGN_ECONOMY.md](./GAME_DESIGN_ECONOMY.md) · [GAME_DESIGN_LOOP.md](./GAME_DESIGN_LOOP.md) · [docs/iconic-path.md](./docs/iconic-path.md)  
**Formula:**  
`DESIGN VALUE ≈ (meaningful decisions + interactions + emergent possibilities) / (rules + UI burden + cognitive load)`

---

## Thesis

Strategic depth lives in ~six systems. Parallel meters, dual weather, RPG skill bars, and party-board chrome raise rule count without multiplying decisions.

**Keep:** Take → hush → Plinth → Share · Soft Beat · Walk/Talk/Carpet · Ledger/Freedom · pouch↔deals · Money Structures  
**Merge/cut:** Wealth ranks · XP chrome · boom/recession HUD · skillStats panel · (later) party board / ritual checklist

---

## Ranked systems

| System | R | D | I | E | Value | Action |
|--------|---|---|---|---|-------|--------|
| Signature Take → Plinth → Share / Soft Beat / day-2 | 5 | 1–2 | ~10 | High | **High** | KEEP |
| Ledger / Pay Day / Freedom | 7 | Many | ~6 | Med | **High** | KEEP |
| Pouch ↔ shop / deals / liabilities | 6 | Many | ~5 | Med | **High** | KEEP |
| Walk / Talk / Money Carpet | 3 | Med | Many | Med | **High** | KEEP |
| Money Structures + Soft Beat pads | 3 | Light | ~4 | Med | **High** | KEEP |
| Carpet / boat tiers | 3 | Med | ~3 | Low | **High** | KEEP (+ absorb wealth) |
| Ashore / FTUE | ≤7 prove | Teach | Boot | — | **Medium** | KEEP (don’t expand) |
| Era side shores | 3 | 1 meta | Map/music | Low | **Medium** | KEEP content only |
| Family Room (local) | 5 | Social | Studio/myth | — | **Medium** | KEEP local |
| Outfitter cosmetics | 3 | Low | Shop | Low | **Medium** | KEEP light |
| Stance (silent) | 1 | 0 HUD | Greetings | Low | **Medium→Low** | MERGE (no teach) |
| Mastery quizzes | 3 | Knowledge | Credit gate | Low | **Low** | Slim later |
| Capsules / board items | 8+ | Soft | Board | Low | **Low** | MERGE later w/ board |
| Daily ritual checklist | 8 | Checklist | Ledger | Low* | **Poor–Low** | Keep day-2 only later |
| Party board / seals / rivals | 15–25 | Dice-led | Ledger | Thin | **Poor–Low** | Radical merge later |
| skillStats panel | 3 bars | ~0 | Coach | Low | **Poor** | **CUT UI** (this PR) |
| Wealth ranks (∥ boat) | 7 labels | ~0 | HUD | None | **Poor** | **MERGE → carpet** (this PR) |
| XP / profile level | Accrue | ~0 | Toast | None | **Poor** | **DEMOTE chrome** (this PR) |
| Dual weather (economy.ts ∥ harborWeather) | 2 moods | ~0 macro | Split | Fight | **Poor** | **UNIFY → cashflow** (this PR) |

\*day-2 scar echo alone is High — checklist shell is Poor.

---

## Per-system questions (signature + poor)

### Signature loop — High value
1. Rules: irreversible Take, hush, carpet home, Plinth, optional Share/Soft Beat  
2. Decisions: the organ fork (plus Soft Beat look)  
3. Interactions: Memory, Piggy, weather scars, progression paintings, music  
4–6. Multi-outcome identity, real trade-offs, plaza/day-2 emergence  
7. Already lean — Soft Beat optional, don’t add glossary rules  

### XP — Poor value
1. Rules: earn XP, level = xp/100  
2. Decisions: none in Islands gates  
3. Interactions: reward toasts only  
4–6. No strategies / trade-offs / emergence  
7. **Yes** — coins + CF + Freedom already score progress → **hide XP chrome**

### Wealth ranks — Poor value
1. Rules: 7 ranks parallel to boat `minCoins`  
2–6. Zero extra decisions; same thresholds as carpet  
7. **Yes** — one carpet tier label → **merge**

### Dual weather — Poor value
1. Rules: Markov boom/normal/recession **and** CF boom/fair/tight/storm  
2. Macro phase: almost no player agency  
3. Split fiction  
7. **Yes** — one cashflow weather drives sky, shop, and soft Pay Day mult → **unify**

### skillStats panel — Poor value
1. Rules: Resilience / Discipline / Foresight bars  
2. Decisions: none (side-effect of play)  
7. **Yes** — coach can read fails/CF/stance invisibly → **cut panel**

---

## This PR — merges that preserve depth

| Merge | Depth preserved |
|-------|-----------------|
| Wealth → carpet tier in `WealthHud` | One progress metaphor players already buy for travel |
| Hide XP on party reward chrome | Coins + CF remain the score |
| skillStats panel off Island play HUD | Coach may still use stats black-box |
| Unify macro phase ← Harbor CF weather | Pay Day soft mult + event phase follow the weather players earned |

**Not cut this PR:** party board (larger refactor), mastery quizzes, daily ritual shell, Family Room, signature loop, Soft Beat, Ledger.

---

## Target end-state (iconic freeze)

One liquid currency · one CF engine · one weather fiction · one progress carpet · Memory scars as identity stock · Take→Plinth as the depth engine. Everything else earns its rule count or leaves.
