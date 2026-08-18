# SYSTEM_INTERACTION_MATRIX — Capital

**Canon:** [docs/iconic-path.md](./docs/iconic-path.md) · [GAME_DESIGN_COMPLEXITY.md](./GAME_DESIGN_COMPLEXITY.md) · [GAME_DESIGN_ECONOMY.md](./GAME_DESIGN_ECONOMY.md)  
**Law:** Prefer **what existing systems could interact?** over **what new feature can we add?**  
**Freeze:** Cove → Paycheck → Credit only; no fake multiplayer; no XP meters as strategy.  
**Prototype:** `?interact=1` → three strongest chains

---

## Axes (major systems)

| Id | System |
|----|--------|
| T | Organ Take / scars / Memory Plinth |
| S | Soft Beat / Money Structures |
| L | Ledger cashflow / Pay Day / Freedom |
| P | Pouch / Harbor shop / deals |
| W | Harbor weather (cashflow mood) |
| K | Walk / Talk / Piggy / Coin Bag |
| C | Money Carpet / boat tiers / painting unlocks |
| H | Share / day-2 echo |
| B | Party board / capsules / rivals |
| M | Mastery quizzes / Credit gate |
| A | Stance (saver / spender / risk) |
| X | skillStats (coach-only; poor player-facing value) |

Tags: **NO** · **CURRENT** · **POTENTIAL** · **DANGEROUS**

---

## Matrix (upper triangle — material pairs)

|  | T | S | L | P | W | K | C | H | B | M | A | X |
|--|---|---|---|---|---|---|---|---|---|---|---|---|
| **T** | — | CUR | POT★ | POT | CUR | CUR | CUR | CUR | NO | NO | CUR | NO |
| **S** | | — | POT★ | POT | POT★ | CUR | CUR | CUR | CUR | CUR | POT | CUR |
| **L** | | | — | CUR | CUR | CUR | CUR | POT | CUR | CUR | POT★ | CUR |
| **P** | | | | — | CUR | CUR | CUR | NO | CUR | CUR | POT★ | NO |
| **W** | | | | | — | CUR | NO | POT★ | POT | NO | POT | DAN |
| **K** | | | | | | — | CUR | CUR | CUR | CUR | CUR | CUR |
| **C** | | | | | | | — | CUR | NO | CUR | NO | NO |
| **H** | | | | | | | | — | NO | NO | POT | NO |
| **B** | | | | | | | | | — | CUR | NO | CUR |
| **M** | | | | | | | | | | — | NO | CUR |
| **A** | | | | | | | | | | | — | DAN |
| **X** | | | | | | | | | | | | — |

★ = prioritized for multiplicative chains below.

### Dangerous cells

- **W ↔ X / economy.ts:** two mood engines — collapse to cashflow weather.  
- **A ↔ X:** two personality meters — stance is Take-true; skillStats stay invisible coach.  
- **B ↔ L (overweight):** party board as second Freedom grind — don’t let seals unlock Credit.

---

## High-value multiplicative chains (5–10)

Feedback shape: **A → B → C → A**

| # | Chain | Strategy unlocked | New systems? |
|---|-------|-------------------|--------------|
| 1 | **T → L → W → S → T** Organ scar stains Pay Day → weather → Soft Beat invitation → next Take reads weight | Organ choice shapes Harbor grind tempo | No |
| 2 | **A → P → L → W → K → A** Stance biases deals → CF → weather → Piggy Talk reflects stance | Saver vs spender as market futures | No |
| 3 | **H → W → S/K → T** Day-2 echo forces weather law → Soft Beat/Piggy name stain → next Take under weather pressure | Wait a day vs spend into storm | No |
| 4 | T → W → P → C → T | Haste scar storm → shop discount/markup → carpet polish timing → next painting economy | No |
| 5 | S → P → L → S | Soft Beat before deal desk = receipt check → better CF → richer Soft Beat | No |
| 6 | L → C → M → L | Freedom floors carpet → Credit opens → Ordeal Take feeds CF weather | No (exists partly) |
| 7 | T → H → K → C | Share proves plaque → Piggy names next painting | Exists; deepen copy only |
| 8 | B → L → W → B | Board Pay Day under organ weather → storm bills | Mild; don’t grow board |
| 9 | A → M → C | Mastery stem mirrors Take (pedagogy) | Slim quiz, not new gate |
| 10 | — | **Do not** let X or party seals unlock paintings | Protect spine |

---

## Prototype three strongest

| Chain | Module | Player feel |
|-------|--------|-------------|
| 1 Organ→PayDay→Weather→SoftBeat | `systemInteractions.resolveOrganPaydayChain` | “My Cove Take still colors Harbor’s Pay Day.” |
| 2 Stance→Deals→CF→Weather→Talk | `resolveStanceDealChain` | “How I Take changes which deals sing.” |
| 3 Day2→Weather→SoftBeat→NextTake | `resolveDay2WeatherChain` | “Yesterday’s plaque is today’s sky.” |

Playable isolation: `?interact=1` · `InteractionChainsPrototype.tsx`  
Live hooks: Pay Day mult + deal order + day-2 weather override (mild).

---

## Pass bar

A cold player who made one Take should feel Harbor grind, Soft Beat, and day-2 **answer that Take** — without learning a new meter name.
