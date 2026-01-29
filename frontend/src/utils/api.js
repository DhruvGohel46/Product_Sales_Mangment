import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

// Product Management APIs
export const productsAPI = {
  // Get all active products (for POS)
  getAllProducts: () => api.get('/api/products'),
  
  // Get all products including inactive ones (for management)
  getAllProductsWithInactive: () => api.get('/api/products?include_inactive=true&include_deleted=true'),
  
  // Create new product
  createProduct: (productData) => api.post('/api/products', productData),
  
  // Update existing product
  updateProduct: (productId, productData) => api.put(`/api/products/${productId}`, productData),
  
  // Get specific product by ID
  getProduct: (productId) => api.get(`/api/products/${productId}`),
  
  // Soft delete product (mark as deleted)
  deleteProduct: (productId) => {
    console.log('API deleteProduct called with ID:', productId);
    console.log('Full URL:', `/api/products/${productId}`);
    return api.put(`/api/products/${productId}`, { deleted: true });
  },
  
  // Set product as out of stock (deactivate)
  setOutOfStock: (productId) => {
    console.log('API setOutOfStock called with ID:', productId);
    console.log('Full URL:', `/api/products/${productId}`);
    return api.put(`/api/products/${productId}`, { active: false });
  },
  
  // Set product as active (reactivate)
  setActive: (productId) => {
    console.log('API setActive called with ID:', productId);
    console.log('Full URL:', `/api/products/${productId}`);
    return api.put(`/api/products/${productId}`, { active: true });
  },
};

// Billing APIs
export const billingAPI = {
  // Create new bill with products
  createBill: (billData) => api.post('/api/bill/create', billData),
  
  // Get specific bill by number
  getBill: (billNo) => api.get(`/api/bill/${billNo}`),
  
  // Get all bills for today
  getTodayBills: () => api.get('/api/bill/today'),
  
  // Get next bill number for today
  getNextBillNumber: () => api.get('/api/bill/next-number'),
  
  // Print existing bill
  printBill: (billNo) => api.post(`/api/bill/print/${billNo}`),
};

// Summary APIs
export const summaryAPI = {
  // Get comprehensive today's summary
  getTodaySummary: () => api.get('/api/summary/today'),
  
  // Get summary for specific date
  getSummaryForDate: (dateStr) => api.get(`/api/summary/date/${dateStr}`),
  
  // Get top selling products
  getTopSellingProducts: (limit = 10) => api.get(`/api/summary/top-products?limit=${limit}`),
  
  // Get quick dashboard stats
  getQuickStats: () => api.get('/api/summary/quick-stats'),
};

// Reports APIs
export const reportsAPI = {
  // Export today's sales as Excel/CSV
  exportTodayExcel: (reportType = 'detailed') => 
    api.get(`/api/reports/excel/today?type=${reportType}`, { responseType: 'blob' }),
  
  // Export today's bills as XML
  exportTodayXML: () => 
    api.get('/api/reports/xml/today', { responseType: 'blob' }),
  
  // Preview Excel data without downloading
  previewExcel: () => api.get('/api/reports/preview/excel'),
  
  // Preview XML data without downloading
  previewXML: () => api.get('/api/reports/preview/xml'),
  
  // Get list of available reports
  getAvailableReports: () => api.get('/api/reports/available-reports'),
};

// System APIs
export const systemAPI = {
  // Check system health
  healthCheck: () => api.get('/health'),
  
  // Get server information
  getServerInfo: () => api.get('/'),
};

// Utility function to handle API errors consistently
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'Server error occurred',
      status: error.response.status,
      data: error.response.data,
      type: 'server_error'
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - Unable to connect to server',
      status: 0,
      data: null,
      type: 'network_error'
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'Unknown error occurred',
      status: -1,
      data: null,
      type: 'unknown_error'
    };
  }
};

// Utility function to download files from blob responses
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

// Utility function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default api;
