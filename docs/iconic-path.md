# Iconic path — depth before width

Capital’s north star for this phase: make **one money choice** feel unforgettable.

**Teaching north star:** [`ftue/NORTH_STAR.md`](./ftue/NORTH_STAR.md) — players should remember how the world works; **Independent Transfer Rate** is the king FTUE KPI.

**Design constitution:** [`CAPITAL_DESIGN_BIBLE.md`](./CAPITAL_DESIGN_BIBLE.md) — fantasy, loop, pillars, economy/progression, social, metrics, feature approval, and the ship question: *Does this help Capital generate a more interesting player story?*

**Related audits:** [`COMPLEXITY_CUT_REVIEW.md`](./COMPLEXITY_CUT_REVIEW.md) · [`LONGEVITY_100H.md`](./LONGEVITY_100H.md) · [`FEATURE_GATE.md`](./FEATURE_GATE.md) · [`design/VERTICAL_SLICE_GATE.md`](./design/VERTICAL_SLICE_GATE.md) — **NOT CLEARED** until external playtest

## Signature loop (protect this)

1. Coincraft Cove irreversible Take  
2. Soft chapter hush (`chapterQuietPending`)  
3. Harbor scar spectacle (“Harbor felt that”) + Memory Plinth glow  
4. Share PNG (default social object)  
5. Quiet plaza → Piggy homecoming  
6. Day-2 rumor + plaza locals naming the plaque  

## Money Structures (Astro-style depth)

Each island may host one **Money Structure** — a landmark you climb *into*. Inside, glowing parts open playable money worlds.

| Place | Structure | Entry | Parts |
|-------|-----------|-------|-------|
| Coincraft Cove | Giant Coin Jar | Coin slot | Cork Vault · Coin Spring · Lid Lookout |
| Harbor Haven | Ledger Bank | Brass vault door | Safe Heart · Ledger Stamp · Teller Window |
| Paycheck Peninsula | Payroll Tower | Paycheck chute | Bucket Press · Time Clock · Umbrella Loft |
| Credit Kingdom | Interest Keep | Interest spiral | Debt Anvil · Dispatch Hatch · Score Battlement |

Money Structures path complete for the triangle spine (Cove → Paycheck → Credit + Harbor).

Harbor plaza craft: see [astro-craft-translation.md](./astro-craft-translation.md) — CPU-Plaza distill (fountain + bank + Money Carpet Gate + few pavilions; utilities as signposts).

**World open (Astro Bot style):** carpet land + Money Structure enter use unique motifs per world (coin slot / paycheck chute / interest spiral / vault door) via `WorldArriveOverlay` — visual only; Fortune soundtrack cues unchanged.

Shore craft: every non-hub island gets `ShoreRhythmCraft` (tiers, eye-path, berms, banners, pier mouth) plus **organ-true motifs** from [`moneyOrgans.ts`](../src/islands/moneyOrgans.ts) — Coin stacks · Clock field · Spiral runes. Harbor Memory lights ledger lines + Plinth scar label when a plaque exists. Cove / Paycheck / Credit hush dims the Money Structure landmark in-world after irreversible Take.

**Money Structure toys:** interiors use organ floor motifs + pokeable toys (coins, clocks, stamps, spirals); part pads answer when poked.

**Organ audio:** Structure enter + Soft Beat + toys fire Memory/Coin/Clock/Spiral stingers; interior BGM ducks the organ bed via `MusicPlace` `{ kind: "structure" }`.

**Share object:** after scar spectacle, “Harbor felt that” PNG preview + Share/download (organ-tinted) — default social object.

**Mural thesis:** see [mural-thesis.md](./mural-thesis.md) — living money organs; if it cannot name organ + suit verb, it does not ship on the spine.

This is **structure depth** on the main quest. Era **side shores** may ride the outer map ring with their own music — they are not new main-course strip chips. See [era-shores-restore.md](./era-shores-restore.md).

## Cold playtest checklist

Use a fresh profile (or QA seed). Phone + desktop. Try `prefers-reduced-motion`.

**Cadence (Pillar 16):** after each pillar fix → `npm run test:iconic` → (Harbor/Cove/carpet touch) `npm run test:iconic:e2e` → one cold run below → update [full-game-craft-board.md](./full-game-craft-board.md) (pointer in [iconic-craft-plan.md](./iconic-craft-plan.md)). Machine map: `src/qa/iconicCraftCadence.ts`.

