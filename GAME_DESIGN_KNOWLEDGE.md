# Capital — Knowledge as Progression

**Companion to:** [GAME_DESIGN_LOOP.md](./GAME_DESIGN_LOOP.md) · [docs/iconic-path.md](./docs/iconic-path.md) · [docs/puzzle-explorable-craft.md](./docs/puzzle-explorable-craft.md)  
**Constraint:** Literacy is the progression meter. Do **not** use XP, Freedom Seal clears, or mastery quizzes as substitutes for cold-retell understanding.  
**Prototype:** `?knowledge=1` → `KnowledgeLiteracyPrototype` (FAIL → UNDERSTAND → ADAPT → RETRY)

---

## Thesis

An expert Capital player is not someone with a high Freedom Seal or quiz streak.  
They are someone who can **cold-retell** living money and act on it:

> Money is alive → my Commit sticks → Harbor remembers → Soft Beat shows weight → the next organ remixes the same truth.

```
FAIL
→ UNDERSTAND SOMETHING   (observation + open question — never the optimal answer)
→ ADAPT                  (new hypothesis)
→ RETRY
→ IMPROVE
→ MASTER                 (can teach a kid the organ sentence)
```

Progression = **which truths the player can retell and use**, earned only through play and dignified failure.

---

## Expert inventory (beginner does not know)

### BASIC RULES

| Discovery | Expert knows |
|-----------|----------------|
| `money_alive` | Islands are living money organs, not genre towns |
| `commit_sticks` | A Take / Commit cannot be put back |
| `walk_talk_board` | Walk positions; Talk is opt-in (E); paintings board voyages |
| `piggy_points` | Piggy names what changed + the next lit painting |
| `one_next_verb` | After any beat, there is one clear next verb — not a dashboard |
| `pouch_vs_scar` | Take cost is Memory / identity, not emptying the wallet |

### INTERMEDIATE PATTERNS

| Discovery | Expert knows |
|-----------|----------------|
| `organ_verbs` | Coin holds · Clock shelters · Spiral withstands · Memory keeps |
| `hush_then_felt` | Take → hush → carpet home → “Harbor felt that” on the Plinth |
| `plaque_vocabulary` | Fork labels become plaque lines Harbor can name |
| `soft_beat_look` | Soft Beat = climb, look, leave — **not** a second Take |
| `structure_enter` | Money Structures are machines you enter (slot / chute / spiral / vault) |
| `quiet_chrome` | After spectacle / first meet: hide stall / CASH / Leave until Talk |
| `equal_forks` | Saver and spender / wait and haste paths both deserve cinema dignity |

### ADVANCED STRATEGIES

| Discovery | Expert knows |
|-----------|----------------|
| `scar_unlocks_next` | Coin scar opens Paycheck painting; Clock scar opens Credit |
| `day2_echo` | Yesterday’s plaque returns as Soft Beat cinema + plaza rumor |
| `share_is_proof` | Share PNG is the social receipt of Memory, not a settings modal |
| `organ_aspiration` | Each island remixes the loop (Hold → Earn → Borrow) — not a longer Cove |
| `weather_stance` | Haste / stance can tint Harbor weather and greetings (flavor with teeth) |
| `soft_gate_named` | Soft-locks speak organ truth (“Finish Cove Change — Coin holds”) |

### SYSTEM INTERACTIONS

| Discovery | Expert knows |
|-----------|----------------|
| `memory_reads_spine` | Harbor Memory reads scars from Cove / Paycheck / Credit |
| `coinbag_never_races` | Coin Bag points; never spoils the next island alone |
| `structure_fail_stay` | Structure miss stays in the room — abandon must not panic-remount Harbor |
| `arcade_vs_soft` | Arcade pads score; Soft Beat pads hush — different toys, same organ |
| `era_after_cove` | Era side shores unlock after Cove Change — digression, not main myth |
| `freedom_is_economy` | Freedom Seal / quizzes are economy / school gates — **not** organ mastery |

### EDGE CASES

