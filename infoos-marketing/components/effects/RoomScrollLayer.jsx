'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import styles from './RoomScrollLayer.module.css';

export default function RoomScrollLayer({
  children,
  index = 0,
  total = 6,
  globalProgress,
  className = '',
  orbitRadius = 1400,
}) {
  const reduceMotion = useReducedMotion();

  // Each section has a fixed starting angle on the wheel (0 to 2*PI)
  const baseAngle = (index / total) * Math.PI * 2;
  
  // As the user scrolls (0 to 1), the entire wheel rotates one full turn
  const currentAngle = useTransform(globalProgress, (p) => baseAngle - p * Math.PI * 1.5);

  // Vertical Orbit: Calculate Y (up/down) and Z (depth) on the 3D ring
  const y = useTransform(currentAngle, (a) => Math.sin(a) * orbitRadius);
  const z = useTransform(currentAngle, (a) => Math.cos(a) * orbitRadius - orbitRadius);
  
  // Tilt the frame to follow the wheel's curvature
  const rotateX = useTransform(currentAngle, (a) => (a * 180) / Math.PI * -1);

  // Focus effect: Section is fully visible and large when at the "front" (angle near 0)
  // We use currentAngle normalized to [-PI, PI] to check proximity to front
  const opacity = useTransform(currentAngle, (a) => {
    const dist = Math.abs(((a + Math.PI) % (Math.PI * 2)) - Math.PI);
    // Even steeper fade-out for performance
    return Math.pow(Math.max(0, 1 - dist * 2.0), 3);
  });
  
  const scale = useTransform(currentAngle, (a) => {
    const dist = Math.abs(((a + Math.PI) % (Math.PI * 2)) - Math.PI);
    return 0.85 + Math.max(0, 0.15 - dist * 0.15);
  });

  // Performance: Harder threshold for rendering back panels
  const isVisible = useTransform(opacity, (o) => o > 0.05);

  return (
    <motion.div
      className={`${styles.layer} ${className}`}
      style={
        reduceMotion
          ? undefined
          : {
              y,
              z,
              rotateX,
              scale,
              opacity,
              position: 'absolute',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              transformStyle: 'preserve-3d',
              zIndex: useTransform(opacity, [0, 1], [1, 1000]),
              visibility: useTransform(isVisible, (v) => v ? 'visible' : 'hidden'),
              display: useTransform(isVisible, (v) => v ? 'flex' : 'none'),
            }
      }
    >
      <div className={styles.panel}>{children}</div>
    </motion.div>
  );
}
