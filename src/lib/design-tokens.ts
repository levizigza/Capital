export const SPACING_SCALE = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const

export const TYPOGRAPHY = {
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
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const

export const COLORS = {
  creative: {
    primary: 'oklch(0.55 0.18 145)',
    primaryForeground: 'oklch(0.98 0.005 145)',
    secondary: 'oklch(0.60 0.14 230)',
    secondaryForeground: 'oklch(0.12 0.015 230)',
    accent: 'oklch(0.68 0.16 45)',
    accentForeground: 'oklch(0.12 0.015 45)',
    background: 'oklch(0.96 0.02 145)',
    foreground: 'oklch(0.12 0.015 145)',
    muted: 'oklch(0.92 0.015 145)',
    mutedForeground: 'oklch(0.45 0.008 145)',
  },
  structured: {
    primary: 'oklch(0.35 0.12 240)',
    primaryForeground: 'oklch(0.98 0.005 240)',
    secondary: 'oklch(0.45 0.15 155)',
    secondaryForeground: 'oklch(0.98 0.005 155)',
    accent: 'oklch(0.75 0.14 85)',
    accentForeground: 'oklch(0.12 0.015 85)',
    background: 'oklch(0.98 0.005 240)',
    foreground: 'oklch(0.12 0.015 240)',
    muted: 'oklch(0.96 0.005 240)',
    mutedForeground: 'oklch(0.45 0.008 240)',
  },
  semantic: {
    success: 'oklch(0.55 0.18 145)',
    successForeground: 'oklch(0.98 0.005 145)',
    warning: 'oklch(0.75 0.14 85)',
    warningForeground: 'oklch(0.12 0.015 85)',
    error: 'oklch(0.58 0.20 25)',
    errorForeground: 'oklch(0.98 0.005 25)',
    info: 'oklch(0.60 0.14 230)',
    infoForeground: 'oklch(0.98 0.005 230)',
  },
} as const

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const TOUCH_TARGETS = {
  minimum: '44px',
  comfortable: '48px',
  spacious: '56px',
} as const

export const ANIMATION = {
  durations: {
    fast: '100ms',
    quick: '150ms',
    normal: '200ms',
    moderate: '300ms',
    slow: '500ms',
  },
  easings: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const

export const CONTRAST_RATIOS = {
  normalText: 4.5,
  largeText: 3.0,
  uiComponents: 3.0,
  enhanced: 7.0,
} as const

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 9999,
} as const
