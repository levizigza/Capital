#!/usr/bin/env node
/**
 * Writes public/health.json for static deploy readiness probes.
 * Mirrors future API /healthz — version, build id, commit, generatedAt.
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function git(cmd) {
  try {
    return execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const commit = process.env.GITHUB_SHA || git("git rev-parse --short HEAD");
const buildId =
  process.env.VITE_BUILD_ID ||
  (process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 12) : null) ||
  (commit !== "unknown" ? commit : null) ||
  `local-${Date.now().toString(36)}`;

const health = {
  status: "ok",
  service: "capital",
  version: pkg.version ?? "0.0.0",
  buildId,
  commit,
  generatedAt: new Date().toISOString(),
  /** Capacity note for operators — static SPA today; reserved for API tiers. */
  capacity: {
    mode: "static_spa",
    notes: "Client-side SRE ring buffer; optional VITE_TELEMETRY_URL for remote.",
  },
};

const outDir = join(root, "public");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "health.json");
writeFileSync(outPath, JSON.stringify(health, null, 2) + "\n");
console.log(`[health] wrote ${outPath} buildId=${buildId}`);
