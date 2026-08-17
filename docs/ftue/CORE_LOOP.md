# Capital Core Loop — smallest interesting reasoning cycle

**Date:** 2026-08-17  
**Basis:** `docs/ftue/FTUE_AUDIT.md` · `docs/iconic-path.md` signature loop · live Cove Take (`coincraft-cove.islands.json`)  
**Rule:** Define the loop around **player reasoning**, not menus. No secondary systems before the loop completes. **Docs only — do not implement in this pass.**

---

## Why the game is interesting (one sentence)

**You make an irreversible money choice in the world — and Harbor remembers it, so your next choice is already different.**

That is the fantasy the smallest loop must prove. Not “open map,” not “complete tutorial checklist,” not “earn coins.”

---

## The loop (player reasoning)

```
SITUATION
→ INFORMATION
→ PLAYER DECISION
→ SYSTEM RESPONSE
→ VISIBLE CONSEQUENCE
→ PLAYER INTERPRETATION
→ REVISED STRATEGY
→ NEXT DECISION
```

This is **one cycle of Capital’s signature money drama**. Minigames, Outfitter, Soft Beat, Share, Ritual, side shores, and Paycheck are **outside** this smallest loop (they may follow after it closes once).

---

## Node specifications

### 1. SITUATION

| Field | Spec |
|-------|------|
| **What it is** | You are on Coincraft Cove with fair coins earned. A Keeper offers a **Take** — jar before treat, or treat before jar. The shore is ordinary until you commit. |
| **Required player knowledge** | You can walk and talk; coins were earned somehow; Harbor is “home” you can return to. *Not required:* organ glossary, Soft Beat, Share, Paycheck. |
| **Required verb** | Arrive at the decision site (Talk to Keeper Kira at the lighthouse). |
| **Information visible beforehand** | Shore landmarks; that you hold a pouch / fair coins; Alma (or equivalent) can foreshadow that a choice will stick. |
| **Meaningful alternatives** | Defer (“Maybe later”) vs approach the Take now. Defer is valid; it does not close the loop. |
| **Immediate effect** | Decision frame opens (Talk Battle / choice rows). |
| **Delayed effect** | None yet. |
| **Risk** | Committing will stain Harbor; deferring delays progress. |
| **Opportunity cost** | Time spent elsewhere vs facing the Take. |
| **Success state** | Player understands “a choice is available that matters.” |
| **Failure state** | Player never finds Kira / never opens the Take. |
| **Misconception risk** | “This is just another chat NPC.” |
| **Feedback required** | Clear that this Talk is a **Take** (copy already: “This is a Take — it sticks forever”). |

---

### 2. INFORMATION

| Field | Spec |
|-------|------|
| **What it is** | The two futures are named before commit: quieter hush / patience vs louder plaza gossip / treat-first — both still remembered. |
| **Required player knowledge** | Words “jar” and “treat” as money metaphors (save vs spend stance). |
| **Required verb** | Read / listen to foreshadow rows (no extra system). |
| **Information visible beforehand** | Choice labels with foreshadow (existing Cove rows). |
| **Meaningful alternatives** | Attend to foreshadow vs ignore and pick by vibe. |
| **Immediate effect** | Mental model of two Harbor futures. |
| **Delayed effect** | Sets expectation that Harbor will react differently. |
| **Risk** | Text overload → random pick. |
| **Opportunity cost** | Skimming foreshadow vs understanding stakes. |
| **Success state** | Player can state two different expected Harbor moods. |
| **Failure state** | Player sees only “two buttons that give a jar.” |
| **Misconception risk** | “Both give a jar → outcomes identical” (true for item, false for memory). |
| **Feedback required** | Foreshadow must be short enough to use; difference must be about **Harbor**, not loot. |

---

### 3. PLAYER DECISION

| Field | Spec |
|-------|------|
| **What it is** | Commit: **Jar before treat** *or* **Treat before jar** (irreversible key `cove_save_vs_spend`). |
| **Required player knowledge** | Commit is permanent for this plaque/stance. |
| **Required verb** | Choose (dialogue choice with `setIrreversible` + `addScar`). |
| **Information visible beforehand** | The two foreshadowed rows (+ defer). |
| **Meaningful alternatives** | Saver path · Spender path · (Defer exits this node without loop progress). |
| **Immediate effect** | Irreversible flag + scar plaque + stance written to save. |
| **Delayed effect** | Chapter quiet + Harbor spectacle later. |
| **Risk** | Wrong-for-me identity; social/gossip cost; no undo. |
| **Opportunity cost** | The other stance’s Harbor story. |
| **Success state** | A stance exists the world can name. |
| **Failure state** | Abandon Talk (Esc) with no commit — loop incomplete. |
| **Misconception risk** | “I’ll undo it at Harbor.” |
| **Feedback required** | Immediate acknowledgment that Harbor already felt it (Kira line exists). |

