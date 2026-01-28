// Design system theme for POS application
// Modern neutral-first palette with restrained accent

// Neutral-first color system
export const neutral = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0A0A0A',
};

// Restrained accent color
export const accent = {
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
  950: '#082F49',
};

// Semantic colors (subtle, professional)
export const semantic = {
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
};

// Legacy color mapping for compatibility
export const colors = {
  // Primary colors (now using accent)
  primary: accent,
  
  // Success colors
  success: {
    50: semantic.success[50],
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: semantic.success[500],
    600: semantic.success[600],
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  // Warning colors
  warning: {
    50: semantic.warning[50],
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: semantic.warning[500],
    600: semantic.warning[600],
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Error colors
  error: {
    50: semantic.error[50],
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: semantic.error[500],
    600: semantic.error[600],
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Neutral grays (now using neutral palette)
  gray: neutral,
  
  // Semantic colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Category colors (subtle variants)
  category: {
    coldrink: accent[600],  // Sky blue
    paan: semantic.success[600],      // Green
    other: semantic.warning[600],     // Amber
  }
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
    base: '0.9375rem', // 15px - slightly smaller for better density
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
  full: '9999px',
};

// Shadows - subtle elevation for modern look
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  lg: '0 8px 12px -2px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
  xl: '0 12px 20px -4px rgba(0, 0, 0, 0.1), 0 6px 12px -2px rgba(0, 0, 0, 0.05)',
  '2xl': '0 20px 32px -8px rgba(0, 0, 0, 0.12), 0 10px 20px -4px rgba(0, 0, 0, 0.06)',
  inner: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  
  // Colored shadows for accent elements
  accent: {
    sm: '0 1px 2px 0 rgba(14, 165, 233, 0.1)',
    md: '0 4px 6px -1px rgba(14, 165, 233, 0.15), 0 2px 4px -1px rgba(14, 165, 233, 0.1)',
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

// Theme configurations
export const lightTheme = {
  colors: {
    ...colors,
    background: neutral[50],
    surface: neutral[100],
    card: neutral[0],
    text: {
      primary: neutral[900],
      secondary: neutral[600],
      muted: neutral[500],
    },
    border: neutral[200],
    focus: accent[500],
  },
  typography,
  spacing,
  borderRadius,
  shadows,
};

export const darkTheme = {
  colors: {
    ...colors,
    background: neutral[950],
    surface: neutral[900],
    card: neutral[900],
    text: {
      primary: neutral[100],
      secondary: neutral[400],
      muted: neutral[500],
    },
    border: neutral[800],
    focus: accent[400],
  },
  typography,
  spacing,
  borderRadius,
  shadows,
};

// Default theme
export const theme = lightTheme;
