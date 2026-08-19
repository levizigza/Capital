# Capital — Visible UI Audit & Progressive Layers

**Status:** Design audit of player-facing chrome  
**Law:** Do **not** permanently show information merely because the simulation tracks it.  
**Test for every value:** *What decision does seeing this help the player make?* If none → reconsider primary-screen placement.  
**Companions:** `FINANCIAL_FEEDBACK_VOCABULARY.md` · `CAPITAL_DESIGN_CONSTITUTION.md` (§ contextual UI, progressive disclosure) · `docs/ftue/PROGRESSIVE_DISCLOSURE_DESIGN.md` (concept phases — orthogonal)  
**Evidence base:** Harbor / shore / travel / overlays / boot as shipped on `main` (see HomeHubView, IslandShoreView, TravelMapView, signature overlays).

---

## 1. Classification legend

| Class | Meaning |
|-------|---------|
| **ALWAYS_REQUIRED** | Needed whenever this surface is playable to navigate, leave, or know where you are |
| **CONTEXTUALLY_REQUIRED** | Required only while a specific beat / decision is active |
| **DETAIL_ON_DEMAND** | Available via enter / Talk / modal / Plinth — not persistent HUD |
| **ADVANCED_ONLY** | After proof (e.g. Cove Change, Freedom chase) or Settings / experienced players |
| **UNNECESSARY** | Does not help a decision on this screen; cut, demote, or never promote |

---

## 2. Three layers

### LAYER 1 — Persistent game state

Only what must stay visible to **orient and act** without opening a menu.

| Allowed on Layer 1 | Decision it serves |
|--------------------|--------------------|
| Place identity (Harbor / island name / organ verb on spine shores) | Where am I? Which organ fantasy? |
| Compact **Cash** (pouch) when spend/travel decisions are available | Can I afford the next Commit / shop? |
| One **next-verb** affordance (Talk / Enter / Board / Leave) | What can I do right now? |
| Esc / Leave on blocking overlays | How do I get out? |
| Global music mute | Can I control audio? (a11y / comfort — always) |
| Quiet / cinema modes may **strip** Layer 1 further (presence over meters) | Protect Take → Piggy causality |

**Not Layer 1 by default:** full CF statement, Freedom streak math, carpet tier name, mastery N/3, XP, skillStats, weekly %, stance, wealth rank bar, digression shelf counts, analytics.

### LAYER 2 — Information for the **current decision**

Shown only while that decision is live; cleared when the decision ends.

| Context | Layer 2 content | Decision helped |
|---------|-----------------|-----------------|
| Opportunity / deal panel | Cost · ghost +N/mo · Pass/Wait as “instead of” | Commit A/B/Wait |
| Take Talk choices | Holds/Owes or Risk framing · `/mo` when real | Which fork? |
| Soft Beat | Peek copy only | Arm or leave |
| Near hotspot | Enter / Talk / Board label | Interact now? |
| Castle coach / Coin Bag one tip | Single next verb | What next without dashboard |
| Seal chase (only while chasing) | Streak or CF-vs-$30 — **one** line | Do I Collect Pay Day / buy CF? |
| Map pin hover/lock | Lock hint | Where can I sail? |
| Pay Day modal | Collect vs already collected | Claim income now? |
| Quiet shore | Carpet home CTA + organ quiet badge | Board home after Take? |

### LAYER 3 — Detailed analysis on demand

Opened intentionally; never permanent plaza chrome.

| Surface | Contents | Decision helped |
|---------|----------|-----------------|
| Memory Plinth modal | Scars, organs, because-lines | What did I choose? What next painting? |
| Voyager Ledger (expanded / post-Cove panel) | Income, expenses, holdings list | Which drain/hold to care about? |
| Freedom Pavilion | Carpet tiers, escape celebration | Expression after Freedom |
| Settings | A11y, profile, juice, replay Ashore, analytics export | Meta preference — not money judgment |
| Family Room | Local codes, witnesses | Social myth |
| Capsule / Outfitter / Studio / Arcade | Toys & looks | Side expression (after discovery) |
| Ritual weekly share | Progress / PNG | Optional ritual — not spine |
| Structure interior pads | Part blurbs | Which pad to open? |

---

## 3. Element audit (primary surfaces)