---

### 4. SYSTEM RESPONSE

| Field | Spec |
|-------|------|
| **What it is** | World systems react without a settings menu: scar recorded; `chapterQuietPending`; Take hush cinema arms; organ/Coin line can speak. |
| **Required player knowledge** | None beyond “something stuck.” |
| **Required verb** | None — system acts. Player may dismiss cinema. |
| **Information visible beforehand** | N/A (response). |
| **Meaningful alternatives** | N/A (system). |
| **Immediate effect** | Hush captions; quiet shore chrome; carpet-home CTA. |
| **Delayed effect** | Harbor scar spectacle + Piggy homecoming + plaque gossip. |
| **Risk** | Player Esc-skips hush and misses the bridge sentence. |
| **Opportunity cost** | — |
| **Success state** | Quiet + clear next verb: board carpet home. |
| **Failure state** | Player stuck with no next verb (must not happen). |
| **Misconception risk** | “Cutscene = reward; choice over.” |
| **Feedback required** | One unmistakable next verb: **Carpet home — Harbor felt that** / pier coach. |

---

### 5. VISIBLE CONSEQUENCE

| Field | Spec |
|-------|------|
| **What it is** | Back at Harbor: scar spectacle (“Harbor felt that”), Plinth glow / plaque naming the Take, quiet plaza, Piggy homecoming that can name the Coin hold. |
| **Required player knowledge** | This Harbor is the same home as before the voyage. |
| **Required verb** | Return via Carpet; witness spectacle; Talk Piggy (soft-forced by quiet homecoming). |
| **Information visible beforehand** | Shore promised Harbor was listening. |
| **Meaningful alternatives** | Share PNG / Witness are **optional** and **not required** to complete the smallest loop. |
| **Immediate effect** | Player sees the plaque/story beat in the home space. |
| **Delayed effect** | Day-2 echo / locals naming plaque (post-loop longevity — not required for first close). |
| **Risk** | Spectacle gated / missed → consequence feels invisible. |
| **Opportunity cost** | — |
| **Success state** | Player can point at Harbor evidence of *their* choice. |
| **Failure state** | Harbor looks unchanged → loop thesis fails. |
| **Misconception risk** | “Spectacle is random story, not my Take.” |
| **Feedback required** | Plaque/label text must match the committed choice; Piggy line should reference the Change. |

---

### 6. PLAYER INTERPRETATION

| Field | Spec |
|-------|------|
| **What it is** | Internal conclusion: *My money choice left footprints. Harbor is a memory, not a menu hub.* |
| **Required player knowledge** | Link Take → plaque/spectacle. |
| **Required verb** | None required; optional retell (“one time I…”). |
| **Information visible beforehand** | Consequence beat. |
| **Meaningful alternatives** | Interpret as identity (saver/spender) vs as world reactivity vs as “cutscene.” |
| **Immediate effect** | Curiosity / caution / pride. |
| **Delayed effect** | Stance toward future Takes (Paycheck / digressions). |
| **Risk** | Misread as pure narrative with no systemic weight. |
| **Opportunity cost** | — |
| **Success state** | Player expects future Takes to also scar Harbor. |
| **Failure state** | Player expects to grind coins next with no memory. |
| **Misconception risk** | “I need Share to make it real” (Share is optional). |
| **Feedback required** | Quiet space after spectacle so interpretation can form (homecoming hush helps). |

---

### 7. REVISED STRATEGY

| Field | Spec |
|-------|------|
| **What it is** | New plan: *Next money fork, I’ll weigh Harbor’s memory — not only the item reward.* |
| **Required player knowledge** | At least one Take completed and seen at home. |
| **Required verb** | None yet — strategy is cognitive. |
| **Information visible beforehand** | Paycheck (or next painting) may unlock after Cove Change — that is **permission** to continue, not part of the loop’s reasoning payload. |
| **Meaningful alternatives** | Play safer · play louder · seek digressions · chase next painting. |
| **Immediate effect** | Coin Bag / Piggy can name “next painting” without teaching a new system. |
| **Delayed effect** | Different Take on Paycheck / Credit. |
| **Risk** | Overwhelm if free-roam dump happens before interpretation settles. |
| **Opportunity cost** | Digression vs spine painting. |
| **Success state** | Player has a stance about how they want Harbor to remember them. |
| **Failure state** | Player only optimizes coin count. |
| **Misconception risk** | “Free roam means the story is over.” |
| **Feedback required** | One clear optional next — not Arcade/Studio/Ritual before strategy forms. |