| Discovery | Expert knows |
|-----------|----------------|
| `double_take_blocked` | You cannot rewrite a plaque by Taking again on the same organ chapter |
| `mute_still_reads` | Volume 0: take_mark + harbor_felt still *read* as beats |
| `reduce_motion` | Cinema softens; the loop shape stays (hush → felt → share) |
| `corrupt_save_boots` | Poisoned save sanitizes to playable Harbor |
| `talk_never_ambush` | Approach alone never starts Talk Battle |
| `spend_fail_dignity` | Treat-first / glitter paths get the same soft-fail dignity as saver |

### META STRATEGIES

| Discovery | Expert knows |
|-----------|----------------|
| `cold_retell_test` | After Harbor return, name organ + suit verb in kid words |
| `hypothesis_over_spoilers` | Misses give observations; experts form the next try themselves |
| `depth_before_width` | Master Cove→Harbor before hunting new islands |
| `pass_bar_want` | Want another Commit without XP chrome — the loop is healthy |
| `teach_when_needed` | Soft Beat / Paycheck / Credit teach in-world after earned, not in Ashore glossary |

---

## Gradual exposure through gameplay

| When (play beat) | Knowledge tier unlocked in practice |
|------------------|-------------------------------------|
| Ashore Chamber 00 — Fantasy poke | `money_alive` (feel, not lecture) |
| Ashore Walk / Talk / Dock | `walk_talk_board`, `piggy_points` |
| First Cove Commit | `commit_sticks`, `plaque_vocabulary` |
| Hush → spectacle → Plinth | `hush_then_felt`, `organ_verbs` (Coin + Memory) |
| Quiet plaza → Piggy | `one_next_verb`, `quiet_chrome` |
| Enter Coin Jar + Lid Lookout | `structure_enter`, `soft_beat_look` |
| Share PNG | `share_is_proof` |
| Day-2 return | `day2_echo` |
| Board Paycheck / Credit | `organ_aspiration`, `scar_unlocks_next` |
| Soft-lock attempt early | `soft_gate_named` |
| Structure miss / Retry | Fail→hypothesis path (see below) |
| Cold kid retell (player or watcher) | `cold_retell_test` = mastery proof |

**Ashore must not** dump Paycheck / Credit / Soft Beat glossary before first voyage.  
**Quizzes / XP must not** be framed as “you now understand Capital.”

---

## Fail → hypothesis contract

When the player fails (minigame miss, wrong Soft Beat framing, soft-lock, rushed structure exit):

### Always provide

1. **Observation** — what the living world did (jar rattled, loft stayed quiet, coil tightened, Plinth stayed dark).  
2. **Open question** — invites a new hypothesis (“What was still loose?” / “What stayed dry?”).  
3. **Agency** — Retry in the same place, or stay put with dignity.

### Never provide

- The optimal strategy named outright (“Always choose jar before treat”).  
- Shame lectures (“You should have saved”).  
- Spoiling the next island’s Take forks.  
- XP / seal consolation as the emotional beat.

### Pattern

```
FAIL
→ Observation (system response you can see/hear)
→ Open question (enough to form a hypothesis)
→ ADAPT (player chooses a new try)
→ RETRY
```

Copy lives in `src/islands/knowledgeProgression.ts` and feeds `minigameFailCopy` + the `?knowledge=1` prototype.

---

## Mastery proof (not a grind meter)

Player has **mastered** Capital literacy when they can cold-retell without UI chrome:

1. Coin holds — I chose jar or treat; Harbor felt it.  
2. Clock shelters — payday vs rainy-day.  
3. Spiral withstands — wait vs haste.  
4. Memory keeps — Plinth / Piggy / day-2 still name the plaque.  
5. Soft Beat looks — machines show weight; they don’t rewrite.

Tracking may ink a **retell shelf** (prototype) — never an XP bar.

---

## Isolated prototype

**URL:** `?knowledge=1`  
**File:** `src/islands/views/KnowledgeLiteracyPrototype.tsx`

Three hypothesis trials (Basic → Intermediate → Advanced).  
Wrong try → observation + question → Retry.  
Right try → discovery inked → next trial.  
No map, Freedom Seal, quizzes, or XP.
