# FinanceQuest Islands — Art Direction Bible

**Product:** FinanceQuest Pro · Islands mode  
**Island #1 reference implementation:** Coincraft Cove (`coincraft_cove`)  
**Related:** [islands-ui-style-guide.md](./islands-ui-style-guide.md) · [game-pillars.md](./game-pillars.md)

---

## 1. Purpose

One visual language for UI, characters, and environments so players (especially families, ages 6–11) feel they are in a **cozy adventure**, not a finance spreadsheet. Each island may shift palette accents; **shape language and line weight stay consistent**.

---

## 2. Mood board variants

### A. Cozy Seaside *(selected for Island #1)*

| Axis | Direction |
|------|-----------|
| **Feeling** | Warm, safe, storybook harbor town |
| **Refs** | Spiritfarer docks, Animal Crossing plaza, Poptropica early islands |
| **Palette** | Sky `#7ec8e3` → sand `#f5e6c8` → sea glass `#5bb5a3` |
| **Shapes** | Soft rounded rects (16–24px radius), pill buttons, cloud silhouettes |
| **Line** | 2px outlines at 35–45% navy `#2d4a6f` |
| **UI** | Frosted driftwood panels, rope dividers, coin-amber CTAs |
| **NPCs** | Rounded bodies, big friendly eyes, occupation props (hat, apron, lantern) |
| **World** | Painted tiles, gentle gradients, morning light from upper-left |

### B. Modern Minimal *(future — teen / structured mode bridge)*

| Axis | Direction |
|------|-----------|
| **Feeling** | Clean fintech-meets-game; confident, not childish |
| **Refs** | Monument Valley UI chrome, Alto’s Odyssey menus |
| **Palette** | Off-white `#f8fafc`, slate `#334155`, single accent `#6366f1` |
| **Shapes** | 8px radius, flat cards, thin 1px borders |
| **Line** | 1px hairlines only; no cartoon outline |
| **UI** | Solid white panels, no texture; data-forward quest log |
| **NPCs** | Geometric busts, small heads (1:4), minimal features |
| **World** | Isometric blocks, flat color zones, no texture grain |

### C. Sci-Fi Signal *(future — Signal City island)*

| Axis | Direction |
|------|-----------|
| **Feeling** | Neon literacy lab; curiosity, not cyberpunk grit |
| **Refs** | Oxenfree dialogue, Hades UI glow edges |
| **Palette** | Deep space `#0f172a`, cyan `#22d3ee`, magenta `#e879f9` |
| **Shapes** | Chamfered corners (cut 6px), hex pins on map |
| **Line** | 2px glow strokes; inner shadow on panels |
| **UI** | Dark glass HUD, monospace micro-labels |
| **NPCs** | Tall silhouettes, visor bands, 1:3 head-to-body |
| **World** | Grid floors, emissive edges, parallax star layers |

---

## 3. Final choice (Coincraft Cove / family tier)

**Direction:** **Cozy Seaside** with FinanceQuest coin-learning accents.

### Master palette

| Token | Hex | Use |
|-------|-----|-----|
| `--cc-sky-top` | `#7ec8e3` | Background gradient top |
| `--cc-sky-bottom` | `#c5e8f7` | Background gradient mid |
| `--cc-sand` | `#f5e6c8` | Ground, warm panels |
| `--cc-sea` | `#5bb5a3` | Water, secondary buttons |
| `--cc-sea-deep` | `#3d9a8a` | Borders, pressed states |
| `--cc-driftwood` | `#8b6914` | Outline, rope, wood |
| `--cc-navy` | `#2d4a6f` | Text, 2px outlines @ 40% opacity |
| `--cc-coin` | `#f4b942` | Primary CTA, rewards |
| `--cc-coin-dark` | `#d4972a` | CTA pressed |
| `--cc-blush` | `#f8d4c4` | Skin tones (NPCs) |
| `--cc-coral` | `#e8927c` | Accents, Shelly |
| `--cc-lighthouse` | `#ef4444` | Lighthouse beam stripe |

### Shape language

- **Outer radius:** 20px panels, 16px buttons, 999px pills/badges  
- **Icon tiles:** 12px radius on 48×48 portraits  
- **Silhouette rule:** Every NPC readable as a black fill at 32×32  

### Line weight

