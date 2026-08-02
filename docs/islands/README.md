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
| `paycheck_peninsula` | [paycheck-peninsula/](./paycheck-peninsula/) | `src/islands/content/paycheck-peninsula.islands.json` |
| `credit_kingdom` | [credit-kingdom/](./credit-kingdom/) | `src/islands/content/credit-kingdom.islands.json` |
| `harbor_haven` | [harbor-haven/](./harbor-haven/) | `src/islands/content/harbor-haven.islands.json` |

### Parked outer chapters (not live)

> **PARKED** — Outside the iconic freeze. See [iconic-later.md](../iconic-later.md). Story-circles still validate schema; travel map + live loader ignore them.

| Island ID | Docs folder |
|-----------|-------------|
| `signal_city` | [signal-city/](./signal-city/) |
| `venture_foundry` | [venture-foundry/](./venture-foundry/) |
| `financial_assets` | [financial-assets/](./financial-assets/) |
| `digital_assets` | [digital-assets/](./digital-assets/) |
| `business_assets` | [business-assets/](./business-assets/) |
| `intangibles` | [intangibles/](./intangibles/) |
| `future_shores` | [future-shores/](./future-shores/) |
| `real_estate` | [real-estate/](./real-estate/) |
| `starter_key_cove` | _(no docs folder — registry park only)_ |

**Gate:** `src/qa/contentValidation.test.ts` fails if a live island pack lacks `story-circle.md`.  
**Scope gate:** `src/islands/iconicScopeFreeze.test.ts` fails if parked story-circles lose their **PARKED** banner or the travel spine widens.

## Quick start (new island)

```bash
# Prefer deepening Harbor · Cove → Paycheck → Credit (see docs/iconic-later.md).
# If you must draft an outer chapter, mark story-circle.md PARKED immediately.
mkdir docs/islands/my-island-id
cp docs/islands/_template/layout-map.md docs/islands/my-island-id/
cp docs/islands/_template/quest-pacing-chart.md docs/islands/my-island-id/
cp docs/islands/_template/story-circle.md docs/islands/my-island-id/
# Fill templates; every beat must answer the Story Bible completeness check
```
