'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Layout, LogOut, User, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Navbar({ onNavigate }) {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (e, index) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(index);
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.nav 
      className={styles.navbar}
      initial={{ y: -100, x: '-50%', opacity: 0 }}
      animate={{ y: 0, x: '-50%', opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className={styles.blobChain}>
        {/* LOGO BLOB */}
        <Link href="/" onClick={(e) => handleNav(e, 0)} className={styles.logoBlob}>
          <span className={styles.logoText}>InfoOS</span>
        </Link>

        {/* SINGLE BRIDGE FOR ALL SCREEN SIZES - CSS will handle visibility of subsequent blobs */}
        <div className={styles.bridge} />

        {/* LINKS BLOB (Desktop Only) */}
        <div className={`${styles.linksBlob} ${styles.darkBlob}`}>
          <Link href="#features" onClick={(e) => handleNav(e, 1)}>Features</Link>
          <span className={styles.separator}>|</span>
          <Link href="#showcase" onClick={(e) => handleNav(e, 2)}>Showcase</Link>
          <span className={styles.separator}>|</span>
          <Link href="#how-it-works" onClick={(e) => handleNav(e, 3)}>How It Works</Link>
          <span className={styles.separator}>|</span>
          <Link href="#pricing" onClick={(e) => handleNav(e, 4)}>Pricing</Link>
        </div>

        {/* SECOND BRIDGE (Desktop Only) - Hidden in CSS on small screens */}
        <div className={`${styles.bridge} ${styles.desktopOnly}`} />

        {/* ACTIONS / MENU BLOB (Responsive content) */}
        <div className={`${styles.actionsBlob} ${styles.darkBlob}`}>
          {/* On Desktop: Text Link. On Mobile: Hamburger Icon */}
          <div className={styles.actionContent}>
            <div className={styles.desktopAction}>
              {session ? (
                <Link href="/dashboard" className={styles.actionLink}>
                  <User size={16} /> Dashboard
                </Link>
              ) : (
                <Link href="/login" className={styles.actionLink}>Sign In</Link>
              )}
            </div>
            
            <button 
              className={styles.menuToggle} 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Links Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
          >
            <Link href="#features" onClick={(e) => handleNav(e, 1)}>Features</Link>
            <Link href="#showcase" onClick={(e) => handleNav(e, 2)}>Showcase</Link>
            <Link href="#how-it-works" onClick={(e) => handleNav(e, 3)}>How It Works</Link>
            <Link href="#pricing" onClick={(e) => handleNav(e, 4)}>Pricing</Link>
            <div className={styles.mobileDivider} />
            {session ? (
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