| Context | Weight | Color |
|---------|--------|-------|
| Environment tiles | 2px | `#2d4a6f` @ 40% |
| NPC outline | 2px | `#2d4a6f` @ 55% |
| UI panel border | 2px | `#3d9a8a` @ 30% |
| Decorative (rope) | 3px stroke | `#8b6914` |

### UI skinning rules

1. Apply `.skin-coincraft-cove` on `GameViewport` when Island #1 is active (or hub/travel in Cove session).  
2. **Panels:** sand-tinted glass (`--cc-panel-bg`), sea-green border, soft drop shadow (no hard black).  
3. **Primary button:** coin gradient; secondary: sea fill; choice rows: sand with sea hover.  
4. **Typography:** Keep system UI; titles use `font-black`; body never below 16px.  
5. **Emoji fallback:** Only when portrait SVG missing; prefer `NpcPortrait` component.  
6. **Motion:** Gentle bob on environment; 150ms color transitions on buttons.

---

## 4. Character style rules (NPCs)

### Proportions (chibi-coastal)

```
Total height: 100 units
Head: 38 units diameter (≈38% of height)
Eyes: 12 units wide each, 40% down head — white + navy pupil
Body: 52 units, 1.2× head width, rounded rect radius 12
Limbs: optional stubs only; readability from torso + prop
```

### Silhouette checklist

| NPC | Silhouette hook | Prop |
|-----|-----------------|------|
| Captain Penny | Wide captain hat brim | Anchor badge |
| Artisan Alma | Beret + apron bump | Paintbrush |
| Keeper Kira | Tall stripe cap | Lantern |
| Shelly | Shell clip on hair | Conch tray |

### Facial rules

- **Eyes:** Always two; min 8px apart; never realistic lashes  
- **Mouth:** Simple curve or small line; express in dialogue text not face  
- **Skin:** `--cc-blush` base; no outlines inside face  
- **No** photorealism, **no** anime sharp chins  

### Implementation

- `src/art/coincraft/npcs/NpcPortrait.tsx` — SVG portraits  
- Map `npc_*` ids in `coincraftArt.ts`

---

## 5. Environment tile rules (Coincraft Cove)

### Materials

| Material | Fill | Edge highlight |
|----------|------|----------------|
| Water | linear `#7ec8e3` → `#5bb5a3` | white 20% top edge |
| Sand / path | `#f5e6c8` | `#fff8eb` 1px top |
| Wood dock | `#c4956a` | `#deb887` |
| Grass | `#7cb87a` | `#9dd48d` |
| Stone | `#94a3b8` | `#cbd5e1` |
| Market awning | `#e8927c` / `#f4b942` stripes | 2px navy outline |

### Tile construction

- **Grid:** Logical 12×8 tile scene per area (rendered as single SVG)  
- **Edges:** Outer boundary 2px `--cc-navy` @ 40%; inner tiles 1px or shared edge  
- **Lighting:** Global light **upper-left** — highlight top + left edges, shadow bottom-right  
- **Depth:** Foreground props 100% opacity; background hills 70%  
- **No** photoreal textures; flat fills + gradient only  

### Areas (Island #1)

| Area ID | Scene key | Hero elements |
|---------|-----------|---------------|
| `cc_harbor` | harbor | Dock, boat, crates, gulls |
| `cc_craft_market` | market | Striped awning, stalls, shells |
| `cc_savings_lighthouse` | lighthouse | Red-white tower, glowing jar |

Implementation: `src/art/coincraft/environments/AreaScene.tsx`

---

## 6. File map

```
docs/art-direction-bible.md          ← this document
src/art/coincraft/
  coincraft-skin.css                 ← UI skin tokens + overrides
  coincraftArt.ts                    ← id maps, skin class name
  npcs/NpcPortrait.tsx               ← 4 NPC SVGs
  environments/AreaScene.tsx         ← 3 area SVGs
  index.ts
```

---

## 7. QA checklist (Coincraft Cove)

- [ ] Hub, travel, and island play use `.skin-coincraft-cove` in Cove session  
- [ ] All 4 NPCs show portrait SVG in explore list (not emoji)  
- [ ] Area scene updates when changing areas  
- [ ] Primary buttons use coin gold; panels use sand glass  
- [ ] Outlines consistent 2px navy family  
- [ ] Reduced motion disables environment bob  

---

*Version 1.0 · Cozy Seaside · Coincraft Cove vertical slice*
