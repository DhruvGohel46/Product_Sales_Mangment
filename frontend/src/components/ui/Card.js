import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';

const Card = React.forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'base',
  hover = false,
  className = '',
  onClick,
  fullHeight = false, // Added new prop
  style, // Allow external style overrides
  ...props
}, ref) => {
  const { currentTheme } = useTheme();
  const { cardVariants, cardTransition } = useAnimation();
  const isDark = currentTheme.isDark;

  const paddingStyles = {
    none: '0',
    sm: currentTheme.spacing[3],
    md: currentTheme.spacing[5],
    lg: currentTheme.spacing[6],
    xl: currentTheme.spacing[8],
  };

  const shadowStyles = {
    base: currentTheme.shadows.base,
    sm: currentTheme.shadows.sm,
    md: currentTheme.shadows.md,
    lg: currentTheme.shadows.lg,
    xl: currentTheme.shadows.xl,
    '2xl': currentTheme.shadows['2xl'],
    card: isDark ? currentTheme.shadows.cardDark : currentTheme.shadows.card,
    none: 'none',
  };

  const finalShadow = shadowStyles[shadow] || shadowStyles.base;

  const baseStyles = {
    background: currentTheme.glass?.card || currentTheme.colors.surface,
    backdropFilter: currentTheme.glass?.blur || 'blur(20px)',
    WebkitBackdropFilter: currentTheme.glass?.blur || 'blur(20px)',
    borderRadius: currentTheme.borderRadius.xl,
    border: `1px solid ${currentTheme.glass?.border || currentTheme.colors.border}`,
    boxShadow: finalShadow,
    padding: paddingStyles[padding],
    fontFamily: currentTheme.typography.fontFamily.primary,
    height: fullHeight ? '100%' : 'auto',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    ...style
  };

  const hoverStyles = hover ? {
    cursor: onClick ? 'pointer' : 'default',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: currentTheme.shadows.cardHover,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    }
  } : {};

  // Variant overrides (optional, but keeping for compatibility)
  const variantStyles = {
    elevated: {
      border: 'none',
    },
    outlined: {
      background: 'transparent',
      border: `2px solid ${currentTheme.colors.primary[200]}`,
    },
    // Add other variants if needed, or rely on baseStyles for "default"
  };

  const combinedStyles = {
    ...baseStyles,
    ...(variantStyles[variant] || {}),
    ...hoverStyles,
    transform: 'translateZ(0)', // Hardware acceleration
  };

  const MotionComponent = onClick || hover ? motion.div : 'div';
  const motionProps = onClick || hover ? {
    initial: cardVariants.initial,
    animate: cardVariants.animate,
    exit: cardVariants.exit,
    transition: cardTransition,
    whileHover: hover ? {
      y: -3,
      boxShadow: currentTheme.isDark ? currentTheme.shadows.cardDarkHover : currentTheme.shadows.cardHover,
    } : undefined,
    whileTap: onClick ? { scale: 0.98 } : undefined,
  } : {};

  return (
    <MotionComponent
      ref={ref}
      style={combinedStyles}
      className={className}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </MotionComponent>
  );
});

Card.displayName = 'Card';

export default Card;
