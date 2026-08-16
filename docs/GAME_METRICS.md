# Capital gameplay metrics

Privacy-conscious, **local-first** telemetry (`island_analytics_v1`).  
Metrics tell designers **where to investigate** — they are **never** proof of enjoyment, quality, or learning.

Stable event names live in `AnalyticsEventName` (`src/islands/types.ts`).  
Payload shapes: `src/islands/analytics/schemas.ts`.  
Question map: `src/islands/analytics/gameMetrics.ts`.

---

## Principles

1. **Stable names** — append-only. Do not rename events; add a new name if meaning changes.
2. **Id-only payloads** — `islandId`, `questId`, `choiceId`, `feature`, enums, counts, durations. No display names, dialogue text, Family Room labels, emails, or free-form scars.
3. **Local by default** — console + encrypted KV; export via Harbor analytics UI. No remote product analytics unless a future opt-in sink is explicitly added and gated by consent.
4. **Investigate, don’t celebrate** — a high completion rate can mean “too easy” or “skipped teaching”; a low one can mean “confused” or “busy life.” Always pair numbers with a playtest of the flagged surface.
5. **Scrub at the edge** — `scrubAnalyticsPayload` strips banned keys before sink write.

---

## Instrument → question

| Instrument | Primary events | Question it answers | Investigate when… |
|------------|----------------|---------------------|-------------------|
| **Session length** | `session_started`, `session_ended`, `session_heartbeat` | How long do sessions last / go idle? | Duration << target, or heartbeats die mid-loop |
| **Onboarding completion** | `tutorial_*`, `onboarding_completed` | Do players finish Ashore / Castle Grounds? | Starts without completes; last `abandon_point` / `screen_exit` |
| **Core-loop repetitions** | `core_loop_cycle`, clears | How often does Take → Harbor → Soft Beat / clear close? | Islands entered, cycles missing |
| **Failure locations** | `fail_reason`, `location_outcome` | Where do attempts fail? | One `locationId` dominates failures |
| **Success locations** | `location_outcome`, `*_completed`, `core_loop_cycle` | Where do successes happen? | Side success only; spine never clears |
| **Resource flows** | `resource_delta`, `harbor_purchase` | How do coins / XP / stars move? | Earn missing after clear; spend without purchase |
| **Strategy selection** | `strategy_selected`, `decision_made`, `dialogue_choice` | Which forks are chosen? | One branch >90% — choice may be fake |
| **Feature usage** | `feature_used`, `system_interacted` | Which Harbor / structure features open? | Unlocked feature never `open`s |
| **Abandonment points** | `abandon_point`, `screen_exit`, `session_ended` | Where do players leave mid-action? | Spike at one surface |
| **Progression velocity** | `progression_milestone` (+ elapsedMs) | How fast between spine milestones? | Long gap before Cove Change / Freedom |
| **Decision frequency** | `decision_made`, `dialogue_choice` | Decisions per session / per minute? | Long sessions, near-zero decisions |
| **Retries** | `minigame_retry`, `retry_attempt`, `hint_escalated` | Retries before clear; help firing? | High retries, no hint / difficulty change |
| **System interactions** | `system_interacted`, `feature_used` | Are Soft Beat / Plinth / weather / Talk touched? | Systems in save, never interacted |

---

## Event catalog (stable)

### Session
| Event | Payload (beyond sessionId / elapsedMs / screen) | Notes |
|-------|--------------------------------------------------|-------|
| `session_started` | `{}` | Once per app session with save |
| `session_heartbeat` | `{ tick, visible }` | ~60s while page visible |
| `session_ended` | `{ reason, durationMs? }` | `user_exit` / visibility |

### Onboarding / tutorial
| Event | Payload |
|-------|---------|
| `tutorial_started` | `{ source }` |
| `tutorial_step` | `{ stepId? }` (reserved) |
| `tutorial_completed` | `{ questId, islandId, source }` |
| `onboarding_completed` | `{ via }` |

### Core loop / locations
| Event | Payload |
|-------|---------|
| `core_loop_cycle` | `{ phase, islandId?, refId?, cycleIndex? }` — phases: `take` · `harbor_felt` · `soft_beat` · `quest_clear` · `board_clear` · `ritual` |
| `location_outcome` | `{ locationKind, locationId, outcome, islandId?, durationMs? }` |

### Resources / economy
| Event | Payload |
|-------|---------|
| `resource_delta` | `{ resource, delta, reason, balanceAfter?, islandId? }` |
| `harbor_purchase` | `{ kind, price, itemId? }` |

### Strategy / decisions
| Event | Payload |
|-------|---------|
| `strategy_selected` | `{ domain, strategyId, contextId?, islandId? }` |
| `decision_made` | `{ domain, decisionId, contextId?, islandId? }` |
| `dialogue_choice` | `{ islandId, graphId, nodeId, choiceId }` |

### Features / systems
| Event | Payload |
|-------|---------|
| `feature_used` | `{ feature, action?, islandId? }` |
| `system_interacted` | `{ system, action?, refId?, islandId? }` |

### Abandon / progression / retries
| Event | Payload |
|-------|---------|
| `abandon_point` | `{ surface, reason, islandId?, featureId?, elapsedMsAtAbandon? }` |
| `progression_milestone` | `{ milestone, islandId?, questId? }` |
| `minigame_retry` | `{ islandId, minigameId, attempt }` |
| `retry_attempt` | `{ context, targetId, attempt, islandId? }` |

Legacy events (`island_entered`, `quest_*`, `minigame_*`, `screen_*`, …) remain valid and feed the same questions.

---

## What we never collect

- Player / character / Family Room **names**
- Emails, phones, addresses
- Dialogue **text**, scar **labels**, rumor copy
- Raw User-Agent / IP
- Screenshots or voice

Allowed: opaque session UUID, content **ids**, enums, counts, durations, booleans.

---

## Anti-patterns

- Treating D1 retention or completion % as “they loved it”
- Shipping completion meters or secret scavenger maps from telemetry
- Renaming events mid-flight
- Logging free text “for context”
- Remote upload without consent + minimization review

---

## Export

Harbor → Settings / analytics export (`AnalyticsExportView`) — CSV/JSON of local events + first-5-min funnel. Use exports to find **surfaces to playtest**, not to score players.