| Step | Pass look / feel |
|------|------------------|
| Cove Take | Irreversible Take verb → dismiss Talk → **world cinema** (jar/shore visible, captions not a modal card) → soft HUD + “Carpet home — Harbor felt that” |
| Carpet to Cove | Targeted flight is a short **carpet rail** (≤12s) — never a stuck free-flight | 
| Structure enter | Room silhouette + lit interior always; plaza/shore stays mounted under overlay |
| Structure pads | Unique part silhouettes (`StructurePartSilhouette`) + Soft Beat lookout beacon — readable without HUD text on Pages |
| Structure exit | No Harbor remount — walkable plaza returns instantly |
| Piggy first meet | Piggy front-and-center; E prefers Talk over bank during `meet_guide`; Castle coach names the next verb while the plaza teaches it |
| Ashore voyage | After Talk → Money Carpet → Coincraft Cove (Outfitter / Capsule / Daily Ritual are discoveries, not gates) |
| No coach ahead | `meet_guide` Talk Battle never names Outfitter / Capsule / Cove |
| Quiet chrome | Until Piggy talk (first meet **and** quiet homecoming): no CASH / Leave / Apprentice / stall grid / Daily Ritual auto-open |
| Slow-device Harbor | Myth fallback (Talk Piggy → Carpet) — never a settings dashboard |
| Carpet home | Welcome waits until after spectacle |
| Spectacle | Hush → chime → captions over **Plinth camera lock** (not a modal card) → Plinth pulse |
| Share | Plinth **freeze-frame** over locked Harbor (PNG hero + lower-third retell — not a settings modal); readable at thumbnail size |
| Piggy | Quiet Harbor presence (no stall grid / no “noticed” modal checklist) until Talk Battle |
| Day 2 | Soft Beat–style “Still here” cinema — no tutorial modal |
| Soft Beat | Lid / Loft / Battlement / Teller — hush overlay, not a toast |
| Trailer | Memory Plinth → Replay signature beat (~24s, mute-friendly) |
| Mute-test stingers | Volume 0: Take mark + Harbor felt still *read* as beats (no silent empty flash) |
| Esc · Leave overlays | Signature overlays dismiss with Esc and a sticky Leave — never trap |
| Corrupt save never bricks | Poison `island_save_v1` still boots Harbor (sanitize → playable defaults) |
| Reduced motion | Settings **or** OS reduce: softer cinema timings; Take/Plinth strobes damp (`cinemaFlashAmp`) |

**After the loop — six questions (write answers in the PR / board):**

1. Did the player misunderstand what to do? *(Presentation — did the puzzle explain itself?)*  
2. Did anything feel unfair?  
3. Did anything feel repetitive without a new beat? *(Aspiration)*  
4. Did the game ignore a clear ability the player already had?  
5. Did the player get lost (place or goal)? *(Presentation — were all pieces shown?)*  
6. Did the moment feel fun, or only functional?

Craft lens: [puzzle-explorable-craft.md](./puzzle-explorable-craft.md) (Hermans — Presentation · Elegancy · Aspiration).

**Harbor Ashore (redesign):** see [harbor-ashore.md](./harbor-ashore.md) — Talk → Carpet → Cove; Daily Ritual only after Cove Change. Early chrome hides Leave / CASH / stall grid until Talk is done.

**QA seeds (dev / `VITE_QA=1`):**

```js
await __QA__.seedSignatureLoop("spectacle_ready")
await __QA__.seedSignatureLoop("day2_echo")
// Overnight craft after a same-day Take (backdates scar + rolls scar_echo_*):
__QA__.prepareDay2Echo()
__QA__.playSignatureTrailer()
```

Automated: `npm run test:iconic` (unit contracts + content validate). Harbor/Cove smoke: `npm run test:iconic:e2e`.

Cold organ scripts (QA build on :5000): `scripts/cold-full-cove-chain.mjs` · `cold-day2-coin-echo.mjs` · `cold-full-paycheck-chain.mjs` · `cold-full-credit-chain.mjs` · `cold-spine-retell.mjs` · `cold-human-triangle-pass.mjs` · `cold-structure-soft-beat-exit.mjs`.

```js
await __QA__.seedSignatureLoop("spectacle_ready", "clock") // or "coin" | "spiral"
```

## Freeze (do not ship yet)

