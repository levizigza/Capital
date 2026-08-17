# Ashore tutorial research — how to teach Capital properly

**Date:** 2026-08-13  
**Job:** Deep research on tutorial craft, then diagnose live Ashore Teach (12 chambers) against it.  
**Canon links:** [ashore-teach-design.md](./ashore-teach-design.md) · [harbor-ashore.md](./harbor-ashore.md) · [puzzle-explorable-craft.md](./puzzle-explorable-craft.md) · [iconic-path.md](./iconic-path.md)  
**Primary sources:** [Tom Hermans — How to make a good puzzle](https://auroriax.com/puzzle-explorable/) · Mario 1-1 analyses · Portal chamber craft · BotW onboarding UX · Astro’s Playroom · Game Developer “invisible / organic tutorials” · Adams “Eight Ways To Make a Bad Tutorial”

---

## 1. What the best tutorials actually do

### 1.1 The shared law (across Mario · Portal · BotW · Astro · Hermans)

| Law | Meaning | Classic proof |
|-----|---------|---------------|
| **Show, don’t narrate** | The space forces the verb; text is optional after success | Mario 1-1: zero words teaches jump, stomp, ?-blocks |
| **One new idea, then use it** | Introduce → safe practice → stakes / combine | Portal: checklist room → twist room |
| **Body proves understanding** | Progress requires doing the thing, not clicking Continue | Walk rings; portal walkthrough; DualSense toys |
| **Safe → stakes** | Fail cheap while learning; cost rises after mastery | Mario pipes then pits |
| **Teach when needed** | Don’t dump Day-2 systems before the first Take | BotW progressive disclosure |
| **Fantasy first** | Care about the world before chrome | Astro: you are inside the machine; Capital: living money |
| **Invisible when possible** | If the player notices “tutorial mode,” pacing is wrong | Organic / embedded tutorials |
| **Respect veterans** | Skip lands in a viable state; never punish re-entry | Adams / FTUE guides |

Hermans maps cleanly onto teaching:

- **Presentation** — the beat explains itself; show all pieces needed for the decision.
- **Elegancy** — smallest solvable setup; no red herrings; time goes to thinking, not decoding UI.
- **Aspiration** — each beat teaches something *new*; never a longer repaint of the last beat.

### 1.2 Portal’s training types (Valve)

1. **Checklisting** — clean room that broadcasts one rule (safe experiment).  
2. **Twist** — after the rule is known, invert or combine it (lateral joy).

Never: throw random pieces at a whiteboard. Always: start from one teaching goal.

### 1.3 Mario 1-1 pattern

1. Affordance (shape / color / placement suggests the verb).  
2. Safe ground between lessons.  
3. Immediate cheap failure + short restart.  
4. Same geometry later with a pit (stakes).

### 1.4 BotW Plateau pattern

- Vertical slice of the *whole* game in a bounded sandbox.  
- Camera / environment nudges > hand-holding.  
- Short diegetic lines (primacy / recency).  
- Small next goals in sight so the player never asks “what now?”

### 1.5 Astro’s Playroom pattern (Capital’s Asobi north star)

- World *is* the metaphor (inside the console ↔ inside living money).  
- Toys teach by feel (haptics / suits) — Capital analogue: organ toys, structure pads, Carpet.  
- Introduce → practice → combine (Asobi suit verbs).  
- Continual freshness: each chamber should feel like a new toy, not a new slide.

### 1.6 Anti-patterns (Adams + FTUE literature)

- Forced unskippable tutorial every new game start with no escape.  
- Walls of text / modal pauses players mash through.  
- Teaching every button in menu zero.  
- Lore / systems dump before agency.  
- Fake interactivity (only one button works; feels patronizing).  
- Teaching advanced systems before the basic loop is felt.  
- Tutorial that feels disconnected from the real game (different art, verbs, stakes).  
- Leaving steps out mid-flow.  
- Assuming reading = learning (no immediate use).

---

## 2. Honest diagnosis of live Ashore Teach (iter 22 / 12 chambers)

What we fixed that was right:

- Walk / Talk require body motion (Mario / Portal prove-it).  
- One idea *labeled* per chamber (better than the Fantasy painting strip).  
- Talk = show intent (portals, Plinth canvas, fork buttons).  
- Leave · Esc respects veterans.  
- Plaque vocabulary on practice forks (Hermans Presentation).

Where it still fails the research bar:

| Failure | Why it hurts | Research conflict |
|---------|--------------|-------------------|
| **Still a slide deck with taps** | Most chambers are “read copy → tap showcase → Continue” | Not Portal checklist rooms; not Mario geometry |
| **Practice Takes don’t land in the world** | Choosing “Jar before treat” does not change a living shore / hush / carpet home | Learning without consequence = reading |
| **Teaches the whole triangle before first fun** | Cove · Paycheck · Credit · Enter · Share all before any real voyage | BotW: teach what you need *now*; Adams: don’t front-load |
| **Aspiration collapse** | Chambers 6–8 are the same interaction (pick fork A/B) with a paint swap | Hermans: each beat must teach something *new* |
| **Disconnected from Harbor** | After teach, player re-learns Piggy / Dock in the real plaza | Organic tutorial should *be* the first level |
| **CSS paintings ≠ game paintings** | Framed portals approximate play_pad / gate but aren’t the Carpet / shore | Presentation: art must match how the puzzle behaves |
| **Length without depth** | 12 chambers increase time, not mastery of the signature loop | Elegancy: smallest solvable setup that still teaches |
| **Share / Enter before first Change** | Social object + Soft Beat taught before player has a scar | Teach when needed |
| **Fantasy still mostly text** | Thesis + Continue; Voyager pad is showcase, not a lesson gate | Body should prove fantasy somehow (poke organ toys?) |

**Bottom line:** Expanding to 12 chambers made the course *longer* and *more labeled*, but not more *Portal*. It is still closer to an illustrated FAQ than to Chamber 00.

---

## 3. What Capital’s tutorial must teach (minimum viable literacy)

Only what is required to enjoy the **next ten minutes** (signature loop), not the whole game.

### Must learn before Carpet (or in first Harbor minutes)

1. **I am the Voyager** — move in 3D.  
2. **Talk is opt-in** — near + E (Piggy).  
3. **Money Carpet boards a painting** — Cove is first.  
4. **Fantasy line** — money is alive; Harbor remembers choices.

### Must learn on first voyage (Cove → Harbor), not in pre-carpet slides

5. **Take is irreversible** — plaque words stick.  
6. **Carpet home → Plinth spectacle** — Harbor felt that.  
7. **Share exists** — after spectacle, not before.  
8. **Money Structure / Soft Beat** — when they enter the Jar, not as a glossary.

### Defer until earned

- Paycheck fork vocabulary  
- Credit Ordeal  
- Arcade vs Soft Beat taxonomy  
- Day-2 echo details  
- Outfitter / stalls / Daily Ritual  

These are **Aspiration beats on the spine**, not Ashore slides. Teaching them early is Hermans’ “longer repaint” failure.

---

## 4. Recommended redesign — “Ashore as Chamber 00” (not a 12-page course)

### North-star shape

```
Title → Cast → short Ashore pad (fantasy + walk + talk)
  → Money Carpet → Harbor (real plaza, chrome quiet)
  → Cove (first game + real Take)
  → Harbor remembers (spectacle + share)
```

Pre-carpet teach shrinks. **The first Cove→Harbor loop is the tutorial.**

### Proposed Ashore chambers (≤5, prove-it)

| # | Chamber | Teach goal | Prove (body / toy) | Text budget |
|---|---------|------------|---------------------|-------------|
| 1 | Fantasy | Money is alive; this Voyager is you | Pad with 1–2 pokeable organ toys that sing | Headline + one sentence |
| 2 | Walk | Explore by moving | Claim 3 rings (keep) | One sentence |
| 3 | Talk | Opt-in conversation | Near Piggy → E | One sentence |
| 4 | Dock | Carpet boards paintings; Cove first | Walk to mini Carpet Gate / board Cove painting in the pad world | One sentence |
| 5 | Launch | You’re going to Harbor, then Cove | Board CTA with Voyager | One sentence |

**Kill as separate Ashore pages:** Paycheck lesson, Credit lesson, Enter machines, Share freeze, return-scar slideshow, multi-landmark Harbor quiz.

**Move into the real game as organic teach:**

| Lesson | Where it teaches | Pattern |
|--------|------------------|---------|
| Take fork | Cove with Kira — real scar | Safe dialogue → irreversible → hush |
| Harbor remembers | First carpet home + spectacle | Show after doing |
| Share | Post-spectacle lower-third | Teach when needed |
| Soft Beat vs arcade | First Coin Jar enter | Checklist room inside Jar |
| Paycheck / Credit | When painting unlocks | New organ = new suit verbs |

### Portal checklist → twist for Capital

1. **Checklist (Ashore / early Harbor):** Walk, Talk, board Cove.  
2. **Twist (Cove Take → Harbor):** The choice stains home — player discovers Memory keeps.  
3. **Combine later:** Clock / Spiral organs remix the same loop with new verbs (Aspiration).

### Presentation upgrades (when we rebuild visuals)

- Prefer **real** `MoneyCarpet` / gate / Plinth mesh / arrive motifs over CSS approximations.  
- If a chamber names a painting, mount the same silhouette language as shore `play_pad`.  
- One composition per chamber viewport (brand / fantasy rules): not HUD + pad + four chips + essay.

### Elegancy upgrades

- Cap Ashore wall-clock target: **~3–5 minutes** cold, not a 12-chamber course.  
- One Continue gate per chamber max; prefer auto-advance after prove (Walk / Talk already do this).  
- Practice forks that don’t stick are red herrings — either make them diegetic toys *or* delete them.

### Aspiration upgrades

- Ashore must not preview all three Takes.  
- Each later painting’s first session should feel like a *new* organ lesson, not a replay of Ashore slides.

---

## 5. Playtest protocol (do this before more chamber count)

Cold profile · phone + desktop · reduced motion on/off.

After Ashore + first Cove→Harbor only, answer the six iconic-path questions:

1. Misunderstand what to do? (Presentation)  
2. Unfair?  
3. Repetitive without a new beat? (Aspiration)  
4. Ignored an ability they already had?  
5. Lost (place / goal)? (Presentation)  
6. Fun, or only functional?

**Pass bar:** Player can explain in kid words: *I walked, I talked to Piggy, I boarded Cove, I chose jar or treat, Harbor remembered.*  
If they can recite Paycheck / Credit / Soft Beat jargon but cannot do that loop cold — Ashore is failing.

Telemetry (if added later): drop-off chamber index, Leave·Esc rate, time-to-first-Take, time-to-spectacle.

---

## 6. Implementation status (Chamber 00 — shipped iter 23)

1. **Done:** Ashore shrunk to 5 prove-it chambers (Fantasy · Walk · Talk · Dock · Launch).  
2. **Done:** Dock boards lit Cove painting; Fantasy pokes organ toys.  
3. **In-world (crafted):** Cove Take → Harbor spectacle + Share is the twist tutorial — Alma/Kira copy + Coin Bag name the fork; cold human still Gap.  
4. **Later:** Soft Beat vs arcade teach inside first Coin Jar enter.  
5. **Done:** Share freeze removed from Ashore.  
6. **Next:** cold playtest pass bar in §5 (Harbor labels decluttered; presence beat wires soft meet).

Freeze unchanged: Harbor · Cove → Paycheck → Credit strip; Family Room local; no foreign merges.

---

## 7. Source index

- Hermans, T. [How to make a good puzzle](https://auroriax.com/puzzle-explorable/) (Presentation · Elegancy · Aspiration)  
- Game Developer — [Methods of creating invisible tutorials](https://www.gamedeveloper.com/design/methods-of-creating-invisible-tutorials)  
- Game Developer — [Examining Organic Tutorials](https://www.gamedeveloper.com/design/examining-organic-tutorials)  
- Adams, E. [Eight Ways To Make a Bad Tutorial](https://www.gamedeveloper.com/design/the-designer-s-notebook-eight-ways-to-make-a-bad-tutorial)  
- UX Collective — [BotW onboarding lessons](https://uxdesign.cc/user-onboarding-lessons-from-the-legend-of-zelda-breath-of-the-wild-8d22abec8342)  
- Valve / Game Informer — Portal test-chamber teaching (checklist vs twist)  
- Digital Foundry / Asobi — Astro’s Playroom as DualSense / world-as-metaphor teach  
- Mario 1-1 analyses — affordances, safe→stakes, zero-word literacy  
- Internal: `docs/ashore-teach-design.md`, `docs/harbor-ashore.md`, `docs/whole-game-craft.md` (iters 15–22)
