# Harbor Ashore — opening tutorial redesign

**Purpose:** Teach controls and the Fortune Archipelago loop *before* the Money Carpet, then land on a walkable Harbor where Talk is opt-in.

**Canon:** [iconic-path.md](./iconic-path.md) · [player-fantasy-and-loop.md](./player-fantasy-and-loop.md) · [story-bible.md](./story-bible.md)  
**Code:** `src/islands/views/AshoreComprehensionTutorial.tsx` · `harborAshore.ts` · `HomeHubView.tsx` · `App.tsx`

---

## Research pass — Portal · Asobi · Half-Life (comprehension first)

| Pattern | Source | Capital rule |
|---------|--------|--------------|
| Prove you can move | Portal / Mario | Pre-carpet gates: → · ← · ↑ · E |
| Introduce → practice → combine | Asobi Design | Teach (introduce) → Harbor walk (practice) → Cove Take (combine) |
| Learn by doing | Half-Life 2 | No card essay of Outfitter/Party — prove controls, then free plaza |
| No ambush dialogue | BotW courtesy | Walk to Piggy → bubble → player chooses Talk |
| One coach surface | Anti–UI stack | Pre-carpet teach owns instructions; Harbor is soft tip + world |

**Combine moment:** Cove Take remains the first irreversible money choice.

---

## Boot path

```
Title mural → Cast select → Ashore teach (comprehension) → Money Carpet → Harbor plaza
```

| Beat | Job |
|------|-----|
| Teach | Controls + Harbor jobs + spine organs (Memory · Coin · Clock · Spiral) |
| Harbor `meet_guide` | Free walk · Piggy waves · Talk when near + opt-in |
| Voyage `to_dock` | Board Money Carpet → Coincraft Cove |
| Done | Free Harbor |

Soundtrack cues stay the Wave 6 organ beds (`soundtrackCatalog.ts` / `public/audio/soundtrack/*.ogg`) — do not replace the bangers.

---

## Chrome law

| Beat | Shown | Hidden |
|------|-------|--------|
| First meet | Soft tip · Piggy bubble when near · walkable plaza | Forced Talk CTA from spawn · stall-strip hush |
| Near Piggy | “Talk to Piggy?” | — |
| Voyage | Carpet CTA · Coin Bag → carpet | Outfitter pulse |
| Quiet homecoming | Piggy presence hush (scar memory) | Stall grid / ritual steal |

---

## Daily Ritual (Memory organ)

Unchanged — waits for Cove Change + scars. Never steals first-meet.

---

## Demoted

- Forced bottom Talk CTA on spawn (replaced by walk-up opt-in)
- `WelcomeOnboarding` Outfitter-card plaza — still not mounted
- Legacy Outfitter/Capsule guided gates — still normalize to voyage
