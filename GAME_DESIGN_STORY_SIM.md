# Story-generating simulation — emergent “you won’t believe” logs

Capital’s memorable stories should come from **systems colliding**, not from more scripted Take cinema. Takes / Plinth / Soft Beat remain identity; this doc covers the **simulation layer** that produces retellable chains.

Freeze: Harbor · Cove → Paycheck → Credit. No new islands.

Code: `src/islands/storySim.ts` · Voyage Log on Memory Plinth · `?story=1`

---

## Simulation ingredients (already in the game)

| Ingredient | Where it lives | Story fuel |
|------------|----------------|------------|
| **Player goals** | Freedom Seal streak, seals race, chapter Change | “Almost free…” |
| **Resources** | Pouch coins, cashflow, capsules | Spend vs runway |
| **Competition** | Rival captains (`partyRivals`) | Fee Raid, seal snatch |
| **Risk** | Debt Trap, Collector, haste scar | Permanent −$/mo |
| **Random events** | Dice, chance spaces, economy Markov | Surprise landings |
| **NPC / AI** | Rival temperaments, Piggy bond, npcMemory | Personality pressure |
| **Economic systems** | Ledger Pay Day, Harbor weather, Boom/Recession | Macro mood |
| **Ownership** | Holdings, carpets, companions, plaza passes | Status vs debt irony |
| **Failure** | Minigame fail, Pay Day shortfall, streak wipe | Dignity + cost |
| **Recovery** | Bailout / Emergency Ledger, new deals, boom | Reversal beat |
| **Alliances** | Soft: Piggy bond, self-buff capsules | Not formal PvP allies |
| **Rivalries** | First-class board captains | Named antagonists |

### Combinations that mint stories

1. **Deal binge → Pay Day shortfall → Freedom streak dies → storm sky**  
2. **Debt Trap → Collector (no shield) → rival Fee Raid**  
3. **Bailout saves Collector → next turn raid still bites**  
4. **Dividend Magnet Pay Day → Freedom unlock while carrying a snack tab**  
5. **Gambler rival eats liabilities; Planner steals your deal**  
6. **Haste scar + lean cashflow → Spiral fog + shop discounts**  
7. **Board fail consolation → still lose seal race**  
8. **Escape → carpet polish while Gadget Loan still bites**  

Scripted Cove Take is **not** the start of this log — scars may appear as OUTCOME tags, but chains grow from board/ledger/rival/economy.

---

## Event grammar

Every logged beat is one of:

```
ACTION → CONSEQUENCE → ESCALATION → REVERSAL → OUTCOME
```

| Beat | Meaning | Examples |
|------|---------|----------|
| ACTION | Player (or rival) initiates | accept deal, land Debt Trap, roll into raid, buy polish |
| CONSEQUENCE | Immediate system reply | pouch −40, +$10/mo, −$8/mo liability |
| ESCALATION | Second hit while stressed | Collector after trap; streak wipe; rival raid after shortfall |
| REVERSAL | Defense or recovery | Emergency Ledger absorb; Bailout; boom; new asset |
| OUTCOME | Memorable settle | Freedom Seal; storm weather stamp; seal race loss; scar plaque |

Chains are **detected**, not authored. Incomplete chains still appear as timeline crumbs.

---

## Logging rules

- Append-only `save.storyLog` (cap ~80)
- Kid-facing `summary` one-liners
- Soft `refs` (holdingId, rivalId, islandId) for chain glue
- Link minigame DecisionTimeline via `refs.timelineId` — don’t duplicate ReplayModal
- Never force players to open the log; Plinth Voyage Log is discovery

---

## Player retell target

> “You won’t believe what happened in my game…”  
> *I bought the lemonade stand, then the Debt Collector hit, my Emergency Ledger ate it, and next Pay Day I still unlocked Freedom with a Snack Tab hanging off the books.*

That sentence is a detected chain, not a cutscene.
