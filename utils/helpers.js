const crypto = require('crypto');

/**
 * Generate random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash password (use bcrypt in production)
 */
const hashPassword = async (password) => {
  const bcrypt = require('bcrypt');
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare passwords
 */
const comparePassword = async (password, hashedPassword) => {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 */
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
const validatePasswordStrength = (password) => {
  const checks = {
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    isLongEnough: password.length >= 8
  };

  const strength = Object.values(checks).filter(Boolean).length;
  
  return {
    isStrong: strength >= 4,
    strength: strength,
    checks: checks
  };
};

/**
 * Format date to readable string
 */
const formatDate = (date, format = 'MM/DD/YYYY') => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return format
    .replace('MM', month)
    .replace('DD', day)
    .replace('YYYY', year);
};

/**
 * Format time to HH:MM:SS
 */
const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Calculate days between two dates
 */
const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Capitalize first letter
 */
const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize words
 */
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Slug text
 */
const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate unique ID
 */
const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
};

/**
 * Paginate array
 */
const paginate = (array, pageNumber = 1, pageSize = 10) => {
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = array.slice(startIndex, endIndex);
  const totalPages = Math.ceil(array.length / pageSize);

  return {
    items,
    pageNumber,
    pageSize,
    totalItems: array.length,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPrevPage: pageNumber > 1
  };
};

/**
 * Get initials from name
 */
const getInitials = (name) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .substr(0, 2);
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Parse salary range
 */
const parseSalaryRange = (salaryString) => {
  const regex = /(\d+,?\d*)\s*-\s*(\d+,?\d*)/;
  const match = salaryString.match(regex);

  if (match) {
    return {
      min: parseInt(match[1].replace(/,/g, '')),
      max: parseInt(match[2].replace(/,/g, ''))
    };
  }
  return null;
};

/**
 * Get user's initials avatar color
 */
const getColorForInitials = (name) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Check if user is within business hours
 */
const isBusinessHours = (timezone = 'America/New_York') => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    hour12: false
  });
  
  const hour = parseInt(formatter.format(now));
  return hour >= 9 && hour < 17;
};

/**
 * Sanitize string input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 255);
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Merge objects
 */
const mergeObjects = (obj1, obj2) => {
  return { ...obj1, ...obj2 };
};

/**
 * Get value by path from object
 */
const getValueByPath = (obj, path) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

/**
 * Retry function with exponential backoff
 */
const retry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

/**
 * Debounce function
 */
const debounce = (fn, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      fn(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
const throttle = (fn, wait) => {
  let timeout;
  let previous = 0;
  return function executedFunction(...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        fn(...args);
      }, remaining);
    }
  };
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  isValidEmail,
  isValidPhoneNumber,
  validatePasswordStrength,
  formatDate,
  formatTime,
  daysBetween,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  generateUniqueId,
  paginate,
  getInitials,
  formatCurrency,
  parseSalaryRange,
  getColorForInitials,
  isBusinessHours,
  sanitizeInput,
  deepClone,
  mergeObjects,
  getValueByPath,
  retry,
  debounce,
  throttle
};
