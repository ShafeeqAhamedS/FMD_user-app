const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // Add missing bcrypt import
const logger = require('../utils/logger');

// Register a new user
exports.registerUser = async (req, res) => {
  logger.info('Registration attempt', { email: req.body.email });

  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    logger.debug('Checking if user already exists', { email });
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      logger.warn('Registration failed - User already exists', { email });
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    logger.info('Creating new user', { email });
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    logger.debug('Generating JWT token for new user', { userId: user._id });
    const token = User.generateToken(user._id);

    logger.info('User registered successfully', { userId: user._id });
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio
      }
    });
  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  logger.info('Login attempt', { email: req.body.email });

  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      logger.warn('Login failed - Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    logger.debug('Finding user by email', { email });
    const user = await User.findOne({ email });
    
    if (!user) {
      logger.warn('Login failed - User not found', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    logger.debug('Verifying password', { userId: user._id });
    const isMatch = await User.matchPassword(password, user.password);
    
    if (!isMatch) {
      logger.warn('Login failed - Invalid password', { userId: user._id });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    logger.debug('Generating JWT token', { userId: user._id });
    const token = User.generateToken(user._id);

    logger.info('User logged in successfully', { userId: user._id });
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio
      }
    });
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  logger.debug('Getting current user profile', { userId: req.user._id });
  
  try {
    const user = req.user;

    logger.info('User profile retrieved successfully', { userId: user._id });
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Error retrieving user profile', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update user details
exports.updateDetails = async (req, res) => {
  logger.info('Updating user details', { userId: req.user._id });
  logger.debug('Update data', req.body);
  
  try {
    const { name, bio } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;

    logger.debug('Applying updates to user', { fields: Object.keys(updateFields) });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true }
    );

    logger.info('User updated successfully', { userId: user._id });
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio
      }
    });
  } catch (error) {
    logger.error('Error updating user details', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Upload profile picture
exports.updateProfilePic = async (req, res) => {
  logger.info('Updating profile picture', { userId: req.user._id });
  
  try {
    if (!req.file) {
      logger.warn('Profile update failed - No file uploaded', { userId: req.user._id });
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    logger.debug('Profile picture uploaded', { 
      filename: req.file.filename,
      size: req.file.size,
      path: req.file.path
    });

    // Get current user
    const user = req.user;
    
    // Delete previous profile pic if it exists and is not the default
    if (user.profilePic && !user.profilePic.includes('default-profile.png')) {
      try {
        // Format for actual stored path: uploads/{userId}/profiles/{filename}
        const previousPicPath = path.join(__dirname, '../', user.profilePic);
        logger.debug('Checking for previous profile picture', { path: previousPicPath });
        
        if (fs.existsSync(previousPicPath)) {
          logger.debug('Deleting previous profile picture', { path: previousPicPath });
          fs.unlinkSync(previousPicPath);
        }
      } catch (fileError) {
        // Log error but continue with the update
        logger.error('Error deleting previous profile picture', fileError);
      }
    }

    // Store relative path to the profile picture that can be served via the /uploads static route
    const profilePicPath = `/uploads/${user._id}/profiles/${req.file.filename}`;
    logger.debug('Setting new profile picture path', { path: profilePicPath });
    
    // Update user with new profile pic
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { profilePic: profilePicPath },
      { new: true }
    );

    if (!updatedUser) {
      logger.error('Failed to update user with new profile picture', { userId: user._id });
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile picture'
      });
    }

    logger.info('Profile picture updated successfully', { userId: user._id });
    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        bio: updatedUser.bio
      }
    });
  } catch (error) {
    logger.error('Profile picture update error', error);
    res.status(500).json({
      success: false,
      message: 'Profile picture update failed',
      error: error.message
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  logger.info('Password update attempt', { userId: req.user._id });
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = req.user;
    
    // Check current password
    logger.debug('Verifying current password', { userId: user._id });
    const isMatch = await User.matchPassword(currentPassword, user.password);
    
    if (!isMatch) {
      logger.warn('Password update failed - Current password incorrect', { userId: user._id });
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    logger.debug('Hashing new password', { userId: user._id });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    logger.debug('Updating password in database', { userId: user._id });
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    // Generate new token
    logger.debug('Generating new JWT token after password change', { userId: user._id });
    const token = User.generateToken(user._id);
    
    logger.info('Password updated successfully', { userId: user._id });
    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    logger.error('Password update error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
