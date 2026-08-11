# Era side shores — restore plan

**Status:** Active — user override of the outer-island freeze for **discoverable side shores**.  
**Spine freeze still holds:** main quest remains Harbor · Cove → Paycheck → Credit only.

## Problem

The live carpet only showed the four spine chips. Eight era / genre islands (and their per-shore soundtrack cues) stayed parked, so players never heard neon sprawl, scrap coast, AI undercity, etc. Harbor plaza also stacked Ledger Bank and Piggy into the fountain volume.

## Architecture (two lanes)

| Lane | Travel IDs | Role |
|------|------------|------|
| **Spine** (`SPINE_TRAVEL_IDS`) | harbor_haven · coincraft_cove · paycheck_peninsula · credit_kingdom | Signature loop, strip chips, Soft Beat course |
| **Side shores** (`SIDE_SHORE_TRAVEL_IDS`) | signal_city · venture_foundry · financial_assets · digital_assets · business_assets · intangibles · future_shores · real_estate | Discoverable era shores; Capital-framed; own music |
| **Parked** | starter_key_cove | Demo / Key Cove — stays off map |

Map ring layout:

1. **Inner ring** — spine (familiar order).
2. **Outer ring** — era shores, clockwise by genre family so visual rhythm matches soundtrack families.

Soft lock: side shores unlock after **first Cove Change** (same gate as Paycheck), so first-run still teaches the signature loop.

## Soundtrack (already catalogued)

| Shore | Cue |
|-------|-----|
| venture_foundry | neon_sprawl |
| signal_city, future_shores | solarpunk_cove |
| financial_assets | scrap_coast |
| digital_assets | ai_undercity |
| business_assets, real_estate | orbital_keep |
| intangibles | nocturne_void |
| spine | Soft Beat / Soft Pulse (unchanged) |

## Harbor plaza master plan

Fountain stays at plaza origin `[0,0,0]` as the civic center.

| Landmark | Position | Rationale |
|----------|----------|-----------|
| Fountain | `0, 0, 0` | Center court |
| Piggy | `-2.8, 0, 2.4` | SE of fountain, clear of water |
| Ledger Bank | `7.8, 0, -3.6` | East commercial block — vault door faces plaza, not basin |
| Memory Plinth | `5.8, 0, 4.2` | SE civic corner |
| Outfitter | `0, 0, -8.8` | North wall shop |
| Arcade | `-7.2, 0, -4.2` | West entertainment block |
| Carpet gate | `0, 0, 12.6` | South departure (unchanged) |

Clearance rule: no building footprint within ~4.5 units of fountain center; doors open onto open pavers, not water.

## Out of scope

- Fake multiplayer / Family Room backend  
- Merging Nathan / BMO / CBE into Capital  
- Widening the **main quest** beyond Cove → Paycheck → Credit  
- New soundtrack assets (reuse existing `.ogg` cues)  
