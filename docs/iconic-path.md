# Iconic path — depth before width

Capital’s north star for this phase: make **one money choice** feel unforgettable.

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
| Harbor Haven | Ledger Bank | Brass vault door | Safe Heart · Payday Stamp · Teller Window |
| Paycheck Peninsula | Payroll Tower | Paycheck chute | Bucket Press · Time Clock · Umbrella Loft |
| Credit Kingdom | Interest Keep | Interest spiral | Debt Anvil · Dispatch Hatch · Score Battlement |

Money Structures path complete for the triangle spine (Cove → Paycheck → Credit + Harbor).

Harbor plaza craft: see [astro-craft-translation.md](./astro-craft-translation.md) — CPU-Plaza distill (fountain + bank + Money Carpet Gate + few pavilions; utilities as signposts).

**World open (Astro Bot style):** carpet land + Money Structure enter use unique motifs per world (coin slot / paycheck chute / interest spiral / vault door) via `WorldArriveOverlay` — visual only; Fortune soundtrack cues unchanged.

Shore craft: every non-hub island gets `ShoreRhythmCraft` (tiers, eye-path, berms, banners, pier mouth) plus **organ-true motifs** from [`moneyOrgans.ts`](../src/islands/moneyOrgans.ts) — Coin stacks · Clock field · Spiral runes. Harbor Memory lights ledger lines + Plinth scar label when a plaque exists. Cove / Paycheck / Credit hush dims the Money Structure landmark in-world after irreversible Take.

**Money Structure toys:** interiors use organ floor motifs + pokeable toys (coins, clocks, stamps, spirals); part pads answer when poked.

**Share object:** after scar spectacle, “Harbor felt that” PNG preview + Share/download (organ-tinted) — default social object.

**Mural thesis:** see [mural-thesis.md](./mural-thesis.md) — living money organs; if it cannot name organ + suit verb, it does not ship on the spine.

This is **structure depth**, not map width — still no new outer islands.

## Cold playtest checklist

Use a fresh profile (or QA seed). Phone + desktop. Try `prefers-reduced-motion`.

| Step | Pass look / feel |
|------|------------------|
| Cove Take | Soft HUD, “Quiet after the Take”, Coin Bag hush tip |
| Carpet to Cove | Targeted flight is a short **carpet rail** (≤12s) — never a stuck free-flight | 
| Carpet home | Welcome waits until after spectacle |
| Spectacle | Hush → chime → “Harbor felt…” → Plinth pulse |
| Share | PNG prompt immediately; card readable at thumbnail size |
| Piggy | Quiet Harbor until Talk Battle |
| Day 2 | Soft “Still here” surprise — no tutorial tone |
| Soft Beat | Lid / Loft / Battlement / Teller — hush overlay, not a toast |
| Trailer | Memory Plinth → Replay signature beat (~24s, mute-friendly) |

**Harbor tutorial chrome:** early Castle Grounds hides Leave, Archipelago chip, and Outfitter avatar until those steps matter — Coin Bag + Piggy only.

**QA seeds (dev / `VITE_QA=1`):**

```js
await __QA__.seedSignatureLoop("spectacle_ready")
await __QA__.seedSignatureLoop("day2_echo")
__QA__.playSignatureTrailer()
```

Automated: `npm test -- src/qa/signatureLoop.test.ts` and `npx playwright test e2e/signature-loop.spec.ts`.

## Freeze (do not ship yet)

- **No new outer islands** beyond the existing triangle spine (Cove → Paycheck → Credit).  
- **No fake multiplayer backend** (Family Room stays local/device-share).  
- **No BMO / CBE / Nathan Project** content merged into Capital.  
- Prefer deepening Harbor memory, scars, Piggy/Coin Bag bond, and share moments over map expansion.

When in doubt: make the Plinth glow true, and make tomorrow remember yesterday.

## Cast as memory

Piggy, Coin Bag, and plaza locals are **living receipts** — not props:

- Ambient lines name the latest plaque (dense plaza echo + Piggy always).
- Talk Battles open on scar memory when plaques exist.
- Coin Bag points at Plinth / locals after spectacle and on day-2 echo.

## Opt-in talk (PC courtesy)

Talk Battle is **never** auto-started by walking near someone (Harbor or shores).  
Approach → prompt → **E / Enter / Talk button**. Same pattern as Zelda/BOTW interact prompts.
