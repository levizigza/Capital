# Harbor Haven plaza master plan

**Job:** Fountain is the court center. Doors open onto aprons. No façade sits on the pier → fountain axis so water never reads “inside” a doorway.

## Law

1. **Court center** — Fountain at `[0,0,0]`; walk mosaic ~4.8u radius stays clear of footprints and doors.
2. **Off-axis façades** — Pier approach is +Z → −Z through the fountain. Outfitter / Bank / Arcade must not put their door on that axis.
3. **Face the court** — Local door is +Z; `yaw` turns that face toward the fountain from a setback.
4. **Apron before door** — Coin eye-path curves around the basin to each door; never a straight line through water.

## Slots (XZ)

| Landmark | Position | Why |
|----------|----------|-----|
| Fountain | `0, 0` | Civic center |
| Piggy | `-2.8, 2.4` | SW apron, clear of water |
| Ledger Bank | `10.2, 1.2` | Due-east commercial block; door faces west onto court |
| Memory Plinth | `5.8, 4.2` | SE civic corner |
| Outfitter | `-3.6, -9.4` | NNW shop — **off** the pier axis so fountain isn’t “in” the door |
| Arcade | `-8.6, -2.8` | West entertainment |
| Carpet gate | `0, 12.6` | South departure (axis OK — leave, not a building door) |
| Notice board | `-5.4, 5.6` | SW information |

Guarded by `harborPlazaPlan.ts` + `harborPlazaMasterPlan.test.ts`.
