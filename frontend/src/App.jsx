/**
 * =============================================================================
 * MAIN APPLICATION COMPONENT - APP.JSX
 * =============================================================================
 * 
 * ROLE: Central application entry point and routing controller
 * 
 * RESPONSIBILITIES:
 * - Theme management and dark/light mode switching
 * - Screen navigation between POS, Analytics, and Management modules
 * - Bill notification system with auto-dismiss functionality
 * - Global layout structure and responsive design
 * - State management for current screen and bill notifications
 * 
 * KEY FEATURES:
 * - ThemeProvider wrapper for consistent theming
 * - Navigation system with screen state management
 * - Bill creation notification with glassmorphism design
 * - Auto-dismiss notifications (5 seconds)
 * - Responsive layout with proper spacing
 * 
 * SCREENS:
 * - 'pos': Point of Sale / Billing interface
 * - 'summary': Analytics dashboard with reports
 * - 'management': Product management system
 * 
 * COMPONENTS USED:
 * - WorkingPOSInterface: Main billing/POS functionality
 * - Reports: Analytics and reporting dashboard
 * - ProductManagement: Product CRUD operations
 * 
 * STATE MANAGEMENT:
 * - currentScreen: Active screen identifier
 * - lastBill: Bill notification data for display
 * - Theme context integration
 * 
 * DESIGN PATTERNS:
 * - Functional component with hooks
 * - Conditional rendering based on screen state
 * - Framer Motion animations for notifications
 * - Theme-aware styling throughout
 * =============================================================================
 */
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { useTheme } from './context/ThemeContext';
import { useAnimation } from './hooks/useAnimation';
import { formatCurrency } from './utils/api';
import './styles/fonts.css';
import './styles/global.css';

// Import screens
import WorkingPOSInterface from './components/screens/Bill';
import Reports from './components/screens/Analytics';
import ProductManagement from './components/screens/Management';

// Import UI components
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { darkTheme } from './styles/theme';

