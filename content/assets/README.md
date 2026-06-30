# Asset Registry

Every third-party asset used in FinanceQuest Pro **must** have a JSON entry in this folder before merge.

## Required fields

| Field | Description |
|-------|-------------|
| `id` | Unique kebab-case identifier |
| `name` | Human-readable title |
| `type` | `image` \| `audio` \| `font` \| `sprite` \| `3d-model` \| `shader` \| `other` |
| `source` | `opengameart` \| `gamedevmarket` \| `direct` \| `other` |
| `sourceUrl` | Original download or product page |
| `author` | Creator name(s) |
| `license` | SPDX id (e.g. `CC0-1.0`, `CC-BY-4.0`) or commercial tier label |
| `licenseUrl` | Link to license text |
| `attributionText` | Exact credit line for in-app Credits and `CREDITS.txt` |
| `modifications` | Describe edits, or `"None"` |
| `files` | (optional) Repo paths where the asset is used |

### GameDevMarket

For `source: "gamedevmarket"`, also include:

```json
"gameDevMarket": {
  "productId": "12345",
  "licenseTier": "Standard License — commercial use per GameDevMarket EULA"
}
```

Prefer **CC0** or **CC-BY** from OpenGameArt when possible.

## Commands

```bash
npm run assets:validate          # CI — fails if metadata missing/invalid
npm run assets:export-credits    # writes public/CREDITS.txt + THIRD_PARTY_LICENSES.txt
```

## Add a new asset

1. Copy `content/assets/_template.json` → `content/assets/your-asset-id.json`
2. Fill **all** required fields
3. Run `npm run assets:validate`
4. Run `npm run assets:export-credits`
