import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { useTheme } from './context/ThemeContext';
import { useAnimation } from './hooks/useAnimation';
import './styles/fonts.css';
import './styles/global.css';

// Import screens
import WorkingPOSInterface from './components/screens/Bill';
import Reports from './components/screens/Analytics';
import ProductManagement from './components/screens/Management';

// Import UI components
import Button from './components/ui/Button';
import Card from './components/ui/Card';

function AppContent() {
  const { currentTheme, toggleTheme, isDark } = useTheme();
  const { pageVariants, pageTransition } = useAnimation();
  
  const [currentScreen, setCurrentScreen] = useState('pos');
  const [lastBill, setLastBill] = useState(null);

  const navItems = [
    { id: 'pos', label: 'Bill' },
    { id: 'summary', label: 'Analytics' },
    { id: 'management', label: 'Management' },
  ];

  const currentNavItem = navItems.find((item) => item.id === currentScreen);

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

  const handleProductSelect = (product) => {
    // This will be handled by BillCreation component
    console.log('Product selected:', product);
  };

  const handleBillCreated = (bill) => {
    setLastBill(bill);
    setCurrentScreen('products'); // Go back to products after creating bill
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'pos':
        return <WorkingPOSInterface />;
      case 'summary':
        return <Reports />;
      case 'management':
        return <ProductManagement />;
      default:
        return <WorkingPOSInterface />;
    }
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
            boxShadow: currentTheme.shadows.md,
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
                    onClick={() => setCurrentScreen(item.id)}
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
        {renderCurrentScreen()}
      </main>

      {/* Last Bill Notification */}
      <AnimatePresence>
        {lastBill && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: currentTheme.spacing[6],
              right: currentTheme.spacing[6],
              zIndex: 1000,
            }}
          >
            <Card variant="success" padding="md" style={{ minWidth: '300px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[2] }}>
                <h4 style={{ 
                  fontSize: currentTheme.typography.fontSize.base,
                  fontWeight: currentTheme.typography.fontWeight.semibold,
                  color: currentTheme.colors.success[600],
                  margin: 0,
                }}>
                  Bill Created Successfully!
                </h4>
                <p style={{ 
                  fontSize: currentTheme.typography.fontSize.sm,
                  color: currentTheme.colors.success[500],
                  margin: 0,
                }}>
                  Bill #{lastBill.bill_no} • Total: {lastBill.total}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
