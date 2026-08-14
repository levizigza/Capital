# Prioritization

## Score

Each issue gets three 1–5 scores; **priority = IMPACT × FREQUENCY × CORE_LOOP_IMPORTANCE** (max 125).

### IMPACT (accomplishment damage if unfixed)

| Score | Meaning |
|------:|---------|
| 5 | Blocks signature loop completion (Take → Harbor felt → share) |
| 4 | Blocks a cold-signature task (UT-01–07, UT-09) but workaround exists |
| 3 | Major time loss or wrong mental model; eventually recovers |
| 2 | Secondary path (structures, Family Room, settings) friction |
| 1 | Cosmetic / rare edge |

### FREQUENCY (within analyzed cohort of completes)

| Score | Meaning |
|------:|---------|
| 5 | ≥75% of participants |
| 4 | 50–74% |
| 3 | 25–49% |
| 2 | 2 participants or 10–24% |
| 1 | Single participant |

### CORE_LOOP_IMPORTANCE (Capital iconic path)

| Score | Meaning |
|------:|---------|
| 5 | Cove Take, hush, Plinth spectacle, share, Piggy homecoming, cause↔effect |
| 4 | Harbor orient, carpet to Cove, return home, next-island comprehension |
| 3 | Money Structure enter/exit on spine |
| 2 | Day-2 echo, co-play handoff, a11y discovery |
| 1 | Side utilities, era shores, nice-to-have requests |

## Decision policy

| Priority band | Action |
|---------------|--------|
| **80–125** | Fix before next recruit cohort if on iconic path |
| **40–79** | Schedule in craft backlog; deepen existing systems |
| **16–39** | Polish queue |
| **1–15** | Watch list — do not build from n=1 requests |

## Anti-patterns

- Do **not** auto-build every requested feature.  
- If a request **contradicts** observed success (e.g. “add tutorial arrows” but UT-01 already succeeded via discovery), classify under *requests contradicting behavior* and default to **no build**.  
- Prefer copy/affordance/juice fixes on Harbor·Cove·Plinth over new systems.
