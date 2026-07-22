# Player fantasy, core loop & navigability

**Canon with:** [story-bible.md](./story-bible.md) · [game-pillars.md](./game-pillars.md)

This is the design spine for Capital — how the 17 “game craft” concerns map onto our mythology so we never ship a pretty dead-end.

---

## 1. Player fantasy

**You are a Voyager in a world where money is alive.**  
Feel: curious explorer + careful chooser — not a spreadsheet operator, not a combat god.

Every UI/mechanic decision asks: *Does this make me feel like a Voyager among Money Mascots?*

## 2. Core loop

```
Harbor (home) → Guide points → Act (outfit / spend / talk)
  → Carpet → Island chapter (Story Circle)
    → Earn / choose / learn → Return changed → Harbor grows → harder doors
```

Explore → challenge → earn → upgrade (carpet, seals, pets) → face harder islands → repeat.

## 3. Goals, rules, failure

| Question | Capital answer |
|----------|----------------|
| Accomplish? | Escape paycheck-to-paycheck; collect seals; master islands |
| Can do? | Walk, talk, enter, play, spend, sail |
| Stops me? | Soft gates (coins, freedom seal, mastery) — never silent soft-locks |
| Win? | Chapter Change (seal / unlock / guide acknowledges you) |
| Lose? | Minigame fail / bad spend — retry with a hint, keep dignity |
| After lose? | Same place, clearer next verb |

## 4–6. Feel, progression, encounters

- **Feel:** WASD tank controls, near-prompt Enter, Esc leaves dialogs, juice on earn/spend  
- **Progression:** carpet tiers, pets, plaza passes, Ledger Seals, Freedom Seal, boss mastery  
- **Encounters:** island Story Circles + deepened board minigames — not bigger HP bars  

## 7–12. Content → audio → story

Content = Money Mascots + islands + capsules. Presentation must stay readable (labels, one coach sentence). Story = Story Bible only.

## 13. Onboarding

Castle Grounds guided intro (Piggy Penny): **one verb → practice → combine**. Never dump 30 options without Cancel/Next in reach.

## 14–15. Plumbing & accessibility

Save, Esc, settings, reduced motion, text size already exist — **navigability law** below is mandatory plumbing.

## 16–17. Testing & scope

Playtest question: *Can a 5-year-old leave every screen and finish every form?*  
If not, cut content before adding systems.

---

## Navigability law (non-negotiable)

1. Every overlay has **Esc** + visible **Close / Leave**  
2. Content taller than the viewport **scrolls**; primary actions stay **sticky or in footer**  
3. Every form that collects input has a reachable **Complete** (Save / Next / Buy)  
4. Backdrop click closes unless a purchase is mid-confirm  
5. Coach text states the **one next verb**  
6. **Coin Bag** — lifelong bunny-eared buddy who **stays beside you** and **points** at who to talk to / where to go (never races ahead alone). Harbor 3D + HUD tip; island boards keep the same HUD coach.  
7. **Outfitter** is a 3D fitting room with Snapchat-style Body · Coat · Gear layers over a live mannequin (2D emoji picker is legacy/fallback only)
8. **Dialogue ↔ action sync** — if copy says Piggy is waving / nodding / pointing, the 3D mesh must play that emote the same frame. Source of truth: `src/islands/story/dialogueActionSync.ts`

Violations are bugs — same severity as soft-locks.
