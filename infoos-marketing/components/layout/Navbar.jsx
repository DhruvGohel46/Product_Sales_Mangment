'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Layout, LogOut, User } from 'lucide-react';
import styles from './Navbar.module.css';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <motion.nav 
      className={styles.navbar}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Layout className={styles.logoIcon} />
          <span>InfoOS</span>
        </Link>

        <div className={styles.links}>
          <Link href="#features">Features</Link>
          <Link href="#showcase">Showcase</Link>
          <Link href="#how-it-works">How It Works</Link>
          <Link href="#pricing">Pricing</Link>
        </div>

        <div className={styles.actions}>
          {session ? (
            <>
              <Link href="/dashboard" className={styles.dashboardLink}>
                <User size={16} />
                Dashboard
              </Link>
              <button onClick={() => signOut()} className={styles.signOutBtn}>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.signInLink}>Sign In</Link>
              <Link href="#" className={styles.downloadBtn}>Download</Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
