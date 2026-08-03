# Harbor Ashore — opening tutorial redesign

**Purpose:** Replace the confusing Castle Grounds checklist with an organic tutorial that fits Memory Harbor and the signature loop.

**Canon:** [iconic-path.md](./iconic-path.md) · [player-fantasy-and-loop.md](./player-fantasy-and-loop.md) · [story-bible.md](./story-bible.md)  
**Code:** `src/islands/harborAshore.ts` · `story/storyBible.ts` · `HomeHubView.tsx` · `IslandsApp.tsx`

---

## Research pass — Portal · Asobi · Half-Life (invisible tutorial)

| Pattern | Source | Harbor rule (UI law, not only docs) |
|---------|--------|--------------------------------------|
| One verb per chamber | Portal | First viewport = **Talk Piggy** only — no Outfitter / Capsule / Party essay |
| Introduce → practice → combine | Asobi Design / Nintendo craft | Talk (introduce) → Carpet leave (practice) → Cove Take (combine irreversible choice) |
| Learn by doing in the world | Half-Life 2 | WASD / E taught inside Piggy Talk Battle — not a HUD wall or card plaza |
| Safe isolated teach | Mario / Portal | Stalls quiet until Talk is done; Outfitter is discovery after Ashore |
| Cut redundant teaches | Organic design | Boot cast already picked a look — **never** re-gate Outfitter-card onboarding |
| Single coach surface | Anti–UI stack | Never stack Castle coach + Piggy presence + whisper saying the same verb |
| Memory after mastery | BotW / modern UX | Daily Ritual waits until Cove Change — Harbor must have a scar first |

**Combine moment:** Cove Take is the first irreversible money choice. Harbor’s job ashore is *meet the Keeper + leave for the painting*, then *remember* when you return (spectacle → share → Piggy → day-2 → ritual).

---

## Critical path (MVP — enforced in code)

```
ashore (meet_guide)  →  Talk Piggy
voyage  (to_dock)    →  Money Carpet → Coincraft Cove
done                 →  free Harbor
```

| Surface | Enforces |
|---------|----------|
| `normalizeHubGuidedIntro` / `getHubGuidedStep` | Legacy Outfitter/Capsule steps → `to_dock` |
| `sanitizeIslandSave` | Mid-saves cannot revive Outfitter gates |
| `piggyGuidedGraph` / Coin Bag / visual beats | Live copy is Talk or voyage only |
| `IslandsApp` | **No** `WelcomeOnboarding` mount — Ashore land completes without Outfitter cards |
| Veil / myth / Talk CTA | Talk · Carpet · Cove verbs only |

Outfitter, Capsule, practice board, Daily Ritual are **plaza discoveries** after Talk — not gates on the first session.

---

## Chrome law

| Beat | Shown | Hidden |
|------|-------|--------|
| First meet | Place chip · Talk CTA · short controls whisper | Coach card · CASH · Leave · Apprentice · stall grid · Daily Ritual · Outfitter chrome |
| Voyage | One coach line · map CTA · Coin Bag → carpet | Stall checklist pressure · Outfitter pulse |
| Done / free | Full plaza (Outfitter as discovery) | — |
| Quiet homecoming | Same presence law as first meet | Ritual / stalls |

---

## Daily Ritual (Memory organ)

Auto-open **only** when:

1. Castle Grounds complete  
2. Map opened once (`didDock`)  
3. **Cove Change done** (Harbor has a scar to remember)  
4. Not mid talk / cinema / homecoming  

Before that, ritual is a hotspot the player can ignore.

---

## Demoted (do not re-wire)

- `WelcomeOnboarding` Outfitter-card plaza + Fortune Party essay — kept on disk, **not mounted**
- Legacy step ids `walk_outfitter` · `become_you` · `tiny_spend` · `practice_optional` · `first_island` — save-compat only; always normalize to voyage
