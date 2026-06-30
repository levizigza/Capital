import { z } from "zod";

export const PixelFrameSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
  /** Optional per-frame duration override (ms). */
  durationMs: z.number().positive().optional(),
});

export const PixelAnimationSchema = z.object({
  frames: z.array(z.string()).min(1),
  fps: z.number().positive().default(6),
  loop: z.boolean().default(true),
});

export const PixelAtlasMetaSchema = z.object({
  image: z.string().default("spritesheet.png"),
  frameWidth: z.number().int().positive(),
  frameHeight: z.number().int().positive(),
  /** Source pixels per art pixel (1 = native). */
  pixelScale: z.number().int().positive().default(1),
});

export const PixelAtlasSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["npc", "prop", "tile", "fx", "ui"]).default("npc"),
  /** Optional link to game entity id (e.g. npc_captain_penny). */
  entityId: z.string().optional(),
  meta: PixelAtlasMetaSchema,
  frames: z.record(PixelFrameSchema),
  animations: z.record(PixelAnimationSchema),
  defaultAnimation: z.string().default("idle"),
});

export type PixelFrame = z.infer<typeof PixelFrameSchema>;
export type PixelAnimation = z.infer<typeof PixelAnimationSchema>;
export type PixelAtlasMeta = z.infer<typeof PixelAtlasMetaSchema>;
export type PixelAtlas = z.infer<typeof PixelAtlasSchema>;

export type LoadedPixelAtlas = PixelAtlas & {
  /** Vite-resolved URL for the spritesheet PNG. */
  imageUrl: string;
  /** Repo-relative directory (e.g. content/pixel/npcs/captain-penny). */
  directory: string;
};
