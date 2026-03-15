'use client';

import styles from './Hero.module.css';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.glowOrb1} />
      <div className={styles.glowOrb2} />
      
      <div className="section-container">
        <div className={styles.content}>
          <motion.div 
            className={styles.left}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className={styles.badge}>✦ Smart POS for Modern Retail</div>
            <h1 className={styles.headline}>
              The Operating System<br />
              for Your <span className="text-gradient">Retail Business</span>
            </h1>
            <p className={styles.description}>
              InfoOS simplifies billing, automates inventory, and gives you deep sales analytics — 
              all from one elegant interface. Built for shop owners who demand speed and precision.
            </p>
            <div className={styles.ctas}>
              <Button variant="primary" size="lg">Download for Windows</Button>
              <Button variant="secondary" size="lg">Watch Demo</Button>
            </div>
          </motion.div>

          <motion.div 
            className={styles.right}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={styles.uiPreview}>
              <div className={styles.previewFrame}>
                <Image 
                  src="/images/billing.png" 
                  alt="InfoOS Billing Interface" 
                  width={600} 
                  height={400}
                  className={styles.previewImage}
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
