# Harbor Ashore — opening tutorial redesign

**Purpose:** Replace the confusing Castle Grounds checklist with an organic tutorial that fits Memory Harbor and the signature loop.

**Canon:** [iconic-path.md](./iconic-path.md) · [player-fantasy-and-loop.md](./player-fantasy-and-loop.md) · [story-bible.md](./story-bible.md)  
**Code:** `src/islands/harborAshore.ts` · `story/storyBible.ts` · `HomeHubView.tsx`

---

## Patterns we stole (iconic tutorials)

| Pattern | From | Harbor rule |
|---------|------|-------------|
| One verb at a time | Portal chambers | First viewport = **Talk Piggy** only |
| Learn by doing | Half-Life 2 invisible tutorial | WASD/E taught inside Talk Battle, not a wall of HUD |
| Safe isolated teach | Mario / Portal | Stalls dark until Talk is done |
| Introduce → practice → combine | Craft plan / CCST | Talk (introduce) → Carpet (practice leave) → Cove Take (combine choice) |
| No checklist before mastery | BotW / modern UX | Daily Ritual waits until Cove Change — Harbor must have a memory first |
| Cut redundant teaches | Organic design | Boot cast already picked a look — do not gate Outfitter again |
| Single coach surface | Anti–UI stack | Never stack Castle coach + Piggy presence + whisper saying the same verb |

---

## Critical path (MVP)

```
ashore (meet_guide)  →  Talk Piggy
voyage  (to_dock)    →  Money Carpet → Coincraft Cove
done                 →  free Harbor
```

Outfitter, Capsule, practice board, Daily Ritual are **plaza discoveries** after Talk — not gates on the first session.

Whole-game fit: Cove Take is the first irreversible money choice; Harbor’s job ashore is *meet the Keeper + leave for the painting*, then *remember* when you return (spectacle → share → Piggy → day-2 → ritual).

---

## Chrome law

| Beat | Shown | Hidden |
|------|-------|--------|
| First meet | Place chip · Talk CTA · short controls whisper | Coach card · CASH · Leave · Apprentice · stall grid · Daily Ritual |
| Voyage | One coach line · map CTA · Coin Bag → carpet | Stall checklist pressure |
| Done / free | Full plaza | — |
| Quiet homecoming | Same presence law as first meet | Ritual / stalls |

---

## Daily Ritual (Memory organ)

Auto-open **only** when:

1. Castle Grounds complete  
2. Map opened once (`didDock`)  
3. **Cove Change done** (Harbor has a scar to remember)  
4. Not mid talk / cinema / homecoming  

Before that, ritual is a hotspot the player can ignore.
