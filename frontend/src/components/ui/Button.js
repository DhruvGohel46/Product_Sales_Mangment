import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  className = '',
  style: styleProp,
  ...props
}, ref) => {
  const { currentTheme } = useTheme();
  const { buttonTap } = useAnimation();

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: currentTheme.typography.fontWeight.medium,
    borderRadius: currentTheme.borderRadius.lg,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.typography.fontFamily.primary,
    letterSpacing: currentTheme.typography.letterSpacing.tight,
    whiteSpace: 'nowrap',
  };

  const sizeStyles = {
    sm: {
      padding: '0.5rem 0.875rem',
      fontSize: currentTheme.typography.fontSize.sm,
      minHeight: '2rem',
    },
    md: {
      padding: '0.625rem 1.25rem',
      fontSize: currentTheme.typography.fontSize.base,
      minHeight: '2.5rem',
    },
    lg: {
      padding: '0.75rem 1.75rem',
      fontSize: currentTheme.typography.fontSize.lg,
      minHeight: '3rem',
    },
    xl: {
      padding: '1rem 2.25rem',
      fontSize: currentTheme.typography.fontSize.xl,
      minHeight: '3.5rem',
    }
  };

  const variantStyles = {
    primary: {
      backgroundColor: currentTheme.colors.primary[600],
      color: currentTheme.colors.white,
      boxShadow: currentTheme.shadows.sm,
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: currentTheme.colors.primary[700],
        boxShadow: `0 4px 12px ${currentTheme.colors.primary[500]}40`, // Colored shadow
        transform: 'translateY(-1px)',
      },
      '&:active': {
        backgroundColor: currentTheme.colors.primary[800],
        boxShadow: 'none',
        transform: 'translateY(0)',
      },
    },
    secondary: {
      backgroundColor: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : currentTheme.colors.surface,
      color: currentTheme.colors.text.primary,
      border: `1px solid ${currentTheme.colors.border.primary}`,
      backdropFilter: 'blur(8px)',
      boxShadow: currentTheme.shadows.sm,
      '&:hover': {
        backgroundColor: currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : currentTheme.colors.neutral[50],
        borderColor: currentTheme.colors.primary[500],
        boxShadow: currentTheme.shadows.md,
        transform: 'translateY(-1px)',
      },
      '&:active': {
        backgroundColor: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : currentTheme.colors.neutral[100],
        borderColor: currentTheme.colors.primary[600],
        transform: 'translateY(0)',
      },
    },
    success: {
      backgroundColor: currentTheme.colors.success[600],
      color: currentTheme.colors.white,
      boxShadow: currentTheme.shadows.sm,
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: currentTheme.colors.success[700],
        boxShadow: `0 4px 12px ${currentTheme.colors.success[500]}40`,
        transform: 'translateY(-1px)',
      },
      '&:active': {
        backgroundColor: currentTheme.colors.success[800],
        transform: 'translateY(0)',
      },
    },
    warning: {
      backgroundColor: currentTheme.colors.warning[500], // Brighter for warning
      color: '#1a1a1a', // Dark text for better contrast on yellow/orange
      boxShadow: currentTheme.shadows.sm,
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: currentTheme.colors.warning[400],
        boxShadow: `0 4px 12px ${currentTheme.colors.warning[500]}40`,
        transform: 'translateY(-1px)',
      },
      '&:active': {
        backgroundColor: currentTheme.colors.warning[600],
        transform: 'translateY(0)',
      },
    },
    error: {
      backgroundColor: currentTheme.colors.error[600],
      color: currentTheme.colors.white,
      boxShadow: currentTheme.shadows.sm,
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: currentTheme.colors.error[700],
        boxShadow: `0 4px 12px ${currentTheme.colors.error[500]}40`,
        transform: 'translateY(-1px)',
      },
      '&:active': {
        backgroundColor: currentTheme.colors.error[800],
        transform: 'translateY(0)',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: currentTheme.colors.text.secondary,
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : currentTheme.colors.neutral[100],
        color: currentTheme.colors.primary[500],
        transform: 'translateY(-1px)',
      },
      '&:active': {
        backgroundColor: currentTheme.isDark ? 'rgba(255, 255, 255, 0.1)' : currentTheme.colors.neutral[200],
        transform: 'translateY(0)',
      },
    },
  };

  const disabledStyles = {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none !important',
  };

  const loadingStyles = {
    opacity: 0.8,
    cursor: 'wait',
  };

  const widthStyles = fullWidth ? { width: '100%' } : {};

  const styles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(disabled && disabledStyles),
    ...(loading && loadingStyles),
    ...widthStyles,
  };

  const mergedStyles = {
    ...styles,
    ...(styleProp || {}),
  };

  const renderIcon = () => {
    if (!icon) return null;

    const iconStyles = {
      display: 'flex',
      alignItems: 'center',
      fontSize: '1em',
      flexShrink: 0,
    };

    return <span style={iconStyles}>{icon}</span>;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <motion.div
            style={{
              width: '1em',
              height: '1em',
              border: '2px solid currentColor',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
          {children}
        </>
      );
    }

    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        {children}
        {iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  return (
    <motion.button
      ref={ref}
      style={mergedStyles}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={!disabled && !loading ? buttonTap.tap : undefined}
      whileHover={!disabled && !loading ? buttonTap.hover : undefined}
      {...props}
    >
      {renderContent()}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
