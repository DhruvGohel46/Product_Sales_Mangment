import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';
import { summaryAPI } from '../../utils/api';
import { formatCurrency, handleAPIError } from '../../utils/api';
import { CATEGORY_COLORS, CATEGORY_NAMES } from '../../utils/constants';
import Button from '../ui/Button';
import Card from '../ui/Card';

const DailySummary = () => {
  const { currentTheme } = useTheme();
  const { cardVariants, staggerContainer, staggerItem } = useAnimation();
  
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load summary data
  useEffect(() => {
    loadSummary();
  }, [selectedDate]);

  const loadSummary = async () => {
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: currentTheme.spacing[4]
      }}>
        <motion.div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid ' + currentTheme.colors.primary[200],
            borderTop: '3px solid ' + currentTheme.colors.primary[600],
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ color: currentTheme.colors.text.secondary }}>
          Loading summary...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="error" padding="lg">
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: currentTheme.colors.error[600], marginBottom: currentTheme.spacing[4] }}>
            Error Loading Summary
          </h3>
          <p style={{ color: currentTheme.colors.error[500], marginBottom: currentTheme.spacing[6] }}>
            {error}
          </p>
          <Button onClick={loadSummary} variant="primary">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card padding="lg" style={{ textAlign: 'center' }}>
        <h3 style={{ color: currentTheme.colors.text.secondary, marginBottom: currentTheme.spacing[4] }}>
          No Data Available
        </h3>
        <p style={{ color: currentTheme.colors.text.secondary }}>
          No sales data for the selected period
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[6] }}>
      {/* Header */}
      <div>
        <h2 style={{ 
          fontSize: currentTheme.typography.fontSize['2xl'],
          fontWeight: currentTheme.typography.fontWeight.semibold,
          color: currentTheme.colors.text.primary,
          marginBottom: currentTheme.spacing[2]
        }}>
          Daily Summary
        </h2>
        <p style={{ color: currentTheme.colors.text.secondary }}>
          Sales overview for {summary.date || 'Today'}
        </p>
      </div>

      {/* Key Metrics */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: currentTheme.spacing[4],
        }}
      >
        {/* Total Sales */}
        <motion.div variants={staggerItem}>
          <Card variant="elevated" padding="lg" style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: currentTheme.typography.fontSize['3xl'],
              fontWeight: currentTheme.typography.fontWeight.bold,
              color: currentTheme.colors.primary[600],
              marginBottom: currentTheme.spacing[2]
            }}>
              {formatCurrency(summary.total_sales || 0)}
            </div>
            <h3 style={{ 
              fontSize: currentTheme.typography.fontSize.base,
              fontWeight: currentTheme.typography.fontWeight.medium,
              color: currentTheme.colors.text.secondary,
              margin: 0
            }}>
              Total Sales
            </h3>
          </Card>
        </motion.div>

        {/* Total Bills */}
        <motion.div variants={staggerItem}>
          <Card variant="elevated" padding="lg" style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: currentTheme.typography.fontSize['3xl'],
              fontWeight: currentTheme.typography.fontWeight.bold,
              color: currentTheme.colors.success[600],
              marginBottom: currentTheme.spacing[2]
            }}>
              {summary.total_bills || 0}
            </div>
            <h3 style={{ 
              fontSize: currentTheme.typography.fontSize.base,
              fontWeight: currentTheme.typography.fontWeight.medium,
              color: currentTheme.colors.text.secondary,
              margin: 0
            }}>
              Total Bills
            </h3>
          </Card>
        </motion.div>

        {/* Average Bill Value */}
        <motion.div variants={staggerItem}>
          <Card variant="elevated" padding="lg" style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: currentTheme.typography.fontSize['3xl'],
              fontWeight: currentTheme.typography.fontWeight.bold,
              color: currentTheme.colors.warning[600],
              marginBottom: currentTheme.spacing[2]
            }}>
              {formatCurrency(summary.average_bill_value || 0)}
            </div>
            <h3 style={{ 
              fontSize: currentTheme.typography.fontSize.base,
              fontWeight: currentTheme.typography.fontWeight.medium,
              color: currentTheme.colors.text.secondary,
              margin: 0
            }}>
              Average Bill
            </h3>
          </Card>
        </motion.div>
      </motion.div>

      {/* Category Breakdown */}
      {summary.category_totals && Object.keys(summary.category_totals).length > 0 && (
        <Card variant="elevated" padding="lg">
          <h3 style={{ 
            fontSize: currentTheme.typography.fontSize.lg,
            fontWeight: currentTheme.typography.fontWeight.semibold,
            color: currentTheme.colors.text.primary,
            marginBottom: currentTheme.spacing[4]
          }}>
            Sales by Category
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[3] }}>
            {Object.entries(summary.category_totals).map(([category, total]) => {
              const percentage = summary.total_sales > 0 
                ? (total / summary.total_sales * 100).toFixed(1)
                : 0;
              
              return (
                <div key={category} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: currentTheme.spacing[4],
                  padding: currentTheme.spacing[3],
                  backgroundColor: currentTheme.colors.gray[50],
                  borderRadius: currentTheme.borderRadius.md,
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: CATEGORY_COLORS[category] || currentTheme.colors.gray[400],
                    borderRadius: '50%',
                  }} />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: currentTheme.spacing[2]
                    }}>
                      <span style={{ 
                        fontWeight: currentTheme.typography.fontWeight.medium,
                        color: currentTheme.colors.text.primary
                      }}>
                        {CATEGORY_NAMES[category] || category}
                      </span>
                      <span style={{ 
                        fontWeight: currentTheme.typography.fontWeight.semibold,
                        color: currentTheme.colors.text.primary
                      }}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                    
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: currentTheme.colors.gray[200],
                      borderRadius: currentTheme.borderRadius.sm,
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          backgroundColor: CATEGORY_COLORS[category] || currentTheme.colors.gray[400],
                        }}
                      />
                    </div>
                  </div>
                  
                  <span style={{
                    fontSize: currentTheme.typography.fontSize.sm,
                    color: currentTheme.colors.text.secondary,
                    minWidth: '50px',
                    textAlign: 'right'
                  }}>
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Time Information */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: currentTheme.spacing[4],
      }}>
        <Card variant="default" padding="md">
          <h4 style={{ 
            fontSize: currentTheme.typography.fontSize.sm,
            fontWeight: currentTheme.typography.fontWeight.medium,
            color: currentTheme.colors.text.secondary,
            marginBottom: currentTheme.spacing[2]
          }}>
            First Bill
          </h4>
          <p style={{ 
            fontSize: currentTheme.typography.fontSize.lg,
            fontWeight: currentTheme.typography.fontWeight.semibold,
            color: currentTheme.colors.text.primary,
            margin: 0
          }}>
            {formatTime(summary.first_bill_time)}
          </p>
        </Card>

        <Card variant="default" padding="md">
          <h4 style={{ 
            fontSize: currentTheme.typography.fontSize.sm,
            fontWeight: currentTheme.typography.fontWeight.medium,
            color: currentTheme.colors.text.secondary,
            marginBottom: currentTheme.spacing[2]
          }}>
            Last Bill
          </h4>
          <p style={{ 
            fontSize: currentTheme.typography.fontSize.lg,
            fontWeight: currentTheme.typography.fontWeight.semibold,
            color: currentTheme.colors.text.primary,
            margin: 0
          }}>
            {formatTime(summary.last_bill_time)}
          </p>
        </Card>

        {summary.peak_hour && (
          <Card variant="default" padding="md">
            <h4 style={{ 
              fontSize: currentTheme.typography.fontSize.sm,
              fontWeight: currentTheme.typography.fontWeight.medium,
              color: currentTheme.colors.text.secondary,
              marginBottom: currentTheme.spacing[2]
            }}>
              Peak Hour
            </h4>
            <p style={{ 
              fontSize: currentTheme.typography.fontSize.lg,
              fontWeight: currentTheme.typography.fontWeight.semibold,
              color: currentTheme.colors.text.primary,
              margin: 0
            }}>
              {summary.peak_hour}
            </p>
          </Card>
        )}
      </div>

      {/* Refresh Button */}
      <div style={{ textAlign: 'center' }}>
        <Button onClick={loadSummary} variant="secondary" size="lg">
          Refresh Summary
        </Button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DailySummary;
