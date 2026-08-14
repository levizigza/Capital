# Emergent player identity — behavior, not a menu

Two Voyagers should feel different on Harbor without relying on Outfitter cosmetics. Identity emerges from **how you play**, and the world names it.

Freeze: Harbor · Cove → Paycheck → Credit.

Code: `src/islands/emergentIdentity.ts`

---

## Differentiation axes (beyond cosmetics)

| Axis | Sources in Capital | Cosmetic? |
|------|-------------------|-----------|
| **Strategy / investment philosophy** | Deal accept vs pass · asset mix · Freedom chase | No |
| **Risk tolerance** | Credit haste vs wait · liabilities · Collector exposure | No |
| **Specialization** | Soft Beat organ affinity · island scars · skill lean | No |
| **Assets / business model** | Ledger holdings · cashflow composition | No |
| **Relationships** | Piggy bond · npcMemory talks · plaque-named locals | No |
| **Territory** | Plaza passes · Freedom Pavilion · carpet tier | Partial (carpet look + access) |
| **Collections** | Scars · studio marks · capsules as tools | Mixed |
| **Reputation** | Stance axes + emergent archetype (world voice) | No |
| **Playstyle** | Dominant stance + deal patience + bond depth | No |
| **Decision history** | Irreversible Takes · plaques · playStats | No |
| **Look** | Character / companion mesh | Yes — keep, don’t rely |

### Day-5 sameness gap (before this work)

Opposite Cove Takes still got the same Soft Beat body, same deal panel, same Piggy advice shape — only a plaque string changed. Stance was a greeting appendix, not a living identity.

---

## Emergent archetypes (not menu picks)

Detected from save signals. Unstable early; settles after Takes + a few board months.

| Id | Emerges when | World recognizes |
|----|--------------|------------------|
| **jar_keeper** | Saver lean + Cove jar / protect scars; few liabilities | Piggy pouch-first; Lid Soft Beat heavy jar; deal counsel patience |
| **glitter_runner** | Spender lean + treat/glitter scars; more accepts than patience | Stalls light up; Soft Beat thin street; cooling-off deal tip |
| **umbrella_steward** | Paycheck protect + healthy CF / Freedom chase | Clock shelters line; loft “dry”; fair/boom weather flavor |
| **spiral_rusher** | Credit haste + risk stance | Dock wind sharp; battlement tight; storm bias named |
| **patience_coil** | Credit wait + saver/balanced | Coil cools; wait-beats-haste counsel; Piggy trust |
| **booth_builder** | ≥2 income assets · dealsAccepted lean · Freedom or chasing | Cashflow path praise; compounding deal tip; Pavilion gravity |
| **harbor_ghost** | ≥2 scars but Piggy bond ≪ scar count | Strain homecoming; “walk to Piggy”; plaque without repair |

Players never pick these. They shift when behavior shifts.

---

## Recognition surfaces

1. **Piggy / Talk** — archetype opener replaces thin stance-only hint when settled  
2. **Weather coach** — mood line + identity whisper  
3. **Soft Beat** — fork/identity vista line under the organ peek  
4. **Deal panel** — counsel by archetype (not XP rebalance)  
5. **Memory Plinth** — “Harbor reads you as …” shelf  

Optional counters: `playStats.dealsAccepted` / `dealsPassed` so patience is remembered.

---

## Anti-patterns

- No character-select “I am a Saver” menu  
- No locking an archetype forever after one Take  
- Cosmetics remain expression, not the only difference  
- Don’t invent new islands for identity  
