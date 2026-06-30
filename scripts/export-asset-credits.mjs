#!/usr/bin/env node
/**
 * Export public/CREDITS.txt and public/THIRD_PARTY_LICENSES.txt from content/assets/
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "content", "assets");
const publicDir = join(root, "public");
const APP = "FinanceQuest Pro";

const SOURCE_LABELS = {
  opengameart: "OpenGameArt",
  gamedevmarket: "GameDevMarket",
  direct: "Direct / Author site",
  other: "Other",
};

function licenseDisplay(entry) {
  if (entry.gameDevMarket?.licenseTier) {
    return `${entry.license} — ${entry.gameDevMarket.licenseTier}`;
  }
  return entry.license;
}

function formatCreditsTxt(assets) {
  const lines = [
    `${APP} — Credits`,
    "=".repeat(48),
    "",
    "Third-party assets and attributions.",
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
  ];

  for (const a of assets) {
    lines.push(a.name);
    lines.push("-".repeat(Math.min(a.name.length, 48)));
    lines.push(a.attributionText);
    lines.push(`Author: ${a.author}`);
    lines.push(`Source: ${SOURCE_LABELS[a.source] ?? a.source} — ${a.sourceUrl}`);
    lines.push(`License: ${licenseDisplay(a)} — ${a.licenseUrl}`);
    if (a.modifications && a.modifications !== "None") {
      lines.push(`Modifications: ${a.modifications}`);
    }
    lines.push("");
  }

  lines.push("— End of credits —");
  return lines.join("\n");
}

function formatThirdPartyLicensesTxt(assets) {
  const lines = [
    `${APP} — Third-Party Licenses`,
    "=".repeat(48),
    "",
    "This file lists third-party assets bundled with or referenced by the application",
    "and their respective licenses. See CREDITS.txt for attribution text.",
    "",
  ];

  for (const a of assets) {
    lines.push(`[${a.id}] ${a.name}`);
    lines.push(`  Type: ${a.type}`);
    lines.push(`  License: ${licenseDisplay(a)}`);
    lines.push(`  License URL: ${a.licenseUrl}`);
    lines.push(`  Source URL: ${a.sourceUrl}`);
    if (a.files?.length) {
      lines.push(`  Files: ${a.files.join(", ")}`);
    }
    if (a.gameDevMarket) {
      lines.push(`  GameDevMarket product: ${a.gameDevMarket.productId ?? "see source URL"}`);
      lines.push(`  License tier: ${a.gameDevMarket.licenseTier}`);
    }
    lines.push("");
  }

  lines.push("— End of third-party licenses —");
  return lines.join("\n");
}

async function loadAssets() {
  const entries = await readdir(assetsDir, { withFileTypes: true });
  const assets = [];

  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith(".json") || e.name.startsWith("_")) continue;
    const data = JSON.parse(await readFile(join(assetsDir, e.name), "utf8"));
    assets.push(data);
  }

  assets.sort((a, b) => a.name.localeCompare(b.name));
  return assets;
}

async function main() {
  const assets = await loadAssets();
  if (assets.length === 0) {
    console.error("[asset-registry] No assets to export");
    process.exit(1);
  }

  await mkdir(publicDir, { recursive: true });

  const credits = formatCreditsTxt(assets);
  const licenses = formatThirdPartyLicensesTxt(assets);

  await writeFile(join(publicDir, "CREDITS.txt"), credits, "utf8");
  await writeFile(join(publicDir, "THIRD_PARTY_LICENSES.txt"), licenses, "utf8");

  console.log(`[asset-registry] Wrote public/CREDITS.txt (${assets.length} assets)`);
  console.log("[asset-registry] Wrote public/THIRD_PARTY_LICENSES.txt");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
