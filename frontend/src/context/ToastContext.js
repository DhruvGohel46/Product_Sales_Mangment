import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/common/Toast';
import { NOTIFICATION_TYPES } from '../utils/constants';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = NOTIFICATION_TYPES.INFO, duration = 4000, position = 'top-right') => {
    const id = Date.now();
    const newToast = { id, message, type, duration, position };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration, position) => addToast(message, NOTIFICATION_TYPES.SUCCESS, duration, position);
  const showError = (message, duration, position) => addToast(message, NOTIFICATION_TYPES.ERROR, duration, position);
  const showWarning = (message, duration, position) => addToast(message, NOTIFICATION_TYPES.WARNING, duration, position);
  const showInfo = (message, duration, position) => addToast(message, NOTIFICATION_TYPES.INFO, duration, position);

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Render all active toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </ToastContext.Provider>
  );
};
