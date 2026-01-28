import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const EnhancedLoadingSpinner = ({ 
  size = 'md', 
  text = '', 
  variant = 'default',
  showPulse = true 
}) => {
  const { currentTheme } = useTheme();

  const sizeStyles = {
    sm: { width: '24px', height: '24px', borderWidth: '2px' },
    md: { width: '40px', height: '40px', borderWidth: '3px' },
    lg: { width: '56px', height: '56px', borderWidth: '4px' },
    xl: { width: '72px', height: '72px', borderWidth: '5px' },
  };

  const variantStyles = {
    default: {
      border: `${sizeStyles[size].borderWidth} solid ${currentTheme.colors.primary[200]}`,
      borderTop: `${sizeStyles[size].borderWidth} solid ${currentTheme.colors.primary[600]}`,
    },
    success: {
      border: `${sizeStyles[size].borderWidth} solid ${currentTheme.colors.success[200]}`,
      borderTop: `${sizeStyles[size].borderWidth} solid ${currentTheme.colors.success[600]}`,
    },
    error: {
      border: `${sizeStyles[size].borderWidth} solid ${currentTheme.colors.error[200]}`,
      borderTop: `${sizeStyles[size].borderWidth} solid ${currentTheme.colors.error[600]}`,
    },
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: currentTheme.spacing[3],
    }}>
      {/* Main spinner */}
      <div style={{ position: 'relative' }}>
        <motion.div
          style={{
            ...sizeStyles[size],
            ...variantStyles[variant],
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        
        {/* Inner glow effect */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            height: '50%',
            backgroundColor: currentTheme.colors.primary[400],
            borderRadius: '50%',
            filter: 'blur(4px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Optional text with fade-in animation */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span style={{ 
            fontSize: currentTheme.typography.fontSize.sm,
            color: currentTheme.colors.text.secondary,
            fontWeight: currentTheme.typography.fontWeight.medium,
          }}>
            {text}
          </span>
        </motion.div>
      )}

      {/* Pulse indicator */}
      {showPulse && (
        <motion.div
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: currentTheme.colors.success[500],
            borderRadius: '50%',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EnhancedLoadingSpinner;
