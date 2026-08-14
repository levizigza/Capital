# Curiosity — unanswered questions that reward investigation

Capital should provoke natural questions, then answer them when players investigate. Mysteries are not arbitrary fog — each hook resolves into **knowledge**, **capability**, **strategy**, **story**, **resource**, or **discovery**.

Freeze: Harbor · Cove → Paycheck → Credit. Deepen Soft Beats, plaza weather, Memory Teller, NPC recall. No new islands.

See `src/islands/curiosityDiscovery.ts`.

---

## Player questions (audit)

| Question | Where it arises | Was unanswered? | Hook |
|----------|-----------------|-----------------|------|
| What happens if I peek from the lid/loft/wall? | Money Structure Soft Beat | Tease only — same vista both forks | **Fork vista** |
| Can organs talk to each other? | Ledger Bank Teller | Memory Soft Beat never cross-indexed plaques | **Teller cross-index** |
| Why is the sky foggy / shops cheap? | Harbor weather coach | Cashflow math, no organ myth | **Weather ↔ organ** |
| What’s that interest-storm rumor? | Ritual `debt_fog` | Far tease with no Harbor answer until Credit | **Debt fog → Battlement** |
| Does carrying a capsule matter on the plaza? | Capsule stall | Board-only identity | **Capsule plaza whisper** |
| Do locals remember *which* fork? | Piggy / stance greetings | Affinity unused | **Affinity shelf** |
| Did that deal leave a footprint? | Freedom chip | Ledger-only | **Deal receipt tip** (light) |
| What have I found so far? | `discovered.*` write-only | No soft shelf | **Curiosity journal (opt-in `?curiosity=1`)** |

---

## Hook cards

### 1. Soft Beat fork vista

**Provokes:** “What happens if I do this?” / “Why did that look different?”  
**Investigation:** Climb Lid / Loft / Battlement after a Take.  
**Reward:** knowledge + discovery (+ tiny **resource** on first peek per pad).  
**Tracks:** `curiosity.softBeats[kind].peekCount` — never gates progress.

### 2. Teller Window cross-index

**Provokes:** “Can these systems interact?”  
**Investigation:** Soft Beat ledger when ≥2 plaques exist.  
**Reward:** knowledge + story (names Coin · Clock · Spiral together).  
**Tracks:** insight `teller_cross_index` on first multi-plaque peek.

### 3. Weather ↔ organ

**Provokes:** “Why did that happen?” / “Is there another strategy?”  
**Investigation:** Read plaza weather after haste scar or low cashflow.  
**Reward:** strategy + knowledge (fog names Spiral / Clock / Coin).  
**Tracks:** optional `weatherOrganUnderstood` day key (one-shot aha, not forced).

### 4. Debt fog → Battlement

**Provokes:** “What is over there?” (without opening a new island).  
**Investigation:** Hear ritual rumor → later climb Score Battlement (with or without Credit Take).  
**Reward:** story + knowledge (Spiral foreshadow / confirmation).  
**Tracks:** insight when battlement peeked after `debt_fog` rumor seen.

### 5. Capsule plaza whisper

**Provokes:** “Can I exploit this?” (protection as identity).  
**Investigation:** Own Emergency Ledger / Bailout; stand near Capsule stall or open Soft Beat ledger.  
**Reward:** capability (already on board) + knowledge (plaza names the buff).  
**Tracks:** insight `capsule_plaza` once.

### 6. NPC affinity shelf

**Provokes:** “What am I missing?” in Talk Battle.  
**Investigation:** Talk 3+ times with choice memory; Piggy / Cashwell deepen.  
**Reward:** story (fork-named greeting).  
**Tracks:** existing `npcMemory.affinity` — soft, missable.

---

## Anti-patterns (avoided)

- Arbitrary locked doors with no organ payoff  
- Completionist % meters forcing every secret  
- Mystery that only exists as purple prose  
- New map chips beyond the frozen triangle  

## Discovery UX

- Soft tracking only (`IslandSaveV1.curiosity`)  
- No quest log “find all Soft Beats”  
- `?curiosity=1` shows open questions the *save* can still answer — never a score  
