/**
 * =============================================================================
 * ANALYTICS DASHBOARD - ANALYTICS.JSX
 * =============================================================================
 * 
 * ROLE: Business intelligence dashboard for sales analytics and reporting
 * 
 * RESPONSIBILITIES:
 * - Real-time sales data visualization and KPI tracking
 * - Product sales breakdown with pie chart representation
 * - Daily summary reports with key metrics
 * - Data export functionality (CSV reports)
 * - Interactive charts and responsive design
 * - Data management (clear/refresh operations)
 * 
 * KEY FEATURES:
 * - Total sales and bill count KPI cards
 * - Interactive pie chart for category-wise sales
 * - Daily revenue tracking and trends
 * - Export reports in CSV format
 * - Data refresh and clear functionality
 * - Management-style header design
 * - Responsive grid layout for KPIs
 * 
 * DATA VISUALIZATIONS:
 * - PieChart: Category-wise sales distribution
 * - KPI Cards: Total sales, total bills, revenue metrics
 * - Progress indicators and trend analysis
 * 
 * API INTEGRATION:
 * - summaryAPI: Daily sales summaries and KPIs
 * - reportsAPI: Report generation and data export
 * - loadProductSales: Detailed product sales data
 * 
 * STATE MANAGEMENT:
 * - summary: Daily sales summary data
 * - productSales: Individual product sales data
 * - availableReports: Generated report list
 * - loading/error states for async operations
 * 
 * COMPONENTS:
 * - KPI Cards: Animated metric displays
 * - PieChart: Interactive sales visualization
 * - Export buttons: CSV download functionality
 * - Management-style header: Consistent design
 * 
 * DESIGN PATTERNS:
 * - Functional component with animation hooks
 * - Staggered animations for visual appeal
 * - Theme-aware styling throughout
 * - Responsive grid layouts
 * - Error boundaries and loading states
 * 
 * USER INTERACTIONS:
 * - Real-time data refresh
 * - Report generation and download
 * - Data clearing with confirmation
 * - Interactive chart exploration
 * =============================================================================
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';
import { summaryAPI, reportsAPI } from '../../utils/api';
import { formatCurrency, handleAPIError, downloadFile } from '../../utils/api';
import { CATEGORY_COLORS, CATEGORY_NAMES, ANIMATION_DURATIONS, EASINGS } from '../../utils/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';

// Icon components
const TrendingUpIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReceiptIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M6.5 6.5h14l-1.5 8.5H8.2L6.5 6.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    <path d="M6.5 6.5L6 4H3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DollarSignIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 6H5H21M8 6V20C8 21.1046 8.89543 22 10 22H14C15.1046 22 16 21.1046 16 20V6M19 6V20C19 21.1046 19.1046 22 18 22H10C8.89543 22 8 21.1046 8 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11L14 11M10 15L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownloadIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reports = () => {
  const { currentTheme, isDark } = useTheme();
  const { cardVariants, staggerContainer, staggerItem } = useAnimation();
  
  // Summary state
  const [summary, setSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  
  // Reports state
  const [availableReports, setAvailableReports] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [error, setError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearingData, setClearingData] = useState(false);
  const [productSales, setProductSales] = useState([]);

  // Safeguard so we never read properties from null
  const safeSummary = summary || {};

  // Load both summary and reports data
  useEffect(() => {
    loadSummary();
    loadAvailableReports();
    loadProductSales();
  }, [selectedDate]);

  async function loadSummary() {
    try {
      setLoading(true);
      setError('');
      
      const response = await summaryAPI.getTodaySummary();
      setSummary(response.data.summary);
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
      console.error('Error loading summary:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableReports() {
    try {
      setLoading(true);
      setError('');
      
      const response = await reportsAPI.getAvailableReports();
      setAvailableReports(response.data.reports);
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadProductSales() {
    try {
      const response = await fetch('/api/summary/product-sales');
      const data = await response.json();
      
      if (data.success) {
        setProductSales(data.product_sales);
      }
    } catch (err) {
      console.error('Error loading product sales:', err);
    }
  }

  // Download report
  const handleDownload = async (reportType, reportName, filename) => {
    try {
      setDownloading(prev => ({ ...prev, [reportType]: true }));
      setError('');
      
      let response;
      
      if (reportType === 'excel') {
        response = await reportsAPI.exportTodayExcel('detailed');
      } else if (reportType === 'csv') {
        response = await reportsAPI.exportTodayCSV();
      }
      
      if (response && response.data) {
        downloadFile(response.data, filename);
      }
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
      console.error('Error downloading report:', err);
    } finally {
      setDownloading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  // Clear all bills data
  const handleClearBills = async () => {
    try {
      setClearingData(true);
      setError('');
      
      const response = await fetch('/api/bill/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: clearPassword
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setShowClearConfirm(false);
        setClearPassword('');
        // Reload data after clearing
        await loadSummary();
        await loadAvailableReports();
        await loadProductSales();
      } else {
        throw new Error(result.message || 'Failed to clear bills data');
      }
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
      console.error('Error clearing bills:', err);
    } finally {
      setClearingData(false);
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: isDark ? '#0f0f0f' : '#f8fafc',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: currentTheme.spacing[2]
        }}>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: 500,
            color: isDark ? '#f1f5f9' : '#1e293b',
          }}>
            Loading Analytics
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            Fetching sales data and reports...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: isDark ? '#0f0f0f' : '#f8fafc',
        padding: currentTheme.spacing[8],
      }}>
        <div style={{
          background: isDark ? '#1e293b' : '#ffffff',
          border: `1px solid ${isDark ? '#ef4444' : '#dc2626'}`,
          borderRadius: '12px',
          padding: currentTheme.spacing[6],
          textAlign: 'center',
          maxWidth: '400px',
        }}>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: isDark ? '#ef4444' : '#dc2626',
            marginBottom: currentTheme.spacing[2],
          }}>
            Error Loading Data
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: isDark ? '#94a3b8' : '#64748b',
            marginBottom: currentTheme.spacing[4],
          }}>
            {error}
          </div>
          <Button
            onClick={() => {
              setError('');
              loadSummary();
              loadAvailableReports();
            }}
            variant="primary"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate product sales data
  const totalSales = safeSummary.total_sales || 0;
  const productSalesData = Object.entries(safeSummary.category_totals || {}).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSales > 0 ? (amount / totalSales) * 100 : 0,
    color: CATEGORY_COLORS[category] || '#6b7280',
    name: CATEGORY_NAMES[category] || category
  })).sort((a, b) => b.amount - a.amount);

  // Get individual product sales from bills
  const getProductSalesData = () => {
    const productSales = {};
    
    // This would require additional API call to get detailed product sales
    // For now, we'll show category data as product groups
    return productSalesData;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0f0f0f' : '#f8fafc',
      padding: currentTheme.spacing[8],
      paddingBottom: currentTheme.spacing[12],
    }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          marginBottom: currentTheme.spacing[8],
        }}
      >
        {/* Management-style Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '30px',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderRadius: '20px',
            backgroundColor: currentTheme.colors.Surface,
            margin: '0px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-300)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: 0,
            }}>
              <div style={{
                fontSize: '30px',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                fontWeight: 650,
                color: currentTheme.colors.text.primary,
              }}>
                Analytics
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            {/* Clear Data Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => setShowClearConfirm(true)} variant="secondary" size="lg"
                style={{
                  background: `linear-gradient(135deg, ${isDark ? (currentTheme.colors.error?.[600] || '#DC2626') : (currentTheme.colors.error?.[500] || '#EF4444')}, ${isDark ? (currentTheme.colors.error?.[700] || '#B91C1C') : (currentTheme.colors.error?.[600] || '#DC2626')})`,
                  border: 'none', color: '#ffffff', borderRadius: '12px',
                  padding: `${currentTheme.spacing[3]} ${currentTheme.spacing[6]}`,
                  fontWeight: 600, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2],
                  boxShadow: isDark ? '0 4px 12px rgba(220, 38, 38, 0.2)' : '0 4px 12px rgba(239, 68, 68, 0.15)',
                  transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = isDark ? '0 6px 16px rgba(220, 38, 38, 0.3)' : '0 6px 16px rgba(239, 68, 68, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = isDark ? '0 4px 12px rgba(220, 38, 38, 0.2)' : '0 4px 12px rgba(239, 68, 68, 0.15)';
                }}
              >
                <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrashIcon color="#ffffff" />
                </div>
                Clear Data
              </Button>
            </motion.div>
            
            {/* Refresh Data Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => { loadSummary(); loadAvailableReports(); }} variant="secondary" size="lg"
                style={{
                  background: `linear-gradient(135deg, ${isDark ? currentTheme.colors.primary[600] : currentTheme.colors.primary[500]}, ${isDark ? currentTheme.colors.primary[700] : currentTheme.colors.primary[600]})`,
                  border: 'none', color: '#ffffff', borderRadius: '12px',
                  padding: `${currentTheme.spacing[3]} ${currentTheme.spacing[6]}`,
                  fontWeight: 600, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: currentTheme.spacing[2],
                  boxShadow: isDark ? '0 4px 12px rgba(14, 165, 233, 0.2)' : '0 4px 12px rgba(59, 130, 246, 0.15)',
                  transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = isDark ? '0 6px 16px rgba(14, 165, 233, 0.3)' : '0 6px 16px rgba(59, 130, 246, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = isDark ? '0 4px 12px rgba(14, 165, 233, 0.2)' : '0 4px 12px rgba(59, 130, 246, 0.15)';
                }}
              >
                <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                Refresh Data
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* KPI Cards Section */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{
          marginBottom: currentTheme.spacing[8],
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: currentTheme.spacing[6],
        }}>
          {/* Total Sales KPI Card */}
          <motion.div variants={staggerItem}>
            <motion.div
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{
                backgroundColor: currentTheme.colors.Card,
                borderRadius: '16px',
                padding: currentTheme.spacing[8],
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                boxShadow: isDark ? currentTheme.shadows.cardDark : currentTheme.shadows.card,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Icon Background */}
              <div style={{
                position: 'absolute',
                top: currentTheme.spacing[6],
                right: currentTheme.spacing[6],
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#5898ffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.5,
              }}>
                <TrendingUpIcon  color="#001effff" />
              </div>
              
              {/* Content */}
              <div style={{
                position: 'relative',
                zIndex: 1,
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: isDark ? '#ffffff' : '#1e293b',
                  marginBottom: currentTheme.spacing[3],
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}>
                  {formatCurrency(safeSummary.total_sales || 0)}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: isDark ? '#94a3b8' : '#64748b',
                  marginBottom: currentTheme.spacing[1],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Total Sales
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: isDark ? '#64748b' : '#94a3b8',
                  fontWeight: 400,
                }}>
                  Revenue for {safeSummary.date || 'Today'}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Total Bills KPI Card */}
          <motion.div variants={staggerItem}>
            <motion.div
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{
                backgroundColor: currentTheme.colors.Card,
                borderRadius: '16px',
                padding: currentTheme.spacing[8],
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                boxShadow: isDark ? currentTheme.shadows.cardDark : currentTheme.shadows.card,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Icon Background */}
              <div style={{
                position: 'absolute',
                top: currentTheme.spacing[6],
                right: currentTheme.spacing[6],
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: ' #6bffceff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.4,
              }}>
                <ReceiptIcon color="#00764fff" />
              </div>
              
              {/* Content */}
              <div style={{
                position: 'relative',
                zIndex: 1,
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: isDark ? '#ffffff' : '#1e293b',
                  marginBottom: currentTheme.spacing[3],
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}>
                  {safeSummary.total_bills || 0}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: isDark ? '#94a3b8' : '#64748b',
                  marginBottom: currentTheme.spacing[1],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Total Bills
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: isDark ? '#64748b' : '#94a3b8',
                  fontWeight: 400,
                }}>
                  Orders processed
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Product Sales Breakdown Section */}
      {productSales.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginBottom: currentTheme.spacing[8],
          }}
        >
          <div style={{
            backgroundColor: currentTheme.colors.Surface,
            borderRadius: '20px',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            boxShadow: isDark ? currentTheme.shadows.cardDark : currentTheme.shadows.card,
            padding: currentTheme.spacing[8],
            overflow: 'hidden',
          }}>
            {/* Gradient Header */}
            <div style={{
              background: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              margin: `-${currentTheme.spacing[8]} -${currentTheme.spacing[8]} ${currentTheme.spacing[8]}`,
              padding: `${currentTheme.spacing[5]} ${currentTheme.spacing[8]}`,
              marginBottom: currentTheme.spacing[8],
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderBottom: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: isDark 
                ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: isDark ? '#f1f5f9' : '#1e293b',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                position: 'relative',
                zIndex: 1,
              }}>
                Sales Report
              </h2>
            </div>

            {/* Pie Chart and Products Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: currentTheme.spacing[8],
              alignItems: 'start',
            }}>
              {/* Pie Chart */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  position: 'relative',
                  width: '280px',
                  height: '280px',
                  marginBottom: currentTheme.spacing[4],
                }}>
                  <svg
                    width="280"
                    height="280"
                    viewBox="0 0 280 280"
                    style={{
                      transform: 'rotate(-90deg)',
                    }}
                  >
                    {productSales.map((product, index) => {
                      const totalRevenue = productSales.reduce((sum, p) => sum + p.total_amount, 0);
                      const percentage = (product.total_amount / totalRevenue) * 100;
                      const previousPercentages = productSales.slice(0, index).reduce((sum, p) => sum + (p.total_amount / totalRevenue) * 100, 0);
                      const strokeDasharray = 2 * Math.PI * 120;
                      const strokeDashoffset = 2 * Math.PI * 120 * (1 - percentage / 100);
                      const rotation = (previousPercentages / 100) * 360;
                      
                      // Generate colors dynamically for all products
                      const colors = [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
                        '#14b8a6', '#22c55e', '#eab308', '#dc2626', '#7c3aed',
                        '#0891b2', '#16a34a', '#ca8a04', '#b91c1c', '#6d28d9'
                      ];
                      const color = colors[index % colors.length];
                      
                      return (
                        <circle
                          key={product.product_id}
                          cx="140"
                          cy="140"
                          r="120"
                          fill="none"
                          stroke={color}
                          strokeWidth="40"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          transform={'rotate(' + rotation + ' 140 140)'}
                          style={{
                            transition: 'all 0.5s ease',
                          }}
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Center text */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      marginBottom: currentTheme.spacing[1],
                    }}>
                      {productSales.length}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}>
                      Products
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: currentTheme.spacing[2],
                  justifyContent: 'center',
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}>
                  {productSales.map((product, index) => {
                    const totalRevenue = productSales.reduce((sum, p) => sum + p.total_amount, 0);
                    const percentage = ((product.total_amount / totalRevenue) * 100).toFixed(1);
                    
                    const colors = [
                      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
                      '#14b8a6', '#22c55e', '#eab308', '#dc2626', '#7c3aed',
                      '#0891b2', '#16a34a', '#ca8a04', '#b91c1c', '#6d28d9'
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={product.product_id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: currentTheme.spacing[1],
                      }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: color,
                          flexShrink: 0,
                        }} />
                        <div style={{
                          fontSize: '0.7rem',
                          color: isDark ? '#94a3b8' : '#64748b',
                          whiteSpace: 'nowrap',
                        }}>
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Product Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: currentTheme.spacing[3],
                maxHeight: '400px',
                overflowY: 'auto',
                paddingRight: currentTheme.spacing[2],
              }}>
                {productSales.map((product, index) => (
                  <motion.div
                    key={product.product_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.02, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    whileHover={{ 
                      scale: 1.01,
                      boxShadow: isDark 
                        ? '0 4px 12px rgba(59, 130, 246, 0.2)'
                        : '0 4px 12px rgba(59, 130, 246, 0.1)'
                    }}
                    style={{
                      background: isDark ? '#1e293b' : '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                      padding: currentTheme.spacing[3],
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: currentTheme.spacing[3],
                    }}>
                      {/* Color indicator */}
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: [
                          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
                          '#14b8a6', '#22c55e', '#eab308', '#dc2626', '#7c3aed',
                          '#0891b2', '#16a34a', '#ca8a04', '#b91c1c', '#6d28d9'
                        ][index % 20],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {index + 1}
                      </div>
                      
                      {/* Product info */}
                      <div style={{
                        flex: 1,
                        minWidth: 0,
                      }}>
                        <h3 style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                          margin: 0,
                          marginBottom: currentTheme.spacing[1],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {product.name}
                        </h3>
                        <div style={{
                          fontSize: '0.7rem',
                          color: isDark ? '#94a3b8' : '#64748b',
                          margin: 0,
                        }}>
                          {product.quantity} units
                        </div>
                      </div>
                      
                      {/* Revenue */}
                      <div style={{
                        textAlign: 'right',
                        flexShrink: 0,
                      }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                          marginBottom: currentTheme.spacing[1],
                        }}>
                          {formatCurrency(product.total_amount)}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: isDark ? '#94a3b8' : '#64748b',
                        }}>
                          {((product.total_amount / productSales.reduce((sum, p) => sum + p.total_amount, 0)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reports Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      > 
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: currentTheme.spacing[4],
          }}>
            <Button
              onClick={() => handleDownload('excel', 'detailed', `sales_report_${safeSummary.date || 'today'}.xlsx`)}
              disabled={downloading.excel}
              variant="secondary"
              style={{
                backgroundColor: currentTheme.colors.Card,
                boxShadow: isDark ? currentTheme.shadows.cardDark : currentTheme.shadows.card,
                border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                color: isDark ? '#f1f5f9' : '#475569',
                borderRadius: '12px',
                padding: currentTheme.spacing[4],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: currentTheme.spacing[2],
                fontWeight: 500,
                
              }}
            >
              <DownloadIcon color={isDark ? '#f1f5f9' : '#475569'} />
              {downloading.excel ? 'Downloading...' : 'Excel Sales Report'}
            </Button>
          </div>
        
      </motion.div>

      {/* Clear Data Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => {
              setShowClearConfirm(false);
              setClearPassword('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: isDark ? '#1e293b' : '#ffffff',
                borderRadius: '16px',
                padding: currentTheme.spacing[8],
                maxWidth: '400px',
                width: '90%',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                boxShadow: isDark 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: currentTheme.spacing[3],
                marginBottom: currentTheme.spacing[4],
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrashIcon color="#ef4444" />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: isDark ? '#f1f5f9' : '#1e293b',
                    margin: 0,
                    marginBottom: currentTheme.spacing[1],
                  }}>
                    Clear All Data
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: isDark ? '#94a3b8' : '#64748b',
                    margin: 0,
                  }}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <div style={{
                marginBottom: currentTheme.spacing[6],
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                  lineHeight: 1.5,
                }}>
                  Are you sure you want to delete all bills and sales data? This will permanently remove:
                </p>
                <ul style={{
                  margin: currentTheme.spacing[3] + ' 0 0 ' + currentTheme.spacing[3],
                  paddingLeft: currentTheme.spacing[4],
                  fontSize: '0.875rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                }}>
                  <li>All bills and transactions</li>
                  <li>Sales analytics data</li>
                  <li>Export reports</li>
                </ul>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isDark ? '#ef4444' : '#dc2626',
                  margin: 0,
                }}>
                  Products will remain intact.
                </p>
              </div>
              
              {/* Password Input */}
              <div style={{
                marginBottom: currentTheme.spacing[6],
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  marginBottom: currentTheme.spacing[2],
                }}>
                  Enter Password
                </label>
                <input
                  type="password"
                  value={clearPassword}
                  onChange={(e) => setClearPassword(e.target.value)}
                  placeholder="Enter admin password"
                  style={{
                    width: '100%',
                    padding: currentTheme.spacing[3],
                    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              
              <div style={{
                display: 'flex',
                gap: currentTheme.spacing[3],
                justifyContent: 'flex-end',
              }}>
                <Button
                  onClick={() => {
                    setShowClearConfirm(false);
                    setClearPassword('');
                  }}
                  disabled={clearingData}
                  variant="secondary"
                  style={{
                    background: isDark ? '#334155' : '#f8fafc',
                    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                    color: isDark ? '#f1f5f9' : '#475569',
                    borderRadius: '12px',
                    padding: `${currentTheme.spacing[3]} ${currentTheme.spacing[6]}`,
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleClearBills}
                  disabled={clearingData}
                  variant="secondary"
                  style={{
                    background: isDark ? (currentTheme.colors.error?.[600] || '#DC2626') : (currentTheme.colors.error?.[500] || '#EF4444'),
                    border: `1px solid ${isDark ? (currentTheme.colors.error?.[700] || '#B91C1C') : (currentTheme.colors.error?.[600] || '#DC2626')}`,
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: `${currentTheme.spacing[3]} ${currentTheme.spacing[6]}`,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: currentTheme.spacing[2],
                  }}
                >
                  {clearingData ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <TrashIcon color="#ffffff" />
                      Clear All Data
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
