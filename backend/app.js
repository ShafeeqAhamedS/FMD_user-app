require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const userRoute = require('./routes/userRoute');
const projectsRoute = require('./routes/projectsRoute');
const swagger = require('./swagger');
const logger = require('./utils/logger'); // Make sure logger is imported

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
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
});

// Create necessary directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
// Remove the profilesDir since we now create user-specific profile dirs
const dbDir = path.join(__dirname, 'data/db');

[uploadsDir, dbDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Static files - serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Documentation with Swagger
app.use('/api-docs', swagger.serve, swagger.setup);

// API Routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/projects', projectsRoute);

// Root route
app.get('/', (req, res) => {
  res.send('FMD User App API is running...');
});

// API Info route
app.get('/api/v1', (req, res) => {
  res.send({
    message: 'Welcome to the FMD User App API',
    endpoints: [
      {
        users: '/api/v1/users',
        projects: '/api/v1/projects'
      }
    ],
    documentation: '/api-docs',
    version: '1.0.0',
    database: 'JSON File DB'
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started running on http://localhost:${PORT}/api/v1/`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  console.log('Using JSON file database storage');
});

module.exports = app; // Export for testing purposes
