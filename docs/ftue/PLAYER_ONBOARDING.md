# Player onboarding modes

Three session modes share one save but differ in **guidance density** and **boot path**. Concept mastery (`conceptProgress`) and tutorial shell completion (`onboardingComplete`) are **persisted separately**.

## Modes

| Mode | Detection | Boot / FTUE | In-game guidance |
|------|-----------|-------------|------------------|
| **New** | No meaningful save progress | Full title → cast → Ashore teach → carpet | Progressive teaching (hub coach, concept GUIDED phases) |
| **Experienced** | Cast select: “I've played money games before” | Title → cast → **skip teach** → carpet | Reduced coach; escalated concept hints only; proofs unchanged |
| **Returning** | `onboardingComplete` + character + ≥72h since `lastActiveAt` | **Skip entire FTUE boot** | Returning briefing overlay; no FTUE replay for absence |

## Persistence (`save.playerOnboarding`)

```ts
{
  version: 1,
  declaredMode?: "new" | "experienced",
  lastActiveAt?: string,        // updated every persist
  reorientationSeenAt?: string, // last briefing dismiss
  systemsSeenAt?: Record<string, string>,
}
```

- **`onboardingComplete`** — tutorial shell (Ashore + carpet + hub guided flags). Not mastery.
- **`conceptProgress.concepts[id].phase`** — concept phases through `MASTERED`. Independent of shell.

Helpers: `isTutorialShellComplete`, `isConceptMastered`, `hasConceptSkillSignal`.

## Returning briefing

Shown once per page load when absence threshold is met. Includes:

1. Current situation (place + character)
2. Current objectives (`nextMainCourseStep`)
3. Financial state (Voyager Ledger cashflow / streak)
4. Recent major events (homecoming, scars, scenarios)
5. Newly introduced systems (concepts entered since last session)
6. Optional refresher links (Ashore chambers, controls, ledger)

Dismissal sets `reorientationSeenAt` and session flag — does **not** reset FTUE.

## Experienced bootstrap

`applyExperiencedBootstrap` marks shell complete and satisfies legacy hub gate flags **without** advancing concept phases or quest proofs.

## Code

- `src/islands/playerOnboarding/` — detect, mastery, guidance, briefing, bootstrap, boot
- `src/islands/views/ReturningPlayerBriefing.tsx` — UI
- Wired in `App.tsx`, `BootCastSelect.tsx`, `IslandsApp.tsx`, `HomeHubView.tsx`, `save.ts`

Also see `docs/ftue/FTUE_TELEMETRY.md` for privacy-conscious FTUE events and primary metrics (tutorial completion is secondary only).

Human validation: `docs/ftue/FTUE_USABILITY_PROTOCOL.md` + templates in `docs/ftue/usability/`.
