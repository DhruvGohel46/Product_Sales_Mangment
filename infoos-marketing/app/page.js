"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useSpring } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Showcase from '../components/sections/Showcase';
import HowItWorks from '../components/sections/HowItWorks';
import Pricing from '../components/sections/Pricing';
import Footer from '../components/sections/Footer';
import RoomScrollLayer from '../components/effects/RoomScrollLayer';
import styles from './page.module.css';

export default function Home() {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track global scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 20,
    mass: 0.5,
  });

  const sections = [
    <Hero key="hero" />,
    <Features key="features" />,
    <Showcase key="showcase" />,
    <HowItWorks key="how-it-works" />,
    <Pricing key="pricing" />,
    <Footer key="footer" />,
  ];

  const scrollToSection = (index) => {
    if (!containerRef.current) return;
    const total = sections.length;
    // Calculate the scroll progress 'p' where this section is at the front (angle 0)
    // Rotation logic in RoomScrollLayer: p = ((index / total) * Math.PI * 2) / (Math.PI * 1.5)
    // Simplified: p = (index / total) * (4/3)
    const p = (index / total) * (4 / 3);
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: p * scrollableHeight,
      behavior: 'smooth'
    });
  };

  return (
    <main className={styles.main} ref={containerRef}>
      <Navbar onNavigate={scrollToSection} />

      <div className={styles.roomGlowTop} />
      <div className={styles.roomGlowBottom} />

      <div className={styles.fixedStage}>
        {/* Forcing re-mount on breakpoint change to recalculate 3D transforms correctly */}
        <div className={styles.roomStage} key={isMobile ? 'mobile' : 'desktop'}>
          {sections.map((section, index) => (
            <RoomScrollLayer 
              key={index} 
              index={index} 
              total={sections.length} 
              globalProgress={smoothProgress}
              orbitRadius={isMobile ? 850 : 1400}
            >
              {section}
            </RoomScrollLayer>
          ))}
        </div>
      </div>

      <div className={styles.scrollSpacer} style={{ height: isMobile ? '400vh' : '600vh' }} />
    </main>
  );
}
