# Islands design docs

Each island **must** include before ship:

| File | Template |
|------|----------|
| `layout-map.md` | [`_template/layout-map.md`](./_template/layout-map.md) |
| `quest-pacing-chart.md` | [`_template/quest-pacing-chart.md`](./_template/quest-pacing-chart.md) |
| `story-circle.md` | [`_template/story-circle.md`](./_template/story-circle.md) |

**Canon mythology:** [story-bible.md](../story-bible.md) — the whole game is one Story Circle; islands are chapters.  
**Process:** [island-design-process.md](../island-design-process.md)

## Islands

| Island ID | Docs folder | Content JSON |
|-----------|-------------|--------------|
| `coincraft_cove` | [coincraft-cove/](./coincraft-cove/) | `src/islands/content/coincraft-cove.islands.json` |

## Quick start (new island)

```bash
mkdir docs/islands/my-island-id
cp docs/islands/_template/layout-map.md docs/islands/my-island-id/
cp docs/islands/_template/quest-pacing-chart.md docs/islands/my-island-id/
cp docs/islands/_template/story-circle.md docs/islands/my-island-id/
# Fill templates; every beat must answer the Story Bible completeness check
```
