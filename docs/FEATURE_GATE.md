# Capital feature gate

**Before implementing any future Capital feature**, fill this gate.

Reject pitches whose main justification is **“other games have this.”**  
Prefer features that **improve several existing systems at once** (Harbor · Soft Beat · Plinth · ledger · Family Room · Take/scar…).

Canon: [iconic-path.md](./iconic-path.md) · [iconic-later.md](./iconic-later.md) · [player-fantasy-and-loop.md](./player-fantasy-and-loop.md)  
Code: `src/design/featureGate.ts` · template: [feature-gate/template.md](./feature-gate/template.md)

---

## How to run

1. Copy `docs/feature-gate/template.md` → `docs/feature-gate/proposals/<slug>.md`  
2. Score each axis **0–5** (integers).  
3. Run evaluation (optional machine check):

```bash
npm test -- src/design/featureGate.test.ts
# or evaluate in a short script / PR description using evaluateFeatureGate()
```

4. Ship only **accept** / **accept_with_conditions** (conditions listed in the PR).  
5. **reject** or **park** → do not start implementation.

---

## Value axes (0–5) → VALUE SCORE (sum / 50)

| Axis | Ask |
|------|-----|
| Strengthens core fantasy | Does this make me feel like a Voyager among living money? |
| Strengthens core loop | Does Harbor → Take → felt → return get clearer or juicier? |
| Creates meaningful decisions | Are tradeoffs real (forks, scars, spends) — not fake choices? |
| Interacts with existing systems | Does it talk to ledger / Soft Beat / Plinth / Talk / Family Room / weather? |
| Creates emergent possibilities | Can systems surprise without new maps? |
| Improves mastery | Does skillful play open better reads or strategies? |
| Improves player expression | Can stance / fork / share / cast show *who I am*? |
| Improves replayability | Does a second run ask new questions (not grind)? |
| Improves social possibility | Local Family Room / share / co-presence — not fake MMO? |
| Creates memorable stories | Will a kid retell this beat at Harbor? |

**VALUE SCORE** = sum of the ten scores (**0–50**).

---

## Cost axes (0–5) → COST SCORE (sum / 30)

| Axis | Ask |
|------|-----|
| Cognitive complexity | New rules the player must hold in mind? |
| UI complexity | New chrome, cards, dashboards, hero overlays? |
| Technical complexity | New backends, netcode, fragile 3D paths? |
| Balance risk | Economy / Freedom / teach can break? |
| Maintenance burden | Ongoing content ops / edge-case tax? |
| Content burden | How much new writing / art / locales to stay coherent? |

**COST SCORE** = sum of the six scores (**0–30**).

---

## Calculate

| Metric | Formula |
|--------|---------|
| **VALUE SCORE** | Σ value axes |
| **COST SCORE** | Σ cost axes |
| **Net** | VALUE − COST |
| **Ratio** | VALUE / max(COST, 1) |

### Verdict rules (machine + human)

| Verdict | When |
|---------|------|
| **reject** | Freeze broken (map width / fake MP / foreign merge) **or** copycat justification **or** VALUE &lt; COST |
| **park** | VALUE &lt; 20/50 even if above cost — too thin for iconic phase |
| **accept_with_conditions** | High cost (≥18) with modest net **or** weak multi-system interaction — list spike + chrome constraints |
| **accept** | VALUE ≥ COST, VALUE ≥ 20, no freeze/copycat fails; celebrate multi-system (≥3 systems) |

Human craft owners may still **park** an “accept” if iconic freeze priorities say deepen Soft Beat / Plinth first ([iconic-later.md](./iconic-later.md)).

---

## Hard rejects

1. **“Other games have this”** as the main why — rewrite in Capital fantasy/loop language or drop it.  
2. **Main-quest width** beyond Cove → Paycheck → Credit.  
3. **Fake multiplayer** backend (Family Room stays local).  
4. **Foreign merges** (Nathan Project / BMO / CBE).  
5. **VALUE &lt; COST** — cost outweighs craft gain.

---

## Prefer

- One change that lifts **Soft Beat + ledger + Plinth** over three isolated toys.  
- World teaching over new checklist chrome.  
- Local social myth over leaderboards.  
- Emergent reads from rules over scavenger collectibles.

---

## Score calibration (quick)

| Score | Meaning |
|------|---------|
| 0 | No effect / N/A liability |
| 1 | Barely |
| 2 | Mild |
| 3 | Clear, localized |
| 4 | Strong across a spine beat |
| 5 | Defines or rescues a signature moment |

Costs use the same ladder: **5** = severe (new netcode, second economy, dashboard hero).

---

## Example (illustrative)

**Feature:** Soft Beat fork vista after irreversible Take (lid/loft names your choice).

- Fantasy 4 · Loop 5 · Decisions 4 · Systems 5 · Emergent 3 · Mastery 3 · Expression 4 · Replay 3 · Social 1 · Stories 5 → **VALUE 37**  
- Cognitive 2 · UI 1 · Tech 2 · Balance 1 · Maint 2 · Content 2 → **COST 10**  
- Net **27** · multi-system (Take × Soft Beat × organs) · verdict **accept**

**Counter-example:** Global PvP trading floor “because Roblox has it.”

- Copycat justification → **reject** (do not score your way out of a bad why).
