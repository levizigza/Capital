# Capital progression audit

Progression that only makes a number go up is chrome, not craft. Every keep unlock must answer:

> **What new decision does this create?**

If the answer is “none,” demote or cut.

Freeze still holds: Harbor · Cove → Paycheck → Credit. Depth on Money Structures / Soft Beats / scars — not new outer islands.

---

## Nine buckets

| Bucket | What it is in Capital | Keep when… |
|--------|----------------------|------------|
| **PLAYER SKILL** | Kinesthetic mastery (minigames, board timing), Soft Beat look/leave | Play creates judgment under pressure |
| **PLAYER KNOWLEDGE** | Mastery quizzes, Talk Battle literacy, capsule tips | Knowing changes a later choice (Credit gate, deals) |
| **CAPABILITIES** | Capsule verbs, structure arcade pads, outfit expression | New actions on the board / plaza |
| **ACCESS** | Spine islands, Freedom Pavilion, plaza passes, inventory keys | New places or rooms to choose |
| **RESOURCES** | Pouch coins, Voyager Ledger cashflow / holdings | Spend / allocate creates tradeoffs |
| **STATUS** | Wealth rank labels, stance greetings, main-course % | Flavor only — never a gate |
| **COLLECTION** | Scars/plaques, companions, studio marks, discovery sets | Memory or soft identity — not ladders |
| **WORLD STATE** | Irreversible Takes, questStatus, hush → spectacle → homecoming | The world names what you did |
| **SOCIAL REPUTATION** | npcMemory, Piggy bond, Harbor Felt share, local Family Room | Soft dialogue / share — no fake multiplayer ranks |

---

## Unlock table — “new decision?”

### Keep (decision-bearing)

| Unlock | Bucket(s) | New decision |
|--------|-----------|--------------|
| Cove Change (Take + scar) | WORLD STATE · ACCESS | Save vs spend; Paycheck painting opens |
| Soft Beat lookouts | PLAYER SKILL · WORLD STATE | Stay in hush vs leave — organ memory, not a score |
| Ledger Freedom ($30+/mo × 3 Pay Days) | RESOURCES · ACCESS | Chase cashflow vs vanity spends; Pavilion + Credit path |
| Mastery quiz clears (×3 + Freedom) | PLAYER KNOWLEDGE · ACCESS | Prove literacy → sail Credit Kingdom |
| Capsule buy / use (max 3) | CAPABILITIES · RESOURCES | Which board verb to carry; spend vs save |
| Plaza pass / Freedom Pavilion | ACCESS | Market lane vs pavilion polish destinations |
| Money Structure pads | CAPABILITIES · ACCESS | Enter arcade worlds vs Soft Beat hush |
| Piggy / npcMemory / day-2 echo | SOCIAL · WORLD STATE | Whom to talk to; plaza remembers the Take |
| Harbor Felt share card | SOCIAL | Share vs skip — default social object |

### Demote / cut as progression (number-only)

| System | Why cut from “progress” | Still exists as… |
|--------|-------------------------|------------------|
| **XP / level** | No island or room locks on level | Quiet award math; **hidden in party reward UI** |
| **skillStats HUD** | Bars don’t open decisions | Coach soft-nudge only; panel behind `?skills=1` |
| **Wealth rank ladder** | “X to Tycoon” is a meter without a verb | Pouch cash only in WealthHud |
| **Carpet tiers past Fortune flyer** | Mint / vault / royal don’t open places | Optional look polish — not next-goal chrome |
| **Ritual streak counter** | Streak for streak’s sake | Ritual keeps rumor + Pay Day (Freedom-relevant) |
| **Weekly challenge %** | Retention checklist | Optional share line — not spine |
| **Party Ledger Seals race** | Side tomfoolery win metric | Fun board chase — never ending gate |
| **Companions as “progress”** | Cosmetic pets | Collection flavor at Outfitter |
| **Economy phase widget** | Macro badge without a menu verb | Soft event weights (no default HUD progress) |

---

## Nested goals (overlap without overwhelm)

One **short**, one **medium**, one **long** — nested, not three parallel checklists.

```
SHORT ──► MEDIUM ──► LONG
Take / Soft Beat     Cashflow → Freedom     Freedom + mastery → Credit
     └──────── scar / painting naming ────────┘
```

| Horizon | Goal | New decision | Overlaps |
|---------|------|--------------|----------|
| **Short** | Complete the island Take so Harbor can name it | Irreversible money choice; carpet home | Medium (scar → next painting); Long (triangle memory) |
| **Medium** | Grow ledger cashflow → Freedom Seal / Pavilion | Deals vs pouch vanity; Pay Day streak | Short (Cove/Paycheck Takes feed ledger story); Long (Freedom required for Credit) |
| **Long** | Freedom + 3 mastery clears → Credit Ordeal | Whether to study / quiz before the storm | Medium (Freedom); Short (each island’s Take + quiz) |

Soft Beats stay **player skill / world hush** on the signature loop — look vs leave — but they are not a third short checklist item.

Implementation: `src/islands/progressionGoals.ts` — Coin Bag may whisper the active nest when no higher tip owns the plaza. Never a grind checklist HUD.

---

## Design rules going forward

1. **No unlock without a verb.** If it only increments XP, rank, streak, or seal count, demote to chrome.
2. **Nest, don’t stack.** Short goals feed medium; medium unlocks long. Avoid three unrelated meters.
3. **Harbor names truth.** Progression reads as plaza memory (scar, Freedom chip, next painting) — not a level-up toast.
4. **Side tomfoolery stays optional.** Party seals, arcade stars, weekly % never gate Credit.
5. **Carpet story ends at Fortune flyer** for progression. Higher polish is vanity spend with eyes open.

See also: [iconic-path.md](./iconic-path.md), [player-fantasy-and-loop.md](./player-fantasy-and-loop.md).
