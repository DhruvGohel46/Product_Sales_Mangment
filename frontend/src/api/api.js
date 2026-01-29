import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Product Management APIs
export const productsAPI = {
  // Get all products
  getAllProducts: () => api.get('/api/products'),
  
  // Create new product
  createProduct: (productData) => api.post('/api/products', productData),
  
  // Update product
  updateProduct: (productId, productData) => api.put(`/api/products/${productId}`, productData),
  
  // Get specific product
  getProduct: (productId) => api.get(`/api/products/${productId}`),
};

// Billing APIs
export const billingAPI = {
  // Create new bill
  createBill: (billData) => api.post('/api/bill/create', billData),
  
  // Get specific bill
  getBill: (billNo) => api.get(`/api/bill/${billNo}`),
  
  // Get today's bills
  getTodayBills: () => api.get('/api/bill/today'),
  
  // Get next bill number
  getNextBillNumber: () => api.get('/api/bill/next-number'),
  
  // Print bill
  printBill: (billNo) => api.post(`/api/bill/print/${billNo}`),
};

// Summary APIs
export const summaryAPI = {
  // Get today's summary
  getTodaySummary: () => api.get('/api/summary/today'),
  
  // Get summary for specific date
  getSummaryForDate: (dateStr) => api.get(`/api/summary/date/${dateStr}`),
  
  // Get top selling products
  getTopSellingProducts: (limit = 10) => api.get(`/api/summary/top-products?limit=${limit}`),
  
  // Get quick stats
  getQuickStats: () => api.get('/api/summary/quick-stats'),
};

// Reports APIs
export const reportsAPI = {
  // Export today's Excel report
  exportTodayExcel: (reportType = 'detailed') => 
    api.get(`/api/reports/excel/today?type=${reportType}`, { responseType: 'blob' }),
  
  // Export today's CSV report
  exportTodayCSV: (reportType = 'simple') => 
    api.get(`/api/reports/excel/today?type=${reportType}`, { responseType: 'blob' }),
  
  // Export today's XML report
  exportTodayXML: () => 
    api.get('/api/reports/xml/today', { responseType: 'blob' }),
  
  // Preview Excel data
  previewExcel: () => api.get('/api/reports/preview/excel'),
  
  // Preview XML data
  previewXML: () => api.get('/api/reports/preview/xml'),
  
  // Get available reports
  getAvailableReports: () => api.get('/api/reports/available-reports'),
};

// System APIs
export const systemAPI = {
  // Health check
  healthCheck: () => api.get('/health'),
  
  // Get server info
  getServerInfo: () => api.get('/'),
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'Server error',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - Unable to connect to server',
      status: 0,
      data: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'Unknown error occurred',
      status: -1,
      data: null,
    };
  }
};

// Utility function to download files
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
