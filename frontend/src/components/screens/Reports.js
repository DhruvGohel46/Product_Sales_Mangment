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

const ActivityIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownloadIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FileIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Reports = () => {
  const { currentTheme, isDark } = useTheme();
  const { cardVariants, staggerContainer, staggerItem } = useAnimation();
  
  // Summary state
  const [summary, setSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  // Reports state
  const [availableReports, setAvailableReports] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [error, setError] = useState('');

  // Load both summary and reports data
  useEffect(() => {
    loadSummary();
    loadAvailableReports();
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

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ANIMATION_DURATIONS.NORMAL, ease: EASINGS.EASE_OUT }}
      >
        <Card variant="error" padding="xl" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: currentTheme.borderRadius.xl,
              backgroundColor: currentTheme.colors.error[50],
              margin: `0 auto ${currentTheme.spacing[6]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: currentTheme.colors.error[600] }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={{ 
              fontSize: currentTheme.typography.fontSize['2xl'],
              fontWeight: currentTheme.typography.fontWeight.semibold,
              color: currentTheme.colors.error[600], 
              marginBottom: currentTheme.spacing[3] 
            }}>
              Error Loading Analytics
            </h3>
            <p style={{ 
              fontSize: currentTheme.typography.fontSize.base,
              color: currentTheme.colors.error[500], 
              marginBottom: currentTheme.spacing[6],
              lineHeight: currentTheme.typography.lineHeight.relaxed,
            }}>
              {error}
            </p>
            <Button 
              onClick={() => {
                loadSummary();
                loadAvailableReports();
              }} 
              variant="primary" 
              size="lg"
              style={{
                boxShadow: currentTheme.shadows.md,
              }}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Loading state with modern spinner
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: currentTheme.spacing[6]
      }}>
        <motion.div
          style={{
            width: '48px',
            height: '48px',
            border: `3px solid ${isDark ? currentTheme.colors.border : currentTheme.colors.primary[200]}`,
            borderTop: `3px solid ${currentTheme.colors.primary[600]}`,
            borderRadius: '50%',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: currentTheme.spacing[2]
        }}>
          <div style={{
            fontSize: currentTheme.typography.fontSize.lg,
            fontWeight: currentTheme.typography.fontWeight.medium,
            color: currentTheme.colors.text.primary,
          }}>
            Loading Analytics
          </div>
          <div style={{
            fontSize: currentTheme.typography.fontSize.sm,
            color: currentTheme.colors.text.secondary,
          }}>
            Fetching sales data and reports...
          </div>
        </div>
      </div>
    );
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

  // Download report
  const handleDownload = async (reportType, reportName, filename) => {
    try {
      setDownloading(prev => ({ ...prev, [reportType]: true }));
      setError('');
      
      let response;
      
      if (reportType === 'excel') {
        response = await reportsAPI.exportTodayExcel('detailed');
      } else if (reportType === 'xml') {
        response = await reportsAPI.exportTodayXML();
      }
      
      // Download the file
      const blob = new Blob([response.data]);
      downloadFile(blob, filename);
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    } finally {
      setDownloading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  // Preview report
  const handlePreview = async (reportType) => {
    try {
      setError('');
      
      let response;
      
      if (reportType === 'excel') {
        response = await reportsAPI.previewExcel();
      } else if (reportType === 'xml') {
        response = await reportsAPI.previewXML();
      }
      
      // Show preview in a new window
      const previewWindow = window.open('', '_blank');
      if (reportType === 'xml') {
        previewWindow.document.write(`<pre>${response.data.preview}</pre>`);
      } else {
        previewWindow.document.write(`<pre>${response.data.preview}</pre>`);
      }
      previewWindow.document.title = `${reportType.toUpperCase()} Preview`;
      
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ANIMATION_DURATIONS.NORMAL }}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: currentTheme.spacing[8],
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: ANIMATION_DURATIONS.NORMAL, ease: EASINGS.EASE_OUT }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: currentTheme.spacing[6],
        }}>
          <div>
            <h1 style={{ 
              fontSize: currentTheme.typography.fontSize['4xl'],
              fontWeight: currentTheme.typography.fontWeight.bold,
              color: currentTheme.colors.text.primary,
              marginBottom: currentTheme.spacing[2],
              letterSpacing: currentTheme.typography.letterSpacing.tight,
            }}>
              Analytics & Reports
            </h1>
            <p style={{ 
              fontSize: currentTheme.typography.fontSize.lg,
              color: currentTheme.colors.text.secondary,
              fontWeight: currentTheme.typography.fontWeight.normal,
            }}>
              Daily sales overview and export reports
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={() => {
                loadSummary();
                loadAvailableReports();
              }} 
              variant="secondary" 
              size="lg"
              style={{
                boxShadow: currentTheme.shadows.sm,
                border: `1px solid ${currentTheme.colors.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: currentTheme.spacing[2],
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Refresh All
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[8] }}>
        <p style={{ 
          fontSize: currentTheme.typography.fontSize.lg,
          color: currentTheme.colors.text.secondary,
          fontWeight: currentTheme.typography.fontWeight.normal,
        }}>
          Sales overview for {summary.date || 'Today'}
        </p>

        {/* Key Metrics Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: currentTheme.spacing[6],
          }}
        >
          {/* Total Sales Card */}
          <motion.div variants={staggerItem}>
            <motion.div
              whileHover={{ 
                y: -4,
                boxShadow: currentTheme.shadows.lg,
              }}
              transition={{ duration: ANIMATION_DURATIONS.FAST, ease: EASINGS.EASE_OUT }}
            >
              <Card 
                variant="elevated" 
                padding="xl" 
                style={{ 
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${currentTheme.colors.surface} 0%, ${isDark ? currentTheme.colors.surface : '#FFFFFF'} 100%)`,
                  border: `1px solid ${currentTheme.colors.border}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: currentTheme.spacing[4],
                  right: currentTheme.spacing[4],
                  opacity: 0.1,
                }}>
                  <TrendingUpIcon color={currentTheme.colors.primary[600]} />
                </div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: currentTheme.typography.fontSize['4xl'],
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    color: currentTheme.colors.primary[600],
                    marginBottom: currentTheme.spacing[3],
                    lineHeight: 1,
                  }}>
                    {formatCurrency(summary.total_sales || 0)}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: currentTheme.spacing[2],
                    marginBottom: currentTheme.spacing[2],
                  }}>
                    <TrendingUpIcon color={currentTheme.colors.primary[600]} />
                    <h3 style={{ 
                      fontSize: currentTheme.typography.fontSize.lg,
                      fontWeight: currentTheme.typography.fontWeight.semibold,
                      color: currentTheme.colors.text.primary,
                      margin: 0,
                    }}>
                      Total Sales
                    </h3>
                  </div>
                  <div style={{
                    fontSize: currentTheme.typography.fontSize.sm,
                    color: currentTheme.colors.text.secondary,
                    fontWeight: currentTheme.typography.fontWeight.medium,
                  }}>
                    Today
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Total Bills Card */}
          <motion.div variants={staggerItem}>
            <motion.div
              whileHover={{ 
                y: -4,
                boxShadow: currentTheme.shadows.lg,
              }}
              transition={{ duration: ANIMATION_DURATIONS.FAST, ease: EASINGS.EASE_OUT }}
            >
              <Card 
                variant="elevated" 
                padding="xl" 
                style={{ 
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${currentTheme.colors.surface} 0%, ${isDark ? currentTheme.colors.surface : '#FFFFFF'} 100%)`,
                  border: `1px solid ${currentTheme.colors.border}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: currentTheme.spacing[4],
                  right: currentTheme.spacing[4],
                  opacity: 0.1,
                }}>
                  <ReceiptIcon color={currentTheme.colors.success[600]} />
                </div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: currentTheme.typography.fontSize['4xl'],
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    color: currentTheme.colors.success[600],
                    marginBottom: currentTheme.spacing[3],
                    lineHeight: 1,
                  }}>
                    {summary.total_bills || 0}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: currentTheme.spacing[2],
                    marginBottom: currentTheme.spacing[2],
                  }}>
                    <ReceiptIcon color={currentTheme.colors.success[600]} />
                    <h3 style={{ 
                      fontSize: currentTheme.typography.fontSize.lg,
                      fontWeight: currentTheme.typography.fontWeight.semibold,
                      color: currentTheme.colors.text.primary,
                      margin: 0,
                    }}>
                      Total Bills
                    </h3>
                  </div>
                  <div style={{
                    fontSize: currentTheme.typography.fontSize.sm,
                    color: currentTheme.colors.text.secondary,
                    fontWeight: currentTheme.typography.fontWeight.medium,
                  }}>
                    Transactions today
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Average Bill Value Card */}
          <motion.div variants={staggerItem}>
            <motion.div
              whileHover={{ 
                y: -4,
                boxShadow: currentTheme.shadows.lg,
              }}
              transition={{ duration: ANIMATION_DURATIONS.FAST, ease: EASINGS.EASE_OUT }}
            >
              <Card 
                variant="elevated" 
                padding="xl" 
                style={{ 
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${currentTheme.colors.surface} 0%, ${isDark ? currentTheme.colors.surface : '#FFFFFF'} 100%)`,
                  border: `1px solid ${currentTheme.colors.border}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: currentTheme.spacing[4],
                  right: currentTheme.spacing[4],
                  opacity: 0.1,
                }}>
                  <DollarSignIcon color={currentTheme.colors.warning[600]} />
                </div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: currentTheme.typography.fontSize['4xl'],
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    color: currentTheme.colors.warning[600],
                    marginBottom: currentTheme.spacing[3],
                    lineHeight: 1,
                  }}>
                    {formatCurrency(summary.average_bill_value || 0)}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: currentTheme.spacing[2],
                    marginBottom: currentTheme.spacing[2],
                  }}>
                    <DollarSignIcon color={currentTheme.colors.warning[600]} />
                    <h3 style={{ 
                      fontSize: currentTheme.typography.fontSize.lg,
                      fontWeight: currentTheme.typography.fontWeight.semibold,
                      color: currentTheme.colors.text.primary,
                      margin: 0,
                    }}>
                      Average Bill
                    </h3>
                  </div>
                  <div style={{
                    fontSize: currentTheme.typography.fontSize.sm,
                    color: currentTheme.colors.text.secondary,
                    fontWeight: currentTheme.typography.fontWeight.medium,
                  }}>
                    Avg per bill
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Category Breakdown */}
        {summary.category_totals && Object.keys(summary.category_totals).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_DURATIONS.NORMAL, delay: 0.2, ease: EASINGS.EASE_OUT }}
          >
            <Card 
              variant="elevated" 
              padding="xl"
              style={{
                border: `1px solid ${currentTheme.colors.border}`,
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: currentTheme.spacing[6],
              }}>
                <h3 style={{ 
                  fontSize: currentTheme.typography.fontSize['2xl'],
                  fontWeight: currentTheme.typography.fontWeight.semibold,
                  color: currentTheme.colors.text.primary,
                  margin: 0,
                }}>
                  Sales by Category
                </h3>
                <div style={{
                  fontSize: currentTheme.typography.fontSize.sm,
                  color: currentTheme.colors.text.secondary,
                  fontWeight: currentTheme.typography.fontWeight.medium,
                }}>
                  {formatCurrency(summary.total_sales || 0)} total
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[5] }}>
                {Object.entries(summary.category_totals).map(([category, total], index) => {
                  const percentage = summary.total_sales > 0 
                    ? (total / summary.total_sales * 100).toFixed(1)
                    : 0;
                  
                  const categoryName = CATEGORY_NAMES[category] || (category === 'unknown' ? 'Uncategorized (needs mapping)' : category);
                  const categoryColor = CATEGORY_COLORS[category] || currentTheme.colors.gray[400];
                  
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: ANIMATION_DURATIONS.NORMAL, 
                        delay: 0.3 + (index * 0.1), 
                        ease: EASINGS.EASE_OUT 
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: currentTheme.spacing[5],
                        padding: currentTheme.spacing[5],
                        backgroundColor: isDark ? currentTheme.colors.gray[50] : currentTheme.colors.gray[50],
                        borderRadius: currentTheme.borderRadius.xl,
                        border: `1px solid ${currentTheme.colors.border}`,
                        transition: 'all 0.2s ease',
                      }}
                      whileHover={{
                        backgroundColor: isDark ? currentTheme.colors.gray[100] : currentTheme.colors.gray[100],
                        transform: 'translateX(4px)',
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: categoryColor,
                        borderRadius: '50%',
                        boxShadow: `0 0 0 4px ${categoryColor}20`,
                      }} />
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: currentTheme.spacing[3],
                        }}>
                          <span style={{ 
                            fontSize: currentTheme.typography.fontSize.lg,
                            fontWeight: currentTheme.typography.fontWeight.semibold,
                            color: currentTheme.colors.text.primary,
                          }}>
                            {categoryName}
                          </span>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: currentTheme.spacing[3],
                          }}>
                            <span style={{ 
                              fontSize: currentTheme.typography.fontSize.lg,
                              fontWeight: currentTheme.typography.fontWeight.bold,
                              color: currentTheme.colors.text.primary,
                            }}>
                              {formatCurrency(total)}
                            </span>
                            <span style={{
                              fontSize: currentTheme.typography.fontSize.sm,
                              color: currentTheme.colors.text.secondary,
                              fontWeight: currentTheme.typography.fontWeight.medium,
                              backgroundColor: isDark ? currentTheme.colors.gray[200] : currentTheme.colors.gray[200],
                              padding: `${currentTheme.spacing[1]} ${currentTheme.spacing[3]}`,
                              borderRadius: currentTheme.borderRadius.full,
                              minWidth: '60px',
                              textAlign: 'center',
                            }}>
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        
                        <div style={{
                          width: '100%',
                          height: '12px',
                          backgroundColor: isDark ? currentTheme.colors.gray[200] : currentTheme.colors.gray[200],
                          borderRadius: currentTheme.borderRadius.full,
                          overflow: 'hidden',
                          position: 'relative',
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ 
                              duration: 1.2, 
                              ease: EASINGS.EASE_OUT_CIRC,
                              delay: 0.5 + (index * 0.1)
                            }}
                            style={{
                              height: '100%',
                              backgroundColor: categoryColor,
                              borderRadius: currentTheme.borderRadius.full,
                              position: 'relative',
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Time Insights Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION_DURATIONS.NORMAL, delay: 0.4, ease: EASINGS.EASE_OUT }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: currentTheme.spacing[5],
          }}
        >
          {/* First Bill Card */}
          <motion.div
            whileHover={{ 
              y: -2,
              boxShadow: currentTheme.shadows.md,
            }}
            transition={{ duration: ANIMATION_DURATIONS.FAST, ease: EASINGS.EASE_OUT }}
          >
            <Card 
              variant="elevated" 
              padding="lg"
              style={{
                border: `1px solid ${currentTheme.colors.border}`,
                background: `linear-gradient(135deg, ${currentTheme.colors.surface} 0%, ${isDark ? currentTheme.colors.surface : '#FFFFFF'} 100%)`,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: currentTheme.spacing[3],
                marginBottom: currentTheme.spacing[3],
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: currentTheme.borderRadius.lg,
                  backgroundColor: currentTheme.colors.primary[50],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ClockIcon color={currentTheme.colors.primary[600]} />
                </div>
                <div>
                  <h4 style={{ 
                    fontSize: currentTheme.typography.fontSize.sm,
                    fontWeight: currentTheme.typography.fontWeight.medium,
                    color: currentTheme.colors.text.secondary,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: currentTheme.typography.letterSpacing.wide,
                  }}>
                    First Bill
                  </h4>
                  <p style={{ 
                    fontSize: currentTheme.typography.fontSize.xl,
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    color: currentTheme.colors.text.primary,
                    margin: 0,
                    marginTop: currentTheme.spacing[1],
                  }}>
                    {formatTime(summary.first_bill_time)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Last Bill Card */}
          <motion.div
            whileHover={{ 
              y: -2,
              boxShadow: currentTheme.shadows.md,
            }}
            transition={{ duration: ANIMATION_DURATIONS.FAST, ease: EASINGS.EASE_OUT }}
          >
            <Card 
              variant="elevated" 
              padding="lg"
              style={{
                border: `1px solid ${currentTheme.colors.border}`,
                background: `linear-gradient(135deg, ${currentTheme.colors.surface} 0%, ${isDark ? currentTheme.colors.surface : '#FFFFFF'} 100%)`,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: currentTheme.spacing[3],
                marginBottom: currentTheme.spacing[3],
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: currentTheme.borderRadius.lg,
                  backgroundColor: currentTheme.colors.success[50],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ClockIcon color={currentTheme.colors.success[600]} />
                </div>
                <div>
                  <h4 style={{ 
                    fontSize: currentTheme.typography.fontSize.sm,
                    fontWeight: currentTheme.typography.fontWeight.medium,
                    color: currentTheme.colors.text.secondary,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: currentTheme.typography.letterSpacing.wide,
                  }}>
                    Last Bill
                  </h4>
                  <p style={{ 
                    fontSize: currentTheme.typography.fontSize.xl,
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    color: currentTheme.colors.text.primary,
                    margin: 0,
                    marginTop: currentTheme.spacing[1],
                  }}>
                    {formatTime(summary.last_bill_time)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Peak Hour Card */}
          {summary.peak_hour && (
            <motion.div
              whileHover={{ 
                y: -2,
                boxShadow: currentTheme.shadows.md,
              }}
              transition={{ duration: ANIMATION_DURATIONS.FAST, ease: EASINGS.EASE_OUT }}
            >
              <Card 
                variant="elevated" 
                padding="lg"
                style={{
                  border: `1px solid ${currentTheme.colors.border}`,
                  background: `linear-gradient(135deg, ${currentTheme.colors.surface} 0%, ${isDark ? currentTheme.colors.surface : '#FFFFFF'} 100%)`,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: currentTheme.spacing[3],
                  marginBottom: currentTheme.spacing[3],
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: currentTheme.borderRadius.lg,
                    backgroundColor: currentTheme.colors.warning[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ActivityIcon color={currentTheme.colors.warning[600]} />
                  </div>
                  <div>
                    <h4 style={{ 
                      fontSize: currentTheme.typography.fontSize.sm,
                      fontWeight: currentTheme.typography.fontWeight.medium,
                      color: currentTheme.colors.text.secondary,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: currentTheme.typography.letterSpacing.wide,
                    }}>
                      Peak Hour
                    </h4>
                    <p style={{ 
                      fontSize: currentTheme.typography.fontSize.xl,
                      fontWeight: currentTheme.typography.fontWeight.bold,
                      color: currentTheme.colors.text.primary,
                      margin: 0,
                      marginTop: currentTheme.spacing[1],
                    }}>
                      {summary.peak_hour}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Reports Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[6] }}>
        <Card variant="elevated" padding="xl">
          <h3 style={{ 
            fontSize: currentTheme.typography.fontSize['2xl'],
            fontWeight: currentTheme.typography.fontWeight.semibold,
            color: currentTheme.colors.text.primary,
            marginBottom: currentTheme.spacing[6]
          }}>
            Export Reports
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: currentTheme.spacing[4],
          }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="primary"
                onClick={() => handleDownload('excel', 'Daily Sales', `daily_sales_${new Date().toISOString().split('T')[0]}.csv`)}
                loading={downloading.excel}
                fullWidth
                size="lg"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: currentTheme.spacing[2],
                  padding: currentTheme.spacing[5],
                }}
              >
                <DownloadIcon color="#FFFFFF" />
                {downloading.excel ? 'Downloading...' : 'Download Excel Report'}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="secondary"
                onClick={() => handleDownload('xml', 'Daily Bills', `daily_bills_${new Date().toISOString().split('T')[0]}.xml`)}
                loading={downloading.xml}
                fullWidth
                size="lg"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: currentTheme.spacing[2],
                  padding: currentTheme.spacing[5],
                }}
              >
                <FileIcon color={currentTheme.colors.text.primary} />
                {downloading.xml ? 'Downloading...' : 'Download XML Data'}
              </Button>
            </motion.div>
          </div>
        </Card>

        {/* Report Info */}
        <Card variant="default" padding="lg">
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: currentTheme.spacing[4],
            color: currentTheme.colors.text.secondary,
            fontSize: currentTheme.typography.fontSize.sm
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: currentTheme.colors.primary[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
            }}>
              <span style={{ fontSize: '14px', color: currentTheme.colors.primary[600] }}>ℹ️</span>
            </div>
            <div>
              <p style={{ margin: 0, lineHeight: currentTheme.typography.lineHeight.relaxed }}>
                <strong>Report Information:</strong> Reports are generated for today's sales data. Excel files are in CSV format and can be opened in spreadsheet applications like Microsoft Excel, Google Sheets, or Numbers.
              </p>
              <p style={{ margin: `${currentTheme.spacing[3]} 0 0`, lineHeight: currentTheme.typography.lineHeight.relaxed }}>
                <strong>XML Data:</strong> XML files contain the raw data structure used by the POS system and are useful for data integration and backup purposes.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default Reports;
