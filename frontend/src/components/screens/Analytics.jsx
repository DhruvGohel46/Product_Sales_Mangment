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
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';
import api, { summaryAPI, reportsAPI, billingAPI } from '../../utils/api';
import { formatCurrency, handleAPIError, downloadFile } from '../../utils/api';
import { CATEGORY_COLORS, CATEGORY_NAMES, ANIMATION_DURATIONS, EASINGS } from '../../utils/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import AnimatedList from '../ui/AnimatedList';
import GlobalDatePicker from '../ui/GlobalDatePicker';
import '../../styles/Analytics.css';

// ... other imports ...



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

const RefreshIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const [showClearPassword, setShowClearPassword] = useState(false);
  const [clearingData, setClearingData] = useState(false);

  const [productSales, setProductSales] = useState([]);

  // Monthly Export state
  const [exportMonth, setExportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  // Weekly Export state
  const [exportWeekDate, setExportWeekDate] = useState(new Date().toISOString().split('T')[0]);

  // Daily Report state
  const [dailyReportDate, setDailyReportDate] = useState(new Date().toISOString().split('T')[0]);

  // Bill Management State
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Date filter for Bills (defaults to today)
  const [selectedBillDate, setSelectedBillDate] = useState(new Date().toISOString().split('T')[0]);

  // Safeguard so we never read properties from null
  const safeSummary = summary || {};

  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Load data when date changes
  useEffect(() => {
    loadSummary(selectedDate);
    loadAvailableReports();
    loadProductSales(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadBills(selectedBillDate);
  }, [selectedBillDate]);

  async function loadSummary(date) {
    try {
      setLoading(true);
      setError('');

      const response = date
        ? await summaryAPI.getSummaryForDate(date)
        : await summaryAPI.getTodaySummary();
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

  async function loadProductSales(date) {
    try {
      const url = date
        ? `/api/summary/product-sales?date=${date}`
        : '/api/summary/product-sales';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProductSales(data.product_sales);
      }
    } catch (err) {
      console.error('Error loading product sales:', err);
    }
  }

  async function loadBills(date) {
    try {
      setLoadingBills(true);
      // Use specific endpoint for date filtering (defaults to today if date matches or is null)
      const targetDate = date || new Date().toISOString().split('T')[0];
      const url = `/api/bill/date/${targetDate}`;

      const response = await api.get(url);
      if (response.data.success) {
        // Sort bills in descending order by created_at (latest first)
        // ensure created_at is strictly used, fallback to bill_no if created_at is identical
        const sortedBills = response.data.bills.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA || b.bill_no - a.bill_no;
        });
        setBills(sortedBills);
      }
    } catch (err) {
      console.error('Error loading bills:', err);
    } finally {
      setLoadingBills(false);
    }
  }

  const handleEditBill = (bill) => {
    // Only allow editing active bills
    if (bill.status === 'CANCELLED') return;
    navigate('/bill', { state: { bill } });
  };

  const handleCancelBillInitiate = (bill) => {
    setSelectedBill(bill);
    setShowCancelConfirm(true);
  };

  const handleCancelBillConfirm = async () => {
    try {
      if (!selectedBill) return;

      const response = await billingAPI.cancelBill(selectedBill.bill_no);

      if (response.data.success) {
        setShowCancelConfirm(false);
        setSelectedBill(null);
        // Refresh all data
        await Promise.all([
          loadBills(selectedBillDate),
          loadSummary(),
          loadProductSales()
        ]);
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
      console.error("Error cancelling bill", err);
    }
  };

  // Download report
  const handleDownload = async (reportType, reportName, filename, date = null) => {
    try {
      setDownloading(prev => ({ ...prev, [reportType]: true }));
      setError('');

      let response;

      if (reportType === 'excel') {
        response = await reportsAPI.exportTodayExcel('detailed', date);
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

  const handleMonthlyExport = async () => {
    try {
      setDownloading(prev => ({ ...prev, monthly: true }));
      setError('');

      const response = await reportsAPI.exportMonthlyExcel(exportMonth, exportYear);

      if (response && response.data) {
        downloadFile(response.data, `Monthly_Sales_Report_${String(exportMonth).padStart(2, '0')}_${exportYear}.xlsx`);
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
      console.error('Error downloading monthly report:', err);
    } finally {
      setDownloading(prev => ({ ...prev, monthly: false }));
    }
  };

  const handleWeeklyExport = async () => {
    try {
      setDownloading(prev => ({ ...prev, weekly: true }));
      setError('');

      const response = await reportsAPI.exportWeeklyExcel(exportWeekDate);

      // Filename is handled by backend, but we can set a fallback here if needed.
      const d = new Date(exportWeekDate);
      const day = d.getDay() || 7; // Get current day number, converting Sun (0) to 7
      if (day !== 1) d.setHours(-24 * (day - 1)); // Set to Monday

      const start = new Date(d);
      const end = new Date(d);
      end.setDate(end.getDate() + 6);

      const sStr = `${String(start.getDate()).padStart(2, '0')}${String(start.getMonth() + 1).padStart(2, '0')}${start.getFullYear()}`;
      const eStr = `${String(end.getDate()).padStart(2, '0')}${String(end.getMonth() + 1).padStart(2, '0')}${end.getFullYear()}`;
      const filename = `Weekly_Sales_Report_${sStr}_to_${eStr}.xlsx`;

      if (response && response.data) {
        downloadFile(response.data, filename);
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
      console.error('Error downloading weekly report:', err);
    } finally {
      setDownloading(prev => ({ ...prev, weekly: false }));
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
        await loadBills(selectedBillDate);
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

  // Format time for display (handles UTC to Local conversion)
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      // SQLite TIMESTAMP is stored in UTC.
      // We append 'Z' or use Date.UTC to ensure JavaScript parses it as UTC.
      // Format: YYYY-MM-DD HH:MM:SS
      const utcDate = new Date(timestamp.replace(' ', 'T') + 'Z');
      return utcDate.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      console.error('Error formatting time:', err);
      return timestamp;
    }
  };

  // Format date for display (handles UTC to Local conversion)
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const utcDate = new Date(timestamp.replace(' ', 'T') + 'Z');
      return utcDate.toLocaleDateString();
    } catch (err) {
      return timestamp.split(' ')[0];
    }
  };

  // ... (imports remain same)

  // Loading state with Skeleton
  if (loading) {
    return (
      <div style={{
        height: '100%',
        overflowY: 'auto',
        background: currentTheme.colors.background,
        paddingTop: currentTheme.spacing[8],
        paddingLeft: currentTheme.spacing[8],
        paddingRight: currentTheme.spacing[8],
        paddingBottom: currentTheme.spacing[12],
      }}>
        {/* Header Skeleton */}
        <div style={{ marginBottom: currentTheme.spacing[8], display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton height="80px" width="40%" borderRadius="20px" />
          <div style={{ display: 'flex', gap: '12px' }}>
            <Skeleton height="50px" width="140px" borderRadius="12px" />
            <Skeleton height="50px" width="140px" borderRadius="12px" />
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: currentTheme.spacing[6],
          marginBottom: currentTheme.spacing[8],
        }}>
          {[...Array(3)].map((_, i) => (
            <Card key={i} style={{ height: '160px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '60%' }}>
                  <Skeleton height="20px" width="80px" style={{ marginBottom: '10px' }} />
                  <Skeleton height="40px" width="120px" />
                </div>
                <Skeleton height="48px" width="48px" borderRadius="12px" />
              </div>
              <Skeleton height="16px" width="100%" />
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: currentTheme.spacing[6] }}>
          <Card style={{ height: '400px' }}>
            <Skeleton height="100%" width="100%" />
          </Card>
          <Card style={{ height: '400px' }}>
            <Skeleton height="100%" width="100%" />
          </Card>
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
        background: currentTheme.colors.background,
        padding: currentTheme.spacing[8],
      }}>
        <div style={{
          background: currentTheme.colors.surface,
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

  // Calculate colors dynamically based on theme
  const COLORS = [
    // Primary Theme Colors (Orange)
    currentTheme.colors.primary[500],
    currentTheme.colors.primary[600],
    currentTheme.colors.primary[400],

    // Semantic Colors
    currentTheme.colors.success[500],   // Green
    currentTheme.colors.warning[500],   // Amber
    currentTheme.colors.info[500],      // Blue
    currentTheme.colors.error[500],     // Red

    // Secondary/Neutral
    currentTheme.colors.neutral[600],   // Gray
    currentTheme.colors.neutral[500],

    // Variations
    currentTheme.colors.success[600],
    currentTheme.colors.warning[600],
    currentTheme.colors.info[600],
    currentTheme.colors.error[600],

    // Extended Palette (complementary to Orange)
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F43F5E', // Rose
    '#6366F1', // Indigo
  ];

  return (
    <div className="analytics-page">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="analytics-header-container"
      >
        {/* Management-style Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="analytics-header-card"
        >
          <div className="analytics-title-wrapper">
            <div className="analytics-title">
              Analytics
            </div>
          </div>


          <div className="analytics-btn-group">
            {/* Clear Data Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => setShowClearConfirm(true)} variant="secondary" size="lg"
                className="analytics-action-btn"
                style={{
                  background: `linear-gradient(135deg, ${isDark ? (currentTheme.colors.error?.[600] || '#DC2626') : (currentTheme.colors.error?.[500] || '#EF4444')}, ${isDark ? (currentTheme.colors.error?.[700] || '#B91C1C') : (currentTheme.colors.error?.[600] || '#DC2626')})`,
                  boxShadow: isDark ? '0 4px 12px rgba(220, 38, 38, 0.2)' : '0 4px 12px rgba(239, 68, 68, 0.15)',
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
                className="analytics-action-btn"
                style={{
                  background: `linear-gradient(135deg, ${isDark ? currentTheme.colors.primary[600] : currentTheme.colors.primary[500]}, ${isDark ? currentTheme.colors.primary[700] : currentTheme.colors.primary[600]})`,
                  boxShadow: isDark ? '0 4px 12px rgba(14, 165, 233, 0.2)' : '0 4px 12px rgba(59, 130, 246, 0.15)',
                }}
              >
                <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshIcon color="#ffffff" />
                </div>
                Refresh Data
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* KPI Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="analytics-kpi-grid"
      >
        {/* Total Sales Card */}
        <Card>
          <div className="kpi-card-header">
            <div>
              <p className="kpi-label">
                Net Sales
              </p>
              <h3 className="kpi-value">
                {formatCurrency(safeSummary.total_sales || 0)}
              </h3>
            </div>
            <div className="kpi-icon-wrapper" style={{
              background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
            }}>
              <TrendingUpIcon color={isDark ? '#34d399' : '#059669'} />
            </div>
          </div>
          <div className="kpi-subtext">
            <span>
              Total revenue for today
            </span>
          </div>
        </Card>

        {/* Total Orders Card */}
        <Card>
          <div className="kpi-card-header">
            <div>
              <p className="kpi-label">
                Total Orders
              </p>
              <h3 className="kpi-value">
                {safeSummary.total_bills || 0}
              </h3>
            </div>
            <div className="kpi-icon-wrapper" style={{
              background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
            }}>
              <ReceiptIcon color={isDark ? '#60a5fa' : '#2563eb'} />
            </div>
          </div>
          <div className="kpi-subtext">
            <span>
              Bills generated today
            </span>
          </div>
        </Card>

        {/* Average Order Value Card */}
        <Card>
          <div className="kpi-card-header">
            <div>
              <p className="kpi-label">
                Avg. Order Value
              </p>
              <h3 className="kpi-value">
                {formatCurrency(safeSummary.average_bill_value || 0)}
              </h3>
            </div>
            <div className="kpi-icon-wrapper" style={{
              background: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb',
            }}>
              <DollarSignIcon color={isDark ? '#fbbf24' : '#d97706'} />
            </div>
          </div>
          <div className="kpi-subtext">
            <span>
              Per transaction average
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Product Sales Breakdown Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          marginBottom: currentTheme.spacing[8],
        }}
      >
        <Card>
          {/* ... (Header remains same) ... */}
          <div className="analytics-header-container" style={{ marginBottom: currentTheme.spacing[6] }}>
            <div style={{
              position: 'relative',
              paddingLeft: currentTheme.spacing[4],
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4px',
                height: '24px',
                background: `linear-gradient(to bottom, ${currentTheme.colors.primary[500]}, ${currentTheme.colors.primary[600]})`,
                borderRadius: '2px',
              }} />
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
                Product Sales Breakdown
              </h2>
            </div>
          </div>

          {/* Pie Chart and Products Grid */}
          {productSales.length > 0 ? (
            <div className="analytics-chart-grid">
              {/* Pie Chart */}
              <div className="chart-card" style={{ height: 'auto', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: '320px',
                  height: '320px',
                  marginBottom: currentTheme.spacing[4],
                }}>
                  <svg
                    width="320"
                    height="320"
                    viewBox="0 0 320 320"
                    style={{
                      transform: 'rotate(-90deg)',
                      overflow: 'visible',
                    }}
                  >
                    {productSales.map((product, index) => {
                      const totalRevenue = productSales.reduce((sum, p) => sum + p.total_amount, 0);
                      const percentage = (product.total_amount / totalRevenue) * 100;
                      const previousPercentages = productSales.slice(0, index).reduce((sum, p) => sum + (p.total_amount / totalRevenue) * 100, 0);

                      // Radius calculations
                      const baseRadius = 120;
                      const isHovered = hoveredProduct === index;
                      const radius = isHovered ? 125 : 120; // Scale up on hover
                      const strokeWidth = isHovered ? 45 : 35; // Thicker on hover

                      const circumference = 2 * Math.PI * baseRadius; // Use base radius for calculation consistency
                      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                      const rotation = (previousPercentages / 100) * 360;

                      // Add gap by reducing the stroke length slightly
                      // We do this by adjusting the strokeDasharray's first value slightly down
                      // But for gaps between segments in a single circle, simpler to use transparent borders or multiple paths.
                      // With stroke-dasharray on circle, adding gap is tricky. 
                      // Alternative: Use a slightly smaller dash and a larger gap.
                      const gapSize = 4; // px
                      const dashLength = ((percentage / 100) * circumference) - gapSize;
                      const adjustedDashArray = `${Math.max(0, dashLength)} ${circumference - Math.max(0, dashLength)}`;

                      const color = COLORS[index % COLORS.length];

                      return (
                        <circle
                          key={product.product_id}
                          cx="160"
                          cy="160"
                          r={radius} // Use dynamic radius
                          fill="none"
                          stroke={color}
                          strokeWidth={strokeWidth}
                          strokeDasharray={adjustedDashArray}
                          strokeDashoffset={-gapSize / 2} // Offset to center the gap
                          transform={`rotate(${rotation} 160 160)`}
                          style={{
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring-like transition
                            cursor: 'pointer',
                            filter: isHovered ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3))' : 'none',
                            opacity: hoveredProduct !== null && !isHovered ? 0.6 : 1, // Dim others
                          }}
                          onMouseEnter={() => setHoveredProduct(index)}
                          onMouseLeave={() => setHoveredProduct(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Interactive Center text */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none', // Allow clicks to pass through
                  }}>
                    <AnimatePresence mode="wait">
                      {hoveredProduct !== null ? (
                        <motion.div
                          key="hovered"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: isDark ? '#94a3b8' : '#64748b',
                            marginBottom: '4px',
                            maxWidth: '120px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: '0 auto',
                          }}>
                            {productSales[hoveredProduct].name}
                          </div>
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: isDark ? '#f1f5f9' : '#1e293b',
                            lineHeight: 1,
                          }}>
                            {((productSales[hoveredProduct].total_amount / productSales.reduce((sum, p) => sum + p.total_amount, 0)) * 100).toFixed(1)}%
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: isDark ? '#64748b' : '#94a3b8',
                            marginTop: '2px',
                          }}>
                            {formatCurrency(productSales[hoveredProduct].total_amount)}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Legend */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: currentTheme.spacing[3], // Increased gap
                  justifyContent: 'center',
                  padding: '4px', // Space for focus ring/shadow
                }}>
                  {productSales.map((product, index) => {
                    const totalRevenue = productSales.reduce((sum, p) => sum + p.total_amount, 0);
                    const percentage = ((product.total_amount / totalRevenue) * 100).toFixed(1);
                    const color = COLORS[index % COLORS.length]; // Use constant colors
                    const isHovered = hoveredProduct === index;

                    return (
                      <div
                        key={product.product_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: currentTheme.spacing[1.5],
                          cursor: 'pointer',
                          opacity: hoveredProduct !== null && !isHovered ? 0.5 : 1,
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: isHovered ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : 'transparent',
                        }}
                        onMouseEnter={() => setHoveredProduct(index)}
                        onMouseLeave={() => setHoveredProduct(null)}
                      >
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: color,
                          flexShrink: 0,
                          boxShadow: isHovered ? `0 0 8px ${color}` : 'none',
                          transition: 'box-shadow 0.2s ease',
                        }} />
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: isDark ? '#94a3b8' : '#64748b',
                          whiteSpace: 'nowrap',
                          margin: ' 0 5px',
                        }}>
                          {product.name} -
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: isDark ? '#f1f5f9' : '#1e293b',
                        }}>
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Product Cards Grid */}
              <AnimatedList
                items={productSales}
                onItemSelect={(product, index) => {
                  console.log('Selected product:', product, index);
                }}
                showGradients={false}
                displayScrollbar={false}
                enableArrowNavigation
                className="product-list"
                itemClassName="product-item"
              >
                {(product, index) => (
                  <div className="ranking-item">
                    <div className="ranking-info" style={{ flex: 1, minWidth: 0 }}>
                      <div className="ranking-badge" style={{ background: COLORS[index % COLORS.length], border: 'none', color: '#ffffff' }}>
                        {index + 1}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <h3 className="ranking-name">
                          {product.name}
                        </h3>
                        <div className="ranking-qty">
                          {product.quantity} units
                        </div>
                      </div>
                    </div>

                    <div className="ranking-meta">
                      <div className="ranking-amount">
                        {formatCurrency(product.total_amount)}
                      </div>
                      <div className="ranking-qty">
                        {((product.total_amount / productSales.reduce((sum, p) => sum + p.total_amount, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </AnimatedList>
            </div >
          ) : (
            <div style={{
              textAlign: 'center',
              padding: currentTheme.spacing[8],
              color: isDark ? '#94a3b8' : '#64748b',
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: currentTheme.spacing[4],
                opacity: 0.5,
              }}>
                📊
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: isDark ? '#f1f5f9' : '#1e293b',
                marginBottom: currentTheme.spacing[2],
              }}>
                No Product Sales Data
              </h3>
              <p style={{
                fontSize: '0.875rem',
                margin: 0,
                lineHeight: 1.6,
              }}>
                Start creating bills to see product sales breakdown here.
                The pie chart and product list will appear once you have sales data.
              </p>
            </div>
          )
          }
        </Card >
      </motion.div >



      {/* Bill Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          marginBottom: currentTheme.spacing[8],
          marginTop: currentTheme.spacing[8],
        }}
      >
        <Card>
          <div className="bill-management-header">
            <div className="bill-header-left">
              <div className="bill-header-accent" />
              <h2 className="bill-header-title">
                Bill Management
                <span className="bill-header-badge">
                  Showing: {selectedBillDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedBillDate}
                </span>
              </h2>
            </div>

            <div className="bill-header-controls">
              {/* Today Button */}
              <button
                onClick={() => setSelectedBillDate(new Date().toISOString().split('T')[0])}
                className={`bill-control-btn ghost ${selectedBillDate === new Date().toISOString().split('T')[0] ? 'active' : ''}`}
              >
                Today
              </button>

              {/* Date Picker */}
              <input
                type="date"
                value={selectedBillDate}
                onChange={(e) => setSelectedBillDate(e.target.value)}
                className="bill-date-input"
              />

              {/* Refresh Button */}
              <button
                onClick={() => loadBills(selectedBillDate)}
                className="bill-control-btn secondary"
                disabled={loadingBills}
              >
                <div style={{
                  display: 'flex',
                  animation: loadingBills ? 'spin 1s linear infinite' : 'none'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12a8 8 0 018-8c4.418 0 8 3.582 8 8s-3.582 8-8 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                Refresh
              </button>
            </div>
          </div>

          <div style={{
            marginTop: currentTheme.spacing[4],
            position: 'relative',
          }}>
            {bills.length > 0 ? (
              <AnimatedList
                key={`bill-list-${loadingBills ? 'loading' : 'ready'}`}
                items={bills}
                className="bill-list-animated"
                showGradients={false}
                displayScrollbar={false}
              >
                {(bill, index) => {
                  const isCancelled = bill.status === 'CANCELLED';
                  const statusText = (!bill.status || bill.status === 'ACTIVE') ? 'CONFIRMED' : bill.status;

                  return (
                    <div
                      key={bill.bill_no}
                      onClick={() => !isCancelled && handleEditBill(bill)}
                      className={`bill-item ${isCancelled ? 'cancelled' : ''}`}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        opacity: isCancelled ? 0.6 : 1,
                        cursor: isCancelled ? 'default' : 'pointer'
                      }}
                    >


                      {/* Bill Info */}
                      <div className="bill-info-left" style={{ flex: '1', minWidth: '150px' }}>
                        <div className="bill-id">
                          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{bill.bill_no}</span>
                          <div className="bill-status-badge" style={{
                            backgroundColor: isCancelled ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2') : (isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7'),
                            color: isCancelled ? (isDark ? '#fca5a5' : '#ef4444') : (isDark ? '#86efac' : '#16a34a'),
                            border: `1px solid ${isCancelled ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fca5a5') : (isDark ? 'rgba(34, 197, 94, 0.2)' : '#86efac')}`
                          }}>
                            {statusText}
                          </div>
                        </div>

                        <div className="bill-meta">
                          <ClockIcon color={isDark ? currentTheme.colors.primary[500] : currentTheme.colors.primary[600]} size={14} />
                          {formatDate(bill.created_at)} • {formatTime(bill.created_at)} • <span>{bill.items?.length || 0} items</span>
                        </div>
                      </div>

                      <div className="bill-info-right">
                        <div className="bill-total">
                          {formatCurrency(bill.total_amount)}
                        </div>

                        <div className="bill-actions">
                          <button
                            className="bill-action-btn edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBill(bill);
                            }}
                            disabled={isCancelled}
                            title="Edit Bill"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                          </button>
                          <button
                            className="bill-action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBill(bill);
                              setShowCancelConfirm(true);
                            }}
                            disabled={isCancelled}
                            title="Cancel Bill"
                          >
                            <TrashIcon color="currentColor" size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </AnimatedList>
            ) : (
              <div className="empty-bills">
                <div style={{ marginBottom: currentTheme.spacing[4], opacity: 0.5 }}>
                  <ReceiptIcon color="currentColor" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  {loadingBills ? 'Loading transaction records...' : `No bills found for ${selectedBillDate === new Date().toISOString().split('T')[0] ? 'today' : selectedBillDate}`}
                </h3>
                <p style={{ margin: `${currentTheme.spacing[2]} 0 0`, fontSize: '0.875rem' }}>
                  {loadingBills ? 'Please wait while we fetch the latest data.' : 'Your transaction history will appear here once orders are processed.'}
                </p>
              </div>
            )}
          </div>
        </Card >
      </motion.div >
      {/* Reports Section */}
      < motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card>
          <div className="analytics-header-container" style={{ marginBottom: currentTheme.spacing[6] }}>
            <div style={{
              position: 'relative',
              paddingLeft: currentTheme.spacing[4],
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4px',
                height: '24px',
                background: `linear-gradient(to bottom, ${currentTheme.colors.primary[500]}, ${currentTheme.colors.primary[600]})`,
                borderRadius: '2px',
              }} />
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: isDark ? currentTheme.colors.text.primary : currentTheme.colors.text.primary,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                position: 'relative',
                zIndex: 1,
              }}>
                Sales Reports
              </h2>
            </div>
          </div>

          <div className="analytics-report-grid">
            {/* Daily Report Section */}
            <div className="report-card-content">
              <div className="report-header">
                <div className="report-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.695 13.7h.009M15.695 16.7h.009M11.995 13.7h.01M11.995 16.7h.01M8.294 13.7h.01M8.294 16.7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="report-title-group">
                  <h3 className="report-title">Daily Report</h3>
                  <p className="report-desc">Sales summary for selected date</p>
                </div>
              </div>

              {/* Date Selection */}
              <div className="report-controls">
                <label className="report-label">Select Date</label>
                <GlobalDatePicker
                  value={dailyReportDate}
                  onChange={(val) => setDailyReportDate(val)}
                  placeholder="Select Date"
                  className="report-select-override"
                />
              </div>

              <div className="report-actions">
                <button
                  className="report-btn report-btn-primary"
                  onClick={() => handleDownload('excel', 'detailed', `sales_report_${dailyReportDate}.xlsx`, dailyReportDate)}
                  disabled={downloading.excel}
                >
                  <DownloadIcon color="#ffffff" />
                  {downloading.excel ? 'Downloading...' : 'Download Report'}
                </button>
              </div>
            </div>

            {/* Monthly Report Section */}
            <div className="report-card-content">
              <div className="report-header">
                <div className="report-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.695 13.7h.009M15.695 16.7h.009M11.995 13.7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="report-title-group">
                  <h3 className="report-title">Monthly Report</h3>
                  <p className="report-desc">Full month sales analysis</p>
                </div>
              </div>

              <div className="report-controls">
                <label className="report-label">Select Month</label>
                <GlobalDatePicker
                  type="month"
                  value={exportMonth}
                  onChange={(val) => setExportMonth(val)}
                  placeholder="Select Month"
                  className="report-select-override"
                />
              </div>

              <div className="report-actions">
                <button
                  className="report-btn report-btn-primary"
                  onClick={() => handleDownload('excel', 'monthly', `monthly_sales_${exportMonth}.xlsx`, exportMonth)}
                  disabled={downloading.monthly}
                >
                  <DownloadIcon color="#ffffff" />
                  {downloading.monthly ? 'Downloading...' : 'Download Monthly Report'}
                </button>
              </div>
            </div>

            {/* Weekly Report Section */}
            <div className="report-card-content">
              <div className="report-header">
                <div className="report-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.695 13.7h.009M15.695 16.7h.009M11.995 13.7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="report-title-group">
                  <h3 className="report-title">Weekly Report</h3>
                  <p className="report-desc">Select reference date</p>
                </div>
              </div>

              <div className="report-controls">
                <label className="report-label">
                  Select Reference Date
                </label>
                <GlobalDatePicker
                  value={exportWeekDate}
                  onChange={(val) => setExportWeekDate(val)}
                  placeholder="Select Date"
                  className="report-select-override"
                />
              </div>

              <div className="report-actions">
                <button
                  className="report-btn report-btn-primary"
                  onClick={handleWeeklyExport}
                  disabled={downloading.weekly}
                >
                  <DownloadIcon color="#ffffff" />
                  {downloading.weekly ? 'Downloading...' : 'Download Weekly Report'}
                </button>
              </div>
            </div>
          </div>
        </Card>

      </motion.div >
      {/* Clear Data Confirmation Modal */}
      < AnimatePresence >
        {showClearConfirm && (
          <motion.div
            className="pmOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowClearConfirm(false);
              setClearPassword('');
            }}
          >
            <motion.div
              className="pmDialog"
              initial={{ y: 20, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pmDialogTitle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Clear All Data?
              </div>
              <div className="pmDialogBody">
                This will permanently delete all bills and sales data. This action cannot be undone.
                <div style={{ marginTop: '16px', position: 'relative' }}>
                  <input
                    type={showClearPassword ? "text" : "password"}
                    className="pmInput"
                    placeholder="Enter password to confirm"
                    value={clearPassword}
                    onChange={(e) => setClearPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleClearBills()}
                    autoFocus
                    style={{ width: '100%', textAlign: 'center', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowClearPassword(!showClearPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.6
                    }}
                  >
                    {showClearPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.826M9.363 5.365A9.466 9.466 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.658 2.366M6.632 6.632A9.466 9.466 0 005 12s3 7 7 7a9.466 9.466 0 005.368-1.632" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="pmDialogActions">
                <button
                  className="pmDialogBtn"
                  onClick={() => {
                    setShowClearConfirm(false);
                    setClearPassword('');
                  }}
                >
                  Cancel
                </button>
                <button className="pmDialogBtn pmDialogBtnPrimary" onClick={handleClearBills}>
                  {clearingData ? 'Clearing...' : 'Clear All Data'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >

      {/* Cancel Bill Confirmation Modal */}
      < AnimatePresence >
        {showCancelConfirm && (
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
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
            }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: currentTheme.colors.surface,
                borderRadius: '16px',
                padding: currentTheme.spacing[8],
                maxWidth: '400px',
                width: '90%',
                border: `1px solid ${currentTheme.colors.border}`,
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
                    color: currentTheme.colors.text.primary,
                    margin: 0,
                    marginBottom: currentTheme.spacing[1],
                  }}>
                    Cancel Bill
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: currentTheme.colors.text.secondary,
                    margin: 0,
                  }}>
                    Caution: This affects sales reports
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: currentTheme.spacing[6] }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                  lineHeight: 1.5,
                }}>
                  Are you sure you want to cancel <strong>Bill #{selectedBill?.bill_no}</strong>?
                </p>
                <ul style={{
                  margin: currentTheme.spacing[3] + ' 0 0 ' + currentTheme.spacing[3],
                  paddingLeft: currentTheme.spacing[4],
                  fontSize: '0.875rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                }}>
                  <li>Bill amount will be deducted from sales totals.</li>
                  <li>Bill status will change to "CANCELLED".</li>
                </ul>
              </div>

              <div style={{
                display: 'flex',
                gap: currentTheme.spacing[3],
                justifyContent: 'flex-end',
              }}>
                <Button
                  onClick={() => setShowCancelConfirm(false)}
                  variant="secondary"
                  style={{
                    background: currentTheme.colors.background,
                    border: `1px solid ${currentTheme.colors.border}`,
                    color: currentTheme.colors.text.secondary,
                    borderRadius: '12px',
                    padding: `${currentTheme.spacing[3]} ${currentTheme.spacing[6]}`,
                    fontWeight: 500,
                  }}
                >
                  Keep Bill
                </Button>
                <Button
                  onClick={handleCancelBillConfirm}
                  variant="secondary"
                  style={{
                    background: currentTheme.colors.error.primary,
                    border: `1px solid ${currentTheme.colors.error.primary}`,
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: `${currentTheme.spacing[3]} ${currentTheme.spacing[6]}`,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: currentTheme.spacing[2],
                  }}
                >
                  <TrashIcon color="#ffffff" />
                  Confirm Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
    </div >
  );
};

export default Reports;
