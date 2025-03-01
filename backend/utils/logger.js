const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log file paths
const appLogFile = path.join(logsDir, 'app.log');
const errorLogFile = path.join(logsDir, 'error.log');

// Logger levels
const levels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Format date for log entries
const formatDate = () => {
  const now = new Date();
  return `${now.toISOString()}`;
};

// Format log message
const formatMessage = (level, message, meta = null) => {
  let formattedMessage = `[${formatDate()}] [${level}] ${message}`;
  
  if (meta) {
    if (meta instanceof Error) {
      formattedMessage += `\n    Error: ${meta.message}`;
      formattedMessage += `\n    Stack: ${meta.stack}`;
    } else if (typeof meta === 'object') {
      try {
        formattedMessage += `\n    ${JSON.stringify(meta)}`;
      } catch (e) {
        formattedMessage += `\n    [Object cannot be stringified]`;
      }
    } else {
      formattedMessage += `\n    ${meta}`;
    }
  }
  
  return formattedMessage;
};

// Write to log file
const writeToFile = (filePath, message) => {
  fs.appendFileSync(filePath, message + '\n');
};

// Logger implementation
const logger = {
  error: (message, meta = null) => {
    const formattedMessage = formatMessage(levels.ERROR, message, meta);
    console.error(formattedMessage);
    writeToFile(errorLogFile, formattedMessage);
    writeToFile(appLogFile, formattedMessage);
  },
  
  warn: (message, meta = null) => {
    const formattedMessage = formatMessage(levels.WARN, message, meta);
    console.warn(formattedMessage);
    writeToFile(appLogFile, formattedMessage);
  },
  
  info: (message, meta = null) => {
    const formattedMessage = formatMessage(levels.INFO, message, meta);
    console.log(formattedMessage);
    writeToFile(appLogFile, formattedMessage);
  },
  
  debug: (message, meta = null) => {
    // Only log debug in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      const formattedMessage = formatMessage(levels.DEBUG, message, meta);
      console.log(formattedMessage);
      writeToFile(appLogFile, formattedMessage);
    }
  },
  
  // Log HTTP request
  request: (req, res, next) => {
    const start = Date.now();
    
    // Log when the request completes
    res.on('finish', () => {
      const duration = Date.now() - start;
      const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
      
      if (res.statusCode >= 500) {
        logger.error(message);
      } else if (res.statusCode >= 400) {
        logger.warn(message);
      } else {
        logger.info(message);
      }
    });
    
    next();
  }
};

module.exports = logger;
