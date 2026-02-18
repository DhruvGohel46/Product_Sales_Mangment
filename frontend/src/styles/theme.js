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

// Primary brand color - Modern Vibrant Orange
// Primary brand color - ReBill Signature Orange
export const primary = {
  50: '#FFF1E9',
  100: '#FFDBC2',
  200: '#FFBFA0',
  300: '#FF9E75',
  400: '#FF8A3D',
  500: '#FF6A00', // ReBill Signature Primary
  600: '#FF7A1A', // ReBill Hover
  700: '#E85C00', // ReBill Pressed
  800: '#C44112',
  900: '#752307',
  950: '#401002',
};

// Neutral color system - Professional Slate Scale (Blue-tinted grays)
export const neutral = {
  0: '#ffffff',     // Pure White
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
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

// Strict Spacing Scale
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px', // Standard ReBill Card
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
};

// Shadows - Human Quality Depth
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.04)',
  base: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 12px 20px -4px rgba(0, 0, 0, 0.1), 0 6px 12px -2px rgba(0, 0, 0, 0.05)',
  '2xl': '0 20px 32px -8px rgba(0, 0, 0, 0.12), 0 10px 20px -4px rgba(0, 0, 0, 0.06)',

  // ReBill Signature Card Shadows
  card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)',
  cardHover: '0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,106,0,0.20)', // Lift + Glow

  // Dark Theme Shadows
  cardDark: '0 1px 0 rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.35)',
  cardDarkHover: '0 12px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,106,0,0.25)', // Lift + Glow

  inner: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.03)',

  // Colored shadows for accent elements
  primary: {
    sm: '0 1px 2px 0 rgba(255, 106, 0, 0.1)',
    md: '0 6px 18px rgba(255,106,0,0.35)',
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
    primary: '0 0 0 2px rgba(255, 106, 0, 0.35)',
    success: '0 0 0 2px rgba(34, 197, 94, 0.35)',
    error: '0 0 0 2px rgba(239, 68, 68, 0.35)',
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

// Glassmorphism tokens
const glass = {
  light: {
    sidebar: 'rgba(255, 255, 255, 0.7)',
    card: 'rgba(255, 255, 255, 0.75)',
    modal: 'rgba(255, 255, 255, 0.85)',
    input: 'rgba(255, 255, 255, 0.9)',
    dropdown: 'rgba(255, 255, 255, 0.95)',
    header: 'rgba(255, 255, 255, 0.7)',
    border: '#E3E6EA',
    blur: 'blur(20px)',
  },
  dark: {
    sidebar: 'rgba(21, 22, 26, 0.7)',
    card: 'rgba(27, 29, 34, 0.75)',
    modal: 'rgba(27, 29, 34, 0.9)',
    input: 'rgba(35, 38, 45, 0.9)',
    dropdown: 'rgba(35, 38, 45, 0.95)',
    header: 'rgba(21, 22, 26, 0.7)',
    border: '#2C2F36',
    blur: 'blur(20px)',
  }
};

// Light theme configuration - ReBill Light
export const lightTheme = {
  colors: {
    ...colors,
    background: '#F4F6F8', // ReBill Light Background
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: {
      primary: neutral[900],
      secondary: neutral[600],
      muted: neutral[400],
      inverse: neutral[0],
    },
    border: '#E3E6EA',
    focus: colors.primary[500],
  },
  glass: glass.light,
  typography,
  spacing,
  borderRadius,
  shadows: {
    ...shadows,
    card: shadows.card,
    cardHover: shadows.cardHover,
  },
  gradients: {
    background: '#F4F6F8',
    glow: 'none',
    primary: 'linear-gradient(135deg, #FF6A00, #FF8A3D)',
  }
};

// Dark theme configuration - ReBill Dark
export const darkTheme = {
  colors: {
    ...colors,
    background: '#0E0E11', // ReBill Dark Background
    surface: '#15161A', // Secondary Surface
    card: '#1B1D22', // Card Surface
    text: {
      primary: '#e5e5e5',
      secondary: '#a3a3a3',
      muted: '#737373',
      inverse: '#121212',
    },
    border: '#2C2F36',
    focus: colors.primary[500],
    sidebar: '#15161A',
    modal: '#1F1F1F',
  },
  glass: glass.dark,
  typography,
  spacing,
  borderRadius,
  shadows: {
    ...shadows,
    card: shadows.cardDark,
    cardHover: shadows.cardDarkHover,
    glow: {
      primary: '0 0 20px rgba(255, 106, 0, 0.15)',
      success: '0 0 20px rgba(34, 197, 94, 0.15)',
    }
  },
  gradients: {
    background: '#0E0E11',
    glow: 'radial-gradient(circle at 15% 20%, rgba(255,106,0,0.06), transparent 40%), radial-gradient(circle at 85% 80%, rgba(255,106,0,0.04), transparent 40%)',
    primary: 'linear-gradient(135deg, #FF6A00, #FF8A3D)',
  }
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
