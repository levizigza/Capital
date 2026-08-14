/**
 * Seeded PRNG for reproducible economy sims (mulberry32).
 */

export type Rng = () => number;

export function createRng(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngInt(rng: Rng, minInclusive: number, maxInclusive: number): number {
  return minInclusive + Math.floor(rng() * (maxInclusive - minInclusive + 1));
}

export function rngPick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

/** Temporarily replace Math.random for APIs that still call it. */
export function withMathRandom<T>(rng: Rng, fn: () => T): T {
  const prev = Math.random;
  Math.random = rng;
  try {
    return fn();
  } finally {
    Math.random = prev;
  }
}
