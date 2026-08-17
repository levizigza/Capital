# FTUE Concept Inventory

Inventory of **concepts the first-time path attempts to teach**, grounded in existing copy, gates, and verbs.  
No invented lessons.

**Legend**

| Field | Meaning |
|-------|---------|
| Introduced | First place the concept appears in FTUE |
| Proved by doing? | Player must perform a verifying action |
| Necessary at introduce? | Required for the next forced beat |
| Class | KEEP / SIMPLIFY / MOVE LATER / MAKE INTERACTIVE / MAKE CONTEXTUAL / REMOVE / MISSING |

---

## Concept table

| # | Concept | Introduced | Player action that teaches it | Prior knowledge | Doing vs reading | Feedback | Failure | Recovery | Proves comprehension? | Necessary then? | Normal vs tutorial-only | Likely misconception | A11y notes | Telemetry | Class |
|---|---------|------------|-------------------------------|-----------------|------------------|----------|---------|----------|------------------------|-----------------|-------------------------|---------------------|------------|-----------|-------|
| 1 | Brand / Harbor fantasy | Title mural | Watch; Choose Voyager | None | Reading/watch | Era captions | — | Skip mural | No | Brand yes | Boot-only | Game is “just a mural” | Reduced motion | None | KEEP / SIMPLIFY |
| 2 | Voyager identity | Cast select | Pick cast / name | None | Doing | Avatar preview | — | Defaults | No | Soft | Boot-only | Customization = tutorial end | Focus order | Later `character_saved` | KEEP |
| 3 | Money is alive | Ashore Fantasy | Poke organ toy | None | Doing + thesis | SFX / toy | Blocked continue | Nudge | Weak | Fantasy door | Tutorial-only | Full organ literacy | — | None | KEEP |
| 4 | Organ names (Coin/Clock/Spiral/Memory) | Fantasy thesis / Ready / spine list | Mostly reading | Fantasy poke | Reading | Copy | — | — | No | **No** | Tutorial tease | “I mastered organs” | — | None | MOVE LATER |
| 5 | Walk / locomotion | Ashore Walk | Reach rings | None | Doing | Ring count | Stuck | Stay in chamber | Yes | Yes | Tutorial → normal | Rings are loot | TouchPad vs reduce | None | KEEP |
| 6 | Talk is opt-in near + E | Ashore Talk | Enter ring; E | Walk | Doing | Talk advance | E outside ring | Button when near | Yes | Yes if in teach | Tutorial rehearsal | E global | Button fallback | None | KEEP |
| 7 | Money Carpet = voyage | Ashore Dock | Board Cove painting | Walk | Doing | Dock nudge | Launch early | Nudge | Partial | Yes | Tutorial-only | Already “went” to Cove | Pointer-safe | None | KEEP |
| 8 | Signature loop foreshadow | Ashore Ready | Read Launch copy | Dock | Reading | Copy | — | Esc skip | No | Debatable | Tutorial-only | Understands Take early | — | None | SIMPLIFY |
| 9 | Harbor = home plaza | Carpet → land | Arrive | Carpet metaphor | Spectate + walk | Presence line | 3D fail | Myth fallback | Partial | Yes | Normal | — | — | `onboarding_completed`, `island_entered` | KEEP |
| 10 | Piggy = Harbor Keeper | `meet_guide` | Talk Piggy | Walk/Talk | Doing | Dialogue; advance to `to_dock` | Bypass map | Coin Bag | Yes if talked | Yes | Normal + quiet chrome | Carpet first is fine | Esc Leave | `dialogue_*` | KEEP |
| 11 | Quiet chrome / one-verb plaza | First meet / homecoming | Follow presence | — | Doing under constraint | Hidden Leave/cash; presence | Distracting stalls | Bag pulse | Partial | Yes | Overlay on normal | UI broken | Guide arrows | — | KEEP / SIMPLIFY stalls |
| 12 | Coin Bag = journey coach | Piggy Talk + Bag HUD | Follow tips | Talk | Reading tips + go | Tips / horizons | Ignore Bag | Pulse / arrows | Weak | Helpful | Normal | Bag is a quest log | Text size | — | KEEP |
| 13 | Travel map / spine paintings | `to_dock` | Open map; enter Cove | Piggy or bypass | Doing | Lock hints | Tap locked island | Hint text | Yes for Cove | Yes | Normal | All islands open | — | `opened_map` → done | KEEP |
| 14 | Progress locks | Map chips | See locked Paycheck | Cove not done | Reading hint | Lock hint | Frustration | Finish Cove Change | Yes | Yes | Normal | Soft-lock forever | — | — | KEEP |
| 15 | Earn before Take | Cove Penny quest | Collect / Coin Sort | Walk Talk | Doing | Quest complete | Minigame fail | Retry overlay | Earn yes; Take no | Yes | Normal (tutorial quest id) | Minigames are the game | Fail overlay sudden | `quest_*` `minigame_*` | KEEP |
| 16 | Fail dignity / Retry | First minigame fail | Retry / read hint | Earn attempt | Doing after fail | Fail overlay | Quit | Retry stay-put | Only after fail | On fail | Normal | Soft-lock | Organ SFX | `fail_reason` `minigame_retry` | MAKE CONTEXTUAL |
| 17 | Foreshadow / opportunity cost | Alma + Kira rows | Read then choose | Earn | Reading | Row text | Skip read | — | Weak | Helpful | Normal | Ignore foreshadow | Text density | — | SIMPLIFY |
| 18 | Irreversible Take | Kira | Choose jar vs treat | Earn | Doing | Irreversible + scar | Maybe later | Return | Partial until Harbor | **Yes** | Normal | Choice fake (both get jar) | Esc abandons | `dialogue_choice` | KEEP |
| 19 | Scar / plaque memory | After Take | Receive scar effect | Take | System | Plaque id | — | — | Later on Harbor | Yes | Normal | Cosmetic only | — | — | KEEP |
| 20 | Take hush / cinema | Shore after Take | Dismiss / carpet CTA | Take | Reading + CTA | Captions; `take_mark` | Esc early | Esc Leave | Weak | Yes | Normal | Skip = miss meaning | Reduced cinema | `core_loop_beat` take_mark | KEEP / SIMPLIFY |
| 21 | Carpet home after Change | Quiet shore | Board carpet | Hush | Doing | Pier coach tip | Wander | Bag coach | Yes | Yes | Normal | — | — | — | KEEP |
| 22 | Harbor felt / spectacle | Harbor return | Watch cinema | Scar + guided | Spectate | `harbor_felt` | Gate delay | Wait / fix guided | Strong if retellable | Yes | Normal | — | High contrast help | `core_loop_beat` harbor_felt | KEEP |
| 23 | Share card | Post-spectacle | Share / download optional | Spectacle | Optional doing | PNG / UI | Skip | Keep walking | No if skipped | Soft | Normal optional | Required or nonexistent | — | **MISSING** | MAKE CONTEXTUAL |
| 24 | Witness / Family local | Share overlay | Witness stamp optional | Share open | Optional | Myth line | Skip | — | No | Soft | Normal optional | Multiplayer | — | — | KEEP optional |
| 25 | Homecoming / Piggy names Change | Quiet Harbor | Talk Piggy | Spectacle | Doing | Message + Paycheck named | Skip Talk | Presence strip | Yes | Yes | Normal | — | — | `dialogue_*` | KEEP |
| 26 | Cove Change complete | Quest flag | Finish save/spend quest | Loop | System | Unlocks | — | — | System | Yes | Normal | — | — | `quest_completed` | KEEP |
| 27 | Free roam unlock | After Change | Open map | Loop done | Doing | Side shores / Paycheck | Choice paralysis | Bag “Next painting” | Partial | End of FTUE | Normal | Must do Paycheck now | — | — | MAKE CONTEXTUAL |
| 28 | Soft Beat ≠ arcade | Coin Jar (optional) | Enter Soft Beat | Structure enter | Doing if found | Soft Beat overlay | Never find | Organic | Often never | No for FTUE | Normal discovery | Soft Beat is a quiz | Stay-until-Leave | `soft_beat*` beats | MOVE LATER / KEEP organic |
| 29 | Outfitter / Capsule spend | Plaza discovery | Optional visit | — | Doing optional | Shop UI | Distracts FTUE | — | No | No | Normal discovery | Required gates (legacy) | — | `harbor_purchase` | MOVE LATER |
| 30 | Daily Ritual / Memory organ | Post–Cove Change | Ritual modal | Change + conditions | Reading/doing | Ritual UI | Surprise modal | Dismiss | No | No early | Normal | Another tutorial | — | — | MOVE LATER |
| 31 | Day-2 scar echo | Later session | Return next day | Scar | — | Ritual rumor | — | — | — | Not FTUE day-1 | Normal | — | — | — | MOVE LATER |
| 32 | Credit / Spiral mastery | Teased early; play later | — | Freedom + mastery | — | Lock hints | — | — | — | Not FTUE | Normal later | — | — | — | MOVE LATER |

