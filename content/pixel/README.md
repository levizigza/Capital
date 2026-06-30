# Pixel art assets

Drop NPC / tile atlases here. Each asset is a folder with:

```
content/pixel/npcs/my-npc/
  spritesheet.png   # PNG strip or grid (export from 8bitworkshop / Aseprite)
  atlas.json        # Frame rects + animations (see _template.atlas.json)
  frames/           # (optional) individual frames for npm run pixel:pack
  atlas.config.json # (optional) metadata for pack script
```

**Preview instantly:** `http://localhost:5000/?pixelPreview=1`

**Commands:**

```bash
npm run pixel:sample              # regenerate demo NPC sheets
npm run pixel:pack -- content/pixel/npcs/my-npc
npm run pixel:pack -- --grid content/pixel/npcs/my-npc
```

See [docs/pixel-art-pipeline.md](../docs/pixel-art-pipeline.md).
