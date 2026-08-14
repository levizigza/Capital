# Capital — Core Gameplay Loop

**Companion to:** [GAME_DESIGN_AUDIT.md](./GAME_DESIGN_AUDIT.md) · [docs/iconic-path.md](./docs/iconic-path.md)  
**Constraint:** Improve the loop itself. Do not bolt on progression to hide a weak cycle.  
**Prototype:** `?coreLoop=1` → `CoreLoopPrototype` (isolated fun test)

---

## Strongest possible core loop

Capital’s unique strength is not grinding coins or clearing quizzes. It is:

> **I choose something about money → the living world marks it → Harbor remembers → I face the next living choice.**

Compressed for craft (and for the isolated prototype):

```
PLAYER ACTION
  Commit a living-money choice (irreversible fork)
→ SYSTEM RESPONSE
  The organ locks the choice; hush falls; plaque is written
→ IMMEDIATE FEEDBACK
  Organ stinger · take_mark juice · kid hush line (“The Coin holds…”)
→ REWARD / CONSEQUENCE
  Harbor felt that — Plinth glows with the plaque; Memory keeps proof
→ NEW DECISION
  What’s newly true? Soft peek or next organ fork (Clock / Spiral remix)
→ REPEAT
```

This is the signature loop (Take → hush → spectacle) with travel friction removed so the *feeling* can be judged alone.

---

## Design questions

### What action should players perform most often?

**Commit** — confirming a living-money verb when the world offers a clear fork or prompt  
(Take fork · Talk when ready · Enter a machine · Board the lit painting).

In the full game, Walk positions you; **Commit** is the satisfying beat. Takes are rarer climaxes of the same shape. The prototype makes Commit frequent so the loop can be tasted without a 20-minute voyage.

### Why is that action intrinsically satisfying?

- **Agency with permanence** — you cannot put it back; the game treats you as a careful chooser.  
- **Living response** — money answers (organ sound, hush, mark), not a spreadsheet cell.  
- **Social Memory** — Harbor naming the plaque is the reward fantasy (“I was here; it stuck”).  
- **Aspiration** — the next cycle teaches a *new* organ facet (holds → shelters → withstands), not a longer repaint.

### What information does the player receive?

- Both fork labels (plaque vocabulary) before choosing  
- Organ suit verb (Coin holds / Clock shelters / Spiral withstands)  
- Hush → mark → “Harbor felt that” headline  
- Plaque shelf line on the Plinth  
- What is newly open / next beckoning choice  

### What meaningful decision follows?

- Soft Beat peek vs press onward (full game)  
- Board the newly opened painting  
- Talk to Piggy about what changed  
- In prototype: take the next organ’s fork (same loop, new facet)

### What changes in the world?

- Plaque exists on Memory Plinth  
- Chapter quiet / landmark hush (full game)  
- Next painting unlocks; locals can name the scar  
- Weather / stance flavor (secondary)  
- Prototype: Plinth shelf grows; organ accent shifts

### What creates anticipation for the next cycle?

- “Harbor is already listening” during hush  
- Newly open painting named after spectacle  
- Organ Aspiration — Clock is not Cove again  
- Day-2 echo promise (“Memory keeps yesterday”)

---

## Interruptions (current product)

| Interruption | How it breaks the loop |
|--------------|-------------------------|
| Long travel / map chrome between Take and Plinth | Delays consequence; cools the mark |
| Stall / Freedom / Arcade dashboard after spectacle | Replaces Memory intimacy with utility |
| Stacked coaches (Coin Bag + HUD + Talk) | Obscures the one next decision |
| XP / seals / quizzes as “progress” after a Take | Progression compensating for muted Memory feel |
| Soft Beat never invited | Aspiration depth skipped; loop feels thin |
| Structure abandon → Harbor remount | Panic exit instead of loop dignity |
| Ashore glossary of all three Takes (removed in Chamber 00) | Was teaching the loop as slides, not play |

**Rule:** Fix these by shortening path from Commit → Harbor felt that, and by quieting chrome — not by adding more unlock trees.

---

## Full-game mapping (keep)

| Loop step | Live surface |
|-----------|----------------|
| Commit | Cove/Paycheck/Credit Take dialogue |
| System response | `addScar` · `chapterQuietPending` |
| Immediate feedback | `TakeHushOverlay` · organ SFX · juice |
| Reward / consequence | `ScarSpectacleOverlay` · Plinth · Share |
| New decision | Piggy / Coin Bag next painting · Soft Beat |
| Repeat | Next organ chapter |

---

## Isolated prototype

**URL:** `?coreLoop=1`  
**File:** `src/islands/views/CoreLoopPrototype.tsx`

One screen. No map, XP, Freedom Seal, Ashore, or quests.

1. Show one organ fork (two plaque buttons).  
2. On commit → hush → mark → Harbor felt that on a live Plinth shelf.  
3. Offer **Look** (Soft Beat-style breath) or **Next choice**.  
4. Cycle Coin → Clock → Spiral → Coin…  

**Pass bar:** Without any progression, the player wants to take another fork.  
If they don’t, the loop is still weak — do not add seals to compensate.
