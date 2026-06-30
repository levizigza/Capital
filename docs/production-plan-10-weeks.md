# FinanceQuest Islands — 10-Week Production Plan

**Goal:** Ship **Coincraft Cove** vertical slice to beta-quality, validate pillars + metrics, then scale content pipeline.  
**Team assumption:** 1 lead dev, 1 designer/writer, 1 part-time audio/QA (adjust weeks if solo).

---

## Timeline overview

| Week | Theme | Outcome |
|------|--------|---------|
| **1** | Slice scope & funnel | Locked spec, analytics schema, tutorial wireframe |
| **2** | Hub + travel shell | Enter island, area graph, save/load stable |
| **3** | Quest + dialogue | Both quest chains completable in-engine |
| **4** | Minigame + mechanics | Coin Sort (EarnSpend + ChangeMaking) shippable |
| **5** | Juice pass I | Motion, SFX hooks, reward moments |
| **6** | Audio + music | Island loop + event stingers integrated |
| **7** | Accessibility + profiles | WCAG pass, learning profiles on all copy |
| **8** | Replay + consequences | Decision timeline + ReplayModal on all branches |
| **9** | Analytics + parent/teacher view | Funnel dashboard or export; beta metrics live |
| **10** | Hardening & beta ship | E2E, perf, content QA, beta release |

**Post–week 10:** Expansion island #2 (Paycheck Peninsula) using same pipeline; paid expansion hypothesis test.

---

## Week-by-week deliverables

### Week 1 — Scope, metrics, onboarding
- Freeze vertical slice acceptance criteria (see [game-pillars.md](./game-pillars.md)).
- Map analytics funnel: `island_entered` → `quest_started` → `minigame_*` → `quest_completed`.
- Add `tutorial_started` / `tutorial_completed` events (hub onboarding).
- Write hub tutorial script (≤ 90s): profile pick → first island → Captain Penny pointer.
- Playtest paper walkthrough with 2 families + 1 teacher.

### Week 2 — Hub, travel, persistence
- Islands hub: island card, lock state, “continue” from save.
- Travel view: area connections, `requiredItems` gates (Coin Pouch → Lighthouse).
- Harden `loadIslandSave` / `persistIslandSave` (refresh, tab close, corrupt fallback).
- Empty/error states for missing content or failed load.

### Week 3 — Quests & NPC dialogue
- Wire all objectives: talk, collect, minigame complete.
- Dialogue effects: `startQuest`, `giveItem`, quest progression guards.
- Quest hints + fail/retry (`quest_failed_attempt`, hint escalation).
- Copy pass: reading level grades 1–4; Shelly optional dialogue polish.

### Week 4 — Minigame integration
- Register and lazy-load Coin Sort (`ModularMinigame` + EarnSpend + ChangeMaking).
- Quest gate: `mg_coin_sort` blocks First Coins completion correctly.
- Win/lose/retry UX; link to `recordMinigameAttempt` + difficulty.
- Balance: earn/spend targets playable in 5–8 min.

### Week 5 — Juice (visual + feedback)
- Area enter / item collect / quest complete animations.
- Coin + badge reward flyouts; lighthouse unlock moment.
- Integrate `sfx.ts` for UI, dialogue advance, quest complete.
- Mobile layout pass (island map, dialogue, minigame).

### Week 6 — Audio
- Island ambient loop (seamless, &lt; 2 MB).
- Stingers: quest start/complete, minigame success/fail, badge earned.
- Respect global mute + accessibility reduced-motion (no motion-only cues).
- Loudness normalize; default volume in settings.

### Week 7 — Accessibility & learning profiles
- Text size + high contrast on hub, map, dialogue, minigame.
- `resolveProfileText` on all Coincraft strings (explorer / apprentice / strategist).
- Keyboard nav: dialogue choices, map areas, minigame controls.
- Screen reader labels for quest tracker and map pins.

### Week 8 — Decisions & replay
- Log dialogue choices + minigame decisions to `DecisionTimeline`.
- Auto-open ReplayModal after `q_cc_save_or_spend` (optional skip).
- “Why it happened” copy for needs vs wants and save vs spend branches.
- Export timeline JSON (parent/teacher review).

### Week 9 — Analytics & reporting
- Session id on all events; daily funnel rollup (script or simple admin view).
- Parental dashboard tile: quests completed, time on island, last save.
- Teacher one-pager: standards mapping for Coincraft learning objectives.
- Beta cohort instrumentation checklist.

### Week 10 — Ship readiness
- Playwright E2E: hub → both quests → badge (happy path).
- Performance: LCP &lt; 2.5s on mid-tier laptop; lazy chunks verified.
- IP red-flag checklist on `coincraft-cove.islands.json`.
- Beta build, release notes, feedback form.

---

## Vertical slice — exact task list

Use this as the **sprint backlog** for Coincraft Cove only. IDs are for tracking; order is approximate dependency order.

### A. Foundation & enablement
| ID | Task | Done when |
|----|------|-----------|
| VS-01 | Enable Islands in production build flag (`VITE_ISLANDS=1`) with env docs | Dev/prod toggle documented |
| VS-02 | Entry from main app: mode → Islands hub without broken profile | `UserProfile` flows through |
| VS-03 | Load `coincraft-cove.islands.json` via content loader; validate schema | `validate.ts` passes CI |
| VS-04 | Island save migration/version guard for `IslandSaveV1` | Old saves don’t crash |

