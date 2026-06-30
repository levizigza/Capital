import type { AssetRegistryEntry } from "./schema";

const SOURCE_LABELS: Record<AssetRegistryEntry["source"], string> = {
  opengameart: "OpenGameArt",
  gamedevmarket: "GameDevMarket",
  direct: "Direct / Author site",
  other: "Other",
};

function licenseDisplay(entry: AssetRegistryEntry): string {
  if (entry.gameDevMarket?.licenseTier) {
    return `${entry.license} — ${entry.gameDevMarket.licenseTier}`;
  }
  return entry.license;
}

export function formatCreditsTxt(assets: AssetRegistryEntry[], appName = "FinanceQuest Pro"): string {
  const lines: string[] = [
    `${appName} — Credits`,
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
    lines.push(`Source: ${SOURCE_LABELS[a.source]} — ${a.sourceUrl}`);
    lines.push(`License: ${licenseDisplay(a)} — ${a.licenseUrl}`);
    if (a.modifications && a.modifications !== "None") {
      lines.push(`Modifications: ${a.modifications}`);
    }
    lines.push("");
  }

  lines.push("— End of credits —");
  return lines.join("\n");
}

export function formatThirdPartyLicensesTxt(
  assets: AssetRegistryEntry[],
  appName = "FinanceQuest Pro"
): string {
  const lines: string[] = [
    `${appName} — Third-Party Licenses`,
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
