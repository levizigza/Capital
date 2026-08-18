# Paycheck Peninsula — Story Circle (Island 2)

**Island ID:** `paycheck_peninsula`  
**Map / kid name:** Paycheck Peninsula  
**Organ:** **Clock** (shelters)  
**Role:** Second painting — **unguided transfer** of Cove’s protect-vs-spend rule, then Clock buckets as a new organ  
**Unlock:** Complete Coincraft Cove quest `q_cc_save_or_spend`  
**Change quest:** `q_pp_rainy_day` (`PAYCHECK_CHANGE_QUEST_ID`) — Vee’s stall, not Budget Split  
**Learning kernel:** Same world rule, new stall, new numbers, no Cove lecture  
**Island Ally:** Vendor Vee (transfer) · Payroll Pat / Planner Priya / Coach Carlos (Clock after)  
**Canon:** [story-bible.md](../../story-bible.md) · [NORTH_STAR.md](../../ftue/NORTH_STAR.md)

---

## 8 beats

| # | Beat | On the Clock shore | IDs | Kid one-liner |
|---|------|--------------------|-----|---------------|
| 1 | **You** | Land on Main Street after Harbor Change | area `pp_main_street` | “I’m at Paycheck Peninsula.” |
| 2 | **Need** | Fountain cracked — stall has two prices | `npc_vendor_vee` | “Something’s wrong with the fountain.” |
| 3 | **Go** | Walk to Vee (Bag points, does not pick) | start `q_pp_rainy_day` on land | “I’ll see the stall.” |
| 4 | **Search** | Hear both prices. No “this is the Take.” | `dlg_vendor_vee` | “Shelter or glitter?” |
| 5 | **Find** | You already know this world from Cove | transfer window | “Harbor will keep one.” |
| 6 | **Take** | Protect rainy-day vs glitter | `paycheck_protect_vs_spend` | “I picked.” |
| 7 | **Return** | Carpet home to Harbor (quiet HUD) | travel / Hub | “Back home.” |
| 8 | **Change** | Piggy names **your** weather + painting woke | `harborHomecoming` | “Harbor felt that.” |

**After Change (new organ, optional):** `q_pp_budget_basics` (side) — Pat / Priya Clock buckets. Never required for Independent Transfer.

**Side digression:** `q_pp_inbox_storm` — optional Clock practice; never required for Change.

---

## Irreversible / scars

| Key / id | Choice | Harbor scar |
|----------|--------|-------------|
| `paycheck_protect_vs_spend` / `protect` | Shelter kit | `pp_protector_plaque` — “Umbrella before glitter” |
| `paycheck_protect_vs_spend` / `spend` | Glitter sale | `pp_spender_plaque` — “Glitter ate the umbrella” |

---

## Handoff from Cove

Players unlock this island only after Cove’s save-or-spend **Change** beat.  
Main course `second_painting` completes only when `q_pp_rainy_day` is done — **not** Budget Split.

Pat / Priya / Carlos **do not teach** during the transfer window (runtime overlay). After the stall Take, Clock buckets are a new interacting concept.

---

## Completeness gate

- [x] Content JSON with areas, NPCs, quests, dialogues, minigames  
- [x] Progress gate after `q_cc_save_or_spend`  
- [x] Chapter play view + quest-aware Coin Bag  
- [x] Irreversible Take + scars + Harbor homecoming  
- [x] Main course done = Change quest (Vee stall)  
- [x] Clock organ language only (no Dotgraph dual mythology)
- [x] Independent Transfer: no Cove mapping coach on the stall
