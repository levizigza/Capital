#!/usr/bin/env node
/**
 * Pack individual frame PNGs into a horizontal spritesheet + atlas.json.
 *
 * Usage:
 *   node scripts/pack-pixel-atlas.mjs content/pixel/npcs/my-npc
 *   node scripts/pack-pixel-atlas.mjs --grid content/pixel/npcs/my-npc --cols 4 --rows 1 --frame 32
 *
 * Grid mode: existing spritesheet.png + atlas.config.json → writes atlas.json only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = { mode: "strip", target: null, cols: 4, rows: 1, frame: 32 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--grid") args.mode = "grid";
    else if (a === "--cols") args.cols = Number(argv[++i]);
    else if (a === "--rows") args.rows = Number(argv[++i]);
    else if (a === "--frame") args.frame = Number(argv[++i]);
    else if (!a.startsWith("-")) args.target = path.resolve(root, a);
  }
  return args;
}

async function loadPngjs() {
  try {
    const mod = await import("pngjs");
    return mod.PNG;
  } catch {
    console.error(
      "[pixel:pack] pngjs not installed. Run: npm install -D pngjs\n" +
        "Or use --grid mode with an existing spritesheet.png + atlas.config.json"
    );
    process.exit(1);
  }
}

function writeAtlasJson(dir, atlas) {
  const out = path.join(dir, "atlas.json");
  fs.writeFileSync(out, JSON.stringify(atlas, null, 2) + "\n");
  console.log(`[pixel:pack] wrote ${path.relative(root, out)}`);
}

function packFromGrid(dir, cols, rows, frameSize) {
  const configPath = path.join(dir, "atlas.config.json");
  if (!fs.existsSync(configPath)) {
    console.error(`[pixel:pack] missing ${configPath} for grid mode`);
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const sheetPath = path.join(dir, config.meta?.image ?? "spritesheet.png");
  if (!fs.existsSync(sheetPath)) {
    console.error(`[pixel:pack] missing spritesheet: ${sheetPath}`);
    process.exit(1);
  }

  const fw = config.meta?.frameWidth ?? frameSize;
  const fh = config.meta?.frameHeight ?? frameSize;
  const frames = {};
  let index = 0;

  for (const [animName, anim] of Object.entries(config.animations ?? {})) {
    for (const frameKey of anim.frames) {
      const col = index % cols;
      const row = Math.floor(index / cols);
      frames[frameKey] = { x: col * fw, y: row * fh, w: fw, h: fh };
      index++;
    }
    }
  }

  const atlas = {
    id: config.id,
    name: config.name,
    category: config.category ?? "npc",
    entityId: config.entityId,
    meta: {
      image: config.meta?.image ?? "spritesheet.png",
      frameWidth: fw,
      frameHeight: fh,
      pixelScale: config.meta?.pixelScale ?? 1,
    },
    frames,
    animations: config.animations,
    defaultAnimation: config.defaultAnimation ?? Object.keys(config.animations ?? {})[0] ?? "idle",
  };

  writeAtlasJson(dir, atlas);
}

async function packFromStrip(dir) {
  const PNG = await loadPngjs();
  const framesDir = path.join(dir, "frames");
  if (!fs.existsSync(framesDir)) {
    console.error(`[pixel:pack] missing frames/ in ${dir}`);
    process.exit(1);
  }

  const configPath = path.join(dir, "atlas.config.json");
  const config = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, "utf8"))
    : {
        id: path.basename(dir),
        name: path.basename(dir),
        category: "npc",
        meta: { frameWidth: 32, frameHeight: 32, pixelScale: 1 },
        animations: { idle: { frames: [], fps: 6, loop: true } },
        defaultAnimation: "idle",
      };

  const frameFiles = fs
    .readdirSync(framesDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  if (frameFiles.length === 0) {
    console.error(`[pixel:pack] no PNG frames in ${framesDir}`);
    process.exit(1);
  }

  const first = PNG.sync.read(fs.readFileSync(path.join(framesDir, frameFiles[0])));
  const fw = config.meta?.frameWidth ?? first.width;
  const fh = config.meta?.frameHeight ?? first.height;
  const sheetWidth = fw * frameFiles.length;
  const sheetHeight = fh;

  const sheet = new PNG({ width: sheetWidth, height: sheetHeight });
  const frames = {};

  frameFiles.forEach((file, i) => {
    const chunk = PNG.sync.read(fs.readFileSync(path.join(framesDir, file)));
    const key = file.replace(/\.png$/i, "");
    frames[key] = { x: i * fw, y: 0, w: fw, h: fh };

    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const srcIdx = (chunk.width * y + x) << 2;
        const dstIdx = (sheet.width * y + (i * fw + x)) << 2;
        sheet.data[dstIdx] = chunk.data[srcIdx];
        sheet.data[dstIdx + 1] = chunk.data[srcIdx + 1];
        sheet.data[dstIdx + 2] = chunk.data[srcIdx + 2];
        sheet.data[dstIdx + 3] = chunk.data[srcIdx + 3];
      }
    }
  });

  const sheetOut = path.join(dir, config.meta?.image ?? "spritesheet.png");
  fs.writeFileSync(sheetOut, PNG.sync.write(sheet));
  console.log(`[pixel:pack] wrote ${path.relative(root, sheetOut)} (${sheetWidth}×${sheetHeight})`);

  if (!config.animations?.idle?.frames?.length) {
    config.animations = {
      idle: { frames: frameFiles.map((f) => f.replace(/\.png$/i, "")), fps: 6, loop: true },
    };
  }

  const atlas = {
    id: config.id,
    name: config.name,
    category: config.category ?? "npc",
    entityId: config.entityId,
    meta: {
      image: config.meta?.image ?? "spritesheet.png",
      frameWidth: fw,
      frameHeight: fh,
      pixelScale: config.meta?.pixelScale ?? 1,
    },
    frames,
    animations: config.animations,
    defaultAnimation: config.defaultAnimation ?? "idle",
  };

  writeAtlasJson(dir, atlas);
}

const args = parseArgs(process.argv);
if (!args.target) {
  console.log(`Usage:
  node scripts/pack-pixel-atlas.mjs <content/pixel/npcs/my-npc>
  node scripts/pack-pixel-atlas.mjs --grid <dir> [--cols N] [--rows N] [--frame N]

Strip mode: packs frames/*.png → spritesheet.png + atlas.json
Grid mode: reads atlas.config.json + existing spritesheet.png → atlas.json`);
  process.exit(1);
}

if (args.mode === "grid") {
  packFromGrid(args.target, args.cols, args.rows, args.frame);
} else {
  await packFromStrip(args.target);
}
