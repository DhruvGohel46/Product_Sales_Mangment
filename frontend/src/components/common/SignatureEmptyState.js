import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const SignatureEmptyState = ({ 
  icon = '🍽️', 
  title = 'No Items Selected', 
  subtitle = 'Please select items from the menu',
  actionButton = null,
  animated = true 
}) => {
  const { currentTheme } = useTheme();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: currentTheme.spacing[8],
    textAlign: 'center',
    minHeight: '300px',
  };

  const iconStyle = {
    fontSize: '4rem',
    marginBottom: currentTheme.spacing[4],
    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
  };

  const titleStyle = {
    fontSize: currentTheme.typography.fontSize.xl,
    fontWeight: currentTheme.typography.fontWeight.semibold,
    color: currentTheme.colors.text.primary,
    marginBottom: currentTheme.spacing[2],
    margin: 0,
  };

  const subtitleStyle = {
    fontSize: currentTheme.typography.fontSize.base,
    color: currentTheme.colors.text.secondary,
    marginBottom: currentTheme.spacing[6],
    maxWidth: '300px',
    lineHeight: 1.5,
  };

  return (
    <motion.div
      style={containerStyle}
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Animated icon */}
      <motion.div
        style={iconStyle}
        animate={animated ? {
          y: [0, -10, 0],
          rotate: [0, -5, 0, 5, 0],
        } : undefined}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        style={titleStyle}
        initial={animated ? { opacity: 0, y: 20 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {title}
      </motion.h3>

      {/* Subtitle */}
      <motion.p
        style={subtitleStyle}
        initial={animated ? { opacity: 0, y: 20 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {subtitle}
      </motion.p>

      {/* Optional action button */}
      {actionButton && (
        <motion.div
          initial={animated ? { opacity: 0, scale: 0.9 } : undefined}
          animate={animated ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {actionButton}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SignatureEmptyState;