function AppContent() {
  const { currentTheme, toggleTheme, isDark } = useTheme();
  const { pageVariants, pageTransition } = useAnimation();

  const navigate = useNavigate();
  const location = useLocation();
  const [lastBill, setLastBill] = useState(null);

  const getActiveTab = (pathname) => {
    if (pathname === '/') return 'pos';
    if (pathname.startsWith('/analytics')) return 'summary';
    if (pathname.startsWith('/management')) return 'management';
    return 'pos';
  };

  const currentScreen = getActiveTab(location.pathname);

  const navItems = [
    { id: 'pos', label: 'Bill', path: '/' },
    { id: 'summary', label: 'Analytics', path: '/analytics' },
    { id: 'management', label: 'Management', path: '/management' },
  ];

  /* Remove currentNavItem derivation as we use logic inside loop */

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
  });

  const headerEnter = {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: [0, 0, 0.2, 1] },
  };

  const handleBillCreated = (bill) => {
    setLastBill(bill);
    // Stay on POS or navigate if needed

    // Auto-dismiss notification after 5 seconds
    setTimeout(() => {
      setLastBill(null);
    }, 5000);
  };

  const closeNotification = () => {
    setLastBill(null);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text.primary,
      fontFamily: currentTheme.typography.fontFamily.primary,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <motion.header
        initial={headerEnter.initial}
        animate={headerEnter.animate}
        transition={headerEnter.transition}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'transparent',
          padding: `${currentTheme.spacing[4]} ${currentTheme.spacing[6]}`,
        }}
      >
        <div style={{ maxWidth: '95vw', margin: '0 auto' }}>
          <div style={{
            backgroundColor: currentTheme.colors.card || currentTheme.colors.surface,
            border: `1px solid ${currentTheme.colors.border}`,
            borderRadius: currentTheme.borderRadius['2xl'],
            boxShadow: isDark ? currentTheme.shadows.cardDark : currentTheme.shadows.card,
            padding: `${currentTheme.spacing[3]} ${currentTheme.spacing[4]}`,
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: currentTheme.spacing[6],
              minHeight: '3.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: currentTheme.typography.fontWeight.semibold,
                  color: currentTheme.colors.text.primary,
                  margin: 0,
                  letterSpacing: currentTheme.typography.letterSpacing.tight,
                  lineHeight: currentTheme.typography.lineHeight.tight,
                  whiteSpace: 'nowrap',
                }}>
                  Burger Bhau
                </div>
              </div>

              <nav
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: currentTheme.spacing[2],
                }}
              >
                {navItems.map((item) => {
                  const isActive = currentScreen === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      style={{ position: 'relative' }}
                      whileHover={{ opacity: 0.86 }}
                      whileTap={{ opacity: 0.78 }}
                      transition={{ duration: 0.12, ease: [0, 0, 0.2, 1] }}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(item.path)}
                        data-isselected={isActive}
                        style={{
                          position: 'relative',
                          fontSize: currentTheme.typography.fontSize['xl'],
                          color: currentTheme.colors.text.primary,
                          fontWeight: currentTheme.typography.fontWeight.medium,
                          backgroundColor: 'transparent',
                          paddingLeft: currentTheme.spacing[3],
                          paddingRight: currentTheme.spacing[3],
                        }}
                      >
                        {item.label}
                      </Button>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavUnderline"
                          style={{
                            position: 'absolute',
                            left: currentTheme.spacing[3],
                            right: currentTheme.spacing[3],
                            bottom: '-6px',
                            height: '2px',
                            backgroundColor: currentTheme.colors.primary[600],
                            borderRadius: currentTheme.borderRadius.full,
                          }}
                          transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </nav>

              <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: currentTheme.spacing[3] }}>
                  <div style={{
                    fontSize: currentTheme.typography.fontSize.sm,
                    fontWeight: currentTheme.typography.fontWeight.normal,
                    color: currentTheme.colors.text.muted,
                    letterSpacing: currentTheme.typography.letterSpacing.normal,
                    whiteSpace: 'nowrap',
                  }}>
                    {todayLabel}
                  </div>

                  <motion.div
                    whileHover={{ opacity: 0.86 }}
                    whileTap={{ opacity: 0.78 }}
                    transition={{ duration: 0.12, ease: [0, 0, 0.2, 1] }}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleTheme}
                      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                      title={isDark ? 'Light mode' : 'Dark mode'}
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        minWidth: '2.5rem',
                        padding: 0,
                        borderRadius: currentTheme.borderRadius.lg,
                        border: `1px solid ${currentTheme.colors.border}`,
                        backgroundColor: currentTheme.colors.surface,
                        color: currentTheme.colors.text.secondary,
                        boxShadow: currentTheme.shadows.inner,
                      }}
                    >
                      {isDark ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path
                            d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M4.93 4.93l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M17.66 17.66l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M20 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M4.93 19.07l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path
                            d="M21 13.2A7.5 7.5 0 0 1 10.8 3a6.6 6.6 0 1 0 10.2 10.2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        minHeight: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}>
        <Routes>
          <Route path="/" element={<WorkingPOSInterface onBillCreated={handleBillCreated} />} />
          <Route path="/analytics" element={<Reports />} />
          <Route path="/management" element={<ProductManagement />} />
          <Route path="*" element={<WorkingPOSInterface onBillCreated={handleBillCreated} />} />
        </Routes>
      </main>

      {/* Last Bill Notification with Spotlight Effect */}
      <AnimatePresence>
        {lastBill && (
          <>
            {/* Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 999,
                cursor: 'pointer',
              }}
              onClick={closeNotification}
            />

            {/* Notification Card */}
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: currentTheme.spacing[6],
                right: currentTheme.spacing[6],
                zIndex: 1000,
              }}
            >
              <div style={{
                background: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`,
                borderRadius: '16px',
                padding: `${currentTheme.spacing[4]} ${currentTheme.spacing[5]}`,
                boxShadow: isDark
                  ? '0 8px 32px rgba(34, 197, 94, 0.15), 0 4px 16px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(34, 197, 94, 0.1), 0 4px 16px rgba(0, 0, 0, 0.1)',
                minWidth: '320px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
              }}>
                {/* Success Indicator */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: `linear-gradient(180deg, ${currentTheme.colors.success[500]}, ${currentTheme.colors.success[600]})`,
                }} />

                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: currentTheme.spacing[3],
                  marginBottom: currentTheme.spacing[2],
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${currentTheme.colors.success[500]}, ${currentTheme.colors.success[600]})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: currentTheme.colors.text.primary,
                      margin: 0,
                      lineHeight: 1.2,
                    }}>
                      Bill Created Successfully!
                    </h4>
                  </div>
                </div>

                {/* Bill Details */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: currentTheme.spacing[1],
                  paddingLeft: '44px', // Align with header text
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: currentTheme.colors.text.secondary,
                    margin: 0,
                    lineHeight: 1.4,
                  }}>
                    <span style={{ fontWeight: 600 }}>Bill #{lastBill.bill_no}</span>
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: currentTheme.colors.text.secondary,
                    margin: 0,
                    lineHeight: 1.4,
                  }}>
                    Total: <span style={{ fontWeight: 600, color: currentTheme.colors.success[600] }}>{formatCurrency(lastBill.total)}</span>
                  </p>
                </div>

                {/* Auto-dismiss indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '2px',
                  width: '100%',
                  background: `linear-gradient(90deg, ${currentTheme.colors.success[500]}, ${currentTheme.colors.success[600]})`,
                  transformOrigin: 'left',
                }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
