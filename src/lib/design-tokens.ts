export const SPACING_SCALE = {
  '0': '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
} as const

export const GOLDEN_RATIO = 1.618
export const MAJOR_THIRD = 1.25

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
    primaryLight: 'oklch(0.70 0.15 145)',
    primaryDark: 'oklch(0.40 0.20 145)',
    secondary: 'oklch(0.60 0.14 230)',
    secondaryForeground: 'oklch(0.12 0.015 230)',
    secondaryLight: 'oklch(0.75 0.12 230)',
    secondaryDark: 'oklch(0.45 0.16 230)',
    accent: 'oklch(0.68 0.16 45)',
    accentForeground: 'oklch(0.12 0.015 45)',
    accentLight: 'oklch(0.78 0.14 45)',
    accentDark: 'oklch(0.58 0.18 45)',
    background: 'oklch(0.98 0.01 145)',
    backgroundSubtle: 'oklch(0.96 0.02 145)',
    foreground: 'oklch(0.15 0.015 145)',
    foregroundMuted: 'oklch(0.35 0.012 145)',
    border: 'oklch(0.88 0.03 145)',
    borderLight: 'oklch(0.92 0.02 145)',
  },
  structured: {
    primary: 'oklch(0.45 0.15 250)',
    primaryForeground: 'oklch(0.98 0.005 250)',
    primaryLight: 'oklch(0.60 0.12 250)',
    primaryDark: 'oklch(0.30 0.18 250)',
    secondary: 'oklch(0.52 0.16 190)',
    secondaryForeground: 'oklch(0.98 0.005 190)',
    secondaryLight: 'oklch(0.67 0.13 190)',
    secondaryDark: 'oklch(0.37 0.19 190)',
    accent: 'oklch(0.70 0.15 75)',
    accentForeground: 'oklch(0.15 0.015 75)',
    accentLight: 'oklch(0.80 0.12 75)',
    accentDark: 'oklch(0.60 0.18 75)',
    background: 'oklch(0.99 0.002 250)',
    backgroundSubtle: 'oklch(0.97 0.004 250)',
    foreground: 'oklch(0.18 0.012 250)',
    foregroundMuted: 'oklch(0.42 0.008 250)',
    border: 'oklch(0.90 0.01 250)',
    borderLight: 'oklch(0.94 0.008 250)',
  },
  semantic: {
    success: 'oklch(0.58 0.18 145)',
    successForeground: 'oklch(0.98 0.005 145)',
    successLight: 'oklch(0.73 0.15 145)',
    successDark: 'oklch(0.43 0.21 145)',
    warning: 'oklch(0.72 0.16 80)',
    warningForeground: 'oklch(0.15 0.015 80)',
    warningLight: 'oklch(0.82 0.13 80)',
    warningDark: 'oklch(0.62 0.19 80)',
    error: 'oklch(0.58 0.22 25)',
    errorForeground: 'oklch(0.98 0.005 25)',
    errorLight: 'oklch(0.73 0.18 25)',
    errorDark: 'oklch(0.43 0.26 25)',
    info: 'oklch(0.62 0.15 240)',
    infoForeground: 'oklch(0.98 0.005 240)',
    infoLight: 'oklch(0.77 0.12 240)',
    infoDark: 'oklch(0.47 0.18 240)',
  },
  neutral: {
    50: 'oklch(0.98 0.002 250)',
    100: 'oklch(0.95 0.003 250)',
    200: 'oklch(0.90 0.004 250)',
    300: 'oklch(0.82 0.005 250)',
    400: 'oklch(0.68 0.006 250)',
    500: 'oklch(0.52 0.007 250)',
    600: 'oklch(0.42 0.008 250)',
    700: 'oklch(0.32 0.009 250)',
    800: 'oklch(0.22 0.010 250)',
    900: 'oklch(0.15 0.011 250)',
    950: 'oklch(0.10 0.012 250)',
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

export const SHADOWS = {
  xs: '0 1px 2px 0 oklch(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)',
  md: '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px oklch(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 oklch(0 0 0 / 0.05)',
} as const

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const

export const GRID = {
  columns: 12,
  gap: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
  },
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

export const FOCAL_POINTS = {
  left: '40%',
  center: '50%',
  right: '60%',
  golden: '61.8%',
} as const
