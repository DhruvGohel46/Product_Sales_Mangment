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
                paddingTop: 'var(--page-padding-top)',
                paddingLeft: 'var(--page-padding-x)',
                paddingRight: 'var(--page-padding-x)',
                paddingBottom: 'var(--page-padding-bottom)',
                height: '100%',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--page-section-gap)',
                ...style
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageContainer;
