'use client';

import { motion } from 'framer-motion';
import styles from './GlassCard.module.css';
import clsx from 'clsx';

export default function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      className={clsx(styles.card, hover && styles.hoverable, className)}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      <div className={styles.specular} />
      <div className={styles.content}>{children}</div>
    </motion.div>
  );
}
