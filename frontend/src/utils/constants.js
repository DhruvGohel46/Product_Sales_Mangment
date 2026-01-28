// Application constants

// Product categories
export const PRODUCT_CATEGORIES = {
  COLDRINK: 'coldrink',
  PAAN: 'paan',
  OTHER: 'other'
};

// Category display names
export const CATEGORY_NAMES = {
  [PRODUCT_CATEGORIES.COLDRINK]: 'Cold Drinks',
  [PRODUCT_CATEGORIES.PAAN]: 'Paan',
  [PRODUCT_CATEGORIES.OTHER]: 'Others'
};

// Category colors
export const CATEGORY_COLORS = {
  [PRODUCT_CATEGORIES.COLDRINK]: '#3B82F6', // Blue
  [PRODUCT_CATEGORIES.PAAN]: '#10B981',     // Green
  [PRODUCT_CATEGORIES.OTHER]: '#F59E0B'     // Amber
};

// Animation durations (in seconds) - refined for professional feel
export const ANIMATION_DURATIONS = {
  INSTANT: 0.1,
  FAST: 0.15,
  NORMAL: 0.2,
  SLOW: 0.3,
  PAGE_TRANSITION: 0.25,
  MICRO: 0.08,
};

// Animation easing functions - calm and professional
export const EASINGS = {
  EASE_OUT: [0.25, 0.46, 0.45, 0.94],
  EASE_IN_OUT: [0.4, 0, 0.2, 1],
  EASE_IN: [0.4, 0, 1, 1],
  EASE_OUT_BACK: [0.34, 1.56, 0.64, 1],
  EASE_OUT_CIRC: [0.08, 0.82, 0.17, 1],
  SMOOTH: [0.25, 0.1, 0.25, 1],
  GENTLE: [0.33, 0, 0.67, 1],
};

// Toast notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'pos_theme',
  LAST_BILL_NUMBER: 'pos_last_bill_number',
  USER_PREFERENCES: 'pos_user_preferences'
};

// API response status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Time formats
export const TIME_FORMATS = {
  DISPLAY: 'h:mm A',
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD h:mm A'
};

// Validation rules
export const VALIDATION = {
  PRODUCT_NAME_MIN_LENGTH: 2,
  PRODUCT_NAME_MAX_LENGTH: 50,
  PRICE_MIN: 0.01,
  PRICE_MAX: 99999.99,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 999
};

// Print settings
export const PRINT_SETTINGS = {
  MAX_CHARS_PER_LINE: 32,
  SHOP_NAME: 'FAST FOOD SHOP',
  SHOP_ADDRESS: 'Your Address Here',
  SHOP_PHONE: 'Phone: XXXXXXXXXX'
};
