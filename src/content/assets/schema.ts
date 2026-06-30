import { z } from "zod";

export const AssetTypeSchema = z.enum([
  "image",
  "audio",
  "font",
  "sprite",
  "3d-model",
  "shader",
  "other",
]);

export const AssetSourceSchema = z.enum([
  "opengameart",
  "gamedevmarket",
  "direct",
  "other",
]);

export const GameDevMarketMetaSchema = z.object({
  productId: z.string().min(1).optional(),
  licenseTier: z.string().min(1),
});

export const AssetRegistryEntrySchema = z
  .object({
    id: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be kebab-case"),
    name: z.string().min(1),
    type: AssetTypeSchema,
    source: AssetSourceSchema,
    sourceUrl: z.string().url(),
    author: z.string().min(1),
    license: z.string().min(1),
    licenseUrl: z.string().url(),
    attributionText: z.string().min(1),
    modifications: z.string().min(1),
    files: z.array(z.string().min(1)).optional(),
    gameDevMarket: GameDevMarketMetaSchema.optional(),
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

export type AssetRegistryEntry = z.infer<typeof AssetRegistryEntrySchema>;

export const AssetRegistrySchema = z.object({
  version: z.literal(1),
  assets: z.array(AssetRegistryEntrySchema).min(0),
});

export type AssetRegistry = z.infer<typeof AssetRegistrySchema>;
