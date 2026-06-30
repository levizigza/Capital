# IP-Safe Design Workflow

> Every piece of content in this project **must** pass through this workflow before shipping.
> The goal is to teach real financial concepts through **original game experiences** that are clearly our own.

---

## 1. Learning Kernel Extraction

Before designing any game or island, identify the **learning kernel** — the core financial concept being taught — completely decoupled from any existing game's presentation.

| Step | Action |
|------|--------|
| **Identify** | Write a 1–2 sentence plain-language description of the financial concept (e.g., "compound interest accelerates savings over time"). |
| **Abstract** | Strip away any game mechanic or theme. The kernel is *never* "it's like Game X but with money." |
| **Validate** | Confirm the kernel maps to a recognized financial literacy standard (e.g., Jump$tart, CEE, NEFE). |
| **Document** | Record the kernel in the island's `learning_objectives` provenance field. |

**Example kernel:** "Diversification reduces portfolio risk by spreading investments across asset classes."

---

## 2. Three-Layer Remix Rule

Every game mechanic must differ from its nearest inspiration on **at least two** of these three layers:

| Layer | Definition | Example change |
|-------|-----------|----------------|
| **Theme** | Visual setting, narrative wrapper, character flavor | Medieval kingdom → Undersea coral reef |
| **Verb** | Core player action (buy, sort, match, dodge, negotiate) | Roll-and-move → Auction bidding |
| **Structure** | Win condition, progression arc, board/level topology | Eliminate opponents → Cooperative target score |

### How to apply

1. Name the nearest existing mechanic (internal notes only — never ship the name).
2. Document which two+ layers you changed in `originality_notes`.
3. If you can only change one layer, **redesign the mechanic** until two differ.

---

## 3. Combining Multiple Sources

A single external game should **never** be the sole inspiration for any content piece. Follow the **≥ 2 source rule**:

- Draw mechanics from **at least two unrelated sources** and blend them.
- The resulting experience should not be recognizable as a 1:1 remake of any single source.
- Record the blended mechanic description (not the source names) in `mechanics_used[]`.

### What to avoid

| Bad | Good |
|-----|------|
| "Our version of Game X with a money theme" | "Combines auction bidding with tile-placement and teaches asset allocation" |
| Copying a board layout and renaming spaces | Designing an original topology driven by the learning objective |
| Using another game's proprietary terminology | Inventing our own vocabulary grounded in real finance terms |

---

## 4. Clean-Room Workflow

For any mechanic where IP risk is elevated, use a **two-person clean-room** process:

### Roles

| Role | Responsibility |
|------|---------------|
| **Spec Writer** | Writes a mechanic spec using *only* the learning kernel and our internal mechanic library. Must **not** reference or look at the external game during spec writing. |
| **Implementer** | Builds from the spec only. If the spec is ambiguous, the Implementer asks the Spec Writer — never consults the external game directly. |

### Process

1. Spec Writer drafts a mechanic spec document referencing only:
   - The learning kernel
   - Our internal mechanic library (`mechanics_used[]` vocabulary)
   - The three-layer remix table showing ≥ 2 layer changes
2. Spec Writer adds the external game name to `forbidden_references[]` in the island JSON.
3. Implementer builds solely from the spec.
4. Both run the **Red-Flag Checklist** (below) before merging.

---

## 5. Red-Flag Checklist

Run this checklist before every PR that adds or modifies game content.

### Automated (IP Lint screen)

- [ ] **Banned terms scan** — No competitor game names appear in any shipped content (dialogue, quest text, NPC names, descriptions).
- [ ] **Fuzzy match scan** — No near-matches or phonetic similarities to banned terms.
- [ ] **Provenance completeness** — Every island has `learning_objectives`, `mechanics_used`, `originality_notes`, and `forbidden_references` filled in.

### Manual review

- [ ] **Two-layer test** — Does the mechanic differ from its nearest inspiration on ≥ 2 of theme/verb/structure?
- [ ] **Kernel purity** — Can you explain what the player learns without naming any external game?
- [ ] **Visual distinctiveness** — Do art assets, color palettes, and character designs avoid evoking a specific competitor's trade dress?
- [ ] **Naming check** — Are all in-game terms (space names, currency names, card names) original?
- [ ] **Board/layout originality** — Is the game's topology/structure clearly distinct from any single source?
- [ ] **No 1:1 mechanic clones** — Does the game combine ≥ 2 unrelated mechanic sources?

### Escalation

If any checklist item fails:
1. File an issue tagged `ip-risk`.
2. Halt the PR until the content is redesigned.
3. Re-run the full checklist after redesign.

---

## Appendix: Internal Mechanic Library

These are the sanctioned mechanic building blocks. Use these terms in `mechanics_used[]`:

| Mechanic ID | Description |
|-------------|-------------|
| `auction-bidding` | Players bid on items with limited currency |
| `budget-allocation` | Distribute a fixed budget across categories |
| `card-matching` | Match pairs or sets from a face-down grid |
| `dice-movement` | Roll dice to advance on a path |
| `grid-navigation` | Move on a 2D grid collecting/avoiding tiles |
| `market-simulation` | Buy/sell assets with fluctuating prices |
| `npc-dialogue-tree` | Branching conversations with NPCs |
| `portfolio-builder` | Select assets to construct a balanced portfolio |
| `quiz-challenge` | Answer knowledge questions for rewards |
| `resource-management` | Balance income, expenses, and savings over rounds |
| `sorting-categorization` | Drag items into correct categories |
| `speed-collection` | Collect items under time pressure |
| `tower-stacking` | Stack/build upward, penalized for imbalance |
| `trade-negotiation` | Barter or negotiate deals with AI agents |
| `debt-elimination` | Strategically pay down debts with limited funds |

> Add new mechanics to this table via PR. Each entry must have a generic description that does not reference any external game.
