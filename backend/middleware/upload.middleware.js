const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure project file upload storage
const projectStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const userId = req.user._id;
    const projectId = req.params.projectId;
    const uploadPath = `./uploads/${userId}/${projectId}`;
    
    logger.debug(`Setting project upload destination`, {
      userId,
      projectId,
      path: uploadPath
    });
    
    // Create directory if it doesn't exist
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.debug(`Created project upload directory: ${uploadPath}`);
    } catch (error) {
      logger.error(`Error creating project upload directory: ${uploadPath}`, error);
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const filename = `project_${Date.now()}${path.extname(file.originalname)}`;
    logger.debug(`Generated project file name`, {
      originalName: file.originalname,
      newFilename: filename
    });
    cb(null, filename);
  }
});

// Configure profile pic upload storage - now user-specific
const profileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const userId = req.user._id;
    const uploadPath = `./uploads/${userId}/profiles`;
    
    logger.debug(`Setting profile upload destination`, {
      userId,
      path: uploadPath
    });
    
    // Create directory if it doesn't exist
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.debug(`Created profile upload directory: ${uploadPath}`);
    } catch (error) {
      logger.error(`Error creating profile upload directory: ${uploadPath}`, error);
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const filename = `profile_${Date.now()}${path.extname(file.originalname)}`;
    logger.debug(`Generated profile image name`, {
      originalName: file.originalname,
      newFilename: filename
    });
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  logger.debug(`Validating uploaded file type`, {
    filename: file.originalname,
    mimetype: file.mimetype
  });
  
  if (file.mimetype === 'application/zip' || 
      file.mimetype === 'application/x-zip-compressed') {
    logger.debug(`File validation passed: ${file.originalname}`);
    cb(null, true);
  } else {
    logger.warn(`File validation failed: ${file.originalname}`, {
      expected: 'application/zip',
      received: file.mimetype
    });
    cb(new Error('Only zip files are allowed'), false);
  }
};

// Image filter
const imageFilter = (req, file, cb) => {
  logger.debug(`Validating uploaded image type`, {
    filename: file.originalname,
    mimetype: file.mimetype
  });
  
  if (file.mimetype.startsWith('image/')) {
    logger.debug(`Image validation passed: ${file.originalname}`);
    cb(null, true);
  } else {
    logger.warn(`Image validation failed: ${file.originalname}`, {
      expected: 'image/*',
      received: file.mimetype
    });
    cb(new Error('Only image files are allowed'), false);
  }
};

exports.uploadProject = multer({
  storage: projectStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

exports.uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
