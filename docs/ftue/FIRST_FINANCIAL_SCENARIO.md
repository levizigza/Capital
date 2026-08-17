# First playable financial scenario — Capital

**Id:** `first_cove_footprint`  
**Systems:** production `EarnSpend` + `ChangeMaking` (`mg_coin_sort`) · Cove irreversible Take · `voyagerLedger.addHolding` · `harborWeather`  
**Rule:** No tutorial-only money math. No feature tour. No single forced path unless the learning objective requires it.  
**Loop:** NOTICE → DECIDE → ACT → SEE CHANGE → EXPERIENCE CONSEQUENCE → UNDERSTAND WHY → TRY AGAIN

---

## Why this scenario

The game’s interesting claim is: **a money choice leaves footprints the world can show back.**  
The smallest playable proof uses:

1. **Real earn/spend rules** in `EarnSpendModule` (insufficient funds is a real reject, not a fake tutorial flag).  
2. **Real irreversible Take** (`cove_save_vs_spend`) already in Cove content.  
3. **Real ledger holdings** applied from the Take stance so cashflow (and later Harbor weather) actually moves — not a fake “+tutorial points” meter.

---

## Beat map

| Beat | Player experience | Production system | Makes action… |
|------|-------------------|-------------------|---------------|
| **NOTICE** | Jobs and craft buys sit on the same board; wallet starts empty | EarnSpend UI model | **Obvious** — earn buttons show +$; spend shows cost |
| **DECIDE** | Which job / whether to buy now | Player choice among earnOptions & spendOptions | **Interesting** — multiple jobs & buys |
| **ACT** | Tap earn or spend | `EarnSpend.apply` | **Safe to try** — broke spend shows “Not enough money!” and state unchanged |
| **SEE CHANGE** | Wallet number moves; transaction list grows | Module state `wallet` / `transactions` | **Interpretable** — same units in/out |
| **EXPERIENCE CONSEQUENCE** | Clear Coin Sort → real pouch coins; then Kira Take jars or treats | Quest/minigame rewards + `setIrreversible` + scar + **ledger holding** | **Hard to misunderstand** — Harbor plaque + cashflow delta match stance |
| **UNDERSTAND WHY** | Short diegetic lines (Kira / hush / organ), not a glossary | Existing Take hush + kid sentences | One sentence, after the act |
| **TRY AGAIN** | Fail Coin Sort → Retry stay-put; broke spend → earn more; Kira “Maybe later”; next Take later | Fail overlay · EarnSpend · dialogue defer | Never soft-locks |

---

## Valid paths (not one golden path)

| Path | Valid? | Outcome |
|------|--------|---------|
| Earn → spend craft supply → clear ChangeMaking | Yes | Quest progress |
| Earn → earn → spend expensive item | Yes | Same |
| Spend first with $0 | Yes (safe fail) | Warning; try earn |
| Fail Coin Sort score | Yes | Retry / hint; stay on shore |
| Skip digression Shelly | Yes | Main path intact |
| Do Shelly patience or impulse | Yes | Digression scar; no chapter quiet |
| Kira jar before treat | Yes | Saver scar + **Cove Jar Hold** asset (+$/mo) |
| Kira treat before jar | Yes | Spender scar + **Cove Treat Tab** liability (−$/mo) |
| Kira Maybe later | Yes | No irreversible; return when ready |
| Open map / leave lighthouse | Yes | Can return |

**Required for “Change” quest complete:** some irreversible Cove Take (jar *or* treat). Not which one.

---

## Explicit non-goals

- Feature tours / multi-arrows / advisor lectures  
- Terminology dump (APR, diversification, liquidity)  
- Fake “tutorial ledger” parallel to `voyagerLedger`  
- Locking the shore UI without a diegetic reason  
- Forcing jar over treat (or vice versa)

---

## Code

| Piece | Path |
|-------|------|
| Scenario API + ledger footprint | `src/islands/firstFinancialScenario.ts` |
| EarnSpend production rules | `src/mechanics/modules/EarnSpendModule.ts` |
| Cove content | `content/coincraft-cove.islands.json` |
| Wire Take → ledger | `IslandsApp` on `setIrreversible` `cove_save_vs_spend` |
| Tests | `firstFinancialScenario.test.ts` |

---

## Success criterion (player)

After one session a new player can act without a lecture and later say something like:  
*“I earned, I chose jar or treat, and Harbor / my cashflow showed it.”*
