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
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider, useAlert } from './context/AlertContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { useTheme } from './context/ThemeContext';
import { useAnimation } from './hooks/useAnimation';
import { formatCurrency } from './utils/api';
import './styles/fonts.css';
import './styles/global.css';

// Import screens
import WorkingPOSInterface from './components/screens/Bill';
import Analytics from './components/screens/Analytics';
import ProductManagement from './components/screens/Management';
import Inventory from './components/screens/Inventory';
import Settings from './components/screens/Settings';
import Reminders from './components/screens/Reminders';
import { settingsAPI } from './api/settings';
import { setCurrencySymbol } from './utils/api';
import NotificationSystem from './components/system/NotificationSystem';

// Worker Pages
// Worker Pages
import WorkersDashboard from './components/workers/WorkersPage';
import WorkerList from './components/workers/WorkerList';
import WorkerProfile from './components/workers/WorkerProfile';
import Attendance from './components/workers/Attendance';
import SalaryManager from './components/workers/SalaryManager';
import { workerAPI } from './api/workers';

// Import UI components
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Sidebar from './components/ui/Sidebar';
import { darkTheme } from './styles/theme';

function AppContent() {
  const { currentTheme, toggleTheme, isDark } = useTheme();
  const { settings } = useSettings();
  const { pageVariants, pageTransition } = useAnimation();

  const { addToast, showSuccess: alertSuccess } = useAlert();

  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [posKey, setPosKey] = useState(0);
  const notificationRef = React.useRef(null);
  const [showAttendancePrompt, setShowAttendancePrompt] = useState(false);

  // Check Attendance & Salary on Mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // 1. Attendance Check
        const status = await workerAPI.checkAttendanceStatus();
        if (!status.is_marked) {
          setShowAttendancePrompt(true);
        }

        // 2. Salary Day Check
        if (settings?.salary_day) {
          const today = new Date();
          if (today.getDate() === parseInt(settings.salary_day)) {
            const salaryStatus = await workerAPI.checkMonthlySalaryStatus(today.getMonth() + 1, today.getFullYear());
            if (salaryStatus.data && !salaryStatus.data.all_paid) {
              setSalaryNotification(true);
            }
          }
        }
      } catch (e) {
        console.error("Status check failed", e);
      }
    };

    // Delay slightly to ensure settings are loaded (though text might pop in)
    // or rely on settings dependency
    if (settings?.salary_day) {
      checkStatus();
    } else {
      // Initial check without settings, or just wait for settings to load
      setTimeout(checkStatus, 3000);
    }
  }, [settings?.salary_day]);

  const [salaryNotification, setSalaryNotification] = useState(false);

  // Initial Stock Check
  useEffect(() => {
    // Small delay to ensure backend is ready and settings loaded
    const timer = setTimeout(() => {
      if (notificationRef.current) {
        notificationRef.current.checkStock();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Settings are now loaded globally by SettingsProvider

  const getActiveTab = (pathname) => {
    if (pathname === '/') return 'pos';
    if (pathname.startsWith('/analytics')) return 'summary';
    if (pathname.startsWith('/analytics')) return 'summary';
    if (pathname.startsWith('/management')) return 'management';
    if (pathname.startsWith('/workers')) return 'workers';
    if (pathname.startsWith('/inventory')) return 'inventory';
    if (pathname.startsWith('/reminders')) return 'reminders';
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
      id: 'workers',
      label: 'Workers',
      path: '/workers',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      )
    },
    {
      id: 'inventory',
      label: 'Inventory',
      path: '/inventory',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      id: 'reminders',
      label: 'Reminders',
      path: '/reminders',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    addToast({
      type: 'success',
      title: 'Bill Created Successfully!',
      description: `Bill #${bill.bill_no} — Total: ${formatCurrency(bill.total)}`,
      duration: 5000,
    });
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      backgroundColor: 'transparent',
      color: currentTheme.colors.text.primary,
      fontFamily: currentTheme.typography.fontFamily.primary,
      overflow: 'hidden',
    }}>
      {/* Search Sidebar */}
      <Sidebar
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
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          whileHover={{ filter: 'brightness(1.05)' }}
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            backgroundColor: isDark ? 'rgba(11,11,12,0.72)' : 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            zIndex: 40,
            flexShrink: 0,
            transition: 'filter 0.2s ease',
          }}
        >
          {/* Left Side - New Bill Button */}
          <div style={{ width: '200px' }}>
            <motion.button
              whileHover={{
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(249,115,22,0.45)'
              }}
              whileTap={{
                transform: 'translateY(0px) scale(0.97)'
              }}
              onClick={() => {
                setPosKey(prev => prev + 1);
                navigate('/');
              }}
              style={{
                background: '#F97316', // Orange identity
                boxShadow: '0 4px 12px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.2)', // Depth
                border: 'none',
                borderRadius: '8px', // Standard radius
                padding: '8px 16px',
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: '180ms ease'
              }}
            >
              Start New Bill
            </motion.button>
          </div>

          {/* Center - Title */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '0.3px',
                color: '#F97316',
                textShadow: '0 0 12px rgba(249,115,22,0.25)', // Glow
                margin: 0,
                cursor: 'default',
                transition: 'opacity 200ms ease',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              ReBill
              <span style={{
                fontSize: '14px',
                fontWeight: 400,
                color: currentTheme.colors.text.secondary,
                opacity: 0.65,
                marginLeft: '8px'
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
            gap: '16px'
          }}>
            {/* Date Chip */}
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: currentTheme.colors.text.secondary,
                cursor: 'default',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
            >
              {todayLabel}
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
              }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                color: currentTheme.colors.text.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </motion.button>
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
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/management" element={<ProductManagement />} />

            {/* Worker Routes */}
            <Route path="/workers" element={<WorkersDashboard />} />
            <Route path="/workers/list" element={<WorkerList />} /> {/* Optional alias if needed, but dashboard is main entry */}
            <Route path="/workers/:id" element={<WorkerProfile />} />
            <Route path="/workers/attendance" element={<Attendance />} />
            <Route path="/workers/salary" element={<SalaryManager />} />

            <Route path="/reminders" element={<Reminders />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<WorkingPOSInterface key={posKey} onBillCreated={handleBillCreated} />} />
          </Routes>
        </main>


      </div> {/* End Main Content Area */}

      {/* Global Notification System */}
      <NotificationSystem ref={notificationRef} />

      {/* Startup Attendance Prompt */}
      <AnimatePresence>
        {showAttendancePrompt && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: isDark ? '#1e293b' : 'white',
                padding: '32px', borderRadius: '16px',
                maxWidth: '400px', width: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #FF6B00'
              }}
            >
              <h2 style={{
                marginTop: 0,
                color: currentTheme.colors.text.primary,
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <span style={{ fontSize: '1.5rem' }}>⏰</span>
                Mark Attendance?
              </h2>
              <p style={{ color: currentTheme.colors.text.secondary }}>
                You haven't marked worker attendance for today yet. Would you like to do it now?
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <Button
                  variant="ghost"
                  onClick={() => setShowAttendancePrompt(false)}
                >
                  Later
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowAttendancePrompt(false);
                    navigate('/workers/attendance');
                  }}
                  style={{ background: '#FF6B00', border: 'none' }}
                >
                  Yes, Mark Now
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Salary Day Notification */}
      <AnimatePresence>
        {salaryNotification && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: isDark ? '#1e293b' : 'white',
                padding: '32px', borderRadius: '16px',
                maxWidth: '400px', width: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #10B981'
              }}
            >
              <h2 style={{
                marginTop: 0,
                color: currentTheme.colors.text.primary,
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                It's Salary Day!
              </h2>
              <p style={{ color: currentTheme.colors.text.secondary }}>
                Today is the designated salary day. Would you like to review and process worker salaries now?
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <Button
                  variant="ghost"
                  onClick={() => setSalaryNotification(false)}
                >
                  Later
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSalaryNotification(false);
                    navigate('/workers/salary');
                  }}
                  style={{ background: '#10B981', border: 'none' }}
                >
                  Go to Salary Manager
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <SettingsProvider>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </SettingsProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}
