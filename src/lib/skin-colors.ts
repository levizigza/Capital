/** Map of skin-tone IDs → hex colours (canonical source of truth). */
const SKIN_COLOR_MAP: Record<string, string> = {
  pale: '#FFEBD0',
  fair: '#FFE0BD',
  light: '#F1C27D',
  'medium-light': '#F1C27D',
  medium: '#C68642',
  tan: '#A0522D',
  brown: '#8D5524',
  dark: '#5C3317',
}

/**
 * Resolve a skin-tone value to a valid hex colour.
 * Accepts either an ID ("medium") or an existing hex string ("#C68642").
 */
export function resolveSkinColor(skinTone: string | undefined | null): string {
  if (!skinTone) return '#F1C27D'
  if (SKIN_COLOR_MAP[skinTone]) return SKIN_COLOR_MAP[skinTone]
  if (skinTone.startsWith('#')) return skinTone
  return '#F1C27D'
}
