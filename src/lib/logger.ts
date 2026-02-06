/**
 * Conditional logging utility
 * Only logs in development mode to prevent information leakage in production
 */

export const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Errors are logged in all environments for debugging
    // but could be sent to a crash reporting service in production
    if (__DEV__) {
      console.error(...args);
    }
    // In production, you might want to send to Sentry/Crashlytics
    // else { sendToErrorReporting(args); }
  },
  debug: (...args: unknown[]) => {
    if (__DEV__) {
      console.debug(...args);
    }
  },
};

export default logger;
