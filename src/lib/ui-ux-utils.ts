import { GOLDEN_RATIO, MAJOR_THIRD } from './design-tokens'

export const calculateOptimalLineLength = (fontSize: number): number => {
  return Math.round(fontSize * 30)
}

export const calculateOptimalLineHeight = (fontSize: number): number => {
  return fontSize * 1.5
}

export const applyGoldenRatio = (baseValue: number, power = 1): number => {
  return baseValue * Math.pow(GOLDEN_RATIO, power)
}

export const applyMajorThird = (baseValue: number, power = 1): number => {
  return baseValue * Math.pow(MAJOR_THIRD, power)
}

export const calculateContrastRatio = (
  l1: number,
  l2: number
): number => {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export const meetsWCAGAA = (l1: number, l2: number, isLargeText = false): boolean => {
  const ratio = calculateContrastRatio(l1, l2)
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

export const meetsWCAGAAA = (l1: number, l2: number, isLargeText = false): boolean => {
  const ratio = calculateContrastRatio(l1, l2)
  return isLargeText ? ratio >= 4.5 : ratio >= 7
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const lerp = (start: number, end: number, amount: number): number => {
  return start + (end - start) * amount
}

export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export interface VisualHierarchy {
  level: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  size: string
  weight: string
  color: string
  spacing: string
}

export const getVisualHierarchy = (level: VisualHierarchy['level']): VisualHierarchy => {
  const hierarchies: Record<VisualHierarchy['level'], VisualHierarchy> = {
    primary: {
      level: 'primary',
      size: '2.25rem',
      weight: '700',
      color: 'foreground',
      spacing: '1.5rem',
    },
    secondary: {
      level: 'secondary',
      size: '1.5rem',
      weight: '600',
      color: 'foreground',
      spacing: '1rem',
    },
    tertiary: {
      level: 'tertiary',
      size: '1.125rem',
      weight: '600',
      color: 'foreground',
      spacing: '0.75rem',
    },
    quaternary: {
      level: 'quaternary',
      size: '1rem',
      weight: '500',
      color: 'foregroundMuted',
      spacing: '0.5rem',
    },
  }
  return hierarchies[level]
}

export const calculateFittsLaw = (distance: number, targetSize: number): number => {
  if (targetSize <= 0) return Infinity
  return Math.log2(distance / targetSize + 1)
}

export const calculateOptimalTouchTarget = (importance: 'high' | 'medium' | 'low'): number => {
  const sizes = {
    high: 56,
    medium: 48,
    low: 44,
  }
  return sizes[importance]
}

export const applyHicksLaw = (numChoices: number): number => {
  if (numChoices <= 0) return 0
  return Math.log2(numChoices + 1)
}

export const shouldGroupChoices = (numChoices: number): boolean => {
  return numChoices > 7
}

export const applyMillersLaw = <T>(items: T[]): T[][] => {
  const chunkSize = 7
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
}

export const calculateOptimalSpacing = (
  containerWidth: number,
  numItems: number,
  itemWidth: number
): number => {
  const totalItemWidth = numItems * itemWidth
  const availableSpace = containerWidth - totalItemWidth
  return Math.max(0, availableSpace / (numItems + 1))
}

export const applyProximityPrinciple = (
  items: { related: boolean }[]
): { group: number; index: number }[] => {
  const grouped: { group: number; index: number }[] = []
  let currentGroup = 0

  items.forEach((item, index) => {
    if (index > 0 && !item.related) {
      currentGroup++
    }
    grouped.push({ group: currentGroup, index })
  })

  return grouped
}

export interface ColorHarmony {
  primary: number
  complementary: number
  analogous: [number, number]
  triadic: [number, number, number]
  splitComplementary: [number, number, number]
}

export const generateColorHarmony = (primaryHue: number): ColorHarmony => {
  const normalize = (hue: number) => ((hue % 360) + 360) % 360

  return {
    primary: primaryHue,
    complementary: normalize(primaryHue + 180),
    analogous: [normalize(primaryHue - 30), normalize(primaryHue + 30)],
    triadic: [
      primaryHue,
      normalize(primaryHue + 120),
      normalize(primaryHue + 240),
    ],
    splitComplementary: [
      primaryHue,
      normalize(primaryHue + 150),
      normalize(primaryHue + 210),
    ],
  }
}

export const isAnalogousColor = (hue1: number, hue2: number, threshold = 30): boolean => {
  const diff = Math.abs(hue1 - hue2)
  return diff <= threshold || diff >= (360 - threshold)
}

export const calculateVisualWeight = (
  size: number,
  color: number,
  position: 'center' | 'edge'
): number => {
  const positionWeight = position === 'center' ? 1.2 : 1
  const sizeWeight = size / 16
  const colorWeight = color / 100
  return sizeWeight * colorWeight * positionWeight
}

export const applyRuleOfThirds = (
  width: number,
  height: number
): { horizontal: [number, number]; vertical: [number, number] } => {
  return {
    horizontal: [width / 3, (width * 2) / 3],
    vertical: [height / 3, (height * 2) / 3],
  }
}

export const calculateOptimalCardWidth = (containerWidth: number, numColumns: number): number => {
  const gap = 16
  const totalGap = gap * (numColumns - 1)
  return (containerWidth - totalGap) / numColumns
}

export const shouldUseCardLayout = (contentDensity: 'low' | 'medium' | 'high'): boolean => {
  return contentDensity !== 'high'
}

export const getOptimalAnimationDuration = (distance: number): number => {
  return clamp(100 + distance * 0.5, 100, 500)
}

export const shouldReduceMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const getResponsiveValue = <T>(
  values: { mobile: T; tablet: T; desktop: T },
  width: number
): T => {
  if (width < 768) return values.mobile
  if (width < 1024) return values.tablet
  return values.desktop
}

export const calculateReadingTime = (text: string, wordsPerMinute = 200): number => {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export const truncateWithEllipsis = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('en-US', options).format(num)
}

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return formatNumber(amount, { style: 'currency', currency })
}

export const formatPercentage = (value: number, decimals = 0): string => {
  return formatNumber(value, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export const getAccessibleLabel = (text: string, context?: string): string => {
  if (context) return `${text}, ${context}`
  return text
}

export const generateAriaDescription = (
  element: string,
  state?: string,
  action?: string
): string => {
  let description = element
  if (state) description += `, ${state}`
  if (action) description += `. ${action}`
  return description
}

export const shouldShowTooltip = (textOverflow: boolean, hasContext: boolean): boolean => {
  return textOverflow || hasContext
}

export const calculateOptimalModalWidth = (
  screenWidth: number,
  content: 'narrow' | 'medium' | 'wide'
): number => {
  const widths = {
    narrow: Math.min(screenWidth * 0.9, 480),
    medium: Math.min(screenWidth * 0.9, 640),
    wide: Math.min(screenWidth * 0.9, 800),
  }
  return widths[content]
}

export const applyLawOfSimilarity = <T extends { type: string }>(
  items: T[]
): Map<string, T[]> => {
  const grouped = new Map<string, T[]>()
  items.forEach((item) => {
    const group = grouped.get(item.type) || []
    group.push(item)
    grouped.set(item.type, group)
  })
  return grouped
}

export const calculateZIndexForLayer = (
  layer: 'base' | 'elevated' | 'modal' | 'notification'
): number => {
  const layers = {
    base: 0,
    elevated: 10,
    modal: 1000,
    notification: 10000,
  }
  return layers[layer]
}

export const getColorMeaning = (
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple'
): string => {
  const meanings = {
    green: 'success, growth, positive',
    yellow: 'warning, attention, caution',
    red: 'error, danger, important',
    blue: 'information, trust, calm',
    purple: 'special, premium, creative',
  }
  return meanings[color]
}

export const shouldUseWhiteSpace = (
  contentType: 'text' | 'data' | 'media',
  density: 'low' | 'medium' | 'high'
): boolean => {
  if (contentType === 'data' && density === 'high') return false
  return true
}

export const calculateContentDensity = (
  elementsCount: number,
  containerArea: number
): 'low' | 'medium' | 'high' => {
  const density = elementsCount / (containerArea / 10000)
  if (density < 5) return 'low'
  if (density < 15) return 'medium'
  return 'high'
}
