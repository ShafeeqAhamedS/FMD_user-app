const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

// Define database directory and files
const dbDir = path.join(__dirname, '../data/db');
const usersFile = path.join(dbDir, 'users.json');
const projectsFile = path.join(dbDir, 'projects.json');

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  logger.info(`Creating database directory: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database files if they don't exist
if (!fs.existsSync(usersFile)) {
  logger.info(`Initializing users database file: ${usersFile}`);
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(projectsFile)) {
  logger.info(`Initializing projects database file: ${projectsFile}`);
  fs.writeFileSync(projectsFile, JSON.stringify([], null, 2));
}

// Helper functions for database operations
const db = {
  // Read data from a collection
  readData: (collection) => {
    logger.debug(`Reading data from collection: ${collection}`);
    const filePath = collection === 'users' ? usersFile : projectsFile;
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Failed to read from ${collection}`, error);
      throw error;
    }
  },

  // Write data to a collection
  writeData: (collection, data) => {
    logger.debug(`Writing data to collection: ${collection}`, { count: data.length });
    const filePath = collection === 'users' ? usersFile : projectsFile;
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      logger.error(`Failed to write to ${collection}`, error);
      throw error;
    }
  },

  // Find a document by ID
  findById: (collection, id) => {
    logger.debug(`Finding document by ID in ${collection}`, { id });
    try {
      const data = db.readData(collection);
      const item = data.find(item => item._id === id);
      if (item) {
        logger.debug(`Found document in ${collection}`, { id });
      } else {
        logger.debug(`Document not found in ${collection}`, { id });
      }
      return item;
    } catch (error) {
      logger.error(`Error finding document by ID in ${collection}`, error);
      throw error;
    }
  },

  // Find a document by a filter condition
  findOne: (collection, filter) => {
    logger.debug(`Finding one document in ${collection}`, { filter });
    try {
      const data = db.readData(collection);
      const item = data.find(item => {
        for (const key in filter) {
          if (item[key] !== filter[key]) {
            return false;
          }
        }
        return true;
      });
      
      if (item) {
        logger.debug(`Found document in ${collection} matching filter`);
      } else {
        logger.debug(`No document found in ${collection} matching filter`);
      }
      
      return item;
    } catch (error) {
      logger.error(`Error finding document in ${collection}`, error);
      throw error;
    }
  },

  // Find documents by a filter condition
  find: (collection, filter = {}) => {
    logger.debug(`Finding documents in ${collection}`, { filter });
    try {
      const data = db.readData(collection);
      if (Object.keys(filter).length === 0) {
        logger.debug(`Returning all documents from ${collection}`, { count: data.length });
        return data;
      }
      
      const results = data.filter(item => {
        for (const key in filter) {
          if (item[key] !== filter[key]) {
            return false;
          }
        }
        return true;
      });
      
      logger.debug(`Found ${results.length} documents in ${collection} matching filter`);
      return results;
    } catch (error) {
      logger.error(`Error finding documents in ${collection}`, error);
      throw error;
    }
  },

  // Create a new document
  create: (collection, doc) => {
    logger.info(`Creating new document in ${collection}`);
    logger.debug(`Document data for ${collection}`, doc);
    
    try {
      const data = db.readData(collection);
      const newDoc = { ...doc, _id: uuidv4(), createdAt: new Date().toISOString() };
      data.push(newDoc);
      db.writeData(collection, data);
      logger.info(`Document created successfully in ${collection}`, { id: newDoc._id });
      return newDoc;
    } catch (error) {
      logger.error(`Error creating document in ${collection}`, error);
      throw error;
    }
  },

  // Update a document by ID
  update: (collection, id, updates) => {
    logger.info(`Updating document in ${collection}`, { id });
    logger.debug(`Update data for ${collection}`, updates);
    
    try {
      const data = db.readData(collection);
      const index = data.findIndex(item => item._id === id);
      
      if (index === -1) {
        logger.warn(`Document not found for update in ${collection}`, { id });
        return null;
      }
      
      const updatedDoc = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
      data[index] = updatedDoc;
      db.writeData(collection, data);
      logger.info(`Document updated successfully in ${collection}`, { id });
      return updatedDoc;
    } catch (error) {
      logger.error(`Error updating document in ${collection}`, error);
      throw error;
    }
  },

  // Delete a document by ID
  remove: (collection, id) => {
    logger.info(`Removing document from ${collection}`, { id });
    
    try {
      const data = db.readData(collection);
      const filtered = data.filter(item => item._id !== id);
      
      if (filtered.length === data.length) {
        logger.warn(`Document not found for deletion in ${collection}`, { id });
        return false; // Nothing was removed
      }
      
      db.writeData(collection, filtered);
      logger.info(`Document successfully removed from ${collection}`, { id });
      return true;
    } catch (error) {
      logger.error(`Error removing document from ${collection}`, error);
      throw error;
    }
  }
};

module.exports = db;