### 3.1 Harbor plaza HUD

| Element | Class | Layer | Decision test | Verdict |
|---------|-------|-------|---------------|---------|
| Quiet chip (“Harbor is quiet…”) | CONTEXTUALLY_REQUIRED | 2 | Reminds presence beat — Talk Piggy, not shop | KEEP while quiet/first-meet |
| Outfitter avatar button | DETAIL_ON_DEMAND / ADVANCED | 3 entry | Opens looks — not money judgment | Demote during castle; OK free roam as discovery |
| WealthHud compact Cash | CONTEXTUALLY_REQUIRED → near ALWAYS on free roam | 1 | Afford deal/shop/carpet polish? | KEEP when spend possible; hide during quiet/cinema/first-meet |
| WealthHud rank / XP bar | UNNECESSARY | — | No money decision | NEVER on primary (already hidden in compact) |
| VoyagerLedgerHud compact CF | ADVANCED_ONLY (after Cove) | 1-lite / 2 | Buy CF vs Wait? Collect Pay Day? | KEEP only post–Cove Change; expand detail on demand |
| Freedom chip (Seal chase / Freed · boat) | CONTEXTUALLY_REQUIRED when chasing or freed | 2 | Chase: earn CF / Pay Day; Freed: expression | KEEP while `isSealChasing` or freed; omit otherwise. Boat label on Freed → DETAIL_ON_DEMAND if noisy |
| Leave Fortune Archipelago | ALWAYS_REQUIRED (free roam) | 1 | Exit product | KEEP; hide during quiet/castle/first-meet |
| Castle coach card | CONTEXTUALLY_REQUIRED | 2 | Next verb only | KEEP; never stack with spectacle |
| Coin Bag tip (+ optional painting/seal horizons) | CONTEXTUALLY_REQUIRED | 2 | One next action | KEEP one sentence; horizons ADVANCED — hide if no decision |
| Guide arrows toggle | DETAIL_ON_DEMAND | 3 | Spatial help | KEEP optional |
| Talk CTA | CONTEXTUALLY_REQUIRED | 2 | Talk now? | KEEP near Piggy / quiet force |
| Travel CTA (Board Carpet · Cove) | CONTEXTUALLY_REQUIRED | 2 | Sail to Cove? | KEEP on voyage step |
| Enter {store} / Board carpet near | CONTEXTUALLY_REQUIRED | 2 | Enter this hotspot? | KEEP |
| Controls whisper (Move · talk · map) | CONTEXTUALLY_REQUIRED early; later DETAIL | 2→3 | How do controls work? | KEEP early; shorten once fluent |
| Piggy presence line | CONTEXTUALLY_REQUIRED | 2 | Walk to fountain? | KEEP first-meet/quiet |
| TouchWalkPad | CONTEXTUALLY_REQUIRED (coarse) | 1 | Move | KEEP on touch |
| Global music mute | ALWAYS_REQUIRED | 1 | Mute/unmute | KEEP (App-level) |
| Diegetic hotspot labels (Arcade, Capsule, …) | CONTEXTUALLY_REQUIRED after unlock | World L2 | Enter this place? | KEEP sparse; strip on quiet homecoming (carpet+plinth remain) |
| Settings signpost | DETAIL_ON_DEMAND | 3 | Open settings | KEEP world entry — not HUD chip |
| Family / Studio / Gallery magnets | ADVANCED_ONLY (post–Cove) | 3 | Side content | KEEP gated |
| Ritual auto-open | UNNECESSARY as ambush | — | — | Must stay off (already) |
| Loading veil copy + Enter Harbor | ALWAYS_REQUIRED while loading | 1 | Enter without soft-lock | KEEP |
| Myth fallback Talk/Carpet/Bank | ALWAYS_REQUIRED if 3D fails | 1 | Continue play | KEEP |

### 3.2 Shore HUD

