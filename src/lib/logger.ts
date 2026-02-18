// Secure logging utility for development vs production
// Dev logs are opt-in to avoid render-time console spam and UI slowdowns.
const devLogsEnabled =
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_LOGS === '1';

export const logger = {
  log: (...args: any[]) => {
    if (devLogsEnabled) {
      console.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (devLogsEnabled) {
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors, but sanitize in production
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    } else {
      // In production, log only generic error messages
      console.error('An error occurred');
    }
  },

  debug: (...args: any[]) => {
    if (devLogsEnabled) {
      console.debug('[DEBUG]', ...args);
    }
  }
};

// Utility to sanitize sensitive data for logging
export const sanitizeForLogging = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveKeys = ['email', 'password', 'token', 'key', 'secret'];
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}; 