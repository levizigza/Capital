# Player fantasy, core loop & navigability

**Canon with:** [story-bible.md](./story-bible.md) · [game-pillars.md](./game-pillars.md)

This is the design spine for Capital — how the 17 “game craft” concerns map onto our mythology so we never ship a pretty dead-end.

---

## 1. Player fantasy

**You are a Voyager in a world where money is alive.**  
Feel: curious explorer + careful chooser — not a spreadsheet operator, not a combat god.

Every UI/mechanic decision asks: *Does this make me feel like a Voyager among Money Mascots?*

### Fantasy yes / no (Harbor + Cove — Pillar 1 pass)

| Yes | No (patch or cut) |
|-----|-------------------|
| Piggy + Coin Bag on the plaza; Talk names living temperaments | Fake HP bars / duel chrome on Talk Battle |
| Money Carpet map as floating myth islands | PERF / Dev Errors as default first-viewport chrome |
| Quiet first-meet (no CASH / Leave / stall grid) | Sterile blue void behind Talk (reads as settings onboarding) |
| Cove Take that Harbor can name later | Ledger dashboards as hero chrome before Change |

**Shipped (Pillar 1):** Talk Battle stage paints place sky + soft plaza (Harbor Memory courtyard); combat HP strips removed; PERF overlay defaults off (backtick to toggle).

**Shipped (Pillar 2 — core loop):** Signature cinema (spectacle → share → day-2) waits until Harbor plaza is ready; Piggy HUD stays hidden for the whole cinema chain; myth path uses a quiet Memory stage under Plinth cinema (not “Piggy is waving”); day-2 echo waits until Piggy has been talked to.

## 2. Core loop

```
Harbor (home) → Guide points → Act (outfit / spend / talk)
  → Carpet → Island chapter (Story Circle)
    → Earn / choose / learn → Return changed → Harbor grows → harder doors
```

Explore → challenge → earn → upgrade (carpet, seals, pets) → face harder islands → repeat.

**Financial quest taxonomy:** Main Quest = Story Circle campaign spine (`MAIN_COURSE` + island `track: "main"`). Side Quests = optional open-world digressions (`SIDE_TOMFOOLERY` + island `track: "side"`). Coin Bag tips prefer Main Quest.

**Genre biome cities:** Chapter islands are original Capital futures under genre *lenses* (`genreWorlds.ts` — Ledgerlight Sprawl, Verdant Shareholds, Helix Harbor, Selfstock Archive, Voidfolio Reach, Afterledger Wastes, Mindwage Terminal). Sister islands are distinct **districts**. Harbor stays meadow Ordinary World. No franchise titles in shipped copy.

## 3. Goals, rules, failure

| Question | Capital answer |
|----------|----------------|
| Accomplish? | Escape paycheck-to-paycheck; collect seals; master islands |
| Can do? | Walk, talk, enter, play, spend, sail |
| Stops me? | Soft gates (coins, freedom seal, mastery) — never silent soft-locks |
| Win? | Chapter Change (seal / unlock / guide acknowledges you) |
| Lose? | Minigame fail / bad spend — retry with a hint, keep dignity |
| After lose? | Same place, clearer next verb |

**Shipped (Pillar 3 — goals / failure):** After a minigame miss (including score-below-threshold), Capital shows a dignity overlay with why + **Retry** / stay-put; structure fails no longer dump to Harbor; ModularMinigame ends as “Round over” until the parent judges the clear. Cove Take hush already names the next verb (board carpet home).

## 4–6. Feel, progression, encounters

- **Feel:** WASD tank controls, near-prompt Enter, Esc leaves dialogs, juice on earn/spend  
- **Progression:** carpet tiers, pets, plaza passes, Ledger Seals, Freedom Seal, boss mastery  
- **Encounters:** island Story Circles + deepened board minigames — not bigger HP bars  

**Shipped (Pillar 4 — controls & feel):** Signature Take mark / Plinth spectacle / share fire `triggerJuice` (SFX + nudge/burst); Settings → Game Feel; minigame fail shakes. Juice CSS mounts on `GameViewport`.

**Shipped (Pillar 5 — progression):** After Cove Take, Harbor can answer “what’s newly true?” — `Coin holds` on Plinth retell/shelf/share + Piggy homecoming names **Paycheck Peninsula** newly open on the Carpet (Clock → Credit).

**Shipped (Pillar 6 — encounters):** Credit’s three tests are spiral-true — Inbox → Score Scanner (Debt Anvil) → earned wait/haste Take. Cut “Debt Loadout” categorize clone of Paycheck Budget Split.

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
6. **Coin Bag** — lifelong bunny-eared buddy who **stays beside you** in Harbor plazas, island shores, and painting worlds, and **points** at who to talk to / where to go (never races ahead alone). 3D mesh + HUD tip stay in sync. Soft off-screen **edge cue** only when needed; **Ignore arrow** mutes pointing for free roam / sidequests.  
7. **Outfitter** is a 3D fitting room with Snapchat-style Body · Coat · Gear layers over a live mannequin (2D emoji picker is legacy/fallback only)
8. **Dialogue ↔ action sync** — if copy says Piggy is waving / nodding / pointing, the 3D mesh must play that emote the same frame. Source of truth: `src/islands/story/dialogueActionSync.ts`

Violations are bugs — same severity as soft-locks.
