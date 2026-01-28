import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../hooks/useAnimation';
import { reportsAPI } from '../../utils/api';
import { handleAPIError, downloadFile } from '../../utils/api';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Reports = () => {
  const { currentTheme } = useTheme();
  const { cardVariants, staggerContainer, staggerItem } = useAnimation();
  
  const [availableReports, setAvailableReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState({});

  // Load available reports
  useEffect(() => {
    loadAvailableReports();
  }, []);

  const loadAvailableReports = async () => {
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
  };

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
          Loading reports...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="error" padding="lg">
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: currentTheme.colors.error[600], marginBottom: currentTheme.spacing[4] }}>
            Error Loading Reports
          </h3>
          <p style={{ color: currentTheme.colors.error[500], marginBottom: currentTheme.spacing[6] }}>
            {error}
          </p>
          <Button onClick={loadAvailableReports} variant="primary">
            Try Again
          </Button>
        </div>
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
          Reports & Exports
        </h2>
        <p style={{ color: currentTheme.colors.text.secondary }}>
          Download daily sales reports in various formats
        </p>
      </div>

      {/* Excel Reports */}
      {availableReports?.excel_reports && (
        <Card variant="elevated" padding="lg">
          <h3 style={{ 
            fontSize: currentTheme.typography.fontSize.lg,
            fontWeight: currentTheme.typography.fontWeight.semibold,
            color: currentTheme.colors.text.primary,
            marginBottom: currentTheme.spacing[4]
          }}>
            Excel Reports (CSV Format)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[4] }}>
            {availableReports.excel_reports.map((report, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: currentTheme.spacing[4],
                  backgroundColor: currentTheme.colors.gray[50],
                  borderRadius: currentTheme.borderRadius.md,
                  border: `1px solid ${currentTheme.colors.border}`,
                }}
              >
                <div>
                  <h4 style={{ 
                    fontSize: currentTheme.typography.fontSize.base,
                    fontWeight: currentTheme.typography.fontWeight.medium,
                    color: currentTheme.colors.text.primary,
                    marginBottom: currentTheme.spacing[1]
                  }}>
                    {report.name}
                  </h4>
                  <p style={{ 
                    fontSize: currentTheme.typography.fontSize.sm,
                    color: currentTheme.colors.text.secondary,
                    margin: 0
                  }}>
                    {report.description} • {report.format}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: currentTheme.spacing[2] }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview('excel')}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownload('excel', report.name, `sales_report_${new Date().toISOString().split('T')[0]}.csv`)}
                    loading={downloading.excel}
                  >
                    {downloading.excel ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* XML Reports */}
      {availableReports?.xml_reports && (
        <Card variant="elevated" padding="lg">
          <h3 style={{ 
            fontSize: currentTheme.typography.fontSize.lg,
            fontWeight: currentTheme.typography.fontWeight.semibold,
            color: currentTheme.colors.text.primary,
            marginBottom: currentTheme.spacing[4]
          }}>
            XML Reports
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: currentTheme.spacing[4] }}>
            {availableReports.xml_reports.map((report, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: currentTheme.spacing[4],
                  backgroundColor: currentTheme.colors.gray[50],
                  borderRadius: currentTheme.borderRadius.md,
                  border: `1px solid ${currentTheme.colors.border}`,
                }}
              >
                <div>
                  <h4 style={{ 
                    fontSize: currentTheme.typography.fontSize.base,
                    fontWeight: currentTheme.typography.fontWeight.medium,
                    color: currentTheme.colors.text.primary,
                    marginBottom: currentTheme.spacing[1]
                  }}>
                    {report.name}
                  </h4>
                  <p style={{ 
                    fontSize: currentTheme.typography.fontSize.sm,
                    color: currentTheme.colors.text.secondary,
                    margin: 0
                  }}>
                    {report.description} • {report.format}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: currentTheme.spacing[2] }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview('xml')}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownload('xml', report.name, `bills_${new Date().toISOString().split('T')[0]}.xml`)}
                    loading={downloading.xml}
                  >
                    {downloading.xml ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card variant="outlined" padding="lg">
        <h3 style={{ 
          fontSize: currentTheme.typography.fontSize.lg,
          fontWeight: currentTheme.typography.fontWeight.semibold,
          color: currentTheme.colors.text.primary,
          marginBottom: currentTheme.spacing[4]
        }}>
          Quick Actions
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: currentTheme.spacing[4],
        }}>
          <Button
            variant="primary"
            onClick={() => handleDownload('excel', 'Daily Sales', `daily_sales_${new Date().toISOString().split('T')[0]}.csv`)}
            loading={downloading.excel}
            fullWidth
          >
            {downloading.excel ? 'Downloading...' : '📊 Download Excel Report'}
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handleDownload('xml', 'Daily Bills', `daily_bills_${new Date().toISOString().split('T')[0]}.xml`)}
            loading={downloading.xml}
            fullWidth
          >
            {downloading.xml ? 'Downloading...' : '📄 Download XML Data'}
          </Button>
        </div>
      </Card>

      {/* Report Info */}
      <Card variant="default" padding="md">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: currentTheme.spacing[3],
          color: currentTheme.colors.text.secondary,
          fontSize: currentTheme.typography.fontSize.sm
        }}>
          <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
          <div>
            <p style={{ margin: 0 }}>
              Reports are generated for today's sales data. Excel files are in CSV format and can be opened in spreadsheet applications.
            </p>
            <p style={{ margin: 0, marginTop: currentTheme.spacing[1] }}>
              XML files contain the raw data structure used by the POS system.
            </p>
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Reports;
