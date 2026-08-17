# FTUE Friction Map

**Scope:** Friction on the real first-time path (Launch → Free Play).  
**Evidence:** Code + design docs only. No invented systems.

Friction = anything that slows, confuses, soft-locks, or burns trust before the first complete core loop.

Severity: **S0** blocks / soft-lock · **S1** high confusion · **S2** medium drag · **S3** polish

---

## Friction by macro stage

### LAUNCH

| ID | Friction | Severity | Evidence | Player feels | Class |
|----|----------|----------|----------|--------------|-------|
| F01 | Title mural every full page load; length before first control | S2 | `App.tsx` bootPhase title; `shouldPlayCapitalIntroOnBoot` | “When do I play?” | SIMPLIFY |
| F02 | Cast customize can delay first Walk | S3 | `BootCastSelect` optional customize | Progress anxiety | MOVE LATER |
| F03 | No telemetry on title/cast | S1 (for designers) | No `analytics.track` in intro/cast | Invisible funnel | MISSING |

### ASHORE (Chamber-00)

| ID | Friction | Severity | Evidence | Player feels | Class |
|----|----------|----------|----------|--------------|-------|
| F04 | Five chambers before real Harbor | S2 | `STEPS = fantasy→walk→talk→dock→ready` | Tutorial fatigue | SIMPLIFY |
| F05 | Fantasy continue gated on poke — easy, but thesis text heavy | S3 | `fantasyPoked.length >= 1` + `MURAL_THESIS` | Skim / skip reading | SIMPLIFY |
| F06 | Walk rings: reduced motion hides TouchWalkPad | S0–S1 | `TouchWalkPad` + `prefersReducedMotion` | Stuck on touch+reduce | MISSING a11y |
| F07 | Talk requires near-ring; E outside does nothing | S2 | Ashore talk key handler needs `nearTalk` | “Controls broken” | KEEP pattern / MAKE CONTEXTUAL feedback |
| F08 | Dock “Board Cove first” if Launch early | S3 | muted CTA + `dockNudge` | Mild confusion | KEEP |
| F09 | Ready chamber lectures signature loop before lived | S2 | Ready showcase copy | Cognitive load | SIMPLIFY |
| F10 | Esc skips entire Ashore with no “you skipped control practice” re-hook | S1 | Esc → `onComplete` | Skippers under-prepared | MAKE CONTEXTUAL |

### CARPET → HARBOR MEET

| ID | Friction | Severity | Evidence | Player feels | Class |
|----|----------|----------|----------|--------------|-------|
| F11 | Carpet cinema is passive | S3 | `CarpetOpeningIntro` timeout/Esc | Waiting | SIMPLIFY |
| F12 | WebGL fail → myth fallback (good) but different UI language | S2 | `mythFallbackActions` | “Different game?” | KEEP / MAKE CONTEXTUAL |
| F13 | First-meet stalls still walkable (Outfitter/Capsule/Carpet) | S1 | Strip only on quiet homecoming | Distracted from Piggy | SIMPLIFY |
| F14 | `opened_map` completes guided without Piggy Talk | S1 | `advanceHubGuided` `opened_map` from `meet_guide` | Miss Keeper beat | MAKE CONTEXTUAL |
| F15 | Double Teach of Talk (Ashore + Harbor) if no skip | S2 | Both paths | Redundant | SIMPLIFY |

### COVE PRE-TAKE

| ID | Friction | Severity | Evidence | Player feels | Class |
|----|----------|----------|----------|--------------|-------|
| F16 | Multi-NPC quest chain before Take | S2 | Penny → pouch → sort → Alma → Kira | “Where’s the point?” | KEEP with clearer Bag horizons |
| F17 | First minigame fail unexplained until overlay | S1 | fail overlay only on fail | Panic / quit | MAKE CONTEXTUAL |
| F18 | Optional digression/Soft Beat can derail pacing | S3 | Shelly; Coin Jar Soft Beat | Lost critical path | KEEP optional / MAKE CONTEXTUAL Bag |

### TAKE → LOOP CLOSE

