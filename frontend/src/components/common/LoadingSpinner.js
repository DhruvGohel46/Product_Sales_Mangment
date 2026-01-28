import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const { currentTheme } = useTheme();

  const sizeStyles = {
    sm: { width: '24px', height: '24px', borderWidth: '2px' },
    md: { width: '40px', height: '40px', borderWidth: '3px' },
    lg: { width: '56px', height: '56px', borderWidth: '4px' },
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: currentTheme.spacing[3]
    }}>
      <motion.div
        style={{
          ...sizeStyles[size],
          border: `${sizeStyles[size].borderWidth} solid ${currentTheme.colors.primary[200]}`,
          borderTop: `${sizeStyles[size].borderWidth} solid ${currentTheme.colors.primary[600]}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {text && (
        <span style={{ 
          fontSize: currentTheme.typography.fontSize.sm,
          color: currentTheme.colors.text.secondary 
        }}>
          {text}
        </span>
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

export default LoadingSpinner;
