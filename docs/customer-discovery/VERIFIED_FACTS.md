# Verified facts (repo-backed only)

Anything not listed here is **not** a verified customer fact for Capital.  
Sources are in-repo product code and design docs as of this discovery pass.

---

## Product what exists

1. **Capital / FinanceQuest Islands** is a browser finance **adventure game** (React / R3F / Vite), not a banking app or spreadsheet tutor.
2. **Live surface** referenced in project work: GitHub Pages deploy path for Capital (Harbor playable).
3. **Geographic spine (iconic freeze):** Cove → Paycheck → Credit (+ Harbor hub). Do not widen map as the primary product bet right now (`docs/iconic-path.md`, `.cursor/rules/iconic-freeze.mdc`).
4. **Signature loop shipped as design canon:** Cove irreversible Take → Soft Beat hush → Harbor scar / Memory Plinth → share PNG → Piggy homecoming → day-2 echo (`docs/iconic-path.md`).
5. **Money Structures** exist as interior depth on that spine: Coin Jar, Ledger Bank, Payroll Tower, Interest Keep (`docs/iconic-path.md`).
6. **Family Room** is local / not a fake multiplayer backend (iconic freeze).
7. **Player fantasy:** Voyager among living money — explorer first, student second (`docs/player-fantasy-and-loop.md`, `docs/game-pillars.md`).
8. **Core teachable beats on spine (by design):** save/spend irreversibility (Cove), paycheck allocation (Paycheck), credit wait vs haste (Credit) — story/organ docs + island content.
9. **Profiles / accessibility** are part of the product thesis (learning profiles, reduced motion, text size) per pillars + production plan — implementation depth varies; treat as **product intent with partial ship**, not “classroom LMS ready.”
10. **Parent data access is deliberately gated** until verified parent↔child links exist (`docs/security/threat-model.md`, `docs/security/runbook.md`).

---

## Design documents that exist (not validation)

11. **Named design segments A–D** appear in `docs/game-pillars.md`: Families 6–11, Teens 12–17, Classroom/teachers, Solo adults 18+.
12. **Paid model is labeled hypothesis** in the same doc: premium base + expansion DLC; never pay-to-win.
13. **Production plan** targets Cove vertical slice, paper playtest with “2 families + 1 teacher,” and beta cohort **n ≥ 30 families** as an exit criterion (`docs/production-plan-10-weeks.md`).
14. **Cold playtest checklists** exist (`docs/iconic-path.md` and related craft docs). Process ≠ completed findings archive.
15. **Company operating docs** define VoC → hypothesis → experiment chains (`docs/OPERATING_LOOP.md`) — infrastructure for learning, not customer evidence itself.

---

## Explicitly NOT verified in-repo

- No archived interview transcripts or VoC corpus with real customers.
- No willingness-to-pay (WTP) numbers from buyers.
- No competitor teardown matrix (GoHenry, Greenlight, Current, Bankaroo, school curricula, YouTube, etc.).
- No proof that the planned n≥30 family beta completed or what it found.
- Synthetic strings in unit tests (e.g. “Soft Beat hush confuses first-time parents”) are **test fixtures**, not customer feedback.

---

## Fact vs design claim (quick rule)

| Claim type | Example | Status |
|------------|---------|--------|
| Product behavior | Signature Take → Plinth → share exists as intended loop | Fact (design+code canon) |
| “Parents will pay for this” | Premium base license | Hypothesis |
| “Families 6–11 are ICP” | game-pillars table | Hypothesis (design intention) |
| “Teachers need standards-aligned quests” | Classroom row in pillars | Hypothesis (job stated; product fit incomplete) |