---

## Concepts by macro stage

| Stage | Concepts in play (#) |
|-------|----------------------|
| LAUNCH | 1, 2 |
| FIRST CONTROL | 3, 5 |
| FIRST MEANINGFUL ACTION | 6, 10 |
| FIRST DECISION | 17, 18 |
| FIRST CONSEQUENCE | 19, 20 |
| FIRST REWARD | 21, 22, 25 |
| FIRST COMPLETE CORE LOOP | 26 (+ 22–25) |
| FIRST UNGUIDED DECISION | 27 |
| FREE PLAY | 27–32 as discoveries |

---

## Coverage summary

| Bucket | Count | Notes |
|--------|------:|-------|
| Proved by doing in FTUE | ~10 | Walk, Talk, Dock, voyage, earn, Take, carpet home, Piggy beats |
| Reading-heavy | ~8 | Title, thesis, Ready, foreshadow, hush, spectacle |
| Optional / often missed | Soft Beat, Share, Witness, Outfitter, Ritual | |
| Teased too early | Organ glossary, Paycheck/Credit names | |
| Missing teach | Boot telemetry, share analytics, fail preview, reduced+touch pad | |

---

## Learning-science notes (descriptive, not prescriptions)

- **Body schema first:** Walk/Talk chambers match design law (“body does the lesson”).  
- **Vertical slice:** Signature loop is played, not slideshowed — correct structure.  
- **Spaced organ literacy:** Mural thesis fights teach-when-needed by naming locked organs early.  
- **Feedback lag:** Choice difference is fully legible only after Harbor gossip/spectacle — risk window for “choice fake” misconception (both grant jar).  
- **Assessment gap:** No cold retell forced in FTUE; comprehension of “Harbor felt that” is inferred from spectacle view, not player production.