| ID | Friction | Severity | Evidence | Player feels | Class |
|----|----------|----------|----------|--------------|-------|
| F19 | Choice rows pack foreshadow + stance in one line | S1 | Cove JSON Kira choices | Decision fatigue | SIMPLIFY |
| F20 | Both Takes grant jar → “choice fake?” | S1 | both give `cc_savings_jar` | Misconception until Harbor gossip differs | MAKE CONTEXTUAL (Harbor must show difference early) |
| F21 | Hush cinema reading load | S2 | `TakeHushOverlay` | Skip / Esc | SIMPLIFY |
| F22 | Spectacle gated on guided complete / plaza ready | S1 | `signatureCinemaGate` | “Where’s my reward?” | KEEP gate / clearer wait state |
| F23 | Share optional + no tip + no analytics | S2 | share overlay; no track | Miss social beat | MAKE CONTEXTUAL / MISSING |
| F24 | Quiet homecoming strips stalls — sudden UI change | S3 | `shouldStripPlazaForPresence` | Disorientation | KEEP / MAKE CONTEXTUAL whisper |

### FREE PLAY ENTRY

| ID | Friction | Severity | Evidence | Player feels | Class |
|----|----------|----------|----------|--------------|-------|
| F25 | Sudden unlock of Paycheck + side shores + magnets | S2 | `hasCompletedCoveChange` | Choice paralysis | MAKE CONTEXTUAL (one next tip) |
| F26 | Daily Ritual can appear after conditions — new system | S3 | `shouldAutoOpenDailyRitual` | Modal surprise | MOVE LATER / MAKE CONTEXTUAL |
| F27 | Organ vocabulary (Clock/Spiral) known from mural but locked | S3 | Ashore spine paintings list | Tease without play | MOVE LATER |

---

## Friction heat along the path

```
Title ██░░░░░░░░  F01
Cast  █░░░░░░░░░  F02
Ashore ████████░░  F04–F10
Carpet ██░░░░░░░░  F11–F12
Harbor meet ██████  F13–F15
Cove earn █████░░░  F16–F18
Take ████████░░░  F19–F20
Hush/Spectacle ███  F21–F24
Free play ███░░░░░  F25–F27
```

---

## Soft-lock & recovery inventory (exists)

| Risk | Recovery that exists |
|------|----------------------|
| Talk Battle stuck | Esc · Leave |
| Myth / 3D fail | Talk + Carpet always on `myth_meet` |
| Structure minigame fail | Stay-put + Retry overlay |
| Kira deferred | “Maybe later” + return |
| Chapter quiet | Carpet home CTA + Bag pier coach |
| Guided incomplete spectacle | Gate waits; map can finish guided |

---

## Misconception clusters

1. **“I boarded Cove in Ashore”** — practice painting ≠ voyage.  
2. **“E talks from anywhere”** — near-gated.  
3. **“Choice doesn’t matter”** — both grant jar; difference is Harbor memory/gossip.  
4. **“Carpet before Piggy is correct”** — allowed by map bypass.  
5. **“Tutorial done at Ashore Launch”** — real teach is Cove→Harbor loop.  
6. **“Share is required”** or opposite **“Share doesn’t exist”** — optional unmarked.

---

## Accessibility friction summary

| Barrier | Where | Severity |
|---------|-------|----------|
| No touch pad under reduced motion | Ashore Walk / shores | S0–S1 |
| Cinema flash reduced but still long text | Hush / spectacle | S2 |
| Guide arrows help but can feel nagging | Harbor | S3 |
| High contrast helps Harbor felt lower-third | Spectacle | KEEP |

---

## Instrumentation friction (meta)

| Gap | Impact |
|-----|--------|
| No Ashore `tutorial_step` | Cannot rank F04–F10 empirically |
| No share track | Cannot see F23 uptake |
| `onboarding_completed` fires at land / carpet boot — **before** Cove Change | Misnamed relative to “first loop complete” |

---

## Top friction to fix first (maps to audit top 10)

1. F03 + onboarding event semantics — measure boot drop-off  
2. F14 — Piggy bypass  
3. F10 + F15 — Ashore skip vs double-teach  
4. F13 — first-meet distraction  
5. F19 — Take text density  
6. F17 — first fail teach  
7. F23 — share contextual + telemetry  
8. Soft Beat discovery rate (related F18)  
9. F09 + F27 — early organ vocabulary  
10. F06 — reduced+touch walk
