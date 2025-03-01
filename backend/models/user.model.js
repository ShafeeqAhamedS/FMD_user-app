const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');

const User = {
  // Create a new user
  create: async function(userData) {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
    
    // Set default fields
    userData.profilePic = userData.profilePic || '/uploads/default-profile.png'; // Default profile image path
    userData.bio = userData.bio || '';
    
    // Create user in the database
    return db.create('users', userData);
  },
  
  // Find a user by ID
  findById: function(id) {
    return db.findById('users', id);
  },
  
  // Find a user by email
  findOne: function(filter) {
    return db.findOne('users', filter);
  },
  
  // Find all users
  find: function(filter) {
    return db.find('users', filter);
  },
  
  // Update a user
  findByIdAndUpdate: function(id, updates) {
    // Make sure to return the updated document
    return db.update('users', id, updates);
  },
  
  // Compare password
  matchPassword: async function(providedPassword, hashedPassword) {
    return await bcrypt.compare(providedPassword, hashedPassword);
  },
  
  // Generate JWT token
  generateToken: function(id) {
    return jwt.sign(
      { id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }
};

module.exports = User;