| Element | Class | Layer | Decision test | Verdict |
|---------|-------|-------|---------------|---------|
| Island name + icon | ALWAYS_REQUIRED (non-quiet) | 1 | Where am I? | KEEP |
| Organ verb chip | CONTEXTUALLY_REQUIRED on spine | 1–2 | Which suit fantasy / Take type? | KEEP spine; not a meter |
| Next verb / free-roam line | CONTEXTUALLY_REQUIRED | 2 | What is main course next? | KEEP one line |
| Quiet badge + plaque shelf | CONTEXTUALLY_REQUIRED post-Take | 2 | Board home; remember Take | KEEP |
| WealthHud | CONTEXTUALLY_REQUIRED | 1 | Shore spends? | KEEP non-quiet; hide in hush |
| Character avatar | UNNECESSARY on shore | — | No decision | Demote (cosmetic only) |
| Money Carpet / Harbor buttons | ALWAYS_REQUIRED | 1 | Leave shore | KEEP |
| Carpet home CTA (quiet) | CONTEXTUALLY_REQUIRED | 2 | Complete signature return | KEEP |
| Interact CTA | CONTEXTUALLY_REQUIRED | 2 | Talk / enter structure | KEEP |
| Coin Bag | CONTEXTUALLY_REQUIRED | 2 | Next verb | KEEP |
| Culture/cast stacks | UNNECESSARY | — | — | Already cut from shore HUD |

### 3.3 Travel map

| Element | Class | Layer | Decision test | Verdict |
|---------|-------|-------|---------------|---------|
| Capital / Fortune Archipelago chip | ALWAYS_REQUIRED | 1 | Brand + place | KEEP |
| Back Harbor | ALWAYS_REQUIRED | 1 | Cancel travel | KEEP |
| Spine pins + Here/Locked | ALWAYS_REQUIRED | 2 | Where to sail? | KEEP |
| Lock hints (Freedom / mastery / Cove) | CONTEXTUALLY_REQUIRED when locked | 2 | What unlocks this? | KEEP named hints |
| Free-roam whisper | ADVANCED_ONLY after Cove | 2 | May I stray? | KEEP short |
| Next boat coin gate line | DETAIL_ON_DEMAND / ADVANCED | 3 | Vanity carpet — weak money judgment | Demote; not Layer 1 |
| Side shore decade labels | DETAIL_ON_DEMAND | 3 | Flavor | OK on map mesh; not HUD meters |
| Esc Harbor hint | ALWAYS_REQUIRED | 1 | Leave map | KEEP |

### 3.4 Signature overlays

| Element | Class | Layer | Decision test | Verdict |
|---------|-------|-------|---------------|---------|
| Take hush captions + footprint | CONTEXTUALLY_REQUIRED | 2 | Feel irreversible; board home | KEEP |
| Carpet home CTA in hush | CONTEXTUALLY_REQUIRED | 2 | Return | KEEP |
| Scar spectacle headlines + kid sentence | CONTEXTUALLY_REQUIRED | 2 | Interpret Take | KEEP; no meters |
| Share PNG / Keep walking | CONTEXTUALLY_REQUIRED | 2 | Social vs find Piggy | KEEP |
| Newly true / next painting line | CONTEXTUALLY_REQUIRED | 2 | Where can I sail next? | KEEP one line |
| Witness stamps | DETAIL_ON_DEMAND | 3 | Family myth | KEEP optional |
| Soft Beat title + leave | CONTEXTUALLY_REQUIRED | 2 | Peek then leave | KEEP |
| Day-2 Visit Plinth / Leave | CONTEXTUALLY_REQUIRED | 2 | Acknowledge echo | KEEP |
| Esc · Leave chrome | ALWAYS_REQUIRED on overlays | 1 | Dismiss | KEEP |
| Trailer captions | DETAIL_ON_DEMAND | 3 | Optional myth | KEEP skippable |

### 3.5 Boot / FTUE-7

| Element | Class | Layer | Decision test | Verdict |
|---------|-------|-------|---------------|---------|
| Title Capital / Choose Voyager | ALWAYS_REQUIRED | 1 | Start | KEEP |
| Cast select + experienced skip | CONTEXTUALLY_REQUIRED | 2 | Who am I? Skip teach? | KEEP |
| Customize look | DETAIL_ON_DEMAND | 3 | Expression | KEEP optional |
| FTUE beat chrome (Goal…Deeper) | CONTEXTUALLY_REQUIRED | 2 | Prove skill | KEEP sequential |
| Leave · Esc on teach | ALWAYS_REQUIRED | 1 | Abort | KEEP |
| Decision A/B practice | CONTEXTUALLY_REQUIRED | 2 | Rehearse fork | KEEP (fake save OK) |

