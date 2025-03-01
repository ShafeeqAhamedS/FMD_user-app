const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const logger = require('../utils/logger');

exports.protect = async (req, res, next) => {
  logger.debug('Authenticating user request');
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    logger.debug('Found Bearer token in auth header');
  }

  // Check if token exists
  if (!token) {
    logger.warn('Authentication failed: No token provided', { 
      path: req.originalUrl,
      method: req.method
    });
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    logger.debug('Verifying JWT token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug('Token verified successfully', { userId: decoded.id });

    // Find user with token's id
    req.user = User.findById(decoded.id);

    if (!req.user) {
      logger.warn('Authentication failed: User not found', { userId: decoded.id });
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.debug('User authenticated successfully', { userId: req.user._id });
    next();
  } catch (error) {
    logger.error('Authentication error', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};
