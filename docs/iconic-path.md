# Iconic path — depth before width

Capital’s north star for this phase: make **one money choice** feel unforgettable.

## Signature loop (protect this)

1. Coincraft Cove irreversible Take  
2. Soft chapter hush (`chapterQuietPending`)  
3. Harbor scar spectacle (“Harbor felt that”) + Memory Plinth glow  
4. Share PNG (default social object)  
5. Quiet plaza → Piggy homecoming  
6. Day-2 rumor + plaza locals naming the plaque  

Polish this loop like a boss fight before adding systems.

## Cold playtest checklist

Use a fresh profile (or QA seed). Phone + desktop. Try `prefers-reduced-motion`.

| Step | Pass look / feel |
|------|------------------|
| Cove Take | Soft HUD, “Quiet after the Take”, Coin Bag hush tip |
| Carpet home | Welcome waits until after spectacle |
| Spectacle | Hush → chime → “Harbor felt…” → Plinth pulse |
| Share | PNG prompt immediately; card readable at thumbnail size |
| Piggy | Quiet Harbor until Talk Battle |
| Day 2 | Soft “Still here” surprise — no tutorial tone |
| Trailer | Memory Plinth → Replay signature beat (~24s, mute-friendly) |

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
