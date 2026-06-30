#!/usr/bin/env node
/**
 * Validates all content/assets/*.json entries (CI gate).
 * Fails if license metadata is missing or invalid.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "..", "content", "assets");

const AssetRegistryEntrySchema = z
  .object({
    id: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    type: z.enum(["image", "audio", "font", "sprite", "3d-model", "shader", "other"]),
    source: z.enum(["opengameart", "gamedevmarket", "direct", "other"]),
    sourceUrl: z.string().url(),
    author: z.string().min(1),
    license: z.string().min(1),
    licenseUrl: z.string().url(),
    attributionText: z.string().min(1),
    modifications: z.string().min(1),
    files: z.array(z.string().min(1)).optional(),
    gameDevMarket: z
      .object({
        productId: z.string().min(1).optional(),
        licenseTier: z.string().min(1),
      })
      .optional(),
  })
  .superRefine((entry, ctx) => {
    if (entry.source === "gamedevmarket" && !entry.gameDevMarket) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "gameDevMarket metadata required when source is gamedevmarket",
        path: ["gameDevMarket"],
      });
    }
  });

async function main() {
  const entries = await readdir(assetsDir, { withFileTypes: true });
  const jsonFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".json") && !e.name.startsWith("_"))
    .map((e) => e.name);

  if (jsonFiles.length === 0) {
    console.error("[asset-registry] No asset JSON files found in content/assets/");
    process.exit(1);
  }

  const ids = new Set();
  let ok = 0;

  for (const file of jsonFiles) {
    const path = join(assetsDir, file);
    const raw = JSON.parse(await readFile(path, "utf8"));
    const result = AssetRegistryEntrySchema.safeParse(raw);

    if (!result.success) {
      console.error(`[asset-registry] INVALID: ${file}`);
      console.error(result.error.format());
      process.exit(1);
    }

    const entry = result.data;
    if (file !== `${entry.id}.json`) {
      console.error(
        `[asset-registry] Filename mismatch: ${file} must be ${entry.id}.json`
      );
      process.exit(1);
    }
    if (ids.has(entry.id)) {
      console.error(`[asset-registry] Duplicate id: ${entry.id}`);
      process.exit(1);
    }
    ids.add(entry.id);
    console.log(`[asset-registry] OK  ${entry.id} (${entry.license})`);
    ok++;
  }

  console.log(`[asset-registry] Validated ${ok} asset(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
