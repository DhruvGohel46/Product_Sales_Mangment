'use client';

import { motion } from 'framer-motion';
import styles from './Button.module.css';
import clsx from 'clsx';

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  return (
    <motion.button
      className={clsx(styles.button, styles[variant], styles[size], className)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
