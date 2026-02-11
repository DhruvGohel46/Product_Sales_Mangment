/**
 * =============================================================================
 * THEME SYSTEM - THEME.JSX
 * =============================================================================
 * 
 * ROLE: Centralized design system and theme management for the application
 * 
 * RESPONSIBILITIES:
 * - Define color palettes for light and dark themes
 * - Typography system with consistent font scales
 * - Spacing system for consistent layouts
 * - Shadow definitions for depth and hierarchy
 * - Breakpoint system for responsive design
 * - Component-specific styling tokens
 * 
 * KEY FEATURES:
 * - Dual theme support (light/dark modes)
 * - Comprehensive color system with semantic naming
 * - Typography scale with proper hierarchy
 * - Consistent spacing system (rem-based)
 * - Professional shadow system for depth
 * - Responsive breakpoint definitions
 * - CSS custom properties generation
 * 
 * COLOR SYSTEM:
 * - Semantic colors: primary, secondary, success, error, warning, info
 * - Neutral colors: gray scale for text and backgrounds
 * - Surface colors: cards, modals, overlays
 * - Interactive states: hover, focus, disabled
 * 
 * TYPOGRAPHY:
 * - Font sizes: xs to 9xl scale
 * - Font weights: light to bold
 * - Line heights for readability
 * - Letter spacing for emphasis
 * 
 * SPACING SYSTEM:
 * - Consistent rem-based spacing (0.25rem to 6rem)
 * - Semantic naming (xs, sm, md, lg, xl, etc.)
 * - Layout utilities and gaps
 * 
 * SHADOWS:
 * - Subtle to dramatic shadow scale
 * - Theme-aware shadows (dark/light)
 * - Component-specific shadows
 * - Colored shadows for accents
 * 
 * BREAKPOINTS:
 * - Mobile-first responsive design
 * - Standard breakpoint definitions
 * - Container max-widths
 * 
 * DESIGN PATTERNS:
 * - CSS custom properties for dynamic theming
 * - Systematic design tokens
 * - Consistent naming conventions
 * - Developer-friendly API
 * 
 * USAGE:
 * - Import theme object in components
 * - Use theme.colors, theme.spacing, etc.
 * - Automatic theme switching support
 * =============================================================================
 */

// Unified Design System Theme for POS Application
// Professional enterprise color system with consistent usage across all screens

// Primary brand color - Burger Bhau Burnt Orange
export const primary = {
  50: '#fff7ed',  // Orange 50
  100: '#ffedd5', // Orange 100
  200: '#fed7aa', // Orange 200
  300: '#fdba74', // Orange 300
  400: '#fb923c', // Orange 400
  500: '#f97316', // Orange 500 (Base)
  600: '#ea580c', // Orange 600
  700: '#c2410c', // Orange 700
  800: '#9a3412', // Orange 800
  900: '#7c2d12', // Orange 900
  950: '#431407', // Orange 950
};

// Neutral color system - Professional Slate Scale (Blue-tinted grays)
export const neutral = {
  0: '#ffffff',     // Pure White
  50: '#f8fafc',    // Slate 50
  100: '#f1f5f9',   // Slate 100
  200: '#e2e8f0',   // Slate 200
  300: '#cbd5e1',   // Slate 300
  400: '#94a3b8',   // Slate 400
  500: '#64748b',   // Slate 500
  600: '#475569',   // Slate 600
  700: '#334155',   // Slate 700
  800: '#1e293b',   // Slate 800
  900: '#0f172a',   // Slate 900
  950: '#020617',   // Slate 950
};

// Semantic colors - consistent across all screens
export const semantic = {
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  }
};

// Category colors - consistent with semantic colors
export const category = {
  COLD: primary[600],      // cold drinks
  PAAN: semantic.success[600],  // Green for paan
  OTHER: semantic.warning[600], // Amber for other
};

// Unified color system
export const colors = {
  // Primary brand color
  primary: primary,

  // Semantic colors
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  info: semantic.info,

  // Neutral colors
  neutral: neutral,
  gray: neutral, // Legacy support

  // Background colors
  background: {
    primary: neutral[50],
    secondary: neutral[100],
    tertiary: neutral[200],
  },

  // Text colors
  text: {
    primary: neutral[900],
    secondary: neutral[600],
    tertiary: neutral[500],
    quaternary: neutral[400],
    inverse: neutral[0],
  },

  // Border colors
  border: {
    primary: neutral[200],
    secondary: neutral[300],
    tertiary: neutral[400],
  },

  // Surface colors
  surface: {
    primary: neutral[0],
    secondary: neutral[50],
    tertiary: neutral[100],
  },

  // Category colors
  category: category,

  // Legacy colors for compatibility
  white: '#FFFFFF',
  black: '#000000',
};

