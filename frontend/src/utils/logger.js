/**
 * Application logging utility
 * Provides consistent logging format with different log levels
 */

// Log levels
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// Enable/disable different log types based on environment
const LOG_LEVEL_ENABLED = {
  [LOG_LEVELS.DEBUG]: process.env.NODE_ENV !== 'production',
  [LOG_LEVELS.INFO]: true,
  [LOG_LEVELS.WARN]: true,
  [LOG_LEVELS.ERROR]: true
};

// Icons for different log types to make logs more scannable
const LOG_LEVEL_ICONS = {
  [LOG_LEVELS.DEBUG]: '🔍',
  [LOG_LEVELS.INFO]: 'ℹ️',
  [LOG_LEVELS.WARN]: '⚠️',
  [LOG_LEVELS.ERROR]: '❌'
};

// Module icons to visually distinguish different parts of the application
export const MODULE_ICONS = {
  API: '🌐',
  AUTH: '🔑',
  PROJECTS: '📂',
  STORE: '🗄️',
  UI: '💻',
};

/**
 * Log a message with the specified level
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {string} module - The module where the log originated
 * @param {string} message - Main log message
 * @param {any} data - Optional data to include in the log
 */
export const log = (level, module, message, data = undefined) => {
  if (!LOG_LEVEL_ENABLED[level]) return;
  
  const moduleIcon = MODULE_ICONS[module] || '📌';
  const levelIcon = LOG_LEVEL_ICONS[level] || '';
  
  const prefix = `${levelIcon} [${module}]`;
  
  switch (level) {
    case LOG_LEVELS.DEBUG:
      console.debug(prefix, message, data !== undefined ? data : '');
      break;
    case LOG_LEVELS.INFO:
      console.log(prefix, message, data !== undefined ? data : '');
      break;
    case LOG_LEVELS.WARN:
      console.warn(prefix, message, data !== undefined ? data : '');
      break;
    case LOG_LEVELS.ERROR:
      console.error(prefix, message, data !== undefined ? data : '');
      break;
    default:
      console.log(prefix, message, data !== undefined ? data : '');
  }
};

// Shorthand methods for different log levels
export const debug = (module, message, data) => log(LOG_LEVELS.DEBUG, module, message, data);
export const info = (module, message, data) => log(LOG_LEVELS.INFO, module, message, data);
export const warn = (module, message, data) => log(LOG_LEVELS.WARN, module, message, data);
export const error = (module, message, data) => log(LOG_LEVELS.ERROR, module, message, data);

export default {
  log,
  debug,
  info,
  warn,
  error,
  LOG_LEVELS,
  MODULE_ICONS
};
