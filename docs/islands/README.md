# Islands design docs

Each island **must** include before ship:

| File | Template |
|------|----------|
| `layout-map.md` | [`_template/layout-map.md`](./_template/layout-map.md) |
| `quest-pacing-chart.md` | [`_template/quest-pacing-chart.md`](./_template/quest-pacing-chart.md) |

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
# Fill templates during Phases 2–3; link from island-design-process.md registry table
```