- **No new main-course islands** beyond Harbor · Cove → Paycheck → Credit. Era **SIDE SHORE** chapters may sit on the outer ring with their own music ([era-shores-restore.md](./era-shores-restore.md)).  
- **No fake multiplayer backend** (Family Room stays local/device-share).  
- **No BMO / CBE / Nathan Project** content merged into Capital.  
- Prefer deepening Harbor memory, scars, Piggy/Coin Bag bond, and share moments over widening the main strip.

**Parked “later” sink (Pillar 17):** [iconic-later.md](./iconic-later.md) — put new *main-course* island ideas and deferred polish there. Guarded by `iconicScopeFreeze.test.ts`.

## Identity freeze (Wave 4)

- Player-facing world name: **Fortune Archipelago** (Capital = product brand).  
- Travel **strip** = **Harbor · Cove · Paycheck · Credit**; 3D map + carpet also show era **side shores** (soft-locked until Cove Change) with per-shore soundtrack cues.  
- Phone cold-play: on-screen **Walk** pad on Harbor / shores (coarse pointer).  
- Signature trailer: mute-friendly captions + Piggy/Coin Bag silhouettes.

## Lasting craft (Wave 5)

- Harbor always-on micro-life: fountain jet, pennants, **Fortune flags**, idle wave/cheer, Coin Bag bob, contact shadows (quieter under reduced motion).  
- Family Room names the latest plaque as a **local myth** (device-only — no fake MMO).  
- First-run settings mirror `prefers-reduced-motion`; Soft Beat / World Arrive / music beds duck with Settings OR OS (`prefersReducedMotion`).  
- Take mark / Plinth spectacle strobes damp under reduce (`cinemaFlashAmp`) — steady organ read, no blinding flash.

## Organ score (Wave 6)

- Spine beds speak the mural: **Memory Courtyard · Coin Jar Morning · Clock Stamp Shift · Spiral Interest Keep**.  
- Post-Take hush ducks the shore organ bed (`MusicPlace.shore.hush`) while Take cinema plays the matching organ stinger.  
- Mute-test chain: Take open `scar_chime`+organ → mark `take_mark` → Harbor spectacle hush `scar_chime` → reveal `harbor_felt`+organ+`plinth_hum` → share reprises `harbor_felt`. Harbor plaza bed ducks (`MusicPlace.harbor.hush`) so those stingers read.  
- Settings copy names organs, not leftover genre-city labels.  
- Off-spine genre cues stay available; the frozen triangle leads with organ language.

## Reliability gate (before more iconic polish)

Cold play is blocked if Harbor never becomes playable. Ship this before Wave-8 content:

1. **Harbor never sticks** — Continue paints before WebGL; cheap probe before R3F; hard myth escape under 3s (`harborLoadFailsafe.ts`); sticky `capital_harbor3d_fail` skips Canvas next visit.  
1b. **Corrupt save never bricks** — `sanitizeIslandSave` coerces poison version-1 shapes to Harbor-safe arrays/objects (or default save).  
2. **CSP allows audio** — `media-src 'self' data: blob:` so Howler / data beds are not blocked on Pages.  
3. **E2E stays green** — skip SW under `navigator.webdriver` + kill-switch init so `controllerchange` reloads do not flake `__QA__.ready`.

Only after a phone hard-refresh shows title mural → cast select → Money Carpet → Harbor (3D or myth) within a few seconds: cold-retell polish → title voice on thresholds → one Harbor icon → stop.

## Cold retell (Wave 7) — iconic path capstone

A cold player (or a kid watching) should be able to say one sentence per organ after Harbor return:

| Organ | Shore Take | Harbor proof |
|-------|------------|--------------|
| Coin | Cove hush | Plaque + share seal says COIN |
| Clock | Paycheck hush | Plaque + day-2 / Piggy name Clock |
| Spiral | Credit hush | Plaque + Family myth name Spiral |
| Memory | Home plaza | Plinth + locals keep naming yesterday |

- Plaza echo, Piggy, day-2 cinema, Family Room myth, and share PNG all carry the **organ word**.  
- Day-2 audit accepts Cove **or** Paycheck **or** Credit scars.  
- After Wave 7: freeze the iconic path — open map width only when the cold retell test passes.

### Cold-retell polish

Canonical kid sentences (`coldOrganKidSentence` — plaque-free):

| Organ | Cold sentence |
|-------|---------------|
| Coin | The Coin holds — save a little; the jar still waits. |
| Clock | The Clock shelters — wait under the umbrella before glitter. |
| Spiral | The Spiral withstands — wait beats haste on the interest wall. |
| Memory | Memory keeps — Harbor remembers your Take on the Plinth. |