### B. Onboarding & tutorial
| ID | Task | Done when |
|----|------|-----------|
| VS-10 | Hub first-run overlay (3 steps: explore, talk, earn) | Skippable, persists “seen” |
| VS-11 | Analytics: `tutorial_started`, `tutorial_completed` | Events in types + tracked |
| VS-12 | Pointer/highlight to Captain Penny on first enter | Clears after first `dialogue_started` |

### C. Navigation & world
| ID | Task | Done when |
|----|------|-----------|
| VS-20 | Home view: Coincraft card + progress % (quests done / total) | Accurate from save |
| VS-21 | Travel/map: 3 areas, connections, icons | Matches JSON areas |
| VS-22 | `requiredItems` gate on Savings Lighthouse | Blocked without Coin Pouch |
| VS-23 | Item pickup in area → inventory + `item_collected` | Pouch + jar + badge |
| VS-24 | `area_entered` analytics per transition | Payload includes `areaId` |

### D. NPCs, dialogue, quests
| ID | Task | Done when |
|----|------|-----------|
| VS-30 | 4 NPCs placed on correct `areaId` | Penny, Alma, Kira, Shelly |
| VS-31 | All dialogue graphs playable end-to-end | No orphan `nextNodeId` |
| VS-32 | Quest `q_cc_first_coins`: talk → pouch → minigame | `quest_completed` fires |
| VS-33 | Quest `q_cc_save_or_spend`: Alma → Kira → jar → badge | Items in rewards |
| VS-34 | Quest tracker UI: objectives, hints, active state | Readable on mobile |
| VS-35 | `quest_failed_attempt` + escalating hints on minigame fail | Uses settings helpers |

### E. Minigame — Coin Sort Challenge
| ID | Task | Done when |
|----|------|-----------|
| VS-40 | `mg_coin_sort` launches from harbor with correct modules | EarnSpend + ChangeMaking |
| VS-41 | Completion criteria tied to quest objective | Quest unblocks only on win |
| VS-42 | `minigame_started` / `completed` / `retry` analytics | Includes `minigameId` |
| VS-43 | Difficulty scaling from prior failures | `getDifficultyForMinigame` applied |
| VS-44 | Playtest: 5–8 min session, ≥ 75% completion in lab | Notes in dev-log |

### F. Rewards, economy, unlock
| ID | Task | Done when |
|----|------|-----------|
| VS-50 | Grant coins/XP/items on quest complete | Save persists |
| VS-51 | Badge `cc_craft_badge` shown in inventory + celebration | Visual + SFX |
| VS-52 | Island “complete” state when both quests done | Hub shows checkmark |
| VS-53 | Economy weather indicator (if enabled) doesn’t break slice | Optional flag off OK |

### G. Audio
| ID | Task | Done when |
|----|------|-----------|
| VS-60 | Ambient track for Coincraft (loop, crossfade) | Mute works |
| VS-61 | SFX map: dialogue blip, coin, quest complete, badge | Wired in IslandsApp |
| VS-62 | Music service respects accessibility / user mute | No autoplay surprise |

### H. UI polish & juice
| ID | Task | Done when |
|----|------|-----------|
| VS-70 | Framer transitions: hub ↔ travel ↔ island | No layout jump |
| VS-71 | Quest complete / item collect micro-animations | Reduced motion off only |
| VS-72 | Consistent island chrome (header, exit, settings) | Matches design tokens |
| VS-73 | `GameInstructionBox` or equivalent for minigame rules | Dismissible |

### I. Accessibility
| ID | Task | Done when |
|----|------|-----------|
| VS-80 | `AccessibilitySettings` panel reachable from island | Persisted |
| VS-81 | `textSizeClass` on dialogue + quest text | 3 sizes work |
| VS-82 | Focus order + aria labels on map and choices | Manual axe pass |
| VS-83 | Reduced motion disables nonessential animations | System pref honored |

### J. Replay & consequences
| ID | Task | Done when |
|----|------|-----------|
| VS-90 | Record choices in `DecisionTimeline` for both quests | 3–7 entries each |
| VS-91 | ReplayModal opens post–`q_cc_save_or_spend` | Skip + close works |
| VS-92 | Learning notes on needs/wants and saving branches | Copy approved |
| VS-93 | Export timeline JSON from replay | Download works |

### K. Analytics & parent/teacher
| ID | Task | Done when |
|----|------|-----------|
| VS-100 | Session id attached to all island events | Funnel joinable |
| VS-101 | Parental dashboard: Coincraft completion % | Reads save/analytics |
| VS-102 | Teacher standards blurb linked from hub (PDF or modal) | Jump$tart-aligned copy |
| VS-103 | Weekly metrics script: D1, quest %, tutorial % | Runnable locally |

### L. Quality & ship
| ID | Task | Done when |
|----|------|-----------|
| VS-110 | E2E spec: full Coincraft happy path | CI green |
| VS-111 | Offline/PWA: save works with service worker | Per OFFLINE_GUIDE |
| VS-112 | IP red-flag checklist signed for island JSON | Doc updated |
| VS-113 | Beta README: build flags, known limits, feedback link | In repo |
| VS-114 | Smoke test on Chrome + Safari + one mobile device | Checklist signed |

**Vertical slice exit:** All VS-* tasks ✅, metrics meet [game-pillars.md](./game-pillars.md) targets for 2-week beta cohort (n ≥ 30 families).

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep to second island | VS tasks tagged; week 10 buffer only for polish |
| Minigame too hard for 6–8yo | VS-43/44 + hint escalation week 4 |
| Analytics noise | Session id + dedupe in week 9 |
| IP similarity | Mandatory checklist VS-112 before beta |

---

*Related: [game-pillars.md](./game-pillars.md) · [ip-safe-design.md](./ip-safe-design.md)*
