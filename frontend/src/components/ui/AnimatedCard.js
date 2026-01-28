import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';

const AnimatedCard = React.forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  className = '',
  onClick,
  delay = 0,
  ...props
}, ref) => {
  const { currentTheme } = useTheme();
  const { cardVariants, cardTransition } = useAnimation();

  const baseStyles = {
    backgroundColor: currentTheme.colors.card,
    borderRadius: currentTheme.borderRadius.lg,
    fontFamily: currentTheme.typography.fontFamily.primary,
    position: 'relative',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
  };

  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: currentTheme.spacing[4] },
    md: { padding: currentTheme.spacing[6] },
    lg: { padding: currentTheme.spacing[8] },
    xl: { padding: currentTheme.spacing[10] },
  };

  const variantStyles = {
    default: {
      border: `1px solid ${currentTheme.colors.border}`,
    },
    elevated: {
      border: 'none',
      boxShadow: currentTheme.shadows[shadow],
    },
    outlined: {
      border: `2px solid ${currentTheme.colors.primary[200]}`,
      backgroundColor: currentTheme.colors.primary[50],
    },
    success: {
      border: `1px solid ${currentTheme.colors.success[200]}`,
      backgroundColor: currentTheme.colors.success[50],
    },
    warning: {
      border: `1px solid ${currentTheme.colors.warning[200]}`,
      backgroundColor: currentTheme.colors.warning[50],
    },
    error: {
      border: `1px solid ${currentTheme.colors.error[200]}`,
      backgroundColor: currentTheme.colors.error[50],
    },
  };

  const hoverStyles = hover ? {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: currentTheme.shadows.xl,
    },
  } : {};

  const styles = {
    ...baseStyles,
    ...paddingStyles[padding],
    ...variantStyles[variant],
    ...hoverStyles,
  };

  return (
    <motion.div
      ref={ref}
      style={styles}
      className={className}
      onClick={onClick}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ ...cardTransition, delay }}
      variants={cardVariants}
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      {...props}
    >
      {/* Subtle gradient overlay for depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${currentTheme.colors.primary[200]}, transparent)`,
          opacity: 0.5,
        }}
      />
      
      {children}
    </motion.div>
  );
});

AnimatedCard.displayName = 'AnimatedCard';

export default AnimatedCard;