With a plaque (spectacle retell, share, Plinth, Family Room):

`The {Coin holds|Clock shelters|Spiral withstands|Memory keeps} — Harbor remembered: “{plaque}.”`

Spectacle headline (one mythology — never “Coin Change” vs “Clock Take”):

`Harbor felt that — the {Coin holds|Clock shelters|Spiral withstands}`

| Organ | Plaque labels | Suit hush verb |
|-------|---------------|----------------|
| Coin | Jar before treat / Treat before jar | holds |
| Clock | Umbrella before glitter / Glitter ate the umbrella | shelters |
| Spiral | Waited the spiral / Haste fed the spiral | withstands |

### Title voice on every threshold

Brand kit in [`titleVoice.ts`](../src/islands/titleVoice.ts): **Capital** → **Fortune Archipelago** → organ/place → diegetic verb.

At carpet dock, World Arrive, Harbor load, shore HUD, structure enter/exit, Soft Beat, Leave, travel map, Take hush, spectacle, and share — the player should still hear Capital / Fortune / Money is alive after stripping chrome.

### One Harbor icon — Memory Plinth

The kid-drawable Harbor silhouette is the **Memory Plinth**: open ledger on a terrace + scar lamp (`harborIcon.ts` · `MemoryPlinthMesh`).

- Always present on Harbor (empty shelf → scar-lit after Take).  
- Share PNG + signature trailer draw the same ledger-plinth silhouette.  
- Ledger Bank stays the enterable Money Structure; fountain / carpet stay wayfinding — Plinth is the Memory proof.

**Take world cinema (deepen, not widen):** after Kira’s irreversible Take and Talk dismiss, the shore owns the climax — organ landmark mark flash + captions (no dark modal card). Carpet CTAs return when cinema ends.

**Spectacle world cinema:** after carpet home from a Take, Harbor locks the camera on the Memory Plinth — captions at the edge, scar lamp peaks, Coin Bag points at memory before Piggy welcome.

**Share freeze-frame:** after spectacle, the same Plinth lock holds while the felt PNG sits in a lower band — live lamp stays visible through the vignette aperture; lower-third retell + Share / Keep walking.

**Piggy presence:** after share, Harbor stays quiet — stall grid hidden, Coin Bag points Piggy, diegetic bubble (not emoji shorthand), no “Piggy Penny noticed” tutorial modal. One job: walk to her when ready.

**Leitmotif + material:** spectacle reveal and share open speak the scar organ stinger over Memory `plinth_hum`. Plinth lamp/ring tint follows the scar organ. Money Structure floors, exit rings, pads, and fill lights use organ-true shells (`structureShell` / `organMaterialTint`) — Coin gold · Clock sky · Spiral violet · Memory amber, never one cyan kit. Shore motif / toy pokes fire the matching organ SFX.

**Plinth glow truth:** cinema lock holds through share and afterglow (`plinthGlow`); lamp peaks after hush (not under the dark beat); day-2 echo is Soft Beat cinema over the live Plinth, and Visit/dismiss pulses the lamp before any plaque modal.

**Iconic path stop:** do not widen the map. Deepen only if the Plinth glow is not yet true.

When in doubt: make the Plinth glow true, and make tomorrow remember yesterday.

## Series cast (Cashwell Capital)

Illustrated series leads enter **one by one** — see [`series-cast.md`](./series-cast.md).  
**Cashwell**, **Cashmere Couture**, **Peso Pedro**, **Fortuna Fernanda**, **Billionaire Bao**, **Jade Fortune**, **Sultan Stacks**, **Dinar Dahlia**, **Mansa Moneybaggs**, **Kandake Kash**, **Moneybagg Bro**, and **Mula Mami** are the series faces (Memory Courtyard terrace). They do **not** replace Piggy or Coin Bag on the signature loop, and they stay offstage during Piggy presence beats.

**The Debt Collector** is the Credit Kingdom Ordeal villain (Bank of Obligation) — never a Harbor terrace lead.

## Cast as memory

Piggy, Coin Bag, and plaza locals are **living receipts** — not props:

- Ambient lines name the latest plaque (dense plaza echo + Piggy always).
- Talk Battles open on scar memory when plaques exist.
- Coin Bag points at Plinth / locals after spectacle and on day-2 echo.

## Opt-in talk (PC courtesy)

Talk Battle is **never** auto-started by walking near someone (Harbor or shores).  
Approach → prompt → **E / Enter / Talk button**. Same pattern as Zelda/BOTW interact prompts.