---

### 8. NEXT DECISION

| Field | Spec |
|-------|------|
| **What it is** | The **start of the next cycle**: another irreversible money fork (prototype: Paycheck tip/plan fork, or a digression haste/patience fork) chosen with Harbor-memory in mind. |
| **Required player knowledge** | Core loop once closed; map can reach a second decision site. |
| **Required verb** | Voyage + Talk/Take again. |
| **Information visible beforehand** | Prior plaque still on Harbor; lock hints cleared for Paycheck after Cove Change. |
| **Meaningful alternatives** | Second spine Take vs side digression Take. |
| **Immediate effect** | New situation node begins. |
| **Delayed effect** | Second scar / richer plaza gossip. |
| **Risk** | Secondary systems (Soft Beat, Ritual) intrude before second decision. |
| **Opportunity cost** | Which story Harbor tells next. |
| **Success state** | Player enters decision with memory of the first. |
| **Failure state** | Next content is menu/meta with no Take. |
| **Misconception risk** | “Every island is a minigame island.” |
| **Feedback required** | Second Take must again promise Harbor will feel it. |

**Loop interest proof:** The second decision is *interesting because of the first* — not because a new menu unlocked.

---

## Smallest scenario for a completely new player

**Name:** Cove Change — first footprint  

**Includes (minimum spine)**

1. Enough locomotion + Talk to reach a Take (Harbor Piggy → Carpet → Cove **or** the shortest viable path that still lands a Take).  
2. Earn-fair-coins beat only as far as required so the Take is not free loot (existing `q_cc_first_coins` → Alma → Kira).  
3. Irreversible jar vs treat Take.  
4. Hush + carpet home.  
5. Harbor spectacle + Piggy homecoming naming the Change.  

**Excludes until loop is complete (do not introduce as required)**

| System | Why deferred |
|--------|----------------|
| Soft Beat / Money Structure toys as teach | Toy layer; not required for footprint thesis |
| Share PNG / Witness | Social optional; loop closes without them |
| Outfitter / Capsule spend | Plaza discovery; legacy gates removed from critical path |
| Daily Ritual / day-2 echo | Retention layer after first close |
| Paycheck / Credit organ literacy | Next cycle content |
| Era side shores / Arcade / Studio magnets | Free-play after interpretation |
| Ashore organ glossary / Ready lecture | Tutorial chrome; not the interesting loop |
| Family Room / VibeCode | Meta after footprint understood |

**Controls that are prerequisites, not the loop:** Walk, Talk near+E, board Carpet. They enable the situation; they are not why the game is interesting.

---

## Smallest scenario — beat sheet (reasoning only)

| Order | Reasoning node | In-world beat (existing) |
|------:|----------------|---------------------------|
| 1 | SITUATION | At Kira with fair coins |
| 2 | INFORMATION | Foreshadow rows |
| 3 | PLAYER DECISION | Jar vs treat commit |
| 4 | SYSTEM RESPONSE | Scar + hush + carpet CTA |
| 5 | VISIBLE CONSEQUENCE | Spectacle + Piggy homecoming |
| 6 | PLAYER INTERPRETATION | Quiet after homecoming |
| 7 | REVISED STRATEGY | “Next Take, Harbor is watching” |
| 8 | NEXT DECISION | First step toward Paycheck (or chosen digression) Take — **start** of cycle 2 |

Cycle 1 is **complete** at the end of node 6 (interpretation), with node 7–8 proving the loop *repeats*. Interest is established when node 5 is legible; strategy (7) is the player owning that interest.

---

## Success / failure of the core loop itself

| | |
|--|--|
| **Loop success** | New player can retell: *I chose jar or treat; Harbor showed it back; I will choose differently next time because of that.* |
| **Loop failure** | Player only remembers “I finished a tutorial and unlocked the map.” |

---

## Relationship to FTUE audit

| Audit problem | Core-loop implication |
|---------------|------------------------|
| Piggy bypass / Ashore length | Must not replace or obscure the Take→Harbor footprint |
| Text-dense Take rows | Threatens INFORMATION → DECISION quality |
| Both paths grant jar | Consequence must be **Harbor memory**, not item |
| Share optional | Correct for smallest loop — do not gate interest on Share |
| Free-roam dump | Must wait until INTERPRETATION / REVISED STRATEGY |

---

## Non-goals of this document

- No production implementation.  
- No new systems.  
- No widening map beyond Cove → (next decision site).  
- Does not claim pattern-library #94 human Pass.
