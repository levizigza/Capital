/**
 * Sacred geometry tokens for Capital title + travel compositions.
 * Seed of Life / vesica / φ — one organizing language, not decoration spam.
 */

/** Golden ratio */
export const PHI = 1.618033988749895;
export const PHI_INV = 1 / PHI; // ≈ 0.618
export const PHI_SQ_INV = PHI_INV * PHI_INV; // ≈ 0.382

/** Map % — Seed of Life: hub · equilateral spine · φ-outer side ring */
export const SEED_HUB = { x: 50, y: 52 };
/**
 * Spine triangle radius (% of map).
 * Wide enough that dioramas breathe — not a jammed nest around the hub.
 */
export const SEED_SPINE_R = 26;
/** Side ring = spine × φ (Flower of Life next circle). */
export const SEED_SIDE_R = SEED_SPINE_R * PHI; // ≈ 42.1

/** Scene units for 3D map — clear water gaps between shores. */
export const SEED_SCENE_SPACING = 6.4;

/** Title / reveal plate vertical bias (golden section from top). */
export const TITLE_GOLDEN_TOP = `${PHI_SQ_INV * 100}%`; // ≈ 38.2%

/** Six Seed-of-Life petal angles (radians), tip-up. */
export const SEED_PETAL_ANGLES = [0, 1, 2, 3, 4, 5].map(
  (i) => -Math.PI / 2 + (i * Math.PI) / 3,
);

export function seedPoint(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}
