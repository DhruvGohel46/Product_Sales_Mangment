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
  ...props
}, ref) => {
  const { currentTheme } = useTheme();
  const { cardVariants, cardTransition } = useAnimation();

  const baseStyles = {
    backgroundColor: currentTheme.colors.card,
    borderRadius: currentTheme.borderRadius.xl,
    fontFamily: currentTheme.typography.fontFamily.primary,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: currentTheme.spacing[3] },
    md: { padding: currentTheme.spacing[5] },
    lg: { padding: currentTheme.spacing[6] },
    xl: { padding: currentTheme.spacing[8] },
  };

  const variantStyles = {
    default: {
      border: `1px solid ${currentTheme.colors.border}`,
      boxShadow: currentTheme.shadows.sm,
    },
    elevated: {
      border: 'none',
      boxShadow: currentTheme.shadows[shadow],
    },
    outlined: {
      border: `2px solid ${currentTheme.colors.primary[200]}`,
      backgroundColor: currentTheme.colors.primary[50],
      boxShadow: currentTheme.shadows.none,
    },
    success: {
      border: `1px solid ${currentTheme.colors.success[200]}`,
      backgroundColor: currentTheme.colors.success[50],
      boxShadow: currentTheme.shadows.sm,
    },
    warning: {
      border: `1px solid ${currentTheme.colors.warning[200]}`,
      backgroundColor: currentTheme.colors.warning[50],
      boxShadow: currentTheme.shadows.sm,
    },
    error: {
      border: `1px solid ${currentTheme.colors.error[200]}`,
      backgroundColor: currentTheme.colors.error[50],
      boxShadow: currentTheme.shadows.sm,
    },
    glass: {
      border: `1px solid ${currentTheme.colors.border}`,
      backgroundColor: `${currentTheme.colors.card}CC`,
      backdropFilter: 'blur(8px)',
      boxShadow: currentTheme.shadows.md,
    },
  };

  const hoverStyles = hover ? {
    cursor: onClick ? 'pointer' : 'default',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadow === 'none' ? currentTheme.shadows.md : currentTheme.shadows.lg,
    },
    '&:active': {
      transform: 'translateY(-1px)',
    },
  } : {};

  const styles = {
    ...baseStyles,
    ...paddingStyles[padding],
    ...variantStyles[variant],
    ...hoverStyles,
  };

  const MotionComponent = onClick || hover ? motion.div : 'div';
  const motionProps = onClick || hover ? {
    initial: cardVariants.initial,
    animate: cardVariants.animate,
    exit: cardVariants.exit,
    transition: cardTransition,
    whileHover: hover ? { 
      y: -2,
      boxShadow: shadow === 'none' ? currentTheme.shadows.md : currentTheme.shadows.lg,
    } : undefined,
    whileTap: onClick ? { scale: 0.98 } : undefined,
  } : {};

  return (
    <MotionComponent
      ref={ref}
      style={styles}
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
