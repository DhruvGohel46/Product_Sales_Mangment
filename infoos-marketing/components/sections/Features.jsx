'use client';

import styles from './Features.module.css';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Package, Shield, Printer, Clock } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Lightning-Fast Billing', desc: 'Process transactions instantly with keyboard shortcuts and smart product search. Designed for peak-hour speed.' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track daily revenue, top products, and sales trends with live dashboards built for decision-making.' },
  { icon: Package, title: 'Smart Inventory', desc: 'Automatic stock tracking with low-stock alerts. Know exactly what you have before it runs out.' },
  { icon: Shield, title: 'Secure & Offline', desc: 'Your data stays on your machine. No internet required. Full encryption and local backups.' },
  { icon: Printer, title: 'Instant Print', desc: 'One-click thermal printing for receipts. Connect any standard POS printer and go.' },
  { icon: Clock, title: 'Staff Management', desc: 'Track attendance, assign roles, and manage shifts — all from within the same interface.' },
];

export default function Features() {
  return (
    <section id="features" className={styles.features}>
      <div className="section-container">
        <div className={styles.header}>
          <h2 className={styles.title}>
            Built for <span className="text-gradient">Real Businesses</span>
          </h2>
          <p className={styles.subtitle}>
            Every feature is driven by feedback from shop owners. No bloat. Just what works.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              className={styles.item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className={styles.iconWrap}>
                <feat.icon size={24} />
              </div>
              <div>
                <h3 className={styles.itemTitle}>{feat.title}</h3>
                <p className={styles.itemDesc}>{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
