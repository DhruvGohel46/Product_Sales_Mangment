'use client';

import styles from './HowItWorks.module.css';
import { motion } from 'framer-motion';
import { Download, Settings, Rocket } from 'lucide-react';

const steps = [
  { icon: Download, step: '01', title: 'Download & Install', desc: 'Get the lightweight installer for Windows. No complex setup — just download, install, and launch.' },
  { icon: Settings, step: '02', title: 'Configure Your Store', desc: 'Add your products, categories, and set pricing. Import from CSV or enter manually — your choice.' },
  { icon: Rocket, step: '03', title: 'Start Selling', desc: 'You\'re live. Start creating bills, tracking inventory, and watching your analytics grow in real-time.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      <div className="section-container">
        <div className={styles.header}>
          <h2 className={styles.title}>
            Up and Running in <span className="title-highlight">3 Minutes</span>
          </h2>
          <p className={styles.subtitle}>No cloud setup. No subscriptions. Just install and go.</p>
        </div>

        <div className={styles.steps}>
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              className={styles.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <div className={styles.stepNumber}>{s.step}</div>
              <div className={styles.stepIcon}>
                <s.icon size={28} />
              </div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
              {i < steps.length - 1 && <div className={styles.connector} />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
