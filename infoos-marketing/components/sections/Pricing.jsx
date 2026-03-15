'use client';

import styles from './Pricing.module.css';
import Button from '../common/Button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for single-owner small shops getting started.",
    features: ["Up to 100 products", "Daily sales reports", "Standard printing", "Local backups"],
    cta: "Download Now",
    variant: "secondary"
  },
  {
    name: "Business",
    price: "$29",
    period: "/mo",
    description: "Advanced features for growing retail businesses.",
    features: ["Unlimited products", "Advanced analytics", "Customer management", "Cloud sync preview", "Priority support"],
    cta: "Get Started",
    variant: "primary",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Scaling tools for multi-location operations.",
    features: ["Multi-store management", "API Access", "Custom integrations", "Dedicated account manager", "On-site setup"],
    cta: "Contact Sales",
    variant: "outline"
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className={styles.pricing}>
      <div className="section-container">
        <div className={styles.header}>
          <h2 className={styles.title}>Simple, Transparent <span className="text-gradient">Pricing</span></h2>
          <p className={styles.subtitle}>Choose the plan that fits your business stage.</p>
        </div>
        
        <div className={styles.grid}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${styles.plan} ${plan.popular ? styles.popular : ''}`}
            >
              {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.priceWrap}>
                  <span className={styles.price}>{plan.price}</span>
                  {plan.period && <span className={styles.period}>{plan.period}</span>}
                </div>
                <p className={styles.planDesc}>{plan.description}</p>
              </div>
              
              <ul className={styles.featureList}>
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <Button variant={plan.variant} size="lg" className={styles.cta}>
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
