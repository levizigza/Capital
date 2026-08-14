# Capital social design — humans only when they change the game

**North star:** Do not add social features for retention theater.  
For every mechanic ask:

> **What interesting gameplay exists specifically because another human is involved?**

If a CPU temperament, rumor deck, or scripted NPC could fake it, skip it.

**Freeze:** Family Room stays **local** (same device / JSON paste). No fake multiplayer backend. Map stays Harbor · Cove → Paycheck → Credit.

---

## Existing surfaces

| Surface | Human? | Notes |
|---------|--------|-------|
| Family Room roster + JSON | Yes (local) | Names, pin studio levels, plaque myth — thin decision surface |
| Harbor Felt / weekly PNG | Outbound only | OS share; game never receives a reply |
| Party rivals | No | Seeded CPU temperaments |
| npcMemory / plaza echo | No | Sim remembers *you* |
| Studio “community” | Same device | localStorage gallery |
| Pasaran market | No | Solo fair-trade practice |

---

## Mechanic scorecard

| Mechanic | Ship? | Interesting *because* a human… | Grief / power risk |
|----------|-------|--------------------------------|--------------------|
| **Trade (online markets)** | **No** | Would need contested valuation — but backend + grief (scams, alt accounts) | High |
| **Negotiation** | Later (hot-seat) | Two people haggling a liability buyout on one board | Low if local pass-and-play |
| **Markets** | **No** (online) | Price discovery needs many humans; solo Pasaran already teaches fair trade | High |
| **Alliances** | **No** | Meaningful only with shared risk across accounts | High + fake-MP smell |
| **Competition (global)** | **No** | Leaderboard flex is retention, not Capital’s money myth | Runaway ranking |
| **Leaderboards** | **No** | Simulation + grind optimizes them; little unique human judgment | Power concentration |
| **Shared projects** | **Yes (local)** | A household **sets** a challenge another must clear on *their* terms | Cap to one active challenge; voluntary complete |
| **Spectatorship** | Soft | Watching is already the trailer; **inbound reaction** to a Take is the play | Soft stamps only — no ledger edit |
| **Reputation (global)** | **No** | NPC memory is enough for plaza; public rep invites grief | High |
| **Async interaction** | **Yes (local)** | Sibling completes a challenge later; parent stamps a share reaction | Text sanitize; no wipe powers |
| **Hot-seat rivalry** | **Next** | Real spite/timing on deal/capsule forks CPU can’t fake | Same-device only |

---

## Shipped this pass (local humans → unpredictable decisions)

### 1. Family Challenge (shared project · async)

A member **authors** one active household goal (e.g. clear a pinned studio level, earn Freedom Seal, finish Cove Take). Others **opt in** and mark complete under their name.

- **Why a human:** The *choice of what matters this week* is household values — not a weekly rotation table.
- **Anti-grief:** One challenge at a time; completions voluntary; no ranking; cannot delete another’s scar or coins.

### 2. Share Witness (observation · inbound)

After Harbor Felt, hand the device to someone nearby. They stamp **cheer / caution / curious** + name. Stamp joins Family Room myth; **never** edits the plaque or ledger.

- **Why a human:** Judgment on *your* irreversible Take — a parent’s caution vs a sibling’s cheer is not an NPC line.
- **Anti-grief:** Soft text only; capped list; voyager can skip; witness has no spend/power tools.

### Explicitly not shipping

Online trade, alliances, spectate streams, ranked leaderboards, P2P markets, reputation ladders.

---

## Next deepen (still local)

**Hot-seat rival seat** on Fortune Party: one CPU seat becomes a second human for a session. Their deal/capsule/liability forks are the unique value. Same device; no backend.

---

## Design checklist

- [ ] Would this still be fun if the “other player” were a perfect CPU? If yes → don’t ship as social.
- [ ] Can grief erase progress or concentrate power? If yes → redesign or cut.
- [ ] Does it require a server? If yes → violates freeze.
- [ ] Does it deepen Take → share → Family Room myth? Prefer that path.
