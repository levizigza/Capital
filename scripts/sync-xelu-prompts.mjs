#!/usr/bin/env node
/**
 * Sync Xelu CC0 prompt PNGs into public/input-prompts/xelu/
 */
import { createWriteStream, existsSync, readdirSync, copyFileSync, mkdirSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outRoot = join(root, "public", "input-prompts", "xelu");
const tmpDir = join(root, ".cache", "xelu-prompts");
const ZIP_URL =
  "https://opengameart.org/sites/default/files/xelu_free_keyboardcontroller_prompts_pack.zip";

/** Copy entire source subfolders → dest relative to outRoot */
const FOLDER_MAP = [
  { src: ["Keyboard & Mouse", "Dark"], dest: ["keyboard", "dark"] },
  { src: ["Keyboard & Mouse", "Light"], dest: ["keyboard", "light"] },
  { src: ["Xbox Series X"], dest: ["xbox-series", "dark"] },
  { src: ["Xbox One"], dest: ["xbox-one", "dark"] },
  { src: ["Switch"], dest: ["switch", "dark"] },
  { src: ["PS5"], dest: ["playstation", "dark"] },
];

function copyDir(srcDir, destDir) {
  let n = 0;
  if (!existsSync(srcDir)) return n;
  mkdirSync(destDir, { recursive: true });
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const s = join(srcDir, entry.name);
    const d = join(destDir, entry.name);
    if (entry.isDirectory()) n += copyDir(s, d);
    else if (/\.(png|webp)$/i.test(entry.name)) {
      copyFileSync(s, d);
      n++;
    }
  }
  return n;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  await mkdir(dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function extractZip(zipPath, destDir) {
  const { execSync } = await import("node:child_process");
  await mkdir(destDir, { recursive: true });
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force"`,
      { stdio: "inherit" }
    );
  } else {
    execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: "inherit" });
  }
}

async function main() {
  console.log("[xelu] Syncing CC0 prompt pack…");
  await mkdir(tmpDir, { recursive: true });
  const zipPath = join(tmpDir, "xelu_pack.zip");
  const extractPath = join(tmpDir, "extracted");

  if (!existsSync(zipPath)) {
    console.log("[xelu] Downloading…");
    await download(ZIP_URL, zipPath);
  }

  if (!existsSync(extractPath)) {
    await extractZip(zipPath, extractPath);
  }

  await mkdir(outRoot, { recursive: true });
  let copied = 0;

  for (const { src, dest } of FOLDER_MAP) {
    const srcDir = join(extractPath, ...src);
    const destDir = join(outRoot, ...dest);
    const n = copyDir(srcDir, destDir);
    copied += n;
    console.log(`[xelu] ${src.join("/")} → ${dest.join("/")}: ${n} files`);
  }

  console.log(`[xelu] Total: ${copied} images in public/input-prompts/xelu/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
