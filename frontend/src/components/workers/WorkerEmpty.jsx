import React from 'react';
import { motion } from 'framer-motion';
import { IoPersonAdd } from 'react-icons/io5';
import Button from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';

const WorkerEmpty = ({ onAdd }) => {
    const { currentTheme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                textAlign: 'center',
                background: 'transparent',
                minHeight: '400px'
            }}
        >
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(249, 115, 22, 0.1)',
                    color: '#F97316',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    fontSize: '32px'
                }}
            >
                <IoPersonAdd />
            </motion.div>

            <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: currentTheme.colors.text.primary,
                marginBottom: '8px'
            }}>
                Nothing here yet
            </h3>

            <p style={{
                fontSize: '14px',
                color: currentTheme.colors.text.secondary,
                maxWidth: '300px',
                margin: '0 0 24px 0',
                lineHeight: '1.5'
            }}>
                This section will show your staff list once you add your first worker.
            </p>

            <Button
                variant="primary"
                onClick={onAdd}
                style={{
                    background: '#F97316',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
                }}
            >
                <IoPersonAdd size={18} />
                Add Worker
            </Button>
        </motion.div>
    );
};

export default WorkerEmpty;