// Typography system
export const typography = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '0.9375rem', // 15px
    lg: '1rem',       // 16px
    xl: '1.125rem',   // 18px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    '4xl': '1.875rem', // 30px
    '5xl': '2.25rem', // 36px
    '6xl': '3rem',    // 48px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.6,
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  }
};

// Spacing system
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Shadows - subtle and professional
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 12px 20px -4px rgba(0, 0, 0, 0.1), 0 6px 12px -2px rgba(0, 0, 0, 0.05)',
  '2xl': '0 20px 32px -8px rgba(0, 0, 0, 0.12), 0 10px 20px -4px rgba(0, 0, 0, 0.06)',

  // Strong shadows for cards (matching Management.css)
  card: '0 8px 32px rgba(0, 0, 0, 0.08)',
  cardHover: '0 12px 40px rgba(0, 0, 0, 0.12)',

  // Dark theme card shadows
  cardDark: '0 8px 32px rgba(0, 0, 0, 0.3)',
  cardDarkHover: '0 12px 40px rgba(0, 0, 0, 0.4)',

  inner: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.03)',

  // Colored shadows for accent elements
  primary: {
    sm: '0 1px 2px 0 rgba(14, 165, 233, 0.1)',
    md: '0 4px 6px -1px rgba(14, 165, 233, 0.15), 0 2px 4px -1px rgba(14, 165, 233, 0.1)',
  },

  success: {
    sm: '0 1px 2px 0 rgba(34, 197, 94, 0.1)',
    md: '0 4px 6px -1px rgba(34, 197, 94, 0.15), 0 2px 4px -1px rgba(34, 197, 94, 0.1)',
  },

  warning: {
    sm: '0 1px 2px 0 rgba(245, 158, 11, 0.1)',
    md: '0 4px 6px -1px rgba(245, 158, 11, 0.15), 0 2px 4px -1px rgba(245, 158, 11, 0.1)',
  },

  error: {
    sm: '0 1px 2px 0 rgba(239, 68, 68, 0.1)',
    md: '0 4px 6px -1px rgba(239, 68, 68, 0.15), 0 2px 4px -1px rgba(239, 68, 68, 0.1)',
  },

  // Glow effects for interactive states
  glow: {
    primary: '0 0 0 1px rgba(14, 165, 233, 0.1), 0 0 8px rgba(14, 165, 233, 0.1)',
    success: '0 0 0 1px rgba(34, 197, 94, 0.1), 0 0 8px rgba(34, 197, 94, 0.1)',
    error: '0 0 0 1px rgba(239, 68, 68, 0.1), 0 0 8px rgba(239, 68, 68, 0.1)',
  }
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Light theme configuration
export const lightTheme = {
  colors: {
    ...colors,
    background: '#ffffff',   // Pure White
    surface: '#ffffff',      // White surface for cards
    card: '#ffffff',
    text: {
      primary: neutral[900],   // Slate 900
      secondary: neutral[500], // Slate 500
      muted: neutral[400],     // Slate 400
    },
    border: neutral[200],      // Slate 200
    focus: colors.primary[500],
  },
  typography,
  spacing,
  borderRadius,
  shadows,
};

// Dark theme configuration - Professional Neutral Gray (Low Contrast)
export const darkTheme = {
  colors: {
    ...colors,
    background: '#121212', // Level 0: Main app background (Deepest)
    surface: '#1e1e1e',    // Level 1: Standard panels/cards (Dark Gray)
    card: '#252525',       // Level 2: Cards/Content areas (Lighter Gray)
    text: {
      primary: '#e5e5e5',  // Neutral Gray 200 (Software standard)
      secondary: '#a3a3a3', // Neutral Gray 400
      muted: '#737373',    // Neutral Gray 500
      inverse: '#121212',
    },
    border: '#404040',   // Neutral 700
    focus: colors.primary[500],
    // Distinct shades for specific components
    sidebar: '#18181b',    // Zinc 900 - Distinct but subtle
    modal: '#2d2d2d',      // Highest elevation
  },
  typography,
  spacing,
  borderRadius,
  shadows: {
    ...shadows,
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    cardDark: '0 8px 32px rgba(0, 0, 0, 0.4)',
    cardDarkHover: '0 12px 40px rgba(0, 0, 0, 0.5)',
    // Professional subtle glow
    glow: {
      primary: '0 0 20px rgba(249, 115, 22, 0.15)',
      success: '0 0 20px rgba(34, 197, 94, 0.15)',
    }
  },
};

// Default theme
export const theme = lightTheme;

// Export theme utilities
export const getThemeColor = (colorName, shade = 500, theme = 'light') => {
  const themeObj = theme === 'dark' ? darkTheme : lightTheme;
  return themeObj.colors[colorName]?.[shade] || colorName;
};

export const getCategoryColor = (category) => {
  return category[category.toUpperCase()] || category.OTHER;
};
