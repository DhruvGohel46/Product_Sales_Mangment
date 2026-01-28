import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { useTheme } from './context/ThemeContext';
import { useAnimation } from './hooks/useAnimation';
import './styles/fonts.css';
import './styles/global.css';

// Import screens
import WorkingPOSInterface from './components/screens/WorkingPOSInterface';
import DailySummary from './components/screens/DailySummary';
import Reports from './components/screens/Reports';
import ProductManagement from './components/screens/ProductManagement';

// Import UI components
import Button from './components/ui/Button';
import Card from './components/ui/Card';

function AppContent() {
  const { currentTheme } = useTheme();
  const { pageVariants, pageTransition } = useAnimation();
  
  const [currentScreen, setCurrentScreen] = useState('pos');
  const [lastBill, setLastBill] = useState(null);

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
        return <DailySummary />;
      case 'reports':
        return <Reports />;
      case 'management':
        return <ProductManagement />;
      default:
        return <WorkingPOSInterface />;
    }
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text.primary,
      fontFamily: currentTheme.typography.fontFamily.primary,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: currentTheme.colors.card,
        borderBottom: `1px solid ${currentTheme.colors.border}`,
        padding: `${currentTheme.spacing[4]} ${currentTheme.spacing[8]}`,
        boxShadow: currentTheme.shadows.sm,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{
              fontSize: currentTheme.typography.fontSize['2xl'],
              fontWeight: currentTheme.typography.fontWeight.semibold,
              color: currentTheme.colors.text.primary,
              margin: 0,
              letterSpacing: currentTheme.typography.letterSpacing.tight,
            }}>
              POS System
            </h1>
            <p style={{
              fontSize: currentTheme.typography.fontSize.sm,
              color: currentTheme.colors.text.secondary,
              margin: `${currentTheme.spacing[1]} 0 0 0`,
            }}>
              Fast Food Shop Management
            </p>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: currentTheme.spacing[2] }}>
            {[
              { id: 'pos', label: 'POS' },
              { id: 'summary', label: 'Summary' },
              { id: 'reports', label: 'Reports' },
              { id: 'management', label: 'Management' },
            ].map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={currentScreen === item.id ? 'primary' : 'ghost'}
                  onClick={() => setCurrentScreen(item.id)}
                  data-isSelected={currentScreen === item.id}
                  style={{
                    position: 'relative',
                    fontWeight: currentScreen === item.id 
                      ? currentTheme.typography.fontWeight.semibold 
                      : currentTheme.typography.fontWeight.medium,
                  }}
                >
                  {item.label}
                  {currentScreen === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '3px',
                        backgroundColor: currentTheme.colors.white,
                        borderRadius: '2px',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </motion.div>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        height: 'calc(100vh - 80px)',
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
