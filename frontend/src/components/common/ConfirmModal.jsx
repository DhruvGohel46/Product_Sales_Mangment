/**
 * ConfirmModal — Premium confirmation dialog for destructive actions
 */
import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// ─── Default Icons ───
const TrashIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const AlertTriangleIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const InfoCircleIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const DEFAULT_ICONS = {
    danger: TrashIcon,
    warning: AlertTriangleIcon,
    primary: InfoCircleIcon,
    info: InfoCircleIcon,
};

const ConfirmModal = ({
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = 'danger',
    icon: CustomIcon,
    onConfirm,
    onCancel,
}) => {
    const Icon = CustomIcon || DEFAULT_ICONS[variant] || TrashIcon;

    // Keyboard: Enter = confirm, Escape = cancel
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            onConfirm();
        }
    }, [onCancel, onConfirm]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Map variant to button class
    const btnVariantClass = `rb-confirm__btn--${variant}`;
    const iconVariantClass = variant === 'danger' || variant === 'primary'
        ? `rb-confirm__icon--${variant}`
        : `rb-confirm__icon--${variant}`;

    return (
        <motion.div
            className="rb-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
        >
            <motion.div
                className="rb-confirm-card"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className={`rb-confirm__icon ${iconVariantClass}`}>
                    <Icon />
                </div>

                {/* Title */}
                <h3 className="rb-confirm__title">{title}</h3>

                {/* Description */}
                {description && (
                    <p className="rb-confirm__description">{description}</p>
                )}

                {/* Actions */}
                <div className="rb-confirm__actions">
                    <button
                        className="rb-confirm__btn rb-confirm__btn--cancel"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={`rb-confirm__btn ${btnVariantClass}`}
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConfirmModal;
