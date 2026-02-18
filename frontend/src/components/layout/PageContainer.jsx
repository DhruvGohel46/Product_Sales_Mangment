import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../hooks/useAnimation';

const PageContainer = ({ children, className, style }) => {
    const { pageVariants, pageTransition } = useAnimation();

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{
                paddingTop: '28px', // Global Rhythm: Page Padding Top
                paddingLeft: '32px', // Standard horizontal padding
                paddingRight: '32px',
                paddingBottom: '32px',
                height: '100%',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px', // Global Rhythm: Section Gap
                ...style
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageContainer;
