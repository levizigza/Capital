/**
 * DUAL THEME SYSTEM
 * Professional Awwwards-inspired Structured Mode
 * Playful Coolmath4kids-inspired Creative Mode
 */

// ============================================
// STRUCTURED MODE - Professional/Award-Winning
// ============================================

export const STRUCTURED_THEME = {
  colors: {
    background: {
      primary: 'oklch(0.98 0.002 240)',
      secondary: 'oklch(0.96 0.004 240)',
      tertiary: 'oklch(0.99 0.001 240)',
      elevated: 'oklch(1.0 0.0 0)',
    },
    text: {
      primary: 'oklch(0.20 0.010 240)',
      secondary: 'oklch(0.42 0.008 240)',
      muted: 'oklch(0.58 0.006 240)',
      accent: 'oklch(0.32 0.14 245)',
    },
    brand: {
      primary: 'oklch(0.32 0.14 245)', // Deep blue
      primaryLight: 'oklch(0.45 0.12 245)',
      primaryDark: 'oklch(0.25 0.16 245)',
      secondary: 'oklch(0.42 0.12 190)', // Teal
      secondaryLight: 'oklch(0.55 0.10 190)',
      accent: 'oklch(0.68 0.15 75)', // Gold
      accentLight: 'oklch(0.78 0.12 75)',
    },
    semantic: {
      success: 'oklch(0.55 0.16 145)',
      warning: 'oklch(0.70 0.14 80)',
      error: 'oklch(0.58 0.20 25)',
      info: 'oklch(0.60 0.12 240)',
    },
    border: {
      light: 'oklch(0.94 0.003 240)',
      default: 'oklch(0.90 0.004 240)',
      strong: 'oklch(0.82 0.006 240)',
    },
  },
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'JetBrains Mono', 'Courier New', monospace",
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '-0.01em',
      wide: '0.01em',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px oklch(0.20 0.010 240 / 0.04), 0 1px 2px oklch(0.20 0.010 240 / 0.03)',
    md: '0 4px 12px oklch(0.20 0.010 240 / 0.08), 0 2px 6px oklch(0.20 0.010 240 / 0.06)',
    lg: '0 10px 24px oklch(0.20 0.010 240 / 0.12), 0 4px 12px oklch(0.20 0.010 240 / 0.08)',
    xl: '0 20px 40px oklch(0.20 0.010 240 / 0.16), 0 8px 20px oklch(0.20 0.010 240 / 0.10)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      decelerate: 'cubic-bezier(0.0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
} as const

// ============================================
// CREATIVE MODE - Playful/Game-Focused
// ============================================

export const CREATIVE_THEME = {
  colors: {
    background: {
      primary: 'oklch(0.95 0.04 120)', // Light green tint
      secondary: 'oklch(0.93 0.05 140)',
      tertiary: 'oklch(0.97 0.03 160)',
      elevated: 'oklch(0.98 0.03 120)',
    },
    text: {
      primary: 'oklch(0.25 0.08 120)',
      secondary: 'oklch(0.40 0.06 120)',
      muted: 'oklch(0.55 0.04 120)',
      accent: 'oklch(0.58 0.20 145)',
    },
    brand: {
      primary: 'oklch(0.58 0.20 145)', // Vibrant green
      primaryLight: 'oklch(0.68 0.18 145)',
      primaryDark: 'oklch(0.48 0.22 145)',
      secondary: 'oklch(0.65 0.22 35)', // Orange
      secondaryLight: 'oklch(0.75 0.20 35)',
      accent: 'oklch(0.60 0.24 280)', // Purple
      accentLight: 'oklch(0.70 0.22 280)',
    },
    game: {
      savings: 'oklch(0.68 0.20 145)', // Green
      investing: 'oklch(0.65 0.22 240)', // Blue
      credit: 'oklch(0.63 0.24 320)', // Magenta
      business: 'oklch(0.67 0.22 45)', // Yellow-orange
    },
    semantic: {
      success: 'oklch(0.58 0.20 145)',
      warning: 'oklch(0.72 0.18 80)',
      error: 'oklch(0.60 0.22 25)',
      info: 'oklch(0.62 0.18 240)',
    },
    border: {
      light: 'oklch(0.82 0.06 120)',
      default: 'oklch(0.78 0.08 120)',
      strong: 'oklch(0.70 0.10 120)',
    },
  },
  typography: {
    fontFamily: {
      primary: "'Fredoka', 'Comic Sans MS', 'Nunito', sans-serif",
      heading: "'Fredoka', 'Comic Sans MS', 'Nunito', sans-serif",
      display: "'Lilita One', 'Arial Black', sans-serif",
    },
    weights: {
      normal: 500,
      medium: 600,
      semibold: 600,
      bold: 700,
    },
    sizes: {
      xs: '0.875rem',
      sm: '1rem',
      base: '1.125rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '1.875rem',
      '3xl': '2.25rem',
      '4xl': '3rem',
      '5xl': '4rem',
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.4,
      relaxed: 1.6,
    },
    letterSpacing: {
      tight: '-0.01em',
      normal: '0em',
      wide: '0.025em',
    },
  },
  spacing: {
    xs: '0.375rem',
    sm: '0.75rem',
    md: '1.25rem',
    lg: '1.75rem',
    xl: '2.5rem',
    '2xl': '3.5rem',
    '3xl': '5rem',
  },
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 2px 6px oklch(0.25 0.08 120 / 0.12), 0 1px 3px oklch(0.25 0.08 120 / 0.08)',
    md: '0 6px 16px oklch(0.25 0.08 120 / 0.18), 0 3px 8px oklch(0.25 0.08 120 / 0.12)',
    lg: '0 12px 28px oklch(0.25 0.08 120 / 0.24), 0 6px 14px oklch(0.25 0.08 120 / 0.16)',
    xl: '0 24px 48px oklch(0.25 0.08 120 / 0.32), 0 12px 24px oklch(0.25 0.08 120 / 0.20)',
  },
  animations: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '350ms',
    },
    easing: {
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const

// ============================================
// MODE TRANSITION CONFIGS
// ============================================

export const MODE_TRANSITIONS = {
  duration: '600ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  properties: ['background', 'color', 'border-color', 'box-shadow', 'transform'],
} as const

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getThemeForMode = (mode: 'structured' | 'creative') => {
  return mode === 'structured' ? STRUCTURED_THEME : CREATIVE_THEME
}

export const generateThemeCSS = (mode: 'structured' | 'creative') => {
  const theme = getThemeForMode(mode)
  
  return {
    '--bg-primary': theme.colors.background.primary,
    '--bg-secondary': theme.colors.background.secondary,
    '--bg-tertiary': theme.colors.background.tertiary,
    '--bg-elevated': theme.colors.background.elevated,
    '--text-primary': theme.colors.text.primary,
    '--text-secondary': theme.colors.text.secondary,
    '--text-muted': theme.colors.text.muted,
    '--text-accent': theme.colors.text.accent,
    '--brand-primary': theme.colors.brand.primary,
    '--brand-primary-light': theme.colors.brand.primaryLight,
    '--brand-primary-dark': theme.colors.brand.primaryDark,
    '--brand-secondary': theme.colors.brand.secondary,
    '--brand-secondary-light': theme.colors.brand.secondaryLight,
    '--brand-accent': theme.colors.brand.accent,
    '--brand-accent-light': theme.colors.brand.accentLight,
    '--semantic-success': theme.colors.semantic.success,
    '--semantic-warning': theme.colors.semantic.warning,
    '--semantic-error': theme.colors.semantic.error,
    '--semantic-info': theme.colors.semantic.info,
    '--border-light': theme.colors.border.light,
    '--border-default': theme.colors.border.default,
    '--border-strong': theme.colors.border.strong,
    '--font-primary': theme.typography.fontFamily.primary,
    '--font-heading': theme.typography.fontFamily.heading,
    '--shadow-sm': theme.shadows.sm,
    '--shadow-md': theme.shadows.md,
    '--shadow-lg': theme.shadows.lg,
    '--shadow-xl': theme.shadows.xl,
  }
}

// ============================================
// COMPONENT STYLE PRESETS
// ============================================

export const COMPONENT_PRESETS = {
  structured: {
    card: {
      background: STRUCTURED_THEME.colors.background.elevated,
      border: STRUCTURED_THEME.colors.border.default,
      shadow: STRUCTURED_THEME.shadows.sm,
      radius: STRUCTURED_THEME.radius.md,
      padding: STRUCTURED_THEME.spacing.lg,
    },
    button: {
      primary: {
        background: STRUCTURED_THEME.colors.brand.primary,
        color: 'oklch(0.98 0.002 245)',
        shadow: STRUCTURED_THEME.shadows.sm,
        radius: STRUCTURED_THEME.radius.sm,
        padding: `${STRUCTURED_THEME.spacing.sm} ${STRUCTURED_THEME.spacing.lg}`,
      },
      secondary: {
        background: STRUCTURED_THEME.colors.brand.secondary,
        color: 'oklch(0.98 0.002 190)',
        shadow: STRUCTURED_THEME.shadows.sm,
        radius: STRUCTURED_THEME.radius.sm,
        padding: `${STRUCTURED_THEME.spacing.sm} ${STRUCTURED_THEME.spacing.lg}`,
      },
    },
  },
  creative: {
    card: {
      background: CREATIVE_THEME.colors.background.elevated,
      border: CREATIVE_THEME.colors.border.default,
      shadow: CREATIVE_THEME.shadows.md,
      radius: CREATIVE_THEME.radius.lg,
      padding: CREATIVE_THEME.spacing.lg,
    },
    button: {
      primary: {
        background: `linear-gradient(135deg, ${CREATIVE_THEME.colors.brand.primary} 0%, ${CREATIVE_THEME.colors.brand.primaryDark} 100%)`,
        color: 'oklch(0.98 0.03 145)',
        shadow: CREATIVE_THEME.shadows.md,
        radius: CREATIVE_THEME.radius.lg,
        padding: `${CREATIVE_THEME.spacing.md} ${CREATIVE_THEME.spacing.xl}`,
      },
      secondary: {
        background: `linear-gradient(135deg, ${CREATIVE_THEME.colors.brand.secondary} 0%, oklch(0.60 0.24 35) 100%)`,
        color: 'oklch(0.98 0.02 35)',
        shadow: CREATIVE_THEME.shadows.md,
        radius: CREATIVE_THEME.radius.lg,
        padding: `${CREATIVE_THEME.spacing.md} ${CREATIVE_THEME.spacing.xl}`,
      },
    },
  },
} as const
