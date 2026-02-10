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
  50: '#FFF7ED',  // Orange 50
  100: '#FFEDD5', // Orange 100
  200: '#FED7AA', // Orange 200
  300: '#FDBA74', // Orange 300
  400: '#FB923C', // Orange 400
  500: '#F97316', // Orange 500 (Base)
  600: '#EA580C', // Orange 600
  700: '#C2410C', // Orange 700
  800: '#9A3412', // Orange 800
  900: '#7C2D12', // Orange 900
  950: '#431407', // Orange 950
};

// Neutral color system - Warm Browns/Grays
export const neutral = {
  0: '#FFFFFF',     // Pure White
  50: '#FAFAF9',    // Warm Gray 50
  100: '#F5F5F4',   // Warm Gray 100
  200: '#E7E5E4',   // Warm Gray 200
  300: '#D6D3D1',   // Warm Gray 300
  400: '#A8A29E',   // Warm Gray 400
  500: '#78716C',   // Warm Gray 500
  600: '#57534E',   // Warm Gray 600
  700: '#44403C',   // Warm Gray 700
  800: '#292524',   // Warm Gray 800
  900: '#1C1917',   // Warm Gray 900
  950: '#0C0A09',   // Warm Gray 950
};

// Semantic colors - consistent across all screens
export const semantic = {
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
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
  card: '0 8px 32px rgba(0, 0, 0, 0.12)',
  cardHover: '0 8px 32px rgba(0, 0, 0, 0.08)',

  // Dark theme card shadows
  cardDark: '0 8px 32px rgba(255, 255, 255, 0.1)',
  cardDarkHover: '0 8px 32px rgba(255, 255, 255, 0.05)',

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
    background: neutral[0],   // Pure White
    surface: neutral[0],      // White surface for cards
    card: neutral[0],
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      muted: colors.text.tertiary,
    },
    border: colors.border.primary,
    focus: colors.primary[500],
  },
  typography,
  spacing,
  borderRadius,
  shadows,
};

// Dark theme configuration
export const darkTheme = {
  colors: {
    ...colors,
    background: '#121212', // Strict Monochromatic Background
    surface: '#1E1E1E',    // Slightly lighter gray for cards (Standard Dark Mode Pattern)
    card: '#1E1E1E',       // Matching surface
    text: {
      primary: '#E0E0E0',  // High contrast gray
      secondary: '#B0B0B0', // Medium gray
      muted: '#888888',    // Muted gray
      inverse: '#121212',
    },
    border: {
      primary: '#444444',   // Strict gray border
      secondary: '#333333', // Darker gray
      tertiary: '#2C2C2C',  // Subtle gray
    },
    focus: colors.primary[500],
  },
  typography,
  spacing,
  borderRadius,
  shadows: {
    ...shadows,
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    cardDark: '0 8px 32px rgba(0, 0, 0, 0.5)',
    cardDarkHover: '0 8px 32px rgba(0, 0, 0, 0.4)',
    // Removed colored glow to ensure strict monochromatic feel aside from accents
    glow: {
      primary: '0 0 15px rgba(249, 115, 22, 0.15)', // Keep PRIMARY accent glow only
      success: '0 0 15px rgba(34, 197, 94, 0.15)',
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
