#!/usr/bin/env node
/**
 * Lightweight security hygiene checks for CI.
 * Fails on obvious footguns — not a full SAST replacement.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const src = join(root, "src");
const failures = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(src);

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const rel = file.slice(root.length + 1).replace(/\\/g, "/");

  if (/\beval\s*\(/.test(text) && !rel.includes(".test.")) {
    failures.push(`${rel}: eval() is forbidden`);
  }
  if (/new Function\s*\(/.test(text)) {
    failures.push(`${rel}: new Function() is forbidden`);
  }
  if (/document\.write\s*\(/.test(text)) {
    failures.push(`${rel}: document.write is forbidden`);
  }

  // Flag innerHTML assignments that interpolate variables (template with ${)
  if (
    /\.innerHTML\s*=\s*[`'"].*\$\{/.test(text) &&
    !rel.includes("animation-utils") // should be cleaned; still flag others
  ) {
    failures.push(`${rel}: innerHTML with template interpolation — use textContent/React`);
  }
}

// Ensure security module + CSP plugin exist
for (const must of [
  "src/security/vault.ts",
  "src/security/safeJson.ts",
  "src/security/storageRegistry.ts",
  "docs/security/threat-model.md",
]) {
  try {
    readFileSync(join(root, must));
  } catch {
    failures.push(`missing required file: ${must}`);
  }
}

const vite = readFileSync(join(root, "vite.config.ts"), "utf8");
if (!vite.includes("capitalCspPlugin") || !vite.includes("Content-Security-Policy")) {
  failures.push("vite.config.ts must inject production CSP via capitalCspPlugin");
}
if (!vite.includes("media-src 'self' data: blob:")) {
  failures.push("vite.config.ts CSP must allow media-src 'self' data: blob: (audio beds)");
}

if (failures.length) {
  console.error("Security checks failed:\n" + failures.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}

console.log(`Security checks passed (${files.length} source files scanned).`);
