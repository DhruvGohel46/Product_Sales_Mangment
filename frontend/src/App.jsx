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
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { useTheme } from './context/ThemeContext';
import { useAnimation } from './hooks/useAnimation';
import { formatCurrency } from './utils/api';
import './styles/fonts.css';
import './styles/global.css';

// Import screens
import WorkingPOSInterface from './components/screens/Bill';
import Reports from './components/screens/Analytics';
import ProductManagement from './components/screens/Management';
import Settings from './components/screens/Settings';
import { settingsAPI } from './api/settings';
import { setCurrencySymbol } from './utils/api';

// Import UI components
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Sidebar from './components/ui/Sidebar';
import { darkTheme } from './styles/theme';

function AppContent() {
  const { currentTheme, toggleTheme, isDark } = useTheme();
  const { settings } = useSettings();
  const { pageVariants, pageTransition } = useAnimation();

  const navigate = useNavigate();
  const location = useLocation();
  const [lastBill, setLastBill] = useState(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [posKey, setPosKey] = useState(0);

  // Settings are now loaded globally by SettingsProvider

  const getActiveTab = (pathname) => {
    if (pathname === '/') return 'pos';
    if (pathname.startsWith('/analytics')) return 'summary';
    if (pathname.startsWith('/management')) return 'management';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'pos';
  };

  const currentScreen = getActiveTab(location.pathname);

  const navItems = [
    {
      id: 'pos',
      label: 'Bill',
      path: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'summary',
      label: 'Analytics',
      path: '/analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'management',
      label: 'Management',
      path: '/management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
  ];

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
    setTimeout(() => {
      setLastBill(null);
    }, 5000);
  };

  const closeNotification = () => {
    setLastBill(null);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text.primary,
      fontFamily: currentTheme.typography.fontFamily.primary,
      overflow: 'hidden',
    }}>
      {/* Search Sidebar */}
      <Sidebar
        activeTab={currentScreen}
        onTabChange={(id) => {
          if (id === 'pos') navigate('/');
          else if (id === 'summary') navigate('/analytics');
          else if (id === 'management') navigate('/management');
          else if (id === 'settings') navigate('/settings');
        }}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        navItems={navItems}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <motion.header
          initial={headerEnter.initial}
          animate={headerEnter.animate}
          transition={headerEnter.transition}
          style={{
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${currentTheme.spacing[8]}`,
            borderBottom: `1px solid ${currentTheme.colors.border}`,
            backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            zIndex: 40,
            flexShrink: 0,
          }}
        >
          {/* Left Side - New Bill Button */}
          <div style={{ width: '200px' }}>
            {/* Show "Start New Bill" button on all screens */}
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setPosKey(prev => prev + 1);
                navigate('/');
              }}
              style={{
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)',
                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)',
                border: 'none',
                color: 'white',
                fontWeight: 600
              }}
            >
              Start New Bill
            </Button>
          </div>

          {/* Center - Title */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: currentTheme.spacing[3]
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              margin: 0,
              background: `linear-gradient(135deg, ${currentTheme.colors.primary[500]}, ${currentTheme.colors.primary[600]})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              ReBill
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 500,
                color: currentTheme.colors.text.secondary,
                WebkitTextFillColor: currentTheme.colors.text.secondary,
                marginLeft: '12px'
              }}>
                ({settings.shop_name || 'Burger Bhau'})
              </span>
            </h1>
          </div>

          {/* Right Side - Date & Theme */}
          <div style={{
            width: '200px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: currentTheme.spacing[4]
          }}>
            <div style={{
              padding: `${currentTheme.spacing[1]} ${currentTheme.spacing[3]}`,
              backgroundColor: currentTheme.colors.surface,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: '999px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: currentTheme.colors.text.secondary,
            }}>
              {todayLabel}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                borderRadius: '12px',
                border: `1px solid ${currentTheme.colors.border}`,
                backgroundColor: currentTheme.colors.surface,
              }}
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </Button>
          </div>
        </motion.header>

        {/* Main Content */}
        <main style={{
          flex: 1,
          display: 'flex', // Enable flex for children to stretch
          flexDirection: 'column',
          minHeight: 0,
          margin: 0,
          padding: 0,
          overflow: 'hidden', // Disable global scroll, handle per-screen
          position: 'relative'
        }}>
          <Routes>
            <Route path="/" element={<WorkingPOSInterface key={posKey} onBillCreated={handleBillCreated} />} />
            <Route path="/analytics" element={<Reports />} />
            <Route path="/management" element={<ProductManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<WorkingPOSInterface key={posKey} onBillCreated={handleBillCreated} />} />
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
      </div> {/* End Main Content Area */}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SettingsProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </SettingsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