### 3.6 Structure interior

| Element | Class | Layer | Decision test | Verdict |
|---------|-------|-------|---------------|---------|
| Organ + structure name | ALWAYS_REQUIRED | 1 | Where am I? | KEEP |
| Close vault / Return | ALWAYS_REQUIRED | 1 | Exit | KEEP |
| Near-part Open CTA | CONTEXTUALLY_REQUIRED | 2 | Enter pad? | KEEP |
| Toy poke hints | DETAIL_ON_DEMAND | 3 | Play | KEEP light |
| Full pad catalog list | UNNECESSARY as HUD | — | — | Prefer diegetic pads |

### 3.7 Tracked by sim but not primary UI

| Tracked | Class on plaza | Why |
|---------|----------------|-----|
| XP / level | UNNECESSARY | No money decision (bible hide) |
| skillStats | UNNECESSARY | Coach-only; no panel |
| Stance counters | UNNECESSARY | Identity via scars |
| Mastery N/3 | DETAIL_ON_DEMAND / map lock only | Show when Credit pin locked — not plaza always |
| Digression shelf gaps | DETAIL_ON_DEMAND | Plinth/shelf — not HUD |
| Weekly ritual % | DETAIL_ON_DEMAND | Ritual modal |
| Boom/recession economy.ts | UNNECESSARY on Harbor | Split truth |
| Full holdings list | DETAIL_ON_DEMAND | Ledger expand |
| Analytics events | ADVANCED_ONLY | Settings export |

---

## 4. Target composition by beat

| Beat | Layer 1 | Layer 2 | Layer 3 |
|------|---------|---------|---------|
| First-meet / quiet homecoming | Mute; controls whisper; presence | Talk CTA; quiet chip | None |
| Free Harbor (post-Cove) | Cash; Leave; mute | Coin Bag one tip; near Enter; CF compact if deciding Pay Day/deals | Plinth, Settings, shop, ledger expand |
| Opportunity / deal | Cash; CF if visible | Cost · return preview · Wait | Full holdings |
| Shore explore | Name; organ; Leave/Carpet; Cash | Next verb; near Interact; Bag | — |
| Post-Take quiet shore | Organ quiet; Leave | Carpet home; plaque line | — |
| Cinema chain | Mute only (optional) | Overlay captions + Esc | Share witness optional |
| Travel map | Brand; Back | Spine pins + lock hints | Boat vanity line |

---

## 5. Cut / demote list (UNNECESSARY or over-persistent)

1. Wealth **rank** / “N to next” on any play HUD  
2. Persistent **Freedom · boat label** when not chasing and not in Pavilion  
3. Coin Bag **painting + seal horizons** stacked when tip already states the verb  
4. Shore **avatar** as status chrome  
5. Travel **next carpet coin gate** as primary voyage pressure (vanity ≠ judgment)  
6. Any permanent **mastery N/3** or **XP** on Harbor  
7. Ritual / Studio / Arcade as first-hour HUD (magnets only after Cove; discovery)  
8. Dual weather / economy-phase widgets on Harbor  

---

## 6. Design checklist (before shipping UI)

- [ ] Named decision this element helps  
- [ ] Class assigned (ALWAYS → UNNECESSARY)  
- [ ] Layer 1–3 placement  
- [ ] Hidden during cinema / quiet when it would race Piggy or Take  
- [ ] Not shown solely because save field exists  
- [ ] Color not sole signal (`FINANCIAL_FEEDBACK_VOCABULARY.md`)  
- [ ] Esc/Leave if blocking  

---

## 7. Relation to Living Cashflow Commit

When Opportunity panel ships (approved prototype):

- **Layer 1:** Cash (+ CF if already unlocked)  
- **Layer 2:** Opportunity A/B/Wait numbers + one Bag line  
- **Layer 3:** Full ledger holdings  

Do not add streak, mastery, XP, or weekly % to that panel.

---

## 8. Success criteria

- Cold Harbor first-meet: no CF/Freedom/Leave clutter — Talk is obvious  
- Post-Cove free roam: Cash + one tip + diegetic doors; ledger only when CF decisions matter  
- Player asked “what is this number for?” can answer with a decision, not “the game tracks it”
