# Pixel Art Pipeline

**FinanceQuest Pro** · Islands & mini-games  
**Related:** [art-direction-bible.md](./art-direction-bible.md) · [8bitworkshop IDE](https://8bitworkshop.com)

---

## 1. Target resolution

| Setting | Value | Notes |
|---------|-------|-------|
| Logical viewport | **320 × 180** | 16:9 playfield; UI chrome sits outside |
| Character frame | **32 × 32** px | NPCs, player avatar |
| Tile unit | **16 × 16** px | Environment tiles (future) |
| Source scale | **1×** | Art authored at native size; no @2x source |

All rendering uses **integer scaling only** — never 1.5× or 2.7×. Fractional scale blurs pixels.

```typescript
import { PIXEL_VIEWPORT, computeIntegerScale } from "@/pixel";

const scale = computeIntegerScale(containerWidth, containerHeight);
// canvas size = frameWidth * scale
```

CSS: `image-rendering: pixelated` on `.pixel-canvas` (see `src/main.css`).

---

## 2. Integer scaling rules

1. **Compute** `floor(containerW / nativeW)` and `floor(containerH / nativeH)`; take the minimum.
2. **Clamp** between `minScale: 1` and `maxScale: 8`.
3. **Letterbox** centered if the scaled content is smaller than the container.
4. **Never** use CSS `transform: scale()` with non-integer values on pixel art.
5. **Disable** bilinear filtering on canvas: `ctx.imageSmoothingEnabled = false`.

---

## 3. Atlas format

Each asset lives in `content/pixel/<category>/<name>/`:

| File | Purpose |
|------|---------|
| `spritesheet.png` | Combined texture (strip or grid) |
| `atlas.json` | Frame rectangles + animation definitions |

Example (`content/pixel/_template.atlas.json`):

```json
{
  "id": "pixel_captain_penny",
  "entityId": "npc_captain_penny",
  "meta": { "frameWidth": 32, "frameHeight": 32 },
  "frames": { "idle_0": { "x": 0, "y": 0, "w": 32, "h": 32 } },
  "animations": { "idle": { "frames": ["idle_0"], "fps": 6, "loop": true } }
}
```

**Runtime loader:** `loadPixelAtlases()` in `src/pixel/atlasLoader.ts` — auto-discovers all `atlas.json` via Vite glob. Hot reload in dev.

---

## 4. Spritesheet packing

### Option A — Strip pack (individual frames)

1. Export frames from your editor into `frames/` (`idle_0.png`, `idle_1.png`, …).
2. Add optional `atlas.config.json` (id, name, animations).
3. Run:

```bash
npm run pixel:pack -- content/pixel/npcs/my-npc
```

Outputs `spritesheet.png` + `atlas.json`.

### Option B — Grid metadata (existing sheet)

1. Paint or export a grid sheet in [8bitworkshop](https://8bitworkshop.com) or Aseprite.
2. Save as `spritesheet.png` + `atlas.config.json` with animation frame names.
3. Run:

```bash
npm run pixel:pack -- --grid content/pixel/npcs/my-npc --cols 4 --rows 1 --frame 32
```

---

## 5. 8bitworkshop workflow

[8bitworkshop](https://8bitworkshop.com) is ideal for **sketching and iterating** on retro pixel art with hardware-accurate palettes. It does not export web sprite sheets directly — use this pipeline:

| Step | Tool | Output |
|------|------|--------|
| 1. Sketch / animate | [8bitworkshop Asset Editor](https://8bitworkshop.com/docs/) or linked bitmap scripts | PNG frames or indexed bitmap |
| 2. Convert (optional) | [8bit-tools](https://github.com/sehugg/8bit-tools) | Platform-specific C/asm — skip for web |
| 3. Clean & animate | Aseprite / Piskel / 8bitworkshop PNG export | `frames/*.png` or horizontal strip |
| 4. Pack | `npm run pixel:pack` | `spritesheet.png` + `atlas.json` |
| 5. Preview | `?pixelPreview=1` | Instant in-browser animation |

**8bitworkshop tips:**

- Use the **Scripting Notebook** (JS) to batch-export frames from indexed bitmaps to PNG for the web pipeline.
- Keep palettes small (8–16 colors) to match Coincraft Cove art bible.
- Export at **1×** — our engine integer-scales at display time.

**Aseprite CLI (alternative):**

```bash
aseprite -b character.aseprite --sheet spritesheet.png --data atlas-raw.json --format json-hash --sheet-pack
```

Then map Aseprite JSON → our `atlas.json` schema (or use grid packer on a uniform strip).

---

## 6. Add a new NPC (acceptance checklist)

1. Create folder: `content/pixel/npcs/my-npc/`
2. Add `spritesheet.png` + `atlas.json` (copy `_template.atlas.json`)
3. Set `"entityId": "npc_..."` to link to island JSON NPC id
4. Start dev server: `npm run dev`
5. Open **`http://localhost:5000/?pixelPreview=1`** — new atlas appears in sidebar instantly (Vite HMR)

Demo NPCs included: `captain-penny`, `shelly-trader`.

Regenerate samples:

```bash
npm run pixel:sample
```

---

## 7. Runtime API

```tsx
import { PixelSprite, getPixelAtlasByEntityId } from "@/pixel";

const atlas = getPixelAtlasByEntityId("npc_shelly");
if (atlas) {
  return <PixelSprite atlas={atlas} animation="wave" integerScale={4} />;
}
```

---

## 8. File map

```
content/pixel/                    # Atlases (PNG + JSON)
scripts/pack-pixel-atlas.mjs      # Strip / grid packer
scripts/generate-sample-npc-sprites.mjs
src/pixel/
  scaling.ts                      # Integer scale math
  atlasLoader.ts                  # Vite glob loader
  PixelCanvas.tsx                 # Crisp canvas renderer
  PixelSprite.tsx                 # Animated sprite component
  tools/SpritePreviewTool.tsx     # Dev preview UI
docs/pixel-art-pipeline.md        # This document
```

---

*Version 1.0 · 320×180 · 32px frames · integer scale only*
