const Project = require('../models/project.model');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Create a new project
exports.createProject = async (req, res) => {
  logger.info('Creating new project', { userId: req.user._id });
  logger.debug('Project data', req.body);
  
  try {
    const { title, description, tags, status } = req.body;
    
    // Create project
    const project = Project.create({
      title,
      description,
      user: req.user._id,
      tags,
      status
    });
    
    logger.info('Project created successfully', { 
      projectId: project._id, 
      userId: req.user._id 
    });
    
    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    logger.error('Create project error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all projects for a user
exports.getUserProjects = async (req, res) => {
  logger.info('Getting all user projects', { userId: req.user._id });
  
  try {
    const projects = Project.find({ user: req.user._id })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    logger.info('Projects retrieved successfully', { 
      userId: req.user._id, 
      count: projects.length 
    });
    
    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    logger.error('Get projects error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single project
exports.getProject = async (req, res) => {
  const projectId = req.params.projectId;
  logger.info('Getting project details', { projectId, userId: req.user._id });
  
  try {
    const project = Project.findById(projectId);
    
    // Check if project exists
    if (!project) {
      logger.warn('Project not found', { projectId });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check project belongs to user
    if (project.user !== req.user._id) {
      logger.warn('Unauthorized project access attempt', { 
        projectId, 
        projectOwner: project.user,
        requestingUser: req.user._id
      });
      
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }
    
    logger.info('Project retrieved successfully', { projectId });
    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    logger.error('Get project error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  const projectId = req.params.projectId;
  logger.info('Updating project', { projectId, userId: req.user._id });
  
  try {
    let project = Project.findById(projectId);
    
    // Check if project exists
    if (!project) {
      logger.warn('Project not found', { projectId });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check project belongs to user
    if (project.user !== req.user._id) {
      logger.warn('Unauthorized project update attempt', { 
        projectId, 
        projectOwner: project.user,
        requestingUser: req.user._id
      });
      
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }
    
    // Update project
    const { title, description, tags, status, ec2PublicIP } = req.body;
    
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (tags) updates.tags = tags;
    if (status) updates.status = status;
    
    const updatedProject = Project.findByIdAndUpdate(project._id, updates);
    
    if (ec2PublicIP) {
      project.deployedIP = ec2PublicIP;
      await Project.save(project);
    }
    
    logger.info('Project updated successfully', { projectId });
    res.status(200).json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    logger.error('Update project error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  const projectId = req.params.projectId;
  logger.info('Deleting project', { projectId, userId: req.user._id });
  
  try {
    const project = Project.findById(projectId);
    
    // Check if project exists
    if (!project) {
      logger.warn('Project not found', { projectId });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check project belongs to user
    if (project.user !== req.user._id) {
      logger.warn('Unauthorized project delete attempt', { 
        projectId, 
        projectOwner: project.user,
        requestingUser: req.user._id
      });
      
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }
    
    // Delete project zip file if exists
    if (project.zipFilePath) {
      const zipPath = path.join(__dirname, '..', project.zipFilePath);
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
    }
    
    // Delete project folder
    const projectDir = path.join(__dirname, '../uploads', req.user._id, project._id);
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
    
    // Delete project from database
    Project.findByIdAndDelete(project._id);
    
    logger.info('Project deleted successfully', { projectId });
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Delete project error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Upload project zip file
exports.uploadProjectZip = async (req, res) => {
  const projectId = req.params.projectId;
  logger.info('Uploading project zip file', { projectId, userId: req.user._id });
  
  try {
    const project = Project.findById(projectId);
    
    // Check if project exists
    if (!project) {
      logger.warn('Project not found', { projectId });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check project belongs to user
    if (project.user !== req.user._id) {
      logger.warn('Unauthorized project zip upload attempt', { 
        projectId, 
        projectOwner: project.user,
        requestingUser: req.user._id
      });
      
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload to this project'
      });
    }
    
    // If no file was uploaded
    if (!req.file) {
      logger.warn('No file uploaded', { projectId });
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Delete previous zip if exists
    if (project.zipFilePath) {
      const previousZipPath = path.join(__dirname, '..', project.zipFilePath);
      if (fs.existsSync(previousZipPath)) {
        fs.unlinkSync(previousZipPath);
      }
    }
    
    // Update project with new zip file path
    project.zipFilePath = `/uploads/${req.user._id}/${project._id}/${req.file.filename}`;
    const updatedProject = Project.save(project);
    
    logger.info('Project zip file uploaded successfully', { projectId });
    res.status(200).json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    logger.error('Upload project zip error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Download project zip file
exports.downloadProjectZip = async (req, res) => {
  const projectId = req.params.projectId;
  logger.info('Downloading project zip file', { projectId, userId: req.user._id });
  
  try {
    const project = Project.findById(projectId);
    
    // Check if project exists
    if (!project) {
      logger.warn('Project not found', { projectId });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if project has a zip file
    if (!project.zipFilePath) {
      logger.warn('No zip file found for project', { projectId });
      return res.status(404).json({
        success: false,
        message: 'No zip file found for this project'
      });
    }
    
    // Send the file
    const filePath = path.join(__dirname, '..', project.zipFilePath);
    
    if (fs.existsSync(filePath)) {
      logger.info('Project zip file downloaded successfully', { projectId });
      return res.download(filePath);
    } else {
      logger.warn('File not found', { projectId });
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    logger.error('Download project zip error', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
