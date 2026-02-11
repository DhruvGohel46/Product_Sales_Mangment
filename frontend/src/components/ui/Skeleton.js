import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Skeleton = ({
    width = '100%',
    height = '1rem',
    borderRadius = '0.375rem',
    className = '',
    style = {}
}) => {
    const { currentTheme, isDark } = useTheme();

    const baseColor = isDark ? '#334155' : '#e2e8f0'; // Slate 700 : Slate 200
    const highlightColor = isDark ? '#475569' : '#f1f5f9'; // Slate 600 : Slate 100

    return (
        <div
            className={className}
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: baseColor,
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(90deg, transparent 0%, ${highlightColor} 50%, transparent 100%)`,
                    transform: 'skewX(-20deg)',
                }}
                animate={{
                    x: ['-150%', '150%'],
                }}
                transition={{
                    duration: 1.5,
                    ease: 'easeInOut',
                    repeat: Infinity,
                }}
            />
        </div>
    );
};

export default Skeleton;
