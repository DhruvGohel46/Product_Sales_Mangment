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

  // Permanently delete product
  deleteProduct: (productId) => {
    console.log('API deleteProduct called with ID:', productId);
    console.log('Full URL:', `/api/products/${productId}`);
    return api.delete(`/api/products/${productId}`);
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

  // Image Management
  uploadImage: (productId, formData) => {
    return api.post(`/api/products/${productId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteImage: (productId) => api.delete(`/api/products/${productId}/image`),

  getImageUrl: (filename) => {
    if (!filename) return null;
    return `${API_BASE_URL}/api/images/${filename}`;
  },
};

// Category Management APIs
export const categoriesAPI = {
  // Get all categories
  getAllCategories: (includeInactive = false) =>
    api.get(`/api/categories?include_inactive=${includeInactive}`),

  // Create new category
  createCategory: (data) => api.post('/api/categories', data),

  // Update existing category
  updateCategory: (id, data) => api.put(`/api/categories/${id}`, data),

  // Secure remove or deactivate
  deleteCategory: (id) => api.delete(`/api/categories/${id}`),

  // Check usage
  checkUsage: (id) => api.get(`/api/categories/${id}/usage`),
};

// Billing APIs
export const billingAPI = {
  // Create new bill with products
  createBill: (billData) => api.post('/api/bill/create', billData),

  // Get specific bill by number
  getBill: (billNo) => api.get(`/api/bill/${billNo}`),

  // Get all bills for today
  getTodayBills: () => api.get('/api/bill/today'),

  // Get bills for a specific date
  getBillsByDate: (date) => api.get(`/api/bill/date/${date}`),

  // Get next bill number for today
  getNextBillNumber: () => api.get('/api/bill/next-number'),

  // Print existing bill
  printBill: (billNo) => api.post(`/api/bill/print/${billNo}`),

  // Management: Get all bills including cancelled
  getAllBills: () => api.get('/api/bill/management/all'),

  // Management: Cancel a bill
  cancelBill: (billNo) => api.put(`/api/bill/${billNo}/cancel`),

  // Management: Update a bill
  updateBill: (billNo, billData) => api.put(`/api/bill/${billNo}/update`, billData),
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
  // Export today's sales (or specific date) as Excel/CSV
  exportTodayExcel: (reportType = 'detailed', date = null) => {
    let url = `/api/reports/excel/today?type=${reportType}`;
    if (date) {
      url += `&date=${date}`;
    }
    return api.get(url, { responseType: 'blob' });
  },

  // Export monthly sales as Excel
  exportMonthlyExcel: (month, year) =>
    api.get(`/api/reports/excel/monthly?month=${month}&year=${year}`, { responseType: 'blob' }),

  // Export weekly sales as Excel (by reference date)
  exportWeeklyExcel: (date) =>
    api.get(`/api/reports/excel/weekly?date=${date}`, { responseType: 'blob' }),

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
let currentCurrencySymbol = '₹';

export const setCurrencySymbol = (symbol) => {
  if (symbol) currentCurrencySymbol = symbol;
};

export const formatCurrency = (amount) => {
  // Use custom formatting to support arbitrary symbols
  return `${currentCurrencySymbol}${Number(amount).toFixed(2)}`;
};

export default api;
