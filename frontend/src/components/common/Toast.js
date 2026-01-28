import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';
import { NOTIFICATION_TYPES } from '../../utils/constants';

const Toast = ({ 
  type = NOTIFICATION_TYPES.INFO, 
  message, 
  isVisible, 
  onClose,
  duration = 4000 
}) => {
  const { currentTheme } = useTheme();
  const { successVariants } = useAnimation();

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: currentTheme.spacing[3],
      padding: currentTheme.spacing[4],
      borderRadius: currentTheme.borderRadius.lg,
      boxShadow: currentTheme.shadows.lg,
      minWidth: '300px',
      maxWidth: '500px',
    };

    const typeStyles = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        backgroundColor: currentTheme.colors.success[600],
        color: currentTheme.colors.white,
      },
      [NOTIFICATION_TYPES.ERROR]: {
        backgroundColor: currentTheme.colors.error[600],
        color: currentTheme.colors.white,
      },
      [NOTIFICATION_TYPES.WARNING]: {
        backgroundColor: currentTheme.colors.warning[600],
        color: currentTheme.colors.white,
      },
      [NOTIFICATION_TYPES.INFO]: {
        backgroundColor: currentTheme.colors.primary[600],
        color: currentTheme.colors.white,
      },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getIcon = () => {
    const icons = {
      [NOTIFICATION_TYPES.SUCCESS]: '✓',
      [NOTIFICATION_TYPES.ERROR]: '✕',
      [NOTIFICATION_TYPES.WARNING]: '⚠',
      [NOTIFICATION_TYPES.INFO]: 'ℹ',
    };
    return icons[type];
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={successVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: 'fixed',
            top: currentTheme.spacing[6],
            right: currentTheme.spacing[6],
            zIndex: 1000,
          }}
        >
          <div style={getToastStyles()}>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>
              {getIcon()}
            </span>
            
            <span style={{
              fontSize: currentTheme.typography.fontSize.sm,
              lineHeight: 1.4,
              flex: 1,
            }}>
              {message}
            </span>
            
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: 0,
                opacity: 0.8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
