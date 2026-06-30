#!/usr/bin/env node
/**
 * Generates sample Coincraft Cove NPC spritesheets + atlas.json.
 * Run: npm run pixel:sample
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function loadPngjs() {
  const mod = await import("pngjs");
  return mod.PNG;
}

function setPixel(png, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

function fillRect(png, x, y, w, h, color) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      setPixel(png, px, py, ...color);
    }
  }
}

function drawChibiNpc(png, ox, oy, palette, bounce = 0, waveArm = false) {
  const skin = [248, 212, 196, 255];
  const outline = [45, 74, 111, 255];
  const y = oy + bounce;

  fillRect(png, ox + 9, y + 13, 14, 12, outline);
  fillRect(png, ox + 10, y + 14, 12, 10, skin);
  fillRect(png, ox + 11, y + 16, 3, 4, [255, 255, 255, 255]);
  fillRect(png, ox + 18, y + 16, 3, 4, [255, 255, 255, 255]);
  setPixel(png, ox + 12, y + 18, 45, 74, 111);
  setPixel(png, ox + 19, y + 18, 45, 74, 111);

  fillRect(png, ox + 7, y + 21, 18, 12, outline);
  fillRect(png, ox + 8, y + 22, 16, 10, palette.body);

  if (palette.hat) fillRect(png, ox + 8, y + 8, 16, 4, palette.hat);
  if (palette.prop) fillRect(png, ox + 22, y + 20, 3, 8, palette.prop);
  if (waveArm) fillRect(png, ox + 22, y + 16, 4, 3, skin);
}

function buildAtlas(config, frameKeys) {
  const fw = config.meta.frameWidth;
  const fh = config.meta.frameHeight;
  const frames = {};
  frameKeys.forEach((key, i) => {
    frames[key] = { x: i * fw, y: 0, w: fw, h: fh };
  });
  return {
    id: config.id,
    name: config.name,
    category: config.category,
    entityId: config.entityId,
    meta: config.meta,
    frames,
    animations: config.animations,
    defaultAnimation: config.defaultAnimation,
  };
}

const PNG = await loadPngjs();

const npcs = [
  {
    dir: "content/pixel/npcs/captain-penny",
    config: {
      id: "pixel_captain_penny",
      name: "Captain Penny",
      category: "npc",
      entityId: "npc_captain_penny",
      meta: { image: "spritesheet.png", frameWidth: 32, frameHeight: 32, pixelScale: 1 },
      animations: {
        idle: { frames: ["idle_0", "idle_1", "idle_2", "idle_3"], fps: 4, loop: true },
      },
      defaultAnimation: "idle",
    },
    palette: { body: [61, 154, 138, 255], hat: [45, 74, 111, 255], prop: [244, 185, 66, 255] },
    drawExtra: () => false,
  },
  {
    dir: "content/pixel/npcs/shelly-trader",
    config: {
      id: "pixel_shelly_trader",
      name: "Shelly (Trader)",
      category: "npc",
      entityId: "npc_shelly",
      meta: { image: "spritesheet.png", frameWidth: 32, frameHeight: 32, pixelScale: 1 },
      animations: {
        idle: { frames: ["idle_0", "idle_1", "idle_2", "idle_3"], fps: 5, loop: true },
        wave: { frames: ["wave_0", "wave_1", "wave_2", "wave_3"], fps: 8, loop: true },
      },
      defaultAnimation: "idle",
    },
    palette: { body: [126, 200, 227, 255], hat: [232, 146, 124, 255], prop: [245, 230, 200, 255] },
    drawExtra: (key) => key.startsWith("wave"),
  },
];

for (const npc of npcs) {
  const allFrameKeys = Object.values(npc.config.animations).flatMap((a) => a.frames);
  const png = new PNG({ width: 32 * allFrameKeys.length, height: 32 });

  allFrameKeys.forEach((key, i) => {
    drawChibiNpc(
      png,
      i * 32,
      0,
      npc.palette,
      i % 2 === 0 ? 0 : -1,
      npc.drawExtra(key)
    );
  });

  const absDir = path.join(root, npc.dir);
  fs.mkdirSync(absDir, { recursive: true });
  fs.writeFileSync(path.join(absDir, "spritesheet.png"), PNG.sync.write(png));
  fs.writeFileSync(
    path.join(absDir, "atlas.json"),
    JSON.stringify(buildAtlas(npc.config, allFrameKeys), null, 2) + "\n"
  );
  console.log(`[pixel:sample] wrote ${npc.dir}/`);
}

console.log("[pixel:sample] Preview at http://localhost:5000/?pixelPreview=1");
