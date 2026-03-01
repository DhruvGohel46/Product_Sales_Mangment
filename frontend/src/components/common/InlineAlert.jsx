/**
 * InlineAlert — Full-width alert banner with left accent line
 * 
 * Usage:
 *   <InlineAlert type="warning" title="Low Stock" message="3 items below threshold" />
 *   <InlineAlert type="error" message="Please fix the errors above" dismissible onDismiss={() => {}} />
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const ErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

const WarningIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const CloseSmallIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ICONS = {
    success: CheckIcon,
    error: ErrorIcon,
    warning: WarningIcon,
    info: InfoIcon,
};

const InlineAlert = ({
    type = 'info',
    title,
    message,
    dismissible = false,
    visible = true,
    onDismiss,
    style,
    className = '',
}) => {
    const Icon = ICONS[type] || InfoIcon;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`rb-inline-alert rb-inline-alert--${type} ${className}`}
                    style={style}
                >
                    <div className="rb-inline-alert__icon">
                        <Icon />
                    </div>

                    <div className="rb-inline-alert__content">
                        {title && <p className="rb-inline-alert__title">{title}</p>}
                        {message && <p className="rb-inline-alert__message">{message}</p>}
                    </div>

                    {dismissible && (
                        <button
                            className="rb-inline-alert__dismiss"
                            onClick={onDismiss}
                            aria-label="Dismiss alert"
                        >
                            <CloseSmallIcon />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InlineAlert;
